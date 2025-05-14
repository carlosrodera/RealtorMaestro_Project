import React, { useState, useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { LoadingButton } from '@/components/ui/loading-button';
import { useToast } from '@/hooks/use-toast';
import { ImageComparisonSlider } from '@/components/ui/image-comparison-slider';
import { EditorTools } from '@/components/transformation/EditorTools';
import { StyleSelector } from '@/components/transformation/StyleSelector';
import { Textarea } from '@/components/ui/textarea';
import { TransformationData, ImageFile } from '@/types';
import { useTransformations } from '@/hooks/use-transformations';
import { Check, Upload, Edit2, Brush, Image as ImageIcon, ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

type Step = 'upload' | 'edit' | 'style' | 'result';

interface TransformationEditorProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: number;
}

export function TransformationEditor({ isOpen, onClose, projectId }: TransformationEditorProps) {
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [selectedStyle, setSelectedStyle] = useState('modern');
  const [customPrompt, setCustomPrompt] = useState('');
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [transformationId, setTransformationId] = useState<number | null>(null);
  const [brightness, setBrightness] = useState(50);
  const [contrast, setContrast] = useState(50);
  const [transformedImageUrl, setTransformedImageUrl] = useState('');
  const [originalImageUrl, setOriginalImageUrl] = useState('');
  const [transformationName, setTransformationName] = useState('');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { createTransformation, useTransformation } = useTransformations(projectId);
  const { toast } = useToast();
  
  const { data: transformation } = useTransformation(transformationId || 0);
  
  // Initialize canvas when editor opens
  useEffect(() => {
    if (isOpen && currentStep === 'edit' && canvasRef.current && !canvas) {
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        width: canvasContainerRef.current?.clientWidth || 800,
        height: 450,
        backgroundColor: '#f1f5f9'
      });
      setCanvas(fabricCanvas);
      
      // Add the selected image to canvas
      if (selectedImage) {
        fabric.Image.fromURL(selectedImage.preview, (img) => {
          // Scale image to fit canvas while maintaining aspect ratio
          const canvasWidth = fabricCanvas.getWidth();
          const canvasHeight = fabricCanvas.getHeight();
          
          const imgWidth = img.width || 0;
          const imgHeight = img.height || 0;
          
          const scaleFactor = Math.min(
            canvasWidth / imgWidth,
            canvasHeight / imgHeight
          );
          
          img.scale(scaleFactor);
          
          // Center the image on canvas
          img.set({
            left: (canvasWidth - imgWidth * scaleFactor) / 2,
            top: (canvasHeight - imgHeight * scaleFactor) / 2,
            selectable: false,
          });
          
          fabricCanvas.add(img);
          fabricCanvas.renderAll();
        });
      }
    }
    
    // Clean up canvas when component unmounts or step changes
    return () => {
      if (canvas && currentStep !== 'edit') {
        canvas.dispose();
        setCanvas(null);
      }
    };
  }, [isOpen, currentStep, selectedImage, canvas]);
  
  // Watch for transformation status changes
  useEffect(() => {
    if (transformation && transformation.status === 'completed' && transformation.transformedImagePath) {
      setTransformedImageUrl(transformation.transformedImagePath);
      setCurrentStep('result');
    }
  }, [transformation]);
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.includes('image/')) {
        toast({
          title: 'Error',
          description: 'Por favor, selecciona un archivo de imagen válido.',
          variant: 'destructive',
        });
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'Error',
          description: 'La imagen no debe superar los 10MB.',
          variant: 'destructive',
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage({
          file,
          preview: reader.result as string
        });
        setOriginalImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      // Validate file type
      if (!file.type.includes('image/')) {
        toast({
          title: 'Error',
          description: 'Por favor, selecciona un archivo de imagen válido.',
          variant: 'destructive',
        });
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'Error',
          description: 'La imagen no debe superar los 10MB.',
          variant: 'destructive',
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage({
          file,
          preview: reader.result as string
        });
        setOriginalImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmitTransformation = async () => {
    if (!selectedImage) return;
    
    try {
      // Convert canvas to JSON if we're in edit mode
      let annotations = null;
      if (canvas) {
        annotations = JSON.parse(JSON.stringify(canvas.toJSON()));
      }
      
      // Prepare transformation data
      const transformationData: TransformationData = {
        projectId,
        originalImagePath: selectedImage.preview,
        style: selectedStyle,
        customPrompt: customPrompt || undefined,
        name: transformationName || 'Transformación',
        annotations: annotations || undefined,
      };
      
      // Create transformation
      const result = await createTransformation.mutateAsync(transformationData);
      setTransformationId(result.id);
      
      // Move to next step
      setCurrentStep('style');
    } catch (error) {
      console.error('Error creating transformation:', error);
      toast({
        title: 'Error',
        description: 'No se pudo iniciar la transformación. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    }
  };
  
  const handleNextStep = () => {
    if (currentStep === 'upload' && selectedImage) {
      setCurrentStep('edit');
    } else if (currentStep === 'edit') {
      handleSubmitTransformation();
    }
  };
  
  const handlePreviousStep = () => {
    if (currentStep === 'edit') {
      setCurrentStep('upload');
    } else if (currentStep === 'style') {
      setCurrentStep('edit');
    } else if (currentStep === 'result') {
      setCurrentStep('style');
    }
  };
  
  const handleReset = () => {
    setSelectedImage(null);
    setSelectedStyle('modern');
    setCustomPrompt('');
    setTransformationId(null);
    setCurrentStep('upload');
    setTransformationName('');
    setBrightness(50);
    setContrast(50);
  };
  
  const handleClose = () => {
    handleReset();
    onClose();
  };
  
  const renderStepIndicator = () => {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="w-full flex items-center">
            <div className={`flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full ${
              currentStep === 'upload' ? 'bg-primary text-white' : 
              currentStep === 'edit' || currentStep === 'style' || currentStep === 'result' ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              <Upload className="h-5 w-5" />
            </div>
            <div className={`flex-1 h-0.5 ${
              currentStep === 'edit' || currentStep === 'style' || currentStep === 'result' ? 'bg-primary-500' : 'bg-gray-200'
            }`}></div>
          </div>
          <div className="w-full flex items-center">
            <div className={`flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full ${
              currentStep === 'edit' ? 'bg-primary text-white' : 
              currentStep === 'style' || currentStep === 'result' ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              <Edit2 className="h-5 w-5" />
            </div>
            <div className={`flex-1 h-0.5 ${
              currentStep === 'style' || currentStep === 'result' ? 'bg-primary-500' : 'bg-gray-200'
            }`}></div>
          </div>
          <div className="w-full flex items-center">
            <div className={`flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full ${
              currentStep === 'style' ? 'bg-primary text-white' : 
              currentStep === 'result' ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              <Brush className="h-5 w-5" />
            </div>
            <div className={`flex-1 h-0.5 ${
              currentStep === 'result' ? 'bg-primary-500' : 'bg-gray-200'
            }`}></div>
          </div>
          <div className="flex items-center">
            <div className={`flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full ${
              currentStep === 'result' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              <ImageIcon className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="flex justify-between text-xs mt-2">
          <span className={currentStep === 'upload' ? 'font-medium text-primary-700' : 'text-gray-500'}>Subir</span>
          <span className={currentStep === 'edit' ? 'font-medium text-primary-700' : 'text-gray-500'}>Editar</span>
          <span className={currentStep === 'style' ? 'font-medium text-primary-700' : 'text-gray-500'}>Estilo</span>
          <span className={currentStep === 'result' ? 'font-medium text-primary-700' : 'text-gray-500'}>Resultado</span>
        </div>
      </div>
    );
  };
  
  const renderUploadStep = () => {
    return (
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Subir imagen a transformar</h2>
        <p className="mb-6 text-sm text-gray-600">Sube una fotografía de la propiedad. Para obtener mejores resultados, utiliza imágenes bien iluminadas con buena resolución.</p>
        
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Nombre de la transformación (opcional)"
            value={transformationName}
            onChange={(e) => setTransformationName(e.target.value)}
            className="mb-4"
          />
        </div>
        
        <div 
          className="flex flex-col items-center justify-center space-y-4 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {selectedImage ? (
            <div className="w-full">
              <img 
                src={selectedImage.preview} 
                alt="Preview" 
                className="max-h-64 mx-auto rounded-md object-contain"
              />
              <p className="mt-4 text-sm text-gray-600">{selectedImage.file.name}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSelectedImage(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
              >
                Cambiar imagen
              </Button>
            </div>
          ) : (
            <>
              <div className="text-gray-400">
                <Upload className="h-12 w-12 mx-auto" />
              </div>
              <div className="text-gray-600">
                <p className="text-sm">Arrastra y suelta una imagen aquí, o</p>
                <Button 
                  className="mt-2" 
                  onClick={() => fileInputRef.current?.click()}
                >
                  Seleccionar archivo
                </Button>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, o JPEG (máx. 10MB)</p>
            </>
          )}
        </div>
      </div>
    );
  };
  
  const renderEditStep = () => {
    return (
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Editar y anotar</h2>
        <p className="mb-6 text-sm text-gray-600">Utiliza las herramientas para hacer anotaciones en la imagen. Puedes marcar objetos a eliminar, áreas a preservar o agregar instrucciones específicas.</p>
        
        {canvas && <EditorTools canvas={canvas} />}
        
        <div ref={canvasContainerRef} className="fabric-canvas-container mb-6">
          <canvas ref={canvasRef} />
        </div>
        
        <div className="border border-gray-200 rounded-md p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Instrucciones para IA</h3>
          <Textarea 
            rows={2} 
            className="resize-none"
            placeholder="Añade instrucciones específicas, ej: 'Quiero un sofá moderno gris en la esquina izquierda'"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
          />
        </div>
      </div>
    );
  };
  
  const renderStyleStep = () => {
    return (
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Seleccionar estilo</h2>
        <p className="mb-6 text-sm text-gray-600">Escoge el estilo de diseño que mejor se adapte a tu propiedad y al público objetivo.</p>
        
        <StyleSelector selectedStyle={selectedStyle} onSelectStyle={setSelectedStyle} />
        
        <div className="border border-gray-200 rounded-md p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Prompt personalizado (opcional)</h3>
          <Textarea 
            rows={2} 
            className="resize-none"
            placeholder="Describe detalles específicos del estilo, ej: 'Estilo moderno con toques escandinavos y colores cálidos'"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
          />
        </div>
      </div>
    );
  };
  
  const renderResultStep = () => {
    return (
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Resultado de la transformación</h2>
        <p className="mb-6 text-sm text-gray-600">Tu imagen ha sido transformada con éxito. Puedes ajustarla, compararla con el original o descargarla.</p>
        
        <ImageComparisonSlider 
          beforeImage={originalImageUrl}
          afterImage={transformedImageUrl || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=600&q=80'}
          height={400}
          className="mb-6"
        />
        
        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 mb-6">
          <div className="w-full sm:w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Brillo</label>
            <Slider 
              defaultValue={[50]} 
              max={100} 
              step={1} 
              value={[brightness]}
              onValueChange={(values) => setBrightness(values[0])}
            />
          </div>
          <div className="w-full sm:w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraste</label>
            <Slider 
              defaultValue={[50]} 
              max={100} 
              step={1}
              value={[contrast]}
              onValueChange={(values) => setContrast(values[0])}
            />
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Detalles</h3>
              <p className="text-xs text-gray-500 mt-1">
                Estilo: {selectedStyle} | 
                {transformation?.processingTimeMs && ` Procesamiento: ${transformation.processingTimeMs / 1000}s`}
              </p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-1.5" />
                Regenerar
              </Button>
              <Button size="sm">
                <i className="ri-download-line mr-1.5"></i>
                Descargar
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {currentStep === 'upload' && 'Transformación de Imagen'}
            {currentStep === 'edit' && 'Editar y Anotar Imagen'}
            {currentStep === 'style' && 'Seleccionar Estilo de Diseño'}
            {currentStep === 'result' && 'Resultado de la Transformación'}
          </DialogTitle>
        </DialogHeader>
        
        {renderStepIndicator()}
        
        <div className="bg-white rounded-lg p-6">
          {currentStep === 'upload' && renderUploadStep()}
          {currentStep === 'edit' && renderEditStep()}
          {currentStep === 'style' && renderStyleStep()}
          {currentStep === 'result' && renderResultStep()}
        </div>
        
        <DialogFooter className="mt-6 flex justify-between">
          {currentStep !== 'upload' ? (
            <Button variant="outline" onClick={handlePreviousStep}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Atrás
            </Button>
          ) : (
            <div></div>
          )}
          
          {currentStep === 'upload' && (
            <Button 
              onClick={handleNextStep} 
              disabled={!selectedImage}
            >
              Continuar
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
          
          {currentStep === 'edit' && (
            <Button onClick={handleNextStep}>
              Continuar
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
          
          {currentStep === 'style' && (
            <LoadingButton 
              onClick={handleSubmitTransformation} 
              isLoading={transformation?.status === 'pending' || transformation?.status === 'processing'}
              disabled={transformation?.status === 'pending' || transformation?.status === 'processing'}
            >
              Transformar Imagen
            </LoadingButton>
          )}
          
          {currentStep === 'result' && (
            <Button onClick={handleClose} variant="secondary">
              <Check className="h-4 w-4 mr-2" />
              Guardar y Finalizar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
