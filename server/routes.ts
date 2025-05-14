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
      
      // Mock n8n integration: In a real implementation, we would send a webhook to n8n
      console.log(`[n8n-mock] Sending image transformation request to n8n workflow`);
      console.log(`[n8n-mock] Original image: ${transformationData.originalImagePath}`);
      console.log(`[n8n-mock] Style: ${transformationData.style}`);
      console.log(`[n8n-mock] Custom prompt: ${transformationData.customPrompt || 'No custom prompt'}`);
      
      // Simulate the n8n processing delay and response
      setTimeout(async () => {
        console.log(`[n8n-mock] Received transformed image from n8n workflow`);
        
        // Prepare a realistic transformed image path
        let transformedImagePath = '/sample/transformed-image.jpg';
        
        // If we have a style, use a more specific sample image
        if (transformationData.style === 'modern') {
          transformedImagePath = '/sample/modern-transformation.jpg';
        } else if (transformationData.style === 'luxury') {
          transformedImagePath = '/sample/luxury-transformation.jpg';
        } else if (transformationData.style === 'minimalist') {
          transformedImagePath = '/sample/minimalist-transformation.jpg';
        }
        
        await storage.updateTransformation(transformation.id, {
          status: "completed",
          transformedImagePath: transformedImagePath,
          processingTimeMs: Math.floor(Math.random() * 1000) + 2000, // Random time between 2-3 seconds
          aiProviderUsed: "Stable Diffusion XL",
        });
      }, 3000);
      
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

  const httpServer = createServer(app);
  return httpServer;
}
