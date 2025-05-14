import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Transformation } from "@shared/schema";
import { TransformationData } from "@/types";
import { useToast } from "@/hooks/use-toast";

export function useTransformations(projectId?: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all transformations by user or project
  const { data: transformations, isLoading, error } = useQuery({
    queryKey: projectId 
      ? [`/api/projects/${projectId}/transformations`] 
      : ["/api/transformations"],
    enabled: projectId ? !!projectId : true,
  });

  // Fetch a single transformation
  const useTransformation = (id: number) => {
    return useQuery({
      queryKey: [`/api/transformations/${id}`],
      enabled: !!id,
    });
  };

  // Create a new transformation
  const createTransformation = useMutation({
    mutationFn: async (transformationData: TransformationData) => {
      const res = await apiRequest("POST", "/api/transformations", transformationData);
      return res.json();
    },
    onSuccess: (data) => {
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/transformations`] });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/transformations"] });
      toast({
        title: "Transformación iniciada",
        description: "La imagen se está procesando",
      });
      
      // We need to poll for updates until the transformation is complete
      const pollInterval = setInterval(async () => {
        try {
          const res = await fetch(`/api/transformations/${data.id}`, {
            credentials: 'include',
          });
          const updatedTransformation = await res.json();
          
          if (updatedTransformation.status === "completed") {
            clearInterval(pollInterval);
            queryClient.invalidateQueries({ queryKey: [`/api/transformations/${data.id}`] });
            if (projectId) {
              queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/transformations`] });
            }
            queryClient.invalidateQueries({ queryKey: ["/api/transformations"] });
            toast({
              title: "Transformación completada",
              description: "La imagen ha sido transformada exitosamente",
            });
          } else if (updatedTransformation.status === "failed") {
            clearInterval(pollInterval);
            toast({
              title: "Error en la transformación",
              description: updatedTransformation.errorMessage || "Ha ocurrido un error durante la transformación",
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
        title: "Error al crear transformación",
        description: error instanceof Error ? error.message : "Ha ocurrido un error",
        variant: "destructive",
      });
    },
  });

  // Update a transformation
  const updateTransformation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Transformation> }) => {
      const res = await apiRequest("PUT", `/api/transformations/${id}`, data);
      return res.json();
    },
    onSuccess: (_, variables) => {
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/transformations`] });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/transformations"] });
      queryClient.invalidateQueries({ queryKey: [`/api/transformations/${variables.id}`] });
      toast({
        title: "Transformación actualizada",
        description: "La transformación ha sido actualizada exitosamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al actualizar transformación",
        description: error instanceof Error ? error.message : "Ha ocurrido un error",
        variant: "destructive",
      });
    },
  });

  // Delete a transformation
  const deleteTransformation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/transformations/${id}`);
    },
    onSuccess: () => {
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/transformations`] });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/transformations"] });
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
