"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Order } from "@/types/order";
import { getOrdersByUserID } from "@/services/orderService";
import { dateFromBDFormat } from "@/utils/formatters";
import OrderStatusBadge from "@/components/commons/atoms/OrderStatusBadge";
import OrderSummary from "@/components/commons/molecules/OrderSummary";
import Link from "next/link";
import Image from "next/image";
import { Search, Package, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";

const MyOrdersPage: React.FC = () => {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { persistentCart } = useCart();

  // Cargar pedidos del usuario desde backend
  useEffect(() => {
    const fetchOrders = async () => {
      if (persistentCart.userId) {
        setLoading(true);
        try {
          const response = await getOrdersByUserID(
            Number(persistentCart.userId)
          );
          setOrders(response);
        } catch (err) {
          console.error("Error al cargar las órdenes del usuario:", err);
          // Aquí puedes agregar un estado de error si lo deseas
        } finally {
          setLoading(false);
        }
      }
    };
    fetchOrders();
  }, [persistentCart]);

  // Filtrar pedidos según el término de búsqueda
  const filteredOrders = orders.filter((order) => {
    const search = searchTerm.toLowerCase();
    const idMatch = String(order.id).toLowerCase().includes(search);
    const nameMatch = order.infoEnvio?.nombreCompleto
      ?.toLowerCase()
      .includes(search);
    const statusMatch = order.estado?.toLowerCase().includes(search);
    return idMatch || nameMatch || statusMatch;
  });

  // Ordenar pedidos por fecha (más recientes primero)
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    // creadaEn es un array tipo [YYYY, MM, DD, HH, mm, ss]
    const getDate = (orden: Order) => {
      if (!orden.creadaEn) return 0;
      // Ajustar mes -1 porque en JS Date el mes es 0-indexed
      const [year, month, day, hour, minute, second] = orden.creadaEn;
      return new Date(year, month - 1, day, hour, minute, second).getTime();
    };
    return getDate(b) - getDate(a);
  });

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleViewDetails = (orderId: number) => {
    router.push(`/order/${orderId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p
            className={`mt-4 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
          >
            Cargando tus pedidos...
          </p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <h1
          className={`text-2xl font-bold mb-8 ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Mis Pedidos
        </h1>
        <div
          className={`p-8 rounded-lg shadow-md text-center ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <ShoppingBag
            className={`h-16 w-16 mx-auto mb-4 ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          />
          <h2
            className={`text-xl font-semibold mb-2 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            No tienes pedidos aún
          </h2>
          <p
            className={`mb-6 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            Explora nuestra tienda y realiza tu primer pedido
          </p>
          <Link
            href="/shop"
            className={`inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
              isDarkMode
                ? "bg-blue-700 hover:bg-blue-600"
                : "bg-blue-600 hover:bg-blue-700"
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            Ir a la Tienda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <h1
        className={`text-2xl font-bold mb-8 ${
          isDarkMode ? "text-white" : "text-gray-900"
        }`}
      >
        Mis Pedidos
      </h1>

      <div className="mb-6">
        <div
          className={`relative rounded-md shadow-sm ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search
              className={`h-5 w-5 ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            />
          </div>
          <input
            type="text"
            placeholder="Buscar por número de pedido, nombre o estado..."
            className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              isDarkMode
                ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
            }`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de pedidos */}
        <div
          className={`lg:col-span-1 rounded-lg shadow-sm overflow-hidden ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div
            className={`px-4 py-3 border-b ${
              isDarkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <h2
              className={`font-medium ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {sortedOrders.length}{" "}
              {sortedOrders.length === 1 ? "Pedido" : "Pedidos"}
            </h2>
          </div>
          <ul
            className={`divide-y ${
              isDarkMode ? "divide-gray-700" : "divide-gray-200"
            }`}
          >
            {sortedOrders.map((order) => (
              <li key={order.id}>
                <OrderSummary
                  order={order}
                  isSelected={selectedOrder?.id === order.id}
                  onClick={() => handleOrderClick(order)}
                />
              </li>
            ))}
          </ul>
        </div>

        {/* Detalles del pedido seleccionado */}
        <div
          className={`lg:col-span-2 rounded-lg shadow-sm ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          {selectedOrder ? (
            <div>
              <div
                className={`px-6 py-4 border-b ${
                  isDarkMode ? "border-gray-700" : "border-gray-200"
                }`}
              >
                <div className="flex justify-between items-center">
                  <h2
                    className={`text-lg font-medium ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Detalles del Pedido #
                    {String(selectedOrder.id).padStart(8, "0")}
                  </h2>
                  <button
                    onClick={() => handleViewDetails(selectedOrder.id)}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      isDarkMode
                        ? "bg-blue-700 hover:bg-blue-600 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    Ver Completo
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Estado y fecha */}
                <div className="flex justify-between items-center">
                  <div>
                    <p
                      className={`text-sm ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Estado
                    </p>
                    <div className="mt-1">
                      <OrderStatusBadge status={selectedOrder.estado} />
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Fecha
                    </p>
                    <p
                      className={`font-medium ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {dateFromBDFormat(selectedOrder.creadaEn.toString())}
                    </p>
                  </div>
                </div>

                {/* Información de envío */}
                <div>
                  <h3
                    className={`text-sm font-medium mb-2 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Información de Envío
                  </h3>
                  <div
                    className={`p-4 rounded-md ${
                      isDarkMode ? "bg-gray-700" : "bg-gray-50"
                    }`}
                  >
                    <p
                      className={`font-medium ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {selectedOrder.infoEnvio?.nombreCompleto}
                    </p>
                    <p
                      className={`${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {selectedOrder.infoEnvio?.direccion}
                    </p>
                    <p
                      className={`${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {selectedOrder.infoEnvio?.ciudad},{" "}
                      {selectedOrder.infoEnvio?.estado}{" "}
                      {selectedOrder.infoEnvio?.codigoPostal}
                    </p>
                    <p
                      className={`${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {selectedOrder.infoEnvio?.pais}
                    </p>
                    <p
                      className={`mt-2 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {selectedOrder.infoEnvio?.telefono}
                    </p>
                  </div>
                </div>

                {/* Resumen de productos */}
                <div>
                  <h3
                    className={`text-sm font-medium mb-2 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Productos ({selectedOrder.items.length})
                  </h3>
                  <div
                    className={`rounded-md overflow-hidden ${
                      isDarkMode ? "bg-gray-700" : "bg-gray-50"
                    }`}
                  >
                    <ul
                      className={`divide-y ${
                        isDarkMode ? "divide-gray-600" : "divide-gray-200"
                      }`}
                    >
                      {selectedOrder.items.slice(0, 3).map((item, idx) => (
                        <li
                          key={`item-${selectedOrder.id}-${idx}`}
                          className="p-4 flex items-center"
                        >
                          <div className="flex-shrink-0 h-16 w-16 bg-gray-200 rounded-md overflow-hidden">
                            <Image
                              src={
                                item.productoId !== null
                                  ? item.thumbnails?.find(
                                      (thumbnail) =>
                                        thumbnail.nombreAngulo === "Frente"
                                    )?.url ?? ""
                                  : item.disenoPersonalizado?.angulos?.find(
                                      (angulo) =>
                                        angulo.nombreAngulo === "Frente"
                                    )?.thumbnailUrl ??
                                    item.disenoPersonalizado?.angulos[0]
                                      .thumbnailUrl ??
                                    ""
                              }
                              alt={item.producto?.nombre ?? item.nombre}
                              width={64}
                              height={64}
                              className="h-full w-full object-contain"
                            />
                          </div>
                          <div className="ml-4 flex-1">
                            <p
                              className={`font-medium ${
                                isDarkMode ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {item.producto?.nombre ?? item.nombre}
                            </p>
                            <p
                              className={`font-light ${
                                isDarkMode ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {item.producto?.nombre ?? item.nombre}
                            </p>
                            <p
                              className={`text-sm ${
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              Cantidad: {item.cantidad}
                            </p>
                          </div>
                          <div className="text-right">
                            <p
                              className={`font-medium ${
                                isDarkMode ? "text-white" : "text-gray-900"
                              }`}
                            >
                              ${item.precioUnitario?.toLocaleString() ?? ""}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                    {selectedOrder.items.length > 3 && (
                      <div
                        className={`p-4 text-center ${
                          isDarkMode
                            ? "border-t border-gray-600"
                            : "border-t border-gray-200"
                        }`}
                      >
                        <button
                          onClick={() => handleViewDetails(selectedOrder.id)}
                          className={`text-sm ${
                            isDarkMode ? "text-blue-400" : "text-blue-600"
                          }`}
                        >
                          Ver {selectedOrder.items.length - 3} productos más
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div
                  className={`pt-4 border-t ${
                    isDarkMode ? "border-gray-700" : "border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <p
                      className={`font-medium ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Total
                    </p>
                    <p
                      className={`text-lg font-bold ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      ${selectedOrder.total.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Package
                className={`h-16 w-16 mb-4 ${
                  isDarkMode ? "text-gray-500" : "text-gray-400"
                }`}
              />
              <h3
                className={`text-lg font-medium mb-2 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Selecciona un pedido
              </h3>
              <p
                className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
              >
                Haz clic en un pedido de la lista para ver sus detalles
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOrdersPage;
