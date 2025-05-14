import { 
  users, type User, type InsertUser,
  projects, type Project, type InsertProject,
  transformations, type Transformation, type InsertTransformation,
  descriptions, type Description, type InsertDescription
} from "@shared/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, and, desc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Project operations
  getProject(id: number): Promise<Project | undefined>;
  getProjectsByUserId(userId: number): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  
  // Transformation operations
  getTransformation(id: number): Promise<Transformation | undefined>;
  getTransformationsByProjectId(projectId: number): Promise<Transformation[]>;
  getTransformationsByUserId(userId: number): Promise<Transformation[]>;
  createTransformation(transformation: InsertTransformation): Promise<Transformation>;
  updateTransformation(id: number, transformation: Partial<Transformation>): Promise<Transformation | undefined>;
  deleteTransformation(id: number): Promise<boolean>;
  
  // Description operations
  getDescription(id: number): Promise<Description | undefined>;
  getDescriptionsByProjectId(projectId: number): Promise<Description[]>;
  getDescriptionsByUserId(userId: number): Promise<Description[]>;
  createDescription(description: InsertDescription): Promise<Description>;
  updateDescription(id: number, description: Partial<Description>): Promise<Description | undefined>;
  deleteDescription(id: number): Promise<boolean>;
}

export class PostgresStorage implements IStorage {
  private memStorage: MemStorage;

