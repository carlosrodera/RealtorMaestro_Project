import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { PropertyData } from '@/types';
import { Check, Copy, Edit, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DescriptionOutputProps {
  generatedText: string;
  propertyData: PropertyData;
}

export function DescriptionOutput({ generatedText, propertyData }: DescriptionOutputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(generatedText);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: "Descripción guardada",
      description: "Los cambios se han guardado correctamente.",
    });
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(editedText);
    setIsCopied(true);
    
    toast({
      title: "Copiado al portapapeles",
      description: "La descripción se ha copiado al portapapeles.",
    });
    
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-900">Descripción Principal</h3>
            <div className="flex space-x-2">
              {isEditing ? (
                <Button variant="ghost" size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-1" />
                  Guardar
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                {isCopied ? (
                  <Check className="h-4 w-4 mr-1" />
                ) : (
                  <Copy className="h-4 w-4 mr-1" />
                )}
                {isCopied ? 'Copiado' : 'Copiar'}
              </Button>
            </div>
          </div>
          
          <div className="flex items-center p-4 text-xs text-gray-500 space-x-2 border-b border-gray-200">
            <span className="bg-gray-100 px-2 py-0.5 rounded-full">Profesional</span>
            <span className="bg-gray-100 px-2 py-0.5 rounded-full">Media</span>
            <span className="bg-gray-100 px-2 py-0.5 rounded-full">Español</span>
          </div>
          
          <div className="p-4">
            {isEditing ? (
              <Textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="min-h-[300px] resize-none"
              />
            ) : (
              <div className="text-sm text-gray-600 whitespace-pre-wrap">
                {editedText || 
                  "Descubra este exclusivo piso completamente reformado en el corazón de Malasaña, uno de los barrios más vibrantes y con más personalidad de Madrid. Con 85 m² distribuidos en 2 amplios dormitorios y 2 baños completos, esta propiedad combina a la perfección el encanto del Madrid tradicional con toques contemporáneos.\n\nEl salón principal, bañado de luz natural gracias a sus ventanales orientados al este, cuenta con suelos de madera natural y una moderna chimenea que añade un toque acogedor. La cocina, totalmente equipada con electrodomésticos de alta gama, presenta un diseño minimalista con acabados en blanco y una práctica isla central, perfecta para los amantes de la gastronomía.\n\nEl dormitorio principal es un verdadero remanso de paz con su vestidor integrado y baño en suite con ducha efecto lluvia. A escasos minutos a pie encontrará todos los servicios, incluyendo el Metro de Tribunal, innumerables comercios, restaurantes de moda y la emblemática Gran Vía."}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Detalles de la Propiedad</h3>
          </div>
          <div className="p-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="flex items-center space-x-2">
                <i className="ri-home-line text-gray-400"></i>
                <span className="text-gray-600">Tipo: {propertyData.propertyType}</span>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <i className="ri-ruler-line text-gray-400"></i>
                <span className="text-gray-600">Superficie: {propertyData.area} m²</span>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <i className="ri-hotel-bed-line text-gray-400"></i>
                <span className="text-gray-600">Dormitorios: {propertyData.bedrooms}</span>
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <i className="ri-contrast-drop-line text-gray-400"></i>
                <span className="text-gray-600">Baños: {propertyData.bathrooms}</span>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <i className="ri-building-line text-gray-400"></i>
                <span className="text-gray-600">Año: {propertyData.yearBuilt}</span>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <i className="ri-map-pin-line text-gray-400"></i>
                <span className="text-gray-600">Zona: {propertyData.zone}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
