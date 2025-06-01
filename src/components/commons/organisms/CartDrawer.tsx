'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { CartItem, isStandardItem, isCustomItem } from '@/types/cart';
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

// Función auxiliar para generar keys únicas para items del carrito
const getCartItemKey = (item: CartItem, index: number): string => {
  if (isStandardItem(item)) {
    return `standard-${item.product.id}-${index}`;
  } else if (isCustomItem(item)) {
    // Para diseños personalizados
    return `custom-${item.design.id ?? 'new'}-${index}`;
  }
  return `item-${index}`; // Fallback
};

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cart, updateQuantity, removeItem } = useCart();
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  const drawerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  
  // Log the current theme for debugging
  useEffect(() => {
    console.log('Current theme in CartDrawer:', resolvedTheme);
  }, [resolvedTheme, mounted]);

  // Efecto para marcar cuando estamos en el cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Formatear precio en CLP
  const formatPrice = (price: number) => {
    // Asegurarse de que el precio se muestre en miles (pesos chilenos)
    // Multiplicamos por 1000 para convertir de la unidad de almacenamiento (miles) a la unidad de visualización (pesos)
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

  // Renderizar un ítem del carrito
  const renderCartItem = (item: CartItem, index: number) => {
    // Usar una imagen de polera básica como fallback en lugar de placeholder
    let image = '/assets/products/white-tshirt/white-tshirt-frente.png';
    let name = 'Producto';
    let price = 0;
    let details = '';

    if (isStandardItem(item)) {
      // Para productos estándar, usar la primera imagen o la imagen de fallback
      image = item.product.images[0] ?? '/assets/products/white-tshirt/white-tshirt-frente.png';
      name = item.product.name;
      price = item.product.price;
      details = `${item.product.color} / Talla ${item.product.size.toUpperCase()}`;
    } else if (isCustomItem(item)) {
      // Obtener la imagen correcta del diseño personalizado
      let designImage = null;
      
      // Prioridad 1: Usar la imagen completa del canvas capturada (previewImage)
      if (item.design.front && typeof item.design.front === 'object' && item.design.front.previewImage) {
        designImage = item.design.front.previewImage;
        console.log('Usando imagen completa del canvas (previewImage)');
      } 
      // Prioridad 2: Usar la imagen parcial si no hay imagen completa
      else if (item.design.front && typeof item.design.front === 'object' && item.design.front.image) {
        designImage = item.design.front.image;
        console.log('Usando imagen parcial del diseño (image)');
      }
      
      // Si tenemos una imagen de diseño personalizado, usarla; de lo contrario, usar la imagen de fallback
      image = designImage ?? '/assets/products/white-tshirt/white-tshirt-frente.png';
      name = 'Diseño Personalizado';
      price = item.price;
      details = `${item.design.color} / Talla ${item.design.size.toUpperCase()}`;
      
      // Agregar estado de aprobación si existe
      if (item.design.status === 'pending') details += ' / Pendiente de aprobación';
      else if (item.design.status === 'approved') details += ' / Aprobado';
      else if (item.design.status === 'rejected') details += ' / Rechazado';
    }

    return (
      <li key={getCartItemKey(item, index)} className="py-6 flex">
        <div className={`h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-100'}`}>
          <div className="relative h-full w-full">
            <Image
              src={image}
              alt={name}
              fill
              sizes="(max-width: 768px) 100px, 150px"
              className="object-cover object-center"
              onError={(e) => {
                // Fallback para imágenes que no cargan - usar una imagen existente
                const target = e.target as HTMLImageElement;
                target.src = '/assets/products/white-tshirt/white-tshirt-frente.png';
                console.log('Imagen no encontrada, usando fallback');
              }}
            />
          </div>
        </div>

        <div className="ml-4 flex flex-1 flex-col">
          <div>
            <div className="flex justify-between text-base font-medium">
              <h3 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-semibold`}>{name}</h3>
              <p className={`ml-4 ${isDarkMode ? 'text-white' : 'text-gray-900'} font-semibold`}>{formatPrice(price * item.quantity)}</p>
            </div>
            <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{details}</p>
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
