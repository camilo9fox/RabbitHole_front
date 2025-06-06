"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { ArrowLeft, Printer, Share2 } from 'lucide-react';

import { Order } from '@/types/order';
import { getOrderById } from '@/services/orderService';
import { formatDate, formatPrice } from '@/utils/formatters';
import OrderStatusBadge from '@/components/commons/atoms/OrderStatusBadge';
import OrderItemDetail from '@/components/commons/molecules/OrderItemDetail';
import { CartItemType } from '@/types/cart';



// Componentes auxiliares para reducir la complejidad cognitiva
const LoadingState: React.FC<{isDarkMode: boolean}> = ({ isDarkMode }) => (
  <div className="container mx-auto px-4 pt-20 pb-8 flex justify-center items-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      <p className={`mt-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Cargando detalles del pedido...</p>
    </div>
  </div>
);

const ErrorState: React.FC<{error: string; isDarkMode: boolean; onGoBack: () => void}> = ({ error, isDarkMode, onGoBack }) => (
  <div className="container mx-auto px-4 pt-20 pb-8 min-h-screen">
    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-red-50 text-red-700'}`}>
      <h2 className="text-xl font-semibold mb-2">Error</h2>
      <p>{error}</p>
      <button 
        onClick={onGoBack}
        className={`mt-4 flex items-center px-4 py-2 rounded-md ${
          isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
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
  const queryId = searchParams.get('id');
  const orderId = routeId || queryId;
  
  console.log('Route ID:', routeId);
  console.log('Query ID:', queryId);
  console.log('Using Order ID:', orderId);
  
  const { data: session, status } = useSession();
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  
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
    console.log({searchParams});
    const loadOrderData = async () => {
      try {
        if (!orderId) {
          setError('ID de pedido no encontrado');
          setLoading(false);
          return;
        }
        
        const orderData = getOrderById(orderId);
        console.log('Datos de la orden cargados:', orderData);
        
        if (orderData) {
          setOrder(orderData);
        } else {
          setError('No se encontró el pedido o no tienes permiso para verlo');
        }
      } catch (err) {
        setError('Error al cargar el pedido');
        console.error('Error al cargar el pedido:', err);
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
          text: `Detalles de mi pedido #${order?.id} en Rabbit Hole`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error al compartir:', err);
      }
    } else {
      // Copiar al portapapeles como alternativa
      navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles');
    }
  };
  
  const handleGoBack = () => {
    router.push('/my-orders');
  };
  
  // Renderizado condicional según el estado
  if (loading) {
    return <LoadingState isDarkMode={isDarkMode} />;
  }
  
  if (error) {
    return <ErrorState error={error} isDarkMode={isDarkMode} onGoBack={handleGoBack} />;
  }
  
  if (!order) {
    return <ErrorState error="No se pudo cargar el pedido" isDarkMode={isDarkMode} onGoBack={handleGoBack} />;
  }
  
  return (
    <div className="container mx-auto px-4 pt-20 pb-8">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <button 
            onClick={handleGoBack}
            className={`mr-4 p-2 rounded-full ${
              isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
            }`}
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Pedido #{order.id}</h1>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Realizado el {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={handlePrint}
            className={`p-2 rounded-md flex items-center ${
              isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
            }`}
            aria-label="Imprimir pedido"
          >
            <Printer className="h-5 w-5 mr-1" />
            <span className="hidden sm:inline">Imprimir</span>
          </button>
          
          <button 
            onClick={handleShare}
            className={`p-2 rounded-md flex items-center ${
              isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
            }`}
            aria-label="Compartir pedido"
          >
            <Share2 className="h-5 w-5 mr-1" />
            <span className="hidden sm:inline">Compartir</span>
          </button>
        </div>
      </div>
      
      {/* Estado del pedido */}
      <div className={`p-4 rounded-lg mb-6 ${
        isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
      }`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div className="mb-2 sm:mb-0">
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Estado actual
            </p>
            <div className="mt-1">
              <OrderStatusBadge status={order.status} />
            </div>
          </div>
          
          <div className="text-right">
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Total del pedido
            </p>
            <p className="text-xl font-bold">${formatPrice(order.total)}</p>
          </div>
        </div>
      </div>
      
      {/* Contenido principal en dos columnas en pantallas medianas y grandes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Columna izquierda: Productos */}
        <div className="md:col-span-2">
          <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow'}`}>
            <h2 className="text-xl font-semibold mb-4">Productos</h2>
            
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <OrderItemDetail 
                  key={`order-item-${order.id}-${index}`} 
                  item={item as unknown as CartItemType} 
                />
              ))}
            </div>
            
            {/* Resumen de costos */}
            <div className={`mt-6 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex justify-between mb-2">
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Subtotal</span>
                <span>${formatPrice(order.subtotal)}</span>
              </div>
              
              <div className="flex justify-between mb-2">
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Envío</span>
                <span>${formatPrice(order.shipping)}</span>
              </div>
              
              {order.discount > 0 && (
                <div className="flex justify-between mb-2">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Descuento</span>
                  <span className="text-green-500">-${formatPrice(order.discount)}</span>
                </div>
              )}
              
              <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-dashed">
                <span>Total</span>
                <span>${formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Columna derecha: Información de envío y pago */}
        <div className="md:col-span-1">
          {/* Información de envío */}
          <div className={`p-6 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow'}`}>
            <h2 className="text-xl font-semibold mb-4">Información de envío</h2>
            
            <div className="space-y-2">
              <p><span className="font-medium">Nombre:</span> {order.shippingInfo.fullName}</p>
              <p><span className="font-medium">Dirección:</span> {order.shippingInfo.address}</p>
              <p><span className="font-medium">Ciudad:</span> {order.shippingInfo.city}</p>
              <p><span className="font-medium">Región:</span> {order.shippingInfo.state}</p>
              <p><span className="font-medium">Código postal:</span> {order.shippingInfo.postalCode}</p>
              <p><span className="font-medium">País:</span> {order.shippingInfo.country}</p>
              <p><span className="font-medium">Teléfono:</span> {order.shippingInfo.phone}</p>
              <p><span className="font-medium">Email:</span> {order.shippingInfo.email}</p>
            </div>
          </div>
          
          {/* Información de pago */}
          <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow'}`}>
            <h2 className="text-xl font-semibold mb-4">Información de pago</h2>
            
            <div className="space-y-2">
              <p>
                <span className="font-medium">Método:</span> {' '}
                {order.paymentInfo.method === 'credit_card' && 'Tarjeta de crédito'}
                {order.paymentInfo.method === 'debit_card' && 'Tarjeta de débito'}
                {order.paymentInfo.method === 'paypal' && 'PayPal'}
                {order.paymentInfo.method === 'transfer' && 'Transferencia bancaria'}
              </p>
              
              {order.paymentInfo.cardNumber && (
                <p><span className="font-medium">Tarjeta:</span> **** **** **** {order.paymentInfo.cardNumber}</p>
              )}
              
              {order.paymentInfo.cardHolder && (
                <p><span className="font-medium">Titular:</span> {order.paymentInfo.cardHolder}</p>
              )}
              
              <p><span className="font-medium">ID Transacción:</span> {order.paymentInfo.transactionId}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
