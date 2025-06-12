'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { Settings, Bell, Eye, Moon, Sun, ToggleLeft, ToggleRight } from 'lucide-react';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const { resolvedTheme, setTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  const router = useRouter();
  
  // Estado para las preferencias de usuario
  const [preferences, setPreferences] = useState({
    theme: 'system',
    notifications: {
      email: true,
      orderUpdates: true,
      promotions: false
    },
    privacy: {
      saveOrderHistory: true,
      shareDesigns: false
    }
  });

  // Cargar preferencias del usuario
  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      router.push('/home');
      return;
    }
    
    // Cargar preferencias desde localStorage
    try {
      const storedPrefs = localStorage.getItem('userPreferences');
      if (storedPrefs) {
        setPreferences(JSON.parse(storedPrefs));
      } else {
        // Si no hay preferencias guardadas, establecemos las predeterminadas
        // y las guardamos en localStorage
        localStorage.setItem('userPreferences', JSON.stringify(preferences));
      }
    } catch (error) {
      console.error('Error al cargar preferencias:', error);
    }
  }, [session, status, router]);

  // Guardar cambios en preferencias
  const savePreferences = (newPrefs: any) => {
    try {
      localStorage.setItem('userPreferences', JSON.stringify(newPrefs));
      setPreferences(newPrefs);
    } catch (error) {
      console.error('Error al guardar preferencias:', error);
    }
  };

  // Cambiar tema
  const handleThemeChange = (theme: string) => {
    setTheme(theme);
    savePreferences({
      ...preferences,
      theme
    });
  };

  // Cambiar configuración de notificaciones
  const handleNotificationChange = (key: string, value: boolean) => {
    savePreferences({
      ...preferences,
      notifications: {
        ...preferences.notifications,
        [key]: value
      }
    });
  };

  // Cambiar configuración de privacidad
  const handlePrivacyChange = (key: string, value: boolean) => {
    savePreferences({
      ...preferences,
      privacy: {
        ...preferences.privacy,
        [key]: value
      }
    });
  };

  // Si está cargando la sesión, mostramos un loader
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-center container mx-auto px-4 py-12">
      <h1 className={`text-3xl font-bold mb-6 flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        <Settings className="w-8 h-8" />
        Configuración
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sección de tema */}
        <div className={`rounded-lg shadow-md overflow-hidden col-span-1 md:col-span-3 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className={`p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Tema
            </h2>
          </div>
          
          <div className="p-6">
            <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Selecciona el tema de la aplicación:
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => handleThemeChange('light')}
                className={`flex items-center justify-center gap-3 p-4 rounded-lg border transition-colors ${
                  preferences.theme === 'light'
                  ? (isDarkMode ? 'bg-blue-900 border-blue-700 text-blue-200' : 'bg-blue-100 border-blue-300 text-blue-800')
                  : (isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-200 text-gray-700')
                }`}
              >
                <Sun className="w-6 h-6" />
                <span>Claro</span>
              </button>
              
              <button
                onClick={() => handleThemeChange('dark')}
                className={`flex items-center justify-center gap-3 p-4 rounded-lg border transition-colors ${
                  preferences.theme === 'dark'
                  ? (isDarkMode ? 'bg-blue-900 border-blue-700 text-blue-200' : 'bg-blue-100 border-blue-300 text-blue-800')
                  : (isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-200 text-gray-700')
                }`}
              >
                <Moon className="w-6 h-6" />
                <span>Oscuro</span>
              </button>
              
              <button
                onClick={() => handleThemeChange('system')}
                className={`flex items-center justify-center gap-3 p-4 rounded-lg border transition-colors ${
                  preferences.theme === 'system'
                  ? (isDarkMode ? 'bg-blue-900 border-blue-700 text-blue-200' : 'bg-blue-100 border-blue-300 text-blue-800')
                  : (isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-200 text-gray-700')
                }`}
              >
                <span className="flex">
                  <Sun className="w-6 h-6" />
                  <Moon className="w-6 h-6 ml-1" />
                </span>
                <span>Sistema</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sección de notificaciones */}
        <div className={`rounded-lg shadow-md overflow-hidden col-span-1 md:col-span-3 lg:col-span-2 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className={`p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
            <h2 className={`text-xl font-semibold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <Bell className="w-5 h-5" />
              Notificaciones
            </h2>
          </div>
          
          <div className="p-6">
            <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Configura tus preferencias de notificaciones:
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Notificaciones por email
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Recibir correos con información importante sobre tu cuenta
                  </p>
                </div>
                <button 
                  onClick={() => handleNotificationChange('email', !preferences.notifications.email)}
                  className="focus:outline-none"
                  aria-label={preferences.notifications.email ? "Desactivar notificaciones por email" : "Activar notificaciones por email"}
                >
                  {preferences.notifications.email 
                    ? <ToggleRight className={`w-10 h-10 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} /> 
                    : <ToggleLeft className={`w-10 h-10 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  }
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Actualizaciones de pedidos
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Recibir notificaciones sobre el estado de tus pedidos
                  </p>
                </div>
                <button 
                  onClick={() => handleNotificationChange('orderUpdates', !preferences.notifications.orderUpdates)}
                  className="focus:outline-none"
                  aria-label={preferences.notifications.orderUpdates ? "Desactivar notificaciones de pedidos" : "Activar notificaciones de pedidos"}
                >
                  {preferences.notifications.orderUpdates 
                    ? <ToggleRight className={`w-10 h-10 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} /> 
                    : <ToggleLeft className={`w-10 h-10 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  }
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Promociones y ofertas
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Recibir ofertas especiales y promociones
                  </p>
                </div>
                <button 
                  onClick={() => handleNotificationChange('promotions', !preferences.notifications.promotions)}
                  className="focus:outline-none"
                  aria-label={preferences.notifications.promotions ? "Desactivar promociones" : "Activar promociones"}
                >
                  {preferences.notifications.promotions 
                    ? <ToggleRight className={`w-10 h-10 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} /> 
                    : <ToggleLeft className={`w-10 h-10 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  }
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de privacidad */}
        <div className={`rounded-lg shadow-md overflow-hidden col-span-1 md:col-span-3 lg:col-span-1 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className={`p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
            <h2 className={`text-xl font-semibold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <Eye className="w-5 h-5" />
              Privacidad
            </h2>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Guardar historial de pedidos
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Mantener tu historial de pedidos para referencia futura
                  </p>
                </div>
                <button 
                  onClick={() => handlePrivacyChange('saveOrderHistory', !preferences.privacy.saveOrderHistory)}
                  className="focus:outline-none"
                  aria-label={preferences.privacy.saveOrderHistory ? "Desactivar historial" : "Activar historial"}
                >
                  {preferences.privacy.saveOrderHistory 
                    ? <ToggleRight className={`w-10 h-10 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} /> 
                    : <ToggleLeft className={`w-10 h-10 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  }
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Compartir mis diseños
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Permitir que otros usuarios vean mis diseños personalizados
                  </p>
                </div>
                <button 
                  onClick={() => handlePrivacyChange('shareDesigns', !preferences.privacy.shareDesigns)}
                  className="focus:outline-none"
                  aria-label={preferences.privacy.shareDesigns ? "No compartir diseños" : "Compartir diseños"}
                >
                  {preferences.privacy.shareDesigns 
                    ? <ToggleRight className={`w-10 h-10 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} /> 
                    : <ToggleLeft className={`w-10 h-10 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
