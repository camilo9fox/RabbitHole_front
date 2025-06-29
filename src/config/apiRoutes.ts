const API_BASE_URL_PRODUCTS = "http://localhost:8080/api";
const API_BASE_URL_USERS = `http://localhost:8081/api`;

export const API_ROUTES = {
  colors: `${API_BASE_URL_PRODUCTS}/colores`,
  sizes: `${API_BASE_URL_PRODUCTS}/tallas`,
  fonts: `${API_BASE_URL_PRODUCTS}/fuentes`,
  categories: `${API_BASE_URL_PRODUCTS}/categorias`,
  products: `${API_BASE_URL_PRODUCTS}/productos`,
  disenoPersonalizado: `${API_BASE_URL_PRODUCTS}/productos-personalizados`,
  orders: `${API_BASE_URL_PRODUCTS}/ordenes`,
  cart: `${API_BASE_URL_PRODUCTS}/carritos`,
  thumbnails: `${API_BASE_URL_PRODUCTS}/thumbnails`,
  states: `${API_BASE_URL_PRODUCTS}/estados`,
  users: `${API_BASE_URL_USERS}/usuarios`,
};
