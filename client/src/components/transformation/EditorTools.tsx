import React, { useState } from 'react';
import * as fabric from 'fabric';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Brush, 
  Eraser, 
  MousePointer, 
  Type, 
  RotateCcw, 
  Square,
  Circle,
  Undo2,
  Redo2,
  Palette
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface EditorToolsProps {
  canvas: fabric.Canvas;
}

type Tool = 'brush' | 'eraser' | 'select' | 'text' | 'rectangle' | 'circle';

export function EditorTools({ canvas }: EditorToolsProps) {
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const [brushSize, setBrushSize] = useState(10);
  const [brushColor, setBrushColor] = useState('#3b82f6');
  const [history, setHistory] = useState<any[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  
  // Predefined colors
  const colors = [
    '#3b82f6', // blue
    '#ef4444', // red
    '#10b981', // green
    '#f59e0b', // yellow
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#000000', // black
    '#ffffff', // white
  ];
  
  // Save canvas state for undo/redo
  const saveHistory = () => {
    const canvasState = JSON.stringify(canvas.toJSON());
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(canvasState);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };
  
  // Undo function
  const handleUndo = () => {
    if (historyStep > 0) {
      canvas.loadFromJSON(history[historyStep - 1], () => {
        canvas.renderAll();
        setHistoryStep(historyStep - 1);
      });
    }
  };
  
  // Redo function
  const handleRedo = () => {
    if (historyStep < history.length - 1) {
      canvas.loadFromJSON(history[historyStep + 1], () => {
        canvas.renderAll();
        setHistoryStep(historyStep + 1);
      });
    }
  };
  
  // Listen to canvas changes
  React.useEffect(() => {
    if (!canvas) return;
    
    const handleCanvasChange = () => {
      saveHistory();
    };
    
    canvas.on('path:created', handleCanvasChange);
    canvas.on('object:added', handleCanvasChange);
    canvas.on('object:modified', handleCanvasChange);
    canvas.on('object:removed', handleCanvasChange);
    
    return () => {
      canvas.off('path:created', handleCanvasChange);
      canvas.off('object:added', handleCanvasChange);
      canvas.off('object:modified', handleCanvasChange);
      canvas.off('object:removed', handleCanvasChange);
    };
  }, [canvas, history, historyStep]);
  
  const handleToolClick = (tool: Tool) => {
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
        
        if (!canvas.freeDrawingBrush) {
          canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        }
        
        canvas.freeDrawingBrush.color = brushColor;
        canvas.freeDrawingBrush.width = brushSize;
        break;
        
      case 'eraser':
        canvas.isDrawingMode = true;
        
        if (!canvas.freeDrawingBrush) {
          canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        }
        
        // Create eraser effect with white color
        canvas.freeDrawingBrush.color = 'white';
        canvas.freeDrawingBrush.width = brushSize * 2;
        break;
        
      case 'select':
        canvas.isDrawingMode = false;
        canvas.selection = true;
        break;
        
      case 'text':
        canvas.isDrawingMode = false;
        
        const text = new fabric.IText('Haz clic para editar', {
          left: canvas.getWidth() / 2,
          top: canvas.getHeight() / 2,
          fontFamily: 'Inter',
          fontSize: 20,
          fill: brushColor,
          textAlign: 'center',
          originX: 'center',
          originY: 'center',
        });
        
        canvas.add(text);
        canvas.setActiveObject(text);
        canvas.renderAll();
        setActiveTool('select');
        break;
        
      case 'rectangle':
        canvas.isDrawingMode = false;
        
        const rect = new fabric.Rect({
          left: canvas.getWidth() / 2 - 50,
          top: canvas.getHeight() / 2 - 50,
          width: 100,
          height: 100,
          fill: 'transparent',
          stroke: brushColor,
          strokeWidth: 2,
        });
        
        canvas.add(rect);
        canvas.setActiveObject(rect);
        canvas.renderAll();
        setActiveTool('select');
        break;
        
      case 'circle':
        canvas.isDrawingMode = false;
        
        const circle = new fabric.Circle({
          left: canvas.getWidth() / 2 - 50,
          top: canvas.getHeight() / 2 - 50,
          radius: 50,
          fill: 'transparent',
          stroke: brushColor,
          strokeWidth: 2,
        });
        
        canvas.add(circle);
        canvas.setActiveObject(circle);
        canvas.renderAll();
        setActiveTool('select');
        break;
    }
  };
  
  const handleBrushSizeChange = (value: number[]) => {
    setBrushSize(value[0]);
    if (canvas && canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = activeTool === 'eraser' ? value[0] * 2 : value[0];
    }
  };
  
  const handleColorChange = (color: string) => {
    setBrushColor(color);
    if (canvas && canvas.freeDrawingBrush && activeTool === 'brush') {
      canvas.freeDrawingBrush.color = color;
    }
  };
  
  const handleReset = () => {
    if (!canvas) {
      console.error('Canvas is not initialized');
      return;
    }
    
    if (window.confirm('¿Estás seguro? Se perderán todas las anotaciones.')) {
      try {
        const objects = canvas.getObjects();
        if (objects.length > 0) {
          const backgroundImage = objects[0];
          canvas.clear();
          if (backgroundImage && backgroundImage.type === 'image') {
            canvas.add(backgroundImage);
          }
          canvas.renderAll();
          saveHistory();
        }
        
        setActiveTool(null);
      } catch (error) {
        console.error('Error al reiniciar el canvas:', error);
      }
    }
  };
  
  return (
    <div className="mb-4 space-y-3">
      {/* Main Tools */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeTool === 'select' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleToolClick('select')}
          >
            <MousePointer className="h-4 w-4 mr-1.5" />
            Selección
          </Button>
          
          <Button
            variant={activeTool === 'brush' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleToolClick('brush')}
          >
            <Brush className="h-4 w-4 mr-1.5" />
            Pincel
          </Button>
          
          <Button
            variant={activeTool === 'eraser' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleToolClick('eraser')}
          >
            <Eraser className="h-4 w-4 mr-1.5" />
            Borrador
          </Button>
          
          <Button
            variant={activeTool === 'text' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleToolClick('text')}
          >
            <Type className="h-4 w-4 mr-1.5" />
            Texto
          </Button>
          
          <Button
            variant={activeTool === 'rectangle' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleToolClick('rectangle')}
          >
            <Square className="h-4 w-4 mr-1.5" />
            Rectángulo
          </Button>
          
          <Button
            variant={activeTool === 'circle' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleToolClick('circle')}
          >
            <Circle className="h-4 w-4 mr-1.5" />
            Círculo
          </Button>
          
          <div className="flex gap-1 ml-auto">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={handleUndo}
              disabled={historyStep <= 0}
            >
              <Undo2 className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={handleRedo}
              disabled={historyStep >= history.length - 1}
            >
              <Redo2 className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
            >
              <RotateCcw className="h-4 w-4 mr-1.5" />
              Reiniciar
            </Button>
          </div>
        </div>
      </div>
      
      {/* Tool Options */}
      {(activeTool === 'brush' || activeTool === 'eraser') && (
        <div className="bg-gray-50 p-3 rounded-lg space-y-3">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700 min-w-[80px]">
              Tamaño: {brushSize}px
            </span>
            <Slider
              value={[brushSize]}
              onValueChange={handleBrushSizeChange}
              min={1}
              max={50}
              step={1}
              className="flex-1"
            />
          </div>
          
          {activeTool === 'brush' && (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700 min-w-[80px]">Color:</span>
              <div className="flex gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-transform",
                      brushColor === color ? "border-gray-900 scale-110" : "border-gray-300"
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorChange(color)}
                  />
                ))}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <Palette className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-3">
                    <input
                      type="color"
                      value={brushColor}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="w-32 h-32 cursor-pointer"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Instructions */}
      <div className="text-xs text-gray-500 px-3">
        💡 Consejo: Marca las áreas que quieres transformar con el pincel o añade anotaciones con texto
      </div>
    </div>
  );
}