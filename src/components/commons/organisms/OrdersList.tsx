"use client";

import React from 'react';
import { Order, OrderStatus } from '@/types/order';
import OrderFilters from '@/components/commons/molecules/OrderFilters';
import OrderCard from '@/components/commons/molecules/OrderCard';

interface OrdersListProps {
  orders: Order[];
  filteredOrders: Order[];
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: OrderStatus | 'all';
  setStatusFilter: (value: OrderStatus | 'all') => void;
  expandedOrderId: string | null;
  isDarkMode: boolean;
  toggleOrderExpand: (orderId: string) => void;
  handleStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  handleCustomDesignAction: (orderId: string, action: 'approve' | 'reject') => void;
  handleViewDetails: (orderId: string) => void;
}

const OrdersList: React.FC<OrdersListProps> = ({
  filteredOrders,
  loading,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  expandedOrderId,
  isDarkMode,
  toggleOrderExpand,
  handleStatusChange,
  handleCustomDesignAction,
  handleViewDetails
}) => {
  return (
    <>
      {/* Filtros y búsqueda */}
      <OrderFilters 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        isDarkMode={isDarkMode}
      />
      
      {/* Lista de órdenes */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-500 dark:text-gray-400">Cargando órdenes...</p>
          </div>
        ) : (
          // Determinar qué mostrar en base a los resultados filtrados
          filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <OrderCard 
                key={order.id}
                order={order}
                expandedOrderId={expandedOrderId}
                isDarkMode={isDarkMode}
                toggleOrderExpand={toggleOrderExpand}
                handleStatusChange={handleStatusChange}
                handleCustomDesignAction={handleCustomDesignAction}
                handleViewDetails={handleViewDetails}
              />
            ))
          ) : (
            <div className={`p-8 text-center rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {searchTerm || statusFilter !== 'all' 
                  ? 'No se encontraron órdenes que coincidan con tus filtros' 
                  : 'No hay órdenes disponibles'
                }
              </p>
            </div>
          )
        )}
      </div>
    </>
  );
};

export default OrdersList;
