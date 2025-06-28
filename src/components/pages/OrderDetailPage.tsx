"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { ArrowLeft, Printer, Share2 } from "lucide-react";

import { Order, OrderStatus } from "@/types/order";
import { getOrderById } from "@/services/orderService";
import { formatPrice } from "@/utils/formatters";
import {
  convertDTOToCustomDesign,
  convertProductoToStandardProduct,
} from "@/utils/typeConverters";
import OrderStatusBadge from "@/components/commons/atoms/OrderStatusBadge";
import OrderItemDetail from "@/components/commons/molecules/OrderItemDetail";
import { CartItem, CartItemType } from "@/types/cart";

// Componentes auxiliares para reducir la complejidad cognitiva
const LoadingState: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => (
  <div className="container mx-auto px-4 pt-20 pb-8 flex justify-center items-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      <p className={`mt-4 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
        Cargando detalles del pedido...
      </p>
    </div>
  </div>
);

const ErrorState: React.FC<{
  error: string;
  isDarkMode: boolean;
  onGoBack: () => void;
}> = ({ error, isDarkMode, onGoBack }) => (
  <div className="container mx-auto px-4 pt-20 pb-8 min-h-screen">
    <div
      className={`p-6 rounded-lg ${
        isDarkMode ? "bg-gray-800 text-white" : "bg-red-50 text-red-700"
      }`}
    >
      <h2 className="text-xl font-semibold mb-2">Error</h2>
      <p>{error}</p>
      <button
        onClick={onGoBack}
        className={`mt-4 flex items-center px-4 py-2 rounded-md ${
          isDarkMode
            ? "bg-gray-700 hover:bg-gray-600"
            : "bg-gray-200 hover:bg-gray-300"
        }`}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver a mis pedidos
      </button>
    </div>
  </div>
);

const OrderDetailPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();

  // Intentar obtener el ID del pedido de los parámetros de ruta primero, luego de los query params
  const routeId = params?.id as string;
  const queryId = searchParams.get("id");
  const orderId = routeId || queryId;

  console.log("Route ID:", routeId);
  console.log("Query ID:", queryId);
  console.log("Using Order ID:", orderId);

  const { data: session, status } = useSession();
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos del pedido
  useEffect(() => {
    // // Verificar autenticación
    // if (status === 'unauthenticated') {
    //   router.replace('/login');
    //   return;
    // }

    // // Si no hay ID de pedido, redirigir a la página de pedidos
    // if (!orderId) {
    //   router.replace('/my-orders');
    //   return;
    // }
    console.log({ searchParams });
    const loadOrderData = async () => {
      try {
        if (!orderId) {
          setError("ID de pedido no encontrado");
          setLoading(false);
          return;
        }

        const orderData = await getOrderById(parseInt(orderId));
        console.log("Datos de la orden cargados:", orderData);

        if (orderData) {
          setOrder(orderData);
        } else {
          setError("No se encontró el pedido o no tienes permiso para verlo");
        }
      } catch (err) {
        setError("Error al cargar el pedido");
        console.error("Error al cargar el pedido:", err);
      } finally {
        setLoading(false);
      }
    };

    loadOrderData();
  }, [orderId, session, status, router]);

  // Handlers para acciones de usuario
  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Pedido #${order?.id}`,
          text: `Detalles de mi pedido #${order?.id} en RabbitHole`,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Error al compartir:", err);
      }
    } else {
      // Fallback para navegadores que no soportan Web Share API
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert("Enlace copiado al portapapeles");
      } catch (err) {
        console.error("Error al copiar al portapapeles:", err);
      }
    }
  };

  const handleGoBack = () => {
    router.push("/my-orders");
  };

  // Función para mapear el estado de la orden como string al enum OrderStatus
  const mapOrderStatus = (status: string): OrderStatus => {
    switch (status?.toUpperCase()) {
      case "PENDIENTE":
        return OrderStatus.PENDING;
      case "PROCESANDO":
        return OrderStatus.PROCESSING;
      case "ENVIADO":
        return OrderStatus.SHIPPED;
      case "ENTREGADO":
        return OrderStatus.DELIVERED;
      case "CANCELADO":
        return OrderStatus.CANCELLED;
      default:
        return OrderStatus.PENDING;
    }
  };

  // Mostrar estado de carga
  if (loading) {
    return <LoadingState isDarkMode={isDarkMode} />;
  }

  // Mostrar error si existe
  if (error) {
    return (
      <ErrorState
        error={error}
        isDarkMode={isDarkMode}
        onGoBack={handleGoBack}
      />
    );
  }

  // Si no hay orden, mostrar mensaje
  if (!order) {
    return (
      <ErrorState
        error="No se encontró información del pedido"
        isDarkMode={isDarkMode}
        onGoBack={handleGoBack}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 pt-20 pb-8">
      {/* Barra superior con acciones */}
      <div
        className={`flex justify-between items-center mb-6 print:hidden ${
          isDarkMode ? "text-white" : "text-gray-800"
        }`}
      >
        <button
          onClick={handleGoBack}
          className={`flex items-center px-4 py-2 rounded-md ${
            isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
          }`}
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Volver a mis pedidos
        </button>

        <div className="flex space-x-2">
          <button
            onClick={handlePrint}
            className={`flex items-center px-4 py-2 rounded-md ${
              isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
            }`}
            aria-label="Imprimir pedido"
          >
            <Printer className="mr-2 h-5 w-5" />
            Imprimir
          </button>

          <button
            onClick={handleShare}
            className={`flex items-center px-4 py-2 rounded-md ${
              isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
            }`}
            aria-label="Compartir pedido"
          >
            <Share2 className="mr-2 h-5 w-5" />
            Compartir
          </button>
        </div>
      </div>

      {/* Encabezado del pedido */}
      <div
        className={`mb-8 ${
          isDarkMode ? "text-white" : "text-gray-800"
        } bg-gray-100 p-4`}
      >
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">Pedido #{order.id}</h1>
            <p className="text-sm opacity-75">
              Realizado el{" "}
              {order.creadaEn
                .toString()
                .substring(0, 9)
                .replace(",", "-")
                .replace(",", "-")
                .split("-")
                .reverse()
                .join("/")}
            </p>
          </div>

          <OrderStatusBadge status={mapOrderStatus(order.estado)} />
        </div>
      </div>

      {/* Contenido principal */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Columna izquierda y central: Detalles de los productos */}
        <div className="md:col-span-2">
          <div
            className={`p-6 rounded-lg ${
              isDarkMode ? "bg-gray-800" : "bg-white shadow"
            }`}
          >
            <h2 className="text-xl font-semibold mb-4">Productos</h2>

            {/* Lista de productos */}
            <div className="space-y-4">
              {order.items?.map((item, index) => {
                // Determinar el tipo de item y convertir según corresponda
                let cartItem: CartItem;

                // Determinar el tipo de item y convertir según corresponda
                if (item.productoId !== null) {
                  // Convertir producto estándar
                  const standardProduct = convertProductoToStandardProduct({
                    ...item.producto!,
                    thumbnails: item.thumbnails,
                  });
                  cartItem = {
                    id: item.id.toString(),
                    type: CartItemType.PRODUCT,
                    productId: item.productoId?.toString() ?? "",
                    color: item.colorNombre ?? "",
                    size: item.tallaNombre ?? "",
                    quantity: item.cantidad,
                    unitPrice: item.precioUnitario,
                    price: item.precioUnitario,
                    product: standardProduct,
                  };
                } else if (item.disenoPersonalizadoId !== null) {
                  // Convertir diseño personalizado
                  const customDesign = convertDTOToCustomDesign(
                    item.disenoPersonalizado!
                  );
                  cartItem = {
                    id: item.id.toString(),
                    type: CartItemType.CUSTOM,
                    designId: item.disenoPersonalizadoId?.toString() ?? "",
                    quantity: item.cantidad,
                    unitPrice: item.precioUnitario,
                    price: item.precioUnitario,
                    design: customDesign,
                  };
                } else {
                  // Fallback para casos no manejados
                  cartItem = {
                    id: item.id.toString(),
                    type: CartItemType.PRODUCT,
                    productId: "",
                    color: item.colorNombre ?? "",
                    size: item.tallaNombre ?? "",
                    quantity: item.cantidad,
                    unitPrice: item.precioUnitario,
                    price: item.precioUnitario,
                  };
                }

                return (
                  <OrderItemDetail
                    key={`order-item-${order.id}-${index}`}
                    item={cartItem}
                    orderItem={item}
                  />
                );
              })}
            </div>

            {/* Resumen de costos */}
            <div
              className={`mt-6 pt-4 border-t ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              {/* Simplificado para mostrar solo el total ya que el backend solo proporciona el total */}
              <div className="flex justify-between font-bold text-lg mt-2">
                <span>Total</span>
                <span>${formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha: Información de envío y pago */}
        <div className="md:col-span-1">
          {/* Información de envío */}
          <div
            className={`p-6 rounded-lg mb-6 ${
              isDarkMode ? "bg-gray-800" : "bg-white shadow"
            }`}
          >
            <h2 className="text-xl font-semibold mb-4">Información de envío</h2>

            <div className="space-y-2">
              <p>
                <span className="font-medium">Nombre:</span>{" "}
                {order.infoEnvio?.nombreCompleto || order.direccionEntrega}
              </p>
              <p>
                <span className="font-medium">Dirección:</span>{" "}
                {order.infoEnvio?.direccion || order.direccionEntrega}
              </p>
              <p>
                <span className="font-medium">Ciudad:</span>{" "}
                {order.infoEnvio?.ciudad || "-"}
              </p>
              <p>
                <span className="font-medium">Región:</span>{" "}
                {order.infoEnvio?.estado || "-"}
              </p>
              <p>
                <span className="font-medium">Código postal:</span>{" "}
                {order.infoEnvio?.codigoPostal || "-"}
              </p>
              <p>
                <span className="font-medium">País:</span>{" "}
                {order.infoEnvio?.pais || "-"}
              </p>
              <p>
                <span className="font-medium">Teléfono:</span>{" "}
                {order.infoEnvio?.telefono || "-"}
              </p>
              <p>
                <span className="font-medium">Email:</span>{" "}
                {order.infoEnvio?.email || "-"}
              </p>
            </div>
          </div>

          {/* Información de pago */}
          <div
            className={`p-6 rounded-lg ${
              isDarkMode ? "bg-gray-800" : "bg-white shadow"
            }`}
          >
            <h2 className="text-xl font-semibold mb-4">Información de pago</h2>

            <div className="space-y-2">
              <p>
                <span className="font-medium">Método:</span>{" "}
                {order.metodoPago ||
                  `Método de pago ID: ${order.infoPago?.metodoPagoId || "-"}`}
              </p>

              {order.infoPago?.ultimosDigitos && (
                <p>
                  <span className="font-medium">Tarjeta:</span> **** **** ****{" "}
                  {order.infoPago.ultimosDigitos}
                </p>
              )}

              {order.infoPago?.titularTarjeta && (
                <p>
                  <span className="font-medium">Titular:</span>{" "}
                  {order.infoPago.titularTarjeta}
                </p>
              )}

              <p>
                <span className="font-medium">ID Transacción:</span>{" "}
                {order.infoPago?.idTransaccion || "-"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
