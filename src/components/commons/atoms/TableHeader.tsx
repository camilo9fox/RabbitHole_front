import React from 'react';
import { useTheme } from 'next-themes';

interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

const TableHeader: React.FC<TableHeaderProps> = ({ children, className = '' }) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  
  // Extraer las clases de alineación de texto del className para evitar conflictos
  const hasTextAlignment = /text-(left|center|right)/.test(className);
  
  return (
    <th 
      className={`px-4 py-3 ${!hasTextAlignment ? 'text-left' : ''} text-xs font-medium uppercase tracking-wider ${
        isDarkMode 
          ? 'bg-gray-800 text-gray-300 border-b border-gray-700' 
          : 'bg-gray-50 text-gray-700 border-b border-gray-200'
      } ${className}`}
    >
      {children}
    </th>
  );
};

export default TableHeader;
