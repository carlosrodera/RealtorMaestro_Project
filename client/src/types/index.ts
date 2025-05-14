import { User, Project, Transformation, Description, PropertyData } from "@shared/schema";

// Auth related types
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export interface RegisterData {
  username: string;
  password: string;
  email: string;
  fullName?: string;
  company?: string;
}

export interface LoginData {
  username: string;
  password: string;
}

// Project related types
export interface ProjectData {
  name: string;
  description?: string;
}

// Transformation related types
export interface CanvasAnnotation {
  objects: any[];
  version: string;
}

export interface TransformationData {
  projectId?: number;
  originalImagePath: string;
  style: string;
  customPrompt?: string;
  name?: string;
  annotations?: CanvasAnnotation;
}

// Description related types
export interface DescriptionData {
  projectId?: number;
  propertyData: PropertyData;
  sourceImagePaths?: string[];
  tone: string;
  lengthOption: string;
  language: string;
  name?: string;
}

// UI related types
export interface ImageFile {
  file: File;
  preview: string;
}

export interface ProjectWithStats extends Project {
  transformationCount: number;
  descriptionCount: number;
}

export interface TransformationStep {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface DescriptionStep {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface PropertyFeature {
  id: string;
  label: string;
  checked: boolean;
}

export type PropertyFeatures = Record<string, boolean>;

export interface StyleOption {
  id: string;
  name: string;
  imageUrl: string;
}