  constructor() {
    // For now, we'll use memory storage until we can fix database connection
    console.warn("⚠️ Using memory storage instead of PostgreSQL database");
    this.memStorage = new MemStorage();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.memStorage.getUser(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.memStorage.getUserByUsername(username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    return this.memStorage.createUser(insertUser);
  }

  // Project methods
  async getProject(id: number): Promise<Project | undefined> {
    return this.memStorage.getProject(id);
  }

  async getProjectsByUserId(userId: number): Promise<Project[]> {
    return this.memStorage.getProjectsByUserId(userId);
  }

  async createProject(project: InsertProject): Promise<Project> {
    return this.memStorage.createProject(project);
  }

  async updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined> {
    return this.memStorage.updateProject(id, updates);
  }

  async deleteProject(id: number): Promise<boolean> {
    return this.memStorage.deleteProject(id);
  }

  // Transformation methods
  async getTransformation(id: number): Promise<Transformation | undefined> {
    return this.memStorage.getTransformation(id);
  }

  async getTransformationsByProjectId(projectId: number): Promise<Transformation[]> {
    return this.memStorage.getTransformationsByProjectId(projectId);
  }

  async getTransformationsByUserId(userId: number): Promise<Transformation[]> {
    return this.memStorage.getTransformationsByUserId(userId);
  }

  async createTransformation(transformation: InsertTransformation): Promise<Transformation> {
    return this.memStorage.createTransformation(transformation);
  }

  async updateTransformation(id: number, updates: Partial<Transformation>): Promise<Transformation | undefined> {
    return this.memStorage.updateTransformation(id, updates);
  }

  async deleteTransformation(id: number): Promise<boolean> {
    return this.memStorage.deleteTransformation(id);
  }

  // Description methods
  async getDescription(id: number): Promise<Description | undefined> {
    return this.memStorage.getDescription(id);
  }

  async getDescriptionsByProjectId(projectId: number): Promise<Description[]> {
    return this.memStorage.getDescriptionsByProjectId(projectId);
  }

  async getDescriptionsByUserId(userId: number): Promise<Description[]> {
    return this.memStorage.getDescriptionsByUserId(userId);
  }

  async createDescription(description: InsertDescription): Promise<Description> {
    return this.memStorage.createDescription(description);
  }

  async updateDescription(id: number, updates: Partial<Description>): Promise<Description | undefined> {
    return this.memStorage.updateDescription(id, updates);
  }

  async deleteDescription(id: number): Promise<boolean> {
    return this.memStorage.deleteDescription(id);
  }
}

class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private transformations: Map<number, Transformation>;
  private descriptions: Map<number, Description>;
  
  private userIdCounter: number;
  private projectIdCounter: number;
  private transformationIdCounter: number;
  private descriptionIdCounter: number;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.transformations = new Map();
    this.descriptions = new Map();
    
    this.userIdCounter = 1;
    this.projectIdCounter = 1;
    this.transformationIdCounter = 1;
    this.descriptionIdCounter = 1;
    
    // Initialize with demo user account
    this.createUser({
      username: "demo",
      password: "demo123",
      email: "demo@realtor360.com",
      fullName: "María García",
      company: "InmoTech Realty"
    }).then(user => {
      // Create sample projects for the demo user
      this.createProject({
        userId: user.id,
        name: "Ático en Malasaña",
        description: "Ático de lujo con terraza en el centro de Madrid"
      }).then(project => {
        // Add sample transformation for the project
        this.createTransformation({
          userId: user.id,
          projectId: project.id,
          originalImagePath: "/sample/sample-apartment.jpg",
          style: "modern",
          name: "Salón principal - Estilo moderno",
          customPrompt: "Moderniza el salón con estilo nórdico minimalista",
          status: "completed",
          transformedImagePath: "/sample/sample-apartment-transformed.jpg"
        });
        
        // Add sample description for the project
        this.createDescription({
          userId: user.id,
          projectId: project.id,
          propertyData: {
            propertyType: "apartment",
            price: "450000",
            area: "85",
            bedrooms: "2",
            bathrooms: "2",
            zone: "Malasaña, Madrid",
            yearBuilt: "1980",
            features: {"renovated": true, "elevator": true, "terrace": true, "airConditioning": true},
            notes: "Completamente reformado en 2022"
          },
          name: "Descripción principal - Ático Malasaña",
          tone: "professional",
          lengthOption: "medium",
          language: "es",
          status: "completed",
          generatedText: "Descubra este exclusivo ático completamente reformado en el corazón de Malasaña, uno de los barrios más vibrantes y con más personalidad de Madrid. Con 85 m² distribuidos en 2 amplios dormitorios y 2 baños completos, esta propiedad combina a la perfección el encanto del Madrid tradicional con toques contemporáneos.\n\nEl salón principal, bañado de luz natural gracias a sus ventanales orientados al este, cuenta con suelos de madera natural y salida directa a una terraza privada de 15m². La cocina, totalmente equipada con electrodomésticos de alta gama, presenta un diseño minimalista con acabados en blanco y una práctica isla central.\n\nEl dormitorio principal es un verdadero remanso de paz con su vestidor integrado y baño en suite con ducha efecto lluvia. A escasos minutos a pie encontrará todos los servicios, incluyendo el Metro de Tribunal, innumerables comercios, restaurantes de moda y la emblemática Gran Vía."
        });
      });
      
      // Create another sample project
      this.createProject({
        userId: user.id,
        name: "Villa en La Moraleja",
        description: "Villa exclusiva con piscina y jardín en La Moraleja"
      });
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      id, 
      username: insertUser.username,
      password: insertUser.password,
      email: insertUser.email,
      fullName: insertUser.fullName || null,
      company: insertUser.company || null,
      plan: "free", 
      avatarUrl: null,
      createdAt: now, 
      updatedAt: now 
    };
    this.users.set(id, user);
    return user;
  }

  // Project methods
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjectsByUserId(userId: number): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      (project) => project.userId === userId
    );
  }

  async createProject(project: InsertProject): Promise<Project> {
    const id = this.projectIdCounter++;
    const now = new Date();
    const newProject: Project = { 
      ...project, 
      id, 
      description: project.description || null,
      createdAt: now, 
      updatedAt: now 
    };
    this.projects.set(id, newProject);
    return newProject;
  }

  async updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;

    const updatedProject = { 
      ...project, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }

  // Transformation methods
  async getTransformation(id: number): Promise<Transformation | undefined> {
    return this.transformations.get(id);
  }

  async getTransformationsByProjectId(projectId: number): Promise<Transformation[]> {
    return Array.from(this.transformations.values()).filter(
      (transformation) => transformation.projectId === projectId
    );
  }

  async getTransformationsByUserId(userId: number): Promise<Transformation[]> {
    return Array.from(this.transformations.values()).filter(
      (transformation) => transformation.userId === userId
    );
  }

  async createTransformation(transformation: InsertTransformation): Promise<Transformation> {
    const id = this.transformationIdCounter++;
    const now = new Date();
    const newTransformation: Transformation = {
      id,
      userId: transformation.userId,
      projectId: transformation.projectId || null,
      originalImagePath: transformation.originalImagePath,
      style: transformation.style,
      customPrompt: transformation.customPrompt || null,
      annotations: transformation.annotations || null,
      name: transformation.name || null,
      transformedImagePath: null,
      aiProviderUsed: null,
      processingTimeMs: null,
      status: "pending",
      errorMessage: null,
      createdAt: now,
      updatedAt: now
    };
    this.transformations.set(id, newTransformation);
    return newTransformation;
  }

  async updateTransformation(id: number, updates: Partial<Transformation>): Promise<Transformation | undefined> {
    const transformation = this.transformations.get(id);
    if (!transformation) return undefined;

    const updatedTransformation = {
      ...transformation,
      ...updates,
      updatedAt: new Date()
    };
    this.transformations.set(id, updatedTransformation);
    return updatedTransformation;
  }

  async deleteTransformation(id: number): Promise<boolean> {
    return this.transformations.delete(id);
  }

  // Description methods
  async getDescription(id: number): Promise<Description | undefined> {
    return this.descriptions.get(id);
  }

  async getDescriptionsByProjectId(projectId: number): Promise<Description[]> {
    return Array.from(this.descriptions.values()).filter(
      (description) => description.projectId === projectId
    );
  }

  async getDescriptionsByUserId(userId: number): Promise<Description[]> {
    return Array.from(this.descriptions.values()).filter(
      (description) => description.userId === userId
    );
  }

  async createDescription(description: InsertDescription): Promise<Description> {
    const id = this.descriptionIdCounter++;
    const now = new Date();
    const newDescription: Description = {
      id,
      userId: description.userId,
      projectId: description.projectId || null,
      propertyData: description.propertyData,
      sourceImagePaths: description.sourceImagePaths || null,
      tone: description.tone,
      lengthOption: description.lengthOption,
      language: description.language || "es",
      name: description.name || null,
      generatedText: null,
      aiProviderUsed: null,
      processingTimeMs: null,
      status: "pending",
      errorMessage: null,
      createdAt: now,
      updatedAt: now
    };
    this.descriptions.set(id, newDescription);
    return newDescription;
  }

  async updateDescription(id: number, updates: Partial<Description>): Promise<Description | undefined> {
    const description = this.descriptions.get(id);
    if (!description) return undefined;

    const updatedDescription = {
      ...description,
      ...updates,
      updatedAt: new Date()
    };
    this.descriptions.set(id, updatedDescription);
    return updatedDescription;
  }

  async deleteDescription(id: number): Promise<boolean> {
    return this.descriptions.delete(id);
  }
}

// Choose the storage implementation based on environment
let usePostgres = false;

// Try to check database connection
try {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (DATABASE_URL) {
    // Just testing if we can parse the URL
    const url = new URL(DATABASE_URL);
    usePostgres = true;
    console.log("Database URL found, will try to use PostgreSQL storage");
  } else {
    console.log("No DATABASE_URL found, using in-memory storage");
  }
} catch (error) {
  console.error("Invalid DATABASE_URL, using in-memory storage:", error);
}

export const storage = usePostgres ? new PostgresStorage() : new MemStorage();
