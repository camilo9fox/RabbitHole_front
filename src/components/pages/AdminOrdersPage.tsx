"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Order, OrderStatus } from '@/types/order';
import { isCustomItem } from '@/types/cart';
import { getDesignSafely } from '@/utils/cartHelpers';
import { 
  getAllOrders, 
  updateOrderStatus, 
  approveCustomDesign, 
  rejectCustomDesign 
} from '@/services/orderService';
import AccessDeniedMessage from '@/components/commons/atoms/AccessDeniedMessage';
import OrdersList from '@/components/commons/organisms/OrdersList';

const AdminOrdersPage: React.FC = () => {
  const { data: session } = useSession();
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  
  // Estado
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  
  // Estado para controlar si el usuario es admin
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const isDarkMode = resolvedTheme === 'dark';
  
  // Verificar si es admin, pero solo en el cliente
  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window !== 'undefined') {
      setIsAdmin(localStorage.getItem("user_role") === "admin");
    }
  }, []);

  // Cargar órdenes al inicio
  useEffect(() => {
    if (isAdmin) {
      try {
        const loadedOrders = getAllOrders();
        setOrders(loadedOrders);
      } catch (error) {
        console.error('Error cargando órdenes:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [isAdmin]);
  
  // Función para filtrar órdenes (memoizada para evitar recreación innecesaria)
  const applyFilters = useCallback((orders: Order[], searchTerm: string, statusFilter: OrderStatus | 'all'): Order[] => {
    return orders.filter(order => {
      // Filtro por estado
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      
      // Filtro por término de búsqueda (id, nombre, email)
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === '' || 
        order.id.toLowerCase().includes(searchTermLower) ||
        order.userEmail?.toLowerCase().includes(searchTermLower) ||
        order.shippingInfo.fullName.toLowerCase().includes(searchTermLower);
      
      return matchesStatus && matchesSearch;
    });
  }, []);
  
  // Órdenes filtradas basadas en los criterios actuales
  const filteredOrders = applyFilters(orders, searchTerm, statusFilter);
  
  // Manejadores de eventos
  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrderId(prevId => prevId === orderId ? null : orderId);
  };
  
  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    const adminName = session?.user?.name ?? 'Admin';
    const updatedOrder = updateOrderStatus(orderId, newStatus, `Actualizado por admin: ${adminName}`);
    
    if (updatedOrder) {
      setOrders(prevOrders => prevOrders.map(order => order.id === orderId ? updatedOrder : order));
    }
  };
  
  const handleCustomDesignAction = (orderId: string, action: 'approve' | 'reject') => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    // Variable para almacenar la orden actualizada
    let updatedOrder: Order | null = order;
    
    // Aplicar la acción a todos los items personalizados de la orden
    for (const item of order.items) {
      // Obtener el diseño de forma segura
      const design = getDesignSafely(item);
      if (isCustomItem(item) && design?.id) {
        if (action === 'approve') {
          updatedOrder = approveCustomDesign(orderId, design.id);
        } else {
          updatedOrder = rejectCustomDesign(orderId, design.id, 'Rechazado por el administrador');
        }
      }
    }
    
    // Solo actualizar el estado si tenemos una orden válida
    if (updatedOrder) {
      setOrders(prevOrders => prevOrders.map(o => o.id === orderId ? updatedOrder : o));
    }
  };
  
  const handleViewDetails = (orderId: string) => {
    router.push(`/order/${orderId}`);
  };
  
  // Renderizar mensaje de acceso denegado si el usuario no es admin
  if (!isAdmin) {
    return <AccessDeniedMessage />;
  }
  
  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <h1 className="text-3xl font-bold mb-6">Administración de Órdenes</h1>
      
      <OrdersList
        orders={orders}
        filteredOrders={filteredOrders}
        loading={loading}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        expandedOrderId={expandedOrderId}
        isDarkMode={isDarkMode}
        toggleOrderExpand={toggleOrderExpand}
        handleStatusChange={handleStatusChange}
        handleCustomDesignAction={handleCustomDesignAction}
        handleViewDetails={handleViewDetails}
      />
    </div>
  );
};

export default AdminOrdersPage;