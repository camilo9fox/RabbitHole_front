'use client';

import { useTheme } from 'next-themes';
import { useState, useEffect, useRef } from 'react';
import { Sun, Moon } from 'lucide-react';
import gsap from 'gsap';

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  const [mounted, setMounted] = useState(false);
  
  // Necesario para evitar errores de hidratación
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Efecto de animación al cambiar el tema usando useRef en lugar de querySelector
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  useEffect(() => {
    if (!mounted || !buttonRef.current) return;
    
    gsap.fromTo(
      buttonRef.current,
      { rotate: 0 },
      { 
        rotate: 360, 
        duration: 0.5, 
        ease: 'back.out(1.7)'
      }
    );
  }, [resolvedTheme, mounted]);
  
  if (!mounted) {
    return null;
  }

  return (
    <button
      ref={buttonRef}
      onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
      className={`p-2 rounded-full transition-colors duration-200 relative overflow-hidden ${isDarkMode 
        ? 'bg-gray-700 hover:bg-gray-600 ring-1 ring-gray-600 hover:ring-gray-500' 
        : 'bg-gray-100 hover:bg-gray-200 ring-1 ring-gray-300 hover:ring-gray-400'}`}
      aria-label={`Cambiar a modo ${isDarkMode ? 'claro' : 'oscuro'}`}
    >
      <div className="relative z-10">
        {!isDarkMode ? (
          <Moon className="h-5 w-5 text-indigo-700" />
        ) : (
          <Sun className="h-5 w-5 text-yellow-300" />
        )}
      </div>
      <span className="sr-only">{isDarkMode ? 'Modo claro' : 'Modo oscuro'}</span>
      <div className={`absolute inset-0 ${isDarkMode ? 'bg-gradient-to-tr from-blue-900/20 to-purple-900/20' : 'bg-gradient-to-tr from-blue-100/50 to-purple-100/50'} opacity-0 hover:opacity-100 transition-opacity duration-300`}></div>
    </button>
  );
}
