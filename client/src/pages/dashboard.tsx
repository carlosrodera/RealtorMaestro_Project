import React from 'react';
import { Doughnut, Bar } from 'react-chartjs-chart';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useProjects } from '@/hooks/use-projects';
import { useTransformations } from '@/hooks/use-transformations';
import { useDescriptions } from '@/hooks/use-descriptions';
import { formatDate } from '@/lib/utils';
import { 
  PlusCircle, 
  Briefcase, 
  Image, 
  FileText,
  BarChart, 
  PieChart,
  ArrowUpRight,
  Building,
  CalendarDays,
  Layers
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { user } = useAuth();
  const { projects, isLoading: isLoadingProjects } = useProjects();
  const { transformations, isLoading: isLoadingTransformations } = useTransformations();
  const { descriptions, isLoading: isLoadingDescriptions } = useDescriptions();
  
  // Calculate stats
  const projectCount = projects?.length || 0;
  const transformationCount = transformations?.length || 0;
  const descriptionCount = descriptions?.length || 0;
  
  // Get recent items
  const recentProjects = projects?.slice(0, 3) || [];
  const recentTransformations = transformations?.slice(0, 3) || [];
  const recentDescriptions = descriptions?.slice(0, 3) || [];
  
  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Bienvenido, {user?.fullName || user?.username}</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Link href="/projects/new">
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Nuevo Proyecto
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Proyectos</p>
                {isLoadingProjects ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-3xl font-bold text-gray-900">{projectCount}</p>
                )}
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link href="/projects">
                <Button variant="link" className="p-0 h-auto text-blue-600">
                  Ver todos los proyectos
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Transformaciones</p>
                {isLoadingTransformations ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-3xl font-bold text-gray-900">{transformationCount}</p>
                )}
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Image className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link href="/transformations">
                <Button variant="link" className="p-0 h-auto text-purple-600">
                  Ver todas las transformaciones
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Descripciones</p>
                {isLoadingDescriptions ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-3xl font-bold text-gray-900">{descriptionCount}</p>
                )}
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link href="/descriptions">
                <Button variant="link" className="p-0 h-auto text-green-600">
                  Ver todas las descripciones
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>
              Accede rápidamente a las funciones principales de Realtor360
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/transformations/new">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center">
                  <Image className="h-6 w-6 mb-2" />
                  <span className="text-sm">Nueva Transformación</span>
                </Button>
              </Link>
              <Link href="/descriptions/new">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center">
                  <FileText className="h-6 w-6 mb-2" />
                  <span className="text-sm">Nueva Descripción</span>
                </Button>
              </Link>
              <Link href="/projects">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center">
                  <Briefcase className="h-6 w-6 mb-2" />
                  <span className="text-sm">Gestionar Proyectos</span>
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center">
                  <Layers className="h-6 w-6 mb-2" />
                  <span className="text-sm">Mi Suscripción</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Plan Actual</CardTitle>
            <CardDescription>
              Detalles de tu suscripción y recursos disponibles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {user?.plan === 'free' ? 'Plan Gratuito' : 'Plan Profesional'}
                </p>
                <p className="text-sm text-gray-500">
                  {user?.plan === 'free' ? 'Características limitadas' : 'Todas las características'}
                </p>
              </div>
              <div className="bg-green-100 text-green-800 py-1 px-3 rounded-full text-xs font-medium">
                Activo
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Transformaciones</p>
                <p className="text-sm font-medium">3 / 10 restantes</p>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="bg-primary h-full" style={{ width: '30%' }}></div>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-600">Descripciones</p>
                <p className="text-sm font-medium">1 / 5 restantes</p>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="bg-primary h-full" style={{ width: '20%' }}></div>
              </div>
              
              {user?.plan === 'free' && (
                <Button className="w-full mt-4">
                  Mejorar a Plan Profesional
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Projects */}
      <h2 className="text-lg font-medium text-gray-900 mb-4">Proyectos Recientes</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {isLoadingProjects ? (
          Array(3).fill(0).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : recentProjects.length > 0 ? (
          recentProjects.map((project) => (
            <Card key={project.id}>
              <CardContent className="p-6">
                <h3 className="text-base font-medium text-gray-900 mb-1">{project.name}</h3>
                <p className="text-sm text-gray-500 mb-4 flex items-center">
                  <CalendarDays className="h-4 w-4 mr-1" />
                  {formatDate(project.createdAt)}
                </p>
                <div className="flex items-center space-x-4">
                  <div className="text-sm flex items-center">
                    <i className="ri-image-2-line text-gray-400 mr-1"></i>
                    <span>3 imágenes</span>
                  </div>
                  <div className="text-sm flex items-center">
                    <i className="ri-file-text-line text-gray-400 mr-1"></i>
                    <span>1 descripción</span>
                  </div>
                </div>
                <div className="mt-4">
                  <Link href={`/projects/${project.id}`}>
                    <Button variant="outline" size="sm">Ver proyecto</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-3 flex items-center justify-center py-12 bg-gray-50 rounded-lg">
            <div className="text-center">
              <Briefcase className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <h3 className="text-base font-medium text-gray-900">No hay proyectos</h3>
              <p className="text-sm text-gray-500 mt-1">Comienza creando tu primer proyecto</p>
              <Link href="/projects/new">
                <Button className="mt-4">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Nuevo Proyecto
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
      
      {/* Recent Activity */}
      <h2 className="text-lg font-medium text-gray-900 mb-4">Actividad Reciente</h2>
      <Card className="mb-8">
        <CardContent className="p-0">
          <ul className="divide-y divide-gray-200">
            {isLoadingTransformations || isLoadingDescriptions ? (
              Array(5).fill(0).map((_, i) => (
                <li key={i} className="p-4">
                  <div className="flex items-center">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="ml-3 flex-1">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/3 mt-1" />
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <>
                {transformations && transformations.slice(0, 3).map((transformation) => (
                  <li key={`transform-${transformation.id}`} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <Image className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          Nueva transformación: {transformation.name || "Transformación"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(transformation.createdAt)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
                
                {descriptions && descriptions.slice(0, 2).map((description) => (
                  <li key={`desc-${description.id}`} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          Nueva descripción: {description.name || "Descripción"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(description.createdAt)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
                
                {projects && projects.slice(0, 1).map((project) => (
                  <li key={`project-${project.id}`} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Briefcase className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          Nuevo proyecto: {project.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(project.createdAt)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
                
                {transformations?.length === 0 && descriptions?.length === 0 && projects?.length === 0 && (
                  <li className="p-8 text-center">
                    <p className="text-gray-500">No hay actividad reciente</p>
                  </li>
                )}
              </>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
