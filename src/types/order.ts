import { DisenoPersonalizadoDTO } from "./personalizedDesign";

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Root {
  id: number;
  usuarioId: number;
  nombreUsuario: string;
  creadaEn: number[];
  total: number;
  estado: string;
  direccionEntrega: string;
  metodoPago: string;
  items: Item[];
}

export interface Item {
  id: number;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  colorNombre: string;
  tallaNombre: string;
  tipoItem: string;
  productoId?: number;
  producto?: Producto;
  disenoPersonalizadoId?: number;
  disenoPersonalizado?: DisenoPersonalizadoDTO;
  thumbnails: Thumbnail[];
}

export interface Producto {
  id: number;
  disenoPersonalizado: DisenoPersonalizadoDTO;
  nombre: string;
  descripcion: string;
  categoriaId: number;
  categoriaNombre: string;
  activo: number;
  creadoEn: number[];
  actualizadoEn: number[];
}

export interface Thumbnail {
  id: number;
  itemCarritoId: any;
  itemOrdenId: number;
  tipoAnguloId: number;
  nombreAngulo: string;
  url: string;
  cloudinaryResource: CloudinaryResource;
}

export interface CloudinaryResource {
  id: number;
  publicId: string;
  urlImagen: string;
  anchura: any;
  altura: any;
  formato: any;
  tamañoBytes: any;
}
