import { ColorOption, SizeOption, FontOption, ApiColorDTO, ApiSizeDTO, ApiFontDTO } from '@/types/productData';

// Configuración de la API
const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Obtiene los colores disponibles desde el backend
 */
export const fetchColors = async (): Promise<ColorOption[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/colores`);
    
    if (!response.ok) {
      throw new Error(`Error al cargar colores: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json() as ApiColorDTO[];
    
    // Mapear datos del backend al formato esperado en el frontend
    return data.map((color) => ({
      id: color.id,
      label: color.nombre,
      value: color.codigoHex,
      textPreview: getContrastColor(color.codigoHex),
      priceModifier: color.modificadorPrecio ?? 0
    }));
  } catch (error) {
    console.error('Error en fetchColors:', error);
    throw error;
  }
};

/**
 * Obtiene las tallas disponibles desde el backend
 */
export const fetchSizes = async (): Promise<SizeOption[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tallas`);
    
    if (!response.ok) {
      throw new Error(`Error al cargar tallas: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json() as ApiSizeDTO[];
    
    // Mapear datos del backend al formato esperado en el frontend
    return data.map((size) => ({
      id: size.id,
      label: size.nombre,
      priceModifier: size.modificadorPrecio ?? 0
    }));
  } catch (error) {
    console.error('Error en fetchSizes:', error);
    throw error;
  }
};

/**
 * Obtiene las fuentes disponibles desde el backend
 */
export const fetchFonts = async (): Promise<FontOption[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/fuentes`);
    
    if (!response.ok) {
      throw new Error(`Error al cargar fuentes: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json() as ApiFontDTO[];
    
    // Mapear datos del backend al formato esperado en el frontend
    return data.map((font) => ({
      id: font.id,
      label: font.nombre,
      value: font.nombreFamilia ?? font.nombre // Usar nombreFamilia si existe, o nombre como fallback
    }));
  } catch (error) {
    console.error('Error en fetchFonts:', error);
    throw error;
  }
};

/**
 * Determina el color de contraste óptimo para texto sobre un fondo de color
 * @param hexColor Color de fondo en formato HEX (#RRGGBB)
 * @returns Color de texto (#000000 para fondos claros, #FFFFFF para fondos oscuros)
 */
function getContrastColor(hexColor: string): string {
  // Eliminar el # si existe
  const hex = hexColor.replace('#', '');
  
  // Convertir a RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calcular la luminancia (percepción de brillo)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Usar texto negro para fondos claros y blanco para fondos oscuros
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}
