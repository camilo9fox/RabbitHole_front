// Interfaces para productos diseñados por el administrador

// Representa un elemento de diseño (imagen) en un ángulo específico
export interface DesignImage {
  src: string;          // URL de la imagen o data URL
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
}

// Representa un elemento de texto en un ángulo específico
export interface DesignText {
  content: string;      // Contenido del texto
  font: string;         // Fuente del texto
  color: string;        // Color del texto
  size: number;         // Tamaño del texto
  position: {
    x: number;
    y: number;
  };
}

// Representa el diseño para un ángulo específico de la polera
export interface AngleDesign {
  image?: DesignImage;  // Imagen de diseño (opcional)
  text?: DesignText;    // Texto de diseño (opcional)
}

// Representa un producto completo diseñado por el administrador
export interface AdminProduct {
  id: string;           // ID único del producto
  name: string;         // Nombre del producto
  description: string;  // Descripción del producto
  price: number;        // Precio base del producto
  createdAt: number;    // Timestamp de creación
  updatedAt: number;    // Timestamp de última actualización
  
  // Diseños para cada ángulo de la polera
  angles: {
    front: AngleDesign;
    back: AngleDesign;
    left: AngleDesign;
    right: AngleDesign;
  };
  selectedColor?: string;
  // Categoría del producto
  category: string;     // Categoría del producto (ej: "Urbano", "Minimalista", etc.)
  
  // Imagen de miniatura para mostrar en la tienda
  thumbnail?: string;   // URL o data URL de la miniatura
  
  // Indica si el producto está publicado en la tienda
  inStore?: boolean;    // true si está en la tienda, false si no está publicado
  
  // Colores disponibles para el producto
  colors?: string[];    // Lista de colores disponibles en formato hexadecimal
  
  // Tallas disponibles para el producto
  sizes?: string[];     // Lista de tallas disponibles (ej: "S", "M", "L", "XL")
}

// Tipo para el estado de productos en localStorage
export interface ProductsState {
  products: AdminProduct[];
  lastUpdated: number;
}
