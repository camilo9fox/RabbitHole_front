'use client';

import React, { useState } from 'react';
import Text from '@/components/commons/atoms/Text';
import { useTheme } from 'next-themes';

interface FilterOption {
  id: string;
  label: string;
}

interface ProductFiltersProps {
  title?: string;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  categories: FilterOption[];
  selectedCategories: string[];
  onCategoryChange: (categoryId: string) => void;
  sizes?: FilterOption[];
  selectedSizes?: string[];
  onSizeChange?: (sizeId: string) => void;
  className?: string;
}

const ProductFilters = ({
  title = 'Filtros',
  priceRange,
  onPriceRangeChange,
  categories,
  selectedCategories,
  onCategoryChange,
  sizes,
  selectedSizes = [],
  onSizeChange,
  className = ''
}: ProductFiltersProps) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';

  // Estados locales para controlar los inputs de precio
  const [minPrice, setMinPrice] = useState<number>(priceRange[0]);
  const [maxPrice, setMaxPrice] = useState<number>(priceRange[1]);

  // Manejadores de eventos para cambios de precio
  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10) ?? 0;
    setMinPrice(value);
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10) ?? 0;
    setMaxPrice(value);
  };

  // Aplicar cambios de precio cuando el usuario termina de editar
  const handlePriceApply = () => {
    if (minPrice <= maxPrice) {
      onPriceRangeChange([minPrice, maxPrice]);
    } else {
      // Si el mínimo es mayor que el máximo, revertimos a los valores del prop
      setMinPrice(priceRange[0]);
      setMaxPrice(priceRange[1]);
    }
  };

  // Manejar cambio de categoría
  const handleCategoryToggle = (categoryId: string) => {
    onCategoryChange(categoryId);
  };

  // Manejar cambio de talla
  const handleSizeToggle = (sizeId: string) => {
    if (onSizeChange) {
      onSizeChange(sizeId);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Título del filtro */}
      <div className="mb-6">
        <Text variant="h3" className="text-lg font-bold text-foreground">
          {title}
        </Text>
      </div>

      {/* Filtro de precio */}
      <div className="mb-8">
        <Text variant="body" className="font-medium text-foreground mb-3 flex items-center">
          <svg className="w-4 h-4 mr-2 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Precio
        </Text>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Text variant="small" className="text-xs text-muted mb-1">Mínimo</Text>
            <input
              type="number"
              min={0}
              value={minPrice}
              onChange={handleMinPriceChange}
              onBlur={handlePriceApply}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
              style={{
                backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb',
                color: isDarkMode ? '#ffffff' : '#1f2937',
                borderColor: isDarkMode ? '#374151' : '#e5e7eb'
              }}
            />
          </div>
          <div>
            <Text variant="small" className="text-xs text-muted mb-1">Máximo</Text>
            <input
              type="number"
              min={0}
              value={maxPrice}
              onChange={handleMaxPriceChange}
              onBlur={handlePriceApply}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
              style={{
                backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb',
                color: isDarkMode ? '#ffffff' : '#1f2937',
                borderColor: isDarkMode ? '#374151' : '#e5e7eb'
              }}
            />
          </div>
        </div>
      </div>

      {/* Filtro de categorías */}
      <div className="mb-8">
        <Text variant="body" className="font-medium text-foreground mb-3 flex items-center">
          <svg className="w-4 h-4 mr-2 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          Categorías
        </Text>
        <div className="space-y-3">
          {categories.map(category => {
            const isSelected = selectedCategories.includes(category.id);
            return (
              <div key={category.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`category-${category.id}`}
                  checked={isSelected}
                  onChange={() => handleCategoryToggle(category.id)}
                  className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
                />
                <label htmlFor={`category-${category.id}`} className="ml-2 block text-sm text-foreground">
                  {category.label}
                </label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filtro de tallas (opcional) */}
      {sizes && onSizeChange && (
        <div>
          <Text variant="body" className="font-medium text-foreground mb-3 flex items-center">
            <svg className="w-4 h-4 mr-2 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
            Tallas
          </Text>
          <div className="flex flex-wrap gap-3 mt-3">
            {sizes.map(size => {
              const isSelected = selectedSizes.includes(size.id);

              // Determinar el estilo del botón según el tema y estado
              let buttonStyle = "w-12 h-12 flex items-center justify-center rounded-lg border-2 font-medium transition-all duration-200 transform hover:scale-105";
              if (isSelected) {
                // Usar el mismo color de fondo para el botón seleccionado en ambos temas
                buttonStyle += " bg-accent border-accent";
              } else {
                // Mejorar el contraste en modo claro
                buttonStyle += isDarkMode ? " bg-gray-800 border-gray-700" : " bg-gray-50 border-gray-500";
              }

              // Determinar el estilo del texto según el tema y estado
              let textStyle = "";
              if (isSelected) {
                // Asegurar que el texto sea visible en ambos modos cuando está seleccionado
                textStyle = `${isDarkMode ? "text-white" : "text-gray-800"} font-bold`;
              } else {
                // Mejorar el contraste en modo claro
                textStyle = isDarkMode ? "text-gray-200" : "text-gray-800";
              }

              return (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => handleSizeToggle(size.id)}
                  className={buttonStyle}
                >
                  <span className={textStyle}>
                    {size.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFilters;
