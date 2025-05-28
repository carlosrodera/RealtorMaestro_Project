import { Transformation } from "@shared/schema";
import { formatDate } from "@/lib/utils";
import {
  Edit,
  Eye,
  Download,
  Clock,
  AlertCircle,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useState } from "react";
import { ImageComparisonSlider } from "@/components/ui/image-comparison-slider";
import { useTransformations } from "@/hooks/use-transformations";

interface TransformationItemProps {
  transformation: Transformation;
}

export function TransformationItem({ transformation }: TransformationItemProps) {
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { deleteTransformation } = useTransformations();

  const isCompleted = transformation.status === "completed";
  const isFailed = transformation.status === "failed" || transformation.status === "error";
  const isPending = transformation.status === "pending" || transformation.status === "processing";

  const handleDelete = () => {
    deleteTransformation.mutate(transformation.id);
    setIsDeleteDialogOpen(false);
  };

  // Calcular el tiempo transcurrido si está en procesamiento
  const getElapsedTime = () => {
    if (!transformation.createdAt) return null;
    const createdTime = new Date(transformation.createdAt).getTime();
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - createdTime) / 1000);

    if (elapsedSeconds < 60) {
      return `${elapsedSeconds}s`;
    } else {
      const minutes = Math.floor(elapsedSeconds / 60);
      const seconds = elapsedSeconds % 60;
      return `${minutes}m ${seconds}s`;
    }
  };

  return (
    <>
      <div className="p-4 hover:bg-gray-50">
        <div className="flex items-center space-x-4">
          {isPending ? (
            <div className="h-16 w-16 rounded-md bg-gray-200 animate-pulse flex-shrink-0"></div>
          ) : isFailed ? (
            <div className="h-16 w-16 rounded-md bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          ) : (
            <img
              src={transformation.transformedImagePath || "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80"}
              alt={transformation.name || "Transformed image"}
              className="h-16 w-16 rounded-md object-cover flex-shrink-0"
            />
          )}

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {transformation.name || "Transformación"}
            </p>
            <div className="flex items-center text-sm text-gray-500">
              <span>Estilo: {transformation.style}</span>
              {isPending && (
                <span className="ml-2 inline-flex items-center bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
                  <span className="animate-spin mr-1">&#9696;</span>
                  Procesando {getElapsedTime() && `(${getElapsedTime()})`}
                </span>
              )}
              {isPending && transformation.createdAt && (
                <span className="ml-2 text-xs text-gray-500">
                  Esperando webhook (máx. 5 min)
                </span>
              )}
              {isFailed && (
                <span className="ml-2 inline-flex items-center bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {transformation.errorMessage || "Error"}
                </span>
              )}
            </div>
            {transformation.createdAt && (
              <p className="text-xs text-gray-500 flex items-center mt-1">
                <Clock className="h-3 w-3 mr-1" />
                {formatDate(transformation.createdAt)}
              </p>
            )}
          </div>

          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" disabled={!isCompleted}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" disabled={!isCompleted} onClick={() => setIsViewDialogOpen(true)}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" disabled={!isCompleted}>
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Diálogo de vista previa - solo para transformaciones completadas */}
      {isCompleted && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent
            className="sm:max-w-3xl"
            aria-describedby="transformation-preview-info"
          >
            <DialogHeader>
              <DialogTitle>{transformation.name || "Vista previa de transformación"}</DialogTitle>
              <div id="transformation-preview-info" className="sr-only">
                Vista detallada de la imagen inmobiliaria transformada con herramientas de comparación
              </div>
            </DialogHeader>

            <div className="mt-4">
              <ImageComparisonSlider
                beforeImage={transformation.originalImagePath || "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=600&q=80"}
                afterImage={transformation.transformedImagePath || "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=600&q=80"}
                height={400}
              />
            </div>

            <div className="mt-4 bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Detalles</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Estilo: {transformation.style} |
                    {transformation.processingTimeMs && ` Procesamiento: ${transformation.processingTimeMs / 1000}s`}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <i className="ri-refresh-line mr-1.5"></i>
                    Regenerar
                  </Button>
                  <Button size="sm">
                    <i className="ri-download-line mr-1.5"></i>
                    Descargar
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Diálogo de confirmación para eliminar - para todos los estados */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente esta transformación
              {isPending && " aunque esté en proceso de transformación"}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
