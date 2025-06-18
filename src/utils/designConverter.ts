import { AngleDesign } from '@/types/product';
import { AnguloDTO } from '@/types/personalizedDesign';

/**
 * Convierte un diseño de ángulo desde el formato del customizador al formato DTO para el backend
 * @param angleDesign Diseño del ángulo en formato del customizador
 * @param viewType Tipo de vista ('front', 'back', 'left', 'right')
 * @returns Objeto AnguloDTO listo para ser enviado al backend
 */
export const convertAngleDesignToDTO = (angleDesign: AngleDesign, viewType: string): AnguloDTO => {
  // Determinar el tipo de ángulo según la vista
  let tipoAnguloId;
  switch (viewType) {
    case 'front': tipoAnguloId = 1; break;
    case 'back': tipoAnguloId = 2; break;
    case 'left': tipoAnguloId = 3; break;
    case 'right': tipoAnguloId = 4; break;
    default: tipoAnguloId = 1;
  }
  
  // Generar thumbnail como base64 a partir del canvas si está disponible
  const thumbnailBase64: string | undefined = angleDesign.thumbnail;
  // El thumbnail se generará en el componente principal
  
  // Crear el objeto AnguloDTO
  const anguloDTO: AnguloDTO = {
    tipoAnguloId,
    nombreAngulo: viewType,
    elemento: {
      tipo: angleDesign.text ? 'TEXTO' : 'IMAGEN',
      propiedadesDiseno: {
        posicionX: angleDesign.text ? angleDesign.text.position.x : angleDesign.image?.position.x || 0,
        posicionY: angleDesign.text ? angleDesign.text.position.y : angleDesign.image?.position.y || 0,
        anchura: angleDesign.image?.size.width,
        altura: angleDesign.image?.size.height
      },
      propiedadesElemento: {}
    }
  };
  
  // Si hemos generado un thumbnail, lo añadimos al DTO
  if (thumbnailBase64) {
    anguloDTO.thumbnailBase64 = thumbnailBase64;
  }
  
  // Agregar propiedades específicas según el tipo de elemento
  if (angleDesign.text) {
    anguloDTO.elemento.propiedadesElemento = {
      texto: angleDesign.text.content,
      fuenteId: Number(angleDesign.text.font), // ID de la fuente seleccionada (debe mapearse)
      colorId: angleDesign.text.color.replace('#', ''),
      tamano: angleDesign.text.size
    };
  } else if (angleDesign.image) {
    anguloDTO.elemento.propiedadesElemento = {
      url: angleDesign.image.src
    };
  }
  
  return anguloDTO;
};
