'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin, ArrowRight, ChevronRight } from 'lucide-react';
import { FaInstagram, FaFacebookF, FaTwitter } from 'react-icons/fa';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import Logo from '../atoms/Logo';

const Footer = () => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  
  // Estado para controlar si estamos en el cliente
  const [mounted, setMounted] = useState(false);

  // Efecto para marcar cuando estamos en el cliente
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Usamos clases que funcionan tanto en el servidor como en el cliente para el renderizado inicial
  // y luego actualizamos con las clases específicas del tema cuando estamos en el cliente
  return (
    <footer className="bg-primary dark:bg-primary/95 text-foreground" suppressHydrationWarning>
      {/* Newsletter section */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1">
              <h3 className={`text-xl font-bold ${mounted ? (isDarkMode ? 'text-white' : 'text-gray-800') : 'text-white dark:text-white text-gray-800'} mb-2`} suppressHydrationWarning>Suscríbete a nuestro newsletter</h3>
              <p className="text-secondary/80 text-sm">
                Recibe las últimas novedades, diseños exclusivos y ofertas especiales directamente en tu correo.
              </p>
            </div>
            <div className="flex-1">
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Tu correo electrónico" 
                  className="flex-1 px-4 py-3 bg-white/10 dark:bg-white/5 border border-border text-foreground rounded-l-md focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <button className="bg-accent hover:bg-opacity-90 text-primary font-medium px-4 py-3 rounded-r-md transition-colors duration-200 flex items-center">
                  Suscribirse
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Columna 1: Empresa */}
          <div className="space-y-6">
            <Logo 
              size={40} 
              showText={true} 
              textClassName="text-foreground" 
            />
            <p className="text-sm text-muted">
              Crea diseños personalizados y únicos para tus poleras. Tu imaginación es el límite.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://instagram.com/rabbithole"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 p-2 rounded-full hover:bg-accent hover:text-primary transition-colors duration-200"
                aria-label="Instagram"
              >
                <FaInstagram className="h-5 w-5" aria-hidden="true" />
              </a>
              <a
                href="https://facebook.com/rabbithole"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 p-2 rounded-full hover:bg-accent hover:text-primary transition-colors duration-200"
                aria-label="Facebook"
              >
                <FaFacebookF className="h-5 w-5" aria-hidden="true" />
              </a>
              <a
                href="https://twitter.com/rabbithole"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 p-2 rounded-full hover:bg-accent hover:text-primary transition-colors duration-200"
                aria-label="Twitter"
              >
                <FaTwitter className="h-5 w-5" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Columna 2: Productos */}
          <div>
            <h3 className={`text-lg font-semibold ${mounted ? (isDarkMode ? 'text-white' : 'text-gray-800') : 'text-white dark:text-white text-gray-800'} mb-6`} suppressHydrationWarning>Productos</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/shop" className="text-secondary/80 hover:text-accent flex items-center group transition-colors duration-200">
                  <ChevronRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-200" />
                  Tienda
                </Link>
              </li>
              <li>
                <Link href="/customize" className="text-secondary/80 hover:text-accent flex items-center group transition-colors duration-200">
                  <ChevronRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-200" />
                  Personalizar
                </Link>
              </li>
              <li>
                <Link href="/new-designs" className="text-secondary/80 hover:text-accent flex items-center group transition-colors duration-200">
                  <ChevronRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-200" />
                  Nuevos Diseños
                </Link>
              </li>
              <li>
                <Link href="/sale" className="text-secondary/80 hover:text-accent flex items-center group transition-colors duration-200">
                  <ChevronRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-200" />
                  Ofertas
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Información */}
          <div>
            <h3 className={`text-lg font-semibold ${mounted ? (isDarkMode ? 'text-white' : 'text-gray-800') : 'text-white dark:text-white text-gray-800'} mb-6`} suppressHydrationWarning>Información</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-secondary/80 hover:text-accent flex items-center group transition-colors duration-200">
                  <ChevronRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-200" />
                  Nosotros
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-secondary/80 hover:text-accent flex items-center group transition-colors duration-200">
                  <ChevronRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-200" />
                  Envío y Devoluciones
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-secondary/80 hover:text-accent flex items-center group transition-colors duration-200">
                  <ChevronRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-200" />
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-secondary/80 hover:text-accent flex items-center group transition-colors duration-200">
                  <ChevronRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-200" />
                  Preguntas Frecuentes
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 4: Contacto */}
          <div>
            <h3 className={`text-lg font-semibold ${mounted ? (isDarkMode ? 'text-white' : 'text-gray-800') : 'text-white dark:text-white text-gray-800'} mb-6`} suppressHydrationWarning>Contacto</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-accent mr-3 mt-0.5" aria-hidden="true" />
                <span className="text-secondary/80">
                  Av. Providencia 1234, Santiago, Chile
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-accent mr-3" aria-hidden="true" />
                <span className="text-secondary/80">+56 9 1234 5678</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-accent mr-3" aria-hidden="true" />
                <a href="mailto:info@rabbithole.cl" className="text-secondary/80 hover:text-accent transition-colors duration-200">
                  info@rabbithole.cl
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Rabbit Hole. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6">
              <Link href="/terms" className="text-sm text-muted hover:text-accent transition-colors duration-200">
                Términos y Condiciones
              </Link>
              <Link href="/privacy" className="text-sm text-muted hover:text-accent transition-colors duration-200">
                Política de Privacidad
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
