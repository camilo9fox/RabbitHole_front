'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ProductCard } from '@/components/commons/molecules/ProductCard';
import Text from '@/components/commons/atoms/Text';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTheme } from 'next-themes';

export interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  category: string;
  rating?: number;
}

interface ProductCatalogProps {
  title: string;
  subtitle?: string;
  products: Product[];
  className?: string;
}

// Función auxiliar para obtener el estilo del botón de filtro según el tema
const getFilterButtonStyle = (isDark: boolean): string => {
  return isDark 
    ? 'bg-gray-800/50 text-foreground hover:bg-accent/20 border border-gray-700'
    : 'bg-gray-100 text-foreground hover:bg-accent/10 border border-gray-200';
};

const ProductCatalog = ({ title, subtitle, products, className = '' }: ProductCatalogProps) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Referencias para animaciones
  const titleRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);
  const productRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Extraer categorías únicas
  const categories = ['all', ...Array.from(new Set(products.map(product => product.category)))];
  
  // Filtrar productos por categoría
  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  const handleAddToCart = (productId: string) => {
    console.log(`Producto agregado al carrito: ${productId}`);
    // Aquí iría la lógica para agregar al carrito
    
    // Animación al agregar al carrito
    gsap.to('.cart-icon', {
      scale: 1.2,
      duration: 0.3,
      yoyo: true,
      repeat: 1,
      ease: 'back.out'
    });
  };
  
  // Inicializar animaciones
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    setIsLoaded(true);
    
    // Animación del título
    gsap.fromTo(titleRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.2 }
    );
    
    // Animación de los filtros
    gsap.fromTo(filtersRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.5 }
    );
    
    // Animación de los productos con stagger
    if (productRefs.current.length > 0) {
      gsap.fromTo(productRefs.current,
        { y: 40, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.8, 
          stagger: 0.1, 
          ease: 'power2.out',
          delay: 0.7
        }
      );
    }
    
    // Efecto de scroll para productos
    ScrollTrigger.batch(productRefs.current, {
      onEnter: batch => {
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          stagger: 0.1,
          duration: 0.6,
          ease: 'power2.out'
        });
      },
      once: true
    });
    
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);
  
  // Actualizar referencias cuando cambia la categoría
  useEffect(() => {
    productRefs.current = productRefs.current.slice(0, filteredProducts.length);
    
    if (isLoaded && productRefs.current.length > 0) {
      // Animación al cambiar de categoría
      gsap.fromTo(productRefs.current,
        { scale: 0.95, opacity: 0 },
        { 
          scale: 1, 
          opacity: 1, 
          duration: 0.5, 
          stagger: 0.05, 
          ease: 'power2.out' 
        }
      );
    }
  }, [selectedCategory, filteredProducts.length, isLoaded]);

  return (
    <section className={`py-16 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={titleRef} className="text-center mb-16">
          <div className="inline-block relative">
            <Text variant="h2" className="text-4xl md:text-5xl font-bold text-foreground mb-4 relative z-10">
              {title}
            </Text>
            {/* Elemento decorativo detrás del título */}
            <div className="absolute -bottom-3 left-0 right-0 h-3 bg-accent/30 transform -rotate-1 z-0"></div>
          </div>
          
          {subtitle && (
            <Text variant="body" className="text-xl text-muted max-w-3xl mx-auto mt-6">
              {subtitle}
            </Text>
          )}
        </div>
        
        {/* Filtro de categorías */}
        <div ref={filtersRef} className="flex justify-center mb-12 flex-wrap gap-3">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                selectedCategory === category
                  ? 'bg-accent text-primary shadow-lg shadow-accent/20'
                  : getFilterButtonStyle(isDarkMode)
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
        
        {/* Grid de productos */}
        <div ref={productsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product, index) => (
            <div 
              key={product.id} 
              ref={(el: HTMLDivElement | null) => {
                if (el) productRefs.current[index] = el;
              }}
              className="transform transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1"
            >
              <ProductCard
                id={product.id}
                image={product.image}
                title={product.name}
                price={product.price}
                category={product.category}
                width={600}
                height={800}
                onAddToCart={() => handleAddToCart(product.id)}
              />
            </div>
          ))}
        </div>
        
        {/* Mensaje si no hay productos */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16 px-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-muted opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <Text variant="h3" className="text-xl text-muted mb-2">
              No hay productos disponibles en esta categoría.
            </Text>
            <Text variant="body" className="text-muted/70">
              Prueba con otra categoría o vuelve más tarde.
            </Text>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductCatalog;
