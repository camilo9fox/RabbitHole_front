// Tipos para el sistema de pedidos

import { CartItem } from './cart';

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

// Pedido completo
export interface Order {
  id: string;
  userId?: string; // Opcional, si el usuario no está autenticado
  userEmail?: string; // Email del usuario, autenticado o no
  items: CartItem[];
  shippingInfo: ShippingInfo;
  paymentInfo: PaymentInfo;
  status: OrderStatus;
  statusHistory: StatusHistoryEntry[];
  subtotal: number; // Subtotal antes de impuestos y envío
  shipping: number; // Costo de envío
  discount: number; // Descuento aplicado
  total: number; // Total final
  createdAt: Date;
  updatedAt: Date;
}
