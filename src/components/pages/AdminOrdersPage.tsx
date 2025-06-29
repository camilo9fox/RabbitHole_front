"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Order, OrderStatus } from "@/types/order";
import {
  getAllOrders,
  updateOrderStatus,
  getOrderStates,
} from "@/services/orderService";
import AccessDeniedMessage from "@/components/commons/atoms/AccessDeniedMessage";
import OrdersList from "@/components/commons/organisms/OrdersList";
import { updatePersonalizedDesignStatus } from "@/services/diseñoPersonalizadoService";

export interface OrderState {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
}

const AdminOrdersPage: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const router = useRouter();

  // Estado
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [orderStates, setOrderStates] = useState<OrderState[]>([]);

  // Estado para controlar si el usuario es admin
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const isDarkMode = resolvedTheme === "dark";

  // Verificar si es admin, pero solo en el cliente
  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window !== "undefined") {
      setIsAdmin(localStorage.getItem("user_role") === "admin");
    }
  }, []);

  const fetchOrderStates = async () => {
    try {
      const response = await getOrderStates();
      setOrderStates(response);
    } catch (err) {
      console.error("Error cargando órdenes:", err);
      setError(
        "No se pudieron cargar las órdenes. Por favor, intenta de nuevo más tarde."
      );
    }
  };

  // Función para cargar órdenes
  const fetchOrders = async () => {
    if (!isAdmin) return;

    setLoading(true);
    setError(null);

    try {
      const response = await getAllOrders();
      setOrders(response);
    } catch (err) {
      console.error("Error cargando órdenes:", err);
      setError(
        "No se pudieron cargar las órdenes. Por favor, intenta de nuevo más tarde."
      );
    } finally {
      setLoading(false);
    }
  };

  // Cargar órdenes al inicio
  useEffect(() => {
    fetchOrderStates();
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  // Función para filtrar órdenes (memoizada para evitar recreación innecesaria)
  const applyFilters = useCallback(
    (
      orders: Order[],
      searchTerm: string,
      statusFilter: OrderStatus | "all"
    ): Order[] => {
      return orders.filter((order) => {
        // Filtro por estado
        const matchesStatus =
          statusFilter === "all" ||
          order.estado ===
            orderStates.find((state) => state.codigo === statusFilter)?.nombre;
        // Filtro por término de búsqueda (id, nombre, email)
        const searchTermLower = searchTerm.toLowerCase();
        const matchesSearch =
          searchTerm === "" ||
          String(order.id).toLowerCase().includes(searchTermLower) ||
          order.nombreUsuario?.toLowerCase().includes(searchTermLower) ||
          order.infoEnvio?.nombreCompleto
            ?.toLowerCase()
            .includes(searchTermLower) ||
          order.infoEnvio?.email?.toLowerCase().includes(searchTermLower);

        return matchesStatus && matchesSearch;
      });
    },
    [orders, orderStates]
  );

  // Órdenes filtradas basadas en los criterios actuales
  const filteredOrders = applyFilters(orders, searchTerm, statusFilter);

  // Manejadores de eventos
  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrderId((prevId) => (prevId === orderId ? null : orderId));
  };

  const handleStatusChange = async (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    try {
      // Convertir el estado de enum a ID numérico según el backend
      const statusId = orderStates.find(
        (state) => state.nombre === newStatus
      )!.id;

      await updateOrderStatus(Number(orderId), statusId);

      // Recargar órdenes para mostrar los cambios actualizados
      await fetchOrders();
    } catch (err) {
      console.error("Error al actualizar el estado de la orden:", err);
      alert(
        "No se pudo actualizar el estado de la orden. Por favor, intenta de nuevo."
      );
    }
  };

  const handleUpdateDesignStatus = async (
    designId: number,
    stateId: number
  ) => {
    try {
      await updatePersonalizedDesignStatus(designId, stateId);
      await fetchOrders();
    } catch (err) {
      console.error(
        `Error al actualizar el estado del diseño personalizado:`,
        err
      );
      alert(
        `No se pudo actualizar el estado del diseño personalizado. Por favor, intenta de nuevo.`
      );
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

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      <OrdersList
        orderStates={orderStates}
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
        handleUpdateDesignStatus={handleUpdateDesignStatus}
        handleViewDetails={handleViewDetails}
      />
    </div>
  );
};

export default AdminOrdersPage;
