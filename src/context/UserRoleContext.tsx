"use client";

import { validateToken } from "@/services/userService";
import { useSession } from "next-auth/react";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from "react";

// Tipos de roles disponibles
export type UserRole = "user" | "admin";

interface UserRoleContextType {
  role: UserRole;
  isAdmin: boolean;
}

// Crear el contexto
const UserRoleContext = createContext<UserRoleContextType | undefined>(
  undefined
);

// Proveedor del contexto
export const UserRoleProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [role, setRole] = useState<UserRole>("user");
  const { data: session } = useSession();

  // Cargar el rol del localStorage al iniciar
  useEffect(() => {
    validateUserRole();
  }, [session]);

  useEffect(() => {
    console.log({ role });
  }, [role]);

  const validateUserRole = async () => {
    try {
      if (!session?.accessToken) return;
      const res = await validateToken(session.accessToken);
      if (res.admin) {
        setRole("admin");
      } else {
        setRole("user");
      }
    } catch (error) {
      console.error("Error al validar token:", error);
      throw error;
    }
  };

  const contextValue = useMemo(
    () => ({
      role,
      isAdmin: role === "admin",
    }),
    [role]
  );

  return (
    <UserRoleContext.Provider value={contextValue}>
      {children}
    </UserRoleContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useUserRole = (): UserRoleContextType => {
  const context = useContext(UserRoleContext);
  if (context === undefined) {
    throw new Error("useUserRole debe ser usado dentro de un UserRoleProvider");
  }
  return context;
};
