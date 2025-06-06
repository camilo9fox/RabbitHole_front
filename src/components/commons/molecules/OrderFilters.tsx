"use client";

import React from 'react';
import { Search, Filter } from 'lucide-react';
import { OrderStatus } from '@/types/order';

interface OrderFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: OrderStatus | 'all';
  setStatusFilter: (value: OrderStatus | 'all') => void;
  isDarkMode: boolean;
}

const OrderFilters: React.FC<OrderFiltersProps> = ({ 
  searchTerm, 
  setSearchTerm, 
  statusFilter, 
  setStatusFilter, 
  isDarkMode 
}) => {
  return (
    <div className="mb-6 flex flex-col md:flex-row gap-4">
      {/* Búsqueda */}
      <div className="relative flex-grow">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" aria-hidden="true" />
        </div>
        <input
          type="text"
          className={`block w-full pl-10 pr-3 py-2 border rounded-lg ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
          placeholder="Buscar por ID, nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Filtro de estado */}
      <div className="flex items-center">
        <Filter className="mr-2 h-5 w-5 text-gray-400" aria-hidden="true" />
        <select
          className={`block w-full p-2 border rounded-lg ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
        >
          <option value="all">Todos los estados</option>
          <option value={OrderStatus.PENDING}>Pendiente</option>
          <option value={OrderStatus.PROCESSING}>En proceso</option>
          <option value={OrderStatus.SHIPPED}>Enviado</option>
          <option value={OrderStatus.DELIVERED}>Entregado</option>
          <option value={OrderStatus.CANCELLED}>Cancelado</option>
        </select>
      </div>
    </div>
  );
};

export default OrderFilters;
