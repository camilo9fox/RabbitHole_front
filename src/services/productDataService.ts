import {
  ColorOption,
  SizeOption,
  FontOption,
  ApiColorDTO,
  ApiSizeDTO,
  ApiFontDTO,
  ProductCategoryDTO,
  ProductOnGetDTO,
  ProductOnCreatePutDTO,
} from "@/types/productData";

import { API_ROUTES } from "@/config/apiRoutes";
import axios from "axios";

/**
 * Obtiene los colores disponibles desde el backend
 */
export const fetchColors = async (): Promise<ColorOption[]> => {
  try {
    const response = await axios.get(API_ROUTES.colors);

    const data = response.data;

    // Mapear datos del backend al formato esperado en el frontend
    return data.map((color: ApiColorDTO) => ({
      id: color.id,
      label: color.nombre,
      value: color.codigoHex,
      textPreview: getContrastColor(color.codigoHex),
      priceModifier: color.modificadorPrecio ?? 0,
    }));
  } catch (error) {
    console.error("Error en fetchColors:", error);
    throw error;
  }
};

/**
 * Obtiene las tallas disponibles desde el backend
 */
export const fetchSizes = async (): Promise<SizeOption[]> => {
  try {
    const response = await axios.get(API_ROUTES.sizes);

    const data = response.data;

    // Mapear datos del backend al formato esperado en el frontend
    return data.map((size: ApiSizeDTO) => ({
      id: size.id,
      label: size.nombre,
      priceModifier: size.modificadorPrecio ?? 0,
    }));
  } catch (error) {
    console.error("Error en fetchSizes:", error);
    throw error;
  }
};

/**
 * Obtiene las fuentes disponibles desde el backend
 */
export const fetchFonts = async (): Promise<FontOption[]> => {
  try {
    const response = await axios.get(API_ROUTES.fonts);

    const data = response.data;

    // Mapear dat os del backend al formato esperado en el frontend
    return data.map((font: ApiFontDTO) => ({
      id: font.id,
      label: font.nombre,
      value: font.nombreFamilia ?? font.nombre, // Usar nombreFamilia si existe, o nombre como fallback
    }));
  } catch (error) {
    console.error("Error en fetchFonts:", error);
    throw error;
  }
};

export const fetchCategories = async (): Promise<ProductCategoryDTO[]> => {
  try {
    const response = await axios.get(API_ROUTES.categories);
    return response.data;
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    throw error;
  }
};

export const fetchProducts = async (
  queryParam?: string
): Promise<ProductOnGetDTO[]> => {
  try {
    const response = await axios.get(
      API_ROUTES.products + (queryParam ? `?${queryParam}` : "")
    );
    return response.data.productos;
  } catch (error) {
    console.error("Error al obtener productos:", error);
    throw error;
  }
};

export const fetchProductById = async (
  id: number
): Promise<ProductOnGetDTO> => {
  try {
    const response = await axios.get(`${API_ROUTES.products}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener producto por ID:", error);
    throw error;
  }
};

export const createProduct = async (product: ProductOnCreatePutDTO) => {
  try {
    const response = await axios.post(API_ROUTES.products, product);
    return response.data;
  } catch (error) {
    console.error("Error al crear producto:", error);
    throw error;
  }
};

export const updateProduct = async (product: ProductOnCreatePutDTO) => {
  try {
    const response = await axios.put(
      `${API_ROUTES.products}/${product.id}`,
      product
    );
    return response.data;
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    throw error;
  }
};

export const deleteProduct = async (id: number) => {
  try {
    const response = await axios.delete(`${API_ROUTES.products}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    throw error;
  }
};

export const toggleActiveProduct = async (id: number) => {
  try {
    const response = await axios.patch(
      `${API_ROUTES.products}/${id}/toggle-activo`
    );
    return response.data;
  } catch (error) {
    console.error("Error al alternar estado de producto:", error);
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
  const hex = hexColor.replace("#", "");

  // Convertir a RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calcular la luminancia (percepción de brillo)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Usar texto negro para fondos claros y blanco para fondos oscuros
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}
