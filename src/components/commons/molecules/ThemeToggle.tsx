'use client';

import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import gsap from 'gsap';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Necesario para evitar errores de hidratación
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Efecto de animación al cambiar el tema
  useEffect(() => {
    if (!mounted) return;
    
    const button = document.querySelector('.theme-toggle-button');
    if (!button) return;
    
    gsap.fromTo(
      button,
      { rotate: 0 },
      { 
        rotate: 360, 
        duration: 0.5, 
        ease: 'back.out(1.7)'
      }
    );
  }, [theme, mounted]);
  
  if (!mounted) {
    return null;
  }

  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="theme-toggle-button p-2 rounded-full bg-card border border-border hover:border-accent transition-all duration-200 relative overflow-hidden shadow-sm hover:shadow-md"
      aria-label={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
    >
      <div className="relative z-10">
        {theme === 'light' ? (
          <Moon className="h-5 w-5 text-accent" />
        ) : (
          <Sun className="h-5 w-5 text-accent" />
        )}
      </div>
      <span className="sr-only">{theme === 'light' ? 'Modo oscuro' : 'Modo claro'}</span>
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </button>
  );
}
