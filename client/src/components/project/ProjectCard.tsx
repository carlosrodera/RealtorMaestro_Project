import { useState } from "react";
import { Link } from "wouter";
import { StoredProject } from "@/lib/localStorage";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Edit, 
  Trash2, 
  MoreVertical,
  Home,
  Clock
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useProjects } from "@/hooks/use-projects";

interface ProjectCardProps {
  project: StoredProject;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { deleteProject } = useProjects();
  
  const handleDelete = async () => {
    await deleteProject.mutateAsync(project.id);
    setIsDeleteDialogOpen(false);
  };
  
  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-900 truncate mb-1">
                {project.name}
              </h3>
              <p className="text-sm text-gray-500 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Creado el {formatDate(project.createdAt)}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Edit className="h-4 w-4 mr-2" />
                  <span>Editar</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  <span>Eliminar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {project.description && (
            <p className="mt-2 text-sm text-gray-600">{project.description}</p>
          )}
          
          <div className="mt-4 flex items-center space-x-4">
            <div className="text-sm flex items-center">
              <i className="ri-image-2-line text-gray-400 mr-1"></i>
              <span>3 imágenes</span>
            </div>
            <div className="text-sm flex items-center">
              <i className="ri-file-text-line text-gray-400 mr-1"></i>
              <span>1 descripción</span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="px-6 py-4 bg-gray-50 flex justify-between">
          <div className="text-sm flex items-center text-gray-500">
            <Home className="h-4 w-4 mr-1" />
            <span>{project.id === 1 ? "Piso" : "Casa"}</span>
          </div>
          <Link href={`/projects/${project.id}`}>
            <Button variant="outline" size="sm">
              Ver proyecto
            </Button>
          </Link>
        </CardFooter>
      </Card>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán todas las transformaciones y descripciones asociadas a este proyecto.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
