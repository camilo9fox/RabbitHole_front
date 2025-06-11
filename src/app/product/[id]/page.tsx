'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { getAdminProductById } from '@/services/adminProductService';
import ProductCanvas, { ProductCanvasRefHandle } from '@/components/commons/molecules/ProductCanvas';
import { AdminProduct, AngleDesign } from '@/types/product';
import { StandardProduct } from '@/types/cart';
import Text from '@/components/commons/atoms/Text';
import Button from '@/components/commons/atoms/Button';
import { useTheme } from 'next-themes';
import { useCart } from '@/context/CartContext';

// Ángulos disponibles para la visualización del producto
const ANGLES = ['frente', 'espalda', 'izquierda', 'derecha'];

// Opciones predefinidas de colores (igual que en el customizer)
const colorOptions = [
  { id: 'white', label: 'Blanco', value: '#FFFFFF', textPreview: '#000000', priceModifier: 0 },
  { id: 'black', label: 'Negro', value: '#1A1A1A', textPreview: '#FFFFFF', priceModifier: 0 },
  { id: 'gray', label: 'Gris', value: '#808080', textPreview: '#FFFFFF', priceModifier: 0 },
  { id: 'blue', label: 'Azul', value: '#0047AB', textPreview: '#FFFFFF', priceModifier: 500 },
  { id: 'navy', label: 'Azul Marino', value: '#000080', textPreview: '#FFFFFF', priceModifier: 500 },
  { id: 'lightblue', label: 'Azul Claro', value: '#ADD8E6', textPreview: '#000000', priceModifier: 500 },
  { id: 'red', label: 'Rojo', value: '#FF0000', textPreview: '#FFFFFF', priceModifier: 500 },
  { id: 'burgundy', label: 'Borgoña', value: '#800020', textPreview: '#FFFFFF', priceModifier: 700 },
  { id: 'pink', label: 'Rosa', value: '#FFC0CB', textPreview: '#000000', priceModifier: 500 },
  { id: 'green', label: 'Verde', value: '#008000', textPreview: '#FFFFFF', priceModifier: 500 },
  { id: 'olive', label: 'Verde Oliva', value: '#808000', textPreview: '#FFFFFF', priceModifier: 700 },
  { id: 'mint', label: 'Menta', value: '#98FF98', textPreview: '#000000', priceModifier: 700 },
  { id: 'purple', label: 'Púrpura', value: '#800080', textPreview: '#FFFFFF', priceModifier: 700 },
  { id: 'yellow', label: 'Amarillo', value: '#FFFF00', textPreview: '#000000', priceModifier: 500 },
  { id: 'orange', label: 'Naranja', value: '#FFA500', textPreview: '#000000', priceModifier: 500 }
];

// Opciones predefinidas de tallas (igual que en el customizer)
const sizeOptions = [
  { id: 'xs', label: 'XS', priceModifier: -1000 },
  { id: 's', label: 'S', priceModifier: -500 },
  { id: 'm', label: 'M', priceModifier: 0 },
  { id: 'l', label: 'L', priceModifier: 500 },
  { id: 'xl', label: 'XL', priceModifier: 1000 },
  { id: 'xxl', label: 'XXL', priceModifier: 1500 }
];

