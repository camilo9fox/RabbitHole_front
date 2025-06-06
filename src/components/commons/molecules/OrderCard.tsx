"use client";

import React from 'react';
import { ChevronDown, ChevronUp, Eye, Check, X } from 'lucide-react';
import { Order, OrderStatus } from '@/types/order';
import { isCustomItem } from '@/types/cart';
import { formatDate, formatPrice } from '@/utils/formatters';
import OrderStatusBadge from '@/components/commons/atoms/OrderStatusBadge';

interface OrderCardProps {
  order: Order;
  expandedOrderId: string | null;
  isDarkMode: boolean;
  toggleOrderExpand: (orderId: string) => void;
  handleStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  handleCustomDesignAction: (orderId: string, action: 'approve' | 'reject') => void;
  handleViewDetails: (orderId: string) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  expandedOrderId,
  isDarkMode,
  toggleOrderExpand,
  handleStatusChange,
  handleCustomDesignAction,
  handleViewDetails
}) => {
  return (
    <div 
      className={`rounded-lg overflow-hidden border ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}
    >
      {/* Cabecera de la orden (siempre visible) */}
      <button 
        className={`w-full text-left p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center ${
          isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
        }`}
        onClick={() => toggleOrderExpand(order.id)}
        aria-expanded={expandedOrderId === order.id}
        aria-label={`Expandir detalles de orden #${order.id.substring(0, 8)}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            toggleOrderExpand(order.id);
            e.preventDefault();
          }
        }}
      >
        <div className="flex-grow">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-medium">Orden #{order.id.substring(0, 8)}</h3>
            <OrderStatusBadge status={order.status} />
            {order.items.some(item => isCustomItem(item)) && (
              <span className={`px-2 py-1 rounded-full text-xs ${
                isDarkMode ? 'bg-purple-900/30 text-purple-200' : 'bg-purple-100 text-purple-800'
              }`}>
                Diseño personalizado
              </span>
            )}
          </div>
          
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <span className="font-medium">Cliente:</span> {order.shippingInfo.fullName} ({order.userEmail ?? 'Email no disponible'})
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <span className="font-medium">Fecha:</span> {formatDate(order.createdAt)}
          </p>
        </div>
        
        <div className="flex items-center mt-3 sm:mt-0">
          <span className="font-bold mr-2">${formatPrice(order.total)}</span>
          {expandedOrderId === order.id ? (
            <ChevronUp className="h-5 w-5" aria-hidden="true" />
          ) : (
            <ChevronDown className="h-5 w-5" aria-hidden="true" />
          )}
        </div>
      </button>
      
      {/* Detalles expandibles */}
      {expandedOrderId === order.id && (
        <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          {/* Productos de la orden */}
          <h4 className="font-medium mb-2">Productos</h4>
          <div className="space-y-2 mb-4">
            {order.items.map((item, idx) => (
              <div 
                key={`${order.id}-item-${idx}`} 
                className={`p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
              >
                <div className="flex justify-between">
                  <div>
                    {isCustomItem(item) ? (
                      // Item personalizado
                      <>
                        <p className="font-medium">Diseño personalizado: {item.design.name || `Diseño #${idx + 1}`}</p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Cantidad: {item.quantity} × ${formatPrice(item.price)}
                        </p>
                        <div className={`mt-1 p-1 rounded ${isDarkMode ? 'bg-gray-600' : 'bg-gray-100'}`}>
                          <p className="text-xs font-medium">Estado: {item.design.status}</p>
                          {item.design.rejectionReason && (
                            <p className="text-xs mt-1">Motivo rechazo: {item.design.rejectionReason}</p>
                          )}
                          {item.design.modificationNotes && (
                            <p className="text-xs mt-1">Notas: {item.design.modificationNotes}</p>
                          )}
                        </div>
                      </>
                    ) : (
                      // Item estándar
                      <>
                        <p className="font-medium">{item.product.name}</p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Cantidad: {item.quantity} × ${formatPrice(item.product.price)}
                        </p>
                      </>
                    )}
                  </div>
                  <p className="font-medium">${formatPrice(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Acciones para la orden */}
          <div className="flex flex-wrap gap-2">
            {/* Botones de acción para cambiar estado */}
            <div className="flex flex-col sm:flex-row gap-2">
              <label 
                className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                htmlFor={`order-status-${order.id}`}
              >
                Cambiar estado a:
              </label>
              <select
                className={`p-1 text-sm rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                id={`order-status-${order.id}`}
                value={order.status}
                onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
              >
                <option value={OrderStatus.PENDING}>Pendiente</option>
                <option value={OrderStatus.PROCESSING}>En proceso</option>
                <option value={OrderStatus.SHIPPED}>Enviado</option>
                <option value={OrderStatus.DELIVERED}>Entregado</option>
                <option value={OrderStatus.CANCELLED}>Cancelado</option>
              </select>
            </div>
            
            {/* Separador */}
            <div className="hidden sm:block mx-2 border-r border-gray-300 dark:border-gray-700"></div>
            
            {/* Acciones para diseños personalizados */}
            {order.items.some(item => isCustomItem(item)) && (
              <div className="flex items-center gap-2">
                <button
                  className="flex items-center px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                  onClick={() => handleCustomDesignAction(order.id, 'approve')}
                >
                  <Check className="h-4 w-4 mr-1" aria-hidden="true" />
                  <span className="text-sm">Aprobar diseño</span>
                </button>
                <button
                  className="flex items-center px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                  onClick={() => handleCustomDesignAction(order.id, 'reject')}
                >
                  <X className="h-4 w-4 mr-1" aria-hidden="true" />
                  <span className="text-sm">Rechazar diseño</span>
                </button>
              </div>
            )}
            
            {/* Ver detalles completos */}
            <button
              className={`ml-auto flex items-center px-2 py-1 rounded ${
                isDarkMode 
                  ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50' 
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
              onClick={() => handleViewDetails(order.id)}
            >
              <Eye className="h-4 w-4 mr-1" aria-hidden="true" />
              <span className="text-sm">Ver detalles</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderCard;
