'use client';

import React, { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import Text from '@/components/commons/atoms/Text';
import Button from '@/components/commons/atoms/Button';
import { LogOut, Home } from 'lucide-react';

// URL de cierre de sesión para Azure B2C
const AZURE_AD_B2C_TENANT_NAME = process.env.NEXT_PUBLIC_AZURE_AD_B2C_TENANT_NAME ?? "azurecnsum1";
const AZURE_AD_B2C_CLIENT_ID = process.env.NEXT_PUBLIC_AZURE_AD_B2C_CLIENT_ID ?? "5c98f65f-6472-404c-81b1-20bf3f69a706";
const AZURE_AD_B2C_PRIMARY_USER_FLOW = process.env.NEXT_PUBLIC_AZURE_AD_B2C_PRIMARY_USER_FLOW ?? "B2C_1_signupsignin";

// URL de cierre de sesión para Azure B2C con parámetros adicionales
const LOGOUT_URL = `https://${AZURE_AD_B2C_TENANT_NAME}.b2clogin.com/${AZURE_AD_B2C_TENANT_NAME}.onmicrosoft.com/${AZURE_AD_B2C_PRIMARY_USER_FLOW}/oauth2/v2.0/logout?client_id=${AZURE_AD_B2C_CLIENT_ID}&post_logout_redirect_uri=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin + '/home' : 'http://localhost:3000/home')}`;

export default function SignOut() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  const [isLoading, setIsLoading] = useState(false);
  
  // Estado para controlar si estamos en el cliente
  const [mounted, setMounted] = useState(false);

  // Efecto para marcar cuando estamos en el cliente
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Si no estamos montados en el cliente, renderizamos un placeholder
  if (!mounted) {
    return <div className="min-h-screen flex flex-col items-center justify-center"></div>;
  }

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      // Eliminar el token del localStorage y todas las cookies relacionadas
      if (typeof window !== 'undefined') {
        // Limpiar localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('next-auth.callback-url');
        localStorage.removeItem('next-auth.session-token');
        
        // Limpiar sessionStorage
        sessionStorage.clear();
        
        // Eliminar todas las cookies relacionadas con la autenticación
        document.cookie.split(';').forEach(cookie => {
          const [name] = cookie.trim().split('=');
          if (name.includes('next-auth') || name.includes('__Secure-next-auth')) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; secure; samesite=lax`;
          }
        });
      }
      
      // Cerrar sesión con NextAuth sin redirección
      await signOut({ 
        redirect: false
      });
      
      // Redirigir a la URL de cierre de sesión de Azure B2C
      // Esto asegura que también se cierre sesión en Azure B2C
      window.location.href = LOGOUT_URL;
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Si hay un error, redirigir manualmente
      router.push('/home');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-card rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <Text variant="h1" className="text-3xl font-bold mb-2">
            Cerrar Sesión
          </Text>
          <Text variant="body" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            ¿Estás seguro que deseas cerrar sesión?
          </Text>
        </div>

        <div className="space-y-4">
          <Button
            variant="primary"
            className="w-full flex items-center justify-center gap-2 py-3"
            onClick={handleSignOut}
            disabled={isLoading}
          >
            <LogOut className="h-5 w-5" />
            {isLoading ? 'Cerrando sesión...' : 'Cerrar sesión'}
          </Button>

          <div className="text-center mt-4">
            <Button
              variant="secondary"
              className="w-full flex items-center justify-center gap-2 py-2"
              onClick={() => router.push('/home')}
            >
              <Home className="h-5 w-5" />
              Volver al inicio
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
