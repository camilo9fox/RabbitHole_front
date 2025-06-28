import axios from "axios";
import { API_ROUTES } from "../config/apiRoutes";

export interface OrderUser {
  usuarioId: number;
  carritoId: number;
  infoEnvio: InfoEnvio;
  infoPago: InfoPago;
}

export interface OrderAnonymous {
  items: Item[];
  infoEnvio: InfoEnvio;
  infoPago: InfoPago;
}

export interface Item {
  productoId?: number;
  disenoPersonalizadoId?: number;
  tipoItemId: number;
  cantidad: number;
  colorId: string;
  tallaId: string;
}

export interface InfoEnvio {
  nombreCompleto: string;
  direccion: string;
  ciudad: string;
  estado: string;
  codigoPostal: string;
  pais: string;
  telefono: string;
  email: string;
}

export interface InfoPago {
  metodoPagoId: number;
  ultimosDigitos: string;
  titularTarjeta: string;
  idTransaccion: string;
}

export const createOrderUser = async (order: OrderUser) => {
  try {
    const response = await axios.post(API_ROUTES.orders, order);
    return response.data;
  } catch (error) {
    console.error("Error al crear orden:", error);
    throw error;
  }
};

export const createOrderAnonymous = async (order: OrderAnonymous) => {
  try {
    const response = await axios.post(API_ROUTES.orders + "/anonima", order);
    return response.data;
  } catch (error) {
    console.error("Error al crear orden:", error);
    throw error;
  }
};

export const getOrderById = async (orderId: number) => {
  try {
    const response = await axios.get(API_ROUTES.orders + "/" + orderId);
    return response.data;
  } catch (error) {
    console.error("Error al obtener orden:", error);
    throw error;
  }
};

export const getAllOrders = async () => {
  try {
    const response = await axios.get(API_ROUTES.orders);
    return response.data;
  } catch (error) {
    console.error("Error al obtener ordenes:", error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId: number, statusId: number) => {
  try {
    const response = await axios.put(
      API_ROUTES.orders + "/" + orderId + "/estado?estadoId=" + statusId
    );
    return response.data;
  } catch (error) {
    console.error("Error al actualizar estado de orden:", error);
    throw error;
  }
};
