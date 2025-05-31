'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { Session } from 'next-auth';
import { LogIn, LogOut, User, ShoppingBag, Settings, ChevronDown } from 'lucide-react';
import Link from 'next/link';

// Componente para renderizar el contenido autenticado en desktop
const renderDesktopAuthenticatedContent = (session: Session | null, isDarkMode: boolean, menuOpen: boolean, setMenuOpen: (open: boolean) => void, menuRef: React.RefObject<HTMLDivElement | null>) => {
  return (
    <div className="hidden sm:flex items-center gap-3 relative" ref={menuRef}>
      {/* Nombre del usuario */}
      <button 
        className="flex items-center gap-2 cursor-pointer bg-transparent border-0 p-0"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-haspopup="true"
        aria-expanded={menuOpen}
        aria-label="Menú de usuario"
      >
        {/* Nombre del usuario visible */}
        <span className={`text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          {session?.user?.name?.split(' ')[0] ?? 'Usuario'}
        </span>
        <ChevronDown 
          className={`h-4 w-4 transition-transform ${isDarkMode ? 'text-white' : 'text-gray-800'} ${menuOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      
      {/* Menú desplegable para desktop */}
      {menuOpen && renderUserMenu(session, isDarkMode)}
    </div>
  );
};

// Componente para renderizar el contenido autenticado en mobile
const renderMobileAuthenticatedContent = (session: Session | null, isDarkMode: boolean) => {
  return (
    <div className="flex flex-col w-full">
      {/* Nombre del usuario */}
      <div className="flex items-center gap-2 mb-4">
        <span className={`text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          {session?.user?.name ?? 'Usuario'}
        </span>
      </div>
      
      {/* Información del usuario */}
      <div className={`px-4 py-3 mb-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <p className={`text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {session?.user?.email ?? 'Sin correo'}
        </p>
        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          ID: {session?.user?.id ?? 'No disponible'}
        </p>
      </div>
      
      {/* Enlaces directos */}
      <Link href="/account" className="block w-full">
        <div className={`flex items-center gap-2 px-4 py-2 ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}>
          <User className="h-4 w-4" />
          <span className="text-sm font-medium">Mi cuenta</span>
        </div>
      </Link>
      
      <Link href="/account/orders" className="block w-full">
        <div className={`flex items-center gap-2 px-4 py-2 ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}>
          <ShoppingBag className="h-4 w-4" />
          <span className="text-sm font-medium">Mis pedidos</span>
        </div>
      </Link>
      
      <Link href="/account/settings" className="block w-full">
        <div className={`flex items-center gap-2 px-4 py-2 ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}>
          <Settings className="h-4 w-4" />
          <span className="text-sm font-medium">Configuración</span>
        </div>
      </Link>
      
      <button 
        onClick={() => signOut({ callbackUrl: '/home' })}
        className="block w-full text-left"
      >
        <div className={`flex items-center gap-2 px-4 py-2 ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}>
          <LogOut className="h-4 w-4" />
          <span className="text-sm font-medium">Cerrar sesión</span>
        </div>
      </button>
    </div>
  );
};

// Componente para renderizar el menú de usuario
const renderUserMenu = (session: Session | null, isDarkMode: boolean) => {
  return (
    <div className={`absolute top-10 right-0 w-56 rounded-md shadow-lg py-1 z-50 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} max-w-[90vw] sm:max-w-none`}>
      {/* Información del usuario */}
      <div className={`px-4 py-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <p className={`text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {session?.user?.name ?? 'Usuario'}
        </p>
        <p className={`text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {session?.user?.email ?? 'Sin correo'}
        </p>
        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          ID: {session?.user?.id ?? 'No disponible'}
        </p>
      </div>
      
      {/* Opciones del menú */}
      <Link href="/account" className="block w-full">
        <div className={`flex items-center gap-2 px-4 py-2 ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}>
          <User className="h-4 w-4" />
          <span className="text-sm font-medium">Mi cuenta</span>
        </div>
      </Link>
      
      <Link href="/account/orders" className="block w-full">
        <div className={`flex items-center gap-2 px-4 py-2 ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}>
          <ShoppingBag className="h-4 w-4" />
          <span className="text-sm font-medium">Mis pedidos</span>
        </div>
      </Link>
      
      <Link href="/account/settings" className="block w-full">
        <div className={`flex items-center gap-2 px-4 py-2 ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}>
          <Settings className="h-4 w-4" />
          <span className="text-sm font-medium">Configuración</span>
        </div>
      </Link>
      
      <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} my-1`}></div>
      
      <button 
        onClick={() => signOut({ callbackUrl: '/home' })}
        className="block w-full text-left"
      >
        <div className={`flex items-center gap-2 px-4 py-2 ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}>
          <LogOut className="h-4 w-4" />
          <span className="text-sm font-medium">Cerrar sesión</span>
        </div>
      </button>
    </div>
  );
};

// Componente para renderizar el contenido no autenticado
const renderUnauthenticatedContent = () => {
  return (
    <div className="flex items-center gap-2">
      <button 
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        onClick={() => signIn('azure-ad', { callbackUrl: '/home', redirect: true })}
      >
        <LogIn className="h-4 w-4 text-white" />
        <span>Iniciar sesión</span>
      </button>
    </div>
  );
};

export default function AuthNav() {
  const { data: session, status } = useSession();
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  const isAuthenticated = status === 'authenticated';
  
  // Estado para controlar si estamos en el cliente y el menú desplegable
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Efecto para cerrar el menú cuando se hace clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Efecto para marcar cuando estamos en el cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Guardar el token de sesión en localStorage cuando cambia la sesión
  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window !== 'undefined') {
      if (session?.accessToken) {
        try {
          localStorage.setItem('authToken', session.accessToken);
          console.log('Token guardado en localStorage');
        } catch (error) {
          console.error('Error al guardar el token en localStorage:', error);
        }
      } else if (status === 'unauthenticated') {
        try {
          localStorage.removeItem('authToken');
          console.log('Token eliminado de localStorage');
        } catch (error) {
          console.error('Error al eliminar el token de localStorage:', error);
        }
      }
      console.log('Estado de sesión:', { 
        autenticado: status === 'authenticated',
        tieneToken: !!session?.accessToken,
        usuario: session?.user?.name
      });
    }
  }, [session, status]);
  
  // Si no estamos montados en el cliente, renderizamos un placeholder
  // para evitar errores de hidratación
  if (!mounted) {
    return <div className="flex items-center gap-2"></div>;
  }

  // Solo renderizamos el contenido real cuando estamos en el cliente
  return (
    <div className="flex items-center gap-2" suppressHydrationWarning>
      {isAuthenticated
        ? (
            <>
              {/* Contenido para desktop */}
              {renderDesktopAuthenticatedContent(session, isDarkMode, menuOpen, setMenuOpen, menuRef)}
              
              {/* Contenido para mobile - se muestra directamente en el menú hamburguesa */}
              <div className="sm:hidden w-full">
                {renderMobileAuthenticatedContent(session, isDarkMode)}
              </div>
            </>
          )
        : renderUnauthenticatedContent()
      }
    </div>
  );
}
