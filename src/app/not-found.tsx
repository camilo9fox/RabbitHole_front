'use client';

import React from 'react';
import Link from 'next/link';
import { Home } from 'lucide-react';
import Text from '@/components/commons/atoms/Text';

const NotFound = () => {

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        {/* Conejo personalizado con CSS - con suppressHydrationWarning y soporte para tema oscuro */}
        <div className="relative mx-auto w-48 h-48 mb-8" suppressHydrationWarning>
          {/* Cuerpo del conejo */}
          <div className="absolute w-32 h-40 rounded-full left-1/2 bottom-0 transform -translate-x-1/2 bg-gray-200 dark:bg-gray-300"></div>
          
          {/* Cabeza del conejo */}
          <div className="absolute w-28 h-28 rounded-full left-1/2 top-0 transform -translate-x-1/2 bg-gray-200 dark:bg-gray-300"></div>
          
          {/* Orejas */}
          <div className="absolute w-10 h-32 rounded-full left-1/4 -top-20 transform -translate-x-1/2 rotate-[-20deg] bg-gray-200 dark:bg-gray-300"></div>
          <div className="absolute w-10 h-32 rounded-full right-1/4 -top-20 transform translate-x-1/2 rotate-[20deg] bg-gray-200 dark:bg-gray-300"></div>
          
          {/* Interior de las orejas */}
          <div className="absolute w-6 h-24 rounded-full left-1/4 -top-16 transform -translate-x-1/2 rotate-[-20deg] bg-pink-300 dark:bg-pink-200"></div>
          <div className="absolute w-6 h-24 rounded-full right-1/4 -top-16 transform translate-x-1/2 rotate-[20deg] bg-pink-300 dark:bg-pink-200"></div>
          
          {/* Ojos */}
          <div className="absolute w-4 h-4 rounded-full left-1/3 top-10 bg-gray-800"></div>
          <div className="absolute w-4 h-4 rounded-full right-1/3 top-10 bg-gray-800"></div>
          
          {/* Nariz */}
          <div className="absolute w-6 h-4 rounded-full left-1/2 top-16 transform -translate-x-1/2 bg-pink-400 dark:bg-pink-300"></div>
          
          {/* Bigotes */}
          <div className="absolute w-8 h-0.5 bg-gray-600 left-1/4 top-16 transform rotate-[10deg]"></div>
          <div className="absolute w-8 h-0.5 bg-gray-600 left-1/4 top-18 transform rotate-[-10deg]"></div>
          <div className="absolute w-8 h-0.5 bg-gray-600 right-1/4 top-16 transform rotate-[-10deg]"></div>
          <div className="absolute w-8 h-0.5 bg-gray-600 right-1/4 top-18 transform rotate-[10deg]"></div>
          
          {/* Brazos */}
          <div className="absolute w-8 h-16 rounded-full left-0 top-24 transform rotate-[20deg] bg-gray-200 dark:bg-gray-300"></div>
          <div className="absolute w-8 h-16 rounded-full right-0 top-24 transform rotate-[-20deg] bg-gray-200 dark:bg-gray-300"></div>
          
          {/* Pies */}
          <div className="absolute w-10 h-6 rounded-full left-1/4 bottom-0 transform -translate-x-1/2 bg-gray-200 dark:bg-gray-300"></div>
          <div className="absolute w-10 h-6 rounded-full right-1/4 bottom-0 transform translate-x-1/2 bg-gray-200 dark:bg-gray-300"></div>
          
          {/* Expresión triste */}
          <div className="absolute w-8 h-8 left-1/2 top-20 transform -translate-x-1/2">
            <div className="absolute w-6 h-6 border-b-2 border-gray-800 rounded-full left-1/2 transform -translate-x-1/2 rotate-[180deg]"></div>
          </div>
        </div>
        
        {/* Texto 404 - con suppressHydrationWarning */}
        <Text variant="h1" className="text-8xl font-bold mb-4" suppressHydrationWarning>
          404
        </Text>
        
        {/* Mensaje */}
        <Text variant="h2" className="text-2xl font-semibold mb-4" suppressHydrationWarning>
          ¡Vaya! Parece que te has caído en un agujero
        </Text>
        
        <Text variant="body" className="text-lg mb-8" suppressHydrationWarning>
          La página que estás buscando no existe o ha sido movida a otro lugar.
        </Text>
        
        {/* Botón para volver a inicio */}
        <Link href="/" className="inline-block">
          <div 
            className="flex items-center justify-center gap-2 px-6 py-3 bg-accent hover:bg-accent/90 font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg cursor-pointer dark:border-2 dark:border-white/20 dark:hover:border-white/40"
            suppressHydrationWarning
          >
            <Home className="h-5 w-5" />
            Volver al inicio
          </div>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
