"use client";

import React from 'react';
import { useTheme } from 'next-themes';
import { CartItemType } from '@/types/cart';
import { formatPrice } from '@/utils/formatters';
import Image from 'next/image';

interface OrderItemDetailProps {
  item: CartItemType;
}

type ItemWithProduct = {
  product?: {
    images?: string[];
    name?: string;
    description?: string;
  };
  quantity?: number;
  price?: number;
};

type ItemWithDesign = {
  design?: {
    front?: {
      previewImage?: string;
    };
  };
  quantity?: number;
  price?: number;
};

const OrderItemDetail: React.FC<OrderItemDetailProps> = ({ item }) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  
  // Determinar la imagen a mostrar según el tipo de ítem
  const getItemImage = (): string => {
    if ('product' in item) {
      const productItem = item as unknown as ItemWithProduct;
      if (productItem.product?.images?.length > 0) {
        return productItem.product.images[0];
      }
    } else if ('design' in item) {
      const designItem = item as unknown as ItemWithDesign;
      if (designItem.design?.front?.previewImage) {
        return designItem.design.front.previewImage;
      }
    }
    return '/images/placeholder.png'; // Imagen de respaldo
  };
  
  // Determinar el nombre del ítem
  const getItemName = (): string => {
    if ('product' in item) {
      const productItem = item as unknown as ItemWithProduct;
      if (productItem.product?.name) {
        return productItem.product.name;
      }
    } else if ('design' in item) {
      return 'Diseño personalizado';
    }
    return 'Producto';
  };
  
  // Determinar la descripción adicional del ítem
  const getItemDescription = (): string => {
    if ('product' in item) {
      const productItem = item as unknown as ItemWithProduct;
      if (productItem.product?.description) {
        const desc = productItem.product.description;
        return desc.substring(0, 60) + (desc.length > 60 ? '...' : '');
      }
    } else if ('design' in item) {
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
            Cantidad: {('quantity' in item ? (item as ItemWithProduct | ItemWithDesign).quantity : 1)}
          </p>
          
          <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            ${formatPrice('price' in item ? (item as ItemWithProduct | ItemWithDesign).price || 0 : 0)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderItemDetail;
