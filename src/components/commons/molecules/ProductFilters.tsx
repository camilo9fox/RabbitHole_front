'use client';

import React, { useEffect, useRef } from 'react';
import Text from '@/components/commons/atoms/Text';
import Input from '@/components/commons/atoms/Input';
import Checkbox from '@/components/commons/atoms/Checkbox';
import gsap from 'gsap';
import { useTheme } from 'next-themes';
import { useForm, FormProvider } from 'react-hook-form';

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

interface FilterFormValues {
  minPrice: number;
  maxPrice: number;
  categories: Record<string, boolean>;
  sizes: Record<string, boolean>;
}

// Función para convertir un array de IDs seleccionados a un objeto de valores booleanos
const selectedArrayToFormValues = (selectedIds: string[], options: FilterOption[]): Record<string, boolean> => {
  const result: Record<string, boolean> = {};
  
  // Inicializar todos como false
  options.forEach(option => {
    result[option.id] = false;
  });
  
  // Marcar los seleccionados como true
  selectedIds.forEach(id => {
    result[id] = true;
  });
  
  return result;
};

// Función para convertir de vuelta a un array de IDs seleccionados
const formValuesToSelectedArray = (formValues: Record<string, boolean>): string[] => {
  return Object.entries(formValues)
    .filter(([, isSelected]) => isSelected)
    .map(([id]) => id);
};

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
  
  // Referencias para animaciones
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const sizesRef = useRef<HTMLDivElement>(null);
  
  // Configurar react-hook-form
  const methods = useForm<FilterFormValues>({
    defaultValues: {
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      categories: selectedArrayToFormValues(selectedCategories, categories),
      sizes: sizes ? selectedArrayToFormValues(selectedSizes, sizes) : {}
    }
  });
  
  const { control, watch } = methods;
  
  // Observar cambios en los valores del formulario
  const formValues = watch();
  
  // Efecto para actualizar los filtros cuando cambian los valores del formulario
  useEffect(() => {
    // Actualizar rango de precios
    const newMinPrice = formValues.minPrice;
    const newMaxPrice = formValues.maxPrice;
    
    if (newMinPrice !== priceRange[0] || newMaxPrice !== priceRange[1]) {
      onPriceRangeChange([newMinPrice, newMaxPrice]);
    }
    
    // Actualizar categorías seleccionadas
    const newSelectedCategories = formValuesToSelectedArray(formValues.categories);
    if (JSON.stringify(newSelectedCategories) !== JSON.stringify(selectedCategories)) {
      // Actualizar categorías una por una para mantener la funcionalidad original
      const added = newSelectedCategories.filter(id => !selectedCategories.includes(id));
      const removed = selectedCategories.filter(id => !newSelectedCategories.includes(id));
      
      added.forEach(id => onCategoryChange(id));
      removed.forEach(id => onCategoryChange(id));
    }
    
    // Actualizar tallas seleccionadas
    if (sizes && onSizeChange) {
      const newSelectedSizes = formValuesToSelectedArray(formValues.sizes);
      if (JSON.stringify(newSelectedSizes) !== JSON.stringify(selectedSizes)) {
        // Actualizar tallas una por una para mantener la funcionalidad original
        const added = newSelectedSizes.filter(id => !selectedSizes.includes(id));
        const removed = selectedSizes.filter(id => !newSelectedSizes.includes(id));
        
        added.forEach(id => onSizeChange(id));
        removed.forEach(id => onSizeChange(id));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValues]);
  
  // Actualizar valores del formulario cuando cambian las props
  useEffect(() => {
    methods.reset({
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      categories: selectedArrayToFormValues(selectedCategories, categories),
      sizes: sizes ? selectedArrayToFormValues(selectedSizes, sizes) : {}
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceRange, selectedCategories, selectedSizes]);
  
  // Inicializar animaciones
  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.3 });
    
    // Animación del contenedor
    tl.fromTo(containerRef.current,
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' }
    );
    
    // Animación del título
    tl.fromTo(titleRef.current,
      { y: -10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' },
      '-=0.3'
    );
    
    // Animación de las secciones
    const sections = [priceRef.current, categoriesRef.current, sizesRef.current].filter(Boolean);
    
    tl.fromTo(sections,
      { y: 15, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        duration: 0.5, 
        stagger: 0.1, 
        ease: 'power2.out' 
      },
      '-=0.2'
    );
    
    return () => {
      tl.kill();
    };
  }, []);
  
  return (
    <FormProvider {...methods}>
      <div 
        ref={containerRef}
        className={`p-6 ${isDarkMode ? 'bg-gray-900/50' : 'bg-white'} border ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} rounded-xl shadow-lg ${className}`}
      >
        <div ref={titleRef} className="mb-6 flex items-center">
          <div className="w-1 h-6 bg-accent rounded-full mr-3"></div>
          <Text variant="h3" className="text-lg font-semibold text-foreground">
            {title}
          </Text>
        </div>
        
        {/* Filtro de precio */}
        <div ref={priceRef} className="mb-8">
          <Text variant="body" className="font-medium text-foreground mb-3 flex items-center">
            <svg className="w-4 h-4 mr-2 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Precio
          </Text>
          <div className="flex items-center space-x-3">
            <div className="relative flex-1">
              <Input
                name="minPrice"
                control={control}
                type="number"
                placeholder="Min"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
                style={{
                  backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb',
                  color: isDarkMode ? '#ffffff' : '#1f2937',
                  borderColor: isDarkMode ? '#374151' : '#e5e7eb'
                }}
              />
            </div>
            <span className="text-muted font-medium">-</span>
            <div className="relative flex-1">
              <Input
                name="maxPrice"
                control={control}
                type="number"
                placeholder="Max"
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
        <div ref={categoriesRef} className="mb-8">
          <Text variant="body" className="font-medium text-foreground mb-3 flex items-center">
            <svg className="w-4 h-4 mr-2 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Categorías
          </Text>
          <div className="space-y-3">
            {categories.map(category => (
              <Checkbox
                key={category.id}
                name={`categories.${category.id}`}
                control={control}
                label={category.label}
                className="w-full"
              />
            ))}
          </div>
        </div>
        
        {/* Filtro de tallas (opcional) */}
        {sizes && onSizeChange && (
          <div ref={sizesRef}>
            <Text variant="body" className="font-medium text-foreground mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
              Tallas
            </Text>
            <div className="flex flex-wrap gap-3 mt-3">
              {sizes.map(size => {
                const fieldName = `sizes.${size.id}` as const;
                const isSelected = watch(fieldName);
                
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
                  textStyle =  `${isDarkMode ? "text-white" : "text-gray-800"} font-bold` ;
                } else {
                  // Mejorar el contraste en modo claro
                  textStyle = isDarkMode ? "text-gray-200" : "text-gray-800";
                }
                
                return (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => {
                      methods.setValue(fieldName, !isSelected);
                    }}
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
    </FormProvider>
  );
};

export default ProductFilters;
