import apiClient from "../config/apiClient";
import { API_ROUTES } from "../config/apiRoutes";

export const addThumbnailCartItem = async (
  cartItemId: number,
  angleName: string,
  base64Image: string
) => {
  try {
    const angleId = getIdByAngleName(angleName);
    const response = await apiClient.post(
      API_ROUTES.thumbnails + "/carrito/" + cartItemId + "/angulo/" + angleId,
      { base64Image }
    );
    return response.data;
  } catch (error) {
    console.error("Error al agregar thumbnail al item del carrito:", error);
    throw error;
  }
};

export const addThumbnailOrderItem = async (
  orderItemId: number,
  angleName: string,
  base64Image: string
) => {
  try {
    const angleId = getIdByAngleName(angleName);
    const response = await apiClient.post(
      API_ROUTES.thumbnails + "/orden/" + orderItemId + "/angulo/" + angleId,
      { base64Image }
    );
    return response.data;
  } catch (error) {
    console.error("Error al agregar thumbnail al item de la orden:", error);
    throw error;
  }
};

const getIdByAngleName = (angleName: string) => {
  switch (angleName.toLocaleLowerCase()) {
    case "frente":
      return 1;
    case "espalda":
      return 2;
    case "izquierda":
      return 3;
    case "derecha":
      return 4;
    default:
      throw new Error("Angle name is not valid");
  }
};
