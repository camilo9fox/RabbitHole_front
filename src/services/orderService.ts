"use client";

import { v4 as uuidv4 } from 'uuid';
import { Order, OrderItem, OrderStatus, StatusHistoryEntry, ShippingInfo, PaymentInfo } from '@/types/order';
import { Cart, CustomDesignStatus, isCustomItem } from '@/types/cart';
import { Session } from 'next-auth';

// Clave para almacenar los pedidos en localStorage
const ORDERS_STORAGE_KEY = 'rabbit-hole-orders';

// Verificar si localStorage está disponible
const isLocalStorageAvailable = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    return true;
  } catch {
    // Error de acceso a localStorage
    return false;
  }
};

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
        statusHistory: (order.statusHistory ?? []).map((entry) => {
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
    console.error('Error al recuperar órdenes de localStorage:', error);
    return [];
  }
};

// Obtener pedidos de un usuario específico
export const getUserOrders = (userId?: string, userEmail?: string): Order[] => {
  const allOrders = getAllOrders();
  
  return allOrders.filter(order => 
    (userId && order.userId === userId) || (userEmail && order.userEmail === userEmail)
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
  // Por ahora, simplemente verificamos que coincida con el id por simplicidad
  const order = getOrderById(orderId);
  
  if (order && order.trackingToken === token) {
    return order;
  }
  
  return null;
};

// Guardar un pedido
export const saveOrder = (
  cart: Cart, 
  shippingInfo: ShippingInfo, 
  paymentInfo: PaymentInfo, 
  session?: Session | null
): Order => {
  if (!isLocalStorageAvailable()) {
    throw new Error('No se puede guardar el pedido: localStorage no está disponible');
  }
  
  try {
    const allOrders = getAllOrders();
    
    // Crear un nuevo pedido
    const newOrder: Order = {
      id: uuidv4(),
      userId: session?.user?.id ?? "",
      userEmail: session?.user?.email ?? shippingInfo.email,
      // Transformar CartItem a OrderItem con las propiedades requeridas
      items: cart.items.map(item => {
        // Crear un objeto que cumpla con la interfaz OrderItem
        const orderItem: OrderItem = {
          id: item.id,
          type: item.type,
          productId: 'productId' in item ? item.productId : undefined,
          designId: 'designId' in item ? item.designId : undefined,
          quantity: item.quantity,
          unitPrice: item.unitPrice ?? (item.price ?? 0),
          price: item.price ?? item.unitPrice ?? 0,
          totalPrice: (item.unitPrice ?? item.price ?? 0) * (item.quantity ?? 1),
          product: 'product' in item ? item.product : undefined,
          design: 'design' in item ? item.design : undefined,
          snapshot: {
            name: isCustomItem(item) 
              ? (item.design?.name ?? 'Diseño personalizado') 
              : (item.product?.name ?? 'Producto'),
            color: isCustomItem(item) 
              ? (item.design?.color ?? 'blanco') 
              : (item.color ?? 'blanco'),
            size: isCustomItem(item) 
              ? (item.design?.size ?? 'M') 
              : (item.size ?? 'M'),
            imageUrl: isCustomItem(item) 
              ? (item.design?.front?.previewImage ?? '') 
              : (item.product?.images?.[0] ?? '')
          }
        };
        return orderItem;
      }),
      subtotal: cart.totalPrice, // Usamos totalPrice como subtotal ya que no tenemos subtotal en Cart
      shipping: 0, // Valor predeterminado para envío
      discount: 0, // Valor predeterminado para descuento
      total: cart.totalPrice, // El total es igual al precio total del carrito
      shippingInfo,
      paymentInfo,
      status: OrderStatus.PENDING,
      statusHistory: [
        {
          status: OrderStatus.PENDING,
          date: new Date(),
          note: 'Pedido recibido'
        }
      ],
      trackingToken: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Verificar si la orden tiene datos válidos
    if (!newOrder.items || newOrder.items.length === 0) {
      throw new Error('No se puede crear un pedido sin productos');
    }
    
    if (!newOrder.shippingInfo || !newOrder.paymentInfo) {
      throw new Error('Información de envío o pago incompleta');
    }
    
    // Agregar el nuevo pedido a la lista
    allOrders.push(newOrder);
    
    // Guardar en localStorage
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(allOrders));
    
    console.log('Pedido guardado:', newOrder);
    return newOrder;
  } catch (error) {
    console.error('Error al guardar el pedido:', error);
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
    note: note === '' ? undefined : note
  };
  
  updatedOrder.statusHistory = [
    ...updatedOrder.statusHistory,
    historyEntry
  ];
  
  // Actualizar en el array de órdenes
  allOrders[orderIndex] = updatedOrder;
  
  // Guardar en localStorage
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(allOrders));
  
  return updatedOrder;
};

