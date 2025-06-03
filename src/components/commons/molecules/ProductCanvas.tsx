'use client';

import React, { useRef, useEffect } from 'react';
import HTMLCanvasV2 from './HTMLCanvasV2';
import { useTheme } from 'next-themes';
import { AngleDesign } from '@/types/product';

interface ProductCanvasProps {
  angle: string;
  color: string;
  className?: string;
  design?: AngleDesign;
}

const ProductCanvas = ({ angle, color, className = '', design }: ProductCanvasProps) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  const canvasRef = useRef(null);
  
  // Mapeo de ángulos a imágenes de polera (usando la polera blanca como base para colorización)
  const angleToImage: Record<string, string> = {
    frente: '/assets/products/white-tshirt/white-tshirt-frente.png',
    espalda: '/assets/products/white-tshirt/white-tshirt-espalda.png',
    izquierda: '/assets/products/white-tshirt/white-tshirt-izquierda.png',
    derecha: '/assets/products/white-tshirt/white-tshirt-derecha.png',
  };
  
  // Obtener la imagen correspondiente al ángulo actual
  const tshirtImage = angleToImage[angle] || angleToImage.frente;
  
  // Efecto para imprimir información de depuración
  useEffect(() => {
    console.log('ProductCanvas renderizado con:', {
      angle,
      color,
      tshirtImage,
      design: design ? 'presente' : 'no presente'
    });
  }, [angle, color, tshirtImage, design]);
  
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
            designImage={design?.image}
            designText={design?.text}
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
};

export default ProductCanvas;
