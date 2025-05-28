import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/hooks/use-projects";
import { PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { CreateProject } from "@/components/project/CreateProject";

interface SidebarProps {
  isOpen: boolean;
}

export default function Sidebar({ isOpen }: SidebarProps) {
  const [location] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateProject, setShowCreateProject] = useState(false);
  const { projects, isLoading } = useProjects();
  
  // Filter projects based on search term
  const filteredProjects = projects?.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <>
      <aside 
        className={cn(
          "lg:block w-64 border-r border-gray-200 bg-white overflow-y-auto transition-all duration-300",
          isOpen ? "block" : "hidden"
        )}
      >
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Mis Proyectos</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowCreateProject(true)}
              className="p-1 rounded-md hover:bg-gray-100"
            >
              <PlusIcon className="h-5 w-5 text-primary" />
            </Button>
          </div>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="ri-search-line text-gray-400"></i>
              </div>
              <Input
                type="text"
                placeholder="Buscar proyectos"
                className="pl-10 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="mt-4 space-y-2">
              {isLoading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-10 bg-gray-200 rounded-md"></div>
                  <div className="h-10 bg-gray-200 rounded-md"></div>
                  <div className="h-10 bg-gray-200 rounded-md"></div>
                </div>
              ) : filteredProjects?.length === 0 ? (
                <div className="text-center py-4 text-sm text-gray-500">
                  No hay proyectos
                </div>
              ) : (
                filteredProjects?.map((project) => (
                  <Link key={project.id} href={`/projects/${project.id}`}>
                    <div
                      className={cn(
                        "block px-3 py-2 rounded-md cursor-pointer",
                        location === `/projects/${project.id}`
                          ? "bg-primary-50 text-primary-700 font-medium"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span>{project.name}</span>
                        <span
                          className={cn(
                            "py-0.5 px-2 rounded-full text-xs",
                            location === `/projects/${project.id}`
                              ? "bg-primary-100 text-primary-800"
                              : "bg-gray-100 text-gray-600"
                          )}
                        >
                          {location === `/projects/${project.id}` ? "Activo" : "3 imgs"}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
        
        <div className="px-6 pt-2 pb-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Herramientas
          </h3>
          <nav className="mt-2">
            <Link href="/transformations">
              <div className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-50 cursor-pointer">
                <i className="ri-image-edit-line mr-3 text-gray-400 group-hover:text-gray-500"></i>
                Transformación de Imágenes
              </div>
            </Link>
            <Link href="/descriptions">
              <div className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-50 cursor-pointer">
                <i className="ri-file-edit-line mr-3 text-gray-400 group-hover:text-gray-500"></i>
                Generación de Descripciones
              </div>
            </Link>
            <div className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-400 cursor-not-allowed">
              <i className="ri-presentation-line mr-3 text-gray-400"></i>
              Modo Presentación (Próximamente)
            </div>
          </nav>
        </div>
        
        <div className="px-6 pt-2 pb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Configuración
          </h3>
          <nav className="mt-2">
            <Link href="/pricing">
              <div className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-50 cursor-pointer">
                <i className="ri-user-settings-line mr-3 text-gray-400 group-hover:text-gray-500"></i>
                Perfil y Cuenta
              </div>
            </Link>
            <Link href="/pricing">
              <div className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-50 cursor-pointer">
                <i className="ri-bank-card-line mr-3 text-gray-400 group-hover:text-gray-500"></i>
                Planes y Créditos
              </div>
            </Link>
            <div className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-400 cursor-not-allowed">
              <i className="ri-question-line mr-3 text-gray-400"></i>
              Ayuda y Soporte (Próximamente)
            </div>
          </nav>
        </div>
      </aside>
      
      <CreateProject isOpen={showCreateProject} onClose={() => setShowCreateProject(false)} />
    </>
  );
}
