import React from 'react';
import { useTheme } from 'next-themes';

interface StatusCellProps {
  inStock?: boolean;
}

const StatusCell: React.FC<StatusCellProps> = ({ inStock }) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  
  // Determinar las clases de color basadas en el estado y el tema
  let textColorClass = '';
  
  if (inStock) {
    textColorClass = isDarkMode ? 'text-green-400' : 'text-green-600';
  } else {
    textColorClass = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  }
    
  return (
    <div className="flex items-center">
      <div className={`w-3 h-3 rounded-full mr-2 ${inStock ? 'bg-green-500' : 'bg-gray-400'}`}></div>
      <span className={textColorClass}>
        {inStock ? 'Publicado' : 'Borrador'}
      </span>
    </div>
  );
};

export default StatusCell;
