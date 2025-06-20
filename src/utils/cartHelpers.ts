import { CartItem, CustomCartItem, ProductCartItem, CartItemType, SafeCartItem, CustomDesign, StandardProduct } from "@/types/cart";
import { OrderItem } from "@/types/order";

/**
 * Funciones utilitarias para trabajar con items de carrito y órdenes de forma segura
 */

/**
 * Verifica si un item es de tipo producto (estándar o producto normalizado)
 */
export const isProductItem = (item: CartItem | OrderItem): item is ProductCartItem => {
  return item.type === CartItemType.PRODUCT || item.type === CartItemType.STANDARD;
};

/**
 * Verifica si un item es de tipo diseño personalizado
 */
export const isCustomItem = (item: CartItem | OrderItem): item is CustomCartItem => {
  return item.type === CartItemType.CUSTOM;
};

/**
 * Obtiene de forma segura el producto de un item de carrito o pedido
 */
export const getProductSafely = (item: CartItem | OrderItem): StandardProduct | null => {
  if (!item) return null;
  
  if ('product' in item && item.product) {
    // Verificar si es un StandardProduct completo o un producto simplificado
    if ('description' in item.product && 'category' in item.product && 'inStock' in item.product) {
      return item.product as StandardProduct;
    } else {
      // Si es un producto simplificado, devolver null
      // En un caso real podríamos construir un StandardProduct completo aquí
      return null;
    }
  }
  
  return null;
};

/**
 * Obtiene de forma segura el diseño de un item de carrito o pedido
 */
export const getDesignSafely = (item: CartItem | OrderItem): CustomDesign | null => {
  if (!item) return null;

  if ('design' in item && item.design) {
    // Verificar si es un CustomDesign completo o un diseño simplificado
    if ('back' in item.design && 'left' in item.design && 'right' in item.design && 'status' in item.design) {
      return item.design as CustomDesign;
    } else {
      // Si es un diseño simplificado, devolver null
      // En un caso real podríamos construir un CustomDesign completo aquí
      return null;
    }
  }
  
  return null;
};

/**
 * Obtiene de forma segura la imagen del producto o diseño para mostrar
 */
export const getImageUrlFromItem = (item: CartItem | OrderItem | SafeCartItem, activeView?: string): string => {
  return getItemImageSafely(item, activeView);
}

/**
 * Obtiene de forma segura la imagen del producto o diseño para mostrar (función original)
 */
export const getItemImageSafely = (item: CartItem | OrderItem | SafeCartItem, activeView?: string): string => {
  const fallbackImage = '/assets/products/placeholder.png';
  const view = activeView || 'front'; // Vista por defecto es 'front'

  if (!item) return fallbackImage;

  // Caso producto estándar
  if ('product' in item && item.product) {
    // Para productos estándar, necesitamos manejar diferentes ángulos
    const product = item.product;
    const images = product.images || [];
    
    // Si hay previewImages y existe la vista activa
    if ('previewImages' in product && 
        product.previewImages && 
        typeof product.previewImages === 'object' && 
        view in product.previewImages) {
      return product.previewImages[view] as string;
    }
    
    // Alternativa: intentar encontrar la imagen que contenga el nombre de la vista
    // (por ejemplo, "front", "back", etc.) en su URL
    if (images.length > 0) {
      // Buscar imagen por nombre de vista en la URL
      const matchingImage = images.find(img => 
        typeof img === 'string' && 
        (img.toLowerCase().includes(`_${view}.`) || 
         img.toLowerCase().includes(`/${view}.`) ||
         img.toLowerCase().includes(`-${view}.`))
      );
      
      if (matchingImage) {
        return matchingImage;
      }
      
      // Si hay múltiples imágenes, intentar asignarlas por posición
      if (images.length >= 2) {
        // Asumimos un orden: frente, espalda, izquierda, derecha
        switch(view) {
          case 'front': return images[0];
          case 'back': return images.length > 1 ? images[1] : images[0];
          case 'left': return images.length > 2 ? images[2] : images[0];
          case 'right': return images.length > 3 ? images[3] : images[0];
          default: return images[0];
        }
      }
      
      // Si solo hay una imagen, usarla para todas las vistas
      return images[0];
    }
  }

  // Caso diseño personalizado
  if ('design' in item && item.design) {
    const design = item.design;
    
    // Intentar obtener la vista solicitada
    if (view in design) {
      const viewData = design[view as keyof typeof design];
      
      if (viewData) {
        if (typeof viewData === 'object' && viewData !== null) {
          // Si es un objeto CustomView con previewImage o image
          const viewObj = viewData as any;
          return viewObj.previewImage || viewObj.image || fallbackImage;
        }
        return String(viewData) ?? fallbackImage;
      }
    }
    
    // Fallback a vista frontal si la solicitada no existe
    if ('front' in design && design.front) {
      if (typeof design.front === 'object' && design.front !== null) {
        const frontObj = design.front as any;
        return frontObj.previewImage || frontObj.image || fallbackImage;
      }
      return String(design.front) ?? fallbackImage;
    }
  }

  // Caso snapshot en OrderItem
  if ('snapshot' in item && item.snapshot?.imageUrl) {
    return item.snapshot.imageUrl;
  }

  return fallbackImage;
};

