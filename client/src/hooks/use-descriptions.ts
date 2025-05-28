import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { descriptionsStorage, StoredDescription, creditsStorage } from "@/lib/localStorage";
import { DescriptionData } from "@/types";
import { useToast } from "@/hooks/use-toast";

export function useDescriptions(projectId?: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all descriptions
  const { data: descriptions = [], isLoading, error } = useQuery({
    queryKey: projectId ? ["descriptions", projectId] : ["descriptions"],
    queryFn: async () => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (projectId) {
        return descriptionsStorage.getByProjectId(projectId);
      }
      return descriptionsStorage.getAll();
    },
  });

  // Fetch a single description
  const useDescription = (id: string) => {
    return useQuery({
      queryKey: ["descriptions", id],
      queryFn: async () => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 100));
        const description = descriptionsStorage.get(id);
        if (!description) {
          throw new Error("Descripción no encontrada");
        }
        return description;
      },
      enabled: !!id,
    });
  };

  // Create a new description
  const createDescription = useMutation({
    mutationFn: async (descriptionData: DescriptionData) => {
      // Check credits
      if (!creditsStorage.use(1)) {
        throw new Error("No tienes créditos suficientes");
      }
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Create description with pending status
      const description = descriptionsStorage.create({
        projectId: descriptionData.projectId,
        propertyData: descriptionData.propertyData,
        tone: descriptionData.tone,
        language: descriptionData.language || 'es',
        status: 'pending'
      });
      
      // Send to n8n webhook
      try {
        const response = await fetch('https://agenteia.top/webhook-test/generate-description', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            descriptionId: description.id,
            propertyData: descriptionData.propertyData,
            tone: descriptionData.tone,
            language: descriptionData.language || 'es',
            callbackUrl: `${window.location.origin}/api/webhook/description-complete`
          })
        });
        
        if (!response.ok) {
          throw new Error('Error al enviar solicitud a n8n');
        }
        
        // Update status to processing
        descriptionsStorage.update(description.id, { status: 'processing' });
        
        // Simulate completion after 3-5 seconds (for demo)
        setTimeout(() => {
          const generatedText = generateDemoDescription(descriptionData);
          descriptionsStorage.update(description.id, {
            status: 'completed',
            generatedText
          });
          
          queryClient.invalidateQueries({ queryKey: ["descriptions"] });
          if (projectId) {
            queryClient.invalidateQueries({ queryKey: ["descriptions", projectId] });
          }
          
          toast({
            title: "Descripción completada",
            description: "La descripción ha sido generada exitosamente",
          });
        }, Math.random() * 2000 + 3000);
        
      } catch (error) {
        // Revert credit if failed
        creditsStorage.add(1);
        descriptionsStorage.update(description.id, { 
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Error desconocido'
        });
        throw error;
      }
      
      return description;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["descriptions"] });
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ["descriptions", projectId] });
      }
      
      toast({
        title: "Generación iniciada",
        description: "La descripción se está generando",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al crear descripción",
        description: error instanceof Error ? error.message : "Ha ocurrido un error",
        variant: "destructive",
      });
    },
  });

  // Update a description
  const updateDescription = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<StoredDescription> }) => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      const updated = descriptionsStorage.update(id, data);
      if (!updated) {
        throw new Error("Descripción no encontrada");
      }
      return updated;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["descriptions"] });
      queryClient.invalidateQueries({ queryKey: ["descriptions", variables.id] });
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ["descriptions", projectId] });
      }
    },
  });

  // Delete a description
  const deleteDescription = useMutation({
    mutationFn: async (id: string) => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      const success = descriptionsStorage.delete(id);
      if (!success) {
        throw new Error("Descripción no encontrada");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["descriptions"] });
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ["descriptions", projectId] });
      }
      toast({
        title: "Descripción eliminada",
        description: "La descripción ha sido eliminada exitosamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar descripción",
        description: error instanceof Error ? error.message : "Ha ocurrido un error",
        variant: "destructive",
      });
    },
  });

  return {
    descriptions,
    isLoading,
    error,
    useDescription,
    createDescription,
    updateDescription,
    deleteDescription,
  };
}

// Helper function to generate demo descriptions
function generateDemoDescription(data: DescriptionData): string {
  const { propertyData, tone, language } = data;
  
  const templates = {
    es: {
      professional: `Descubra esta excepcional propiedad de tipo ${propertyData.propertyType} ubicada en ${propertyData.zone}. Con ${propertyData.area}m² distribuidos en ${propertyData.bedrooms} dormitorios y ${propertyData.bathrooms} baños, esta propiedad ofrece el espacio perfecto para su familia. Construida en ${propertyData.yearBuilt}, ha sido cuidadosamente mantenida y presenta características modernas. Con un precio de €${propertyData.price}, representa una excelente oportunidad de inversión en una de las mejores zonas de la ciudad.`,
      
      casual: `¡Echa un vistazo a esta increíble ${propertyData.propertyType} en ${propertyData.zone}! Tiene ${propertyData.area}m² súper bien distribuidos, con ${propertyData.bedrooms} habitaciones y ${propertyData.bathrooms} baños. Es del ${propertyData.yearBuilt} pero está en muy buen estado. Por €${propertyData.price} es una ganga. ¡No te la pierdas!`,
      
      creative: `Imagina despertar cada mañana en tu nuevo hogar en ${propertyData.zone}. Esta ${propertyData.propertyType} de ${propertyData.area}m² es más que una propiedad: es el escenario donde escribirás los próximos capítulos de tu vida. Con ${propertyData.bedrooms} acogedores dormitorios y ${propertyData.bathrooms} baños elegantes, cada rincón cuenta una historia de confort y estilo.`
    },
    en: {
      professional: `Discover this exceptional ${propertyData.propertyType} property located in ${propertyData.zone}. With ${propertyData.area}m² distributed across ${propertyData.bedrooms} bedrooms and ${propertyData.bathrooms} bathrooms, this property offers the perfect space for your family. Built in ${propertyData.yearBuilt}, it has been carefully maintained and features modern amenities. Priced at €${propertyData.price}, it represents an excellent investment opportunity.`,
      
      casual: `Check out this amazing ${propertyData.propertyType} in ${propertyData.zone}! It's got ${propertyData.area}m² of well-distributed space, with ${propertyData.bedrooms} bedrooms and ${propertyData.bathrooms} bathrooms. Built in ${propertyData.yearBuilt} but in great condition. At €${propertyData.price}, it's a steal!`,
      
      creative: `Picture yourself waking up each morning in your new home in ${propertyData.zone}. This ${propertyData.area}m² ${propertyData.propertyType} is more than just a property: it's the canvas where you'll paint the next chapters of your life. With ${propertyData.bedrooms} cozy bedrooms and ${propertyData.bathrooms} elegant bathrooms, every corner tells a story of comfort and style.`
    }
  };
  
  const selectedLanguage = language === 'en' ? 'en' : 'es';
  const selectedTone = tone in templates[selectedLanguage] ? tone : 'professional';
  
  return templates[selectedLanguage][selectedTone as keyof typeof templates[typeof selectedLanguage]];
}