import { pgTable, text, serial, integer, boolean, uuid, foreignKey, jsonb, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  company: text("company"),
  avatarUrl: text("avatar_url"),
  plan: text("plan").default("free"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  company: true,
});

// Projects table
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  userId: true,
  name: true,
  description: true,
});

// Transformations table
export const transformations = pgTable("transformations", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  originalImagePath: text("original_image_path").notNull(),
  transformedImagePath: text("transformed_image_path"),
  annotations: jsonb("annotations"),
  style: text("style").notNull(),
  customPrompt: text("custom_prompt"),
  aiProviderUsed: text("ai_provider_used"),
  processingTimeMs: integer("processing_time_ms"),
  status: text("status").notNull().default("pending"),
  errorMessage: text("error_message"),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTransformationSchema = createInsertSchema(transformations).pick({
  projectId: true,
  userId: true,
  originalImagePath: true,
  style: true,
  customPrompt: true,
  annotations: true,
  name: true,
});

// Descriptions table
export const descriptions = pgTable("descriptions", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  propertyData: jsonb("property_data").notNull(),
  sourceImagePaths: text("source_image_paths").array(),
  generatedText: text("generated_text"),
  tone: text("tone").notNull(),
  lengthOption: text("length_option").notNull(),
  language: text("language").notNull().default("es"),
  aiProviderUsed: text("ai_provider_used"),
  processingTimeMs: integer("processing_time_ms"),
  status: text("status").notNull().default("pending"),
  errorMessage: text("error_message"),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertDescriptionSchema = createInsertSchema(descriptions).pick({
  projectId: true,
  userId: true,
  propertyData: true,
  sourceImagePaths: true,
  tone: true,
  lengthOption: true,
  language: true,
  name: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Transformation = typeof transformations.$inferSelect;
export type InsertTransformation = z.infer<typeof insertTransformationSchema>;

export type Description = typeof descriptions.$inferSelect;
export type InsertDescription = z.infer<typeof insertDescriptionSchema>;

// Property Data schema for form validation
export const propertyDataSchema = z.object({
  propertyType: z.string(),
  price: z.string(),
  area: z.string(),
  bedrooms: z.string(),
  bathrooms: z.string(),
  zone: z.string(),
  yearBuilt: z.string(),
  features: z.record(z.boolean()).optional(),
  notes: z.string().optional(),
});

export type PropertyData = z.infer<typeof propertyDataSchema>;
