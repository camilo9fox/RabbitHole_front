'use client';

import React, { useState } from 'react';
import ShopBanner from '@/components/commons/molecules/ShopBanner';
import ProductCatalog, { Product } from '@/components/commons/organisms/ProductCatalog';
import ProductFilters from '@/components/commons/molecules/ProductFilters';
import { useTheme } from 'next-themes';

// Datos de ejemplo para los productos
const mockProducts: Product[] = [
  {
    id: 'tshirt-1',
    name: 'Urban Explorer',
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600',
    price: 24.99,
    category: 'Urbano',
    rating: 4.5
  },
  {
    id: 'tshirt-2',
    name: 'Minimal White',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
    price: 22.99,
    category: 'Minimalista',
    rating: 4.2
  },
  {
    id: 'tshirt-3',
    name: 'Nature Vibes',
    image: 'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=600',
    price: 26.99,
    category: 'Naturaleza',
    rating: 4.7
  },
  {
    id: 'tshirt-4',
    name: 'Geometric Art',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600',
    price: 25.99,
    category: 'Geométrico',
    rating: 4.3
  },
  {
    id: 'tshirt-5',
    name: 'Vintage Style',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600',
    price: 27.99,
    category: 'Vintage',
    rating: 4.6
  },
  {
    id: 'tshirt-6',
    name: 'Typography Bold',
    image: 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=600',
    price: 23.99,
    category: 'Tipografía',
    rating: 4.1
  },
  {
    id: 'tshirt-7',
    name: 'Abstract Dreams',
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600',
    price: 29.99,
    category: 'Abstracto',
    rating: 4.8
  },
  {
    id: 'tshirt-8',
    name: 'Retro Wave',
    image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600',
    price: 28.99,
    category: 'Retro',
    rating: 4.4
  }
];

// Categorías para los filtros
const categoryOptions = [
  { id: 'Urbano', label: 'Urbano' },
  { id: 'Minimalista', label: 'Minimalista' },
  { id: 'Naturaleza', label: 'Naturaleza' },
  { id: 'Geométrico', label: 'Geométrico' },
  { id: 'Vintage', label: 'Vintage' },
  { id: 'Tipografía', label: 'Tipografía' },
  { id: 'Abstracto', label: 'Abstracto' },
  { id: 'Retro', label: 'Retro' }
];

// Tallas disponibles
const sizeOptions = [
  { id: 'S', label: 'S' },
  { id: 'M', label: 'M' },
  { id: 'L', label: 'L' },
  { id: 'XL', label: 'XL' }
];

export default function Shop() {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  
  // Estados para los filtros
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  
  // Función para manejar cambios en las categorías seleccionadas
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };
  
  // Función para manejar cambios en las tallas seleccionadas
  const handleSizeChange = (sizeId: string) => {
    setSelectedSizes(prev => 
      prev.includes(sizeId)
        ? prev.filter(id => id !== sizeId)
        : [...prev, sizeId]
    );
  };
  
  // Filtrar productos según los filtros aplicados
  const filteredProducts = mockProducts.filter(product => {
    // Filtro por precio
    if (product.price < priceRange[0] || product.price > priceRange[1]) {
      return false;
    }
    
    // Filtro por categoría
    if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
      return false;
    }
    
    // Aquí se podrían agregar más filtros si es necesario
    
    return true;
  });

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-background text-foreground' : 'bg-white text-black'}`}>
      {/* Banner de la tienda */}
      <ShopBanner 
        title="Nuestra Colección"
        subtitle="Explora nuestra selección de poleras personalizadas de alta calidad"
        backgroundImage="https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1200"
      />
      
      {/* Contenido principal */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar con filtros */}
          <div className="lg:w-1/4">
            <div className="sticky top-24">
              <ProductFilters 
                priceRange={priceRange}
                onPriceRangeChange={setPriceRange}
                categories={categoryOptions}
                selectedCategories={selectedCategories}
                onCategoryChange={handleCategoryChange}
                sizes={sizeOptions}
                selectedSizes={selectedSizes}
                onSizeChange={handleSizeChange}
              />
              
              {/* Banner promocional */}
              <div className={`mt-8 p-6 rounded-xl overflow-hidden relative ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-accent/10 -mr-10 -mt-10 blur-2xl"></div>
                <h3 className="text-lg font-bold mb-2 relative z-10">¿Diseño personalizado?</h3>
                <p className="text-sm text-muted mb-4 relative z-10">Crea tu diseño único con nuestro editor interactivo</p>
                <button className={`w-full py-2 px-4 bg-accent ${isDarkMode ? 'text-white' : 'text-black'} rounded-lg font-medium hover:bg-accent/90 transition-colors`}>
                  Crear diseño
                </button>
              </div>
            </div>
          </div>
          
          {/* Catálogo de productos */}
          <div className="lg:w-3/4">
            <ProductCatalog 
              title="Poleras Personalizadas"
              subtitle="Encuentra el diseño perfecto para expresar tu estilo único"
              products={filteredProducts}
            />
            
            {/* Sección de información adicional */}
            <div className={`mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <div className="flex flex-col items-center text-center p-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2">Materiales premium</h3>
                <p className="text-sm">Utilizamos solo algodón de alta calidad para garantizar comodidad y durabilidad.</p>
              </div>
              
              <div className="flex flex-col items-center text-center p-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2">Impresión de calidad</h3>
                <p className="text-sm">Técnicas de impresión avanzadas que garantizan que tus diseños permanezcan intactos.</p>
              </div>
              
              <div className="flex flex-col items-center text-center p-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2">Envío rápido</h3>
                <p className="text-sm">Entrega en 2-5 días hábiles. Seguimiento en tiempo real para todos tus pedidos.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
