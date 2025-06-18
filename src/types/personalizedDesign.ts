
export interface DisenoPersonalizadoDTO {
    id?: number
    usuarioId: number
    detalle: string
    colorId: string
    tallaId: string
    precio: number
    estadoId: number
    creadoPorAdmin: boolean
    angulos: AnguloDTO[]
    creadoEn?: number[]
    actualizadoEn?: number[]
  }
  
export interface AnguloDTO {
    id?: number
    tipoAnguloId: number
    nombreAngulo?: string
    thumbnailUrl?: string
    thumbnailBase64?: string
    elemento: ElementoDTO
  }
  
  export interface ElementoDTO {
    tipo: string
    propiedadesDiseno: PropiedadesDisenoDTO
    propiedadesElemento: PropiedadesElementoDTO
  }
  
  export interface PropiedadesDisenoDTO{
    posicionX: number
    posicionY: number
    anchura?: number
    altura?: number
    rotacion?: number
    profundidad?: number
  }
  
  export interface PropiedadesElementoDTO {
    id?: number
    texto?: string
    fuenteId?: number
    colorId?: string
    tamano?: number
    cloudinaryId?: string
    url?: string
    publicId?: string
    urlImagen?: string
  }

  
  