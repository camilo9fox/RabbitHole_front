'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ShopBanner from '@/components/commons/molecules/ShopBanner';
import ProductCatalog, { Product } from '@/components/commons/organisms/ProductCatalog';
import ProductFilters from '@/components/commons/molecules/ProductFilters';
import { useTheme } from 'next-themes';
import { getStoreProducts } from '@/services/adminProductService';
import { AdminProduct } from '@/types/product';

// Función para convertir un AdminProduct a Product
const adminProductToProduct = (adminProduct: AdminProduct): Product => {
  return {
    id: adminProduct.id,
    name: adminProduct.name,
    price: adminProduct.price,
    image: adminProduct.thumbnail ?? '/images/products/default.png',
    category: adminProduct.category
  };
};

export default function Shop() {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  
  // Estados para los productos y filtros
  const [products, setProducts] = useState<Product[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<{id: string; label: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Función para cargar productos
  const loadProducts = useCallback(() => {
    setIsLoading(true);
    
    try {
      // Obtener productos publicados en la tienda
      const adminProducts = getStoreProducts();
      
      // Convertir productos de administrador a formato de tienda
      const shopProducts = adminProducts.map(adminProductToProduct);
      
      // Calcular el rango de precios basado en los productos disponibles
      let minPrice = 0;
      let maxPrice = 100;
      
      if (shopProducts.length > 0) {
        const prices = shopProducts.map(p => p.price);
        minPrice = Math.floor(Math.min(...prices));
        maxPrice = Math.ceil(Math.max(...prices));
      }
      
      // Extraer categorías únicas de los productos
      const uniqueCategories = [...new Set(adminProducts.map(p => p.category))]
        .filter(category => category) 
        .sort((a, b) => a.localeCompare(b, 'es'))
        .map(category => ({
          id: category,
          label: category
        }));
      
      // Actualizar estados
      setProducts(shopProducts);
      setPriceRange([minPrice, maxPrice]);
      setCategoryOptions(uniqueCategories);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  

  // Crear un evento personalizado para comunicación entre páginas
  useEffect(() => {
    // Definir un evento personalizado para actualizar productos
    const customEvent = new Event('productUpdated');
    
    // Sobrescribir el método setItem de localStorage para detectar cambios en productos
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      // Llamar al método original
      originalSetItem.apply(this, [key, value]);
      
      // Si la clave está relacionada con productos, disparar evento
      if (key && (key.includes('product') || key.includes('Product'))) {
        console.log('Detectado cambio en localStorage para productos');
        window.dispatchEvent(customEvent);
      }
    };
    
    // Limpiar al desmontar
    return () => {
      localStorage.setItem = originalSetItem;
    };
  }, []);

  // Cargar productos cuando el componente se monta o cuando se navega a la página
  useEffect(() => {
    // Cargar productos inicialmente
    loadProducts();
    
    // Función para manejar cambios en localStorage
    const handleProductUpdated = () => {
      console.log('Evento productUpdated detectado, recargando productos...');
      loadProducts();
    };
    
    // Función para recargar productos al volver a la página
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Página visible, recargando productos...');
        loadProducts();
      }
    };
    
    // Agregar listeners
    window.addEventListener('productUpdated', handleProductUpdated);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('productUpdated', handleProductUpdated);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadProducts]);
  
  // Función para manejar cambios en las categorías seleccionadas (memoizada)
  const handleCategoryChange = useCallback((categoryId: string) => {
    setSelectedCategories(prev => {
      // Si ya está seleccionada, la quitamos
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      }
      // Si no está seleccionada, la añadimos
      return [...prev, categoryId];
    });
  }, []);
  
  // Función para manejar cambios en el rango de precios (memoizada)
  const handlePriceRangeChange = useCallback((range: [number, number]) => {
    setPriceRange(range);
  }, []);
  
  // Filtrar productos según los criterios seleccionados (memoizado)
  const filteredProducts = React.useMemo(() => {
    return products.filter(product => {
      // Filtrar por precio
      const priceInRange = product.price >= priceRange[0] && product.price <= priceRange[1];
      
      // Filtrar por categoría (si hay alguna seleccionada)
      const categoryMatch = selectedCategories.length === 0 || 
                            selectedCategories.includes(product.category);
      
      return priceInRange && categoryMatch;
    });
  }, [products, priceRange, selectedCategories]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-background text-foreground' : 'bg-white text-black'}`}>
      <ShopBanner 
        title="Nuestra Colección"
        subtitle="Explora nuestra selección de poleras personalizadas de alta calidad"
        backgroundImage="https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1200"
      />
      
      <div className="container mx-auto px-4 py-8">
        {isLoading && (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}
        
        {!isLoading && products.length === 0 && (
          <div className="flex flex-col justify-center items-center min-h-[400px] text-center">
            <div className="text-5xl mb-4">
              <i className="fas fa-box-open"></i>
            </div>
            <h2 className="text-2xl font-bold mb-2">No hay productos disponibles</h2>
            <p className="text-muted">Actualmente no hay productos publicados en la tienda.</p>
          </div>
        )}
        
        {!isLoading && products.length > 0 && (
          // Contenido principal cuando hay productos
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar con filtros */}
            <div className="lg:w-1/4">
              <div className={`sticky top-24 p-6 rounded-xl ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} shadow-sm`}>
                <h2 className="text-xl font-bold mb-6">Filtros</h2>
                
                {/* Filtros de productos */}
                <ProductFilters
                  title="Filtros"
                  priceRange={priceRange}
                  onPriceRangeChange={handlePriceRangeChange}
                  categories={categoryOptions}
                  selectedCategories={selectedCategories}
                  onCategoryChange={handleCategoryChange}
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
        )}
      </div>
    </div>
  );
}
