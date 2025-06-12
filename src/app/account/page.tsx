'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, MapPin, Home, Save, Edit, AlertCircle, Globe, Map } from 'lucide-react';

// Interfaz para los datos que vienen de MSAL
interface MsalUserData {
  id?: string;
  oid?: string;
  name?: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  country?: string;
  image?: string;
}

// Interfaz para los datos del perfil de usuario en nuestra aplicación
interface UserProfileData {
  oid: string;
  name: string;
  email: string;
  given_name: string;
  family_name: string;
  streetAddress: string;
  city: string;
  state: string;
  country: string;
  phone?: string;
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
    oid: '',
    name: '',
    email: '',
    given_name: '',
    family_name: '',
    streetAddress: '',
    city: '',
    state: '',
    country: '',
    phone: '',
    postalCode: '',
  });

  // Monitorear cambios en userData para debugging
  useEffect(() => {
    if (userData.oid) {
      console.log('Estado actual del userData:', userData);
    }
  }, [userData]);
  
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

          // Si no hay datos guardados, usamos los de la sesión y MSAL
          // Accedemos de forma segura a los atributos MSAL con tipo correcto
          const user = session.user as MsalUserData;
          console.log({session})
          
          // Extraemos nombre y apellido del nombre completo si no vienen por separado
          const nameParts = user.name ? user.name.split(' ') : ['', ''];
          const firstName = user.given_name ?? nameParts[0] ?? '';
          const lastName = user.family_name ?? nameParts.slice(1).join(' ') ?? '';
          
          // Accedemos a los datos de la sesión directamente desde las propiedades correctas
          const newUserData: UserProfileData = {
            oid: (user.id as string) ?? (session.profile?.oid as string) ?? '',              // Usamos el ID de usuario como identificador principal
            name: user.name ?? '',                                 // Nombre completo
            email: user.email ?? (session.profile && Array.isArray(session.profile.emails) ? session.profile.emails[0] : ''), // Email desde el array de emails si está disponible
            given_name: user.given_name ?? firstName,              // Nombre
            family_name: user.family_name ?? lastName,             // Apellido
            streetAddress: (user.streetAddress as string) ?? (session.profile?.streetAddress as string) ?? '', // Dirección
            city: (user.city as string) ?? (session.profile?.city as string) ?? '',         // Ciudad
            state: (user.state as string) ?? (session.profile?.state as string) ?? '',      // Estado/Provincia
            country: (user.country as string) ?? (session.profile?.country as string) ?? '', // País
            phone: '',                                            // Teléfono (no viene en MSAL)
            postalCode: '',                                       // Código postal (no viene en MSAL)
          };
          
          // Debuggear los campos disponibles en la sesión para verificar
          console.log('Datos de sesión disponibles:', user);
          
          setUserData(newUserData);
          // Verificamos explícitamente que todos los campos estén disponibles
          console.log('Datos a guardar en estado:', {
            oid: newUserData.oid,
            name: newUserData.name,
            email: newUserData.email,
            given_name: newUserData.given_name,
            family_name: newUserData.family_name,
            streetAddress: newUserData.streetAddress,
            city: newUserData.city,
            state: newUserData.state,
            country: newUserData.country,
          });
          console.log('Datos inicializados desde MSAL:', newUserData);
          
          // Y los guardamos en localStorage para futuras ediciones
          // Esto simularía el guardado en BD la primera vez que el usuario inicia sesión
          localStorage.setItem('userData', JSON.stringify(newUserData));
          console.log('Datos guardados en localStorage por primera vez');

    }
  }, [session, status, router]);

  // Manejar cambios en los campos del formulario
  // Asegurándonos de que siempre actualicemos con string (nunca undefined)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value || ''
    }));
  };

  useEffect(() => {
    // Una vez que tenemos los datos, verificamos si hace falta actualizar algún campo
    if (userData.oid && userData.email) {
      console.log('Verificando datos en formulario:', userData);
    }
  }, [userData]);

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
      
      // Configuramos un timeout para limpiar el mensaje
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
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-center container mx-auto px-4 py-12">
      <h1 className={`text-3xl font-bold mb-6 flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        <User className="w-8 h-8" />
        Mi cuenta
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
                value={userData.name || ''}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2 rounded-md border ${
                  isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-75 transition-colors`}
              />
            </div>
            
            {/* Nombre (given_name) */}
            <div className="space-y-2">
              <label 
                htmlFor="given_name" 
                className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
              >
                <User className="inline-block mr-2 w-4 h-4" />
                Nombre
              </label>
              <input
                type="text"
                id="given_name"
                name="given_name"
                value={userData.given_name || ''}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2 rounded-md border ${
                  isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-75 transition-colors`}
              />
            </div>
            
            {/* Apellido (family_name) */}
            <div className="space-y-2">
              <label 
                htmlFor="family_name" 
                className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
              >
                <User className="inline-block mr-2 w-4 h-4" />
                Apellido
              </label>
              <input
                type="text"
                id="family_name"
                name="family_name"
                value={userData.family_name || ''}
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
                value={userData.email || ''}
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

            {/* Dirección (streetAddress) */}
            <div className="space-y-2">
              <label 
                htmlFor="streetAddress" 
                className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
              >
                <MapPin className="inline-block mr-2 w-4 h-4" />
                Dirección
              </label>
              <input
                type="text"
                id="streetAddress"
                name="streetAddress"
                value={userData.streetAddress || ''}
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

            {/* Estado/Provincia (state) */}
            <div className="space-y-2">
              <label 
                htmlFor="state" 
                className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
              >
                <Map className="inline-block mr-2 w-4 h-4" />
                Estado/Provincia
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={userData.state || ''}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2 rounded-md border ${
                  isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-75 transition-colors`}
              />
            </div>
            
            {/* País (country) */}
            <div className="space-y-2">
              <label 
                htmlFor="country" 
                className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
              >
                <Globe className="inline-block mr-2 w-4 h-4" />
                País
              </label>
              <input
                type="text"
                id="country"
                name="country"
                value={userData.country || ''}
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
