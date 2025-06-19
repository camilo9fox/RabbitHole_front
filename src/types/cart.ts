// Tipos para el sistema de carrito de compras

// Estado de aprobación para diseños personalizados
export enum CustomDesignStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  MODIFICATION_REQUESTED = "modification_requested",
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
  id: string;
  userId?: string; // Usuario que lo creó (si está autenticado)
  name?: string;
  front: CustomView;
  back: CustomView;
  left: CustomView;
  right: CustomView;
  color: string;
  size: string;
  status: CustomDesignStatus;
  rejectionReason?: string;
  modificationNotes?: string;
  price: number; // Precio base
  createdAt: Date;
  updatedAt: Date;
  quantity?: number; // Para mantener compatibilidad con código existente
}

// Producto estándar del catálogo
export interface StandardProduct {
  id: string | number;
  name: string;
  description: string;
  price: number;
  images: string[];
  color: string;
  size: string;
  category: string;
  inStock: boolean;
  previewImages?: Record<string, string>; // Imágenes por ángulo capturadas del canvas
  previewImage?: string; // Imagen principal para mostrar (normalmente del ángulo actual)
}

// Tipos de items en el carrito
export enum CartItemType {
  // Mantenemos el enum anterior para compatibilidad
  STANDARD = "standard",
  PRODUCT = "product",
  CUSTOM = "custom",
}

// ----- NUEVAS INTERFACES PARA EL MODELO REFACTORIZADO -----

// Item en el carrito (producto del catálogo)
export interface ProductCartItem {
  id: string; // ID único para este item de carrito
  type: CartItemType.PRODUCT | CartItemType.STANDARD; // Soporta ambos tipos para compatibilidad
  productId: string; // Referencia al producto
  color: string; // Color seleccionado
  size: string; // Talla seleccionada
  quantity: number;
  unitPrice: number; // Precio unitario al momento de agregar
  price?: number; // Para compatibilidad con código existente
  product?: StandardProduct; // Para compatibilidad con código existente
}

// Item en el carrito (diseño personalizado)
export interface CustomCartItem {
  id: string; // ID único para este item de carrito
  type: CartItemType.CUSTOM;
  designId: string; // Referencia al diseño personalizado
  quantity: number;
  unitPrice: number; // Precio unitario al momento de agregar
  price?: number; // Para compatibilidad con código existente
  design?: CustomDesign; // Para compatibilidad con código existente
}

// Tipo unión para cualquier item del carrito
export type CartItem = ProductCartItem | CustomCartItem;

// Tipo unificado que permite acceder a propiedades de manera segura en ambos modelos
export type SafeCartItem = {
  id: string;
  type: CartItemType;
  quantity: number;
  price?: number;
  unitPrice?: number;
  product?: StandardProduct;
  productId?: string;
  design?: CustomDesign;
  designId?: string;
  color?: string;
  size?: string;
};

// Tipo para OrderItem importado desde order.ts
export interface OrderItem {
  id: string;
  type: CartItemType;
  productId?: string;
  designId?: string;
  snapshot: {
    name: string;
    color: string;
    size: string;
    imageUrl: string;
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  price: number;
  product?: {
    id: string;
    name: string;
    color?: string;
    size?: string;
    images?: string[];
    price?: number;
  };
  design?: {
    id: string;
    name?: string;
    color?: string;
    size?: string;
    front?: unknown;
  };
}

// Carrito completo
export interface Cart {
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
}

// ----- INTERFACES LEGACY PARA COMPATIBILIDAD -----
// Se eliminaron tipos legacy no utilizados

// ----- FUNCIONES DE TIPO GUARD Y CONVERSIÓN -----

// Funciones de tipo guard para verificar el tipo de item
export const isProductItem = (item: unknown): item is ProductCartItem => {
  return (
    Boolean(item) &&
    typeof item === "object" &&
    item !== null &&
    "type" in item &&
    (item.type === CartItemType.PRODUCT || item.type === CartItemType.STANDARD)
  );
};

export const isCustomItem = (item: unknown): item is CustomCartItem => {
  return (
    Boolean(item) &&
    typeof item === "object" &&
    item !== null &&
    "type" in item &&
    item.type === CartItemType.CUSTOM
  );
};

// Compatibilidad con código legacy
export const isStandardItem = (item: unknown): item is ProductCartItem => {
  return (
    Boolean(item) &&
    typeof item === "object" &&
    item !== null &&
    "type" in item &&
    (item.type === CartItemType.PRODUCT || item.type === CartItemType.STANDARD)
  );
};

// isExactlyStandardItem se ha eliminado por no ser necesario
// isStandardItem cumple la función necesaria para verificar productos estándar

// Ayudante para trabajar con cualquier tipo de item de carrito de manera segura
export const asSafeCartItem = (item: CartItem | OrderItem): SafeCartItem => {
  return item as SafeCartItem;
};

// Sobrecarga para cuando el tipo es completamente desconocido (usado internamente)
export const asSafeCartItemFromUnknown = (item: unknown): SafeCartItem => {
  return item as SafeCartItem;
};

// Funciones auxiliares para convertir de formato antiguo a nuevo
type LegacyCartItem = {
  product?: StandardProduct;
  design?: CustomDesign;
  quantity: number;
  price: number;
  type: CartItemType;
};

export const convertToProductCartItem = (
  oldItem: LegacyCartItem
): ProductCartItem => {
  return {
    id: oldItem.product?.id ?? crypto.randomUUID(),
    type: CartItemType.PRODUCT,
    productId: oldItem.product?.id ?? "",
    color: oldItem.product?.color ?? "",
    size: oldItem.product?.size ?? "",
    quantity: oldItem.quantity,
    unitPrice: oldItem.price,
    price: oldItem.price,
    product: oldItem.product,
  };
};

export const convertToCustomCartItem = (
  oldItem: LegacyCartItem
): CustomCartItem => {
  return {
    id: oldItem.design?.id ?? crypto.randomUUID(),
    type: CartItemType.CUSTOM,
    designId: oldItem.design?.id ?? "",
    quantity: oldItem.quantity,
    unitPrice: oldItem.price,
    price: oldItem.price,
    design: oldItem.design,
  };
};
