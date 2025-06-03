import React from 'react';
import { useTheme } from 'next-themes';

interface DescriptionCellProps {
  description?: string;
}

const DescriptionCell: React.FC<DescriptionCellProps> = ({ description }) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  
  const textClass = isDarkMode ? 'text-gray-300' : 'text-gray-700';
  const emptyTextClass = isDarkMode ? 'text-gray-500' : 'text-gray-400';
  
  return (
    <div className={`line-clamp-2 max-w-xs ${textClass}`}>
      {description ?? <span className={emptyTextClass}>Sin descripción</span>}
    </div>
  );
};

export default DescriptionCell;
