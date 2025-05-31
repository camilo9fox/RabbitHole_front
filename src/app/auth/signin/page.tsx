'use client';

import React, { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Text from '@/components/commons/atoms/Text';
import Button from '@/components/commons/atoms/Button';
import { LogIn, KeyRound } from 'lucide-react';

export default function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showContent, setShowContent] = useState(false);

  // Detectar si hay un error de contraseña olvidada inmediatamente
  useEffect(() => {
    console.log('Error:', error, 'Descripción:', errorDescription);
    
    // Limpiar cualquier sesión persistente al cargar la página de inicio de sesión
    // Esto asegura que no haya inicio de sesión automático después de cerrar sesión
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
    
    // Caso 1: Error específico de Azure B2C para contraseña olvidada
    if (error === 'access_denied' && errorDescription?.includes('AADB2C90118')) {
      console.log('Detectado error de contraseña olvidada (AADB2C90118), redirigiendo...');
      setIsRedirecting(true);
      handlePasswordReset();
      return;
    }
    // Caso 2: Error de callback que puede venir de la página de "Olvidar contraseña"
    else if (error === 'Callback') {
      console.log('Detectado error de Callback, posiblemente de olvido de contraseña, redirigiendo...');
      setIsRedirecting(true);
      handlePasswordReset();
      return;
    }
    
    // Si no hay redirección, mostrar el contenido
    const timer = setTimeout(() => setShowContent(true), 50);
    return () => clearTimeout(timer);
  }, [error, errorDescription]);

  // Función para iniciar sesión con Azure AD B2C
  const handleSignIn = async () => {
    // Forzar una nueva sesión con el parámetro prompt=login
    await signIn('azure-ad', { 
      callbackUrl: '/home',
      prompt: 'login' // Esto fuerza a Azure B2C a mostrar la pantalla de inicio de sesión
    });
  };

  // Función para manejar el restablecimiento de contraseña
  const handlePasswordReset = async () => {
    console.log('Iniciando flujo de restablecimiento de contraseña...');
    try {
      // Construir la URL directa al flujo de restablecimiento de contraseña de Azure B2C
      const tenantName = process.env.NEXT_PUBLIC_AZURE_AD_B2C_TENANT_NAME ?? "azurecnsum1";
      const clientId = process.env.NEXT_PUBLIC_AZURE_AD_B2C_CLIENT_ID ?? "";
      const resetFlow = process.env.NEXT_PUBLIC_AZURE_AD_B2C_RESET_PASSWORD_FLOW ?? "B2C_1_passwordreset";
      const redirectUri = encodeURIComponent(`${window.location.origin}/api/auth/callback/azure-ad-reset`);
      
      // URL directa al flujo de restablecimiento de contraseña
      const resetUrl = `https://${tenantName}.b2clogin.com/${tenantName}.onmicrosoft.com/${resetFlow}/oauth2/v2.0/authorize?client_id=${clientId}&nonce=${Date.now()}&redirect_uri=${redirectUri}&scope=openid&response_type=code&prompt=login`;
      
      console.log('Redirigiendo a:', resetUrl);
      
      // Intentar primero con signIn
      try {
        await signIn('azure-ad-reset', { 
          callbackUrl: '/home',
          redirect: true
        });
      } catch (signInError) {
        console.warn('Error con signIn, intentando redirección directa:', signInError);
        // Si falla, redirigir directamente
        window.location.href = resetUrl;
      }
    } catch (error) {
      console.error('Error al iniciar el flujo de restablecimiento:', error);
    }
  };

  // Si estamos redirigiendo, mostrar una pantalla de carga
  if (isRedirecting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-card rounded-lg shadow-lg p-8 text-center">
          <div className="flex justify-center mb-6">
            <KeyRound size={64} className="text-accent animate-pulse" />
          </div>
          <Text variant="h1" className="text-3xl font-bold mb-4">
            Restablecimiento de Contraseña
          </Text>
          <Text variant="body" className="mb-4">
            Redirigiendo al flujo de restablecimiento de contraseña...
          </Text>
          <div className="flex justify-center">
            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }
  
  // No mostrar nada hasta que sepamos que no hay que redireccionar
  if (!showContent) {
    return null;
  }
  
  // Mostrar la página normal de inicio de sesión
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-card rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            {/* Logo de Rabbit Hole */}
            <div className="relative w-24 h-24">
              <div className="absolute w-20 h-20 rounded-full bg-accent/20 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute w-16 h-16 rounded-full bg-accent/40 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute w-12 h-12 rounded-full bg-accent left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">RH</span>
              </div>
            </div>
          </div>
          <Text variant="h1" className="text-3xl font-bold mb-2">
            Iniciar Sesión
          </Text>
          <Text variant="body" className="mb-6">
            Accede a tu cuenta de Rabbit Hole para personalizar y comprar tus poleras favoritas.
          </Text>
        </div>

        <div className="space-y-4">
          <Button
            variant="primary"
            className="w-full flex items-center justify-center gap-2 py-3"
            onClick={handleSignIn}
          >
            <LogIn className="h-5 w-5" />
            Iniciar sesión con Azure AD B2C
          </Button>
          
          <Button
            variant="secondary"
            className="w-full flex items-center justify-center gap-2 py-3"
            onClick={handlePasswordReset}
          >
            <KeyRound className="h-5 w-5" />
            ¿Olvidaste tu contraseña?
          </Button>

          <div className="text-center mt-6">
            <Text variant="small" className="text-gray-500 dark:text-gray-400">
              Al iniciar sesión, aceptas nuestros <span className="text-accent cursor-pointer">Términos y Condiciones</span> y <span className="text-accent cursor-pointer">Política de Privacidad</span>.
            </Text>
          </div>

          <div className="text-center mt-4">
            <Button
              variant="secondary"
              className="w-full flex items-center justify-center gap-2 py-2"
              onClick={() => router.push('/home')}
            >
              Volver al inicio
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
