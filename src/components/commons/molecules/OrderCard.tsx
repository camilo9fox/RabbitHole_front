"use client";

import React from "react";
import { ChevronDown, ChevronUp, Eye, Check, X } from "lucide-react";
import { Order, OrderStatus } from "@/types/order";
import { formatDate, formatPrice } from "@/utils/formatters";
import OrderStatusBadge from "@/components/commons/atoms/OrderStatusBadge";
import { OrderState } from "@/components/pages/AdminOrdersPage";

interface OrderCardProps {
  order: Order;
  orderStates: OrderState[];
  expandedOrderId: string | null;
  isDarkMode: boolean;
  toggleOrderExpand: (orderId: string) => void;
  handleStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  handleUpdateDesignStatus: (designId: number, stateId: number) => void;
  handleViewDetails: (orderId: string) => void;
}

// Helper functions for design status display
const getDesignStatusColorClass = (
  statusId: number,
  isDarkMode: boolean
): string => {
  switch (statusId) {
    case 2: // Aprobado
      return isDarkMode
        ? "bg-green-900/30 text-green-400"
        : "bg-green-100 text-green-800";
    case 3: // Rechazado
      return isDarkMode
        ? "bg-red-900/30 text-red-400"
        : "bg-red-100 text-red-800";
    case 1: // Pendiente
    default:
      return isDarkMode
        ? "bg-yellow-900/30 text-yellow-400"
        : "bg-yellow-100 text-yellow-800";
  }
};

