"use client";

import React from 'react';
import { useTheme } from 'next-themes';
import { Order } from '@/types/order';
import OrderStatusBadge from '@/components/commons/atoms/OrderStatusBadge';
import { formatDate, formatPrice } from '@/utils/formatters';
import { ChevronRight } from 'lucide-react';

interface OrderSummaryProps {
  order: Order;
  isSelected?: boolean;
  onClick?: () => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ 
  order, 
  isSelected = false, 
  onClick 
}) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  
  // Determinar las clases de estilo basadas en el tema y si está seleccionado
  const getBackgroundClass = () => {
    if (isSelected) {
      return isDarkMode ? 'bg-gray-700' : 'bg-blue-50';
    }
    return isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50';
  };
  
  return (
    <button
      className={`w-full text-left px-4 py-3 cursor-pointer transition-colors ${getBackgroundClass()}`}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick && onClick()}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
    >
      <div className="flex justify-between items-center">
        <div>
          <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Pedido #{order.id.slice(-8)}
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {formatDate(new Date(order.createdAt))}
          </p>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            ${formatPrice(order.total)}
          </p>
        </div>
        <div className="flex items-center">
          <OrderStatusBadge status={order.status} size="sm" />
          <ChevronRight className={`h-5 w-5 ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
        </div>
      </div>
    </button>
  );
};

export default OrderSummary;
