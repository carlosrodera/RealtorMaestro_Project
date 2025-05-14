import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Description } from "@shared/schema";
import { DescriptionData } from "@/types";
import { useToast } from "@/hooks/use-toast";

export function useDescriptions(projectId?: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all descriptions by user or project
  const { data: descriptions, isLoading, error } = useQuery({
    queryKey: projectId 
      ? [`/api/projects/${projectId}/descriptions`] 
      : ["/api/descriptions"],
    enabled: projectId ? !!projectId : true,
  });

  // Fetch a single description
  const useDescription = (id: number) => {
    return useQuery({
      queryKey: [`/api/descriptions/${id}`],
      enabled: !!id,
    });
  };

  // Create a new description
  const createDescription = useMutation({
    mutationFn: async (descriptionData: DescriptionData) => {
      const res = await apiRequest("POST", "/api/descriptions", descriptionData);
      return res.json();
    },
    onSuccess: (data) => {
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/descriptions`] });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/descriptions"] });
      toast({
        title: "Generación iniciada",
        description: "La descripción se está generando",
      });
      
      // We need to poll for updates until the description is complete
      const pollInterval = setInterval(async () => {
        try {
          const res = await fetch(`/api/descriptions/${data.id}`, {
            credentials: 'include',
          });
          const updatedDescription = await res.json();
          
          if (updatedDescription.status === "completed") {
            clearInterval(pollInterval);
            queryClient.invalidateQueries({ queryKey: [`/api/descriptions/${data.id}`] });
            if (projectId) {
              queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/descriptions`] });
            }
            queryClient.invalidateQueries({ queryKey: ["/api/descriptions"] });
            toast({
              title: "Descripción completada",
              description: "La descripción ha sido generada exitosamente",
            });
          } else if (updatedDescription.status === "failed") {
            clearInterval(pollInterval);
            toast({
              title: "Error en la generación",
              description: updatedDescription.errorMessage || "Ha ocurrido un error durante la generación",
              variant: "destructive",
            });
          }
        } catch (error) {
          clearInterval(pollInterval);
        }
      }, 2000);
      
      // Clear interval after 5 minutes just in case
      setTimeout(() => clearInterval(pollInterval), 5 * 60 * 1000);
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
    mutationFn: async ({ id, data }: { id: number; data: Partial<Description> }) => {
      const res = await apiRequest("PUT", `/api/descriptions/${id}`, data);
      return res.json();
    },
    onSuccess: (_, variables) => {
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/descriptions`] });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/descriptions"] });
      queryClient.invalidateQueries({ queryKey: [`/api/descriptions/${variables.id}`] });
      toast({
        title: "Descripción actualizada",
        description: "La descripción ha sido actualizada exitosamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al actualizar descripción",
        description: error instanceof Error ? error.message : "Ha ocurrido un error",
        variant: "destructive",
      });
    },
  });

  // Delete a description
  const deleteDescription = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/descriptions/${id}`);
    },
    onSuccess: () => {
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/descriptions`] });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/descriptions"] });
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
