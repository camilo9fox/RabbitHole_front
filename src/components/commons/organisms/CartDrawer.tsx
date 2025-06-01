'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { CartItem, isStandardItem, isCustomItem, CustomDesign, CustomDesignStatus } from '@/types/cart';
import Image from 'next/image';
import Link from 'next/link';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import gsap from 'gsap';
import { useTheme } from 'next-themes';

// Props para el componente CartDrawer
interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mapeo de IDs a etiquetas legibles para las vistas
const VIEW_LABELS: Record<string, string> = {
  'front': 'Frente',
  'back': 'Espalda',
  'left': 'Izq',
  'right': 'Der'
};

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cart, updateQuantity, removeItem } = useCart();
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  const drawerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  
  // Estado para controlar qué vista se muestra para cada ítem personalizado
  const [activeViews, setActiveViews] = useState<Record<string, string>>({});
  
  // Efecto para marcar cuando estamos en el cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Formatear precio en CLP
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price * 1000); // Multiplicamos por 1000 para mostrar en pesos chilenos
  };

  // Animación de apertura/cierre del drawer
  useEffect(() => {
    if (!mounted) return;
    
    const drawer = drawerRef.current;
    const overlay = overlayRef.current;
    
    if (!drawer || !overlay) return;
    
    const tl = gsap.timeline({ paused: true });
    
    if (isOpen) {
      // Resetear posición antes de animar
      gsap.set(drawer, { x: '100%' });
      gsap.set(overlay, { opacity: 0 });
      
      // Animar apertura
      tl.to(overlay, { opacity: 0.5, duration: 0.2 })
        .to(drawer, { x: '0%', duration: 0.3, ease: 'power2.out' }, '-=0.1');
      
      tl.play();
    } else {
      // Animar cierre
      tl.to(drawer, { x: '100%', duration: 0.3, ease: 'power2.in' })
        .to(overlay, { opacity: 0, duration: 0.2 }, '-=0.1');

      tl.play();
    }
  }, [isOpen, mounted]);

  // Manejar incremento/decremento de cantidad
  const handleQuantityChange = (index: number, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(index, newQuantity);
    }
  };

  // Función auxiliar para generar keys únicas para items del carrito
  const getCartItemKey = (item: CartItem, index: number): string => {
    if (isStandardItem(item)) {
      return `standard-${item.product.id}-${index}`;
    } else if (isCustomItem(item)) {
      return `custom-${item.design.id ?? 'new'}-${index}`;
    }
    return `item-${index}`; // Fallback
  };

  // Función auxiliar para obtener las vistas personalizadas válidas de un diseño
  const getCustomizedViews = (design: CustomDesign): { id: string; label: string; image: string }[] => {
    if (!design) return [];
    
    const result: { id: string; label: string; image: string }[] = [];
    const views = ['front', 'back', 'left', 'right'] as const;
    
    views.forEach(view => {
      const viewData = design[view];
      if (!viewData) return;
      
      const hasImage = viewData.image !== null;
      const hasText = viewData.text !== null && viewData.text !== '';
      const hasPreviewImage = viewData.previewImage !== undefined && viewData.previewImage !== null;
      
      if ((hasText || hasImage) && (hasPreviewImage || hasImage)) {
        // Usar previewImage si está disponible, de lo contrario usar image
        const imageToUse = viewData.previewImage ?? viewData.image ?? '';
        
        result.push({
          id: view,
          label: VIEW_LABELS[view] || view,
          image: imageToUse
        });
      }
    });
    
    return result;
  };

  // Función auxiliar para obtener detalles del item personalizado
  const getCustomItemDetails = (design: CustomDesign): string => {
    let details = `${design.color} / Talla ${design.size.toUpperCase()}`;
    
    // Agregar estado de aprobación si existe
    if (design.status === CustomDesignStatus.PENDING) {
      details += ' / Pendiente de aprobación';
    } else if (design.status === CustomDesignStatus.APPROVED) {
      details += ' / Aprobado';
    } else if (design.status === CustomDesignStatus.REJECTED) {
      details += ' / Rechazado';
    }
    
    return details;
  };

  // Renderizar un item del carrito
  const renderCartItem = (item: CartItem, index: number) => {
    // Para productos estándar
    if (isStandardItem(item)) {
      const { product } = item;
      return (
        <li key={getCartItemKey(item, index)} className="py-6 flex">
          <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
            <div className="relative h-full w-full">
              <Image
                src={product.images[0] || '/assets/products/placeholder.png'}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100px, 150px"
                className="object-cover object-center"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/assets/products/placeholder.png';
                }}
              />
            </div>
          </div>

          <div className="ml-4 flex flex-1 flex-col">
            <div>
              <div className="flex justify-between text-base font-medium">
                <h3 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-semibold`}>{product.name}</h3>
                <p className={`ml-4 ${isDarkMode ? 'text-white' : 'text-gray-900'} font-semibold`}>
                  {formatPrice(product.price * item.quantity)}
                </p>
              </div>
              <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {`${product.color} / Talla ${product.size.toUpperCase()}`}
              </p>
            </div>
            <div className="flex flex-1 items-end justify-between text-sm">
              <div className="flex items-center">
                <button
                  onClick={() => handleQuantityChange(index, Math.max(1, item.quantity - 1))}
                  className={`p-1 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <Minus className={`h-4 w-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} />
                </button>
                <span className={`mx-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>{item.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(index, item.quantity + 1)}
                  className={`p-1 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <Plus className={`h-4 w-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} />
                </button>
              </div>
              <div className="flex">
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className={`font-medium ${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-500'}`}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </li>
      );
    }
    
    // Para diseños personalizados
    if (isCustomItem(item)) {
      const { design } = item;
      const customizedViews = getCustomizedViews(design);
      
      // Si no hay vistas personalizadas, mostrar un mensaje
      if (customizedViews.length === 0) {
        return (
          <li key={getCartItemKey(item, index)} className="py-6">
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Diseño sin vistas personalizadas</p>
          </li>
        );
      }
      
      // Generar una clave única para este item
      const itemKey = getCartItemKey(item, index);
      
      // Si no hay una vista activa para este item, usar la primera vista disponible
      if (!activeViews[itemKey] && customizedViews.length > 0) {
        setActiveViews(prev => ({
          ...prev,
          [itemKey]: customizedViews[0].id
        }));
      }
      
      // Obtener la vista activa o usar la primera disponible
      const activeView = activeViews[itemKey] || (customizedViews[0]?.id || 'front');
      
      // Encontrar la vista activa en las vistas personalizadas
      const currentView = customizedViews.find(view => view.id === activeView) || customizedViews[0];
      
      // Manejar el cambio de vista
      const handleViewChange = (viewId: string) => {
        setActiveViews(prev => ({
          ...prev,
          [itemKey]: viewId
        }));
      };
      
      return (
        <li key={itemKey} className="py-6 flex">
          <div className="flex flex-col">
            <div className={`h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-100'}`}>
              <div className="relative h-full w-full">
                <Image
                  src={currentView?.image || '/assets/products/white-tshirt/white-tshirt-frente.png'}
                  alt={`Diseño personalizado - ${currentView?.id || 'frente'}`}
                  fill
                  sizes="(max-width: 768px) 100px, 150px"
                  className="object-cover object-center"
                  onError={(e) => {
                    // Fallback para imágenes que no cargan
                    const target = e.target as HTMLImageElement;
                    target.src = '/assets/products/white-tshirt/white-tshirt-frente.png';
                  }}
                />
              </div>
            </div>
            
            {/* Selector de vistas para diseños personalizados con múltiples vistas */}
            {customizedViews.length > 1 && (
              <div className="mt-2 flex justify-center space-x-1">
                {customizedViews.map((view) => {
                  // Determinar la clase de estilo para el botón
                  let buttonClass = 'px-1 py-0.5 text-xs rounded ';
                  
                  // Botón activo
                  if (activeView === view.id) {
                    buttonClass += isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white';
                  } 
                  // Botón inactivo
                  else {
                    buttonClass += isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700';
                  }
                  
                  return (
                    <button
                      key={view.id}
                      onClick={() => handleViewChange(view.id)}
                      className={buttonClass}
                      title={`Ver ${view.label}`}
                    >
                      {view.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="ml-4 flex flex-1 flex-col">
            <div>
              <div className="flex justify-between text-base font-medium">
                <h3 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-semibold`}>Polera Personalizada</h3>
                <p className={`ml-4 ${isDarkMode ? 'text-white' : 'text-gray-900'} font-semibold`}>
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
              <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {getCustomItemDetails(design)}
              </p>
            </div>
            <div className="flex flex-1 items-end justify-between text-sm">
              <div className="flex items-center">
                <button
                  onClick={() => handleQuantityChange(index, Math.max(1, item.quantity - 1))}
                  className={`p-1 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <Minus className={`h-4 w-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} />
                </button>
                <span className={`mx-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>{item.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(index, item.quantity + 1)}
                  className={`p-1 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <Plus className={`h-4 w-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} />
                </button>
              </div>
              <div className="flex">
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className={`font-medium ${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-500'}`}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </li>
      );
    }
    
    // Fallback para tipos de items no reconocidos
    return (
      <li key={getCartItemKey(item, index)} className="py-6">
        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Item desconocido</p>
      </li>
    );
  };

  // Si no estamos en el cliente, devolvemos un placeholder vacío para evitar errores de hidratación
  if (!mounted) return null;

  return (
    <div className={`fixed inset-0 z-50 overflow-hidden ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      {/* Overlay */}
      <button
        ref={overlayRef}
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity ${isOpen ? 'opacity-50' : 'opacity-0'}`}
        onClick={onClose}
        aria-label="Cerrar carrito"
      />

      {/* Panel lateral */}
      <div
        ref={drawerRef}
        className={`fixed inset-y-0 right-0 max-w-md w-full transform transition-transform ${isDarkMode ? 'bg-gray-900' : 'bg-white'} shadow-xl flex flex-col`}
        style={{ transform: 'translateX(100%)' }}
      >
        {/* Cabecera */}
        <div className={`flex items-center justify-between px-4 py-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Tu Carrito</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-800 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'}`}
            aria-label="Cerrar carrito"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Contenido del carrito */}
        <div className={`flex-1 overflow-y-auto p-4 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-10">
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-700'} text-center`}>Tu carrito está vacío</p>
              <button
                onClick={onClose}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Continuar comprando
              </button>
            </div>
          ) : (
            <ul className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {cart.items.map((item, index) => renderCartItem(item, index))}
            </ul>
          )}
        </div>
        
        {/* Resumen y botón de checkout */}
        {cart.items.length > 0 && (
          <div className={`border-t p-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex justify-between text-base font-medium">
              <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-semibold`}>Subtotal</p>
              <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-semibold`}>{formatPrice(cart.totalPrice)}</p>
            </div>
            <p className={`mt-0.5 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Envío y descuentos calculados al finalizar la compra.
            </p>
            <div className="mt-4">
              <Link
                href="/checkout"
                className={`flex items-center justify-center rounded-md border border-transparent px-6 py-3 text-base font-medium text-white shadow-sm w-full ${isDarkMode ? 'bg-blue-700 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                onClick={onClose}
              >
                Finalizar Compra
              </Link>
            </div>
            <div className="mt-2 flex justify-center text-center text-sm">
              <button
                type="button"
                className={`font-medium ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'} underline`}
                onClick={onClose}
              >
                Continuar Comprando
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;