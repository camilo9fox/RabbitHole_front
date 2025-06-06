"use client";

import { v4 as uuidv4 } from 'uuid';
import { Order, OrderStatus, StatusHistoryEntry, ShippingInfo, PaymentInfo } from '@/types/order';
import { Cart } from '@/types/cart';
import { Session } from 'next-auth';

// Clave para almacenar los pedidos en localStorage
const ORDERS_STORAGE_KEY = 'rabbit-hole-orders';

// Obtener todos los pedidos
export const getAllOrders = (): Order[] => {
  if (!isLocalStorageAvailable()) {
    console.error('No se pueden obtener las órdenes: localStorage no está disponible');
    return [];
  }
  
  try {
    const ordersJson = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!ordersJson) {
      return [];
    }
    
    // Parsear las órdenes
    const parsedOrders = JSON.parse(ordersJson) as Partial<Order>[];
    
    // Convertir las fechas de string a Date
    const orders = parsedOrders.map((order) => {
      // Asegurarse de que las fechas sean strings antes de convertirlas
      const createdAtString = typeof order.createdAt === 'string' ? order.createdAt : new Date().toISOString();
      const updatedAtString = typeof order.updatedAt === 'string' ? order.updatedAt : new Date().toISOString();
      
      return {
        ...order,
        createdAt: new Date(createdAtString),
        updatedAt: new Date(updatedAtString),
        statusHistory: (order.statusHistory || []).map((entry) => {
          const dateString = typeof entry.date === 'string' ? entry.date : new Date().toISOString();
          return {
            ...entry,
            date: new Date(dateString)
          };
        })
      };
    }) as Order[];
    
    console.log('Órdenes recuperadas y procesadas de localStorage:', orders);
    return orders;
  } catch (error) {
    console.error('Error al obtener las órdenes:', error);
    return [];
  }
};

// Obtener pedidos de un usuario específico
export const getUserOrders = (userId?: string, userEmail?: string): Order[] => {
  const allOrders = getAllOrders();
  
  if (!userId && !userEmail) return [];
  
  return allOrders.filter(order => 
    (userId && order.userId === userId) || 
    (userEmail && order.userEmail === userEmail)
  );
};

// Obtener un pedido por su ID
export const getOrderById = (orderId: string): Order | null => {
  const allOrders = getAllOrders();
  return allOrders.find(order => order.id === orderId) || null;
};

// Obtener un pedido por su ID y token (para usuarios no autenticados)
export const getOrderByIdAndToken = (orderId: string, token: string): Order | null => {
  // En una implementación real, verificaríamos el token contra alguna base de datos
  // Por ahora, simplemente devolvemos el pedido si existe
  const order = getOrderById(orderId);
  
  // Verificación básica: si el pedido existe y tiene un token generado en su transactionId
  // que coincide con el token proporcionado
  if (order?.paymentInfo?.transactionId?.includes(token)) {
    return order;
  }
  
  // Si el token no coincide o no hay pedido, devolver null
  console.log(`Verificación de token fallida para pedido ${orderId}`);
  return null;
};

// Verificar si localStorage está disponible
const isLocalStorageAvailable = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const testKey = '__test_key__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    console.error('localStorage no está disponible:', e);
    return false;
  }
};

// Guardar un pedido
export const saveOrder = (
  cart: Cart, 
  shippingInfo: ShippingInfo, 
  paymentInfo: PaymentInfo, 
  session?: Session | null
): Order => {
  // Verificar si estamos en el cliente y si localStorage está disponible
  if (!isLocalStorageAvailable()) {
    console.error('No se puede guardar la orden: localStorage no está disponible');
    throw new Error('No se puede guardar la orden: localStorage no está disponible');
  }
  
  try {
    const allOrders = getAllOrders();
    
    // Calcular subtotal (mismo que cart.totalPrice por ahora)
    const subtotal = cart.totalPrice;
    // Por ahora, envío gratis y sin descuentos
    const shipping = 0;
    const discount = 0;
    const total = subtotal + shipping - discount;
    
    const newOrder: Order = {
      id: uuidv4(),
      userId: session?.user?.id,
      userEmail: session?.user?.email ?? shippingInfo.email,
      items: [...cart.items],
      shippingInfo,
      paymentInfo,
      status: OrderStatus.PENDING,
      statusHistory: [
        {
          status: OrderStatus.PENDING,
          date: new Date(),
          note: 'Pedido creado'
        }
      ],
      subtotal,
      shipping,
      discount,
      total,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Verificar si la orden tiene datos válidos
    if (!newOrder.items || newOrder.items.length === 0) {
      console.error('No se puede guardar una orden sin items');
      throw new Error('No se puede guardar una orden sin items');
    }
    
    // Agregar la nueva orden a la lista
    allOrders.push(newOrder);
    
    // Convertir a JSON y guardar
    const ordersJson = JSON.stringify(allOrders);
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, ordersJson);
      
      // Verificar que se guardó correctamente
      const savedJson = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (!savedJson) {
        throw new Error('No se pudo verificar que la orden se guardó correctamente');
      }
      
      console.log('Orden guardada exitosamente con ID:', newOrder.id);
      return newOrder;
    } catch (storageError) {
      console.error('Error al escribir en localStorage:', storageError);
      // Intentar con un enfoque alternativo - puede ser un problema de cuota
      try {
        // Limpiar localStorage y volver a intentar solo con esta orden
        localStorage.clear();
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify([newOrder]));
        console.log('Orden guardada después de limpiar localStorage');
        return newOrder;
      } catch (finalError) {
        console.error('Error fatal al guardar la orden:', finalError);
        throw new Error('No se pudo guardar la orden después de múltiples intentos');
      }
    }
  } catch (error) {
    console.error('Error al guardar la orden:', error);
    throw error;
  }
};

// Actualizar el estado de un pedido
export const updateOrderStatus = (
  orderId: string, 
  status: OrderStatus, 
  note: string = ''
): Order | null => {
  const allOrders = getAllOrders();
  const orderIndex = allOrders.findIndex(order => order.id === orderId);
  
  if (orderIndex === -1) return null;
  
  const updatedOrder = { ...allOrders[orderIndex] };
  
  // Actualizar el estado
  updatedOrder.status = status;
  updatedOrder.updatedAt = new Date();
  
  // Añadir entrada al historial
  const historyEntry: StatusHistoryEntry = {
    status,
    date: new Date(),
    note: note || undefined
  };
  
  updatedOrder.statusHistory = [
    ...updatedOrder.statusHistory,
    historyEntry
  ];
  
  // Actualizar en el array
  allOrders[orderIndex] = updatedOrder;
  
  // Guardar en localStorage
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(allOrders));
  
  return updatedOrder;
};

// Eliminar un pedido (solo para pruebas)
export const deleteOrder = (orderId: string): boolean => {
  const allOrders = getAllOrders();
  const filteredOrders = allOrders.filter(order => order.id !== orderId);
  
  if (filteredOrders.length === allOrders.length) {
    return false; // No se encontró el pedido
  }
  
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(filteredOrders));
  return true;
};

// Limpiar todos los pedidos (solo para pruebas)
export const clearAllOrders = (): void => {
  localStorage.removeItem(ORDERS_STORAGE_KEY);
};
