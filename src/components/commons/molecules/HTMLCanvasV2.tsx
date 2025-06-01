'use client';

import React, { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';

// Definir la interfaz para las referencias imperativas
export interface HTMLCanvasHandle {
  captureCanvas: () => string | undefined;
}

interface HTMLCanvasProps {
  tshirtImage: string;
  tshirtColor?: string; // Color para aplicar a la polera
  customImage?: string | null;
  customText?: string;
  textColor?: string;
  textFont?: string;
  textSize?: number;
  textPositionX?: number;
  textPositionY?: number;
  imagePositionX?: number;
  imagePositionY?: number;
  imageWidth?: number;
  imageHeight?: number;
  onUpdateTextPosition?: (x: number, y: number) => void;
  onUpdateImagePosition?: (x: number, y: number) => void;
  onUpdateTextSize?: (size: number) => void;
  onUpdateImageSize?: (width: number, height: number) => void;
  useColorization?: boolean; // Indica si se debe usar la coloración dinámica
}

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

// Constantes para el redimensionamiento
const HANDLE_SIZE = 10;
const HANDLE_POSITIONS = ['nw', 'ne', 'se', 'sw', 'n', 's', 'e', 'w'];

const HTMLCanvasV2 = forwardRef<HTMLCanvasHandle, HTMLCanvasProps>(({ 
  tshirtImage,
  tshirtColor = '#FFFFFF',
  useColorization = false,
  customImage,
  customText = '',
  textColor = '#000000',
  textFont = 'Arial',
  textSize = 20,
  textPositionX = 250,
  textPositionY = 250,
  imagePositionX = 250,
  imagePositionY = 250,
  imageWidth = 100,
  imageHeight = 100,
  onUpdateTextPosition,
  onUpdateImagePosition,
  onUpdateTextSize,
  onUpdateImageSize
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Nota: La implementación de captureCanvas y useImperativeHandle está más abajo en el componente
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [tshirtImg, setTshirtImg] = useState<HTMLImageElement | null>(null);
  const [userImg, setUserImg] = useState<HTMLImageElement | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 500, height: 600 });
  const [textPosition, setTextPosition] = useState<Position>({ x: textPositionX, y: textPositionY });
  const [imagePosition, setImagePosition] = useState<Position>({ x: imagePositionX, y: imagePositionY });
  const [imageSize, setImageSize] = useState<Size>({ width: imageWidth, height: imageHeight });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [dragTarget, setDragTarget] = useState<'text' | 'image' | null>(null);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState<Size>({ width: 0, height: 0 });

  // Verificar si el cursor está sobre la imagen
  const isOverImage = useCallback((x: number, y: number): boolean => {
    if (!userImg) return false;
    
    const halfWidth = imageSize.width / 2;
    const halfHeight = imageSize.height / 2;
    
    return (
      x >= imagePosition.x - halfWidth &&
      x <= imagePosition.x + halfWidth &&
      y >= imagePosition.y - halfHeight &&
      y <= imagePosition.y + halfHeight
    );
  }, [userImg, imageSize, imagePosition]);
  
  // Verificar si el cursor está sobre el texto
  const isOverText = useCallback((x: number, y: number): boolean => {
    if (!customText || userImg) return false;
    
    const canvas = canvasRef.current;
    if (!canvas) return false;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    
    ctx.font = `${textSize}px ${textFont}`;
    const textWidth = ctx.measureText(customText).width;
    const textHeight = textSize;
    
    return (
      x >= textPosition.x - textWidth / 2 - 5 &&
      x <= textPosition.x + textWidth / 2 + 5 &&
      y >= textPosition.y - textHeight / 2 - 5 &&
      y <= textPosition.y + textHeight / 2 + 5
    );
  }, [customText, userImg, textPosition, textSize, textFont, canvasRef]);

  // Función para determinar si el puntero está sobre un control de redimensionamiento
  const getResizeHandle = useCallback((x: number, y: number): string | null => {
    if (!userImg) return null;
    
    const imgX = imagePosition.x;
    const imgY = imagePosition.y;
    const halfWidth = imageSize.width / 2;
    const halfHeight = imageSize.height / 2;
    
    // Coordenadas de las esquinas y bordes
    const handles = {
      // Esquinas
      nw: { x: imgX - halfWidth, y: imgY - halfHeight },
      ne: { x: imgX + halfWidth, y: imgY - halfHeight },
      se: { x: imgX + halfWidth, y: imgY + halfHeight },
      sw: { x: imgX - halfWidth, y: imgY + halfHeight },
      // Bordes
      n: { x: imgX, y: imgY - halfHeight },
      s: { x: imgX, y: imgY + halfHeight },
      e: { x: imgX + halfWidth, y: imgY },
      w: { x: imgX - halfWidth, y: imgY }
    };
    
    // Comprobar si el puntero está sobre alguna esquina o borde
    for (const pos of HANDLE_POSITIONS) {
      const handle = handles[pos as keyof typeof handles];
      const distance = Math.sqrt(Math.pow(x - handle.x, 2) + Math.pow(y - handle.y, 2));
      
      if (distance <= HANDLE_SIZE) {
        return pos;
      }
    }
    
    return null;
  }, [userImg, imagePosition, imageSize]);

  // Efecto para dibujar en el canvas
  // Función para dibujar en el canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Limpiar el canvas y dibujar un fondo gris para mejor contraste
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar la imagen de la polera
    if (tshirtImg) {
      // Verificar si es una imagen de polera negra (contiene 'black-tshirt' en la ruta)
      const isBlackTshirt = tshirtImg.src.includes('black-tshirt');
      
      // Si no es una polera negra y se debe colorizar
      if (!isBlackTshirt && useColorization && tshirtColor !== '#FFFFFF') {
        // Crear un canvas temporal para la coloración
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        if (tempCtx) {
          // Dibujar la imagen base en el canvas temporal
          tempCtx.drawImage(tshirtImg, 0, 0, canvas.width, canvas.height);
          
          // Obtener los datos de la imagen
          const imageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          // Convertir el color hex a RGB
          const hexToRgb = (hex: string) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return { r, g, b };
          };
          
          const targetColor = hexToRgb(tshirtColor);
          
          // Colorear solo los píxeles no transparentes (la polera)
          for (let i = 0; i < data.length; i += 4) {
            // Si el píxel no es completamente transparente (es parte de la polera)
            if (data[i + 3] > 0) {
              // Obtener la luminosidad del píxel original (escala de grises)
              const brightness = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
              
              // Aplicar el color manteniendo las sombras y luces de la imagen original
              data[i] = Math.floor(targetColor.r * brightness);
              data[i + 1] = Math.floor(targetColor.g * brightness);
              data[i + 2] = Math.floor(targetColor.b * brightness);
            }
          }
          
          // Poner los datos modificados de vuelta en el canvas temporal
          tempCtx.putImageData(imageData, 0, 0);
          
          // Dibujar el canvas temporal en el canvas principal
          ctx.drawImage(tempCanvas, 0, 0);
        } else {
          // Si no se puede crear el contexto temporal, usar el método anterior
          ctx.drawImage(tshirtImg, 0, 0, canvas.width, canvas.height);
        }
      } else {
        // Si es una polera negra o no se usa colorización, simplemente dibujar la imagen de la polera
        ctx.drawImage(tshirtImg, 0, 0, canvas.width, canvas.height);
      }
    }
    
    // Dibujar la imagen personalizada
    if (userImg) {
      ctx.save();
      
      // Dibujar la imagen
      ctx.translate(imagePosition.x, imagePosition.y);
      ctx.drawImage(
        userImg,
        -imageSize.width / 2,
        -imageSize.height / 2,
        imageSize.width,
        imageSize.height
      );
      
      // Dibujar controles de redimensionamiento si la imagen está seleccionada
      if (isDragging && dragTarget === 'image' || isResizing) {
        const halfWidth = imageSize.width / 2;
        const halfHeight = imageSize.height / 2;
        
        // Dibujar un borde alrededor de la imagen
        ctx.strokeStyle = 'rgba(0, 120, 215, 0.7)';
        ctx.lineWidth = 2;
        ctx.strokeRect(
          -halfWidth,
          -halfHeight,
          imageSize.width,
          imageSize.height
        );
        
        // Dibujar controles en las esquinas y bordes
        ctx.fillStyle = 'rgba(0, 120, 215, 0.9)';
        
        // Esquinas
        const corners = [
          { x: -halfWidth, y: -halfHeight }, // nw
          { x: halfWidth, y: -halfHeight }, // ne
          { x: halfWidth, y: halfHeight }, // se
          { x: -halfWidth, y: halfHeight }  // sw
        ];
        
        // Bordes medios
        const edges = [
          { x: 0, y: -halfHeight }, // n
          { x: 0, y: halfHeight }, // s
          { x: halfWidth, y: 0 }, // e
          { x: -halfWidth, y: 0 }  // w
        ];
        
        // Dibujar todas las esquinas
        for (const corner of corners) {
          ctx.beginPath();
          ctx.arc(corner.x, corner.y, HANDLE_SIZE / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Dibujar todos los bordes medios
        for (const edge of edges) {
          ctx.beginPath();
          ctx.arc(edge.x, edge.y, HANDLE_SIZE / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      ctx.restore();
    }
    
    // Dibujar el texto personalizado
    if (customText && !userImg) {
      ctx.save();
      
      // Dibujar el texto
      ctx.font = `${textSize}px ${textFont}`;
      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(customText, textPosition.x, textPosition.y);
      
      // Dibujar un borde alrededor del texto cuando se está arrastrando
      if (isDragging && dragTarget === 'text') {
        const textWidth = ctx.measureText(customText).width;
        const textHeight = textSize;
        
        ctx.strokeStyle = 'rgba(0, 120, 215, 0.7)';
        ctx.lineWidth = 2;
        ctx.strokeRect(
          textPosition.x - textWidth / 2 - 5,
          textPosition.y - textHeight / 2 - 5,
          textWidth + 10,
          textHeight + 10
        );
      }
      
      ctx.restore();
    }
  }, [tshirtImg, tshirtColor, useColorization, userImg, imagePosition, imageSize, textPosition, textSize, textFont, textColor, customText, isDragging, dragTarget, isResizing]);

  // Función para manejar el movimiento del mouse
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Actualizar el cursor según la posición
    if (!isDragging && !isResizing) {
      const handle = getResizeHandle(x, y);
      if (handle) {
        // Cambiar cursor según la esquina
        switch (handle) {
          case 'nw':
          case 'se':
            canvasRef.current.style.cursor = 'nwse-resize';
            break;
          case 'ne':
          case 'sw':
            canvasRef.current.style.cursor = 'nesw-resize';
            break;
          case 'n':
          case 's':
            canvasRef.current.style.cursor = 'ns-resize';
            break;
          case 'e':
          case 'w':
            canvasRef.current.style.cursor = 'ew-resize';
            break;
          default:
            canvasRef.current.style.cursor = 'default';
        }
      } else if (isOverImage(x, y)) {
        canvasRef.current.style.cursor = 'move';
      } else if (isOverText(x, y)) {
        canvasRef.current.style.cursor = 'move';
      } else {
        canvasRef.current.style.cursor = 'default';
      }
    }
    
    // Manejar el arrastre
    if (isDragging && dragTarget && canvasRef.current) {
      if (dragTarget === 'image' && userImg) {
        let newX = x - dragOffset.x;
        let newY = y - dragOffset.y;
        
        // Limitar la posición para que la imagen no se salga del canvas
        const halfWidth = imageSize.width / 2;
        const halfHeight = imageSize.height / 2;
        const canvasWidth = canvasRef.current.width;
        const canvasHeight = canvasRef.current.height;
        
        // Aplicar límites
        newX = Math.max(halfWidth, Math.min(newX, canvasWidth - halfWidth));
        newY = Math.max(halfHeight, Math.min(newY, canvasHeight - halfHeight));
        
        setImagePosition({ x: newX, y: newY });
      } else if (dragTarget === 'text' && customText) {
        let newX = x - dragOffset.x;
        let newY = y - dragOffset.y;
        
        // Obtener el contexto para medir el texto
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.font = `${textSize}px ${textFont}`;
          const textWidth = ctx.measureText(customText).width;
          const textHeight = textSize;
          const canvasWidth = canvasRef.current.width;
          const canvasHeight = canvasRef.current.height;
          
          // Aplicar límites para el texto
          newX = Math.max(textWidth / 2 + 5, Math.min(newX, canvasWidth - textWidth / 2 - 5));
          newY = Math.max(textHeight / 2 + 5, Math.min(newY, canvasHeight - textHeight / 2 - 5));
        }
        
        setTextPosition({ x: newX, y: newY });
      }
    }
    
    // Manejar el redimensionamiento
    if (isResizing && resizeHandle && userImg) {
      const centerX = imagePosition.x;
      const centerY = imagePosition.y;
      
      let newWidth = startSize.width;
      let newHeight = startSize.height;
      
      // Obtener la proporción original para usarla solo en las esquinas
      const ratio = startSize.width / startSize.height;
      const keepAspectRatio = !['n', 's', 'e', 'w'].includes(resizeHandle);
      
      switch (resizeHandle) {
        case 'nw': // Esquina superior izquierda
          newWidth = startSize.width + (centerX - x) * 2;
          newHeight = startSize.height + (centerY - y) * 2;
          break;
        case 'ne': // Esquina superior derecha
          newWidth = startSize.width + (x - centerX) * 2;
          newHeight = startSize.height + (centerY - y) * 2;
          break;
        case 'se': // Esquina inferior derecha
          newWidth = startSize.width + (x - centerX) * 2;
          newHeight = startSize.height + (y - centerY) * 2;
          break;
        case 'sw': // Esquina inferior izquierda
          newWidth = startSize.width + (centerX - x) * 2;
          newHeight = startSize.height + (y - centerY) * 2;
          break;
        case 'n': // Borde superior (solo altura)
          newHeight = startSize.height + (centerY - y) * 2;
          break;
        case 's': // Borde inferior (solo altura)
          newHeight = startSize.height + (y - centerY) * 2;
          break;
        case 'e': // Borde derecho (solo ancho)
          newWidth = startSize.width + (x - centerX) * 2;
          break;
        case 'w': // Borde izquierdo (solo ancho)
          newWidth = startSize.width + (centerX - x) * 2;
          break;
      }
      
      // Mantener proporción solo para las esquinas
      if (keepAspectRatio) {
        if (Math.abs(newWidth / newHeight - ratio) > 0.1) {
          if (newWidth / ratio > newHeight) {
            newWidth = newHeight * ratio;
          } else {
            newHeight = newWidth / ratio;
          }
        }
      }
      
      // Establecer un tamaño mínimo y máximo
      const minSize = 30;
      const canvasWidth = canvasRef.current?.width || 500;
      const canvasHeight = canvasRef.current?.height || 600;
      
      // Asegurarse de que la imagen no sea más grande que el canvas
      const maxWidth = canvasWidth * 0.9; // 90% del ancho del canvas
      const maxHeight = canvasHeight * 0.9; // 90% del alto del canvas
      
      // Aplicar límites de tamaño
      newWidth = Math.max(minSize, Math.min(newWidth, maxWidth));
      newHeight = Math.max(minSize, Math.min(newHeight, maxHeight));
      
      setImageSize({ width: newWidth, height: newHeight });
      
      // Asegurarse de que la imagen no se salga del canvas después del redimensionamiento
      const halfNewWidth = newWidth / 2;
      const halfNewHeight = newHeight / 2;
      let newPosX = imagePosition.x;
      let newPosY = imagePosition.y;
      
      // Ajustar la posición si es necesario
      if (newPosX - halfNewWidth < 0) newPosX = halfNewWidth;
      if (newPosX + halfNewWidth > canvasWidth) newPosX = canvasWidth - halfNewWidth;
      if (newPosY - halfNewHeight < 0) newPosY = halfNewHeight;
      if (newPosY + halfNewHeight > canvasHeight) newPosY = canvasHeight - halfNewHeight;
      
      // Actualizar la posición si fue ajustada
      if (newPosX !== imagePosition.x || newPosY !== imagePosition.y) {
        setImagePosition({ x: newPosX, y: newPosY });
      }
    }
  }, [isDragging, isResizing, dragTarget, dragOffset, resizeHandle, startSize, imagePosition, userImg, customText, getResizeHandle, isOverImage, isOverText, canvasRef, imageSize, textFont, textSize]);
  
  // Manejar el inicio del arrastre
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Comprobar si se ha hecho clic en un controlador de redimensionamiento
    const handle = getResizeHandle(x, y);
    if (handle) {
      setIsResizing(true);
      setResizeHandle(handle);
      setStartSize({ ...imageSize });
      // No need to set start position as we're only using startSize
      return;
    }
    
    // Comprobar si se ha hecho clic en el texto
    if (customText && !userImg && isOverText(x, y)) {
      setIsDragging(true);
      setDragTarget('text');
      setDragOffset({
        x: x - textPosition.x,
        y: y - textPosition.y
      });
      return;
    }
    
    // Comprobar si se ha hecho clic en la imagen
    if (userImg && isOverImage(x, y)) {
      setIsDragging(true);
      setDragTarget('image');
      setDragOffset({
        x: x - imagePosition.x,
        y: y - imagePosition.y
      });
    }
  }, [customText, userImg, imageSize, textPosition, imagePosition, getResizeHandle, isOverText, isOverImage]);
  
  // Manejar el final del arrastre o redimensionamiento
  const handleMouseUp = useCallback(() => {
    // Si estábamos redimensionando y hay una función de callback para actualizar el tamaño de la imagen
    if (isResizing && onUpdateImageSize) {
      onUpdateImageSize(imageSize.width, imageSize.height);
    }
    
    // Si estábamos arrastrando el texto y hay una función de callback para actualizar la posición del texto
    if (isDragging && dragTarget === 'text' && onUpdateTextPosition) {
      onUpdateTextPosition(textPosition.x, textPosition.y);
    }
    
    // Si estábamos arrastrando la imagen y hay una función de callback para actualizar la posición de la imagen
    if (isDragging && dragTarget === 'image' && onUpdateImagePosition) {
      onUpdateImagePosition(imagePosition.x, imagePosition.y);
    }
    
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
    setDragTarget(null);
    
    if (canvasRef.current) {
      canvasRef.current.style.cursor = 'default';
    }
  }, [isResizing, isDragging, dragTarget, imageSize, textPosition, imagePosition, onUpdateImageSize, onUpdateTextPosition, onUpdateImagePosition, canvasRef]);
  
  // Manejar eventos de teclado para ajustar el tamaño del texto
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLCanvasElement>) => {
    // Solo procesar eventos si hay texto y no hay imagen
    if (customText && !userImg) {
      // Aumentar tamaño con tecla +
      if (e.key === '+' || e.key === '=') {
        if (onUpdateTextSize) {
          onUpdateTextSize(Math.min(60, textSize + 2));
        }
      }
      
      // Disminuir tamaño con tecla -
      if (e.key === '-' || e.key === '_') {
        if (onUpdateTextSize) {
          onUpdateTextSize(Math.max(10, textSize - 2));
        }
      }
    }
  }, [customText, userImg, textSize, onUpdateTextSize]);
  
  // Cargar imágenes cuando cambian las props
  useEffect(() => {
    if (tshirtImage) {
      const img = new Image();
      img.src = tshirtImage;
      img.onload = () => {
        setTshirtImg(img);
      };
    }
    
    // No se requiere máscara para la coloración simplificada
    
    if (customImage) {
      const img = new Image();
      img.src = customImage;
      img.onload = () => {
        setUserImg(img);
      };
    } else {
      setUserImg(null);
    }
  }, [tshirtImage, customImage, useColorization]);
  
  // Actualizar posiciones y tamaños cuando cambian las props
  useEffect(() => {
    setTextPosition({ x: textPositionX, y: textPositionY });
  }, [textPositionX, textPositionY]);
  
  useEffect(() => {
    setImagePosition({ x: imagePositionX, y: imagePositionY });
  }, [imagePositionX, imagePositionY]);
  useEffect(() => {
    setImageSize({ width: imageWidth, height: imageHeight });
  }, [imageWidth, imageHeight]);

  // Función para capturar el canvas como imagen base64
  const captureCanvas = useCallback(() => {
    if (!canvasRef.current) return undefined;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    return dataUrl;
  }, [canvasRef]);

  // Exponer la función de captura a través de la ref
  useImperativeHandle(ref, () => ({
    captureCanvas
  }), [captureCanvas]);

  // Manejadores de eventos táctiles para dispositivos móviles
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Prevenir el comportamiento predeterminado (scrolling, zooming)
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0]; // Primer toque
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    // Usar la misma lógica que handleMouseDown
    // Comprobar si se ha tocado un controlador de redimensionamiento
    const handle = getResizeHandle(x, y);
    if (handle) {
      setIsResizing(true);
      setResizeHandle(handle);
      setStartSize({ ...imageSize });
      return;
    }
    
    // Comprobar si se ha tocado el texto
    if (customText && isOverText(x, y)) {
      setIsDragging(true);
      setDragTarget('text');
      // Calcular el offset desde el punto de toque hasta el centro del texto
      setDragOffset({
        x: x - textPosition.x,
        y: y - textPosition.y
      });
      return;
    }
    
    // Comprobar si se ha tocado la imagen
    if (userImg && isOverImage(x, y)) {
      setIsDragging(true);
      setDragTarget('image');
      // Calcular el offset desde el punto de toque hasta el centro de la imagen
      setDragOffset({
        x: x - imagePosition.x,
        y: y - imagePosition.y
      });
    }
  }, [customText, userImg, imageSize, textPosition, imagePosition, getResizeHandle, isOverText, isOverImage]);
  
  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Prevenir el comportamiento predeterminado
    
    if (!canvasRef.current) return;
    if (!isDragging && !isResizing) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches[0]; // Primer toque
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    // Manejar el arrastre - misma lógica que handleMouseMove
    if (isDragging && dragTarget && canvasRef.current) {
      if (dragTarget === 'image' && userImg) {
        // Usar el offset para calcular la nueva posición
        // Esto es clave para un movimiento fluido
        let newX = x - dragOffset.x;
        let newY = y - dragOffset.y;
        
        // Limitar la posición para que la imagen no se salga del canvas
        const halfWidth = imageSize.width / 2;
        const halfHeight = imageSize.height / 2;
        const canvasWidth = canvasRef.current.width;
        const canvasHeight = canvasRef.current.height;
        
        // Aplicar límites
        newX = Math.max(halfWidth, Math.min(newX, canvasWidth - halfWidth));
        newY = Math.max(halfHeight, Math.min(newY, canvasHeight - halfHeight));
        
        setImagePosition({ x: newX, y: newY });
      } else if (dragTarget === 'text' && customText) {
        // Usar el offset para calcular la nueva posición
        let newX = x - dragOffset.x;
        let newY = y - dragOffset.y;
        
        // Obtener el contexto para medir el texto
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.font = `${textSize}px ${textFont}`;
          const textWidth = ctx.measureText(customText).width;
          const textHeight = textSize;
          const canvasWidth = canvasRef.current.width;
          const canvasHeight = canvasRef.current.height;
          
          // Aplicar límites para el texto
          newX = Math.max(textWidth / 2 + 5, Math.min(newX, canvasWidth - textWidth / 2 - 5));
          newY = Math.max(textHeight / 2 + 5, Math.min(newY, canvasHeight - textHeight / 2 - 5));
        }
        
        setTextPosition({ x: newX, y: newY });
      }
    }
    
    // Manejar el redimensionamiento - misma lógica que en handleMouseMove
    if (isResizing && resizeHandle && userImg && canvasRef.current) {
      const centerX = imagePosition.x;
      const centerY = imagePosition.y;
      
      let newWidth = startSize.width;
      let newHeight = startSize.height;
      
      // Obtener la proporción original para usarla solo en las esquinas
      const ratio = startSize.width / startSize.height;
      const keepAspectRatio = !['n', 's', 'e', 'w'].includes(resizeHandle);
      
      // Misma lógica de redimensionamiento que en handleMouseMove
      switch (resizeHandle) {
        case 'nw': // Esquina superior izquierda
          newWidth = startSize.width + (centerX - x) * 2;
          newHeight = startSize.height + (centerY - y) * 2;
          break;
        case 'ne': // Esquina superior derecha
          newWidth = startSize.width + (x - centerX) * 2;
          newHeight = startSize.height + (centerY - y) * 2;
          break;
        case 'se': // Esquina inferior derecha
          newWidth = startSize.width + (x - centerX) * 2;
          newHeight = startSize.height + (y - centerY) * 2;
          break;
        case 'sw': // Esquina inferior izquierda
          newWidth = startSize.width + (centerX - x) * 2;
          newHeight = startSize.height + (y - centerY) * 2;
          break;
        case 'n': // Borde superior (solo altura)
          newHeight = startSize.height + (centerY - y) * 2;
          break;
        case 's': // Borde inferior (solo altura)
          newHeight = startSize.height + (y - centerY) * 2;
          break;
        case 'e': // Borde derecho (solo ancho)
          newWidth = startSize.width + (x - centerX) * 2;
          break;
        case 'w': // Borde izquierdo (solo ancho)
          newWidth = startSize.width + (centerX - x) * 2;
          break;
      }
      
      // Mantener proporción solo para las esquinas
      if (keepAspectRatio) {
        if (Math.abs(newWidth / newHeight - ratio) > 0.1) {
          if (newWidth / ratio > newHeight) {
            newWidth = newHeight * ratio;
          } else {
            newHeight = newWidth / ratio;
          }
        }
      }
      
      // Aplicar límites de tamaño
      const minSize = 30;
      const canvasWidth = canvasRef.current.width;
      const canvasHeight = canvasRef.current.height;
      const maxWidth = canvasWidth * 0.9;
      const maxHeight = canvasHeight * 0.9;
      
      newWidth = Math.max(minSize, Math.min(newWidth, maxWidth));
      newHeight = Math.max(minSize, Math.min(newHeight, maxHeight));
      
      setImageSize({ width: newWidth, height: newHeight });
    }
  }, [isDragging, isResizing, dragTarget, dragOffset, resizeHandle, startSize, imagePosition, userImg, customText, imageSize, textFont, textSize]);
  
  const handleTouchEnd = useCallback(() => {
    // Usar la misma lógica que handleMouseUp
    if (isResizing && onUpdateImageSize) {
      onUpdateImageSize(imageSize.width, imageSize.height);
    }
    
    if (isDragging && dragTarget === 'text' && onUpdateTextPosition) {
      onUpdateTextPosition(textPosition.x, textPosition.y);
    }
    
    if (isDragging && dragTarget === 'image' && onUpdateImagePosition) {
      onUpdateImagePosition(imagePosition.x, imagePosition.y);
    }
    
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
    setDragTarget(null);
    
    // Forzar un redibujado final
    requestAnimationFrame(() => {
      if (canvasRef.current) {
        drawCanvas();
      }
    });
  }, [isResizing, isDragging, dragTarget, imageSize, textPosition, imagePosition, onUpdateImageSize, onUpdateTextPosition, onUpdateImagePosition, drawCanvas]);

  // Efecto para el redimensionamiento de la ventana
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.clientWidth;
      const newWidth = Math.min(500, containerWidth - 20); // 20px de margen
      const newHeight = (newWidth * 6) / 5; // Mantener proporción 5:6

      setCanvasSize({ width: newWidth, height: newHeight });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Efecto para redibujar el canvas cuando cambian estados relevantes
  useEffect(() => {
    if (canvasRef.current) {
      drawCanvas();
    }
  }, [
    drawCanvas, 
    canvasSize, 
    imagePosition, 
    imageSize, 
    textPosition, 
    textSize, 
    customText, 
    tshirtImg, 
    userImg, 
    tshirtColor
  ]);

  return (
    <div ref={containerRef} className="w-full relative flex flex-col items-center overflow-hidden">
      <div className="w-full flex justify-center overflow-visible px-2">
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          className="border border-gray-300 rounded-md shadow-sm"
          style={{ 
            maxWidth: '100%',
            minWidth: '250px',
            display: 'block', // Asegura que el canvas siempre sea visible
            touchAction: 'none', // Prevenir acciones táctiles predeterminadas del navegador
            backgroundColor: '#f0f0f0' // Fondo gris para mejor contraste
          }}
        />
      </div>
    </div>
  );
});

// ...
// Asignar un displayName para las herramientas de desarrollo
HTMLCanvasV2.displayName = 'HTMLCanvasV2';

export default HTMLCanvasV2;