"use client";

import React from 'react';
import { useTheme } from 'next-themes';
import { CartItem, isStandardItem, isCustomItem } from '@/types/cart';
import { formatPrice } from '@/utils/formatters';
import Image from 'next/image';

interface OrderItemDetailProps {
  item: CartItem;
}

const OrderItemDetail: React.FC<OrderItemDetailProps> = ({ item }) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  
  // Determinar la imagen a mostrar según el tipo de ítem
  const getItemImage = (): string => {
    if (isStandardItem(item)) {
      // Ahora TypeScript sabe que item es StandardCartItem
      const firstImage = item.product?.images?.[0];
      if (firstImage) {
        return firstImage;
      }
    } else if (isCustomItem(item)) {
      // Ahora TypeScript sabe que item es CustomCartItem
      const previewImage = item.design?.front?.previewImage;
      if (previewImage) {
        return previewImage;
      }
    }
    return '/images/placeholder.png'; // Imagen de respaldo
  };
  
  // Determinar el nombre del ítem
  const getItemName = (): string => {
    if (isStandardItem(item)) {
      const name = item.product?.name;
      if (name) {
        return name;
      }
    } else if (isCustomItem(item)) {
      return 'Diseño personalizado';
    }
    return 'Producto';
  };
  
  // Determinar la descripción adicional del ítem
  const getItemDescription = (): string => {
    if (isStandardItem(item)) {
      const desc = item.product?.description;
      if (desc) {
        return desc.substring(0, 60) + (desc.length > 60 ? '...' : '');
      }
    } else if (isCustomItem(item)) {
      return 'Polera con diseño personalizado';
    }
    return '';
  };
  
  return (
    <div className={`p-4 flex items-center ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="flex-shrink-0 h-20 w-20 bg-gray-200 rounded-md overflow-hidden relative">
        <Image
          src={getItemImage()}
          alt={getItemName()}
          fill
          className="object-cover"
          unoptimized={true}
        />
      </div>
      
      <div className="ml-4 flex-1">
        <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {getItemName()}
        </p>
        
        {getItemDescription() && (
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {getItemDescription()}
          </p>
        )}
        
        <div className="flex justify-between mt-2">
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Cantidad: {item.quantity ?? 1}
          </p>
          
          <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            ${formatPrice(item.price ?? 0)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderItemDetail;
