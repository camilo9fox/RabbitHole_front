'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { CustomDesignStatus } from '@/types/cart';
import { useTheme } from 'next-themes';
import Text from '@/components/commons/atoms/Text';
import Button from '@/components/commons/atoms/Button';
import Card from '@/components/commons/atoms/Card';
import HTMLCanvasV2, { HTMLCanvasHandle } from '@/components/commons/molecules/HTMLCanvasV2';
import { useForm, FormProvider } from 'react-hook-form';
import gsap from 'gsap';
import Image from 'next/image';
import { useUserRole } from '@/context/UserRoleContext';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminProductForm from '@/components/commons/organisms/AdminProductForm';
import { getAdminProductById, saveAdminProduct, updateAdminProduct, generateThumbnail } from '@/services/adminProductService';
import { AngleDesign } from '@/types/product';
// Los tipos se usan en la función saveAdminProduct
import { toast } from 'react-hot-toast';
import { useProductData } from '@/context/ProductDataContext';

// Interfaces
interface ViewCustomization {
  text: string;
  image: string | null;
  textFont: string;
  textColor: string;
  textSize: number;
  textPositionX: number;
  textPositionY: number;
  imagePositionX: number;
  imagePositionY: number;
  imageWidth: number;
  imageHeight: number;
}

interface CustomizationOptions {
  color: string;
  size: string;
  basePrice: number;
  details: string;
  view: 'front' | 'back' | 'left' | 'right';
  // Personalización independiente para cada vista
  front: ViewCustomization;
  back: ViewCustomization;
  left: ViewCustomization;
  right: ViewCustomization;
  // Campos para administrador
  admin?: {
    name: string;
    description: string;
    category: string;
  };
}

// Eliminando duplicación

// Opciones predefinidas
const predefinedColor = { 
    id: 'white', 
    label: 'Blanco', 
    value: '#FFFFFF', 
    textPreview: '#000000',
    priceModifier: 0 
  }


const predefinedSize = { id: 'm', label: 'M', priceModifier: 0 } 

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

