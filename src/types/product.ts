// Interfaces para productos y diseños

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
  thumbnail?: string;
  image?: DesignImage;  // Imagen de diseño (opcional)
  text?: DesignText;    // Texto de diseño (opcional)
}

// Representa un producto completo creado por el administrador
export interface Product {
  id: string;           // ID único del producto
  name: string;         // Nombre del producto
  description: string;  // Descripción del producto
  price: number;        // Precio base del producto
  
  // Diseños para cada ángulo de la polera
  angles: {
    front: AngleDesign;
    back: AngleDesign;
    left: AngleDesign;
    right: AngleDesign;
  };
  
  category: string;     // Categoría del producto (ej: "Urbano", "Minimalista", etc.)
  thumbnail?: string;   // URL o data URL de la miniatura
  inStock: boolean;     // Disponibilidad del producto
  selectedColor?: string; // Color seleccionado actualmente (para compatibilidad)
  
  // Colores y tallas disponibles
  colors: string[];     // Lista de colores disponibles en formato hexadecimal
  sizes: string[];      // Lista de tallas disponibles (ej: "S", "M", "L", "XL")
  
  createdAt: Date;      // Fecha de creación
  updatedAt: Date;      // Fecha de última actualización
}

// Tipo para el estado de productos en localStorage
export interface ProductsState {
  products: Product[];
  lastUpdated: number;
}

// Tipo auxiliar para compatibilidad con código legacy
export type AdminProduct = Product;
