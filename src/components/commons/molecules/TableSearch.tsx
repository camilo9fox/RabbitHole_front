import React, { useState } from 'react';
import { useTheme } from 'next-themes';

interface TableSearchProps {
  onSearch: (searchTerm: string) => void;
  onFilterChange?: (filter: string) => void;
  filterOptions?: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
}

const TableSearch: React.FC<TableSearchProps> = ({
  onSearch,
  onFilterChange,
  filterOptions = [],
  placeholder = 'Buscar...',
  className = ''
}) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onFilterChange) {
      onFilterChange(e.target.value);
    }
  };
  
  const inputClass = isDarkMode
    ? 'bg-gray-800 text-white border-gray-700 focus:border-blue-500 focus:ring-blue-500'
    : 'bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500';
    
  const selectClass = isDarkMode
    ? 'bg-gray-800 text-white border-gray-700 focus:border-blue-500 focus:ring-blue-500'
    : 'bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500';
  
  return (
    <div className={`flex flex-col sm:flex-row gap-2 ${className}`}>
      <div className="relative flex-grow">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg 
            className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} 
            aria-hidden="true" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 20 20"
          >
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
          </svg>
        </div>
        <input
          type="search"
          value={searchTerm}
          onChange={handleSearch}
          className={`w-full p-2 pl-10 text-sm rounded-lg border ${inputClass}`}
          placeholder={placeholder}
        />
      </div>
      
      {filterOptions.length > 0 && (
        <div className="sm:w-1/3 md:w-1/4">
          <select
            onChange={handleFilterChange}
            className={`w-full p-2 text-sm rounded-lg border ${selectClass}`}
          >
            <option value="">Todos</option>
            {filterOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default TableSearch;
