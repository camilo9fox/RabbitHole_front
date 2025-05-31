'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import Image from '@/components/commons/atoms/Image';
import Link from 'next/link';

interface SimpleHeroProps {
  className?: string;
}

const SimpleHero = ({ className = '' }: SimpleHeroProps) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!heroRef.current || !textRef.current || !imageRef.current) return;
    
    // No necesitamos verificar si gsap está disponible, ya que es una importación estática
    
    // Crear una nueva timeline
    const tl = gsap.timeline({ paused: true });
    
    // Seleccionar elementos de manera segura
    const animateItems = textRef.current.querySelectorAll('.animate-item');
    const btnItems = heroRef.current.querySelectorAll('.btn');
    
    if (animateItems.length > 0) {
      // Animación del texto
      tl.fromTo(
        animateItems,
        { y: 50, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          stagger: 0.2,
          duration: 0.8,
          ease: "power2.out"
        }
      );
    }
    
    // Animación de la imagen
    tl.fromTo(
      imageRef.current,
      { opacity: 0 },
      { 
        opacity: 1, 
        duration: 1,
        ease: "power2.out"
      },
      0.3
    );
    
    if (btnItems.length > 0) {
      // Animación de los botones
      tl.fromTo(
        btnItems,
        { y: 20, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          stagger: 0.2,
          duration: 0.5,
          ease: "back.out(1.7)"
        },
        0.8
      );
    }
    
    // Iniciar la animación
    tl.play();
    
    return () => {
      // Limpiar la animación cuando el componente se desmonte
      tl.kill();
    };
  }, []);
  
  return (
    <section className={`relative min-h-screen flex items-center justify-center overflow-hidden ${className}`} ref={heroRef}>
      <div ref={imageRef} className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=1920"
          alt="Poleras personalizadas"
          width={1920}
          height={1080}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black z-10"></div>
      </div>
      
      {/* Contenido */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="text-center md:text-left" ref={textRef}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 animate-item">
              Diseña tu <span className="text-accent">Polera</span> <br />
              <span className="text-accent">Personalizada</span> Única
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-xl animate-item">
              Crea diseños exclusivos, elige entre cientos de opciones y recibe tu polera en tiempo récord. ¡Tu imaginación es el límite!
            </p>
            
            <div className="animate-item flex flex-wrap gap-4">
              <Link 
                href="/customize" 
                className="px-8 py-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center btn"
              >
                <span>Comenzar a Diseñar</span>
                <svg className="ml-2 w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link 
                href="/shop" 
                className="px-8 py-4 border-2 border-white/30 text-white rounded-lg font-medium hover:border-white/80 transition-colors duration-200 btn"
              >
                Ver Tienda
              </Link>
            </div>
          </div>
          
          <div className="lg:w-1/2 relative">
            <div className="relative w-full h-[400px] sm:h-[500px]">
              <Image
                src="https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800"
                alt="Polera personalizada"
                width={800}
                height={800}
                className="rounded-lg shadow-2xl object-cover"
              />
              
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-lg shadow-lg border-2 border-blue-600">
                <div className="text-2xl font-bold text-blue-600">100% Personalizable</div>
                <div className="text-sm text-black">Diseños únicos para ti</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SimpleHero;
