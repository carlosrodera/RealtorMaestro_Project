import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { transformationsStorage, StoredTransformation, creditsStorage, cleanupStorage } from "@/lib/localStorage";
import { getWebhookHandler, prepareImageForN8n } from "@/lib/webhookReceiver";
import { TransformationData } from "@/types";
import { useToast } from "@/hooks/use-toast";

// Global transformation checker
declare global {
  interface Window {
    _transformationCheckerInitialized?: boolean;
  }
}

export function useTransformations(projectId?: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all transformations
  const { data: transformations = [], isLoading, error } = useQuery({
    queryKey: projectId ? ["transformations", projectId] : ["transformations"],
    queryFn: async () => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (projectId) {
        return transformationsStorage.getByProjectId(projectId);
      }
      return transformationsStorage.getAll();
    },
  });

  // Fetch a single transformation
  const useTransformation = (id: string) => {
    return useQuery({
      queryKey: ["transformations", id],
      queryFn: async () => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 100));
        const transformation = transformationsStorage.get(id);
        if (!transformation) {
          throw new Error("Transformación no encontrada");
        }
        return transformation;
      },
      enabled: !!id,
    });
  };

  // Create a new transformation
  const createTransformation = useMutation({
    mutationFn: async (transformationData: TransformationData) => {
      // Check credits
      if (!creditsStorage.use(1)) {
        throw new Error("No tienes créditos suficientes");
      }
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Clean up old data to avoid quota issues
      cleanupStorage();
      
      // Create transformation with pending status
      // Don't store the full base64 image to avoid LocalStorage quota issues
      const transformation = transformationsStorage.create({
        projectId: transformationData.projectId,
        originalImage: 'processing', // Placeholder instead of full image
        style: transformationData.style,
        customPrompt: transformationData.customPrompt,
        annotations: transformationData.annotations,
        status: 'pending'
      });
      
      // Send to n8n webhook
      try {
        // Prepare image for n8n (convert to JPEG if needed)
        const { blob } = await prepareImageForN8n(transformationData.originalImagePath);
        
        // Create FormData for multipart upload
        const formData = new FormData();
        formData.append('image', blob, 'image.jpg');
        formData.append('transformationId', transformation.id);
        formData.append('style', transformationData.style);
        formData.append('prompt', transformationData.customPrompt || '');
        formData.append('annotations', JSON.stringify(transformationData.annotations || {}));
        formData.append('callbackUrl', `${window.location.origin}/webhook-callback?type=transformation`);
        
        // Log what we're sending to n8n
        console.log('=== SENDING TO N8N ===');
        console.log('Transformation ID:', transformation.id);
        console.log('Style:', transformationData.style);
        console.log('Callback URL:', `${window.location.origin}/webhook-callback?type=transformation`);
        console.log('FormData entries:');
        for (let [key, value] of formData.entries()) {
          if (key === 'image') {
            console.log(`  ${key}: [File] ${(value as File).name} (${(value as File).size} bytes)`);
          } else {
            console.log(`  ${key}: ${value}`);
          }
        }
        
        const response = await fetch('https://agenteia.top/webhook-test/transform-image', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          throw new Error('Error al enviar imagen a n8n');
        }
        
        // Update status to processing
        transformationsStorage.update(transformation.id, { status: 'processing' });
        
        // Register webhook handler
        const webhookHandler = getWebhookHandler();
        webhookHandler.onComplete('transformation', transformation.id, (data) => {
          queryClient.invalidateQueries({ queryKey: ["transformations"] });
          if (projectId) {
            queryClient.invalidateQueries({ queryKey: ["transformations", projectId] });
          }
        });
        
      } catch (error) {
        // Revert credit if failed
        creditsStorage.add(1);
        transformationsStorage.update(transformation.id, { 
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Error desconocido'
        });
        throw error;
      }
      
      return transformation;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["transformations"] });
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ["transformations", projectId] });
      }
      
      toast({
        title: "Transformación iniciada",
        description: "La imagen se está procesando. Recibirás una notificación cuando esté lista.",
      });
      
      // Start background checker
      startBackgroundChecker(data.id);
    },
    onError: (error) => {
      toast({
        title: "Error al crear transformación",
        description: error instanceof Error ? error.message : "Ha ocurrido un error",
        variant: "destructive",
      });
    },
  });

  // Update a transformation
  const updateTransformation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<StoredTransformation> }) => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      const updated = transformationsStorage.update(id, data);
      if (!updated) {
        throw new Error("Transformación no encontrada");
      }
      return updated;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["transformations"] });
      queryClient.invalidateQueries({ queryKey: ["transformations", variables.id] });
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ["transformations", projectId] });
      }
    },
  });

  // Delete a transformation
  const deleteTransformation = useMutation({
    mutationFn: async (id: string) => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      const success = transformationsStorage.delete(id);
      if (!success) {
        throw new Error("Transformación no encontrada");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transformations"] });
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ["transformations", projectId] });
      }
      toast({
        title: "Transformación eliminada",
        description: "La transformación ha sido eliminada exitosamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar transformación",
        description: error instanceof Error ? error.message : "Ha ocurrido un error",
        variant: "destructive",
      });
    },
  });

  // Background checker for pending transformations
  const startBackgroundChecker = (transformationId: string) => {
    if (!window._transformationCheckerInitialized) {
      window._transformationCheckerInitialized = true;
      
      // Request notification permission only on user action
      // Removed automatic permission request to avoid browser warning
      
      // Check every 10 seconds
      setInterval(() => {
        const allTransformations = transformationsStorage.getAll();
        const pendingTransformations = allTransformations.filter(t => 
          t.status === 'pending' || t.status === 'processing'
        );
        
        pendingTransformations.forEach(transformation => {
          // Check if transformation has been processing for too long (5 minutes)
          const createdAt = new Date(transformation.createdAt).getTime();
          const now = Date.now();
          const elapsedMinutes = (now - createdAt) / 1000 / 60;
          
          if (elapsedMinutes > 5) {
            transformationsStorage.update(transformation.id, {
              status: 'failed',
              errorMessage: 'Tiempo de espera excedido (5 minutos)'
            });
            
            // Show notification
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Error en transformación', {
                body: 'La transformación ha excedido el tiempo máximo de espera.',
                icon: '/favicon.ico'
              });
            }
          }
        });
        
        // Invalidate queries to refresh UI
        if (pendingTransformations.length > 0) {
          queryClient.invalidateQueries({ queryKey: ["transformations"] });
        }
      }, 10000);
    }
  };

  return {
    transformations,
    isLoading,
    error,
    useTransformation,
    createTransformation,
    updateTransformation,
    deleteTransformation,
  };
}