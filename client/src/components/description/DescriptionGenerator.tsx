import React, { useState, useEffect } from 'react';
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
import { PropertyForm } from '@/components/description/PropertyForm';
import { DescriptionOutput } from '@/components/description/DescriptionOutput';
import { useDescriptions } from '@/hooks/use-descriptions';
import { DescriptionData, PropertyData, PropertyFeatures } from '@/types';
import { FileImage, FileText, Type, Check, ArrowLeft, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Step = 'property-info' | 'images' | 'style' | 'result';

interface DescriptionGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: number;
}

export function DescriptionGenerator({ isOpen, onClose, projectId }: DescriptionGeneratorProps) {
  const [currentStep, setCurrentStep] = useState<Step>('property-info');
  const [descriptionId, setDescriptionId] = useState<number | null>(null);
  const [descriptionName, setDescriptionName] = useState('');
  const [propertyData, setPropertyData] = useState<PropertyData>({
    propertyType: 'Piso',
    price: '',
    area: '',
    bedrooms: '',
    bathrooms: '',
    zone: '',
    yearBuilt: '',
    features: {},
    notes: ''
  });
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [tone, setTone] = useState('professional');
  const [lengthOption, setLengthOption] = useState('medium');
  const [language, setLanguage] = useState('es');
  
  const { createDescription, useDescription } = useDescriptions(projectId);
  const { toast } = useToast();
  
  const { data: description } = useDescription(descriptionId || 0);
  
  // Watch for description status changes
  useEffect(() => {
    if (description && description.status === 'completed' && description.generatedText) {
      setCurrentStep('result');
    }
  }, [description]);
  
  const handlePropertyDataChange = (newData: Partial<PropertyData>) => {
    setPropertyData(prev => ({ ...prev, ...newData }));
  };
  
  const handleFeaturesChange = (features: PropertyFeatures) => {
    setPropertyData(prev => ({ 
      ...prev, 
      features: features 
    }));
  };
  
  const handleSubmitDescription = async () => {
    try {
      // Prepare description data
      const descriptionData: DescriptionData = {
        projectId,
        propertyData,
        sourceImagePaths: selectedImages.length > 0 ? selectedImages : undefined,
        tone,
        lengthOption,
        language,
        name: descriptionName || 'Descripción',
      };
      
      // Create description
      const result = await createDescription.mutateAsync(descriptionData);
      setDescriptionId(result.id);
      
      // Move to next step if we're not already at result
      if (currentStep !== 'result') {
        setCurrentStep('result');
      }
    } catch (error) {
      console.error('Error creating description:', error);
      toast({
        title: 'Error',
        description: 'No se pudo generar la descripción. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    }
  };
  
  const handleNextStep = () => {
    if (currentStep === 'property-info') {
      setCurrentStep('images');
    } else if (currentStep === 'images') {
      setCurrentStep('style');
    } else if (currentStep === 'style') {
      handleSubmitDescription();
    }
  };
  
  const handlePreviousStep = () => {
    if (currentStep === 'images') {
      setCurrentStep('property-info');
    } else if (currentStep === 'style') {
      setCurrentStep('images');
    } else if (currentStep === 'result') {
      setCurrentStep('style');
    }
  };
  
  const handleReset = () => {
    setCurrentStep('property-info');
    setDescriptionId(null);
    setDescriptionName('');
    setPropertyData({
      propertyType: 'Piso',
      price: '',
      area: '',
      bedrooms: '',
      bathrooms: '',
      zone: '',
      yearBuilt: '',
      features: {},
      notes: ''
    });
    setSelectedImages([]);
    setTone('professional');
    setLengthOption('medium');
    setLanguage('es');
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
              currentStep === 'property-info' ? 'bg-primary text-white' : 
              currentStep === 'images' || currentStep === 'style' || currentStep === 'result' ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              <FileText className="h-5 w-5" />
            </div>
            <div className={`flex-1 h-0.5 ${
              currentStep === 'images' || currentStep === 'style' || currentStep === 'result' ? 'bg-primary-500' : 'bg-gray-200'
            }`}></div>
          </div>
          <div className="w-full flex items-center">
            <div className={`flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full ${
              currentStep === 'images' ? 'bg-primary text-white' : 
              currentStep === 'style' || currentStep === 'result' ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              <FileImage className="h-5 w-5" />
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
              <Type className="h-5 w-5" />
            </div>
            <div className={`flex-1 h-0.5 ${
              currentStep === 'result' ? 'bg-primary-500' : 'bg-gray-200'
            }`}></div>
          </div>
          <div className="flex items-center">
            <div className={`flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full ${
              currentStep === 'result' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              <i className="ri-file-text-line"></i>
            </div>
          </div>
        </div>
        <div className="flex justify-between text-xs mt-2">
          <span className={currentStep === 'property-info' ? 'font-medium text-primary-700' : 'text-gray-500'}>Datos Básicos</span>
          <span className={currentStep === 'images' ? 'font-medium text-primary-700' : 'text-gray-500'}>Imágenes</span>
          <span className={currentStep === 'style' ? 'font-medium text-primary-700' : 'text-gray-500'}>Estilo</span>
          <span className={currentStep === 'result' ? 'font-medium text-primary-700' : 'text-gray-500'}>Resultado</span>
        </div>
      </div>
    );
  };
  
  const renderPropertyInfoStep = () => {
    return (
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Información Básica de la Propiedad</h2>
        <p className="mb-6 text-sm text-gray-600">Completa los detalles esenciales de la propiedad para generar una descripción precisa.</p>
        
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Nombre de la descripción (opcional)"
            value={descriptionName}
            onChange={(e) => setDescriptionName(e.target.value)}
            className="mb-4"
          />
        </div>
        
        <PropertyForm 
          propertyData={propertyData} 
          onPropertyDataChange={handlePropertyDataChange}
          onFeaturesChange={handleFeaturesChange}
        />
      </div>
    );
  };
  
  const renderImagesStep = () => {
    // Mock functionality for image upload - in a real app, this would handle actual file uploads
    const mockImages = [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=600&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=600&q=80',
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=600&q=80'
    ];
    
    const toggleImageSelection = (imageUrl: string) => {
      if (selectedImages.includes(imageUrl)) {
        setSelectedImages(selectedImages.filter(url => url !== imageUrl));
      } else {
        setSelectedImages([...selectedImages, imageUrl]);
      }
    };
    
    return (
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Imágenes de Referencia</h2>
        <p className="mb-6 text-sm text-gray-600">Selecciona imágenes para que la IA entienda mejor el estilo y características de la propiedad.</p>
        
        <div className="mb-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <div className="text-gray-400 mb-4">
              <FileImage className="h-12 w-12 mx-auto" />
            </div>
            <p className="text-sm text-gray-600 mb-4">Sube imágenes de la propiedad para mejorar la calidad de la descripción</p>
            <Button>Subir Imágenes</Button>
          </div>
        </div>
        
        <h3 className="text-sm font-medium text-gray-900 mb-3">Imágenes Disponibles</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {mockImages.map((imageUrl, index) => (
            <div 
              key={index} 
              className={`border-2 rounded-lg overflow-hidden cursor-pointer ${
                selectedImages.includes(imageUrl) ? 'border-primary-500' : 'border-gray-200'
              }`}
              onClick={() => toggleImageSelection(imageUrl)}
            >
              <div className="relative">
                <img 
                  src={imageUrl} 
                  alt={`Propiedad ${index + 1}`} 
                  className="w-full h-40 object-cover"
                />
                {selectedImages.includes(imageUrl) && (
                  <div className="absolute top-2 right-2 bg-primary-500 text-white rounded-full p-1">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  const renderStyleStep = () => {
    return (
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Configuración de Tono y Estilo</h2>
        <p className="mb-6 text-sm text-gray-600">Personaliza el tono, la longitud y el idioma de la descripción generada.</p>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tono de la Descripción</label>
            <Select
              value={tone}
              onValueChange={(value) => setTone(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un tono" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Profesional</SelectItem>
                <SelectItem value="emotional">Emocional</SelectItem>
                <SelectItem value="minimalist">Minimalista</SelectItem>
                <SelectItem value="detailed">Detallado</SelectItem>
                <SelectItem value="investment">Enfocado en inversión</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Longitud</label>
            <Select
              value={lengthOption}
              onValueChange={(value) => setLengthOption(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una longitud" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Corta</SelectItem>
                <SelectItem value="medium">Media</SelectItem>
                <SelectItem value="long">Larga</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Idioma</label>
            <Select
              value={language}
              onValueChange={(value) => setLanguage(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un idioma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="en">Inglés</SelectItem>
                <SelectItem value="fr">Francés</SelectItem>
                <SelectItem value="de">Alemán</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Instrucciones Adicionales (Opcional)</label>
            <Textarea 
              placeholder="Instrucciones específicas para la generación de la descripción..." 
              className="resize-none"
              rows={3}
            />
          </div>
        </div>
      </div>
    );
  };
  
  const renderResultStep = () => {
    return (
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Descripción Generada</h2>
        <p className="mb-6 text-sm text-gray-600">La descripción ha sido generada con éxito. Puedes editarla, copiarla o guardarla en tu proyecto.</p>
        
        <DescriptionOutput 
          generatedText={description?.generatedText || ''} 
          propertyData={propertyData}
        />
      </div>
    );
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {currentStep === 'property-info' && 'Generación de Descripción'}
            {currentStep === 'images' && 'Imágenes de Referencia'}
            {currentStep === 'style' && 'Configuración de Estilo'}
            {currentStep === 'result' && 'Descripción Generada'}
          </DialogTitle>
        </DialogHeader>
        
        {renderStepIndicator()}
        
        <div className="bg-white rounded-lg p-6">
          {currentStep === 'property-info' && renderPropertyInfoStep()}
          {currentStep === 'images' && renderImagesStep()}
          {currentStep === 'style' && renderStyleStep()}
          {currentStep === 'result' && renderResultStep()}
        </div>
        
        <DialogFooter className="mt-6 flex justify-between">
          {currentStep !== 'property-info' ? (
            <Button variant="outline" onClick={handlePreviousStep}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Atrás
            </Button>
          ) : (
            <div></div>
          )}
          
          {currentStep === 'property-info' && (
            <Button 
              onClick={handleNextStep} 
              disabled={!propertyData.propertyType || !propertyData.area || !propertyData.bedrooms || !propertyData.bathrooms}
            >
              Continuar
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
          
          {currentStep === 'images' && (
            <Button onClick={handleNextStep}>
              Continuar
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
          
          {currentStep === 'style' && (
            <LoadingButton 
              onClick={handleSubmitDescription} 
              isLoading={description?.status === 'pending' || description?.status === 'processing'}
              disabled={description?.status === 'pending' || description?.status === 'processing'}
            >
              Generar Descripción
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
