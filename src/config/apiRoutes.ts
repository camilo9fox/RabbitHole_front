const API_BASE_URL = "http://localhost:8080/api";

export const API_ROUTES = {
  base: API_BASE_URL,
  colors: `${API_BASE_URL}/colores`,
  sizes: `${API_BASE_URL}/tallas`,
  fonts: `${API_BASE_URL}/fuentes`,
  categories: `${API_BASE_URL}/categorias`,
  products: `${API_BASE_URL}/productos`,
  disenoPersonalizado: `${API_BASE_URL}/productos-personalizados`,
  orders: `${API_BASE_URL}/ordenes`,
  cart: `${API_BASE_URL}/carritos`,
  thumbnails: `${API_BASE_URL}/thumbnails`,
};