const getDesignStatusText = (statusId: number): string => {
  switch (statusId) {
    case 2:
      return "Aprobado";
    case 3:
      return "Rechazado";
    case 1:
    default:
      return "Pendiente";
  }
};

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  orderStates,
  expandedOrderId,
  isDarkMode,
  toggleOrderExpand,
  handleStatusChange,
  handleUpdateDesignStatus,
  handleViewDetails,
}) => {
  return (
    <div
      className={`rounded-lg overflow-hidden border ${
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      {/* Cabecera de la orden (siempre visible) */}
      <button
        className={`w-full text-left p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center ${
          isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
        }`}
        onClick={() => toggleOrderExpand(String(order.id))}
        aria-expanded={expandedOrderId === String(order.id)}
        aria-label={`Expandir detalles de orden #${order.id}`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            toggleOrderExpand(String(order.id));
            e.preventDefault();
          }
        }}
      >
        <div className="flex-grow">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-medium">Orden #{order.id}</h3>
            <OrderStatusBadge status={order.estado as unknown as OrderStatus} />
            {order.items.some((item) => item.disenoPersonalizadoId) && (
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  isDarkMode
                    ? "bg-purple-900/30 text-purple-200"
                    : "bg-purple-100 text-purple-800"
                }`}
              >
                Diseño personalizado
              </span>
            )}
          </div>

          <p
            className={`text-sm ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            <span className="font-medium">Cliente:</span>{" "}
            {order.infoEnvio?.nombreCompleto} (
            {order.infoEnvio?.email ?? "Email no disponible"})
          </p>
          <p
            className={`text-sm ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            <span className="font-medium">Fecha:</span>{" "}
            {order.creadaEn
              ? formatDate(
                  new Date(
                    order.creadaEn[0],
                    order.creadaEn[1] - 1,
                    order.creadaEn[2]
                  )
                )
              : "Fecha no disponible"}
          </p>
        </div>

        <div className="flex items-center mt-3 sm:mt-0">
          <span className="font-bold mr-2">${formatPrice(order.total)}</span>
          {expandedOrderId === String(order.id) ? (
            <ChevronUp className="h-5 w-5" aria-hidden="true" />
          ) : (
            <ChevronDown className="h-5 w-5" aria-hidden="true" />
          )}
        </div>
      </button>

      {/* Detalles expandibles */}
      {expandedOrderId === String(order.id) && (
        <div
          className={`p-4 border-t ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          {/* Productos de la orden */}
          <h4 className="font-medium mb-2">Productos</h4>
          <div className="space-y-2 mb-4">
            {order.items.map((item, idx) => (
              <div
                key={`${order.id}-item-${idx}`}
                className={`p-2 rounded ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-50"
                }`}
              >
                <div className="flex justify-between">
                  <div>
                    {item.disenoPersonalizadoId ? (
                      // Item personalizado
                      <>
                        <p className="font-medium">
                          Diseño personalizado:{" "}
                          {item.nombre || `Diseño #${idx + 1}`}
                        </p>
                        <div
                          className={`text-sm ${
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          <p>
                            Cantidad: {item.cantidad} × $
                            {formatPrice(item.precioUnitario)}
                          </p>
                          <p>Color: {item.colorNombre || "No especificado"}</p>
                          <p>Talla: {item.tallaNombre || "No especificada"}</p>
                          {item.disenoPersonalizado?.estadoId && (
                            <p className="mt-1">
                              Estado del diseño:{" "}
                              <span
                                className={`px-1.5 py-0.5 rounded text-xs ml-1 ${getDesignStatusColorClass(
                                  item.disenoPersonalizado.estadoId,
                                  isDarkMode
                                )}`}
                              >
                                {getDesignStatusText(
                                  item.disenoPersonalizado.estadoId
                                )}
                              </span>
                            </p>
                          )}
                          {item.disenoPersonalizado?.detalle && (
                            <p className="text-xs mt-1">
                              Detalles: {item.disenoPersonalizado.detalle}
                            </p>
                          )}
                        </div>
                      </>
                    ) : (
                      // Item estándar
                      <>
                        <p className="font-medium">
                          Nombre: {item.producto!.nombre}
                        </p>
                        <p
                          className={`text-sm ${
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Cantidad: {item.cantidad} × $
                          {formatPrice(item.precioUnitario)}
                        </p>
                        <div
                          className={`text-sm ${
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          <p>Descripcion: {item.producto!.descripcion}</p>
                          <p>Categoria: {item.producto!.categoriaNombre}</p>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <p className="font-medium">${formatPrice(item.subtotal)}</p>
                    {item.disenoPersonalizadoId &&
                      item.disenoPersonalizado!.estadoId === 1 && (
                        <div className="flex items-center gap-2">
                          <button
                            className={`flex items-center px-2 py-1 rounded ${
                              isDarkMode
                                ? "bg-green-900/30 text-green-400 hover:bg-green-900/50"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
                            }`}
                            onClick={() =>
                              handleUpdateDesignStatus(
                                item.disenoPersonalizadoId!,
                                2
                              )
                            }
                          >
                            <Check
                              className="h-4 w-4 mr-1"
                              aria-hidden="true"
                            />
                            <span className="text-sm">Aprobar diseño</span>
                          </button>
                          <button
                            className={`flex items-center px-2 py-1 rounded ${
                              isDarkMode
                                ? "bg-red-900/30 text-red-400 hover:bg-red-900/50"
                                : "bg-red-100 text-red-700 hover:bg-red-200"
                            }`}
                            onClick={() =>
                              handleUpdateDesignStatus(
                                item.disenoPersonalizadoId!,
                                3
                              )
                            }
                          >
                            <X className="h-4 w-4 mr-1" aria-hidden="true" />
                            <span className="text-sm">Rechazar diseño</span>
                          </button>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Acciones para la orden */}
          <div className="flex flex-wrap gap-2">
            {/* Botones de acción para cambiar estado */}
            <div className="flex flex-col sm:flex-row gap-2">
              <label
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
                htmlFor={`order-status-${order.id}`}
              >
                Cambiar estado a:
              </label>
              <select
                className={`p-1 text-sm rounded border ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600"
                    : "bg-white border-gray-300"
                }`}
                id={`order-status-${order.id}`}
                value={order.estado}
                onChange={(e) =>
                  handleStatusChange(
                    String(order.id),
                    e.target.value as OrderStatus
                  )
                }
              >
                {orderStates
                  .filter((state) => state.id !== 7)
                  .map((state) => (
                    <option key={state.nombre} value={state.nombre}>
                      {state.nombre}
                    </option>
                  ))}
              </select>
            </div>

            {/* Ver detalles completos */}
            <button
              className={`ml-auto flex items-center px-2 py-1 rounded ${
                isDarkMode
                  ? "bg-blue-900/30 text-blue-400 hover:bg-blue-900/50"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              }`}
              onClick={() => handleViewDetails(String(order.id))}
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
