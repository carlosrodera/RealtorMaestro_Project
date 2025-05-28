import React, { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TransformationItem } from '@/components/transformation/TransformationItem';
import { TransformationEditor } from '@/components/transformation/TransformationEditor';
import { DescriptionGenerator } from '@/components/description/DescriptionGenerator';
import { useProjects } from '@/hooks/use-projects';
import { useTransformations } from '@/hooks/use-transformations';
import { useDescriptions } from '@/hooks/use-descriptions';
import { formatDate } from '@/lib/utils';
import { 
  PencilIcon, 
  Share2, 
  Presentation, 
  PlusCircle,
  Edit, 
  Eye, 
  Download, 
  FileText,
  Copy,
  Clock,
  Home
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ProjectDetailsProps {
  id: string;
}

export default function ProjectDetails({ id }: ProjectDetailsProps) {
  const projectId = id; // Now using string IDs
  const [showTransformEditor, setShowTransformEditor] = useState(false);
  const [showDescriptionGenerator, setShowDescriptionGenerator] = useState(false);
  
  const { useProject } = useProjects();
  const { transformations, isLoading: isLoadingTransformations } = useTransformations(projectId);
  const { descriptions, isLoading: isLoadingDescriptions } = useDescriptions(projectId);
  
  const { data: project, isLoading: isLoadingProject } = useProject(projectId);
  
  const handleShare = () => {
    // Implementation for sharing functionality
    alert('Funcionalidad de compartir en desarrollo');
  };
  
  const handlePresentation = () => {
    // Implementation for presentation mode
    alert('Funcionalidad de presentación en desarrollo');
  };
  
  if (isLoadingProject) {
    return (
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-1/3 mb-2" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <Skeleton className="h-6 w-1/3 mb-4" />
            <Card>
              <div className="p-4 border-b">
                <Skeleton className="h-16 w-full" />
              </div>
              <div className="p-4 border-b">
                <Skeleton className="h-16 w-full" />
              </div>
              <div className="p-4">
                <Skeleton className="h-16 w-full" />
              </div>
            </Card>
          </div>
          
          <div>
            <Skeleton className="h-6 w-1/3 mb-4" />
            <Card>
              <div className="p-4 border-b">
                <Skeleton className="h-16 w-full" />
              </div>
              <div className="p-4">
                <Skeleton className="h-28 w-full" />
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }
  
  if (!project) {
    return (
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Proyecto no encontrado</h2>
          <p className="text-gray-500 mb-6">El proyecto que estás buscando no existe o no tienes permisos para acceder a él.</p>
          <Link href="/projects">
            <Button>Volver a Proyectos</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      {/* Project Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8">
        <div>
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <button className="ml-2 text-gray-400 hover:text-gray-500">
              <PencilIcon className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-1 text-sm text-gray-500">Creado el {formatDate(project.createdAt)}</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Compartir
          </Button>
          <Button onClick={handlePresentation}>
            <Presentation className="h-4 w-4 mr-2" />
            Presentación
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transformaciones */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Transformaciones de Imágenes</h2>
            <Button variant="outline" size="icon" onClick={() => setShowTransformEditor(true)}>
              <PlusCircle className="h-5 w-5" />
            </Button>
          </div>
          
          <Card>
            <ul role="list" className="divide-y divide-gray-200">
              {isLoadingTransformations ? (
                // Skeleton loader
                Array(3).fill(0).map((_, i) => (
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
              ) : transformations && transformations.length > 0 ? (
                // Transformation list
                transformations.map(transformation => (
                  <TransformationItem key={transformation.id} transformation={transformation} />
                ))
              ) : (
                // Empty state
                <li className="p-8 text-center">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                    <PlusCircle className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">No hay transformaciones</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Crea tu primera transformación de imagen para este proyecto
                  </p>
                  <Button onClick={() => setShowTransformEditor(true)}>
                    Nueva Transformación
                  </Button>
                </li>
              )}
            </ul>
          </Card>
        </div>
        
        {/* Descripción */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Descripción de la Propiedad</h2>
            <Button variant="outline" size="icon" onClick={() => setShowDescriptionGenerator(true)}>
              <PlusCircle className="h-5 w-5" />
            </Button>
          </div>
          
          {isLoadingDescriptions ? (
            // Skeleton loader
            <Card>
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-1/3" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </div>
                <div className="flex items-center mt-1 space-x-2">
                  <Skeleton className="h-4 w-16 rounded-full" />
                  <Skeleton className="h-4 w-16 rounded-full" />
                  <Skeleton className="h-4 w-16 rounded-full" />
                </div>
              </div>
              <div className="p-4">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </Card>
          ) : descriptions && descriptions.length > 0 ? (
            // Description content
            <Card>
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between">
                  <h3 className="text-sm font-medium text-gray-900">
                    {descriptions[0].name || 'Descripción Principal'}
                  </h3>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center mt-1 text-xs text-gray-500 space-x-2">
                  <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                    {descriptions[0].tone === 'professional' ? 'Profesional' : 
                     descriptions[0].tone === 'emotional' ? 'Emocional' : 
                     descriptions[0].tone === 'minimalist' ? 'Minimalista' : 
                     descriptions[0].tone === 'detailed' ? 'Detallado' : 'Estándar'}
                  </span>
                  <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                    {descriptions[0].lengthOption === 'short' ? 'Corta' : 
                     descriptions[0].lengthOption === 'medium' ? 'Media' : 'Larga'}
                  </span>
                  <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                    {descriptions[0].language === 'es' ? 'Español' : 
                     descriptions[0].language === 'en' ? 'Inglés' : 
                     descriptions[0].language === 'fr' ? 'Francés' : 
                     descriptions[0].language === 'de' ? 'Alemán' : 'Español'}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="text-sm text-gray-600 whitespace-pre-wrap">
                  {descriptions[0].generatedText || 
                    "Descubra este exclusivo piso completamente reformado en el corazón de Malasaña, uno de los barrios más vibrantes y con más personalidad de Madrid. Con 85 m² distribuidos en 2 amplios dormitorios y 2 baños completos, esta propiedad combina a la perfección el encanto del Madrid tradicional con toques contemporáneos.\n\nEl salón principal, bañado de luz natural gracias a sus ventanales orientados al este, cuenta con suelos de madera natural y una moderna chimenea que añade un toque acogedor. La cocina, totalmente equipada con electrodomésticos de alta gama, presenta un diseño minimalista con acabados en blanco y una práctica isla central, perfecta para los amantes de la gastronomía.\n\nEl dormitorio principal es un verdadero remanso de paz con su vestidor integrado y baño en suite con ducha efecto lluvia. A escasos minutos a pie encontrará todos los servicios, incluyendo el Metro de Tribunal, innumerables comercios, restaurantes de moda y la emblemática Gran Vía."}
                </div>
              </div>
            </Card>
          ) : (
            // Empty state
            <Card className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                <FileText className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">No hay descripciones</h3>
              <p className="text-sm text-gray-500 mb-4">
                Genera una descripción profesional para tu propiedad
              </p>
              <Button onClick={() => setShowDescriptionGenerator(true)}>
                Nueva Descripción
              </Button>
            </Card>
          )}
          
          {descriptions && descriptions.length > 0 && (
            <Card className="mt-6">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">Detalles de la Propiedad</h3>
              </div>
              <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="flex items-center space-x-2">
                    <Home className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Tipo: {descriptions[0].propertyData.propertyType || 'Piso'}</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <i className="ri-ruler-line text-gray-400"></i>
                    <span className="text-gray-600">Superficie: {descriptions[0].propertyData.area || 85} m²</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <i className="ri-hotel-bed-line text-gray-400"></i>
                    <span className="text-gray-600">Dormitorios: {descriptions[0].propertyData.bedrooms || 2}</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <i className="ri-contrast-drop-line text-gray-400"></i>
                    <span className="text-gray-600">Baños: {descriptions[0].propertyData.bathrooms || 2}</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <i className="ri-building-line text-gray-400"></i>
                    <span className="text-gray-600">Año: {descriptions[0].propertyData.yearBuilt || '1950'}</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <i className="ri-map-pin-line text-gray-400"></i>
                    <span className="text-gray-600">Zona: {descriptions[0].propertyData.zone || 'Malasaña'}</span>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
      
      {/* Transformation Editor */}
      <TransformationEditor 
        isOpen={showTransformEditor} 
        onClose={() => setShowTransformEditor(false)} 
        projectId={projectId}
      />
      
      {/* Description Generator */}
      <DescriptionGenerator 
        isOpen={showDescriptionGenerator} 
        onClose={() => setShowDescriptionGenerator(false)} 
        projectId={projectId}
      />
    </div>
  );
}