export default function ProductDetail() {
  const { id } = useParams();
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  const { addStandardItem } = useCart();
  
  // Estados
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentAngle, setCurrentAngle] = useState<string>('frente');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  
  // Contador para forzar la recreación del canvas cuando sea necesario
  const canvasKeyCounter = useRef<number>(0);
  
  // Referencias para los canvas de cada ángulo
  const canvasRefs = {
    frente: useRef<ProductCanvasRefHandle>(null),
    espalda: useRef<ProductCanvasRefHandle>(null),
    izquierda: useRef<ProductCanvasRefHandle>(null),
    derecha: useRef<ProductCanvasRefHandle>(null)
  };
  const getTshirtHexColor = useCallback((colorId: string): string => {
    switch (colorId) {
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
      default: return '#FFFFFF'; // Valor por defecto
    }
  }, []);

  // Inicializar colores y tallas predeterminados cuando se carga el producto
  useEffect(() => {
    if (product) {
      // Inicializar color predeterminado si no está ya seleccionado
      if (!selectedColor && product.colors?.length) {
        const defaultColor = getTshirtHexColor(product?.selectedColor ?? 'white');
        setSelectedColor(defaultColor);
        console.log('Color predeterminado seleccionado:', defaultColor);
      } else if (!product.colors?.length) {
        setSelectedColor('#FFFFFF'); // Color blanco por defecto si no hay colores definidos
      }
      
      // Inicializar talla predeterminada si no está ya seleccionada
      if (!selectedSize && product.sizes?.length) {
        const defaultSize = product.sizes[0];
        setSelectedSize(defaultSize);
        console.log('Talla predeterminada seleccionada:', defaultSize);
      } else if (!product.sizes?.length) {
        setSelectedSize('M'); // Talla M por defecto si no hay tallas definidas
      }

      // Inicializar ángulo predeterminado si no está ya seleccionado
      if (currentAngle === 'front') {
        setCurrentAngle('frente');
      }
      
      // Imprimir información del producto para depuración
      console.log('Producto cargado:', product);
    }
  }, [product, selectedColor, selectedSize, currentAngle, getTshirtHexColor]);

  // Cargar datos del producto
  useEffect(() => {
    if (id) {
      const productId = Array.isArray(id) ? id[0] : id;
      const fetchedProduct = getAdminProductById(productId);
      
      if (fetchedProduct) {
        // Asegurarse de que el producto tenga colores y tallas predeterminados
        const productWithDefaults = {
          ...fetchedProduct,
          colors: fetchedProduct.colors?.length ? fetchedProduct.colors : colorOptions.map(color => color.value),
          sizes: fetchedProduct.sizes?.length ? fetchedProduct.sizes : sizeOptions.map(size => size.label)
        };
        
        console.log('Producto con valores predeterminados:', productWithDefaults);
        setProduct(productWithDefaults);
      }
      
      setLoading(false);
    }
  }, [id]);

  // Manejar cambio de ángulo
  const handleAngleChange = (angle: string) => {
    console.log(`Cambiando a ángulo: ${angle}`);
    // Incrementar el contador para forzar la recreación del canvas
    canvasKeyCounter.current += 1;
    setCurrentAngle(angle);
  };
  
  // Obtener el diseño del producto para el ángulo actual
  const getDesignForAngle = (angle: string): AngleDesign | undefined => {
    if (!product?.angles) {
      console.log('No hay ángulos definidos en el producto');
      return undefined;
    }
    
    // Mapear los ángulos en español a las propiedades en inglés del objeto angles
    const angleMap: Record<string, keyof typeof product.angles> = {
      'frente': 'front',
      'espalda': 'back',
      'izquierda': 'left',
      'derecha': 'right'
    };
    
    const angleKey = angleMap[angle];
    if (!angleKey) {
      console.log(`Ángulo no reconocido: ${angle}`);
      return undefined;
    }
    
    const design = product.angles[angleKey];
    console.log(`Diseño para ángulo ${angle} (${angleKey}):`, design);
    return design;
  };

  // Estado para la notificación de éxito
  const [showNotification, setShowNotification] = useState(false);
  
  // Capturar imagen del canvas para un ángulo específico
  const captureCanvasImage = (angle: string): string => {
    try {
      // Acceder directamente al ref del ángulo específico
      const canvasRef = canvasRefs[angle as keyof typeof canvasRefs];
      
      // Usar encadenamiento opcional para acceso seguro
      const imageData = canvasRef.current?.captureCanvas();
      if (imageData) {
        console.log(`Imagen capturada para ángulo ${angle}`);
        return imageData;
      } else {
        console.warn(`No se pudo capturar imagen para el ángulo ${angle}`);
      }
    } catch (error) {
      console.error(`Error al capturar imagen del canvas para ángulo ${angle}:`, error);
    }
    return '';
  };

  // Agregar al carrito
  const handleAddToCart = () => {
    if (!product || !selectedColor || !selectedSize) return;
    
    // Capturar imágenes del canvas para todos los ángulos
    const previewImages: Record<string, string> = {};
    const capturedImages: string[] = [];
    
    // Intentar capturar imágenes para todos los ángulos
    ANGLES.forEach(angle => {
      const imageData = captureCanvasImage(angle);
      if (imageData) {
        previewImages[angle] = imageData;
        capturedImages.push(imageData);
      }
    });
    
    // Usar las imágenes capturadas, o el thumbnail predeterminado si no hay ninguna
    const productImages = capturedImages.length > 0 
      ? capturedImages 
      : [product.thumbnail ?? ''];
    
    // Crear un objeto StandardProduct compatible con el contexto del carrito
    const standardProduct: StandardProduct = {
      id: product.id,
      name: product.name,
      description: product.description ?? '',
      price: product.price,
      images: productImages,
      color: selectedColor,
      size: selectedSize,
      category: product.category ?? 'Poleras',
      inStock: true,
      previewImages: previewImages, // Guardar las imágenes de todos los ángulos
      previewImage: previewImages[currentAngle] || undefined // Imagen del ángulo actual como principal
    };
    
    // Usar el contexto del carrito para agregar el producto
    addStandardItem(standardProduct, quantity);
    
    console.log('Producto agregado al carrito con imágenes personalizadas:', standardProduct);
    
    // Mostrar notificación de éxito
    setShowNotification(true);
    
    // Ocultar la notificación después de 3 segundos
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  // Renderizar selector de colores
  const renderColorSelector = () => {
    // Mostramos todos los colores disponibles en colorOptions
    console.log('Renderizando selector de colores con todas las opciones disponibles');

    return (
      <div className="mt-6">
        <Text variant="h5" className="mb-2 font-medium">Color</Text>
        <div className="flex flex-wrap gap-3">
          {colorOptions.map((colorOption) => {
            const color = colorOption.value;
            const label = colorOption.label;
            
            // Determinar la clase de borde basada en la selección y el tema
            let borderClass = isDarkMode ? 'border-gray-700' : 'border-gray-300';
            let shadowClass = '';
            
            if (selectedColor === color) {
              borderClass = 'border-blue-500';
              shadowClass = 'shadow-md shadow-blue-500/30 scale-110';
            }
            
            // Determinar si el color es claro para agregar un borde de contraste
            const isLightColor = color === '#FFFFFF' || color === '#FFF' || color === '#FFFFFFFF';
            const contrastBorder = isLightColor ? 'ring-1 ring-gray-300 dark:ring-gray-600' : '';
            
            return (
              <label key={color} className="relative cursor-pointer transition-all duration-200">
                <input
                  type="radio"
                  name="color-selector"
                  value={color}
                  checked={selectedColor === color}
                  onChange={() => setSelectedColor(color)}
                  className="sr-only" // Ocultar visualmente pero mantener accesible
                />
                <span 
                  className={`block w-10 h-10 rounded-full border-2 ${borderClass} ${shadowClass} ${contrastBorder} transition-all duration-200`}
                  style={{ backgroundColor: color }}
                  aria-hidden="true"
                  title={label}
                />
                <span className="sr-only">{label}</span>
              </label>
            );
          })}
        </div>
      </div>
    );
  };

  // Renderizar selector de tallas
  const renderSizeSelector = () => {
    // Mostramos todas las tallas disponibles en sizeOptions
    console.log('Renderizando selector de tallas con todas las opciones disponibles');

    return (
      <div className="mt-6">
        <Text variant="h5" className="mb-2 font-medium">Talla</Text>
        <div className="flex flex-wrap gap-3">
          {sizeOptions.map((sizeOption) => {
            const size = sizeOption.label;
            
            // Determinar las clases basadas en la selección y el tema
            let sizeClasses = '';
            let shadowClass = '';
            
            if (selectedSize === size) {
              sizeClasses = isDarkMode 
                ? 'border-blue-500 bg-blue-900/40 text-blue-300 font-medium' 
                : 'border-blue-500 bg-blue-50 text-blue-700 font-medium';
              shadowClass = 'shadow-md shadow-blue-500/30 scale-110';
            } else if (isDarkMode) {
              sizeClasses = 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-500';
            } else {
              sizeClasses = 'border-gray-300 bg-white text-gray-700 hover:border-gray-400';
            }
            
            return (
              <label key={size} className="relative cursor-pointer transition-all duration-200">
                <input
                  type="radio"
                  name="size-selector"
                  value={size}
                  checked={selectedSize === size}
                  onChange={() => setSelectedSize(size)}
                  className="sr-only" // Ocultar visualmente pero mantener accesible
                />
                <span 
                  className={`flex w-12 h-12 items-center justify-center rounded-md cursor-pointer border ${sizeClasses} ${shadowClass} transition-all duration-200`}
                  aria-hidden="true"
                >
                  <Text variant="body">{size}</Text>
                </span>
                <span className="sr-only">Talla {size}</span>
              </label>
            );
          })}
        </div>
      </div>
    );
  };

  // Renderizar selector de ángulos
  const renderAngleSelector = () => {
    return (
      <div className="flex justify-center gap-2 mt-4" role="radiogroup" aria-label="Vistas del producto">
        {ANGLES.map((angle) => {
          // Determinar las clases basadas en la selección y el tema
          let angleClasses = '';
          
          if (currentAngle === angle) {
            angleClasses = 'border-blue-500 bg-blue-50 text-blue-700';
          } else if (isDarkMode) {
            angleClasses = 'border-gray-700 bg-gray-800 text-gray-300';
          } else {
            angleClasses = 'border-gray-200 bg-white text-gray-700';
          }
          
          return (
            <label key={angle} className="relative cursor-pointer">
              <input
                type="radio"
                name="angle-selector"
                value={angle}
                checked={currentAngle === angle}
                onChange={() => handleAngleChange(angle)}
                className="sr-only" // Ocultar visualmente pero mantener accesible
              />
              <span 
                className={`flex min-w-[80px] h-12 items-center justify-center rounded-md cursor-pointer border px-3 ${angleClasses}`}
                aria-hidden="true"
              >
                <Text variant="body" className="capitalize text-sm">{angle}</Text>
              </span>
              <span className="sr-only">Vista {angle}</span>
            </label>
          );
        })}
      </div>
    );
  };

  // Renderizar selector de cantidad
  const renderQuantitySelector = () => {
    // Determinar las clases para los botones basadas en el tema
    const buttonClasses = isDarkMode 
      ? 'bg-gray-800 text-white hover:bg-gray-700' 
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    
    // Determinar las clases para el contador basadas en el tema
    const counterClasses = isDarkMode 
      ? 'bg-gray-900 text-white border-gray-700' 
      : 'bg-white text-gray-700 border-gray-200';
    
    return (
      <div className="mt-6">
        <Text variant="h5" className="mb-2 font-medium">Cantidad</Text>
        <div className="flex items-center">
          <button 
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className={`w-10 h-10 flex items-center justify-center rounded-l-md ${buttonClasses}`}
          >
            -
          </button>
          <div 
            className={`w-12 h-10 flex items-center justify-center ${counterClasses} border-t border-b`}
          >
            {quantity}
          </div>
          <button 
            onClick={() => setQuantity(quantity + 1)}
            className={`w-10 h-10 flex items-center justify-center rounded-r-md ${buttonClasses}`}
          >
            +
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Text variant="h2" className="text-3xl font-bold mb-4">
          Producto no encontrado
        </Text>
        <Text variant="body" className="text-muted mb-8">
          El producto que estás buscando no existe o ha sido eliminado.
        </Text>
        <Button
          variant="primary"
          onClick={() => window.history.back()}
          className="px-6 py-2"
        >
          Volver a la tienda
        </Button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'} pt-20 relative`}>
      {/* Notificación de éxito */}
      {showNotification && (
        <div className="fixed top-24 right-4 z-50 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-fade-in-down">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <p className="font-medium">¡Producto agregado al carrito!</p>
            <p className="text-sm">{product?.name} - {selectedColor && selectedSize ? `${selectedColor}, Talla ${selectedSize}` : ''}</p>
          </div>
        </div>
      )}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Columna izquierda: Imágenes del producto */}
          <div className="space-y-8">
            {/* Canvas del producto con colorización dinámica */}
            <div className="h-[650px] w-full flex items-center justify-center">
              {/* Canvas del ángulo actual */}
              <ProductCanvas 
                key={`canvas-${currentAngle}-${selectedColor}-${canvasKeyCounter.current}`}
                angle={currentAngle}
                color={selectedColor ?? '#FFFFFF'}
                className="w-full h-full max-w-2xl mx-auto"
                design={getDesignForAngle(currentAngle)}
                ref={canvasRefs[currentAngle as keyof typeof canvasRefs]}
              />
              
              {/* Canvases ocultos para otros ángulos (necesarios para capturar imágenes) */}
              <div className="hidden">
                {ANGLES.filter(angle => angle !== currentAngle).map(angle => (
                  <ProductCanvas
                    key={`hidden-canvas-${angle}-${selectedColor}`}
                    angle={angle}
                    color={selectedColor ?? '#FFFFFF'}
                    design={getDesignForAngle(angle)}
                    className="w-0 h-0 overflow-hidden"
                    ref={canvasRefs[angle as keyof typeof canvasRefs]}
                  />
                ))}
              </div>
            </div>
            
            {/* Selector de ángulos */}
            {renderAngleSelector()}
            
            {/* No necesitamos miniaturas adicionales ya que usamos los ángulos */}
          </div>
          
          {/* Columna derecha: Información del producto */}
          <div className="space-y-6">
            {/* Categoría */}
            <div className="mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/20 text-accent">
                {product.category}
              </span>
            </div>
            
            {/* Nombre del producto */}
            <Text variant="h1" className="text-3xl md:text-4xl font-bold">
              {product.name}
            </Text>
            
            {/* Precio */}
            <Text variant="h3" className="text-2xl font-semibold text-accent">
              ${product.price.toLocaleString('es-CL')} CLP
            </Text>
            
            {/* Descripción */}
            <div className="py-4 border-t border-b border-gray-200 dark:border-gray-800">
              <Text variant="body" className="text-muted">
                {product.description || 'No hay descripción disponible para este producto.'}
              </Text>
            </div>
            
            {/* Selector de color */}
            {renderColorSelector()}
            
            {/* Selector de talla */}
            {renderSizeSelector()}
            
            {/* Selector de cantidad */}
            {renderQuantitySelector()}
            
            {/* Botón de agregar al carrito */}
            <button
              onClick={handleAddToCart}
              disabled={!selectedColor || !selectedSize}
              className={`w-full py-3 mt-6 ${!selectedColor || !selectedSize ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium rounded-md transition-all duration-200 flex items-center justify-center gap-2`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {!selectedColor || !selectedSize ? 'Selecciona color y talla' : 'Agregar al carrito'}
            </button>
            
            {/* Información adicional */}
            <div className={`mt-8 p-4 rounded-lg ${
              isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
            }`}>
              <div className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-accent mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <Text variant="body" className="font-medium">
                    Información de envío
                  </Text>
                  <Text variant="small" className="text-muted">
                    Entrega estimada: 3-5 días hábiles
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sección de productos relacionados (opcional) */}
        <div className="mt-20">
          <Text variant="h2" className="text-2xl font-bold mb-8">
            Productos relacionados
          </Text>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Aquí irían los productos relacionados */}
          </div>
        </div>
      </div>
    </div>
  );
}
