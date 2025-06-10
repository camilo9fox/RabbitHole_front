// Tipos para el sistema de pedidos

import { CartItemType } from './cart';

// Estado del pedido
export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

// Información de envío
export interface ShippingInfo {
  fullName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
}

// Información de pago
export interface PaymentInfo {
  method: 'credit_card' | 'debit_card' | 'paypal' | 'transfer';
  cardNumber?: string; // Solo los últimos 4 dígitos para referencia
  cardHolder?: string;
  transactionId?: string;
}

// Entrada en el historial de estados
export interface StatusHistoryEntry {
  status: OrderStatus;
  date: Date;
  note?: string;
}

// Item en una orden con snapshot de datos
export interface OrderItem {
  id: string;
  type: CartItemType;
  productId?: string;     // ID del producto (si es tipo PRODUCT)
  designId?: string;      // ID del diseño personalizado (si es tipo CUSTOM)
  
  // Snapshot de datos al momento de la compra para referencia histórica
  snapshot: {
    name: string;
    color: string;
    size: string;
    imageUrl: string;     // URL de la imagen representativa
  };
  
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  price: number;          // Para compatibilidad con código existente
  product?: { id: string; name: string; color?: string; size?: string; images?: string[]; price?: number; };  // Versión simplificada para compatibilidad
  design?: { id: string; name?: string; color?: string; size?: string; front?: unknown; }; // Versión simplificada para compatibilidad
}

// Pedido completo
export interface Order {
  id: string;
  userId?: string;        // Opcional, si el usuario no está autenticado
  userEmail: string;      // Email del usuario, autenticado o no
  items: OrderItem[];
  shippingInfo: ShippingInfo;
  paymentInfo: PaymentInfo;
  status: OrderStatus;
  statusHistory: StatusHistoryEntry[];
  subtotal: number;       // Subtotal antes de impuestos y envío
  shipping: number;       // Costo de envío
  discount: number;       // Descuento aplicado
  total: number;          // Total final
  createdAt: Date;
  updatedAt: Date;
  trackingToken: string;  // Token único para seguimiento de pedidos no autenticados
}
