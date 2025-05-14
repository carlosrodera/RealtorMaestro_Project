import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TransformationItem } from '@/components/transformation/TransformationItem';
import { TransformationEditor } from '@/components/transformation/TransformationEditor';
import { useTransformations } from '@/hooks/use-transformations';
import { useProjects } from '@/hooks/use-projects';
import { 
  PlusCircle, 
  Search, 
  Image,
  Briefcase,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Transformations() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showTransformEditor, setShowTransformEditor] = useState(false);
  
  const { transformations, isLoading } = useTransformations();
  const { projects, isLoading: isLoadingProjects } = useProjects();
  
  // Filter transformations based on search term, project, and status
  const filteredTransformations = transformations?.filter(transformation => {
    const matchesSearch = transformation.name 
      ? transformation.name.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    
    const matchesProject = selectedProject === 'all' || 
      (transformation.projectId && transformation.projectId.toString() === selectedProject);
    
    const matchesStatus = selectedStatus === 'all' || transformation.status === selectedStatus;
    
    return matchesSearch && matchesProject && matchesStatus;
  });
  
  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transformaciones de Imágenes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Utiliza la inteligencia artificial para transformar tus imágenes inmobiliarias
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button onClick={() => setShowTransformEditor(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Nueva Transformación
          </Button>
        </div>
      </div>
      
      <div className="mb-6 grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Buscar transformaciones..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="md:col-span-3">
          <Select 
            value={selectedProject} 
            onValueChange={setSelectedProject}
          >
            <SelectTrigger>
              <div className="flex items-center">
                <Briefcase className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Todos los proyectos" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los proyectos</SelectItem>
              {!isLoadingProjects && projects?.map(project => (
                <SelectItem key={project.id} value={project.id.toString()}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="md:col-span-3">
          <Select 
            value={selectedStatus} 
            onValueChange={setSelectedStatus}
          >
            <SelectTrigger>
              <div className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Todos los estados" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="processing">En proceso</SelectItem>
              <SelectItem value="completed">Completado</SelectItem>
              <SelectItem value="failed">Fallido</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Card>
        <ul role="list" className="divide-y divide-gray-200">
          {isLoading ? (
            // Skeleton loader
            Array(5).fill(0).map((_, i) => (
              <li key={i} className="p-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-16 w-16 rounded-md" />
                  <div className="flex-1 min-w-0">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-1" />
                  </div>
                  <div className="flex space-x-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </div>
              </li>
            ))
          ) : filteredTransformations && filteredTransformations.length > 0 ? (
            // Transformation list
            filteredTransformations.map(transformation => (
              <TransformationItem key={transformation.id} transformation={transformation} />
            ))
          ) : (
            // Empty state
            <li className="p-8 text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                <Image className="h-6 w-6 text-gray-400" />
              </div>
              {searchTerm || selectedProject !== 'all' || selectedStatus !== 'all' ? (
                <>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">No se encontraron transformaciones</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Prueba a cambiar los filtros de búsqueda
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">No hay transformaciones</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Crea tu primera transformación de imagen
                  </p>
                  <Button onClick={() => setShowTransformEditor(true)}>
                    Nueva Transformación
                  </Button>
                </>
              )}
            </li>
          )}
        </ul>
      </Card>
      
      {/* Tips and Help section */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Consejos para mejores resultados</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Usa imágenes de alta calidad</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Las fotografías con buena iluminación y resolución producen mejores resultados.
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Usa las anotaciones</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Marca objetos a eliminar o áreas a preservar para mayor precisión.
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Elige el estilo adecuado</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Selecciona un estilo que se adapte al tipo de propiedad y público objetivo.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      {/* Transformation Editor */}
      <TransformationEditor 
        isOpen={showTransformEditor} 
        onClose={() => setShowTransformEditor(false)} 
      />
    </div>
  );
}
