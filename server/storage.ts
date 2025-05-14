import { 
  users, type User, type InsertUser,
  projects, type Project, type InsertProject,
  transformations, type Transformation, type InsertTransformation,
  descriptions, type Description, type InsertDescription
} from "@shared/schema";
import { drizzle } from "drizzle-orm/neon-serverless";
import { neon } from "@neondatabase/serverless";
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
  private db;

  constructor() {
    try {
      const sql = neon(process.env.DATABASE_URL!);
      this.db = drizzle(sql);
    } catch (error) {
      console.error("Error connecting to Postgres database:", error);
      throw new Error("Unable to connect to the database. Please check your DATABASE_URL.");
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values({
      ...insertUser,
      plan: "free",
    }).returning();
    return result[0];
  }

  // Project methods
  async getProject(id: number): Promise<Project | undefined> {
    const result = await this.db.select().from(projects).where(eq(projects.id, id));
    return result[0];
  }

  async getProjectsByUserId(userId: number): Promise<Project[]> {
    return await this.db.select().from(projects).where(eq(projects.userId, userId)).orderBy(desc(projects.createdAt));
  }

  async createProject(project: InsertProject): Promise<Project> {
    const result = await this.db.insert(projects).values(project).returning();
    return result[0];
  }

  async updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined> {
    const result = await this.db.update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return result[0];
  }

  async deleteProject(id: number): Promise<boolean> {
    const result = await this.db.delete(projects).where(eq(projects.id, id)).returning();
    return result.length > 0;
  }

  // Transformation methods
  async getTransformation(id: number): Promise<Transformation | undefined> {
    const result = await this.db.select().from(transformations).where(eq(transformations.id, id));
    return result[0];
  }

  async getTransformationsByProjectId(projectId: number): Promise<Transformation[]> {
    return await this.db.select().from(transformations)
      .where(eq(transformations.projectId, projectId))
      .orderBy(desc(transformations.createdAt));
  }

  async getTransformationsByUserId(userId: number): Promise<Transformation[]> {
    return await this.db.select().from(transformations)
      .where(eq(transformations.userId, userId))
      .orderBy(desc(transformations.createdAt));
  }

  async createTransformation(transformation: InsertTransformation): Promise<Transformation> {
    const result = await this.db.insert(transformations).values({
      ...transformation,
      status: "pending",
    }).returning();
    return result[0];
  }

  async updateTransformation(id: number, updates: Partial<Transformation>): Promise<Transformation | undefined> {
    const result = await this.db.update(transformations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(transformations.id, id))
      .returning();
    return result[0];
  }

  async deleteTransformation(id: number): Promise<boolean> {
    const result = await this.db.delete(transformations).where(eq(transformations.id, id)).returning();
    return result.length > 0;
  }

  // Description methods
  async getDescription(id: number): Promise<Description | undefined> {
    const result = await this.db.select().from(descriptions).where(eq(descriptions.id, id));
    return result[0];
  }

  async getDescriptionsByProjectId(projectId: number): Promise<Description[]> {
    return await this.db.select().from(descriptions)
      .where(eq(descriptions.projectId, projectId))
      .orderBy(desc(descriptions.createdAt));
  }

  async getDescriptionsByUserId(userId: number): Promise<Description[]> {
    return await this.db.select().from(descriptions)
      .where(eq(descriptions.userId, userId))
      .orderBy(desc(descriptions.createdAt));
  }

  async createDescription(description: InsertDescription): Promise<Description> {
    const result = await this.db.insert(descriptions).values({
      ...description,
      status: "pending",
    }).returning();
    return result[0];
  }

  async updateDescription(id: number, updates: Partial<Description>): Promise<Description | undefined> {
    const result = await this.db.update(descriptions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(descriptions.id, id))
      .returning();
    return result[0];
  }

  async deleteDescription(id: number): Promise<boolean> {
    const result = await this.db.delete(descriptions).where(eq(descriptions.id, id)).returning();
    return result.length > 0;
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
    
    // Initialize with sample user for testing
    this.createUser({
      username: "demo",
      password: "password",
      email: "demo@example.com",
      fullName: "Demo User",
      company: "Demo Realty"
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
      ...insertUser, 
      id, 
      plan: "free", 
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
      ...transformation,
      id,
      transformedImagePath: undefined,
      aiProviderUsed: undefined,
      processingTimeMs: undefined,
      status: "pending",
      errorMessage: undefined,
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
      ...description,
      id,
      generatedText: undefined,
      aiProviderUsed: undefined,
      processingTimeMs: undefined,
      status: "pending",
      errorMessage: undefined,
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
const usePostgres = process.env.DATABASE_URL !== undefined;
export const storage = usePostgres ? new PostgresStorage() : new MemStorage();
