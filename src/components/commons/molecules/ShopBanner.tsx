'use client';

import React, { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface ShopBannerProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  className?: string;
}

const ShopBanner = ({
  title,
  subtitle,
  backgroundImage = 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  className = ''
}: ShopBannerProps) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  
  const bannerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Registrar ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);
    
    // Animación del banner
    const tl = gsap.timeline();
    
    tl.fromTo(bannerRef.current,
      { opacity: 0, scale: 1.05 },
      { opacity: 1, scale: 1, duration: 1, ease: 'power2.out' }
    );
    
    // Animación del título
    tl.fromTo(titleRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'back.out(1.7)' },
      '-=0.5'
    );
    
    // Animación del subtítulo
    if (subtitleRef.current) {
      tl.fromTo(subtitleRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' },
        '-=0.4'
      );
    }
    
    // Efecto parallax al hacer scroll
    gsap.to(bannerRef.current, {
      backgroundPositionY: '30%',
      ease: 'none',
      scrollTrigger: {
        trigger: bannerRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });
    
    return () => {
      // Limpiar animaciones
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);
  return (
    <div 
      ref={bannerRef}
      className={`relative py-32 overflow-hidden ${className}`}
    >
      {/* Imagen de fondo como elemento separado para mejor control */}
      <div 
        className="absolute inset-0 z-0"
        style={{ 
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
          filter: 'brightness(0.7)'
        }}
      />
      {/* Overlay con gradiente */}
      <div 
        ref={overlayRef}
        className={`absolute inset-0 ${isDarkMode 
          ? 'bg-gradient-to-r from-black/80 via-black/60 to-black/80' 
          : 'bg-gradient-to-r from-black/60 via-black/40 to-black/60'}`}
      ></div>
      
      {/* Elementos decorativos */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 md:w-64 md:h-64 rounded-full bg-accent/20 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 md:w-80 md:h-80 rounded-full bg-primary/20 blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl">
          <h1 
            ref={titleRef}
            className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight tracking-tight"
          >
            <span className="inline-block">{title}</span>
            <span className="block h-1 w-24 bg-accent mt-4 rounded-full"></span>
          </h1>
          
          {subtitle && (
            <p 
              ref={subtitleRef}
              className="text-xl md:text-2xl text-white/90 max-w-xl leading-relaxed"
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopBanner;
