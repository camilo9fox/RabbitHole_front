'use client';

import { ReactNode, useEffect, useState } from 'react';
import Navbar from '../commons/organisms/Navbar';
import Footer from '../commons/organisms/Footer';

interface LayoutProps {
  readonly children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  // Estado para controlar si estamos en el cliente
  const [isMounted, setIsMounted] = useState(false);
  
  // Efecto para marcar cuando estamos en el cliente
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Si no estamos en el cliente, renderizamos un placeholder simple
  // para evitar diferencias de hidratación
  if (!isMounted) {
    return (
      <div className="min-h-screen flex flex-col" suppressHydrationWarning>
        <div className="flex-grow">{children}</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col" suppressHydrationWarning>
      {/* Navbar */}
      <Navbar />

      {/* Main content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
