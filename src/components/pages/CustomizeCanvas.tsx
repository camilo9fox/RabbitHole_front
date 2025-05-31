'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Text from '@/components/commons/atoms/Text';
import Button from '@/components/commons/atoms/Button';
import Card from '@/components/commons/atoms/Card';
import TShirtCanvas from '@/components/commons/molecules/TShirtCanvas';
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
  textPositionX: number;
  textPositionY: number;
  basePrice: number;
  details: string;
  view: 'front' | 'back' | 'left' | 'right';
}

// Opciones predefinidas
const colorOptions = [
  { 
    id: 'white', 
    label: 'Blanco', 
    value: '#FFFFFF', 
    textPreview: '#000000',
    priceModifier: 0 // Sin costo adicional
  },
  { 
    id: 'black', 
    label: 'Negro', 
    value: '#000000', 
    textPreview: '#FFFFFF',
    priceModifier: 0 // Sin costo adicional
  },
  { 
    id: 'gray', 
    label: 'Gris', 
    value: '#808080', 
    textPreview: '#FFFFFF',
    priceModifier: 0 // Sin costo adicional
  },
  { 
    id: 'blue', 
    label: 'Azul', 
    value: '#0000FF', 
    textPreview: '#FFFFFF',
    priceModifier: 500 // 500 pesos adicionales
  },
  { 
    id: 'red', 
    label: 'Rojo', 
    value: '#FF0000', 
    textPreview: '#FFFFFF',
    priceModifier: 500 // 500 pesos adicionales
  }
];

const sizeOptions = [
  { id: 'xs', label: 'XS', priceModifier: -1000 }, // 1000 pesos menos
  { id: 's', label: 'S', priceModifier: -500 }, // 500 pesos menos
  { id: 'm', label: 'M', priceModifier: 0 }, // Precio base
  { id: 'l', label: 'L', priceModifier: 500 }, // 500 pesos más
  { id: 'xl', label: 'XL', priceModifier: 1000 }, // 1000 pesos más
  { id: 'xxl', label: 'XXL', priceModifier: 1500 } // 1500 pesos más
];

const fontOptions = [
  { id: 'arial', label: 'Arial', value: 'Arial' },
  { id: 'times', label: 'Times New Roman', value: 'Times New Roman' },
  { id: 'courier', label: 'Courier New', value: 'Courier New' },
  { id: 'georgia', label: 'Georgia', value: 'Georgia' },
  { id: 'verdana', label: 'Verdana', value: 'Verdana' }
];

const textColorOptions = [
  { id: 'black', label: 'Negro', value: '#000000' },
  { id: 'white', label: 'Blanco', value: '#FFFFFF' },
  { id: 'red', label: 'Rojo', value: '#FF0000' },
  { id: 'blue', label: 'Azul', value: '#0000FF' },
  { id: 'green', label: 'Verde', value: '#008000' },
  { id: 'yellow', label: 'Amarillo', value: '#FFFF00' }
];

// Vistas de la polera
const tshirtViews = [
  { id: 'front', label: 'Frente' },
  { id: 'back', label: 'Espalda' },
  { id: 'left', label: 'Izquierda' },
  { id: 'right', label: 'Derecha' }
];

