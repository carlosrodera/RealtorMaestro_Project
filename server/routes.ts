import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertUserSchema,
  insertProjectSchema,
  insertTransformationSchema,
  insertDescriptionSchema,
  propertyDataSchema
} from "@shared/schema";
import express from "express";
import session from "express-session";
import MemoryStore from "memorystore";
import { z } from "zod";
import { n8nService } from './n8n-service';

// Add userId to the session type
declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

// Create a memory store for sessions
const MemoryStoreSession = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Session setup
  app.use(session({
    secret: process.env.SESSION_SECRET || 'realtor360-secret',
    resave: true,
    saveUninitialized: true,
    store: new MemoryStoreSession({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    cookie: {
      secure: false, // Set to true only in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      sameSite: 'lax'
    }
  }));

  // For debugging session issues
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/auth')) {
      console.log(`Session ID: ${req.session.id}, User ID: ${req.session.userId || 'none'}`);
    }
    next();
  });

  // Authentication middleware
  const authenticateUser = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // User routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);

      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser(userData);

      // Don't return password
      const { password, ...userWithoutPassword } = user;

      req.session.userId = user.id;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const user = await storage.getUserByUsername(username);

      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Don't return password
      const { password: _, ...userWithoutPassword } = user;

      // Set user ID in session and save immediately
      req.session.userId = user.id;
      await new Promise<void>((resolve, reject) => {
        req.session.save(err => {
          if (err) {
            console.error("Session save error:", err);
            reject(err);
          } else {
            console.log(`User ${user.id} successfully logged in, session ID: ${req.session.id}`);
            resolve();
          }
        });
      });

      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Failed to login" });
    }
  });

  app.get('/api/auth/user', async (req, res) => {
    try {
      console.log(`Checking auth status - Session ID: ${req.session.id}, User ID: ${req.session.userId || 'none'}`);

      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(req.session.userId);

      if (!user) {
        console.log(`User ID ${req.session.userId} not found in database`);
        req.session.destroy(() => {
          console.log('Session destroyed due to user not found');
        });
        return res.status(401).json({ message: "User not found" });
      }

      // Don't return password
      const { password, ...userWithoutPassword } = user;
      console.log(`User authenticated: ${user.username} (ID: ${user.id})`);

      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Error getting user:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  // Project routes
  app.get('/api/projects', authenticateUser, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const projects = await storage.getProjectsByUserId(userId);
      res.status(200).json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to get projects" });
    }
  });

  app.get('/api/projects/:id', authenticateUser, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Ensure user owns the project
      if (project.userId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized access to project" });
      }

      res.status(200).json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to get project" });
    }
  });

  app.post('/api/projects', authenticateUser, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const projectData = insertProjectSchema.parse({ ...req.body, userId });

      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.put('/api/projects/:id', authenticateUser, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Ensure user owns the project
      if (project.userId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized access to project" });
      }

      const updatedProject = await storage.updateProject(projectId, req.body);
      res.status(200).json(updatedProject);
    } catch (error) {
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete('/api/projects/:id', authenticateUser, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Ensure user owns the project
      if (project.userId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized access to project" });
      }

      await storage.deleteProject(projectId);
      res.status(200).json({ message: "Project deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Transformation routes
  app.get('/api/transformations', authenticateUser, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const transformations = await storage.getTransformationsByUserId(userId);
      res.status(200).json(transformations);
    } catch (error) {
      res.status(500).json({ message: "Failed to get transformations" });
    }
  });

  app.get('/api/projects/:projectId/transformations', authenticateUser, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Ensure user owns the project
      if (project.userId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized access to project" });
      }

      const transformations = await storage.getTransformationsByProjectId(projectId);
      res.status(200).json(transformations);
    } catch (error) {
      res.status(500).json({ message: "Failed to get transformations" });
    }
  });

  app.get('/api/transformations/:id', authenticateUser, async (req, res) => {
    try {
      const transformationId = parseInt(req.params.id);
      const transformation = await storage.getTransformation(transformationId);

      if (!transformation) {
        return res.status(404).json({ message: "Transformation not found" });
      }

      // Ensure user owns the transformation
      if (transformation.userId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized access to transformation" });
      }

      res.status(200).json(transformation);
    } catch (error) {
      res.status(500).json({ message: "Failed to get transformation" });
    }
  });

  app.post('/api/transformations', authenticateUser, async (req, res) => {
    try {
      const userId = req.session.userId as number;

      // If projectId is provided, verify user has access to the project
      if (req.body.projectId) {
        const projectId = parseInt(req.body.projectId);
        const project = await storage.getProject(projectId);

        if (!project) {
          return res.status(404).json({ message: "Project not found" });
        }

        if (project.userId !== userId) {
          return res.status(403).json({ message: "Unauthorized access to project" });
        }
      }

      const transformationData = insertTransformationSchema.parse({ ...req.body, userId });

      // Create transformation
      const transformation = await storage.createTransformation(transformationData);

      // Use real n8n service or fallback to mock mode
      try {
        console.log(`Sending image transformation request to n8n service`);

        // Process the transformation via n8n service
        // Procesar la transformación inmediatamente sin setTimeout
        try {
          // Extraer la imagen base64 de la URL de datos
          let imageBase64 = '';

          // Verificar si la imagen es una URL de datos (data URL)
          if (transformationData.originalImagePath.startsWith('data:image')) {
            // Extraer la parte base64 de la URL de datos
            imageBase64 = transformationData.originalImagePath.split(',')[1];
            console.log("Extracted base64 image data from data URL");

            // Verificar que tenemos datos de imagen válidos
            if (!imageBase64 || imageBase64.length < 100) {
              console.error("Invalid or too short base64 image data");
              throw new Error("Invalid image data");
            }

            console.log(`Base64 image data length: ${imageBase64.length} characters`);

            // Verificar que la imagen no está corrupta
            try {
              const buffer = Buffer.from(imageBase64, 'base64');
              console.log(`Decoded image buffer size: ${buffer.length} bytes`);
            } catch (error) {
              console.error("Error decoding base64 image:", error);
              throw new Error("Invalid base64 image data");
            }
          } else {
            console.log("Image is not a data URL, using as is");
            imageBase64 = transformationData.originalImagePath;
          }

          // Enviar la imagen completa al servicio n8n con el ID de transformación
          const result = await n8nService.requestImageTransformation({
            originalImage: imageBase64, // Enviar la imagen completa en base64
            style: transformationData.style,
            customPrompt: transformationData.customPrompt,
            transformationId: transformation.id.toString() // Incluir el ID para el webhook
          });

          console.log("N8n transformation request sent, waiting for webhook callback");

          // No actualizar el estado a 'completed' aquí
          // Dejar como 'processing' para que el cliente siga consultando
          // El webhook actualizará el estado cuando la imagen esté lista

          // IMPORTANTE: NUNCA actualizamos el estado a "completed" aquí
          // La transformación SIEMPRE permanece en estado "processing" hasta que el webhook la actualice
          console.log(`Transformation ${transformation.id} will remain in 'processing' state until webhook arrives`);
          console.log(`Webhook URL: ${process.env.WEBHOOK_URL || 'https://agenteia.top/webhook-test/transform-image'}`);
          console.log(`Transformation will wait indefinitely (up to 5 minutes) for webhook callback`);

          // Registrar la hora de inicio para referencia
          await storage.updateTransformation(transformation.id, {
            processingStartedAt: new Date().toISOString(),
            expectedCompletionAt: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutos en el futuro
          });

          // Solo en modo de desarrollo/prueba, simulamos el webhook después de un tiempo largo
          // pero SOLO si está habilitado explícitamente
          if (process.env.ENABLE_MOCK_WEBHOOK === 'true' && process.env.NODE_ENV === 'development' && result.mockServiceUsed) {
            const mockDelay = 120000; // 2 minutos para simular un procesamiento real
            console.log(`DEVELOPMENT MODE: Will simulate webhook callback after ${mockDelay/1000} seconds IF no real webhook arrives`);

            // Simular un retraso largo para la transformación
            setTimeout(async () => {
              // Verificar si la transformación ya fue actualizada por un webhook real
              const currentTransformation = await storage.getTransformation(transformation.id);
              if (currentTransformation.status !== "processing") {
                console.log(`Transformation ${transformation.id} already completed or failed, skipping simulation`);
                return;
              }

              console.log(`No real webhook received after ${mockDelay/1000} seconds, simulating webhook callback`);

              // Usar una imagen de muestra según el estilo
              let mockImagePath = '/sample/transformed-image.jpg';
              if (transformationData.style === 'modern') {
                mockImagePath = '/sample/modern-transformation.jpg';
              } else if (transformationData.style === 'luxury') {
                mockImagePath = '/sample/luxury-transformation.jpg';
              } else if (transformationData.style === 'minimalist') {
                mockImagePath = '/sample/minimalist-transformation.jpg';
              }

              // En modo simulado, actualizar como si fuera un webhook real
              await storage.updateTransformation(transformation.id, {
                status: "completed",
                transformedImagePath: mockImagePath,
                processingTimeMs: mockDelay,
                aiProviderUsed: "Stable Diffusion XL (Simulado)",
                completedAt: new Date().toISOString()
              });

              console.log(`Simulated webhook completed for transformation ${transformation.id} after ${mockDelay/1000} seconds`);
            }, mockDelay);
          }
        } catch (processError) {
          console.error("Error processing transformation:", processError);

          // Actualizar la transformación con el error
          await storage.updateTransformation(transformation.id, {
            status: "error",
            errorMessage: processError.message || "Unknown error during transformation processing",
            completedAt: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error("Initial n8n service error:", error);
      }

      res.status(201).json(transformation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid transformation data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create transformation" });
    }
  });

  app.put('/api/transformations/:id', authenticateUser, async (req, res) => {
    try {
      const transformationId = parseInt(req.params.id);
      const transformation = await storage.getTransformation(transformationId);

      if (!transformation) {
        return res.status(404).json({ message: "Transformation not found" });
      }

      // Ensure user owns the transformation
      if (transformation.userId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized access to transformation" });
      }

      const updatedTransformation = await storage.updateTransformation(transformationId, req.body);
      res.status(200).json(updatedTransformation);
    } catch (error) {
      res.status(500).json({ message: "Failed to update transformation" });
    }
  });

  app.delete('/api/transformations/:id', authenticateUser, async (req, res) => {
    try {
      const transformationId = parseInt(req.params.id);
      const transformation = await storage.getTransformation(transformationId);

      if (!transformation) {
        return res.status(404).json({ message: "Transformation not found" });
      }

      // Ensure user owns the transformation
      if (transformation.userId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized access to transformation" });
      }

      await storage.deleteTransformation(transformationId);
      res.status(200).json({ message: "Transformation deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete transformation" });
    }
  });

  // Description routes
  app.get('/api/descriptions', authenticateUser, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const descriptions = await storage.getDescriptionsByUserId(userId);
      res.status(200).json(descriptions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get descriptions" });
    }
  });

  app.get('/api/projects/:projectId/descriptions', authenticateUser, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Ensure user owns the project
      if (project.userId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized access to project" });
      }

      const descriptions = await storage.getDescriptionsByProjectId(projectId);
      res.status(200).json(descriptions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get descriptions" });
    }
  });

  app.get('/api/descriptions/:id', authenticateUser, async (req, res) => {
    try {
      const descriptionId = parseInt(req.params.id);
      const description = await storage.getDescription(descriptionId);

      if (!description) {
        return res.status(404).json({ message: "Description not found" });
      }

      // Ensure user owns the description
      if (description.userId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized access to description" });
      }

      res.status(200).json(description);
    } catch (error) {
      res.status(500).json({ message: "Failed to get description" });
    }
  });

  app.post('/api/descriptions', authenticateUser, async (req, res) => {
    try {
      const userId = req.session.userId as number;

      // If projectId is provided, verify user has access to the project
      if (req.body.projectId) {
        const projectId = parseInt(req.body.projectId);
        const project = await storage.getProject(projectId);

        if (!project) {
          return res.status(404).json({ message: "Project not found" });
        }

        if (project.userId !== userId) {
          return res.status(403).json({ message: "Unauthorized access to project" });
        }
      }

      // Validate property data
      if (req.body.propertyData) {
        propertyDataSchema.parse(req.body.propertyData);
      }

      const descriptionData = insertDescriptionSchema.parse({ ...req.body, userId });

      // Create description
      const description = await storage.createDescription(descriptionData);

      // Mock n8n integration for description generation
      console.log(`[n8n-mock] Sending description generation request to n8n workflow`);
      console.log(`[n8n-mock] Property type: ${descriptionData.propertyData.propertyType}`);
      console.log(`[n8n-mock] Zone: ${descriptionData.propertyData.zone}`);
      console.log(`[n8n-mock] Tone: ${descriptionData.tone}`);
      console.log(`[n8n-mock] Length: ${descriptionData.lengthOption}`);
      console.log(`[n8n-mock] Language: ${descriptionData.language}`);

      if (descriptionData.sourceImagePaths && descriptionData.sourceImagePaths.length > 0) {
        console.log(`[n8n-mock] Images included: ${descriptionData.sourceImagePaths.length}`);
      } else {
        console.log(`[n8n-mock] No images included in the request`);
      }

      // Generate a more relevant description based on the property data
      setTimeout(async () => {
        console.log(`[n8n-mock] Received generated description from n8n workflow`);

        const propertyData = descriptionData.propertyData;
        let generatedText = "";
        const isProfessional = descriptionData.tone === 'professional';
        const isSpanish = descriptionData.language === 'es';
        const isLong = descriptionData.lengthOption === 'long';

        // Create a more tailored description based on property type and data
        if (propertyData.propertyType === 'apartment') {
          if (isSpanish) {
            generatedText = `Descubra este exclusivo ${propertyData.features?.penthouse ? 'ático' : 'piso'} ${propertyData.features?.renovated ? 'completamente reformado' : ''} en ${propertyData.zone}, ${isProfessional ? 'una de las zonas más cotizadas de la ciudad' : 'un lugar perfecto para vivir'}. Con ${propertyData.area} m² distribuidos en ${propertyData.bedrooms} ${parseInt(propertyData.bedrooms || "0") > 1 ? 'amplios dormitorios' : 'dormitorio'} y ${propertyData.bathrooms} ${parseInt(propertyData.bathrooms || "0") > 1 ? 'baños completos' : 'baño completo'}, esta propiedad ${isProfessional ? 'combina a la perfección funcionalidad y diseño' : 'es acogedora y confortable'}.\n\n`;

            generatedText += `El salón principal ${propertyData.features?.bright ? 'está bañado de luz natural' : 'es acogedor'} ${propertyData.features?.terrace ? 'con salida directa a una amplia terraza' : ''}. La cocina ${propertyData.features?.renovated ? 'ha sido completamente renovada y' : ''} está totalmente equipada con electrodomésticos ${isProfessional ? 'de alta gama' : 'modernos'}.\n\n`;

            if (isLong) {
              generatedText += `El dormitorio principal es espacioso y luminoso ${propertyData.features?.wardrobe ? 'con armarios empotrados' : ''}. ${propertyData.features?.parking ? 'La propiedad incluye plaza de garaje, un valor añadido en esta zona.' : ''} A escasos minutos a pie encontrará todos los servicios necesarios, incluyendo transporte público, comercios y restaurantes.`;
            }
          } else {
            // English description
            generatedText = `Discover this exclusive ${propertyData.features?.penthouse ? 'penthouse' : 'apartment'} ${propertyData.features?.renovated ? 'completely renovated' : ''} in ${propertyData.zone}, ${isProfessional ? 'one of the most sought-after areas in the city' : 'a perfect place to live'}. With ${propertyData.area} m² distributed in ${propertyData.bedrooms} ${parseInt(propertyData.bedrooms || "0") > 1 ? 'spacious bedrooms' : 'bedroom'} and ${propertyData.bathrooms} ${parseInt(propertyData.bathrooms || "0") > 1 ? 'complete bathrooms' : 'complete bathroom'}, this property ${isProfessional ? 'perfectly combines functionality and design' : 'is cozy and comfortable'}.\n\n`;

            generatedText += `The main living room ${propertyData.features?.bright ? 'is bathed in natural light' : 'is cozy'} ${propertyData.features?.terrace ? 'with direct access to a spacious terrace' : ''}. The kitchen ${propertyData.features?.renovated ? 'has been completely renovated and' : ''} is fully equipped with ${isProfessional ? 'high-end' : 'modern'} appliances.\n\n`;

            if (isLong) {
              generatedText += `The main bedroom is spacious and bright ${propertyData.features?.wardrobe ? 'with built-in wardrobes' : ''}. ${propertyData.features?.parking ? 'The property includes a parking space, an added value in this area.' : ''} Within walking distance, you'll find all necessary services, including public transportation, shops, and restaurants.`;
            }
          }
        } else if (propertyData.propertyType === 'house' || propertyData.propertyType === 'villa') {
          if (isSpanish) {
            generatedText = `Impresionante ${propertyData.propertyType === 'villa' ? 'villa' : 'casa'} ${propertyData.features?.renovated ? 'totalmente reformada' : ''} situada en ${propertyData.zone}. Esta magnífica propiedad de ${propertyData.area} m² cuenta con ${propertyData.bedrooms} ${parseInt(propertyData.bedrooms || "0") > 1 ? 'dormitorios' : 'dormitorio'} y ${propertyData.bathrooms} ${parseInt(propertyData.bathrooms || "0") > 1 ? 'baños' : 'baño'}, distribuidos en ${isProfessional ? 'un diseño que maximiza el espacio y la luminosidad' : 'un espacio acogedor para toda la familia'}.\n\n`;

            generatedText += `${propertyData.features?.garden ? 'Dispone de un espléndido jardín privado ideal para disfrutar del aire libre' : ''} ${propertyData.features?.pool ? 'y piscina propia para los meses de verano' : ''}. El interior destaca por sus amplios espacios, ${propertyData.features?.renovated ? 'acabados de alta calidad' : 'características tradicionales'} y abundante luz natural.\n\n`;

            if (isLong) {
              generatedText += `La cocina ${propertyData.features?.renovated ? 'moderna' : ''} está equipada con todo lo necesario para ${isProfessional ? 'los más exigentes chefs' : 'el día a día'}. ${propertyData.features?.parking ? 'Cuenta con amplio garaje para varios vehículos.' : ''} Esta propiedad representa una oportunidad única para vivir en una de las zonas más exclusivas, combinando tranquilidad con proximidad a todos los servicios.`;
            }
          } else {
            // English description
            generatedText = `Impressive ${propertyData.propertyType === 'villa' ? 'villa' : 'house'} ${propertyData.features?.renovated ? 'completely renovated' : ''} located in ${propertyData.zone}. This magnificent property of ${propertyData.area} m² has ${propertyData.bedrooms} ${parseInt(propertyData.bedrooms || "0") > 1 ? 'bedrooms' : 'bedroom'} and ${propertyData.bathrooms} ${parseInt(propertyData.bathrooms || "0") > 1 ? 'bathrooms' : 'bathroom'}, distributed in ${isProfessional ? 'a design that maximizes space and brightness' : 'a cozy space for the whole family'}.\n\n`;

            generatedText += `${propertyData.features?.garden ? 'It has a splendid private garden ideal for enjoying the outdoors' : ''} ${propertyData.features?.pool ? 'and a private pool for the summer months' : ''}. The interior stands out for its ample spaces, ${propertyData.features?.renovated ? 'high-quality finishes' : 'traditional features'} and abundant natural light.\n\n`;

            if (isLong) {
              generatedText += `The ${propertyData.features?.renovated ? 'modern' : ''} kitchen is equipped with everything necessary for ${isProfessional ? 'the most demanding chefs' : 'daily life'}. ${propertyData.features?.parking ? 'It has a spacious garage for several vehicles.' : ''} This property represents a unique opportunity to live in one of the most exclusive areas, combining tranquility with proximity to all services.`;
            }
          }
        }

        await storage.updateDescription(description.id, {
          status: "completed",
          generatedText: generatedText,
          processingTimeMs: Math.floor(Math.random() * 2000) + 2000, // Random time between 2-4 seconds
          aiProviderUsed: "GPT-4o",
        });
      }, 4000);

      res.status(201).json(description);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid description data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create description" });
    }
  });

  app.put('/api/descriptions/:id', authenticateUser, async (req, res) => {
    try {
      const descriptionId = parseInt(req.params.id);
      const description = await storage.getDescription(descriptionId);

      if (!description) {
        return res.status(404).json({ message: "Description not found" });
      }

      // Ensure user owns the description
      if (description.userId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized access to description" });
      }

      const updatedDescription = await storage.updateDescription(descriptionId, req.body);
      res.status(200).json(updatedDescription);
    } catch (error) {
      res.status(500).json({ message: "Failed to update description" });
    }
  });

  app.delete('/api/descriptions/:id', authenticateUser, async (req, res) => {
    try {
      const descriptionId = parseInt(req.params.id);
      const description = await storage.getDescription(descriptionId);

      if (!description) {
        return res.status(404).json({ message: "Description not found" });
      }

      // Ensure user owns the description
      if (description.userId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized access to description" });
      }

      await storage.deleteDescription(descriptionId);
      res.status(200).json({ message: "Description deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete description" });
    }
  });

  // Webhook endpoint for n8n to send transformation results
  app.post('/api/webhooks/transformation-callback', async (req, res) => {
    try {
      // Log the entire request body for debugging
      console.log('🔔 WEBHOOK RECEIVED at', new Date().toISOString());
      console.log('Webhook data:', JSON.stringify(req.body));

      // Extraer datos del webhook - soportar múltiples formatos posibles
      let transformationId, transformedImageUrl;

      // Formato 1: { transformationId, transformedImageUrl }
      if (req.body.transformationId && req.body.transformedImageUrl) {
        transformationId = req.body.transformationId;
        transformedImageUrl = req.body.transformedImageUrl;
      }
      // Formato 2: { id, url }
      else if (req.body.id && req.body.url) {
        transformationId = req.body.id;
        transformedImageUrl = req.body.url;
      }
      // Formato 3: { data: { transformationId, transformedImageUrl } }
      else if (req.body.data && req.body.data.transformationId && req.body.data.transformedImageUrl) {
        transformationId = req.body.data.transformationId;
        transformedImageUrl = req.body.data.transformedImageUrl;
      }
      // Formato 4: { data: { id, url } }
      else if (req.body.data && req.body.data.id && req.body.data.url) {
        transformationId = req.body.data.id;
        transformedImageUrl = req.body.data.url;
      }

      if (!transformationId || !transformedImageUrl) {
        console.error('❌ WEBHOOK ERROR: Missing required fields:', req.body);
        return res.status(400).json({
          error: 'Missing required fields',
          message: 'The webhook must include transformationId and transformedImageUrl',
          receivedData: req.body
        });
      }

      console.log(`✅ WEBHOOK SUCCESS: Received for transformation ${transformationId}`);
      console.log(`Image URL: ${transformedImageUrl}`);

      // Convertir ID a número si es string
      const transformationIdNum = parseInt(transformationId);

      // Update the transformation with the result
      const transformation = await storage.getTransformation(transformationIdNum);

      if (!transformation) {
        console.error(`❌ WEBHOOK ERROR: Transformation not found: ${transformationId}`);
        return res.status(404).json({
          error: 'Transformation not found',
          message: `No transformation found with ID ${transformationId}`,
          receivedId: transformationId
        });
      }

      // Calcular tiempo de procesamiento
      let processingTimeMs = 0;
      if (transformation.processingStartedAt) {
        const startTime = new Date(transformation.processingStartedAt).getTime();
        processingTimeMs = Date.now() - startTime;
      }

      // Actualizar la transformación con la URL de la imagen
      await storage.updateTransformation(transformation.id, {
        status: 'completed',
        transformedImagePath: transformedImageUrl,
        completedAt: new Date().toISOString(),
        processingTimeMs: processingTimeMs || undefined,
        webhookReceivedAt: new Date().toISOString()
      });

      console.log(`✅ TRANSFORMATION COMPLETED: ID ${transformationId} updated with image URL`);
      console.log(`Processing time: ${processingTimeMs ? (processingTimeMs/1000).toFixed(1) + 's' : 'unknown'}`);

      // Responder inmediatamente al webhook para no bloquear n8n
      return res.status(200).json({
        success: true,
        message: `Transformation ${transformationId} successfully updated`,
        processingTime: processingTimeMs ? `${(processingTimeMs/1000).toFixed(1)}s` : 'unknown'
      });
    } catch (error) {
      console.error('❌ WEBHOOK ERROR: Error processing transformation callback:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: error.message || 'Unknown error processing webhook'
      });
    }
  });

  // Endpoint para simular la recepción de un webhook (para pruebas en localhost)
  app.get('/api/simulate-webhook/:transformationId', async (req, res) => {
    try {
      const transformationId = parseInt(req.params.transformationId);

      if (isNaN(transformationId)) {
        return res.status(400).json({ error: 'Invalid transformation ID' });
      }

      // Obtener la transformación
      const transformation = await storage.getTransformation(transformationId);

      if (!transformation) {
        return res.status(404).json({ error: 'Transformation not found' });
      }

      // Simular un retraso de procesamiento (2 segundos)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Actualizar la transformación como si hubiera recibido un webhook
      // Usar la URL de Google Drive proporcionada
      const transformedImagePath = 'https://drive.google.com/uc?id=1q8Jvf1Ra5n8lHx4vg_mEIxzezy7Ocxqg&export=download';

      await storage.updateTransformation(transformationId, {
        status: 'completed',
        transformedImagePath
      });

      console.log(`Simulación de webhook completada para transformación ${transformationId}`);

      return res.status(200).json({
        success: true,
        message: 'Webhook simulation completed',
        transformationId,
        transformedImagePath
      });
    } catch (error) {
      console.error('Error simulating webhook:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
