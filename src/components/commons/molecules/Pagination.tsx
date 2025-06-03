import React from 'react';
import { useTheme } from 'next-themes';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = ''
}) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  
  // Generar array de páginas a mostrar
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Si hay pocas páginas, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Mostrar un subconjunto de páginas
      if (currentPage <= 3) {
        // Cerca del inicio
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        // Cerca del final
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // En medio
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }
    
    return pages;
  };
  
  const pageNumbers = getPageNumbers();
  
  // Estilos base
  const baseButtonClass = `px-3 py-1 mx-1 rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150 ease-in-out`;
  
  // Estilos para botón activo e inactivo
  const activeButtonClass = isDarkMode
    ? `${baseButtonClass} bg-blue-600 text-white`
    : `${baseButtonClass} bg-blue-600 text-white`;
    
  const inactiveButtonClass = isDarkMode
    ? `${baseButtonClass} bg-gray-700 text-gray-300 hover:bg-gray-600`
    : `${baseButtonClass} bg-gray-200 text-gray-700 hover:bg-gray-300`;
  
  const disabledButtonClass = isDarkMode
    ? `${baseButtonClass} bg-gray-800 text-gray-600 cursor-not-allowed opacity-50`
    : `${baseButtonClass} bg-gray-100 text-gray-400 cursor-not-allowed opacity-50`;
  
  return (
    <div className={`flex items-center justify-center my-4 ${className}`}>
      {/* Botón Anterior */}
      <button
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={currentPage === 1 ? disabledButtonClass : inactiveButtonClass}
        aria-label="Página anterior"
      >
        &laquo;
      </button>
      
      {/* Números de página */}
      {pageNumbers.map(number => (
        <button
          key={number}
          onClick={() => onPageChange(number)}
          className={currentPage === number ? activeButtonClass : inactiveButtonClass}
          aria-label={`Página ${number}`}
          aria-current={currentPage === number ? 'page' : undefined}
        >
          {number}
        </button>
      ))}
      
      {/* Botón Siguiente */}
      <button
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={currentPage === totalPages ? disabledButtonClass : inactiveButtonClass}
        aria-label="Página siguiente"
      >
        &raquo;
      </button>
    </div>
  );
};

export default Pagination;
