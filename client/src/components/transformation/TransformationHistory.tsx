import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ImageComparisonSlider } from '@/components/ui/image-comparison-slider';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Download, 
  Trash2, 
  Eye, 
  EyeOff,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { StoredTransformation } from '@/lib/localStorage';
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
import { useTransformations } from '@/hooks/use-transformations';

interface TransformationHistoryProps {
  transformations: StoredTransformation[];
  onDelete?: (id: string) => void;
}

export function TransformationHistory({ transformations, onDelete }: TransformationHistoryProps) {
  const [selectedTransformation, setSelectedTransformation] = useState<StoredTransformation | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { deleteTransformation } = useTransformations();
  
  const handleDownload = (transformation: StoredTransformation) => {
    if (!transformation.transformedImage) return;
    
    // Create download link
    const link = document.createElement('a');
    link.href = transformation.transformedImage;
    link.download = `transformacion_${transformation.id}_${new Date().getTime()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      await deleteTransformation.mutateAsync(deleteId);
      setDeleteId(null);
      if (onDelete) {
        onDelete(deleteId);
      }
    } catch (error) {
      console.error('Error deleting transformation:', error);
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
      case 'pending':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completada';
      case 'failed':
        return 'Error';
      case 'processing':
        return 'Procesando';
      case 'pending':
        return 'Pendiente';
      default:
        return status;
    }
  };
  
  const getStyleName = (style: string) => {
    const styles: Record<string, string> = {
      modern: 'Moderno',
      luxury: 'Lujo',
      minimalist: 'Minimalista',
      rustic: 'Rústico',
      industrial: 'Industrial',
      nordic: 'Nórdico',
      mediterranean: 'Mediterráneo',
      vintage: 'Vintage',
      custom: 'Personalizado'
    };
    return styles[style] || style;
  };
  
  if (transformations.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="text-gray-500">
            <p className="text-lg font-medium mb-2">No hay transformaciones</p>
            <p className="text-sm">Las transformaciones que realices aparecerán aquí</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {transformations.map((transformation) => (
          <Card key={transformation.id} className="overflow-hidden">
            <div className="aspect-video relative bg-gray-100">
              {transformation.originalImage && transformation.originalImage !== 'processing' ? (
                <img
                  src={transformation.originalImage}
                  alt="Original"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Procesando imagen...</p>
                  </div>
                </div>
              )}
              {transformation.status === 'completed' && transformation.transformedImage && (
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => setSelectedTransformation(transformation)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              <div className="absolute bottom-2 left-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  {getStatusIcon(transformation.status)}
                  {getStatusText(transformation.status)}
                </Badge>
              </div>
            </div>
            
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {getStyleName(transformation.style)}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(transformation.createdAt), { 
                      addSuffix: true,
                      locale: es 
                    })}
                  </span>
                </div>
                
                {transformation.customPrompt && (
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {transformation.customPrompt}
                  </p>
                )}
                
                <div className="flex gap-2 pt-2">
                  {transformation.status === 'completed' && transformation.transformedImage && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(transformation)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Descargar
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteId(transformation.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Comparison Modal */}
      {selectedTransformation && selectedTransformation.transformedImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Comparación de transformación</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedTransformation(null)}
              >
                <EyeOff className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <ImageComparisonSlider
                before={selectedTransformation.originalImage}
                after={selectedTransformation.transformedImage}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La transformación será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}