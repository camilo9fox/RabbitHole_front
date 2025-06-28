import axios from "axios";
import { API_ROUTES } from "../config/apiRoutes";

export type newProductItem = {
  productoId: number;
  cantidad: number;
  colorId: string;
  tallaId: string;
  tipoItemId: number;
};

export type newCustomItem = {
  disenoId: number;
  tipoItemId: number;
  colorId: string;
  tallaId: string;
  cantidad: number;
};

export const initCart = async (userId: number) => {
  try {
    const response = await axios.get(
      API_ROUTES.cart + "/usuario/" + userId + "/activo"
    );
    return response.data;
  } catch (error) {
    console.error("Error al inicializar carrito:", error);
    throw error;
  }
};

export const addProductToCart = async (
  newProductItem: newProductItem,
  cartId: number
) => {
  try {
    const response = await axios.post(
      API_ROUTES.cart + "/" + cartId + "/producto",
      newProductItem
    );
    return response.data;
  } catch (error) {
    console.error("Error al agregar producto al carrito:", error);
    throw error;
  }
};

export const addCustomItemToCart = async (
  newCustomItem: newCustomItem,
  cartId: number
) => {
  try {
    const response = await axios.post(
      API_ROUTES.cart + "/" + cartId + "/diseno",
      newCustomItem
    );
    return response.data;
  } catch (error) {
    console.error("Error al agregar diseño personalizado al carrito:", error);
    throw error;
  }
};

export const updateItemQuantity = async (
  cartId: number,
  cartItemId: number,
  quantity: number
) => {
  try {
    const response = await axios.put(
      API_ROUTES.cart +
        "/" +
        cartId +
        "/items/" +
        cartItemId +
        "/cantidad?cantidad=" +
        quantity
    );
    return response.data;
  } catch (error) {
    console.error("Error al actualizar cantidad del item:", error);
    throw error;
  }
};

export const deleteItemFromCart = async (
  cartId: number,
  cartItemId: number
) => {
  try {
    const response = await axios.delete(
      API_ROUTES.cart + "/" + cartId + "/items/" + cartItemId
    );
    return response.data;
  } catch (error) {
    console.error("Error al eliminar item del carrito:", error);
    throw error;
  }
};

export const emptyCart = async (cartId: number) => {
  try {
    const response = await axios.delete(
      API_ROUTES.cart + "/" + cartId + "/items"
    );
    return response.data;
  } catch (error) {
    console.error("Error al vaciar carrito:", error);
    throw error;
  }
};

export const deleteCart = async (cartId: number) => {
  try {
    const response = await axios.delete(API_ROUTES.cart + "/" + cartId);
    return response.data;
  } catch (error) {
    console.error("Error al eliminar carrito:", error);
    throw error;
  }
};
