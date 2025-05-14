import React, { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProjectCard } from '@/components/project/ProjectCard';
import { CreateProject } from '@/components/project/CreateProject';
import { useProjects } from '@/hooks/use-projects';
import { PlusCircle, Search, Briefcase } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Projects() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateProject, setShowCreateProject] = useState(false);
  const { projects, isLoading } = useProjects();
  
  // Filter projects based on search term
  const filteredProjects = projects?.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Proyectos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona todos tus proyectos inmobiliarios
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button onClick={() => setShowCreateProject(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Nuevo Proyecto
          </Button>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Buscar proyectos..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          // Skeleton loader
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-white shadow rounded-lg">
              <div className="p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-8 w-24 mt-4" />
              </div>
            </div>
          ))
        ) : filteredProjects && filteredProjects.length > 0 ? (
          // Project list
          filteredProjects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))
        ) : (
          // Empty state
          <div className="col-span-1 md:col-span-2 lg:col-span-3 flex items-center justify-center py-12 bg-gray-50 rounded-lg">
            <div className="text-center">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              {searchTerm ? (
                <>
                  <h3 className="text-lg font-medium text-gray-900">No se encontraron proyectos</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    No hay resultados para "{searchTerm}". Intenta con otra búsqueda.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium text-gray-900">No hay proyectos</h3>
                  <p className="text-sm text-gray-500 mt-1">Comienza creando tu primer proyecto</p>
                  <Button className="mt-4" onClick={() => setShowCreateProject(true)}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Nuevo Proyecto
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      
      <CreateProject isOpen={showCreateProject} onClose={() => setShowCreateProject(false)} />
    </div>
  );
}
