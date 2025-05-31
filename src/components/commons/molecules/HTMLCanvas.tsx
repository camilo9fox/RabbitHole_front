'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';

interface HTMLCanvasProps {
  tshirtImage: string;
  customImage?: string | null;
  customText?: string;
  textColor?: string;
  textFont?: string;
  textSize?: number;
  onUpdateTextPosition?: (x: number, y: number) => void;
  onUpdateImagePosition?: (x: number, y: number) => void;
  onUpdateTextSize?: (size: number) => void;
  onUpdateImageSize?: (width: number, height: number) => void;
}

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

const HTMLCanvas: React.FC<HTMLCanvasProps> = ({
  tshirtImage,
  customImage,
  customText = '',
  textColor = '#000000',
  textFont = 'Arial',
  textSize = 20,
  onUpdateTextPosition,
  onUpdateImagePosition,
  onUpdateTextSize,
  onUpdateImageSize
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [tshirtImg, setTshirtImg] = useState<HTMLImageElement | null>(null);
  const [userImg, setUserImg] = useState<HTMLImageElement | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 500, height: 600 });
  const [textPosition, setTextPosition] = useState<Position>({ x: 250, y: 250 });
  const [imagePosition, setImagePosition] = useState<Position>({ x: 250, y: 250 });
  const [imageSize, setImageSize] = useState<Size>({ width: 100, height: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragTarget, setDragTarget] = useState<'text' | 'image' | null>(null);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  
  // Función para dibujar en el canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Limpiar el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar la imagen de la polera
    if (tshirtImg) {
      ctx.drawImage(tshirtImg, 0, 0, canvas.width, canvas.height);
    }
    
    // Dibujar la imagen personalizada
    if (userImg) {
      ctx.save();
      ctx.translate(imagePosition.x, imagePosition.y);
      ctx.drawImage(
        userImg,
        -imageSize.width / 2,
        -imageSize.height / 2,
        imageSize.width,
        imageSize.height
      );
      ctx.restore();
    }
    
    // Dibujar el texto personalizado
    if (customText && !userImg) {
      ctx.save();
      ctx.font = `${textSize}px ${textFont}`;
      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(customText, textPosition.x, textPosition.y);
      ctx.restore();
    }
  }, [tshirtImg, userImg, customText, textColor, textFont, textSize, textPosition, imagePosition, imageSize]);
  
  // Cargar la imagen de la polera
  useEffect(() => {
    const img = new Image();
    img.src = tshirtImage;
    img.onload = () => {
      setTshirtImg(img);
      drawCanvas();
    };
  }, [tshirtImage, drawCanvas]);
  
  // Cargar la imagen personalizada cuando cambie
  useEffect(() => {
    if (customImage) {
      const img = new Image();
      img.src = customImage;
      img.onload = () => {
        setUserImg(img);
        // Establecer un tamaño proporcional inicial
        const maxSize = 150;
        const ratio = img.width / img.height;
        let newWidth = maxSize;
        let newHeight = maxSize / ratio;
        
        if (newHeight > maxSize) {
          newHeight = maxSize;
          newWidth = maxSize * ratio;
        }
        
        setImageSize({ width: newWidth, height: newHeight });
        drawCanvas();
      };
    } else {
      setUserImg(null);
      drawCanvas();
    }
  }, [customImage, drawCanvas]);
  
  // Ajustar el tamaño del canvas al tamaño de la ventana
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const width = Math.min(containerRef.current.offsetWidth, 500);
        const height = width * 1.2; // Mantener proporción
        setCanvasSize({ width, height });
        
        // Ajustar el tamaño del canvas
        if (canvasRef.current) {
          canvasRef.current.width = width;
          canvasRef.current.height = height;
          drawCanvas();
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawCanvas]);
  
  // Redibujar el canvas cuando cambien las propiedades
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);
  
  // Manejar el inicio del arrastre
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Comprobar si se ha hecho clic en el texto
    if (customText && !userImg) {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.font = `${textSize}px ${textFont}`;
      const textWidth = ctx.measureText(customText).width;
      const textHeight = textSize;
      
      if (
        x >= textPosition.x - textWidth / 2 - 10 &&
        x <= textPosition.x + textWidth / 2 + 10 &&
        y >= textPosition.y - textHeight / 2 - 10 &&
        y <= textPosition.y + textHeight / 2 + 10
      ) {
        setIsDragging(true);
        setDragTarget('text');
        setDragOffset({
          x: x - textPosition.x,
          y: y - textPosition.y
        });
        return;
      }
    }
    
    // Comprobar si se ha hecho clic en la imagen
    if (userImg) {
      if (
        x >= imagePosition.x - imageSize.width / 2 &&
        x <= imagePosition.x + imageSize.width / 2 &&
        y >= imagePosition.y - imageSize.height / 2 &&
        y <= imagePosition.y + imageSize.height / 2
      ) {
        setIsDragging(true);
        setDragTarget('image');
        setDragOffset({
          x: x - imagePosition.x,
          y: y - imagePosition.y
        });
        return;
      }
    }
  };
  
  // Manejar el movimiento durante el arrastre
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !dragTarget) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Actualizar la posición según el tipo de elemento arrastrado
    if (dragTarget === 'text') {
      const newPosition = {
        x: x - dragOffset.x,
        y: y - dragOffset.y
      };
      
      // Limitar dentro del área de la polera
      const boundedX = Math.max(50, Math.min(canvas.width - 50, newPosition.x));
      const boundedY = Math.max(50, Math.min(canvas.height - 50, newPosition.y));
      
      setTextPosition({ x: boundedX, y: boundedY });
      
      if (onUpdateTextPosition) {
        onUpdateTextPosition(boundedX, boundedY);
      }
    } else if (dragTarget === 'image') {
      const newPosition = {
        x: x - dragOffset.x,
        y: y - dragOffset.y
      };
      
      // Limitar dentro del área de la polera
      const boundedX = Math.max(imageSize.width / 2, Math.min(canvas.width - imageSize.width / 2, newPosition.x));
      const boundedY = Math.max(imageSize.height / 2, Math.min(canvas.height - imageSize.height / 2, newPosition.y));
      
      setImagePosition({ x: boundedX, y: boundedY });
      
      if (onUpdateImagePosition) {
        onUpdateImagePosition(boundedX, boundedY);
      }
    }
  };
  
  // Manejar el final del arrastre
  const handleMouseUp = () => {
    setIsDragging(false);
    setDragTarget(null);
  };
  
  // Manejar el redimensionamiento del texto
  const handleTextResize = (increase: boolean) => {
    const newSize = increase
      ? Math.min(72, textSize + 2)
      : Math.max(12, textSize - 2);
    
    if (onUpdateTextSize) {
      onUpdateTextSize(newSize);
    }
  };
  
  // Manejar el redimensionamiento de la imagen
  const handleImageResize = (increase: boolean) => {
    const newSize = {
      width: increase
        ? Math.min(300, imageSize.width * 1.1)
        : Math.max(30, imageSize.width * 0.9),
      height: increase
        ? Math.min(300, imageSize.height * 1.1)
        : Math.max(30, imageSize.height * 0.9)
    };
    
    setImageSize(newSize);
    
    if (onUpdateImageSize) {
      onUpdateImageSize(newSize.width, newSize.height);
    }
  };
  
  return (
    <div ref={containerRef} className="w-full relative">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="border border-gray-300 rounded-lg mx-auto cursor-move"
      />
      
      {/* Controles para el texto */}
      {customText && !userImg && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/80 dark:bg-gray-800/80 p-2 rounded-md flex items-center space-x-2">
          <button
            type="button"
            className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full"
            onClick={() => handleTextResize(false)}
          >
            -
          </button>
          <span className="text-sm mx-1">{textSize}px</span>
          <button
            type="button"
            className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full"
            onClick={() => handleTextResize(true)}
          >
            +
          </button>
        </div>
      )}
      
      {/* Controles para la imagen */}
      {userImg && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/80 dark:bg-gray-800/80 p-2 rounded-md flex items-center space-x-2">
          <button
            type="button"
            className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full"
            onClick={() => handleImageResize(false)}
          >
            -
          </button>
          <button
            type="button"
            className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full"
            onClick={() => handleImageResize(true)}
          >
            +
          </button>
        </div>
      )}
    </div>
  );
};

export default HTMLCanvas;
