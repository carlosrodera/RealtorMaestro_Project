// LocalStorage utilities for persisting data without a database

const STORAGE_KEYS = {
  USER: 'realtor360_user',
  PROJECTS: 'realtor360_projects',
  TRANSFORMATIONS: 'realtor360_transformations',
  DESCRIPTIONS: 'realtor360_descriptions',
  SESSION: 'realtor360_session',
  CREDITS: 'realtor360_credits'
} as const;

// Maximum items to store in history
const MAX_TRANSFORMATIONS = 10;
const MAX_DESCRIPTIONS = 10;

export interface StoredUser {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  company?: string;
  plan: 'free' | 'basic' | 'pro' | 'enterprise';
  credits: number;
  createdAt: string;
}

export interface StoredProject {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredTransformation {
  id: string;
  projectId?: string;
  originalImage: string; // base64 or URL
  transformedImage?: string; // URL from Google Drive
  style: string;
  customPrompt?: string;
  annotations?: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}

export interface StoredDescription {
  id: string;
  projectId?: string;
  propertyData: any;
  tone: string;
  language: string;
  generatedText?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
}

// User management
export const userStorage = {
  get: (): StoredUser | null => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  
  set: (user: StoredUser) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },
  
  clear: () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  },
  
  isLoggedIn: (): boolean => {
    return !!userStorage.get() && !!localStorage.getItem(STORAGE_KEYS.SESSION);
  },
  
  login: (username: string) => {
    const user: StoredUser = {
      id: `user_${Date.now()}`,
      username,
      email: `${username}@realtor360.demo`,
      fullName: username === 'demo' ? 'María García' : username,
      company: username === 'demo' ? 'InmoTech Realty' : 'Mi Inmobiliaria',
      plan: 'free',
      credits: 5, // Start with 5 free credits
      createdAt: new Date().toISOString()
    };
    userStorage.set(user);
    localStorage.setItem(STORAGE_KEYS.SESSION, 'active');
    return user;
  }
};

