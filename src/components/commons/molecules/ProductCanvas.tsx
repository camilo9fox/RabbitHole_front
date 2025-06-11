'use client';

import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle, useLayoutEffect } from 'react';
import { useTheme } from 'next-themes';
import HTMLCanvasV2 from './HTMLCanvasV2';
import { AngleDesign, DesignImage, DesignText } from '@/types/product';

// Interfaz para manejar la referencia del canvas
export interface ProductCanvasRefHandle {
  captureCanvas: () => string | null;
}

interface ProductCanvasProps {
  angle: string;
  color: string;
  className?: string;
  design?: AngleDesign;
}

const ProductCanvas = forwardRef<ProductCanvasRefHandle, ProductCanvasProps>(({ angle, color, className = '', design }, ref) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  
  // Usamos any temporalmente para la referencia hasta que podamos definir mejor los tipos
  // Esto evita errores de tipado al usar la referencia con HTMLCanvasV2
  const canvasRef = useRef<any>(null);
  
  // Exponer el método captureCanvas a través de la referencia
  useImperativeHandle(ref, () => ({
    captureCanvas: () => {
      // Usando encadenamiento opcional para simplificar la comprobación
      return canvasRef.current?.captureCanvas?.() ?? null;
    }
  }));
  
  // Estados para manejar correctamente las propiedades de diseño
  const [processedDesignImage, setProcessedDesignImage] = useState<DesignImage | undefined>(undefined);
  const [processedDesignText, setProcessedDesignText] = useState<DesignText | undefined>(undefined);
  
  // Mapeo de ángulos a imágenes de polera (usando la polera blanca como base para colorización)
  const angleToImage: Record<string, string> = {
    frente: '/assets/products/white-tshirt/white-tshirt-frente.png',
    espalda: '/assets/products/white-tshirt/white-tshirt-espalda.png',
    izquierda: '/assets/products/white-tshirt/white-tshirt-izquierda.png',
    derecha: '/assets/products/white-tshirt/white-tshirt-derecha.png',
  };
  
  // Obtener la imagen correspondiente al ángulo actual
  const tshirtImage = angleToImage[angle] || angleToImage.frente;
  
  // Función para precargar una imagen y devolver una promesa
  const preloadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Error al cargar la imagen: ${src}`));
    });
  };

  // Usamos useLayoutEffect para asegurar que el procesamiento de diseño ocurra antes del renderizado
  useLayoutEffect(() => {
    console.log(`ProductCanvas: Procesando diseño para ángulo ${angle}:`, design);
    
    // Limpiar diseños anteriores al cambiar de ángulo
    if (!design) {
      setProcessedDesignImage(undefined);
      setProcessedDesignText(undefined);
      return;
    }
    
    // Procesar texto de diseño inmediatamente (no requiere carga asíncrona)
    if (design.text) {
      const processedText = {
        content: design.text.content,
        font: design.text.font || 'Arial',
        color: design.text.color || '#000000',
        size: design.text.size || 20,
        position: design.text.position || { x: 250, y: 250 }
      };
      
      console.log(`ProductCanvas: Texto procesado para ángulo ${angle}:`, processedText);
      setProcessedDesignText(processedText);
    } else {
      console.log(`ProductCanvas: No hay texto para ángulo ${angle}`);
      setProcessedDesignText(undefined);
    }
    
    // Procesar imagen de diseño
    if (design.image) {
      // Asegurarse de que la imagen de diseño tenga todas las propiedades necesarias
      const processedImage = {
        src: design.image.src,
        position: design.image.position || { x: 250, y: 250 },
        size: design.image.size || { width: 100, height: 100 }
      };
      
      console.log(`ProductCanvas: Imagen procesada para ángulo ${angle}:`, processedImage);
      
      // Actualizar el estado inmediatamente para evitar parpadeos
      setProcessedDesignImage(processedImage);
      
      // Precargar la imagen en segundo plano (no bloqueamos el renderizado)
      preloadImage(processedImage.src)
        .then(() => {
          console.log(`ProductCanvas: Imagen precargada correctamente para ángulo ${angle}`);
        })
        .catch((error) => {
          console.error(`Error al precargar la imagen para ángulo ${angle}:`, error);
        });
    } else {
      console.log(`ProductCanvas: No hay imagen para ángulo ${angle}`);
      setProcessedDesignImage(undefined);
    }
  }, [design, angle]); // Agregar angle como dependencia para asegurar actualización al cambiar ángulo
  
  // Efecto para imprimir información de depuración
  useEffect(() => {
    console.log('ProductCanvas renderizado con:', {
      angle,
      color,
      tshirtImage,
      design: design ? 'presente' : 'no presente',
      processedDesignImage,
      processedDesignText
    });
  }, [angle, color, tshirtImage, design, processedDesignImage, processedDesignText]);
  
  return (
    <div className={`w-full ${className}`}>
      <div className={`aspect-square rounded-xl overflow-hidden ${
        isDarkMode ? 'bg-gray-900' : 'bg-white'
      } border ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="w-full h-full flex items-center justify-center p-4">
          {/* Usar HTMLCanvasV2 para la colorización dinámica */}
          <HTMLCanvasV2
            ref={canvasRef}
            tshirtImage={tshirtImage}
            tshirtColor={color}
            useColorization={true}
            designImage={processedDesignImage}
            designText={processedDesignText}
            key={`${angle}-${color}-${processedDesignImage?.src ?? 'no-image'}`} // Forzar recreación al cambiar imagen o ángulo
          />
          
          {/* Mostrar un mensaje de carga si la imagen no se ha cargado aún */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center p-4 bg-white/80 dark:bg-gray-900/80 rounded-md hidden">
              <p className="text-sm text-gray-600 dark:text-gray-300">Cargando vista {angle}...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// Agregar displayName para eslint
ProductCanvas.displayName = 'ProductCanvas';

export default ProductCanvas;
