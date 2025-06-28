'use client';

import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'accent' | 'white';
  className?: string;
  text?: string;
}

const Loader = ({ size = 'md', color = 'primary', className = '', text }: LoaderProps) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  
  // Estado para controlar si estamos en el cliente
  const [mounted, setMounted] = useState(false);

  // Efecto para marcar cuando estamos en el cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Tamaños del loader
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  // Colores del loader
  const colors = {
    primary: 'border-primary',
    secondary: 'border-secondary',
    accent: 'border-accent',
    white: 'border-white'
  };

  // Color del track (fondo del spinner)
  const trackColor = isDarkMode ? 'border-gray-700' : 'border-gray-200';

  // Si no estamos montados, no renderizamos nada para evitar errores de hidratación
  if (!mounted) return null;

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div 
        className={`animate-spin rounded-full border-t-transparent ${sizes[size]} ${colors[color]} ${trackColor}`}
        role="status"
        aria-label="Cargando"
      />
      {text && (
        <p className={`mt-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {text}
        </p>
      )}
    </div>
  );
};

export default Loader;
