/**
 * Utilidades para convertir entre tipos de datos del backend y frontend
 */

import {
  CustomDesign,
  CustomDesignStatus,
  CustomView,
  StandardProduct,
} from "@/types/cart";
import { DisenoPersonalizadoDTO, AnguloDTO } from "@/types/personalizedDesign";
import { Producto } from "@/types/order";

/**
 * Convierte un DisenoPersonalizadoDTO del backend a un CustomDesign del frontend
 * @param dto El diseño personalizado en formato DTO del backend
 * @returns Un objeto CustomDesign listo para usar en el frontend
 */
export const convertDTOToCustomDesign = (
  dto: DisenoPersonalizadoDTO
): CustomDesign => {
  // Inicializar vistas vacías
  const emptyView: CustomView = {
    text: "",
    image: null,
    textFont: "",
    textColor: "",
    textSize: 0,
    textPositionX: 0,
    textPositionY: 0,
    imagePositionX: 0,
    imagePositionY: 0,
    imageWidth: 0,
    imageHeight: 0,
    previewImage: "",
  };

  // Crear vistas para cada ángulo
  const views: Record<string, CustomView> = {
    front: { ...emptyView },
    back: { ...emptyView },
    left: { ...emptyView },
    right: { ...emptyView },
  };

  // Procesar cada ángulo del DTO
  if (dto.angulos && Array.isArray(dto.angulos)) {
    dto.angulos.forEach((angulo: AnguloDTO) => {
      // Mapear el tipo de ángulo a la clave de vista
      let viewKey: string;
      switch (angulo.tipoAnguloId) {
        case 1:
          viewKey = "front";
          break;
        case 2:
          viewKey = "back";
          break;
        case 3:
          viewKey = "left";
          break;
        case 4:
          viewKey = "right";
          break;
        default:
          viewKey = "front";
      }

      // Solo procesar si el ángulo tiene elemento
      if (angulo.elemento) {
        const { tipo, propiedadesDiseno, propiedadesElemento } =
          angulo.elemento;

        if (tipo === "TEXTO" && propiedadesElemento.texto) {
          views[viewKey].text = propiedadesElemento.texto ?? "";
          views[viewKey].textFont = propiedadesElemento.fuenteId ?? "";
          views[viewKey].textColor =
            propiedadesElemento.colorId ?? propiedadesElemento.color ?? "";
          views[viewKey].textSize =
            propiedadesElemento.tamano ?? propiedadesElemento.fontSize ?? 0;
          views[viewKey].textPositionX = propiedadesDiseno.posicionX ?? 0;
          views[viewKey].textPositionY = propiedadesDiseno.posicionY ?? 0;
        } else if (tipo === "IMAGEN") {
          views[viewKey].image = propiedadesElemento.url ?? null;
          views[viewKey].imagePositionX = propiedadesDiseno.posicionX ?? 0;
          views[viewKey].imagePositionY = propiedadesDiseno.posicionY ?? 0;
          views[viewKey].imageWidth = propiedadesDiseno.anchura ?? 0;
          views[viewKey].imageHeight = propiedadesDiseno.altura ?? 0;
        }

        // Usar la URL de la miniatura si está disponible
        if (angulo.thumbnailUrl) {
          views[viewKey].previewImage = angulo.thumbnailUrl;
        } else if (angulo.thumbnailBase64) {
          views[viewKey].previewImage = angulo.thumbnailBase64;
        }
      }
    });
  }

  // Mapear el estado del diseño
  // Mapear el estado del diseño
  let status: CustomDesignStatus;
  switch (dto.estadoId) {
    case 2:
      status = CustomDesignStatus.APPROVED;
      break;
    case 3:
      status = CustomDesignStatus.REJECTED;
      break;
    case 4:
      status = CustomDesignStatus.MODIFICATION_REQUESTED;
      break;
    default:
      status = CustomDesignStatus.PENDING;
  }

  // Crear y devolver el objeto CustomDesign
  return {
    id: dto.id?.toString() ?? "",
    userId: dto.usuarioId?.toString(),
    name: dto.detalle ?? "Diseño personalizado",
    front: views.front,
    back: views.back,
    left: views.left,
    right: views.right,
    color: dto.colorId ?? "",
    size: dto.tallaId ?? "",
    status: status,
    price: dto.precio ?? 0,
    createdAt: dto.creadoEn
      ? new Date(dto.creadoEn[0], dto.creadoEn[1] - 1, dto.creadoEn[2])
      : new Date(),
    updatedAt: dto.actualizadoEn
      ? new Date(
          dto.actualizadoEn[0],
          dto.actualizadoEn[1] - 1,
          dto.actualizadoEn[2]
        )
      : new Date(),
    quantity: dto.cantidad ?? 1,
  };
};

/**
 * Convierte un Producto del backend a un StandardProduct del frontend
 * @param producto El producto en formato del backend
 * @returns Un objeto StandardProduct listo para usar en el frontend
 */
export const convertProductoToStandardProduct = (
  producto: Producto
): StandardProduct => {
  // Extraer URLs de imágenes de los thumbnails si existen
  const images: string[] = [];
  const previewImages: Record<string, string> = {};

  // Si el producto tiene un diseño personalizado con ángulos y thumbnails
  if (
    producto.disenoPersonalizado?.angulos &&
    Array.isArray(producto.disenoPersonalizado.angulos)
  ) {
    producto.disenoPersonalizado.angulos.forEach((angulo) => {
      if (angulo.thumbnailUrl) {
        images.push(angulo.thumbnailUrl);
      }
    });
  }

  // Si no hay imágenes, agregar una imagen de placeholder
  if (images.length === 0) {
    images.push("/images/placeholder.png");
  }

  if (producto.thumbnails) {
    producto.thumbnails.forEach((thumbnail) => {
      previewImages[thumbnail.nombreAngulo.toLocaleLowerCase()] = thumbnail.url;
    });
  }

  // Crear y devolver el objeto StandardProduct
  return {
    id: producto.id.toString(),
    name: producto.nombre ?? "Producto",
    description: producto.descripcion ?? "",
    price: 0, // El precio no está disponible en el objeto Producto
    images: images,
    color: "", // El color no está disponible en el objeto Producto
    size: "", // La talla no está disponible en el objeto Producto
    category: producto.categoriaNombre ?? "",
    inStock: producto.activo === 1,
    previewImages: previewImages,
    previewImage: previewImages["frente"],
  };
};
