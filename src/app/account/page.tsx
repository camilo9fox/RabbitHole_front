'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, MapPin, Home, Save, Edit, AlertCircle } from 'lucide-react';

interface UserProfileData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
}

export default function AccountPage() {
  const { data: session, status } = useSession();
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  const router = useRouter();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [userData, setUserData] = useState<UserProfileData>({
    id: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  });

  // Cargar datos del usuario
  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      router.push('/home');
      return;
    }
    
    // Si el usuario está autenticado, cargamos datos
    if (session?.user) {
      // Intentamos obtener datos del localStorage primero
      try {
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
          // Si hay datos guardados, los usamos
          const parsedData = JSON.parse(storedUserData);
          setUserData(parsedData);
        } else {
          // Si no hay datos guardados, usamos los de la sesión
          setUserData({
            id: session.user.id || '',
            name: session.user.name || '',
            email: session.user.email || '',
            phone: '',
            address: '',
            city: '',
            postalCode: '',
          });
          
          // Y los guardamos en localStorage para futuras ediciones
          localStorage.setItem('userData', JSON.stringify({
            id: session.user.id || '',
            name: session.user.name || '',
            email: session.user.email || '',
            phone: '',
            address: '',
            city: '',
            postalCode: '',
          }));
        }
      } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
      }
    }
  }, [session, status, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    try {
      // Simular una petición al backend para guardar los datos
      await new Promise(resolve => setTimeout(resolve, 800)); // Simular delay

      // Guardamos en localStorage (esto se reemplazaría por una llamada a la API)
      localStorage.setItem('userData', JSON.stringify(userData));
      
      setIsEditing(false);
      setMessage({ 
        type: 'success', 
        text: 'Datos guardados correctamente' 
      });
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      console.error('Error al guardar datos:', error);
      setMessage({ 
        type: 'error', 
        text: 'Error al guardar los datos. Intente nuevamente.' 
      });
    } finally {
      setIsSaving(false);
    }
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
    <div className="container mx-auto px-4 py-8">
      <h1 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        Mi Cuenta
      </h1>

      <div className={`rounded-lg shadow-md overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        {/* Cabecera con foto de perfil y nombre */}
        <div className={`p-6 ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'} flex items-center`}>
          <div className="flex-shrink-0">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl ${isDarkMode ? 'bg-gray-600 text-white' : 'bg-blue-200 text-blue-800'}`}>
              {userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
          <div className="ml-6">
            <h2 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {userData.name}
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {userData.email}
            </p>
          </div>
        </div>

        {/* Mensaje de confirmación o error */}
        {message.text && (
          <div className={`px-6 py-3 mb-0 ${message.type === 'success' 
            ? (isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800') 
            : (isDarkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800')}`
          }>
            <div className="flex items-center">
              {message.type === 'error' && <AlertCircle className="w-5 h-5 mr-2" />}
              {message.text}
            </div>
          </div>
        )}

        <div className="p-6">
          {/* Botón Editar/Cancelar */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                isEditing 
                ? (isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300') 
                : (isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600')
              }`}
              type="button"
            >
              {isEditing ? 'Cancelar' : <><Edit className="w-4 h-4" /> Editar información</>}
            </button>
          </div>

          {/* Formulario */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div className="space-y-2">
              <label 
                htmlFor="name" 
                className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
              >
                <User className="inline-block mr-2 w-4 h-4" />
                Nombre completo
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={userData.name}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2 rounded-md border ${
                  isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-75 transition-colors`}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label 
                htmlFor="email" 
                className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
              >
                <Mail className="inline-block mr-2 w-4 h-4" />
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={userData.email}
                onChange={handleChange}
                disabled={true} // El email no se puede cambiar
                className={`w-full px-4 py-2 rounded-md border ${
                  isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
                } disabled:opacity-75 transition-colors`}
              />
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <label 
                htmlFor="phone" 
                className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
              >
                <Phone className="inline-block mr-2 w-4 h-4" />
                Teléfono
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={userData.phone || ''}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2 rounded-md border ${
                  isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-75 transition-colors`}
              />
            </div>

            {/* Dirección */}
            <div className="space-y-2">
              <label 
                htmlFor="address" 
                className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
              >
                <MapPin className="inline-block mr-2 w-4 h-4" />
                Dirección
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={userData.address || ''}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2 rounded-md border ${
                  isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-75 transition-colors`}
              />
            </div>

            {/* Ciudad */}
            <div className="space-y-2">
              <label 
                htmlFor="city" 
                className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
              >
                <Home className="inline-block mr-2 w-4 h-4" />
                Ciudad
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={userData.city || ''}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2 rounded-md border ${
                  isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-75 transition-colors`}
              />
            </div>

            {/* Código postal */}
            <div className="space-y-2">
              <label 
                htmlFor="postalCode" 
                className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
              >
                <MapPin className="inline-block mr-2 w-4 h-4" />
                Código postal
              </label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                value={userData.postalCode || ''}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2 rounded-md border ${
                  isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-75 transition-colors`}
              />
            </div>
          </div>

          {/* Botón guardar */}
          {isEditing && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`flex items-center gap-2 px-6 py-2 rounded-md transition-colors ${
                  isDarkMode 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
                } disabled:opacity-50`}
                type="button"
              >
                {isSaving ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2"></span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Guardar cambios
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          ¿Qué puedes hacer en esta página?
        </h2>
        <ul className={`list-disc pl-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          <li className="mb-2">Ver y editar tu información personal</li>
          <li className="mb-2">Actualizar tu dirección de envío para futuros pedidos</li>
          <li className="mb-2">Mantener tu información de contacto actualizada</li>
        </ul>
      </div>
    </div>
  );
}
