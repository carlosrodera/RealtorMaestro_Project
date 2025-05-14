import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ImageComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
  className?: string;
  height?: number;
}

export function ImageComparisonSlider({
  beforeImage,
  afterImage,
  className,
  height = 400,
}: ImageComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleInteraction = (clientX: number) => {
    if (!containerRef.current) return;
    
    const { left, width } = containerRef.current.getBoundingClientRect();
    const position = ((clientX - left) / width) * 100;
    
    // Clamp the position between 0 and 100
    const clampedPosition = Math.max(0, Math.min(100, position));
    setSliderPosition(clampedPosition);
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      handleInteraction(e.clientX);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging) {
      handleInteraction(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={containerRef}
      className={cn("image-comparison relative overflow-hidden rounded-md", className)}
      style={{ height: `${height}px` }}
    >
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <img
          src={beforeImage}
          alt="Before"
          className="h-full w-full object-cover"
        />
      </div>

      <img
        src={afterImage}
        alt="After"
        className="h-full w-full object-cover"
      />

      <div
        className="comparison-slider"
        style={{ left: `${sliderPosition}%` }}
      >
        <div
          className="comparison-handle"
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
        >
          <i className="ri-arrow-left-right-line text-gray-600"></i>
        </div>
      </div>
    </div>
  );
}
