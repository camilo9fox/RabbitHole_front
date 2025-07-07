"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Home,
  Save,
  Edit,
  AlertCircle,
  Globe,
  Map,
} from "lucide-react";
import { API_ROUTES } from "@/config/apiRoutes";
import apiClient from "@/config/apiClient";
import { chileanRegions, citiesByRegion } from "@/utils/chileLocations";

// Interfaz para los datos del perfil de usuario en nuestra aplicación
export interface UserProfileData {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  oid: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  estado: string;
  pais: string;
  codigoPostal: string;
  admin: boolean;
}

export default function AccountPage() {
  const { data: session, status } = useSession();
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [userData, setUserData] = useState<UserProfileData>({
    id: 0,
    email: "",
    nombre: "",
    apellido: "",
    oid: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    estado: "",
    pais: "Chile",
    codigoPostal: "",
    admin: false,
  });

  // Monitorear cambios en userData para debugging
  useEffect(() => {
    if (userData.oid) {
      console.log("Estado actual del userData:", userData);
    }
  }, [userData]);

  const fetchUserData = async () => {
    try {
      const response = await apiClient.get(
        API_ROUTES.users + "/oid/" + session!.profile!.oid,
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        }
      );
      setUserData(response.data);
    } catch (error) {
      console.error("Error al validar token:", error);
      throw error;
    }
  };

  const updateUserData = async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, admin, ...userDataWithoutId } = userData;
    try {
      const response = await apiClient.put(
        API_ROUTES.users + "/" + id,
        userDataWithoutId,
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        }
      );
      setUserData(response.data);
    } catch (error) {
      console.error("Error al actualizar datos:", error);
      throw error;
    }
  };

  // Cargar datos del usuario
  useEffect(() => {
    if (status === "loading") return;

    if (session?.user) {
      fetchUserData();
    }
  }, [session]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value || "",
    }));
  };

  useEffect(() => {
    // Una vez que tenemos los datos, verificamos si hace falta actualizar algún campo
    if (userData.oid && userData.email) {
      console.log("Verificando datos en formulario:", userData);
    }
  }, [userData]);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    try {
      await updateUserData();
      setMessage({
        type: "success",
        text: "Datos actualizados correctamente.",
      });
    } catch (error) {
      console.error("Error al guardar datos:", error);
      setMessage({
        type: "error",
        text: "Error al guardar los datos. Intente nuevamente.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const regionExistsOnArrRegions = (region: string) => {
    return chileanRegions.some((r) => r === region);
  };

  // Si está cargando la sesión, mostramos un loader
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-center container mx-auto px-4 py-12">
      <h1
        className={`text-3xl font-bold mb-6 flex items-center gap-3 ${
          isDarkMode ? "text-white" : "text-gray-800"
        }`}
      >
        <User className="w-8 h-8" />
        Mi cuenta
      </h1>

      <div
        className={`rounded-lg shadow-md overflow-hidden ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        {/* Cabecera con foto de perfil y nombre */}
        <div
          className={`p-6 ${
            isDarkMode ? "bg-gray-700" : "bg-blue-50"
          } flex items-center`}
        >
          <div className="flex-shrink-0">
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl ${
                isDarkMode
                  ? "bg-gray-600 text-white"
                  : "bg-blue-200 text-blue-800"
              }`}
            >
              {userData.nombre.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="ml-6">
            <h2
              className={`text-2xl font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {userData.nombre}
            </h2>
            <p className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              {userData.email}
            </p>
          </div>
        </div>

        {/* Mensaje de confirmación o error */}
        {message.text && (
          <div
            className={`px-6 py-3 mb-0 ${
              message.type === "success"
                ? isDarkMode
                  ? "bg-green-900 text-green-200"
                  : "bg-green-100 text-green-800"
                : isDarkMode
                ? "bg-red-900 text-red-200"
                : "bg-red-100 text-red-800"
            }`}
          >
            <div className="flex items-center">
              {message.type === "error" && (
                <AlertCircle className="w-5 h-5 mr-2" />
              )}
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
                  ? isDarkMode
                    ? "bg-gray-700 text-white hover:bg-gray-600"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  : isDarkMode
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
              type="button"
            >
              {isEditing ? (
                "Cancelar"
              ) : (
                <>
                  <Edit className="w-4 h-4" /> Editar información
                </>
              )}
            </button>
          </div>

          {/* Formulario */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}

            {/* Nombre (given_name) */}
            <div className="space-y-2">
              <label
                htmlFor="given_name"
                className={`block text-sm font-medium ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <User className="inline-block mr-2 w-4 h-4" />
                Nombre
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={userData.nombre || ""}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2 rounded-md border ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white focus:border-blue-400"
                    : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-75 transition-colors`}
              />
            </div>

            {/* Apellido (family_name) */}
            <div className="space-y-2">
              <label
                htmlFor="family_name"
                className={`block text-sm font-medium ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <User className="inline-block mr-2 w-4 h-4" />
                Apellido
              </label>
              <input
                type="text"
                id="apellido"
                name="apellido"
                value={userData.apellido || ""}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2 rounded-md border ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white focus:border-blue-400"
                    : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-75 transition-colors`}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className={`block text-sm font-medium ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <Mail className="inline-block mr-2 w-4 h-4" />
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={userData.email || ""}
                onChange={handleChange}
                disabled={true} // El email no se puede cambiar
                className={`w-full px-4 py-2 rounded-md border ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } disabled:opacity-75 transition-colors`}
              />
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <label
                htmlFor="telefono"
                className={`block text-sm font-medium ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <Phone className="inline-block mr-2 w-4 h-4" />
                Teléfono
              </label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={userData.telefono || ""}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2 rounded-md border ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white focus:border-blue-400"
                    : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-75 transition-colors`}
              />
            </div>

            {/* Dirección (streetAddress) */}
            <div className="space-y-2">
              <label
                htmlFor="direccion"
                className={`block text-sm font-medium ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <MapPin className="inline-block mr-2 w-4 h-4" />
                Dirección
              </label>
              <input
                type="text"
                id="direccion"
                name="direccion"
                value={userData.direccion || ""}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2 rounded-md border ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white focus:border-blue-400"
                    : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-75 transition-colors`}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="pais"
                className={`block text-sm font-medium ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <Globe className="inline-block mr-2 w-4 h-4" />
                País
              </label>
              <input
                type="text"
                id="pais"
                name="pais"
                value={"Chile"}
                onChange={handleChange}
                disabled
                className={`w-full px-4 py-2 rounded-md border ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white focus:border-blue-400"
                    : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-75 transition-colors`}
              />
            </div>

            {/* Estado/Provincia (state) */}
            <div className="space-y-2">
              <label
                htmlFor="estado"
                className={`block text-sm font-medium ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <Map className="inline-block mr-2 w-4 h-4" />
                Región
              </label>
              <select
                id="estado"
                name="estado"
                value={userData.estado || ""}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2 rounded-md border ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white focus:border-blue-400"
                    : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-75 transition-colors`}
              >
                <option value="">Seleccionar región</option>
                {chileanRegions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="ciudad"
                className={`block text-sm font-medium ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <Home className="inline-block mr-2 w-4 h-4" />
                Ciudad
              </label>
              <select
                id="ciudad"
                name="ciudad"
                value={userData?.ciudad || ""}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2 rounded-md border ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white focus:border-blue-400"
                    : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-75 transition-colors`}
              >
                <option value="">Seleccionar ciudad</option>
                {regionExistsOnArrRegions(userData?.estado)
                  ? citiesByRegion[
                      userData?.estado ?? "Arica y Parinacota"
                    ].map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))
                  : ""}
              </select>
            </div>

            {/* Código postal */}
            <div className="space-y-2">
              <label
                htmlFor="codigoPostal"
                className={`block text-sm font-medium ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <MapPin className="inline-block mr-2 w-4 h-4" />
                Código postal
              </label>
              <input
                type="text"
                id="codigoPostal"
                name="codigoPostal"
                value={userData.codigoPostal || ""}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2 rounded-md border ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white focus:border-blue-400"
                    : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
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
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-green-500 hover:bg-green-600 text-white"
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
        <h2
          className={`text-xl font-semibold mb-4 ${
            isDarkMode ? "text-white" : "text-gray-800"
          }`}
        >
          ¿Qué puedes hacer en esta página?
        </h2>
        <ul
          className={`list-disc pl-5 ${
            isDarkMode ? "text-gray-300" : "text-gray-600"
          }`}
        >
          <li className="mb-2">Ver y editar tu información personal</li>
          <li className="mb-2">
            Actualizar tu dirección de envío para futuros pedidos
          </li>
          <li className="mb-2">
            Mantener tu información de contacto actualizada
          </li>
        </ul>
      </div>
    </div>
  );
}