// Eliminar un pedido (solo para pruebas)
export const deleteOrder = (orderId: string): boolean => {
  const allOrders = getAllOrders();
  const filteredOrders = allOrders.filter(order => order.id !== orderId);
  
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(filteredOrders));
  
  return true;
};

// Limpiar todos los pedidos (solo para pruebas)
export const clearAllOrders = (): void => {
  localStorage.removeItem(ORDERS_STORAGE_KEY);
};

// Aprobar un diseño personalizado en una orden
export const approveCustomDesign = (
  orderId: string,
  designId: string
): Order => {
  const allOrders = getAllOrders();
  const orderIndex = allOrders.findIndex(order => order.id === orderId);
  
  if (orderIndex === -1) {
    throw new Error(`No se encontró la orden con ID ${orderId}`);
  }
  
  // Crear una copia de la orden para modificarla
  const updatedOrder = { ...allOrders[orderIndex] };
  
  // Buscar y actualizar el item con el diseño personalizado
  const updatedItems = updatedOrder.items.map(item => {
    if (isCustomItem(item) && item.design?.id === designId) {
      // Obtenemos los datos completos del diseño y lo actualizamos
      const updatedDesign = {
        ...item.design,
        status: CustomDesignStatus.APPROVED,
        updatedAt: new Date()
      };

      // Creamos una copia tipada para OrderItem con solo las propiedades permitidas en design
      const updatedItem: OrderItem = {
        ...item,
        design: {
          id: updatedDesign.id!, // Forzamos el tipo porque sabemos que existe (verificado en la condición if)
          name: updatedDesign.name,
          color: updatedDesign.color,
          size: updatedDesign.size,
          front: updatedDesign.front
        }
      };
      return updatedItem;
    }
    return item;
  });
  
  // Actualizar los items en la orden
  updatedOrder.items = updatedItems;
  updatedOrder.updatedAt = new Date();
  
  // Añadir entrada al historial
  const historyEntry: StatusHistoryEntry = {
    status: updatedOrder.status,
    date: new Date(),
    note: 'Diseño personalizado aprobado'
  };
  
  updatedOrder.statusHistory = [
    ...updatedOrder.statusHistory,
    historyEntry
  ];
  
  // Actualizar en el array de órdenes
  allOrders[orderIndex] = updatedOrder;
  
  // Guardar en localStorage
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(allOrders));
  
  return updatedOrder;
};

// Rechazar un diseño personalizado en una orden
export const rejectCustomDesign = (
  orderId: string,
  designId: string,
  rejectionReason: string
): Order => {
  const allOrders = getAllOrders();
  const orderIndex = allOrders.findIndex(order => order.id === orderId);
  
  if (orderIndex === -1) {
    throw new Error(`No se encontró la orden con ID ${orderId}`);
  }
  
  // Crear una copia de la orden para modificarla
  const updatedOrder = { ...allOrders[orderIndex] };
  
  // Buscar y actualizar el item con el diseño personalizado
  const updatedItems = updatedOrder.items.map(item => {
    if (isCustomItem(item) && item.design?.id === designId) {
      // Obtenemos los datos completos del diseño y lo actualizamos
      const updatedDesign = {
        ...item.design,
        status: CustomDesignStatus.REJECTED,
        rejectionReason: rejectionReason ?? 'Diseño rechazado por el administrador',
        updatedAt: new Date()
      };

      // Creamos una copia tipada para OrderItem con solo las propiedades permitidas en design
      const updatedItem: OrderItem = {
        ...item,
        design: {
          id: updatedDesign.id!, // Forzamos el tipo porque sabemos que existe (verificado en la condición if)
          name: updatedDesign.name,
          color: updatedDesign.color,
          size: updatedDesign.size,
          front: updatedDesign.front
        }
      };
      return updatedItem;
    }
    return item;
  });
  
  // Actualizar los items en la orden
  updatedOrder.items = updatedItems;
  updatedOrder.updatedAt = new Date();
  
  // Añadir entrada al historial
  const historyEntry: StatusHistoryEntry = {
    status: updatedOrder.status,
    date: new Date(),
    note: `Diseño personalizado rechazado: ${rejectionReason ?? 'Sin razón especificada'}`
  };
  
  updatedOrder.statusHistory = [
    ...updatedOrder.statusHistory,
    historyEntry
  ];
  
  // Actualizar en el array de órdenes
  allOrders[orderIndex] = updatedOrder;
  
  // Guardar en localStorage
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(allOrders));
  
  return updatedOrder;
};
