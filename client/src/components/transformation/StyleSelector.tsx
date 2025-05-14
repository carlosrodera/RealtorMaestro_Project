import React from 'react';
import { cn } from '@/lib/utils';

interface StyleSelectorProps {
  selectedStyle: string;
  onSelectStyle: (style: string) => void;
}

interface StyleOption {
  id: string;
  name: string;
  imageUrl: string;
}

export function StyleSelector({ selectedStyle, onSelectStyle }: StyleSelectorProps) {
  const styleOptions: StyleOption[] = [
    {
      id: 'modern',
      name: 'Moderno',
      imageUrl: 'https://pixabay.com/get/gdbf35902ba28add6e605a54194d85fdd27d254385c31d3119b012f9d3cce77e93e4100c6b419e4e494f18f8b3c542ffb668f67a950a72d700d157e13b3f0e3e8_1280.jpg'
    },
    {
      id: 'minimalist',
      name: 'Minimalista',
      imageUrl: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=150&q=80'
    },
    {
      id: 'classic',
      name: 'Clásico',
      imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=150&q=80'
    },
    {
      id: 'nordic',
      name: 'Nórdico',
      imageUrl: 'https://images.unsplash.com/photo-1513161455079-7dc1de15ef3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=150&q=80'
    },
    {
      id: 'industrial',
      name: 'Industrial',
      imageUrl: 'https://images.unsplash.com/photo-1505409628601-edc9af17fda6?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=150&q=80'
    },
    {
      id: 'mediterranean',
      name: 'Mediterráneo',
      imageUrl: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=150&q=80'
    },
    {
      id: 'bohemian',
      name: 'Bohemio',
      imageUrl: 'https://images.unsplash.com/photo-1617104678098-de229db51175?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=150&q=80'
    },
    {
      id: 'contemporary',
      name: 'Contemporáneo',
      imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=150&q=80'
    }
  ];
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {styleOptions.map((style) => (
        <div 
          key={style.id}
          className={cn(
            "border rounded-lg p-2 cursor-pointer transition-all hover:border-primary-600 hover:bg-primary-50",
            selectedStyle === style.id 
              ? "border-primary-600 bg-primary-50"
              : "border-gray-200"
          )}
          onClick={() => onSelectStyle(style.id)}
        >
          <div className="bg-white rounded-md overflow-hidden mb-2">
            <img 
              src={style.imageUrl} 
              alt={`Estilo ${style.name}`} 
              className="w-full h-24 object-cover"
            />
          </div>
          <div className="text-center">
            <span className={cn(
              "text-sm font-medium",
              selectedStyle === style.id 
                ? "text-primary-700"
                : "text-gray-700"
            )}>
              {style.name}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
