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

// Create a memory store for sessions
const MemoryStoreSession = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Session setup
  app.use(session({
    secret: process.env.SESSION_SECRET || 'realtor360-secret',
    resave: false,
    saveUninitialized: false,
    store: new MemoryStoreSession({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

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
      
      req.session.userId = user.id;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to login" });
    }
  });

  app.get('/api/auth/user', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(req.session.userId);
      
      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ message: "User not found" });
      }
      
      // Don't return password
      const { password, ...userWithoutPassword } = user;
      
      res.status(200).json(userWithoutPassword);
    } catch (error) {
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
      
      // In a real implementation, we would send the transformation to the AI service
      // For now, we simulate a successful transformation after a delay
      setTimeout(async () => {
        await storage.updateTransformation(transformation.id, {
          status: "completed",
          transformedImagePath: "/sample/transformed-image.jpg",
          processingTimeMs: 2500,
          aiProviderUsed: "sample-ai-provider",
        });
      }, 2500);
      
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
      
      // In a real implementation, we would send the description request to the AI service
      // For now, we simulate a successful description generation after a delay
      setTimeout(async () => {
        await storage.updateDescription(description.id, {
          status: "completed",
          generatedText: "Descubra este exclusivo piso completamente reformado en el corazón de Malasaña, uno de los barrios más vibrantes y con más personalidad de Madrid. Con 85 m² distribuidos en 2 amplios dormitorios y 2 baños completos, esta propiedad combina a la perfección el encanto del Madrid tradicional con toques contemporáneos.\n\nEl salón principal, bañado de luz natural gracias a sus ventanales orientados al este, cuenta con suelos de madera natural y una moderna chimenea que añade un toque acogedor. La cocina, totalmente equipada con electrodomésticos de alta gama, presenta un diseño minimalista con acabados en blanco y una práctica isla central, perfecta para los amantes de la gastronomía.\n\nEl dormitorio principal es un verdadero remanso de paz con su vestidor integrado y baño en suite con ducha efecto lluvia. A escasos minutos a pie encontrará todos los servicios, incluyendo el Metro de Tribunal, innumerables comercios, restaurantes de moda y la emblemática Gran Vía.",
          processingTimeMs: 1800,
          aiProviderUsed: "sample-ai-provider",
        });
      }, 1800);
      
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
