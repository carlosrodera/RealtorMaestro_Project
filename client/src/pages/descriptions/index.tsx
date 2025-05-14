import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { DescriptionGenerator } from '@/components/description/DescriptionGenerator';
import { useDescriptions } from '@/hooks/use-descriptions';
import { useProjects } from '@/hooks/use-projects';
import { 
  PlusCircle, 
  Search, 
  FileText,
  Briefcase,
  Filter,
  CheckCircle2,
  Clock,
  Edit,
  Copy
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDate } from '@/lib/utils';

export default function Descriptions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showDescriptionGenerator, setShowDescriptionGenerator] = useState(false);
  
  const { descriptions, isLoading } = useDescriptions();
  const { projects, isLoading: isLoadingProjects } = useProjects();
  
  // Filter descriptions based on search term, project, and status
  const filteredDescriptions = descriptions?.filter(description => {
    const matchesSearch = description.name 
      ? description.name.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    
    const matchesProject = selectedProject === 'all' || 
      (description.projectId && description.projectId.toString() === selectedProject);
    
    const matchesStatus = selectedStatus === 'all' || description.status === selectedStatus;
    
    return matchesSearch && matchesProject && matchesStatus;
  });
  
  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Generación de Descripciones</h1>
          <p className="mt-1 text-sm text-gray-500">
            Crea descripciones profesionales y persuasivas con inteligencia artificial
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button onClick={() => setShowDescriptionGenerator(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Nueva Descripción
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
              placeholder="Buscar descripciones..."
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
                  <div className="flex-1 min-w-0">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-1" />
                    <Skeleton className="h-4 w-full mt-2" />
                  </div>
                  <div className="flex space-x-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </div>
              </li>
            ))
          ) : filteredDescriptions && filteredDescriptions.length > 0 ? (
            // Description list
            filteredDescriptions.map(description => (
              <li key={description.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {description.name || "Descripción"}
                    </h3>
                    <div className="flex items-center mt-1">
                      <p className="text-xs text-gray-500 mr-2 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDate(description.createdAt)}
                      </p>
                      <div className="flex items-center text-xs space-x-2">
                        <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                          {description.tone === 'professional' ? 'Profesional' : 
                           description.tone === 'emotional' ? 'Emocional' : 
                           description.tone === 'minimalist' ? 'Minimalista' : 
                           description.tone === 'detailed' ? 'Detallado' : 'Estándar'}
                        </span>
                        <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                          {description.lengthOption === 'short' ? 'Corta' : 
                           description.lengthOption === 'medium' ? 'Media' : 'Larga'}
                        </span>
                        <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                          {description.language === 'es' ? 'Español' : 
                           description.language === 'en' ? 'Inglés' : 
                           description.language === 'fr' ? 'Francés' : 
                           description.language === 'de' ? 'Alemán' : 'Español'}
                        </span>
                      </div>
                      {description.status === 'pending' && (
                        <span className="ml-2 inline-flex items-center bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
                          <span className="animate-spin mr-1">&#9696;</span> Procesando
                        </span>
                      )}
                      {description.status === 'failed' && (
                        <span className="ml-2 inline-flex items-center bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">
                          Error
                        </span>
                      )}
                    </div>
                    {description.generatedText && description.status === 'completed' && (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {description.generatedText}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon" disabled={description.status !== 'completed'}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" disabled={description.status !== 'completed'}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </li>
            ))
          ) : (
            // Empty state
            <li className="p-8 text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                <FileText className="h-6 w-6 text-gray-400" />
              </div>
              {searchTerm || selectedProject !== 'all' || selectedStatus !== 'all' ? (
                <>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">No se encontraron descripciones</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Prueba a cambiar los filtros de búsqueda
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">No hay descripciones</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Crea tu primera descripción de propiedad
                  </p>
                  <Button onClick={() => setShowDescriptionGenerator(true)}>
                    Nueva Descripción
                  </Button>
                </>
              )}
            </li>
          )}
        </ul>
      </Card>
      
      {/* Tips and Help section */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Consejos para descripciones efectivas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Proporciona detalles completos</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Cuantos más datos proporciones sobre la propiedad, más precisas serán las descripciones.
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Selecciona el tono adecuado</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Elige un tono que se adapte al tipo de propiedad y al público objetivo.
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Incluye imágenes de referencia</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Las imágenes ayudan a la IA a entender y describir mejor los espacios.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      {/* Description Generator */}
      <DescriptionGenerator
        isOpen={showDescriptionGenerator}
        onClose={() => setShowDescriptionGenerator(false)}
      />
    </div>
  );
}
