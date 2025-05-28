import fetch from 'node-fetch';

interface N8nTransformationRequestData {
  originalImage: string; // Base64 encoded image data
  style: string;
  customPrompt?: string | null;
  transformationId?: string; // ID de la transformación para el webhook de retorno
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
    // Usar la URL específica proporcionada para transformación de imágenes
    this.transformationWebhookUrl = "https://agenteia.top/webhook-test/transform-image";
    this.descriptionWebhookUrl = process.env.N8N_DESCRIPTION_WEBHOOK || null;
    this.isConfigured = true; // Siempre configurado con la URL específica

    console.log("N8n service initialized with webhook URL:", this.transformationWebhookUrl);

    // Nota sobre webhooks a localhost:
    // Para recibir webhooks en localhost, se necesita una solución de tunneling como ngrok
    // Ejemplo: ngrok http 3000
    // Esto crearía un túnel público que puede recibir webhooks y reenviarlos a localhost:3000
    console.log("NOTA: Para recibir webhooks en localhost, considere usar ngrok u otra solución de tunneling");
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
    // Siempre usamos el webhook configurado
    console.log("Preparing to send image data to webhook:", this.transformationWebhookUrl);

    try {
      // Preparar los datos para el webhook en el formato que espera n8n
      // Crear un FormData para enviar la imagen como un archivo
      const formData = new FormData();

      // Convertir la imagen base64 a un archivo binario
      const binaryData = Buffer.from(data.originalImage, 'base64');
      const blob = new Blob([binaryData], { type: 'image/jpeg' });

      // Agregar la imagen como un archivo
      formData.append('image', blob, 'image.jpg');

      // Agregar los demás campos
      formData.append('style', data.style);
      if (data.customPrompt) {
        formData.append('prompt', data.customPrompt);
      }

      // Agregar el ID de transformación para el webhook de retorno
      if (data.transformationId) {
        formData.append('transformationId', data.transformationId);
        console.log(`Including transformationId ${data.transformationId} for webhook callback`);
      }

      console.log("Sending image as multipart/form-data with style:", data.style);
      console.log("Image binary size:", binaryData.length, "bytes");

      console.log("Sending image transformation request with style:", data.style);
      console.log("Custom prompt:", data.customPrompt || 'No custom prompt');

      // Enviar la solicitud al webhook como multipart/form-data
      const response = await fetch(this.transformationWebhookUrl, {
        method: 'POST',
        // No establecer Content-Type, se establecerá automáticamente con el boundary correcto
        body: formData,
      });

      // Verificar la respuesta
      let responseData;
      try {
        if (!response.ok) {
          console.error(`Webhook request failed with status ${response.status}`);
          console.log("Response text:", await response.text());
          // No lanzar error, continuar con el modo simulado
        } else {
          // Procesar la respuesta
          responseData = await response.json();
          console.log("Webhook response received:", responseData);
        }
      } catch (parseError) {
        console.error("Error parsing webhook response:", parseError);
        // Continuar con el modo simulado
      }

      // Si no hay respuesta real, usar el modo simulado
      if (!responseData || !responseData.transformedImageUrl) {
        console.log("No transformed image URL in response, using mock mode");
        return {
          success: true,
          message: "Transformation processed",
          mockServiceUsed: true
        };
      }

      return responseData;
    } catch (error) {
      console.error("Error sending transformation request to webhook:", error);

      // En caso de error, devolver una respuesta simulada
      return {
        success: false,
        message: "Error processing transformation",
        error: error.message,
        mockServiceUsed: true
      };
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