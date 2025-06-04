'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import HTMLCanvasV2 from './HTMLCanvasV2';
import { DesignImage, DesignText } from '@/types/product';
import { getAdminProductById } from '@/services/adminProductService';

interface ProductCardCanvasProps {
  id: string;
  title: string; // Nombre del producto
  price: number;
  image: string;
  category: string;
  color?: string;
  angle?: string;
}

const ProductCardCanvas: React.FC<ProductCardCanvasProps> = ({
  id,
  title,
  price,
  image,
  category,
  color = '#FFFFFF',
  angle = 'frente',
}) => {
  // Estado para la ruta de la imagen base de la polera
  const [tshirtBasePath, setTshirtBasePath] = useState<string>(`/assets/products/${color === '#FFFFFF' ? 'white' : color.replace('#', '')}-tshirt/${color === '#FFFFFF' ? 'white' : color.replace('#', '')}-tshirt-${angle}.png`);
  const [designImage, setDesignImage] = useState<DesignImage | null>(null);
  const [imageError, setImageError] = useState(false);

  // Función para verificar si una imagen existe
  const checkImageExists = useCallback((src: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        console.log(`Imagen cargada correctamente: ${src}`);
        resolve(true);
      };
      img.onerror = (error) => {
        console.error(`Error al cargar la imagen: ${src}`, error);
        resolve(false);
      };
      img.src = src;
    });
  }, []);

  // Función para obtener el nombre del color de la polera a partir del código hexadecimal
  const getTshirtColorName = useCallback((hexColor: string): string => {
    switch (hexColor) {
      case '#FFFFFF': return 'white';
      case '#000000': return 'black';
      case '#0000FF': return 'blue';
      case '#808080': return 'gray';
      case '#FF0000': return 'red';
      default: return 'white';
    }
  }, []);

  // Efecto para cargar la imagen base de la polera
  useEffect(() => {
    const loadTshirtImage = async () => {
      try {
        // Obtener el nombre del color para la ruta de la imagen
        const colorName = getTshirtColorName(color);
        
        // Intentar cargar la imagen con el ángulo especificado
        const basePath = `/assets/products/${colorName}-tshirt/${colorName}-tshirt-${angle}.png`;
        console.log('Intentando cargar imagen de polera desde:', basePath);
        
        const mainImageExists = await checkImageExists(basePath);
        if (mainImageExists) {
          setTshirtBasePath(basePath);
          return;
        }
        
        // Si no se encuentra la imagen con el ángulo especificado, intentar con la vista frontal
        console.log('Imagen principal no encontrada, intentando alternativa');
        const frontPath = `/assets/products/${colorName}-tshirt/${colorName}-tshirt-frente.png`;
        const frontExists = await checkImageExists(frontPath);
        if (frontExists) {
          setTshirtBasePath(frontPath);
          return;
        }
        
        // Si aún no se encuentra, intentar con poleras de otros colores
        const fallbackPaths = [
          '/assets/products/white-tshirt/white-tshirt-frente.png',
          '/assets/products/black-tshirt/black-tshirt-frente.png'
        ];
        
        for (const path of fallbackPaths) {
          console.log(`Intentando ruta alternativa: ${path}`);
          const exists = await checkImageExists(path);
          if (exists) {
            setTshirtBasePath(path);
            return;
          }
        }
        
        // Si no se encuentra ninguna imagen, mostrar error
        setImageError(true);
        console.error('No se pudo cargar ninguna imagen de polera');
      } catch (error) {
        console.error('Error al cargar la imagen de la polera:', error);
        setImageError(true);
      }
    };
    
    loadTshirtImage();
  }, [color, angle, checkImageExists, getTshirtColorName]);



  // Función para crear un objeto de imagen de diseño con tamaño y posición optimizados
  const createDesignObject = useCallback((src: string): DesignImage => {
    return {
      src,
      position: { x: 250, y: 250 }, // Centrado en el canvas
      size: { width: 200, height: 200 } // Tamaño adecuado para el diseño
    };
  }, []);

  // Función para obtener el nombre del ángulo en español a partir del nombre en inglés
  const getSpanishAngleName = useCallback((englishAngle: string): string => {
    const reverseAngleMap: Record<string, string> = {
      'front': 'frente',
      'back': 'espalda',
      'left': 'izquierda',
      'right': 'derecha'
    };
    return reverseAngleMap[englishAngle] || 'frente';
  }, []);

  // Efecto para cargar el diseño del producto
  // Estado para almacenar el texto del diseño
  const [designText, setDesignText] = useState<DesignText | null>(null);
  
  useEffect(() => {
    const loadProductDesign = async () => {
      try {
        console.log(`Cargando diseño para producto ID: ${id}, ángulo: ${angle}`);
        
        // Obtener el producto completo desde localStorage
        const product = getAdminProductById(id);
        console.log('Producto obtenido:', product);
        
        if (!product) {
          console.log(`No se encontró el producto con ID: ${id}`);
          return;
        }
        
        // Mapear los ángulos en español a las propiedades en inglés del objeto angles
        const angleMap: Record<string, keyof typeof product.angles> = {
          'frente': 'front',
          'espalda': 'back',
          'izquierda': 'left',
          'derecha': 'right'
        };
        
        // Orden de prioridad para los ángulos (inglés)
        const priorityAngles: (keyof typeof product.angles)[] = ['front', 'back', 'left', 'right'];
        
        // Primero intentamos usar el ángulo especificado si tiene diseño
        const requestedAngleKey = angleMap[angle] || 'front';
        console.log(`Ángulo solicitado: ${angle} -> ${requestedAngleKey}`);
        
        // Verificar si hay diseño de imagen o texto en el ángulo solicitado
        if (product.angles?.[requestedAngleKey]?.image) {
          console.log(`Usando diseño de imagen del ángulo solicitado: ${requestedAngleKey}`);
          setDesignImage(product.angles[requestedAngleKey].image);
          setDesignText(null); // Limpiar texto si existe
          return;
        } else if (product.angles?.[requestedAngleKey]?.text) {
          console.log(`Usando diseño de texto del ángulo solicitado: ${requestedAngleKey}`);
          setDesignText(product.angles[requestedAngleKey].text);
          setDesignImage(null); // Limpiar imagen si existe
          return;
        }
        
        // Si el ángulo solicitado no tiene diseño, buscamos el primer ángulo con diseño según la prioridad
        console.log('El ángulo solicitado no tiene diseño, buscando alternativas...');
        
        // Buscamos el primer ángulo con diseño según la prioridad
        let selectedAngle: keyof typeof product.angles | null = null;

        
        for (const priorityAngle of priorityAngles) {
          // Primero verificamos si hay imagen
          if (product.angles?.[priorityAngle]?.image) {
            console.log(`Usando diseño de imagen del ángulo prioritario: ${priorityAngle}`);
            selectedAngle = priorityAngle;
            setDesignImage(product.angles[priorityAngle].image);
            setDesignText(null); // Limpiar texto si existe

            break;
          } 
          // Luego verificamos si hay texto
          else if (product.angles?.[priorityAngle]?.text) {
            console.log(`Usando diseño de texto del ángulo prioritario: ${priorityAngle}`);
            selectedAngle = priorityAngle;
            setDesignText(product.angles[priorityAngle].text);
            setDesignImage(null); // Limpiar imagen si existe

            break;
          }
        }
        
        // Si encontramos un ángulo con diseño, actualizamos la imagen de la polera
        if (selectedAngle) {
          // Actualizar el ángulo de la polera para que coincida con el diseño
          const spanishAngle = getSpanishAngleName(selectedAngle);
          console.log(`Actualizando ángulo de la polera a: ${spanishAngle}`);
          
          // Cargar la imagen de la polera para el nuevo ángulo
          const colorName = getTshirtColorName(color);
          const newTshirtPath = `/assets/products/${colorName}-tshirt/${colorName}-tshirt-${spanishAngle}.png`;
          
          // Verificar si existe la imagen para este ángulo
          const imageExists = await checkImageExists(newTshirtPath);
          if (imageExists) {
            setTshirtBasePath(newTshirtPath);
            console.log(`Imagen de polera actualizada a: ${newTshirtPath}`);
          } else {
            console.log(`No se encontró imagen de polera para el ángulo: ${spanishAngle}, usando fallback`);
          }
          
          return;
        }
        
        // Si no hay diseño o no tiene imagen, intentar usar la imagen proporcionada
        if (image) {
          console.log('Intentando usar imagen proporcionada como diseño:', image);
          const exists = await checkImageExists(image);
          if (exists) {
            setDesignImage(createDesignObject(image));
            return;
          }
        }
        
        console.log('No se encontró ninguna imagen de diseño válida');
      } catch (error) {
        console.error('Error al cargar el diseño del producto:', error);
        setImageError(true);
      }
    };
    
    loadProductDesign();
  }, [id, angle, image, checkImageExists, createDesignObject, color, getTshirtColorName, getSpanishAngleName]);

  // Efecto para recargar el diseño cuando cambia el ID del producto
  // Esto es crucial para asegurar que el diseño se actualice cuando se edita un producto
  useEffect(() => {
    console.log(`ID de producto cambiado a: ${id}, recargando diseño...`);
    
    // Limpiar el estado actual
    setDesignImage(null);
    setImageError(false);
    
    // Recargar el diseño con un pequeño retraso para asegurar que localStorage esté actualizado
    const timer = setTimeout(async () => {
      try {
        const product = getAdminProductById(id);
        if (!product) {
          console.log(`No se encontró el producto con ID: ${id} al recargar`);
          return;
        }
        
        // Mapear los ángulos en español a las propiedades en inglés
        const angleMap: Record<string, keyof typeof product.angles> = {
          'frente': 'front',
          'espalda': 'back',
          'izquierda': 'left',
          'derecha': 'right'
        };
        
        // Orden de prioridad para los ángulos (inglés)
        const priorityAngles: (keyof typeof product.angles)[] = ['front', 'back', 'left', 'right'];
        
        // Primero intentamos usar el ángulo especificado si tiene diseño
        const requestedAngleKey = angleMap[angle] || 'front';
        console.log(`Ángulo solicitado al recargar: ${angle} -> ${requestedAngleKey}`);
        
        // Verificar si hay diseño de imagen o texto en el ángulo solicitado
        if (product.angles?.[requestedAngleKey]?.image) {
          console.log(`Usando diseño de imagen del ángulo solicitado al recargar: ${requestedAngleKey}`);
          setDesignImage(product.angles[requestedAngleKey].image);
          setDesignText(null); // Limpiar texto si existe
          return;
        } else if (product.angles?.[requestedAngleKey]?.text) {
          console.log(`Usando diseño de texto del ángulo solicitado al recargar: ${requestedAngleKey}`);
          setDesignText(product.angles[requestedAngleKey].text);
          setDesignImage(null); // Limpiar imagen si existe
          return;
        }
        
        // Si el ángulo solicitado no tiene diseño, buscamos el primer ángulo con diseño según la prioridad
        console.log('El ángulo solicitado no tiene diseño al recargar, buscando alternativas...');
        
        let selectedAngle: keyof typeof product.angles | null = null;
        
        for (const priorityAngle of priorityAngles) {
          // Primero verificamos si hay imagen
          if (product.angles?.[priorityAngle]?.image) {
            console.log(`Usando diseño de imagen del ángulo prioritario al recargar: ${priorityAngle}`);
            selectedAngle = priorityAngle;
            setDesignImage(product.angles[priorityAngle].image);
            setDesignText(null); // Limpiar texto si existe
            break;
          } 
          // Luego verificamos si hay texto
          else if (product.angles?.[priorityAngle]?.text) {
            console.log(`Usando diseño de texto del ángulo prioritario al recargar: ${priorityAngle}`);
            selectedAngle = priorityAngle;
            setDesignText(product.angles[priorityAngle].text);
            setDesignImage(null); // Limpiar imagen si existe
            break;
          }
        }
        
        // Si encontramos un ángulo con diseño, actualizamos la imagen de la polera
        if (selectedAngle) {
          // Actualizar el ángulo de la polera para que coincida con el diseño
          const spanishAngle = getSpanishAngleName(selectedAngle);
          console.log(`Actualizando ángulo de la polera al recargar a: ${spanishAngle}`);
          
          // Cargar la imagen de la polera para el nuevo ángulo
          const colorName = getTshirtColorName(color);
          const newTshirtPath = `/assets/products/${colorName}-tshirt/${colorName}-tshirt-${spanishAngle}.png`;
          
          // Verificar si existe la imagen para este ángulo
          const imageExists = await checkImageExists(newTshirtPath);
          if (imageExists) {
            setTshirtBasePath(newTshirtPath);
            console.log(`Imagen de polera actualizada al recargar a: ${newTshirtPath}`);
          } else {
            console.log(`No se encontró imagen de polera para el ángulo: ${spanishAngle} al recargar, usando fallback`);
          }
          
          return;
        }
        
        console.log('No se encontró diseño en ningún ángulo al recargar');
      } catch (error) {
        console.error('Error al recargar el diseño:', error);
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [id, angle, getSpanishAngleName, getTshirtColorName, color, checkImageExists, setDesignText, setDesignImage]);

  // Efecto para depurar cuando designImage cambia
  useEffect(() => {
    if (designImage) {
      console.log('ProductCardCanvas renderizado con imagen:', {
        id,
        title,
        tshirtBasePath,
        color,
        designImage: `${designImage.src} (${designImage.size.width}x${designImage.size.height})`
      });
    }
  }, [id, title, tshirtBasePath, color, designImage]);
  
  // Efecto para depurar cuando designText cambia
  useEffect(() => {
    if (designText) {
      console.log('ProductCardCanvas renderizado con texto:', {
        id,
        title,
        tshirtBasePath,
        color,
        designText: `"${designText.content}" (${designText.font}, ${designText.size}px, ${designText.color})`
      });
    }
  }, [id, title, tshirtBasePath, color, designText]);
  
  // Efecto para mostrar mensaje cuando hay error de carga
  useEffect(() => {
    if (imageError) {
      console.error('Error al cargar imágenes para el producto:', {
        id,
        title,
        imagePath: image,
        tshirtPath: tshirtBasePath
      });
    }
  }, [imageError, id, title, image, tshirtBasePath]);
  
  return (
    <div className="max-w-lg bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <Link href={`/product/${id}`} className="block relative">
        <div className="relative h-96 overflow-hidden">
          {imageError ? (
            <div className="flex items-center justify-center h-full bg-gray-200 text-gray-500">
              <div className="text-center p-4">
                <p className="mb-2">Error al cargar la imagen</p>
                <p className="text-xs text-gray-400">Ruta de imagen: {image}</p>
                <p className="text-xs text-gray-400 mt-1">Ruta de polera: {tshirtBasePath}</p>
              </div>
            </div>
          ) : (
            <div className="w-full h-full">
              {designImage && (
                <HTMLCanvasV2
                  tshirtImage={tshirtBasePath}
                  tshirtColor={color}
                  useColorization={true}
                  designImage={designImage}
                />
              )}
              {designText && (
                <HTMLCanvasV2
                  tshirtImage={tshirtBasePath}
                  tshirtColor={color}
                  useColorization={true}
                  designText={designText}
                />
              )}
            </div>
          )}
          <div className="absolute top-5 left-5">
            <span className="bg-yellow-300 text-black px-4 py-2 rounded-lg text-sm font-bold border border-yellow-400">
              {category}
            </span>
          </div>
        </div>
      </Link>
      <div className="p-4">
        <Link href={`/product/${id}`}>
          <h3 className="text-lg font-semibold mb-2 hover:text-blue-600 transition-colors duration-200">{title}</h3>
        </Link>
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold">
            {new Intl.NumberFormat('es-CL', {
              style: 'currency',
              currency: 'CLP',
              minimumFractionDigits: 0
            }).format(price)}
          </span>
          <Link
            href={`/product/${id}`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
          >
            Ver detalles
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCardCanvas;
