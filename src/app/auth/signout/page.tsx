"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import Text from "@/components/commons/atoms/Text";
import Button from "@/components/commons/atoms/Button";
import { LogOut, Home } from "lucide-react";

// Variables de entorno (ajusta según tu config)
const AZURE_AD_B2C_TENANT_NAME =
  process.env.NEXT_PUBLIC_AZURE_AD_B2C_TENANT_NAME!;
const AZURE_AD_B2C_PRIMARY_USER_FLOW =
  process.env.NEXT_PUBLIC_AZURE_AD_B2C_PRIMARY_USER_FLOW!;
const AZURE_AD_B2C_CLIENT_ID = process.env.NEXT_PUBLIC_AZURE_AD_B2C_CLIENT_ID!;

// URL de cierre de sesión para Azure B2C con parámetros adicionales
const LOGOUT_URL = `https://${AZURE_AD_B2C_TENANT_NAME}.b2clogin.com/${AZURE_AD_B2C_TENANT_NAME}.onmicrosoft.com/${AZURE_AD_B2C_PRIMARY_USER_FLOW}/oauth2/v2.0/logout?client_id=${AZURE_AD_B2C_CLIENT_ID}&post_logout_redirect_uri=${encodeURIComponent(
  typeof window !== "undefined"
    ? window.location.origin + "/home"
    : "http://localhost:3000/home"
)}`;

export default function SignOut() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center"></div>
    );
  }

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      // Limpiar tokens y cookies
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
        localStorage.removeItem("next-auth.callback-url");
        localStorage.removeItem("next-auth.session-token");
        sessionStorage.clear();
        document.cookie.split(";").forEach((cookie) => {
          const [name] = cookie.trim().split("=");
          if (
            name.includes("next-auth") ||
            name.includes("__Secure-next-auth")
          ) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; secure; samesite=lax`;
          }
        });
      }
      await signOut({ redirect: false });
      window.location.href = LOGOUT_URL;
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      router.push("/home");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center px-4 py-16 ${
        isDarkMode ? "bg-zinc-900" : "bg-gray-100"
      }`}
    >
      <div
        className={`max-w-md w-full rounded-lg shadow-lg p-8 transition-colors ${
          isDarkMode
            ? "bg-zinc-800 border border-zinc-700"
            : "bg-white border border-gray-200"
        }`}
      >
        <div className="text-center mb-8">
          <Text
            variant="h1"
            className={`text-3xl font-bold mb-2 ${
              isDarkMode ? "text-white" : "text-zinc-900"
            }`}
          >
            Cerrar Sesión
          </Text>
          <Text
            variant="body"
            className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
          >
            ¿Estás seguro que deseas cerrar sesión?
          </Text>
        </div>

        <div className="space-y-4">
          <Button
            variant="primary"
            className="w-full flex items-center justify-center gap-2 py-3 bg-rose-600 hover:bg-rose-700 text-white"
            onClick={handleSignOut}
            disabled={isLoading}
          >
            <LogOut className="h-5 w-5" />
            {isLoading ? "Cerrando sesión..." : "Cerrar sesión"}
          </Button>

          <div className="text-center mt-4">
            <Button
              variant="secondary"
              className={`w-full flex items-center justify-center gap-2 py-2 ${
                isDarkMode
                  ? "bg-zinc-700 hover:bg-zinc-600 text-gray-300"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
              onClick={() => router.push("/home")}
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
