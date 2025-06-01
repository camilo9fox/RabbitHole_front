// Tipos para el sistema de carrito de compras

// Estado de aprobación para diseños personalizados
export enum CustomDesignStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  MODIFICATION_REQUESTED = 'modification_requested'
}

// Información de una vista personalizada (frente, espalda, etc.)
export interface CustomView {
  text: string;
  image: string | null; // Base64 de la imagen
  textFont: string;
  textColor: string;
  textSize: number;
  textPositionX: number;
  textPositionY: number;
  imagePositionX: number;
  imagePositionY: number;
  imageWidth: number;
  imageHeight: number;
  previewImage?: string; // Base64 de la imagen del canvas
}

// Diseño personalizado completo
export interface CustomDesign {
  id?: string;
  front: CustomView;
  back: CustomView;
  left: CustomView;
  right: CustomView;
  color: string;
  size: string;
  status: CustomDesignStatus;
  rejectionReason?: string;
  modificationNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Producto estándar del catálogo
export interface StandardProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  color: string;
  size: string;
  category: string;
  inStock: boolean;
}

// Tipos de items en el carrito
export enum CartItemType {
  STANDARD = 'standard',
  CUSTOM = 'custom'
}

// Item en el carrito (producto estándar)
export interface StandardCartItem {
  type: CartItemType.STANDARD;
  product: StandardProduct;
  quantity: number;
  price: number;
}

// Item en el carrito (diseño personalizado)
export interface CustomCartItem {
  type: CartItemType.CUSTOM;
  design: CustomDesign;
  quantity: number;
  price: number;
}

// Tipo unión para cualquier item del carrito
export type CartItem = StandardCartItem | CustomCartItem;

// Carrito completo
export interface Cart {
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
}

// Funciones de tipo guard para verificar el tipo de item
export const isStandardItem = (item: CartItem): item is StandardCartItem => {
  return item.type === CartItemType.STANDARD;
};

export const isCustomItem = (item: CartItem): item is CustomCartItem => {
  return item.type === CartItemType.CUSTOM;
};
