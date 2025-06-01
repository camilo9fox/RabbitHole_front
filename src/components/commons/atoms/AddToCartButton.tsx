import React from 'react';
import { useTheme } from 'next-themes';
import { useCart } from '../../../context/CartContext';
import { CustomDesign } from '../../../types/cart';

interface AddToCartButtonProps {
  design: CustomDesign;
  quantity: number;
  className?: string;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({ 
  design, 
  quantity, 
  className = '' 
}) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  const { addCustomItem } = useCart();

  const handleAddToCart = () => {
    // Añadir el diseño personalizado al carrito
    addCustomItem(design, quantity);
    
    // Mostrar notificación de éxito (podría implementarse con un sistema de notificaciones)
    alert('¡Diseño añadido al carrito! Recuerda que debe ser aprobado antes de proceder con el pago.');
  };

  return (
    <button
      type="button"
      className={`px-6 py-3 text-white font-medium rounded-md transition-colors ${isDarkMode ? 'bg-blue-700 hover:bg-blue-800' : 'bg-blue-600 hover:bg-blue-700'} ${className}`}
      onClick={handleAddToCart}
    >
      Añadir al Carrito
    </button>
  );
};

export default AddToCartButton;
