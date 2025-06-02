'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Menu, X, ShoppingCart, Heart, Search, Settings, Shield } from 'lucide-react';
import gsap from 'gsap';
import ThemeToggle from '../molecules/ThemeToggle';
import AuthNav from '../molecules/AuthNav';
import Logo from '../atoms/Logo';
import { useTheme } from 'next-themes';
import CartDrawer from './CartDrawer';
import { useCart } from '@/context/CartContext';
import { useUserRole } from '@/context/UserRoleContext';

const navigation = [
  { name: 'Inicio', href: '/' },
  { name: 'Tienda', href: '/shop' },
  { name: 'Personalizar', href: '/customize' },
  { name: 'Nuevos Diseños', href: '/new-designs' },
  { name: 'Nosotros', href: '/about' },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const { cart } = useCart();
  const { role, isAdmin, toggleRole } = useUserRole();
  const navLinksRef = useRef<HTMLDivElement>(null);
  const navItemsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  
  // Usamos un estado para controlar si estamos en el cliente
  const [mounted, setMounted] = useState(false);

  // Efecto para marcar cuando estamos en el cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Evitar errores de hidratación
  useEffect(() => {
    // El componente está montado en el cliente
    // No necesitamos hacer nada específico aquí
  }, []);

  // Animación de los enlaces de navegación
  useEffect(() => {
    if (!navLinksRef.current) return;
    
    // Animación inicial de los enlaces
    const navItems = navItemsRef.current.filter(Boolean);
    
    // Timeline para la animación inicial
    const tl = gsap.timeline();
    
    // Animación de entrada principal
    tl.fromTo(
      navItems,
      { y: -30, opacity: 0, rotationX: 45 },
      { 
        y: 0, 
        opacity: 1, 
        rotationX: 0,
        stagger: 0.08,
        duration: 0.7,
        ease: "back.out(1.7)",
        delay: 0.3
      }
    );
    
    // Añadir efecto de brillo a los enlaces
    navItems.forEach((link, index) => {
      if (!link) return;
      
      // Crear un efecto de brillo que se mueve a través del texto
      gsap.to(link, {
        textShadow: "0px 0px 8px rgba(252, 163, 17, 0.7)",
        duration: 0.5,
        repeat: 1,
        yoyo: true,
        delay: 1 + (index * 0.1),
        ease: "power1.inOut"
      });
    });
    
    // Efecto de parpadeo para el logo
    const logo = document.querySelector('.navbar-logo');
    if (logo) {
      gsap.fromTo(
        logo,
        { scale: 0.8, opacity: 0, rotation: -10 },
        { 
          scale: 1, 
          opacity: 1, 
          rotation: 0,
          duration: 0.8,
          ease: "elastic.out(1, 0.3)"
        }
      );
    }
    
    // Animación para los iconos de acciones
    const actionIcons = document.querySelectorAll('.navbar-action');
    gsap.fromTo(
      actionIcons,
      { y: -20, opacity: 0, scale: 0.8 },
      { 
        y: 0, 
        opacity: 1, 
        scale: 1,
        stagger: 0.1,
        duration: 0.5,
        ease: "back.out(2)",
        delay: 0.5
      }
    );
    
    // Función de limpieza
    return () => {
      tl.kill();
    };
  }, []);

  // Eliminamos el efecto de hover que causa problemas

  // Si no estamos montados en el cliente, renderizamos un placeholder para evitar errores de hidratación
  if (!mounted) {
    return (
      <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Top">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              {/* Placeholder */}
            </div>
          </div>
        </nav>
      </header>
    );
  }

  const isDarkMode = resolvedTheme === 'dark';

  return (
    <>
      <nav 
        className={`fixed w-full z-50 transition-all duration-300 shadow-lg ${isDarkMode ? 'bg-black' : 'bg-white'}`}
        suppressHydrationWarning
      >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo */}
            <Logo 
              size={40} 
              showText={true} 
              textClassName={`hidden sm:block ${isDarkMode ? 'text-white' : 'text-black'}`} 
            />
            
            {/* Navigation */}
            <div ref={navLinksRef} className="hidden md:ml-8 md:flex md:space-x-6">
              {navigation.map((item, index) => (
                <Link
                  key={item.name}
                  href={item.href}
                  ref={(el) => { navItemsRef.current[index] = el; }}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="hidden sm:flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Search className="h-5 w-5 text-gray-800 dark:text-gray-300" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Heart className="h-5 w-5 text-gray-800 dark:text-gray-300" />
            </button>
            <button 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
              onClick={() => {
                console.log('Clic en icono de carrito');
                setIsCartOpen(true);
              }}
              aria-label="Abrir carrito de compras"
            >
              <ShoppingCart className="h-5 w-5 text-gray-800 dark:text-gray-300" />
              {cart.totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cart.totalItems}
                </span>
              )}
            </button>
            {/* Botón para cambiar rol (solo para desarrollo) */}
            <button 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
              onClick={toggleRole}
              title={`Cambiar rol: ${role === 'admin' ? 'Usuario' : 'Administrador'}`}
            >
              <Settings className="h-5 w-5 text-gray-800 dark:text-gray-300" />
              {role === 'admin' && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  A
                </span>
              )}
            </button>
            {/* Enlace al panel de administración (solo visible para administradores) */}
            {isAdmin && (
              <Link href="/admin/products" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Panel de administración">
                <Shield className="h-5 w-5 text-blue-600" />
              </Link>
            )}
            <ThemeToggle />
            <AuthNav />
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <Link href="/cart" className={`${isDarkMode ? 'text-white' : 'text-black'} mr-4 relative`}>
              <ShoppingCart className="h-5 w-5" aria-hidden="true" />
              <span className="absolute -top-2 -right-2 bg-accent text-primary text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">3</span>
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-md ${isDarkMode ? 'text-white' : 'text-black'} focus:outline-none`}
              aria-expanded="false"
            >
              <span className="sr-only">Abrir menú principal</span>
              {isOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className={`sm:hidden backdrop-blur-md ${isDarkMode ? 'bg-black' : 'bg-white'}`} suppressHydrationWarning>
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="mt-4 border-t border-current/20 pt-4">
              <Link
                href="/favorites"
                className={`block px-3 py-2 rounded-md text-base font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}
              >
                <Heart className="h-5 w-5 inline-block mr-2" />
                Favoritos
              </Link>
              {/* Opciones de administrador en móvil */}
              <div className="flex items-center px-3 py-2">
                <button 
                  onClick={toggleRole}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}
                >
                  <Settings className="h-5 w-5 inline-block mr-2" />
                  Cambiar a {role === 'admin' ? 'Usuario' : 'Admin'}
                </button>
              </div>
              {isAdmin && (
                <Link
                  href="/admin/products"
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium text-blue-600`}
                >
                  <Shield className="h-5 w-5 inline-block mr-2" />
                  Panel de Administración
                </Link>
              )}
              <div className="px-3 py-2">
                <AuthNav />
              </div>
              <div className="mt-4 flex items-center justify-between px-3">
                <ThemeToggle />
                <Link
                  href="/customize"
                  className="block text-center px-4 py-2 bg-blue-600 text-white rounded-md font-medium"
                >
                  Personalizar Polera
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>

    {/* Cart Drawer - Siempre renderizado, pero solo visible cuando isCartOpen es true */}
    <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Navbar;
