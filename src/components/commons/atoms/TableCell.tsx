import React from 'react';
import { useTheme } from 'next-themes';

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
}

const TableCell: React.FC<TableCellProps> = ({ children, className = '', colSpan }) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  
  return (
    <td 
      className={`px-4 py-4 text-sm ${
        isDarkMode 
          ? 'text-gray-300 border-gray-700' 
          : 'text-gray-700 border-gray-200'
      } ${className}`}
      colSpan={colSpan}
    >
      {children}
    </td>
  );
};

export default TableCell;
