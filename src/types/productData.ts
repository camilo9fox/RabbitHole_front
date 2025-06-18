// Interfaces compartidas para datos de productos
export interface ColorOption {
  id: string;
  label: string;
  value: string; // Código HEX del color
  textPreview: string; // Color de texto para contraste
  priceModifier: number; // Modificador de precio en pesos
}

export interface SizeOption {
  id: string;
  label: string;
  priceModifier: number; // Modificador de precio en pesos
}

export interface FontOption {
  id: string;
  label: string;
  value: string; // Nombre de la familia tipográfica
}

// Interfaces para datos de la API
export interface ApiColorDTO {
  id: string;
  nombre: string;
  codigoHex: string;
  modificadorPrecio?: number;
}

export interface ApiSizeDTO {
  id: string;
  nombre: string;
  modificadorPrecio?: number;
}

export interface ApiFontDTO {
  id: string;
  nombre: string;
  nombreFamilia?: string;
}
