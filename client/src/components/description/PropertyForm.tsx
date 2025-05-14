import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PropertyData, PropertyFeatures } from '@/types';

interface PropertyFormProps {
  propertyData: PropertyData;
  onPropertyDataChange: (data: Partial<PropertyData>) => void;
  onFeaturesChange: (features: PropertyFeatures) => void;
}

export function PropertyForm({ propertyData, onPropertyDataChange, onFeaturesChange }: PropertyFormProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onPropertyDataChange({ [name]: value });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    onPropertyDataChange({ [name]: value });
  };
  
  const handleFeatureChange = (featureId: string, checked: boolean) => {
    const updatedFeatures = {
      ...(propertyData.features || {}),
      [featureId]: checked
    };
    onFeaturesChange(updatedFeatures);
  };
  
  const propertyFeatures = [
    { id: 'elevator', label: 'Ascensor' },
    { id: 'terrace', label: 'Terraza' },
    { id: 'balcony', label: 'Balcón' },
    { id: 'parking', label: 'Garaje' },
    { id: 'ac', label: 'Aire Acondicionado' },
    { id: 'heating', label: 'Calefacción' },
    { id: 'furnished', label: 'Amueblado' },
    { id: 'renovated', label: 'Reformado' },
    { id: 'fireplace', label: 'Chimenea' },
    { id: 'storage', label: 'Trastero' },
    { id: 'pool', label: 'Piscina' },
    { id: 'security', label: 'Seguridad' }
  ];
  
  return (
    <form>
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700">Tipo de Propiedad</label>
            <Select
              value={propertyData.propertyType}
              onValueChange={(value) => handleSelectChange('propertyType', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Piso">Piso</SelectItem>
                <SelectItem value="Casa">Casa</SelectItem>
                <SelectItem value="Chalet">Chalet</SelectItem>
                <SelectItem value="Dúplex">Dúplex</SelectItem>
                <SelectItem value="Ático">Ático</SelectItem>
                <SelectItem value="Estudio">Estudio</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="sm:col-span-3">
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Precio (€)</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <Input
                type="text"
                name="price"
                id="price"
                placeholder="0.00"
                value={propertyData.price}
                onChange={handleInputChange}
                className="pr-12"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">€</span>
              </div>
            </div>
          </div>
          
          <div className="sm:col-span-2">
            <label htmlFor="area" className="block text-sm font-medium text-gray-700">Superficie (m²)</label>
            <div className="mt-1">
              <Input
                type="number"
                name="area"
                id="area"
                placeholder="85"
                value={propertyData.area}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <div className="sm:col-span-2">
            <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700">Dormitorios</label>
            <div className="mt-1">
              <Input
                type="number"
                name="bedrooms"
                id="bedrooms"
                placeholder="2"
                value={propertyData.bedrooms}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <div className="sm:col-span-2">
            <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700">Baños</label>
            <div className="mt-1">
              <Input
                type="number"
                name="bathrooms"
                id="bathrooms"
                placeholder="2"
                value={propertyData.bathrooms}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <div className="sm:col-span-3">
            <label htmlFor="zone" className="block text-sm font-medium text-gray-700">Zona/Barrio</label>
            <div className="mt-1">
              <Input
                type="text"
                name="zone"
                id="zone"
                placeholder="Malasaña"
                value={propertyData.zone}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <div className="sm:col-span-3">
            <label htmlFor="yearBuilt" className="block text-sm font-medium text-gray-700">Año Construcción</label>
            <div className="mt-1">
              <Input
                type="number"
                name="yearBuilt"
                id="yearBuilt"
                placeholder="1950"
                value={propertyData.yearBuilt}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Características Destacables</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-4">
            {propertyFeatures.map((feature) => (
              <div key={feature.id} className="relative flex items-start">
                <div className="flex items-center h-5">
                  <Checkbox
                    id={`features-${feature.id}`}
                    checked={propertyData.features?.[feature.id] || false}
                    onCheckedChange={(checked) => handleFeatureChange(feature.id, checked as boolean)}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor={`features-${feature.id}`} className="font-medium text-gray-700">
                    {feature.label}
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Observaciones Adicionales</label>
          <div className="mt-1">
            <Textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="Detalles específicos o características que quieras destacar..."
              value={propertyData.notes}
              onChange={handleInputChange}
              className="resize-none"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
