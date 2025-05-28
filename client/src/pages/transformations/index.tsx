import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TransformationHistory } from '@/components/transformation/TransformationHistory';
import { TransformationEditor } from '@/components/transformation/TransformationEditor';
import { useTransformations } from '@/hooks/use-transformations';
import { useAuth } from '@/hooks/use-auth';
import { creditsStorage } from '@/lib/localStorage';
import { 
  PlusCircle, 
  Image,
  Sparkles,
  CreditCard
} from 'lucide-react';

export default function Transformations() {
  const [showTransformEditor, setShowTransformEditor] = useState(false);
  const { transformations, isLoading } = useTransformations();
  const { user } = useAuth();
  const credits = creditsStorage.get();
  
  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transformaciones de Imágenes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Utiliza la inteligencia artificial para transformar tus imágenes inmobiliarias
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <CreditCard className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">
              {credits} créditos restantes
            </span>
          </div>
          <Button 
            onClick={() => setShowTransformEditor(true)}
            disabled={credits <= 0}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Nueva Transformación
          </Button>
        </div>
      </div>
      
      {/* Credits Warning */}
      {credits <= 0 && (
        <Card className="p-4 mb-6 bg-yellow-50 border-yellow-200">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-yellow-900">
                No tienes créditos disponibles
              </p>
              <p className="text-sm text-yellow-700">
                Actualiza tu plan para continuar transformando imágenes
              </p>
            </div>
          </div>
        </Card>
      )}
      
      {/* Transformation History */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Historial de Transformaciones
        </h2>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <TransformationHistory transformations={transformations || []} />
        )}
      </div>
      
      {/* Tips and Help section */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Consejos para mejores resultados
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Image className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">
                  Usa imágenes de alta calidad
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Las fotografías con buena iluminación y resolución producen mejores resultados.
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">
                  Marca las áreas importantes
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Usa el pincel para indicar qué áreas quieres transformar o preservar.
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <PlusCircle className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">
                  Sé específico en tu prompt
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Describe claramente lo que quieres lograr para obtener mejores resultados.
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