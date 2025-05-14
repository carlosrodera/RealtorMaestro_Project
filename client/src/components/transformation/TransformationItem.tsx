import { Transformation } from "@shared/schema";
import { formatDate } from "@/lib/utils";
import { 
  Edit, 
  Eye, 
  Download,
  Clock,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { ImageComparisonSlider } from "@/components/ui/image-comparison-slider";

interface TransformationItemProps {
  transformation: Transformation;
}

export function TransformationItem({ transformation }: TransformationItemProps) {
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  const isCompleted = transformation.status === "completed";
  const isFailed = transformation.status === "failed";
  const isPending = transformation.status === "pending" || transformation.status === "processing";
  
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
                  <span className="animate-spin mr-1">&#9696;</span> Procesando
                </span>
              )}
              {isFailed && (
                <span className="ml-2 inline-flex items-center bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">
                  Error
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
          </div>
        </div>
      </div>
      
      {isCompleted && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>{transformation.name || "Vista previa de transformación"}</DialogTitle>
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
    </>
  );
}