const CustomizeCanvas = () => {
  // Estado del tema
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  
  // Referencias para animaciones
  const previewRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  
  // Estados
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isPageMounted, setIsPageMounted] = useState(false);
  
  // Formulario con React Hook Form
  const methods = useForm<CustomizationOptions>({
    defaultValues: {
      color: 'white',
      size: 'm',
      text: '',
      font: 'arial',
      textColor: 'black',
      image: null,
      textSize: 24,
      textPositionX: 250,
      textPositionY: 250,
      basePrice: 15000, // Precio base en pesos chilenos
      details: '',
      view: 'front'
    }
  });
  
  const { watch, setValue } = methods;
  const formValues = watch();
  
  // Opciones seleccionadas
  const selectedColorOption = colorOptions.find(option => option.id === formValues.color) ?? colorOptions[0];
  const selectedFont = fontOptions.find(option => option.id === formValues.font)?.value ?? fontOptions[0].value;
  const selectedTextColor = textColorOptions.find(option => option.id === formValues.textColor)?.value ?? textColorOptions[0].value;
  const selectedSizeOption = sizeOptions.find(option => option.id === formValues.size) ?? sizeOptions[2]; // Default a M
  
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
  
  // Funciones auxiliares para los estilos de botones
  const getViewButtonClass = (isSelected: boolean) => {
    return `px-3 py-1 text-sm rounded-full ${isSelected 
      ? 'bg-blue-600 text-white' 
      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`;
  };
  
  const getSizeButtonClass = (isSelected: boolean, isDarkMode: boolean) => {
    return `px-4 py-2 rounded-md ${isSelected
      ? 'bg-blue-600 text-white'
      : `bg-gray-100 text-gray-800 ${isDarkMode ? 'dark:bg-gray-700 dark:text-gray-200' : ''}`}`;
  };
  
  const getFontButtonClass = (isSelected: boolean, isDarkMode: boolean) => {
    return `px-3 py-1 text-sm rounded-md ${isSelected
      ? 'bg-blue-600 text-white'
      : `bg-gray-100 text-gray-800 ${isDarkMode ? 'dark:bg-gray-700 dark:text-gray-200' : ''}`}`;
  };
  
  // Manejar carga de imagen
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImage(event.target.result as string);
          setValue('image', event.target.result as string);
          
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
  
  // Actualizar posición del texto
  const handleUpdateTextPosition = (x: number, y: number) => {
    setValue('textPositionX', x);
    setValue('textPositionY', y);
  };
  
  // Actualizar tamaño del texto
  const handleUpdateTextSize = (size: number) => {
    setValue('textSize', size);
  };
  
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
  
  // Obtener la ruta de la imagen de la polera según la vista seleccionada
  const getTshirtImagePath = () => {
    return '/assets/products/white-tshirt.png';
  };
  
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
                    {/* Selector de vistas */}
                    <div className="flex justify-center space-x-2 mb-4">
                      {tshirtViews.map((view) => (
                        <button
                          key={view.id}
                          type="button"
                          className={getViewButtonClass(formValues.view === view.id)}
                          onClick={() => setValue('view', view.id as 'front' | 'back' | 'left' | 'right')}
                        >
                          {view.label}
                        </button>
                      ))}
                    </div>
                    
                    {/* Canvas para la personalización */}
                    <TShirtCanvas
                      tshirtImage={getTshirtImagePath()}
                      customImage={selectedImage}
                      customText={formValues.text || ''}
                      textColor={selectedTextColor}
                      textFont={selectedFont}
                      textSize={formValues.textSize}
                      onUpdateTextPosition={handleUpdateTextPosition}
                      onUpdateTextSize={handleUpdateTextSize}
                    />
                  </div>
                  
                  {/* Precio y botón de añadir al carrito */}
                  <div className="flex flex-col sm:flex-row justify-between items-center">
                    <div className="mb-4 sm:mb-0">
                      <Text variant="h3" className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        Precio Total: {formatPrice(totalPrice)}
                      </Text>
                      <Text variant="body" className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Incluye personalización y envío
                      </Text>
                    </div>
                    <Button 
                      variant="primary" 
                      size="lg"
                      onClick={handleAddToCart}
                    >
                      Añadir al Carrito
                    </Button>
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
                
                {/* Selección de color */}
                <div className="mb-6">
                  <Text variant="body" className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2`}>
                    Color de la Polera
                  </Text>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        className={`w-10 h-10 rounded-full border-2 ${
                          formValues.color === option.id 
                            ? 'border-blue-600 ring-2 ring-blue-300' 
                            : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: option.value }}
                        onClick={() => setValue('color', option.id)}
                        aria-label={`Color ${option.label}`}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Selección de talla */}
                <div className="mb-6">
                  <Text variant="body" className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2`}>
                    Talla
                  </Text>
                  <div className="flex flex-wrap gap-2">
                    {sizeOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        className={getSizeButtonClass(formValues.size === option.id, isDarkMode)}
                        onClick={() => setValue('size', option.id)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Personalización de texto */}
                <div className="mb-6">
                  <Text variant="body" className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2`}>
                    Texto Personalizado
                  </Text>
                  <input
                    type="text"
                    placeholder="Escribe tu texto aquí"
                    value={formValues.text}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue('text', e.target.value)}
                    disabled={!!selectedImage}
                    className="w-full p-3 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white mb-3"
                  />
                  
                  {/* Solo mostrar opciones de texto si no hay imagen seleccionada */}
                  {!selectedImage && (
                    <>
                      {/* Selección de fuente */}
                      <div className="mb-3">
                        <Text variant="body" className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>
                          Fuente
                        </Text>
                        <div className="flex flex-wrap gap-2">
                          {fontOptions.map((option) => (
                            <button
                              key={option.id}
                              type="button"
                              className={getFontButtonClass(formValues.font === option.id, isDarkMode)}
                              onClick={() => setValue('font', option.id)}
                              style={{ fontFamily: option.value }}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Selección de color de texto */}
                      <div>
                        <Text variant="body" className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>
                          Color del Texto
                        </Text>
                        <div className="flex flex-wrap gap-2">
                          {textColorOptions.map((option) => (
                            <button
                              key={option.id}
                              type="button"
                              className={`w-8 h-8 rounded-full border ${
                                formValues.textColor === option.id 
                                  ? 'border-blue-600 ring-2 ring-blue-300' 
                                  : 'border-gray-300'
                              }`}
                              style={{ backgroundColor: option.value }}
                              onClick={() => setValue('textColor', option.id)}
                              aria-label={`Color de texto ${option.label}`}
                            />
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Subir imagen */}
                <div className="mb-6">
                  <Text variant="body" className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2`}>
                    Imagen Personalizada
                  </Text>
                  
                  {!selectedImage ? (
                    <div className="flex items-center justify-center w-full">
                      <label htmlFor="image-upload" aria-label="Subir imagen personalizada" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                          </svg>
                          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold">Haz clic para subir</span> o arrastra y suelta
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG o GIF (MAX. 800x400px)</p>
                        </div>
                        <input 
                          id="image-upload"
                          type="file" 
                          className="hidden" 
                          accept="image/*" 
                          onChange={handleImageUpload}
                          disabled={!!formValues.text}
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="relative w-32 h-32 mb-2">
                        {selectedImage && (
                          <Image 
                            src={selectedImage} 
                            alt="Imagen personalizada" 
                            width={128}
                            height={128}
                            className="w-full h-full object-contain"
                          />
                        )}
                      </div>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={handleRemoveImage}
                      >
                        Eliminar Imagen
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* Detalles adicionales */}
                <div className="mb-6">
                  <Text variant="body" className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2`}>
                    Detalles Adicionales
                  </Text>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    rows={3}
                    placeholder="Añade cualquier detalle o instrucción especial para tu pedido"
                    value={formValues.details}
                    onChange={(e) => setValue('details', e.target.value)}
                  />
                </div>
              </Card>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default CustomizeCanvas;
