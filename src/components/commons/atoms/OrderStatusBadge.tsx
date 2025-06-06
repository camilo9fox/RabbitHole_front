"use client";

import React from 'react';
import { useTheme } from 'next-themes';
import { OrderStatus } from '@/types/order';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
}

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, size = 'md' }) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  
  const getStatusColor = () => {
    switch (status) {
      case OrderStatus.PENDING:
        return isDarkMode ? 'bg-yellow-800 text-yellow-200' : 'bg-yellow-100 text-yellow-800';
      case OrderStatus.PROCESSING:
        return isDarkMode ? 'bg-blue-800 text-blue-200' : 'bg-blue-100 text-blue-800';
      case OrderStatus.SHIPPED:
        return isDarkMode ? 'bg-purple-800 text-purple-200' : 'bg-purple-100 text-purple-800';
      case OrderStatus.DELIVERED:
        return isDarkMode ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-800';
      case OrderStatus.CANCELLED:
        return isDarkMode ? 'bg-red-800 text-red-200' : 'bg-red-100 text-red-800';
      default:
        return isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusText = () => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'Pendiente';
      case OrderStatus.PROCESSING:
        return 'En proceso';
      case OrderStatus.SHIPPED:
        return 'Enviado';
      case OrderStatus.DELIVERED:
        return 'Entregado';
      case OrderStatus.CANCELLED:
        return 'Cancelado';
      default:
        return status;
    }
  };
  
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-4 py-2 text-base';
      case 'md':
      default:
        return 'px-3 py-1.5 text-sm';
    }
  };
  
  return (
    <span className={`rounded-md font-medium ${getSizeClasses()} ${getStatusColor()}`}>
      {getStatusText()}
    </span>
  );
};

export default OrderStatusBadge;
