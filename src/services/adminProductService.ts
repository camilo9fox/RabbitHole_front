import { AdminProduct, ProductsState } from '@/types/product';

// Clave para almacenar los productos en localStorage
const ADMIN_PRODUCTS_KEY = 'admin_products';

// Función para generar un ID único
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Función para obtener todos los productos
export const getAdminProducts = (): AdminProduct[] => {
  console.log('getAdminProducts llamado');
  
  if (typeof window === 'undefined') {
    console.log('Window no definido, retornando array vacío');
    return [];
  }
  
  try {
    const productsData = localStorage.getItem(ADMIN_PRODUCTS_KEY);
    console.log('Datos obtenidos de localStorage:', productsData);
    
    if (!productsData) {
      console.log('No hay datos en localStorage, retornando array vacío');
      return [];
    }
    
    const parsedData: ProductsState = JSON.parse(productsData);
    console.log('Datos parseados:', parsedData);
    
    if (!parsedData.products || !Array.isArray(parsedData.products)) {
      console.log('Estructura de datos inválida, retornando array vacío');
      return [];
    }
    
    return parsedData.products;
  } catch (error) {
    console.error('Error al cargar productos:', error);
    return [];
  }
};

// Función para obtener un producto por ID
export const getAdminProductById = (id: string): AdminProduct | null => {
  const products = getAdminProducts();
  return products.find(product => product.id === id) || null;
};

// Función para guardar un nuevo producto
export const saveAdminProduct = (product: Partial<AdminProduct>): AdminProduct => {
  console.log('saveAdminProduct llamado con:', product);
  
  try {
    const products = getAdminProducts();
    console.log('Productos existentes:', products);
    
    const newProduct: AdminProduct = {
      id: product.id ?? generateId(),
      name: product.name ?? 'Producto sin nombre',
      description: product.description ?? 'Sin descripción',
      price: product.price ?? 0,
      category: product.category ?? 'Sin categoría',
      availableColors: product.availableColors ?? [],
      availableSizes: product.availableSizes ?? [],
      thumbnail: product.thumbnail ?? '',
      angles: product.angles ?? {
        front: {},
        back: {},
        left: {},
        right: {}
      },
      createdAt: product.createdAt ?? Date.now(),
      updatedAt: Date.now()
    };
    
    console.log('Nuevo producto a guardar:', newProduct);
    
    const updatedProducts = [...products, newProduct];
    
    const productsState: ProductsState = {
      products: updatedProducts,
      lastUpdated: Date.now()
    };
    
    console.log('Estado a guardar en localStorage:', productsState);
    
    // Guardar en localStorage con manejo de errores
    try {
      localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(productsState));
      console.log('Guardado en localStorage exitoso');
    } catch (error) {
      console.error('Error al guardar en localStorage:', error);
      throw new Error('Error al guardar en localStorage');
    }
    
    return newProduct;
  } catch (error) {
    console.error('Error en saveAdminProduct:', error);
    throw error;
  }
};

// Función para actualizar un producto existente
export const updateAdminProduct = (product: AdminProduct): AdminProduct => {
  const products = getAdminProducts();
  
  const updatedProduct = {
    ...product,
    updatedAt: Date.now()
  };
  
  const updatedProducts = products.map(p => 
    p.id === product.id ? updatedProduct : p
  );
  
  const productsState: ProductsState = {
    products: updatedProducts,
    lastUpdated: Date.now()
  };
  
  localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(productsState));
  
  return updatedProduct;
};

// Función para eliminar un producto
export const deleteAdminProduct = (id: string): boolean => {
  const products = getAdminProducts();
  
  const updatedProducts = products.filter(p => p.id !== id);
  
  // Si no se encontró el producto para eliminar
  if (updatedProducts.length === products.length) {
    return false;
  }
  
  const productsState: ProductsState = {
    products: updatedProducts,
    lastUpdated: Date.now()
  };
  
  localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(productsState));
  
  return true;
};

// Función para generar una miniatura a partir del canvas
export const generateThumbnail = (canvas: HTMLCanvasElement): string => {
  console.log('generateThumbnail llamado con canvas:', canvas);
  
  try {
    // Verificar que el canvas sea válido
    if (!canvas || !canvas.width || !canvas.height) {
      console.error('Canvas inválido o sin dimensiones');
      return '';
    }
    
    // Reducir el tamaño para la miniatura
    const thumbnailCanvas = document.createElement('canvas');
    const thumbnailCtx = thumbnailCanvas.getContext('2d');
    
    // Establecer dimensiones de la miniatura
    thumbnailCanvas.width = 200;
    thumbnailCanvas.height = 200;
    
    if (!thumbnailCtx) {
      console.error('No se pudo obtener el contexto 2D del canvas de miniatura');
      return '';
    }
    
    // Dibujar el canvas original en el canvas de la miniatura
    thumbnailCtx.drawImage(
      canvas, 
      0, 0, canvas.width, canvas.height,
      0, 0, thumbnailCanvas.width, thumbnailCanvas.height
    );
    
    // Devolver la miniatura como data URL
    const dataUrl = thumbnailCanvas.toDataURL('image/png');
    console.log('Miniatura generada correctamente, longitud:', dataUrl.length);
    return dataUrl;
  } catch (error) {
    console.error('Error al generar miniatura:', error);
    return '';
  }
};

// Función para convertir una imagen a base64
export const imageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => {
      const error = new Error('Error al leer el archivo');
      reject(error);
    };
  });
};
