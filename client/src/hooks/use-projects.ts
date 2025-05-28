import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsStorage, StoredProject } from "@/lib/localStorage";
import { ProjectData } from "@/types";
import { useToast } from "@/hooks/use-toast";

export function useProjects() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all projects from localStorage
  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100));
      return projectsStorage.getAll();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch a single project
  const useProject = (id: string) => {
    return useQuery({
      queryKey: ["projects", id],
      queryFn: async () => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 100));
        const project = projectsStorage.get(id);
        if (!project) {
          throw new Error("Proyecto no encontrado");
        }
        return project;
      },
      enabled: !!id,
    });
  };

  // Create a new project
  const createProject = useMutation({
    mutationFn: async (projectData: ProjectData) => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      return projectsStorage.create(projectData.name, projectData.description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
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
    mutationFn: async ({ id, data }: { id: string; data: Partial<StoredProject> }) => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      const updated = projectsStorage.update(id, data);
      if (!updated) {
        throw new Error("Proyecto no encontrado");
      }
      return updated;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects", variables.id] });
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
    mutationFn: async (id: string) => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      const success = projectsStorage.delete(id);
      if (!success) {
        throw new Error("Proyecto no encontrado");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
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