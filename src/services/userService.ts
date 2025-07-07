import apiClient from "../config/apiClient";
import { API_ROUTES } from "../config/apiRoutes";

export const validateToken = async (token: string) => {
  try {
    const response = await apiClient.post(API_ROUTES.users + "/validate-token", {
      token,
    });
    return response.data;
  } catch (error) {
    console.error("Error al validar token:", error);
    throw error;
  }
};
