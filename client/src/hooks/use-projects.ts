import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Project } from "@shared/schema";
import { ProjectData } from "@/types";
import { useToast } from "@/hooks/use-toast";

export function useProjects() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all projects
  const { data: projects, isLoading, error } = useQuery({
    queryKey: ["/api/projects"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch a single project
  const useProject = (id: number) => {
    return useQuery({
      queryKey: [`/api/projects/${id}`],
      enabled: !!id,
    });
  };

  // Create a new project
  const createProject = useMutation({
    mutationFn: async (projectData: ProjectData) => {
      const res = await apiRequest("POST", "/api/projects", projectData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Proyecto creado",
        description: "El proyecto ha sido creado exitosamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al crear proyecto",
        description: error instanceof Error ? error.message : "Ha ocurrido un error",
        variant: "destructive",
      });
    },
  });

  // Update a project
  const updateProject = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Project> }) => {
      const res = await apiRequest("PUT", `/api/projects/${id}`, data);
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${variables.id}`] });
      toast({
        title: "Proyecto actualizado",
        description: "El proyecto ha sido actualizado exitosamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al actualizar proyecto",
        description: error instanceof Error ? error.message : "Ha ocurrido un error",
        variant: "destructive",
      });
    },
  });

  // Delete a project
  const deleteProject = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Proyecto eliminado",
        description: "El proyecto ha sido eliminado exitosamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar proyecto",
        description: error instanceof Error ? error.message : "Ha ocurrido un error",
        variant: "destructive",
      });
    },
  });

  return {
    projects,
    isLoading,
    error,
    useProject,
    createProject,
    updateProject,
    deleteProject,
  };
}
