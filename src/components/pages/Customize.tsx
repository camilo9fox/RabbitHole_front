'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';
import Text from '@/components/commons/atoms/Text';
import Button from '@/components/commons/atoms/Button';
import Input from '@/components/commons/atoms/Input';
import Card from '@/components/commons/atoms/Card';
import Image from 'next/image';
import { useForm, FormProvider } from 'react-hook-form';
import gsap from 'gsap';

// Interfaces
interface CustomizationOptions {
  color: string;
  size: string;
  text: string;
  font: string;
  textColor: string;
  image: string | null;
  textSize: number;
  imageSize: number;
  textPositionX: number;
  textPositionY: number;
  imagePositionX: number;
  imagePositionY: number;
  basePrice: number;
  details: string;
}

// Opciones predefinidas
const colorOptions = [
  { 
    id: 'white', 
    label: 'Blanco', 
    value: '#FFFFFF', 
    textPreview: '#000000',
    image: 'https://i.ibb.co/sTXD0K8/69f226b6-5da0-474e-987f-016e34f514d3.png',
    priceModifier: 0 // Sin costo adicional
  },
  { 
    id: 'black', 
    label: 'Negro', 
    value: '#000000', 
    textPreview: '#FFFFFF',
    image: 'https://i.ibb.co/qYpvyHQq/702fe463-73a9-4df6-81cb-2f7e23d3a9bd.png',
    priceModifier: 0 // Sin costo adicional
  },
  { 
    id: 'gray', 
    label: 'Gris', 
    value: '#808080', 
    textPreview: '#FFFFFF',
    image: 'https://i.ibb.co/SX3cFgGD/110efad0-b9ba-4938-8c68-cedf4ebef567.png',
    priceModifier: 500 // 500 pesos adicionales
  },
  { 
    id: 'blue', 
    label: 'Azul', 
    value: '#0066CC', 
    textPreview: '#FFFFFF',
    image: 'https://i.ibb.co/prXRZBQ2/363609eb-ce54-4c6a-b765-003dd5b2eb82.png',
    priceModifier: 1000 // 1000 pesos adicionales
  },
  { 
    id: 'red', 
    label: 'Rojo', 
    value: '#CC0000', 
    textPreview: '#FFFFFF',
    image: 'https://i.ibb.co/ZpTnz5cm/c8a5078a-9727-404d-b1d8-81e138b30535.png',
    priceModifier: 1000 // 1000 pesos adicionales
  },
];

const sizeOptions = [
  { id: 'xs', label: 'XS', priceModifier: 0 },
  { id: 's', label: 'S', priceModifier: 0 },
  { id: 'm', label: 'M', priceModifier: 0 },
  { id: 'l', label: 'L', priceModifier: 500 },
  { id: 'xl', label: 'XL', priceModifier: 1000 },
  { id: 'xxl', label: '2XL', priceModifier: 1500 },
];

const fontOptions = [
  { id: 'arial', label: 'Arial', value: 'Arial, sans-serif' },
  { id: 'roboto', label: 'Roboto', value: 'Roboto, sans-serif' },
  { id: 'montserrat', label: 'Montserrat', value: 'Montserrat, sans-serif' },
  { id: 'oswald', label: 'Oswald', value: 'Oswald, sans-serif' },
  { id: 'pacifico', label: 'Pacifico', value: 'Pacifico, cursive' },
];

const textColorOptions = [
  { id: 'white', label: 'Blanco', value: '#FFFFFF' },
  { id: 'black', label: 'Negro', value: '#000000' },
  { id: 'blue', label: 'Azul', value: '#0066CC' },
  { id: 'red', label: 'Rojo', value: '#CC0000' },
  { id: 'gold', label: 'Dorado', value: '#FFD700' },
];

// Funciones auxiliares para reducir la complejidad cognitiva
const getSizeButtonStyle = (isSelected: boolean, isDarkMode: boolean): string => {
  if (isSelected) {
    return 'bg-blue-600 border-blue-600 text-white';
  }
  return isDarkMode 
    ? 'bg-gray-800 border-gray-700 text-gray-200' 
    : 'bg-gray-50 border-gray-500 text-gray-800';
};

