'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import HTMLCanvasV2 from './HTMLCanvasV2';
import { CartItem, isStandardItem, isCustomItem } from '@/types/cart';
import { AdminProduct, DesignImage, DesignText } from '@/types/product';
import { getDesignSafely } from '@/utils/cartHelpers';

interface CanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: CartItem;
}

const ANGLES = ['front', 'back', 'left', 'right'] as const;
type Angle = typeof ANGLES[number];

// Función utilitaria para obtener el nombre de visualización del ángulo
const getAngleDisplayName = (angle: Angle): string => {
  switch (angle) {
    case 'front': return 'Frente';
    case 'back': return 'Espalda';
    case 'left': return 'Lado izquierdo';
    case 'right': return 'Lado derecho';
    default: return angle;
  }
};


const CanvasModal: React.FC<CanvasModalProps> = ({ isOpen, onClose, item }) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  
  const [currentAngle, setCurrentAngle] = useState<Angle>('front');
  const [availableAngles, setAvailableAngles] = useState<Angle[]>(['front']);
  const [adminProducts, setAdminProducts] = useState<AdminProduct[]>([])

  useEffect(() => {
    const products = localStorage.getItem("admin_products")
    if (products) {
      setAdminProducts(JSON.parse(products).products)
    }
  }, [localStorage.getItem("admin_products")])
  

    const getTshirtHexColor = useCallback((colorId: string): string => {
      switch (colorId.toLocaleLowerCase()) {
        case 'white': return '#FFFFFF';
        case 'black': return '#1A1A1A';
        case 'gray': return '#808080';
        case 'blue': return '#0047AB';
        case 'navy': return '#000080';
        case 'lightblue': return '#ADD8E6';
        case 'red': return '#FF0000';
        case 'burgundy': return '#800020';
        case 'pink': return '#FFC0CB';
        case 'green': return '#008000';
        case 'olive': return '#808000';
        case 'mint': return '#98FF98';
        case 'purple': return '#800080';
        case 'yellow': return '#FFFF00';
        case 'orange': return '#FFA500';
        case 'blanco': return '#FFFFFF';
        case 'negro': return '#1A1A1A';
        case 'gris': return '#808080';
        case 'azul': return '#0047AB';
        case 'azulmarino': return '#000080';
        case 'azulclaro': return '#ADD8E6';
        case 'rojo': return '#FF0000';
        case 'burdeos': return '#800020';
        case 'rosa': return '#FFC0CB';
        case 'verde': return '#008000';
        case 'oliva': return '#808000';
        case 'menta': return '#98FF98';
        case 'morado': return '#800080';
        case 'amarillo': return '#FFFF00';
        case 'naranja': return '#FFA500';
        default: return '#FFFFFF'; // Valor por defecto
      }
    }, []);
  // Al abrir el modal, determinamos qué ángulos están disponibles para este item
  useEffect(() => {
    if (isOpen && item) {
      if (isStandardItem(item)) {
        // Para productos estándar solo mostramos el frente por ahora
        const selectedProduct = adminProducts.find(product => product.id === item?.product?.id)!
        const angles: Angle[] = [];
        
        ANGLES.forEach((angle) => {
          if (selectedProduct.angles[angle]?.image || selectedProduct.angles[angle]?.text) {
            angles.push(angle);
          }
        });
        
        setAvailableAngles(angles.length > 0 ? angles : ['front']);
      } else if (isCustomItem(item)) {
        // Para diseños personalizados, chequeamos qué ángulos tienen diseño
        const angles: Angle[] = [];
        
        ANGLES.forEach((angle) => {
          if (item.design?.[angle as keyof typeof item.design]) {
            angles.push(angle);
          }
        });
        
        setAvailableAngles(angles.length > 0 ? angles : ['front']);
      }
      
      // Siempre comenzamos con el frente
      setCurrentAngle('front');
    }
  }, [isOpen, item]);
  
  const handlePrevAngle = () => {
    const currentIndex = availableAngles.indexOf(currentAngle);
    const prevIndex = (currentIndex - 1 + availableAngles.length) % availableAngles.length;
    setCurrentAngle(availableAngles[prevIndex]);
  };
  
  const handleNextAngle = () => {
    const currentIndex = availableAngles.indexOf(currentAngle);
    const nextIndex = (currentIndex + 1) % availableAngles.length;
    setCurrentAngle(availableAngles[nextIndex]);
  };
  
  // Obtener la imagen de la polera base según el ángulo
  const getTshirtImage = (): string => {
    // Convertir ángulo en inglés al equivalente en español para las rutas de imágenes
    const angleMap: Record<Angle, string> = {
      'front': 'frente',
      'back': 'espalda',
      'left': 'izquierda',
      'right': 'derecha'
    };
    
    // Obtener el color para determinar qué carpeta usar
    const colorName = 'white';
  
    
    // Construir la ruta correcta
    return `/assets/products/${colorName}-tshirt/${colorName}-tshirt-${angleMap[currentAngle]}.png`;
  };
  
  // Obtener el color de la polera
  const getTshirtColor = (): string => {
    if (isStandardItem(item)) {
      return item.product!.color ?? '#FFFFFF';
    }
    if (isCustomItem(item)) {
      const design = getDesignSafely(item);
      if (design?.color) {
        return getTshirtHexColor(design.color) ?? '#FFFFFF';
      }
    }
    return '#FFFFFF'; // Blanco por defecto
  };
  
  // Obtener la imagen del diseño según el ángulo
  const getDesignImage = (): DesignImage | undefined => {
    if (isStandardItem(item)) {
      // Para productos estándar, usamos la primera imagen disponible
      const selectedProduct = adminProducts.find(product => product.id === item?.product?.id)
      console.log({item, selectedProduct})
      const angleView = selectedProduct?.angles?.[currentAngle];
      if (angleView && 'image' in angleView && angleView.image) {
        return {
          src: angleView.image.src,
          position: {
            x: angleView.image.position.x ?? 250,
            y: angleView.image.position.y ?? 250
          },
          size: {
            width: angleView.image.size.width,
            height: angleView.image.size.height
          }
        };
      }
    } else if (isCustomItem(item)) {
      // Para diseños personalizados usando acceso seguro
      const design = getDesignSafely(item);
      const angleView = design?.[currentAngle];
      
      // Verificar que angleView existe y tiene una imagen
      if (angleView && 'image' in angleView && angleView.image) {
        return {
          src: angleView.image,
          position: {
            x: angleView.imagePositionX ?? 250,
            y: angleView.imagePositionY ?? 250
          },
          size: {
            width: angleView.imageWidth ?? 200,
            height: angleView.imageHeight ?? 200
          }
        };
      }
    }
    return undefined;
  };
  
  // Obtener el diseño de texto según el ángulo
  const getDesignText = (): DesignText | undefined => {
    if (isStandardItem(item)) {
      const selectedProduct = adminProducts.find(product => product.id === item?.product?.id)
      const angleView = selectedProduct?.angles?.[currentAngle];
      if (angleView && 'text' in angleView && angleView.text) {
        return {
          content: angleView.text.content,
          position: {
            x: angleView.text.position.x ?? 250,
            y: angleView.text.position.y ?? 250
          },
          size: angleView.text.size,
          font: angleView.text.font,
          color: angleView.text.color
        };
      }
    }
    else if (isCustomItem(item)) {
      const design = getDesignSafely(item);
      const angleView = design?.[currentAngle];
      
      // Verificar que angleView existe y tiene texto
      if (angleView && 'text' in angleView && angleView.text) {
        return {
          content: angleView.text,
          position: {
            x: angleView.textPositionX ?? 250,
            y: angleView.textPositionY ?? 250
          },
          size: angleView.textSize ?? 24,
          font: angleView.textFont ?? 'Arial',
          color: angleView.textColor ?? '#000000'
        };
      }
    }
    return undefined;
  };
  
  if (!isOpen) return null;


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70">
      <div className={`relative max-w-2xl w-full rounded-lg shadow-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} overflow-hidden`}>
        {/* Header */}
        <div className={`flex justify-between items-center p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {isStandardItem(item) ? item.product?.name : 'Diseño personalizado'}
          </h3>
          <button
            onClick={onClose}
            className={`p-2 rounded-full hover:bg-opacity-10 hover:bg-gray-500 transition-colors text-gray-500 hover:text-gray-700`}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Canvas Container */}
        <div className="relative p-4">
          {/* Canvas */}
          <div className="flex justify-center">
            <HTMLCanvasV2
              tshirtImage={getTshirtImage()}
              tshirtColor={getTshirtColor()}
              useColorization={true}
              designImage={getDesignImage()}
              designText={getDesignText()}
            />
          </div>
          
          {/* Ángulo actual */}
          <div className="mt-4 flex items-center justify-center">
            <span className={`text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} capitalize`}>
              {getAngleDisplayName(currentAngle)}
            </span>
          </div>
        </div>
        
        {/* Navigation */}
        {availableAngles.length > 1 && (
          <div className={`flex justify-between p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              onClick={handlePrevAngle}
              className={`flex items-center px-4 py-2 rounded-md ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Anterior
            </button>
            
            <button
              onClick={handleNextAngle}
              className={`flex items-center px-4 py-2 rounded-md ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
            >
              Siguiente
              <ChevronRight className="h-5 w-5 ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CanvasModal;
