import fetch from 'node-fetch';

interface N8nTransformationRequestData {
  originalImageUrl: string;
  style: string;
  customPrompt?: string | null;
}

interface N8nDescriptionRequestData {
  propertyData: any;
  sourceImageUrls?: string[];
  tone: string;
  lengthOption: string;
  language: string;
}

/**
 * Service to handle communication with n8n workflows
 */
export class N8nService {
  private transformationWebhookUrl: string | null = null;
  private descriptionWebhookUrl: string | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.transformationWebhookUrl = process.env.N8N_TRANSFORMATION_WEBHOOK || null;
    this.descriptionWebhookUrl = process.env.N8N_DESCRIPTION_WEBHOOK || null;
    this.isConfigured = !!(this.transformationWebhookUrl || this.descriptionWebhookUrl);
    
    if (!this.isConfigured) {
      console.warn("N8n webhooks not configured. Using mock service for demo.");
    } else {
      console.log("N8n service initialized with webhook URLs.");
    }
  }

  /**
   * Checks if the n8n service is properly configured
   */
  public isServiceConfigured(): boolean {
    return this.isConfigured;
  }

  /**
   * Sends a request to the n8n transformation webhook
   * @param data The transformation request data
   * @returns A promise that resolves when the request is sent
   */
  public async requestImageTransformation(data: N8nTransformationRequestData): Promise<any> {
    if (!this.transformationWebhookUrl) {
      console.log("[n8n-mock] Image transformation request handled by mock service");
      console.log(`[n8n-mock] Original image: ${data.originalImageUrl}`);
      console.log(`[n8n-mock] Style: ${data.style}`);
      console.log(`[n8n-mock] Custom prompt: ${data.customPrompt || 'No custom prompt'}`);
      
      // Return a mock response after a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        success: true,
        message: "Transformation request received by mock service",
        mockServiceUsed: true
      };
    }

    try {
      const response = await fetch(this.transformationWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`n8n request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error sending transformation request to n8n:", error);
      throw error;
    }
  }

  /**
   * Sends a request to the n8n description webhook
   * @param data The description request data
   * @returns A promise that resolves when the request is sent
   */
  public async requestPropertyDescription(data: N8nDescriptionRequestData): Promise<any> {
    if (!this.descriptionWebhookUrl) {
      console.log("[n8n-mock] Property description request handled by mock service");
      console.log(`[n8n-mock] Property type: ${data.propertyData.propertyType}`);
      console.log(`[n8n-mock] Zone: ${data.propertyData.zone}`);
      console.log(`[n8n-mock] Tone: ${data.tone}`);
      console.log(`[n8n-mock] Length: ${data.lengthOption}`);
      console.log(`[n8n-mock] Language: ${data.language}`);
      
      if (data.sourceImageUrls && data.sourceImageUrls.length > 0) {
        console.log(`[n8n-mock] Images included: ${data.sourceImageUrls.length}`);
      } else {
        console.log(`[n8n-mock] No images included in the request`);
      }
      
      // Return a mock response after a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        success: true,
        message: "Description request received by mock service",
        mockServiceUsed: true
      };
    }

    try {
      const response = await fetch(this.descriptionWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`n8n request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error sending description request to n8n:", error);
      throw error;
    }
  }
}

// Create a singleton instance
export const n8nService = new N8nService();