/**
 * Obtiene de forma segura el nombre del item para mostrar
 */
export const getNameFromItem = (item: CartItem | OrderItem): string => {
  if (!item) return 'Producto';
  
  if ('product' in item && item.product?.name) {
    return item.product.name;
  }

  if ('snapshot' in item && item.snapshot?.name) {
    return item.snapshot.name;
  }
  
  return item.type === CartItemType.CUSTOM ? 'Diseño personalizado' : 'Producto estándar';
};

/**
 * Versión original para compatibilidad con código existente
 */
export const getItemNameSafely = (item: CartItem | OrderItem): string => {
  if (!item) return 'Producto';
  
  if ('product' in item && item.product?.name) {
    return item.product.name;
  }
  
  if ('design' in item) {
    return 'Polera Personalizada';
  }
  
  return 'Producto';
};

/**
 * Obtiene de forma segura el precio del item
 */
export const getPriceFromItem = (item: CartItem | OrderItem): number => {
  if (!item) return 0;
  
  // Primero intentamos obtener el precio directamente del item
  if ('price' in item && typeof item.price === 'number') {
    return item.price;
  }
  
  // Luego intentamos obtener el precio unitario
  if ('unitPrice' in item && typeof item.unitPrice === 'number') {
    return item.unitPrice;
  }
  
  // Finalmente intentamos obtener el precio del producto
  if ('product' in item && item.product?.price) {
    return item.product.price;
  }
  
  return 0;
};

/**
 * Versión original para compatibilidad con código existente
 */
export const getItemPriceSafely = (item: CartItem | OrderItem): number => {
  // Primero intentamos obtener el precio directamente del item
  if ('price' in item && typeof item.price === 'number') {
    return item.price;
  }
  
  // Luego intentamos desde el producto
  if ('product' in item && item.product?.price) {
    return item.product.price;
  }
  
  // Luego intentamos desde el diseño (verificando que exista la propiedad price)
  if ('design' in item && item.design && 'price' in item.design && typeof item.design.price === 'number') {
    return item.design.price;
  }
  
  // Si hay un snapshot con el precio, lo usamos (verificando que exista la propiedad price)
  if ('snapshot' in item && item.snapshot && 'price' in item.snapshot && typeof item.snapshot.price === 'number') {
    return item.snapshot.price;
  }
  
  return 0;
};

/**
 * Obtiene de forma segura los detalles del item (color/talla)
 */
export const getDetailsFromItem = (item: CartItem | OrderItem): string => {
  let details = '';
  
  // Obtenemos color y talla del producto si existe
  if ('product' in item && item.product) {
    const color = item.product.color ?? '';
    const size = item.product.size ? item.product.size.toUpperCase() : '';
    if (color || size) {
      details = `${color}${color && size ? ' / ' : ''}${size ? `Talla ${size}` : ''}`;
    }
  }
  
  // Obtenemos color y talla del diseño si existe
  else if ('design' in item && item.design) {
    const color = item.design.color ?? '';
    const size = item.design.size ? item.design.size.toUpperCase() : '';
    if (color || size) {
      details = `${color}${color && size ? ' / ' : ''}${size ? `Talla ${size}` : ''}`;
    }
    
    // Añadimos el estado del diseño si está disponible
    if ('status' in item.design && item.design.status) {
      const status = item.design.status;
      switch (status) {
        case 'pending':
          details += ' / Pendiente de aprobación';
          break;
        case 'approved':
          details += ' / Aprobado';
          break;
        case 'rejected':
          details += ' / Rechazado';
          break;
        default:
          break;
      }
    }
  }
  
  // Si no hay detalles, intentamos obtenerlos del snapshot
  else if ('snapshot' in item && item.snapshot) {
    const color = item.snapshot.color ?? '';
    const size = item.snapshot.size ? item.snapshot.size.toUpperCase() : '';
    if (color || size) {
      details = `${color}${color && size ? ' / ' : ''}${size ? `Talla ${size}` : ''}`;
    }
  }
  
  return details;
};

/**
 * Versión original para compatibilidad con código existente
 */
export const getItemDetailsSafely = (item: CartItem | OrderItem): string => {
  return getDetailsFromItem(item);
};

/**
 * Obtiene las vistas disponibles de un diseño personalizado de forma segura
 */
export const getDesignViewsSafely = (design: CustomDesign | null | undefined): string[] => {
  if (!design) return [];
  
  const views: string[] = [];
  const possibleViews = ['front', 'back', 'left', 'right'];
  
  possibleViews.forEach(view => {
    // @ts-expect-error - Sabemos que puede tener estas propiedades
    if (view in design && design[view]) {
      // Verificamos si hay una imagen de vista previa o imagen base
      // @ts-expect-error - Sabemos que puede tener estas propiedades
      const hasPreview = typeof design[view] === 'object' && (design[view].previewImage || design[view].image);
      if (hasPreview) {
        views.push(view);
      }
    }
  });
  
  return views;
};