// Projects management
export const projectsStorage = {
  getAll: (): StoredProject[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  
  get: (id: string): StoredProject | undefined => {
    const projects = projectsStorage.getAll();
    return projects.find(p => p.id === id);
  },
  
  create: (name: string, description?: string): StoredProject => {
    const projects = projectsStorage.getAll();
    const newProject: StoredProject = {
      id: `proj_${Date.now()}`,
      name,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    projects.push(newProject);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    return newProject;
  },
  
  update: (id: string, updates: Partial<StoredProject>): StoredProject | undefined => {
    const projects = projectsStorage.getAll();
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    
    projects[index] = {
      ...projects[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    return projects[index];
  },
  
  delete: (id: string): boolean => {
    const projects = projectsStorage.getAll();
    const filtered = projects.filter(p => p.id !== id);
    if (filtered.length === projects.length) return false;
    
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(filtered));
    // Also delete related transformations and descriptions
    transformationsStorage.deleteByProjectId(id);
    descriptionsStorage.deleteByProjectId(id);
    return true;
  }
};

// Transformations management
export const transformationsStorage = {
  getAll: (): StoredTransformation[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSFORMATIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  
  get: (id: string): StoredTransformation | undefined => {
    const transformations = transformationsStorage.getAll();
    return transformations.find(t => t.id === id);
  },
  
  getByProjectId: (projectId: string): StoredTransformation[] => {
    const transformations = transformationsStorage.getAll();
    return transformations.filter(t => t.projectId === projectId);
  },
  
  create: (transformation: Omit<StoredTransformation, 'id' | 'createdAt'>): StoredTransformation => {
    let transformations = transformationsStorage.getAll();
    
    // Limit to MAX_TRANSFORMATIONS
    if (transformations.length >= MAX_TRANSFORMATIONS) {
      // Remove oldest transformation
      transformations = transformations.slice(1);
    }
    
    const newTransformation: StoredTransformation = {
      ...transformation,
      id: `trans_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    transformations.push(newTransformation);
    localStorage.setItem(STORAGE_KEYS.TRANSFORMATIONS, JSON.stringify(transformations));
    return newTransformation;
  },
  
  update: (id: string, updates: Partial<StoredTransformation>): StoredTransformation | undefined => {
    const transformations = transformationsStorage.getAll();
    const index = transformations.findIndex(t => t.id === id);
    if (index === -1) return undefined;
    
    transformations[index] = {
      ...transformations[index],
      ...updates
    };
    localStorage.setItem(STORAGE_KEYS.TRANSFORMATIONS, JSON.stringify(transformations));
    return transformations[index];
  },
  
  delete: (id: string): boolean => {
    const transformations = transformationsStorage.getAll();
    const filtered = transformations.filter(t => t.id !== id);
    if (filtered.length === transformations.length) return false;
    
    localStorage.setItem(STORAGE_KEYS.TRANSFORMATIONS, JSON.stringify(filtered));
    return true;
  },
  
  deleteByProjectId: (projectId: string) => {
    const transformations = transformationsStorage.getAll();
    const filtered = transformations.filter(t => t.projectId !== projectId);
    localStorage.setItem(STORAGE_KEYS.TRANSFORMATIONS, JSON.stringify(filtered));
  }
};

// Descriptions management
export const descriptionsStorage = {
  getAll: (): StoredDescription[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DESCRIPTIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  
  get: (id: string): StoredDescription | undefined => {
    const descriptions = descriptionsStorage.getAll();
    return descriptions.find(d => d.id === id);
  },
  
  getByProjectId: (projectId: string): StoredDescription[] => {
    const descriptions = descriptionsStorage.getAll();
    return descriptions.filter(d => d.projectId === projectId);
  },
  
  create: (description: Omit<StoredDescription, 'id' | 'createdAt'>): StoredDescription => {
    let descriptions = descriptionsStorage.getAll();
    
    // Limit to MAX_DESCRIPTIONS
    if (descriptions.length >= MAX_DESCRIPTIONS) {
      // Remove oldest description
      descriptions = descriptions.slice(1);
    }
    
    const newDescription: StoredDescription = {
      ...description,
      id: `desc_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    descriptions.push(newDescription);
    localStorage.setItem(STORAGE_KEYS.DESCRIPTIONS, JSON.stringify(descriptions));
    return newDescription;
  },
  
  update: (id: string, updates: Partial<StoredDescription>): StoredDescription | undefined => {
    const descriptions = descriptionsStorage.getAll();
    const index = descriptions.findIndex(d => d.id === id);
    if (index === -1) return undefined;
    
    descriptions[index] = {
      ...descriptions[index],
      ...updates
    };
    localStorage.setItem(STORAGE_KEYS.DESCRIPTIONS, JSON.stringify(descriptions));
    return descriptions[index];
  },
  
  delete: (id: string): boolean => {
    const descriptions = descriptionsStorage.getAll();
    const filtered = descriptions.filter(d => d.id !== id);
    if (filtered.length === descriptions.length) return false;
    
    localStorage.setItem(STORAGE_KEYS.DESCRIPTIONS, JSON.stringify(filtered));
    return true;
  },
  
  deleteByProjectId: (projectId: string) => {
    const descriptions = descriptionsStorage.getAll();
    const filtered = descriptions.filter(d => d.projectId !== projectId);
    localStorage.setItem(STORAGE_KEYS.DESCRIPTIONS, JSON.stringify(filtered));
  }
};

// Credits management
export const creditsStorage = {
  get: (): number => {
    const user = userStorage.get();
    return user?.credits || 0;
  },
  
  use: (amount: number = 1): boolean => {
    const user = userStorage.get();
    if (!user || user.credits < amount) return false;
    
    user.credits -= amount;
    userStorage.set(user);
    return true;
  },
  
  add: (amount: number) => {
    const user = userStorage.get();
    if (!user) return;
    
    user.credits += amount;
    userStorage.set(user);
  },
  
  upgrade: (plan: 'basic' | 'pro' | 'enterprise') => {
    const user = userStorage.get();
    if (!user) return;
    
    const creditsByPlan = {
      basic: 20,
      pro: 100,
      enterprise: 999999
    };
    
    user.plan = plan;
    user.credits = creditsByPlan[plan];
    userStorage.set(user);
  }
};

// Initialize demo data if needed
export const initializeDemoData = () => {
  // Check if already initialized
  if (localStorage.getItem('realtor360_initialized')) return;
  
  // Create demo projects
  const demoProjects = [
    {
      name: 'Ático en Malasaña',
      description: 'Ático de lujo con terraza en el centro de Madrid'
    },
    {
      name: 'Villa en La Moraleja',
      description: 'Villa exclusiva con piscina y jardín'
    }
  ];
  
  demoProjects.forEach(proj => projectsStorage.create(proj.name, proj.description));
  
  // Mark as initialized
  localStorage.setItem('realtor360_initialized', 'true');
};

// Clear all data
export const clearAllData = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  localStorage.removeItem('realtor360_initialized');
};