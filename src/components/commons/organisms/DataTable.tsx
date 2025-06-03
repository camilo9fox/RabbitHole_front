import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import TableHeader from '../atoms/TableHeader';
import TableCell from '../atoms/TableCell';
import Pagination from '../molecules/Pagination';
import TableSearch from '../molecules/TableSearch';

export interface Column<T> {
  readonly header: string;
  readonly accessor: keyof T | ((item: T) => React.ReactNode);
  readonly className?: string;
  readonly id: string; // Identificador único para usar como key
}

// Eliminamos la interfaz TableCellProps ya que se importa de TableCell

interface DataTableProps<T> {
  readonly columns: Column<T>[];
  readonly data: T[];
  readonly itemsPerPage?: number;
  readonly keyExtractor: (item: T) => string | number;
  readonly actions?: (item: T) => React.ReactNode;
  readonly searchFields?: (keyof T)[];
  readonly filterOptions?: { value: string; label: string }[];
  readonly filterField?: keyof T;
  readonly className?: string;
}

function DataTable<T>({
  columns,
  data,
  itemsPerPage = 10,
  keyExtractor,
  actions,
  searchFields = [],
  filterOptions = [],
  filterField,
  className = ''
}: DataTableProps<T>) {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  
  // Estados para paginación, búsqueda y filtrado
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [filteredData, setFilteredData] = useState<T[]>(data);
  
  // Recalcular datos filtrados cuando cambian los datos originales, término de búsqueda o filtro
  useEffect(() => {
    let result = [...data] as T[];
    
    // Aplicar filtro si está activo
    if (activeFilter && filterField) {
      result = result.filter(item => {
        const fieldValue = String(item[filterField]);
        return fieldValue === activeFilter;
      });
    }
    
    // Aplicar búsqueda si hay término
    if (searchTerm && searchFields.length > 0) {
      const lowercasedSearch = searchTerm.toLowerCase();
      result = result.filter(item => 
        searchFields.some(field => {
          const fieldValue = String(item[field]).toLowerCase();
          return fieldValue.includes(lowercasedSearch);
        })
      );
    }
    
    setFilteredData(result);
    setCurrentPage(1); // Resetear a la primera página cuando cambian los filtros
  }, [data, searchTerm, activeFilter, filterField, searchFields]);
  
  // Calcular datos paginados
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  
  // Manejar cambio de página
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };
  
  // Manejar búsqueda
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };
  
  // Manejar cambio de filtro
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };
  
  return (
    <div className={`w-full overflow-hidden rounded-lg ${className}`}>
      {/* Buscador y filtros */}
      {(searchFields?.length > 0 || filterOptions?.length > 0) && (
        <div className="mb-4">
          <TableSearch
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
            filterOptions={filterOptions}
            placeholder="Buscar..."
          />
        </div>
      )}
      
      {/* Tabla */}
      <div className={`w-full overflow-x-auto rounded-lg border shadow-sm ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'}`}>
        <table className="w-full table-auto">
          <thead className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border-b`}>
            <tr>
              {columns.map((column) => (
                <TableHeader key={column.id}>
                  {column.header}
                </TableHeader>
              ))}
              {actions && <TableHeader className="text-center">Acciones</TableHeader>}
            </tr>
          </thead>
          <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {currentItems.length === 0 ? (
              <tr className={isDarkMode ? 'bg-gray-900' : 'bg-white'}>
                <TableCell colSpan={columns.length + (actions ? 1 : 0)}>
                  <div className={`text-center py-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    No se encontraron resultados
                  </div>
                </TableCell>
              </tr>
            ) : (
              currentItems.map((item, index) => (
                <tr 
                  key={keyExtractor ? keyExtractor(item) : index}
                  className={`${isDarkMode ? 'bg-gray-900 hover:bg-gray-800' : 'bg-white hover:bg-gray-50'} transition-colors`}
                >
                  {columns.map((column) => (
                    <TableCell 
                      key={column.id} 
                      className={column.className}
                    >
                      {typeof column.accessor === 'function'
                        ? column.accessor(item)
                        : String(item[column.accessor] ?? '')}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell className="text-center">
                      <div className="flex flex-wrap gap-2 justify-center items-center">
                        {actions(item)}
                      </div>
                    </TableCell>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Paginación */}
      {totalPages > 1 && (
        <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            className="py-2"
          />
        </div>
      )}
      
      {/* Información de paginación */}
      <div className={`px-4 py-2 text-xs border-t ${isDarkMode ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-gray-200'}`}>
        Mostrando {filteredData.length > 0 ? indexOfFirstItem + 1 : 0} a {
          Math.min(indexOfLastItem, filteredData.length)
        } de {filteredData.length} resultados
      </div>
    </div>
  );
}

export default DataTable;
