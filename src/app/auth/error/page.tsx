'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Text from '@/components/commons/atoms/Text';
import Button from '@/components/commons/atoms/Button';
import { AlertTriangle, Home, ArrowLeft, KeyRound } from 'lucide-react';
import { signIn } from 'next-auth/react';

export default function AuthError() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  
  // Para evitar problemas de hidratación, inicializamos con null y actualizamos en useEffect
  const [isPasswordReset, setIsPasswordReset] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Detectar si el error es de contraseña olvidada (AADB2C90118)
    if (errorDescription?.includes('AADB2C90118')) {
      setIsPasswordReset(true);
      
      // Redireccionar automáticamente al flujo de restablecimiento de contraseña
      // con un pequeño retraso para que el usuario vea brevemente el mensaje
      const timer = setTimeout(() => {
        handlePasswordReset();
      }, 1500);
      
      return () => clearTimeout(timer);
    } else {
      setIsPasswordReset(false);
    }
  }, [errorDescription]);

  // Mapeo de errores a mensajes amigables
  const errorMessages: Record<string, string> = {
    Configuration: 'Hay un problema con la configuración del servidor de autenticación.',
    AccessDenied: 'No tienes permiso para acceder a este recurso.',
    Verification: 'El enlace de verificación ha expirado o ya ha sido utilizado.',
    Default: 'Ha ocurrido un error durante la autenticación.',
    PasswordReset: 'Has indicado que olvidaste tu contraseña.'
  };

  // Determinamos el mensaje de error apropiado
  let errorMessage;
  
  if (isPasswordReset === true && error === 'AccessDenied') {
    errorMessage = errorMessages.PasswordReset;
  } else if (error) {
    errorMessage = errorMessages[error] || errorMessages.Default;
  } else {
    errorMessage = errorMessages.Default;
  }
  
  // Función para manejar el restablecimiento de contraseña
  const handlePasswordReset = async () => {
    console.log('Iniciando flujo de restablecimiento de contraseña...');
    // Usamos el proveedor azure-ad-reset que tiene la URL directa configurada
    try {
      await signIn('azure-ad-reset', { 
        callbackUrl: '/home',
        redirect: true
      });
    } catch (error) {
      console.error('Error al iniciar el flujo de restablecimiento:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-card rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            {isPasswordReset ? (
              <KeyRound size={64} className="text-accent" />
            ) : (
              <AlertTriangle size={64} className="text-red-500" />
            )}
          </div>
          <Text variant="h1" className="text-3xl font-bold mb-2">
            {isPasswordReset ? 'Restablecimiento de Contraseña' : 'Error de Autenticación'}
          </Text>
          <Text variant="body">
            {errorMessage}
          </Text>
          {isPasswordReset && (
            <Text variant="body" className="mt-2">
              Redirigiendo al flujo de restablecimiento de contraseña...
            </Text>
          )}
        </div>

        <div className="space-y-4">
          {isPasswordReset === true ? (
            <Button
              variant="primary"
              className="w-full flex items-center justify-center gap-2 py-3"
              onClick={handlePasswordReset}
            >
              <KeyRound className="h-5 w-5" />
              Restablecer mi contraseña
            </Button>
          ) : (
            <Button
              variant="primary"
              className="w-full flex items-center justify-center gap-2 py-3"
              onClick={() => router.push('/auth/signin')}
            >
              <ArrowLeft className="h-5 w-5" />
              Volver a iniciar sesión
            </Button>
          )}

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
