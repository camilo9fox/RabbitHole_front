import { API_ROUTES } from "@/config/apiRoutes";
import apiClient from "../config/apiClient";
import { DisenoPersonalizadoDTO } from "@/types/personalizedDesign";

export const fetchPersonalizedDesigns = async (userId: number) => {
  try {
    const response = await apiClient.get(
      `${API_ROUTES.disenoPersonalizado}/usuario/${userId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error al obtener diseños personalizados:", error);
    throw error;
  }
};

export const createPersonalizedDesign = async (
  design: DisenoPersonalizadoDTO
) => {
  try {
    const response = await apiClient.post(API_ROUTES.disenoPersonalizado, design);
    return response.data;
  } catch (error) {
    console.error("Error al crear diseño personalizado:", error);
    throw error;
  }
};

export const updatePersonalizedDesign = async (
  design: DisenoPersonalizadoDTO
) => {
  try {
    const response = await apiClient.put(
      `${API_ROUTES.disenoPersonalizado}/${design.id}`,
      design
    );
    return response.data;
  } catch (error) {
    console.error("Error al actualizar diseño personalizado:", error);
    throw error;
  }
};

export const deletePersonalizedDesign = async (id: number) => {
  try {
    const response = await apiClient.delete(
      `${API_ROUTES.disenoPersonalizado}/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error al eliminar diseño personalizado:", error);
    throw error;
  }
};

export const updatePersonalizedDesignStatus = async (
  id: number,
  statusId: number
) => {
  try {
    const response = await apiClient.put(
      `${API_ROUTES.disenoPersonalizado}/${id}/estado`,
      { estadoId: statusId, motivoRechazo: "", notasModificacion: "" }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error al actualizar estado del diseño personalizado:",
      error
    );
    throw error;
  }
};
