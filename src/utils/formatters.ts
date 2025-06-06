"use client";

/**
 * Formatea una fecha en formato legible en español
 * @param date Fecha a formatear
 * @returns Fecha formateada en formato dd/mm/yyyy
 */
export const formatDate = (date: Date | string | undefined): string => {
  if (!date) {
    return 'Fecha no disponible';
  }
  
  try {
    // Si es string, convertir a Date
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Verificar si la fecha es válida
    if (isNaN(dateObj.getTime())) {
      console.error('Fecha inválida:', date);
      return 'Fecha inválida';
    }
    
    return new Intl.DateTimeFormat('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(dateObj);
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return 'Error en fecha';
  }
};

/**
 * Formatea una fecha con hora en formato legible en español
 * @param date Fecha a formatear
 * @returns Fecha y hora formateada
 */
export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Formatea un precio en formato CLP
 * @param price Precio a formatear
 * @returns Precio formateado con separador de miles
 */
export const formatPrice = (price: number): string => {
  return price.toLocaleString('es-CL');
};
