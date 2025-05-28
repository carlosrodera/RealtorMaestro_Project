// Webhook receiver for n8n callbacks
import { transformationsStorage } from './localStorage';

// Global webhook handler
let webhookHandler: WebhookHandler | null = null;

export class WebhookHandler {
  private listeners: Map<string, (data: any) => void> = new Map();
  
  constructor() {
    // Set up global message listener for webhook responses
    if (typeof window !== 'undefined') {
      window.addEventListener('message', this.handleMessage.bind(this));
      
      // Also listen for custom events that might be triggered by n8n
      window.addEventListener('n8n-webhook-response', this.handleWebhookEvent.bind(this));
    }
  }
  
  private handleMessage(event: MessageEvent) {
    // Validate origin if needed
    if (event.origin !== 'https://agenteia.top' && event.origin !== window.location.origin) {
      return;
    }
    
    try {
      const data = event.data;
      if (data.type === 'n8n-transformation-complete') {
        this.processTransformationComplete(data.payload);
      } else if (data.type === 'n8n-description-complete') {
        this.processDescriptionComplete(data.payload);
      }
    } catch (error) {
      console.error('Error processing webhook message:', error);
    }
  }
  
  private handleWebhookEvent(event: CustomEvent) {
    try {
      const data = event.detail;
      if (data.transformationId) {
        this.processTransformationComplete(data);
      } else if (data.descriptionId) {
        this.processDescriptionComplete(data);
      }
    } catch (error) {
      console.error('Error processing webhook event:', error);
    }
  }
  
  private processTransformationComplete(data: any) {
    const { transformationId, imageUrl, error } = data;
    
    if (!transformationId) return;
    
    if (error) {
      transformationsStorage.update(transformationId, {
        status: 'failed',
        errorMessage: error,
        completedAt: new Date().toISOString()
      });
    } else if (imageUrl) {
      transformationsStorage.update(transformationId, {
        status: 'completed',
        transformedImage: imageUrl,
        completedAt: new Date().toISOString()
      });
      
      // Show notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Transformación completada', {
          body: 'Tu imagen ha sido transformada exitosamente.',
          icon: '/favicon.ico'
        });
      }
    }
    
    // Trigger any registered listeners
    const listener = this.listeners.get(`transformation-${transformationId}`);
    if (listener) {
      listener(data);
      this.listeners.delete(`transformation-${transformationId}`);
    }
  }
  
  private processDescriptionComplete(data: any) {
    const { descriptionId, text, error } = data;
    
    if (!descriptionId) return;
    
    // Update description in storage
    const descriptionsStorage = {
      update: (id: string, updates: any) => {
        const descriptions = JSON.parse(localStorage.getItem('realtor360_descriptions') || '[]');
        const index = descriptions.findIndex((d: any) => d.id === id);
        if (index !== -1) {
          descriptions[index] = { ...descriptions[index], ...updates };
          localStorage.setItem('realtor360_descriptions', JSON.stringify(descriptions));
        }
      }
    };
    
    if (error) {
      descriptionsStorage.update(descriptionId, {
        status: 'failed',
        errorMessage: error
      });
    } else if (text) {
      descriptionsStorage.update(descriptionId, {
        status: 'completed',
        generatedText: text
      });
    }
    
    // Trigger any registered listeners
    const listener = this.listeners.get(`description-${descriptionId}`);
    if (listener) {
      listener(data);
      this.listeners.delete(`description-${descriptionId}`);
    }
  }
  
  // Register a callback for a specific transformation/description
  public onComplete(type: 'transformation' | 'description', id: string, callback: (data: any) => void) {
    this.listeners.set(`${type}-${id}`, callback);
  }
  
  // Manual webhook endpoint simulation for development
  public simulateWebhook(type: 'transformation' | 'description', id: string, data: any) {
    if (type === 'transformation') {
      this.processTransformationComplete({ transformationId: id, ...data });
    } else {
      this.processDescriptionComplete({ descriptionId: id, ...data });
    }
  }
}

// Initialize global webhook handler
export function getWebhookHandler(): WebhookHandler {
  if (!webhookHandler) {
    webhookHandler = new WebhookHandler();
  }
  return webhookHandler;
}

// Helper function to convert image to proper format for n8n
export async function prepareImageForN8n(imageDataUrl: string): Promise<{ blob: Blob; mimeType: string }> {
  // Extract mime type and base64 data
  const matches = imageDataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid image data URL');
  }
  
  const mimeType = matches[1];
  
  // If it's not JPEG, convert it
  if (mimeType !== 'image/jpeg') {
    // Create image element
    const img = new Image();
    img.src = imageDataUrl;
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
    
    // Create canvas and convert to JPEG
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    
    ctx.drawImage(img, 0, 0);
    
    // Convert to JPEG blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert image to blob'));
        }
      }, 'image/jpeg', 0.9);
    });
    
    return {
      blob,
      mimeType: 'image/jpeg'
    };
  }
  
  // Convert base64 to blob for JPEG
  const base64 = matches[2];
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'image/jpeg' });
  
  return { blob, mimeType };
}