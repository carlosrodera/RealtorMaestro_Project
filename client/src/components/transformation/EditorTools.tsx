import React, { useState } from 'react';
import * as fabric from 'fabric';
import { Button } from '@/components/ui/button';
import { Brush, Eraser, MousePointer, Type, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditorToolsProps {
  canvas: fabric.Canvas;
}

type Tool = 'brush' | 'eraser' | 'select' | 'text';

export function EditorTools({ canvas }: EditorToolsProps) {
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  
  const handleToolClick = (tool: Tool) => {
    // Check if canvas is properly initialized
    if (!canvas) {
      console.error('Canvas is not initialized');
      return;
    }
    
    // Deactivate current tool
    if (activeTool === 'brush' || activeTool === 'eraser') {
      canvas.isDrawingMode = false;
    }
    
    if (activeTool === tool) {
      setActiveTool(null);
      canvas.isDrawingMode = false;
      canvas.selection = true;
      return;
    }
    
    setActiveTool(tool);
    
    // Initialize the appropriate tool
    switch (tool) {
      case 'brush':
        canvas.isDrawingMode = true;
        
        // Initialize freeDrawingBrush if needed
        if (!canvas.freeDrawingBrush) {
          canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        }
        
        canvas.freeDrawingBrush.color = 'rgba(38, 132, 255, 0.6)'; // Primary color with transparency
        canvas.freeDrawingBrush.width = 10;
        break;
        
      case 'eraser':
        canvas.isDrawingMode = true;
        
        // Initialize freeDrawingBrush if needed
        if (!canvas.freeDrawingBrush) {
          canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        }
        
        canvas.freeDrawingBrush.color = 'white';
        canvas.freeDrawingBrush.width = 20;
        break;
        
      case 'select':
        canvas.isDrawingMode = false;
        canvas.selection = true;
        break;
        
      case 'text':
        canvas.isDrawingMode = false;
        
        // Add a text object to the canvas
        const text = new fabric.IText('Haz doble clic para editar', {
          left: canvas.getWidth() / 2,
          top: canvas.getHeight() / 2,
          fontFamily: 'Inter',
          fontSize: 20,
          fill: '#3b82f6',
          textAlign: 'center',
          originX: 'center',
          originY: 'center',
        });
        
        canvas.add(text);
        canvas.setActiveObject(text);
        canvas.renderAll();
        break;
    }
  };
  
  const handleReset = () => {
    // Check if canvas is properly initialized
    if (!canvas) {
      console.error('Canvas is not initialized');
      return;
    }
    
    // Show confirmation
    if (window.confirm('¿Estás seguro? Se perderán todas las anotaciones.')) {
      try {
        // Clear all objects except the background image
        const objects = canvas.getObjects();
        if (objects.length > 0) {
          // Keep only the first object (assumed to be the background image)
          const backgroundImage = objects[0];
          canvas.clear();
          if (backgroundImage) {
            canvas.add(backgroundImage);
          }
          canvas.renderAll();
        }
        
        setActiveTool(null);
      } catch (error) {
        console.error('Error al reiniciar el canvas:', error);
      }
    }
  };
  
  return (
    <div className="mb-4 bg-gray-50 p-3 rounded-lg">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeTool === 'brush' ? 'default' : 'outline'}
          className={cn(
            "inline-flex items-center px-3 py-1.5 text-sm font-medium",
            activeTool === 'brush' ? "text-white" : "text-gray-700"
          )}
          onClick={() => handleToolClick('brush')}
        >
          <Brush className="h-4 w-4 mr-1.5" />
          Pincel
        </Button>
        
        <Button
          variant={activeTool === 'eraser' ? 'default' : 'outline'}
          className={cn(
            "inline-flex items-center px-3 py-1.5 text-sm font-medium",
            activeTool === 'eraser' ? "text-white" : "text-gray-700"
          )}
          onClick={() => handleToolClick('eraser')}
        >
          <Eraser className="h-4 w-4 mr-1.5" />
          Borrador
        </Button>
        
        <Button
          variant={activeTool === 'select' ? 'default' : 'outline'}
          className={cn(
            "inline-flex items-center px-3 py-1.5 text-sm font-medium",
            activeTool === 'select' ? "text-white" : "text-gray-700"
          )}
          onClick={() => handleToolClick('select')}
        >
          <MousePointer className="h-4 w-4 mr-1.5" />
          Selección
        </Button>
        
        <Button
          variant={activeTool === 'text' ? 'default' : 'outline'}
          className={cn(
            "inline-flex items-center px-3 py-1.5 text-sm font-medium",
            activeTool === 'text' ? "text-white" : "text-gray-700"
          )}
          onClick={() => handleToolClick('text')}
        >
          <Type className="h-4 w-4 mr-1.5" />
          Texto
        </Button>
        
        <Button
          variant="outline"
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 ml-auto"
          onClick={handleReset}
        >
          <RotateCcw className="h-4 w-4 mr-1.5" />
          Reiniciar
        </Button>
      </div>
    </div>
  );
}
