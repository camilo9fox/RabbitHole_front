import { DisenoPersonalizadoDTO } from "./personalizedDesign";

/* eslint-disable @typescript-eslint/no-explicit-any */

export enum OrderStatus {
  PENDING = "Pendiente",
  PAID = "Pagada",
  PROCESSING = "En Proceso",
  SHIPPED = "Enviada",
  DELIVERED = "Entregada",
  CANCELLED = "Cancelada",
}
export interface Order {
  id: number;
  usuarioId: any;
  nombreUsuario: string;
  creadaEn: number[];
  total: number;
  estado: string;
  direccionEntrega: string;
  metodoPago: string;
  infoEnvio: InfoEnvio;
  infoPago: InfoPago;
  items: Item[];
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
  nombre: string;
}

export interface InfoPago {
  metodoPagoId: number;
  ultimosDigitos: string;
  titularTarjeta: string;
  idTransaccion: string;
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
  thumbnails?: Thumbnail[];
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