// Esta función es similar pero se mantiene separada para facilitar cambios futuros específicos
const getFontButtonStyle = (isSelected: boolean, isDarkMode: boolean): string => {
  if (isSelected) {
    return 'bg-blue-600 border-blue-600 text-white font-bold';
  }
  return isDarkMode 
    ? 'bg-gray-800 border-gray-700 text-gray-200' 
    : 'bg-white border-gray-400 text-gray-800';
};

// Componente principal
const Customize = () => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  
  // Referencias para animaciones y arrastre
  const previewRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  
  // Estado para la previsualización
  const [previewText, setPreviewText] = useState('Tu texto aquí');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isPageMounted, setIsPageMounted] = useState(false);
  
  // Configurar react-hook-form
  const methods = useForm<CustomizationOptions>({
    defaultValues: {
      color: 'white',
      size: 'm',
      text: '',
      font: 'arial',
      textColor: 'black',
      image: null,
      textSize: 24,
      imageSize: 80,
      textPositionX: 50,
      textPositionY: 50,
      imagePositionX: 50,
      imagePositionY: 50,
      basePrice: 10000, // Precio base: 10.000 pesos chilenos
      details: ''
    }
  });
  
  const { watch, setValue } = methods;
  const formValues = watch();
  
  // Opciones seleccionadas
  const selectedColorOption = colorOptions.find(option => option.id === formValues.color) || colorOptions[0];
  const selectedFont = fontOptions.find(option => option.id === formValues.font)?.value || fontOptions[0].value;
  const selectedTextColor = textColorOptions.find(option => option.id === formValues.textColor)?.value || textColorOptions[0].value;
  const selectedSizeOption = sizeOptions.find(option => option.id === formValues.size) || sizeOptions[2]; // Default a M
  
  // Calcular precio total
  const calculateTotalPrice = () => {
    let totalPrice = formValues.basePrice;
    
    // Añadir costo por color
    totalPrice += selectedColorOption.priceModifier;
    
    // Añadir costo por talla
    totalPrice += selectedSizeOption.priceModifier;
    
    // Añadir costo por texto (1000 pesos si hay texto)
    if (formValues.text && formValues.text.trim() !== '') {
      totalPrice += 1000;
    }
    
    // Añadir costo por imagen (2000 pesos si hay imagen)
    if (selectedImage) {
      totalPrice += 2000;
    }
    
    return totalPrice;
  };
  
  const totalPrice = calculateTotalPrice();
  
  // Función para formatear precio en pesos chilenos
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(price);
  };
  
  // Actualizar texto de previsualización cuando cambia el texto del formulario
  useEffect(() => {
    if (formValues.text) {
      setPreviewText(formValues.text);
    } else {
      setPreviewText('Tu texto aquí');
    }
  }, [formValues.text]);
  
  // Manejar carga de imagen
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImage(event.target.result as string);
          setValue('image', event.target.result as string);
          // Centrar la imagen inicialmente
          setValue('imagePositionX', 50);
          setValue('imagePositionY', 50);
          
          // Limpiar y deshabilitar el campo de texto cuando se agrega una imagen
          setValue('text', '');
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Función para eliminar la imagen
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setValue('image', null);
  };
  
  // Estado para manejar el arrastre
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<'text' | 'image' | null>(null);
  
  // Funciones para el arrastre (usando useCallback para evitar dependencias circulares)
  const handleDragMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragType || !previewRef.current) return;
    
    const previewRect = previewRef.current.getBoundingClientRect();
    
    // Calcular posición relativa en porcentaje
    const x = ((e.clientX - previewRect.left) / previewRect.width) * 100;
    const y = ((e.clientY - previewRect.top) / previewRect.height) * 100;
    
    // Limitar dentro del área de la polera
    const boundedX = Math.max(10, Math.min(90, x));
    const boundedY = Math.max(10, Math.min(90, y));
    
    // Actualizar posición según el tipo
    if (dragType === 'text') {
      setValue('textPositionX', boundedX);
      setValue('textPositionY', boundedY);
    } else if (dragType === 'image') {
      setValue('imagePositionX', boundedX);
      setValue('imagePositionY', boundedY);
    }
  }, [isDragging, dragType, setValue]);
  
  // Finalizar arrastre
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDragType(null);
    
    // Eliminar eventos globales
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
  }, [handleDragMove]);
  
  // Iniciar arrastre
  const handleDragStart = useCallback((e: React.MouseEvent, type: 'text' | 'image') => {
    e.preventDefault();
    setIsDragging(true);
    setDragType(type);
    
    // Agregar eventos globales
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
  }, [handleDragMove, handleDragEnd]);
  
  // Limpiar eventos al desmontar
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
    };
  }, [handleDragMove, handleDragEnd]);
  
  // Control de montaje de la página
  useEffect(() => {
    setIsPageMounted(true);
    
    return () => {
      setIsPageMounted(false);
    };
  }, []);

  // Animaciones con GSAP
  useEffect(() => {
    if (isPageMounted && previewRef.current && optionsRef.current) {
      const tl = gsap.timeline({ delay: 0.3 });
      tl.from(previewRef.current, { opacity: 0, scale: 0.95, duration: 0.5 })
        .from(optionsRef.current, { opacity: 0, y: 20, duration: 0.5 }, "-=0.3");
      
      return () => {
        tl.kill();
      };
    }
  }, [isPageMounted]);
  
  // Función para agregar al carrito
  const handleAddToCart = () => {
    console.log('Producto personalizado agregado al carrito:', formValues);
    
    // Animar la previsualización al agregar al carrito
    if (previewRef.current) {
      gsap.to(previewRef.current, {
        scale: 1.02,
        duration: 0.3,
        yoyo: true,
        repeat: 1
      });
    }
    
    // Aquí podrías añadir lógica para guardar en el carrito
    // Por ejemplo, usando localStorage o una API
  };
  
  // Solución para problemas de hidratación
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) {
    return (
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className={`text-4xl md:text-5xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-4`}>
              Personaliza tu Polera
            </h1>
            <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto`}>
              Cargando opciones de personalización...
            </p>
          </div>
          <div className="flex justify-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Título y descripción */}
        <div className="text-center mb-12">
          <Text variant="h1" className={`text-4xl md:text-5xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-4`}>
            Personaliza tu Polera
          </Text>
          <Text variant="body" className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto`}>
            Crea una polera única con tu diseño personalizado. Elige el color, añade texto o sube una imagen.
          </Text>
        </div>
        
        <FormProvider {...methods}>
          <form className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Previsualización */}
            <div className="order-2 lg:order-1">
              <Card className="p-6 border rounded-xl shadow-lg">
                <div className="rounded-xl overflow-hidden mb-6">
                  <Text variant="h2" className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-4`}>
                    Previsualización
                  </Text>
                
                  <div ref={previewRef} className="relative aspect-[3/4] w-full max-w-xl mx-auto mb-6 rounded-lg overflow-hidden shadow-lg border border-gray-200">
                    {/* T-shirt mockup */}
                    <div className="relative w-full h-full">
                      <Image 
                        src={selectedColorOption.image}
                        alt={`Polera ${selectedColorOption.label}`}
                        width={600}
                        height={800}
                        className="w-full h-auto"
                        priority
                      />
                      
                      {/* Capa para el diseño personalizado */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        {/* Imagen personalizada */}
                        {selectedImage && (
                          <div 
                            className="absolute cursor-move p-0 border-0 bg-transparent" 
                            style={{ 
                              width: `${formValues.imageSize}%`,
                              maxWidth: '90%',
                              maxHeight: '80%',
                              touchAction: 'none',
                              left: `${formValues.imagePositionX}%`,
                              top: `${formValues.imagePositionY}%`,
                              transform: 'translate(-50%, -50%)'
                            }}
                            onMouseDown={(e) => handleDragStart(e, 'image')}
                            role="button"
                            tabIndex={0}
                            aria-label="Mover imagen personalizada"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                handleDragStart(e as unknown as React.MouseEvent, 'image');
                              }
                            }}
                          >
                            <div className="relative w-full h-0 pb-[100%]">
                              <Image 
                                src={selectedImage} 
                                alt="Imagen personalizada" 
                                fill
                                className="object-contain"
                              />
                            </div>
                            
                            {/* Controles de tamaño para la imagen */}
                            <div className="absolute bottom-0 right-0 bg-white/80 dark:bg-gray-800/80 p-1 rounded-tl-md flex items-center space-x-1">
                              <button 
                                type="button" 
                                className="w-6 h-6 flex items-center justify-center bg-blue-600 text-white rounded-full"
                                onClick={() => setValue('imageSize', Math.max(20, formValues.imageSize - 5))}
                              >
                                -
                              </button>
                              <button 
                                type="button" 
                                className="w-6 h-6 flex items-center justify-center bg-blue-600 text-white rounded-full"
                                onClick={() => setValue('imageSize', Math.min(100, formValues.imageSize + 5))}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {/* Texto personalizado */}
                        {!selectedImage && formValues.text && (
                          <div 
                            className="absolute cursor-move p-2 rounded bg-transparent border-0" 
                            style={{ 
                              touchAction: 'none',
                              maxWidth: '80%',
                              left: `${formValues.textPositionX}%`,
                              top: `${formValues.textPositionY}%`,
                              transform: 'translate(-50%, -50%)'
                            }}
                            onMouseDown={(e) => handleDragStart(e, 'text')}
                            role="button"
                            tabIndex={0}
                            aria-label="Mover texto personalizado"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                handleDragStart(e as unknown as React.MouseEvent, 'text');
                              }
                            }}
                          >
                            <div 
                              className="text-center break-words" 
                              style={{ 
                                color: selectedTextColor,
                                fontFamily: selectedFont,
                                fontSize: `${formValues.textSize}px`,
                                lineHeight: 1.2,
                                textShadow: '0 0 1px rgba(0,0,0,0.1)'
                              }}
                            >
                              {previewText}
                            </div>
                            
                            {/* Controles de tamaño para el texto */}
                            <div className="mt-2 bg-white/80 dark:bg-gray-800/80 p-1 rounded flex items-center justify-center space-x-1">
                              <button 
                                type="button" 
                                className="w-6 h-6 flex items-center justify-center bg-blue-600 text-white rounded-full"
                                onClick={() => setValue('textSize', Math.max(12, formValues.textSize - 2))}
                              >
                                -
                              </button>
                              <span className="text-xs mx-1">{formValues.textSize}px</span>
                              <button 
                                type="button" 
                                className="w-6 h-6 flex items-center justify-center bg-blue-600 text-white rounded-full"
                                onClick={() => setValue('textSize', Math.min(72, formValues.textSize + 2))}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Instrucciones para el usuario */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 text-center">
                      {selectedImage || formValues.text ? 'Arrastra para mover y usa los botones +/- para cambiar el tamaño' : 'Añade texto o una imagen para personalizar'}
                    </div>
                    
                    {/* Overlay para prevenir interacciones durante la carga */}
                    {!isPageMounted && (
                      <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
            
            {/* Opciones de personalización */}
            <div ref={optionsRef} className="order-1 lg:order-2">
              <Card className="p-6 border rounded-xl shadow-lg">
                <Text variant="h2" className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-6`}>
                  Opciones de Personalización
                </Text>
                
                {/* Color de la polera */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <Text variant="body" className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      Color de la Polera
                    </Text>
                    {selectedColorOption.priceModifier > 0 && (
                      <Text variant="body" className="text-sm text-blue-600 dark:text-blue-400">
                        +{formatPrice(selectedColorOption.priceModifier)}
                      </Text>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {colorOptions.map(color => (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => setValue('color', color.id)}
                        className={`w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                          formValues.color === color.id 
                            ? 'border-blue-500 ring-2 ring-blue-500/30 scale-110' 
                            : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color.value }}
                        aria-label={`Color ${color.label}`}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Talla */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <Text variant="body" className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      Talla
                    </Text>
                    {selectedSizeOption.priceModifier > 0 && (
                      <Text variant="body" className="text-sm text-blue-600 dark:text-blue-400">
                        +{formatPrice(selectedSizeOption.priceModifier)}
                      </Text>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sizeOptions.map(size => (
                      <button
                        key={size.id}
                        type="button"
                        onClick={() => setValue('size', size.id)}
                        className={`px-4 py-2 border rounded-md transition-all duration-200 ${
                          getSizeButtonStyle(formValues.size === size.id, isDarkMode)
                        }`}
                      >
                        {size.label}
                        {size.priceModifier > 0 && (
                          <span className="ml-1 text-xs">+{formatPrice(size.priceModifier)}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Texto personalizado */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <Text variant="body" className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      Texto Personalizado
                    </Text>
                    {formValues.text && formValues.text.trim() !== '' && (
                      <Text variant="body" className="text-sm text-blue-600 dark:text-blue-400">
                        +{formatPrice(1000)}
                      </Text>
                    )}
                  </div>
                  <Input
                    name="text"
                    control={methods.control}
                    placeholder="Escribe tu texto aquí"
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200 ${selectedImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                    style={{
                      backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb',
                      color: isDarkMode ? '#ffffff' : '#1f2937',
                      borderColor: isDarkMode ? '#374151' : '#e5e7eb'
                    }}
                    disabled={selectedImage !== null}
                  />
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {selectedImage ? (
                      <span>* El texto personalizado no está disponible cuando se usa una imagen</span>
                    ) : (
                      <span>* El texto se mostrará en la previsualización donde podrás ajustar su posición y tamaño (+$1.000)</span>
                    )}
                  </div>
                </div>
                
                {/* Fuente del texto */}
                <div className="mb-6">
                  <Text variant="body" className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-3`}>
                    Fuente del Texto
                  </Text>
                  <div className="flex flex-wrap gap-2">
                    {fontOptions.map(font => (
                      <button
                        key={font.id}
                        type="button"
                        onClick={() => setValue('font', font.id)}
                        className={`px-4 py-2 border rounded-md transition-all duration-200 ${
                          getFontButtonStyle(formValues.font === font.id, isDarkMode)
                        } ${selectedImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                        style={{ fontFamily: font.value }}
                        disabled={selectedImage !== null}
                      >
                        {font.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Color del texto */}
                <div className="mb-6">
                  <Text variant="body" className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-3`}>
                    Color del Texto
                  </Text>
                  <div className="flex flex-wrap gap-3">
                    {textColorOptions.map(color => (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => setValue('textColor', color.id)}
                        className={`w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                          formValues.textColor === color.id 
                            ? 'border-blue-500 ring-2 ring-blue-500/30 scale-110' 
                            : 'border-gray-300'
                        } ${selectedImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                        style={{ backgroundColor: color.value }}
                        aria-label={`Color de texto ${color.label}`}
                        disabled={selectedImage !== null}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Subir imagen */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-3">
                    <Text variant="body" className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      Subir Imagen (opcional)
                    </Text>
                    {selectedImage && (
                      <Text variant="body" className="text-sm text-blue-600 dark:text-blue-400">
                        +{formatPrice(2000)}
                      </Text>
                    )}
                  </div>
                  <div className={`border-2 border-dashed rounded-lg p-4 text-center ${
                    isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-300 bg-gray-50'
                  }`}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label 
                      htmlFor="image-upload"
                      className={`cursor-pointer block py-4 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    >
                      <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      {selectedImage ? 'Cambiar imagen' : 'Haz clic para subir una imagen'}
                      <p className="text-xs mt-1 text-gray-500">PNG, JPG, GIF hasta 5MB (+$2.000)</p>
                    </label>
                  </div>
                  
                  {selectedImage && (
                    <div className="mt-2 text-center">
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 underline"
                      >
                        Eliminar imagen
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Campo de detalles adicionales */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <Text variant="body" className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      Detalles Adicionales (opcional)
                    </Text>
                  </div>
                  <Input
                    name="details"
                    control={methods.control}
                    placeholder="Indica cualquier detalle adicional sobre tu pedido"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
                    style={{
                      backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb',
                      color: isDarkMode ? '#ffffff' : '#1f2937',
                      borderColor: isDarkMode ? '#374151' : '#e5e7eb'
                    }}
                  />
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>* Puedes incluir instrucciones especiales, preferencias o cualquier otra información relevante</span>
                  </div>
                </div>
                
                {/* Sección de precio y botón de agregar al carrito */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col items-center">
                    <div className="mb-4 text-center">
                      <Text variant="body" className="text-sm text-gray-600 dark:text-gray-400 mb-1">Precio Total</Text>
                      <Text variant="h3" className={`font-bold text-2xl ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        {formatPrice(totalPrice)}
                      </Text>
                    </div>
                    
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleAddToCart}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                    >
                      Agregar al carrito
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default Customize;