const CustomizeHTML = () => {
  // Estado del tema
  const { resolvedTheme } = useTheme();
  const { isAdmin } = useUserRole();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { colors, sizes, fonts } = useProductData();
  const productId = searchParams.get('productId');
  
  useEffect(() => {
    console.log({colors})
    console.log({sizes})
    console.log({fonts})
  }, [colors, sizes, fonts])

  const isDarkMode = resolvedTheme === 'dark';
  
  // Referencias para animaciones
  const previewRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  
  // Referencias para los canvas de cada vista
  const frontCanvasRef = useRef<HTMLCanvasHandle>(null);
  const backCanvasRef = useRef<HTMLCanvasHandle>(null);
  const leftCanvasRef = useRef<HTMLCanvasHandle>(null);
  const rightCanvasRef = useRef<HTMLCanvasHandle>(null);
  
  // Contexto del carrito
  const { addCustomItem } = useCart();
  
  // Estados
  const [isPageMounted, setIsPageMounted] = useState(false);
  
  // Formulario con React Hook Form
  const methods = useForm<CustomizationOptions>({
    defaultValues: {
      color: 'white',
      size: 'm',
      basePrice: 12990, // Precio base en pesos chilenos
      details: '',
      view: 'front',
      // Valores predeterminados para cada vista
      front: {
        text: '',
        image: null,
        textFont: 'Arial',
        textColor: '#000000',
        textSize: 30,
        textPositionX: 250,
        textPositionY: 250,
        imagePositionX: 250,
        imagePositionY: 250,
        imageWidth: 150,
        imageHeight: 150
      },
      back: {
        text: '',
        image: null,
        textFont: 'Arial',
        textColor: '#000000',
        textSize: 30,
        textPositionX: 250,
        textPositionY: 250,
        imagePositionX: 250,
        imagePositionY: 250,
        imageWidth: 150,
        imageHeight: 150
      },
      left: {
        text: '',
        image: null,
        textFont: 'Arial',
        textColor: '#000000',
        textSize: 30,
        textPositionX: 250,
        textPositionY: 250,
        imagePositionX: 250,
        imagePositionY: 250,
        imageWidth: 150,
        imageHeight: 150
      },
      right: {
        text: '',
        image: null,
        textFont: 'Arial',
        textColor: '#000000',
        textSize: 30,
        textPositionX: 250,
        textPositionY: 250,
        imagePositionX: 250,
        imagePositionY: 250,
        imageWidth: 150,
        imageHeight: 150
      }
    }
  });
  
  const { watch, setValue, register } = methods;
  const formValues = watch();
  
  // Obtener la vista actual
  const currentView = formValues.view;
  const currentViewData = formValues[currentView];
  
  // Opciones seleccionadas
  const selectedColorOption = colors.find(option => option.id === formValues.color) ?? predefinedColor;
  const selectedFont = currentViewData.textFont || 'Arial';
  const selectedSizeOption = sizes.find(option => option.id === formValues.size) ?? predefinedSize; // Default a M
  
  // Calcular precio total
  const calculateTotalPrice = () => {
    let totalPrice = formValues.basePrice;
    
    // Añadir costo por color
    totalPrice += selectedColorOption.priceModifier;
    
    // Añadir costo por talla
    totalPrice += selectedSizeOption.priceModifier;
    
    // Añadir costo por texto (1000 pesos si hay texto en cualquier vista)
    const hasAnyText = Object.values(formValues).some(view => 
      typeof view === 'object' && 'text' in view && view.text && view.text.trim() !== ''
    );
    if (hasAnyText) {
      totalPrice += 1000;
    }
    
    // Añadir costo por imagen (2000 pesos si hay imagen en cualquier vista)
    const hasAnyImage = Object.values(formValues).some(view => 
      typeof view === 'object' && 'image' in view && view.image !== null
    );
    if (hasAnyImage) {
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
    if (isSelected) {
      return 'px-3 py-2 text-sm rounded-full bg-blue-600 text-white';
    }
    return 'px-3 py-2 text-sm rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
  };
  
  const getSizeButtonClass = (isSelected: boolean) => {
    if (isSelected) {
      return 'px-4 py-2 rounded-md bg-blue-600 text-white';
    }
    
    if (isDarkMode) {
      return 'px-4 py-2 rounded-md bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
    
    return 'px-4 py-2 rounded-md bg-gray-100 text-gray-800';
  };
  
  const getFontButtonClass = (isSelected: boolean) => {
    if (isSelected) {
      return 'px-3 py-1 text-sm rounded-md bg-blue-600 text-white';
    }
    
    if (isDarkMode) {
      return 'px-3 py-1 text-sm rounded-md bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
    
    return 'px-3 py-1 text-sm rounded-md bg-gray-100 text-gray-800';
  };
  
  // Manejar carga de imagen
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const imageData = event.target.result as string;
          setValue(`${currentView}.image`, imageData);
          
          // Limpiar el campo de texto cuando se agrega una imagen
          setValue(`${currentView}.text`, '');
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Función para eliminar la imagen
  const handleRemoveImage = () => {
    setValue(`${currentView}.image`, null);
  };
  
  // Actualizar posición del texto
  const handleUpdateTextPosition = (x: number, y: number) => {
    setValue(`${currentView}.textPositionX`, x);
    setValue(`${currentView}.textPositionY`, y);
  };
  
  // Actualizar tamaño del texto
  const handleUpdateTextSize = (size: number) => {
    setValue(`${currentView}.textSize`, size);
  };
  
  // Actualizar posición de la imagen
  const handleUpdateImagePosition = (x: number, y: number) => {
    setValue(`${currentView}.imagePositionX`, x);
    setValue(`${currentView}.imagePositionY`, y);
  };
  
  // Actualizar tamaño de la imagen
  const handleUpdateImageSize = (width: number, height: number) => {
    setValue(`${currentView}.imageWidth`, width);
    setValue(`${currentView}.imageHeight`, height);
  };
  
  // Actualizar cuando cambia la vista
  useEffect(() => {
    // Cualquier lógica adicional cuando cambia la vista se puede agregar aquí
  }, [currentView]);
  
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
  }, [isPageMounted, previewRef, optionsRef]);

  // Función para crear un objeto AngleDesign a partir de los datos del formulario
  const getAngleDesign = (view: 'front' | 'back' | 'left' | 'right'): AngleDesign => {
    const viewData = formValues[view];
    const design: AngleDesign = {};
    
    // Añadir texto si existe
    if (viewData.text) {
      design.text = {
        content: viewData.text,
        font: viewData.textFont ?? 'Arial',
        color: viewData.textColor ?? '#000000',
        size: viewData.textSize ?? 30,
        position: {
          x: viewData.textPositionX ?? 250,
          y: viewData.textPositionY ?? 250
        }
      };
    }
    
    // Añadir imagen si existe
    if (viewData.image) {
      design.image = {
        src: viewData.image,
        position: {
          x: viewData.imagePositionX ?? 250,
          y: viewData.imagePositionY ?? 250
        },
        size: {
          width: viewData.imageWidth ?? 200,
          height: viewData.imageHeight ?? 200
        }
      };
    }
    
    return design;
  };
  
  // Función para obtener el color seleccionado en formato hexadecimal
  const getSelectedColorHex = (): string => {
    return selectedColorOption?.value || '#FFFFFF';
  };

  // Función para verificar si un ángulo tiene diseño (imagen o texto)
  const hasCustomizationInView = (view: 'front' | 'back' | 'left' | 'right'): boolean => {
    return !!(formValues[view].text || formValues[view].image);
  };

  // Definir un tipo para las vistas de la polera
  type TshirtView = 'front' | 'back' | 'left' | 'right';

  // Función para guardar producto (admin) o agregar al carrito (usuario)
  const handleFormSubmit = async () => {
    console.log('Iniciando handleFormSubmit');
    // Validar el formulario
    const isValid = await methods.trigger();
    console.log('Resultado de validación:', isValid);
    console.log('Errores del formulario:', methods.formState.errors);
    
    if (!isValid) {
      toast.error('Por favor, completa todos los campos requeridos');
      return;
    }
    console.log('Formulario válido, continuando...');
    
    if (isAdmin) {
      // Verificar qué vistas tienen personalización
      const frontHasCustomization = hasCustomizationInView('front');
      const backHasCustomization = hasCustomizationInView('back');
      const leftHasCustomization = hasCustomizationInView('left');
      const rightHasCustomization = hasCustomizationInView('right');
      
      // Verificar si hay al menos una vista personalizada
      if (!frontHasCustomization && !backHasCustomization && !leftHasCustomization && !rightHasCustomization) {
        toast.error('Por favor, personaliza al menos una vista antes de guardar el producto.');
        return;
      }
      
      // Guardar la vista actual para volver a ella al final
      const currentViewValue = formValues.view as TshirtView;
      
      // Determinar qué vista mostrar según prioridad (front > back > left > right)
      let viewToShow: TshirtView = 'front';
      if (frontHasCustomization) {
        viewToShow = 'front';
      } else if (backHasCustomization) {
        viewToShow = 'back';
      } else if (leftHasCustomization) {
        viewToShow = 'left';
      } else if (rightHasCustomization) {
        viewToShow = 'right';
      }
      
      // Cambiar a la vista con diseño para generar el thumbnail
      setValue('view', viewToShow);
      
      // Función para generar un thumbnail a partir de un canvas
      const generateThumbnailFromCanvas = async (canvasRef: React.RefObject<HTMLCanvasHandle | null>, canvasId: string): Promise<HTMLCanvasElement | null> => {
        let canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (!canvas && canvasRef.current) {
          const imageUrl = canvasRef.current.captureCanvas();
          if (imageUrl) {
            canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (ctx) {
              const img = document.createElement('img');
              img.src = imageUrl;
              await new Promise<void>((resolve) => {
                img.onload = () => resolve();
              });
              canvas.width = img.width;
              canvas.height = img.height;
              ctx.drawImage(img, 0, 0);
              return canvas;
            }
          }
        }
        return canvas;
      };
      
      // Esperar a que se actualice la vista
      setTimeout(async () => {
        // Obtener el canvas de la vista actual
        let thumbnailCanvas: HTMLCanvasElement | null = null;
        
        try {
          switch (viewToShow) {
            case 'front':
              thumbnailCanvas = await generateThumbnailFromCanvas(frontCanvasRef, 'canvas-front');
              break;
            case 'back':
              thumbnailCanvas = await generateThumbnailFromCanvas(backCanvasRef, 'canvas-back');
              break;
            case 'left':
              thumbnailCanvas = await generateThumbnailFromCanvas(leftCanvasRef, 'canvas-left');
              break;
            case 'right':
              thumbnailCanvas = await generateThumbnailFromCanvas(rightCanvasRef, 'canvas-right');
              break;
          }
          
          if (!thumbnailCanvas) {
            toast.error(`Error al generar la miniatura: No se encontró el canvas para la vista ${viewToShow}`);
            return;
          }
          
          // Generar thumbnail
          const thumbnailUrl = generateThumbnail(thumbnailCanvas);
          console.log('Thumbnail generado desde la vista:', viewToShow);
          
          // Finalizar el guardado del producto con el thumbnail generado
          finishProductSave(thumbnailUrl, currentViewValue);
          
        } catch (error) {
          console.error('Error al generar el thumbnail:', error);
          toast.error('Ocurrió un error al generar la miniatura del producto');
        }
      }, 200);
    } else {
      // Lógica para agregar al carrito (usuarios normales)
      handleAddToCart();
    }
  };
  
  // Función para finalizar el guardado del producto con el thumbnail generado
  const finishProductSave = (thumbnailUrl: string, originalView: TshirtView) => {
    setValue('view', originalView);
    const formData = methods.getValues();
    if (!formData.admin) {
      toast.error('Error: Faltan los campos de administrador');
      return;
    }
    const productData = {
      name: formData.admin.name,
      description: formData.admin.description,
      category: formData.admin.category,
      price: totalPrice,
      color: selectedColorOption.value,
      size: selectedSizeOption.id,
      thumbnail: thumbnailUrl,
      selectedColor: selectedColorOption.id,
      angles: {
        front: getAngleDesign('front'),
        back: getAngleDesign('back'),
        left: getAngleDesign('left'),
        right: getAngleDesign('right')
      },
      baseColor: formData.color
    };
    try {
      if (productId) {
        const existingProduct = getAdminProductById(productId);
        if (!existingProduct) {
          toast.error('No se encontró el producto a actualizar');
          return;
        }
        const updatedProduct = { ...existingProduct, ...productData, id: productId };
        updateAdminProduct(updatedProduct);
        toast.success('Producto actualizado correctamente');
      } else {
        saveAdminProduct(productData);
        toast.success('Producto creado correctamente');
      }
      setTimeout(() => {
        router.push('/admin/products');
      }, 500); // Pequeño retraso para asegurar que se complete el guardado
    } catch (error: unknown) {
      console.error('Error al guardar producto:', error);
      toast.error(productId ? 'Error al actualizar el producto' : 'Error al crear el producto');
    }
  };

  // Función para agregar al carrito
  const handleAddToCart = () => {
    // Guardar la vista actual para volver a ella
    const currentViewValue = formValues.view;
    
    // Animar la previsualización al agregar al carrito
    if (previewRef.current) {
      gsap.to(previewRef.current, {
        scale: 1.02,
        duration: 0.3,
        yoyo: true,
        repeat: 1
      });
    }
    
    // Identificar qué vistas fueron personalizadas (tienen texto o imagen)
    const hasCustomizationInView = (view: 'front' | 'back' | 'left' | 'right'): boolean => {
      return !!(formValues[view].text || formValues[view].image);
    };
    
    // Verificar qué vistas tienen personalización
    const frontHasCustomization = hasCustomizationInView('front');
    const backHasCustomization = hasCustomizationInView('back');
    const leftHasCustomization = hasCustomizationInView('left');
    const rightHasCustomization = hasCustomizationInView('right');
    
    // Verificar si hay al menos una vista personalizada
    if (!frontHasCustomization && !backHasCustomization && !leftHasCustomization && !rightHasCustomization) {
      alert('Por favor, personaliza al menos una vista antes de agregar al carrito.');
      return;
    }
    
    // Variables para almacenar las imágenes capturadas
    let frontImage: string | undefined;
    let backImage: string | undefined;
    let leftImage: string | undefined;
    let rightImage: string | undefined;
    
    // Capturar vista frontal si tiene personalización
    const captureFront = () => {
      if (frontHasCustomization) {
        setValue('view', 'front');
        setTimeout(() => {
          frontImage = frontCanvasRef.current?.captureCanvas();
          captureBack();
        }, 100);
      } else {
        captureBack();
      }
    };
    
    // Capturar vista trasera si tiene personalización
    const captureBack = () => {
      if (backHasCustomization) {
        setValue('view', 'back');
        setTimeout(() => {
          backImage = backCanvasRef.current?.captureCanvas();
          captureLeft();
        }, 100);
      } else {
        captureLeft();
      }
    };
    
    // Capturar vista izquierda si tiene personalización
    const captureLeft = () => {
      if (leftHasCustomization) {
        setValue('view', 'left');
        setTimeout(() => {
          leftImage = leftCanvasRef.current?.captureCanvas();
          captureRight();
        }, 100);
      } else {
        captureRight();
      }
    };
    
    // Capturar vista derecha si tiene personalización
    const captureRight = () => {
      if (rightHasCustomization) {
        setValue('view', 'right');
        setTimeout(() => {
          rightImage = rightCanvasRef.current?.captureCanvas();
          finishCapture();
        }, 100);
      } else {
        finishCapture();
      }
    };
    
    // Finalizar la captura y crear el objeto de diseño personalizado
    const finishCapture = () => {
      // Volver a la vista original
      setValue('view', currentViewValue);
      
      // Crear el objeto de diseño personalizado
      const customDesign = {
        id: `custom-${Date.now()}`,
        name: 'Polera Personalizada',
        price: totalPrice,
        quantity: 1,
        color: selectedColorOption.label,
        size: selectedSizeOption.label,
        status: CustomDesignStatus.PENDING, // Estado inicial: pendiente de aprobación
        front: {
          text: formValues.front.text || '',
          image: formValues.front.image,
          textFont: selectedFont,
          textColor: formValues.front.textColor,
          textSize: formValues.front.textSize,
          textPositionX: formValues.front.textPositionX,
          textPositionY: formValues.front.textPositionY,
          imagePositionX: formValues.front.imagePositionX,
          imagePositionY: formValues.front.imagePositionY,
          imageWidth: formValues.front.imageWidth,
          imageHeight: formValues.front.imageHeight,
          previewImage: frontImage
        },
        back: {
          text: formValues.back.text || '',
          image: formValues.back.image,
          textFont: selectedFont,
          textColor: formValues.back.textColor,
          textSize: formValues.back.textSize,
          textPositionX: formValues.back.textPositionX,
          textPositionY: formValues.back.textPositionY,
          imagePositionX: formValues.back.imagePositionX,
          imagePositionY: formValues.back.imagePositionY,
          imageWidth: formValues.back.imageWidth,
          imageHeight: formValues.back.imageHeight,
          previewImage: backImage
        },
        left: {
          text: formValues.left.text || '',
          image: formValues.left.image,
          textFont: selectedFont,
          textColor: formValues.left.textColor,
          textSize: formValues.left.textSize,
          textPositionX: formValues.left.textPositionX,
          textPositionY: formValues.left.textPositionY,
          imagePositionX: formValues.left.imagePositionX,
          imagePositionY: formValues.left.imagePositionY,
          imageWidth: formValues.left.imageWidth,
          imageHeight: formValues.left.imageHeight,
          previewImage: leftImage
        },
        right: {
          text: formValues.right.text || '',
          image: formValues.right.image,
          textFont: selectedFont,
          textColor: formValues.right.textColor,
          textSize: formValues.right.textSize,
          textPositionX: formValues.right.textPositionX,
          textPositionY: formValues.right.textPositionY,
          imagePositionX: formValues.right.imagePositionX,
          imagePositionY: formValues.right.imagePositionY,
          imageWidth: formValues.right.imageWidth,
          imageHeight: formValues.right.imageHeight,
          previewImage: rightImage
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Añadir al carrito
      addCustomItem(customDesign, 1);
      
      // Mostrar mensaje de éxito
      alert('¡Diseño personalizado añadido al carrito!');
      
      // Opcional: redirigir al carrito o a otra página
      // router.push('/cart');
      
      console.log('Producto personalizado agregado al carrito:', customDesign);
    };
    
    // Iniciar el proceso de captura
    captureFront();
  };
  
  // Solución para problemas de hidratación
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Obtener la ruta de la imagen de la polera según la vista seleccionada y el color
  const getTshirtImagePath = () => {
    // Si el color seleccionado es negro, usar la imagen de polera negra
    if (formValues.color === 'black') {
      // Mapeo de vistas para la polera negra
      const blackTshirtViewMap: Record<string, string> = {
        'front': '/assets/products/black-tshirt/black-tshirt-frente.png',
        'back': '/assets/products/black-tshirt/black-tshirt-espalda.png',
        'left': '/assets/products/black-tshirt/black-tshirt-izquierda.png',
        'right': '/assets/products/black-tshirt/black-tshirt-derecha.png'
      };
      
      return blackTshirtViewMap[formValues.view] || blackTshirtViewMap['front'];
    } else {
      // Para otros colores, usar la polera blanca como base para la coloración
      const whiteTshirtViewMap: Record<string, string> = {
        'front': '/assets/products/white-tshirt/white-tshirt-frente.png',
        'back': '/assets/products/white-tshirt/white-tshirt-espalda.png',
        'left': '/assets/products/white-tshirt/white-tshirt-izquierda.png',
        'right': '/assets/products/white-tshirt/white-tshirt-derecha.png'
      };
      
      return whiteTshirtViewMap[formValues.view] || whiteTshirtViewMap['front'];
    }
  };
  
  // La función getSelectedColorHex ya está definida arriba
  
  // Cargar producto existente si se proporciona un ID
  useEffect(() => {
    if (productId && isAdmin) {
      const loadedProduct = getAdminProductById(productId);
      if (loadedProduct) {
        // Cargar datos del producto en el formulario
        // Usamos un color predeterminado ya que no guardamos colores específicos
        setValue('color', loadedProduct?.selectedColor ?? 'white');
        // Usamos una talla predeterminada ya que no guardamos tallas específicas
        setValue('size', 'M');
        setValue('basePrice', loadedProduct.price);
        
        // Cargar campos de administrador
        setValue('admin.name', loadedProduct.name);
        setValue('admin.description', loadedProduct.description);
        setValue('admin.category', loadedProduct.category);
        
        // Cargar diseños de cada ángulo si existen
        if (loadedProduct.angles?.front) {
          setValue('front', {
            text: loadedProduct.angles.front.text?.content ?? '',
            image: loadedProduct.angles.front.image?.src ?? null,
            textFont: loadedProduct.angles.front.text?.font ?? 'Arial',
            textColor: loadedProduct.angles.front.text?.color ?? '#000000',
            textSize: loadedProduct.angles.front.text?.size ?? 30,
            textPositionX: loadedProduct.angles.front.text?.position?.x ?? 250,
            textPositionY: loadedProduct.angles.front.text?.position?.y ?? 250,
            imagePositionX: loadedProduct.angles.front.image?.position?.x ?? 250,
            imagePositionY: loadedProduct.angles.front.image?.position?.y ?? 250,
            imageWidth: loadedProduct.angles.front.image?.size?.width ?? 150,
            imageHeight: loadedProduct.angles.front.image?.size?.height ?? 150
          });
        }
        
        if (loadedProduct.angles?.back) {
          setValue('back', {
            text: loadedProduct.angles.back.text?.content ?? '',
            image: loadedProduct.angles.back.image?.src ?? null,
            textFont: loadedProduct.angles.back.text?.font ?? 'Arial',
            textColor: loadedProduct.angles.back.text?.color ?? '#000000',
            textSize: loadedProduct.angles.back.text?.size ?? 30,
            textPositionX: loadedProduct.angles.back.text?.position?.x ?? 250,
            textPositionY: loadedProduct.angles.back.text?.position?.y ?? 250,
            imagePositionX: loadedProduct.angles.back.image?.position?.x ?? 250,
            imagePositionY: loadedProduct.angles.back.image?.position?.y ?? 250,
            imageWidth: loadedProduct.angles.back.image?.size?.width ?? 150,
            imageHeight: loadedProduct.angles.back.image?.size?.height ?? 150
          });
        }
        
        if (loadedProduct.angles?.left) {
          setValue('left', {
            text: loadedProduct.angles.left.text?.content ?? '',
            image: loadedProduct.angles.left.image?.src ?? null,
            textFont: loadedProduct.angles.left.text?.font ?? 'Arial',
            textColor: loadedProduct.angles.left.text?.color ?? '#000000',
            textSize: loadedProduct.angles.left.text?.size ?? 30,
            textPositionX: loadedProduct.angles.left.text?.position?.x ?? 250,
            textPositionY: loadedProduct.angles.left.text?.position?.y ?? 250,
            imagePositionX: loadedProduct.angles.left.image?.position?.x ?? 250,
            imagePositionY: loadedProduct.angles.left.image?.position?.y ?? 250,
            imageWidth: loadedProduct.angles.left.image?.size?.width ?? 150,
            imageHeight: loadedProduct.angles.left.image?.size?.height ?? 150
          });
        }
        
        if (loadedProduct.angles?.right) {
          setValue('right', {
            text: loadedProduct.angles.right.text?.content ?? '',
            image: loadedProduct.angles.right.image?.src ?? null,
            textFont: loadedProduct.angles.right.text?.font ?? 'Arial',
            textColor: loadedProduct.angles.right.text?.color ?? '#000000',
            textSize: loadedProduct.angles.right.text?.size ?? 30,
            textPositionX: loadedProduct.angles.right.text?.position?.x ?? 250,
            textPositionY: loadedProduct.angles.right.text?.position?.y ?? 250,
            imagePositionX: loadedProduct.angles.right.image?.position?.x ?? 250,
            imagePositionY: loadedProduct.angles.right.image?.position?.y ?? 250,
            imageWidth: loadedProduct.angles.right.image?.size?.width ?? 150,
            imageHeight: loadedProduct.angles.right.image?.size?.height ?? 150
          });
        }
        
        toast.success(`Producto "${loadedProduct.name}" cargado para edición`);
      } else {
        toast.error('No se encontró el producto solicitado');
      }
    }
  }, [productId, isAdmin, setValue]);
  
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
          <form 
            className="grid grid-cols-1 lg:grid-cols-2 gap-8" 
            onSubmit={(e) => {
              e.preventDefault();
              console.log('Formulario enviado');
              handleFormSubmit();
            }}
          >
            {/* Previsualización */}
            <div className="order-2 lg:order-1">
              <Card className="p-6 border rounded-xl shadow-lg">
                <div className="rounded-xl overflow-hidden mb-6">
                  <Text variant="h2" className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-4`}>
                    Previsualización
                  </Text>
                
                  <div ref={previewRef} className="relative aspect-[3/4] w-full max-w-xl mx-auto mb-6 rounded-lg overflow-hidden shadow-lg border border-gray-200">
                    {/* Selector de vistas */}
                    <div className="flex justify-center space-x-2 my-4">
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
                    {formValues.view === 'front' && (
                      <HTMLCanvasV2
                        ref={frontCanvasRef}
                        tshirtImage={getTshirtImagePath()}
                        tshirtColor={getSelectedColorHex()}
                        useColorization={formValues.color !== 'white'}
                        customImage={currentViewData.image}
                        customText={currentViewData.text || ''}
                        textColor={currentViewData.textColor}
                        textFont={selectedFont}
                        textSize={currentViewData.textSize}
                        imageWidth={currentViewData.imageWidth}
                        imageHeight={currentViewData.imageHeight}
                        textPositionX={currentViewData.textPositionX}
                        textPositionY={currentViewData.textPositionY}
                        imagePositionX={currentViewData.imagePositionX}
                        imagePositionY={currentViewData.imagePositionY}
                        onUpdateTextPosition={handleUpdateTextPosition}
                        onUpdateImagePosition={handleUpdateImagePosition}
                        onUpdateTextSize={handleUpdateTextSize}
                        onUpdateImageSize={handleUpdateImageSize}
                      />
                    )}
                    {formValues.view === 'back' && (
                      <HTMLCanvasV2
                        ref={backCanvasRef}
                        tshirtImage={getTshirtImagePath()}
                        tshirtColor={getSelectedColorHex()}
                        useColorization={formValues.color !== 'white'}
                        customImage={currentViewData.image}
                        customText={currentViewData.text || ''}
                        textColor={currentViewData.textColor}
                        textFont={selectedFont}
                        textSize={currentViewData.textSize}
                        imageWidth={currentViewData.imageWidth}
                        imageHeight={currentViewData.imageHeight}
                        textPositionX={currentViewData.textPositionX}
                        textPositionY={currentViewData.textPositionY}
                        imagePositionX={currentViewData.imagePositionX}
                        imagePositionY={currentViewData.imagePositionY}
                        onUpdateTextPosition={handleUpdateTextPosition}
                        onUpdateImagePosition={handleUpdateImagePosition}
                        onUpdateTextSize={handleUpdateTextSize}
                        onUpdateImageSize={handleUpdateImageSize}
                      />
                    )}
                    {formValues.view === 'left' && (
                      <HTMLCanvasV2
                        ref={leftCanvasRef}
                        tshirtImage={getTshirtImagePath()}
                        tshirtColor={getSelectedColorHex()}
                        useColorization={formValues.color !== 'white'}
                        customImage={currentViewData.image}
                        customText={currentViewData.text || ''}
                        textColor={currentViewData.textColor}
                        textFont={selectedFont}
                        textSize={currentViewData.textSize}
                        imageWidth={currentViewData.imageWidth}
                        imageHeight={currentViewData.imageHeight}
                        textPositionX={currentViewData.textPositionX}
                        textPositionY={currentViewData.textPositionY}
                        imagePositionX={currentViewData.imagePositionX}
                        imagePositionY={currentViewData.imagePositionY}
                        onUpdateTextPosition={handleUpdateTextPosition}
                        onUpdateImagePosition={handleUpdateImagePosition}
                        onUpdateTextSize={handleUpdateTextSize}
                        onUpdateImageSize={handleUpdateImageSize}
                      />
                    )}
                    {formValues.view === 'right' && (
                      <HTMLCanvasV2
                        ref={rightCanvasRef}
                        tshirtImage={getTshirtImagePath()}
                        tshirtColor={getSelectedColorHex()}
                        useColorization={formValues.color !== 'white'}
                        customImage={currentViewData.image}
                        customText={currentViewData.text || ''}
                        textColor={currentViewData.textColor}
                        textFont={selectedFont}
                        textSize={currentViewData.textSize}
                        imageWidth={currentViewData.imageWidth}
                        imageHeight={currentViewData.imageHeight}
                        textPositionX={currentViewData.textPositionX}
                        textPositionY={currentViewData.textPositionY}
                        imagePositionX={currentViewData.imagePositionX}
                        imagePositionY={currentViewData.imagePositionY}
                        onUpdateTextPosition={handleUpdateTextPosition}
                        onUpdateImagePosition={handleUpdateImagePosition}
                        onUpdateTextSize={handleUpdateTextSize}
                        onUpdateImageSize={handleUpdateImageSize}
                      />
                    )}
                  </div>
                  
                  {/* Precio y botón de añadir al carrito (solo para usuarios normales) */}
                  <div className="flex flex-col sm:flex-row justify-between items-center">
                    <div className="mb-4 sm:mb-0">
                      <Text variant="h3" className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        Precio Total: {formatPrice(totalPrice)}
                      </Text>
                      <Text variant="body" className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Incluye personalización y envío
                      </Text>
                    </div>
                    {!isAdmin && (
                      <Button 
                        variant="primary" 
                        size="lg"
                        onClick={handleAddToCart}
                      >
                        Añadir al Carrito
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </div>
            
            {/* Opciones de personalización */}
            <div ref={optionsRef} className="order-1 lg:order-2">
              <Card className="p-6 border rounded-xl shadow-lg">
                {/* Selección de color */}
                <div className="mb-6">
                  <Text variant="body" className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2`}>
                    Color de la Polera
                  </Text>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((option) => (
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
                    {sizes.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        className={getSizeButtonClass(formValues.size === option.id)}
                        onClick={() => setValue('size', option.id)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Texto personalizado para la vista actual */}
                <div className="mb-6">
                  <Text variant="body" className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2`}>
                    Texto Personalizado ({tshirtViews.find(v => v.id === currentView)?.label})
                  </Text>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Escribe tu texto personalizado"
                      className={`w-full p-3 rounded-md border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                      value={currentViewData.text || ''}
                      onChange={(e) => setValue(`${currentView}.text`, e.target.value)}
                      disabled={!!currentViewData.image}
                    />
                    {currentViewData.image && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 rounded-md">
                        <Text variant="body" className="text-white text-sm">
                          Desactiva la imagen para usar texto
                        </Text>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Selección de fuente para la vista actual */}
                <div className="mb-6">
                  <Text variant="body" className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2`}>
                    Fuente del Texto ({tshirtViews.find(v => v.id === currentView)?.label})
                  </Text>
                  <div className="flex flex-wrap gap-2">
                    {fonts.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        className={getFontButtonClass(currentViewData.textFont === option.value)}
                        onClick={() => setValue(`${currentView}.textFont`, option.id)}
                        disabled={!!currentViewData.image || !currentViewData.text}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Selección de color del texto para la vista actual */}
                <div className="mb-6">
                  <Text variant="body" className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2`}>
                    Color del Texto ({tshirtViews.find(v => v.id === currentView)?.label})
                  </Text>
                  <div className="flex flex-wrap gap-2">
                    {textColorOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center"
                        style={{ backgroundColor: option.value }}
                        onClick={() => setValue(`${currentView}.textColor`, option.value)}
                        disabled={!!currentViewData.image || !currentViewData.text}
                      >
                        {currentViewData.textColor === option.value && (
                          <span className="text-white text-xs">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Subida de imagen para la vista actual */}
                <div className="mb-6">
                  <Text variant="body" className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2`}>
                    Imagen Personalizada ({tshirtViews.find(v => v.id === currentView)?.label})
                  </Text>
                  {!currentViewData.image ? (
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md p-6 text-center">
                      <input
                        type="file"
                        id="image-upload"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={!!currentViewData.text}
                      />
                      <label
                        htmlFor="image-upload"
                        className={`cursor-pointer inline-block px-4 py-2 rounded-md bg-blue-600 text-white ${currentViewData.text ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        Subir Imagen
                      </label>
                      {currentViewData.text && (
                        <Text variant="body" className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          Elimina el texto para subir una imagen
                        </Text>
                      )}
                    </div>
                  ) : (
                    <div className="relative border rounded-md overflow-hidden">
                      {currentViewData.image && (
                        <>
                          <Image
                            src={currentViewData.image}
                            alt="Imagen personalizada"
                            width={300}
                            height={200}
                            className="w-full h-auto max-h-48 object-contain"
                          />
                          <button
                            type="button"
                            className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1"
                            onClick={handleRemoveImage}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <div className="mt-2 p-2 text-center bg-gray-100 dark:bg-gray-800">
                            <Text variant="body" className="text-sm text-gray-600 dark:text-gray-300">
                              Puedes arrastrar y redimensionar la imagen en la previsualización
                            </Text>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Detalles adicionales */}
                <div className="mb-6">
                  <Text variant="body" className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2`}>
                    Detalles Adicionales
                  </Text>
                  <textarea
                    className={`w-full p-3 rounded-md border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-800'} min-h-[100px]`}
                    placeholder="Añade cualquier detalle adicional sobre tu pedido"
                    {...register('details')}
                  />
                </div>
                
                {/* Botón de Agregar al Carrito (solo para usuarios normales) */}
                {!isAdmin && (
                  <div className="mt-8">
                    <button
                      type="submit"
                      className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition-colors duration-200 flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                      </svg>
                      Agregar al Carrito
                    </button>
                  </div>
                )}
                
                {/* Opciones de administrador */}
                {isAdmin && (
                  <div className="mt-8">
                    <div className={`p-6 rounded-xl shadow-lg border ${isDarkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-200'}`}>
                      <div className={`flex items-center mb-4 pb-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                        </svg>
                        <Text variant="h3" className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                          Opciones de Administrador
                        </Text>
                      </div>
                      <AdminProductForm productId={productId ?? undefined} />
                      
                      {/* Botón de Crear/Actualizar Producto */}
                      <div className="mt-6">
                        <button
                          type="submit"
                          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-md transition-colors duration-200 flex items-center justify-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                          {productId ? 'Actualizar Producto' : 'Crear Producto'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default CustomizeHTML;
