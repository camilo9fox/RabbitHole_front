'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Tipos de roles disponibles
export type UserRole = 'user' | 'admin';

interface UserRoleContextType {
  role: UserRole;
  isAdmin: boolean;
  setRole: (role: UserRole) => void;
  toggleRole: () => void;
}

// Clave para almacenar el rol en localStorage
const USER_ROLE_KEY = 'user_role';

// Crear el contexto
const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

// Proveedor del contexto
export const UserRoleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>('user');

  // Cargar el rol del localStorage al iniciar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedRole = localStorage.getItem(USER_ROLE_KEY) as UserRole | null;
      if (savedRole && (savedRole === 'user' || savedRole === 'admin')) {
        setRoleState(savedRole);
      }
    }
  }, []);

  // Guardar el rol en localStorage cuando cambie
  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_ROLE_KEY, newRole);
    }
  };

  // Alternar entre roles (útil para desarrollo)
  const toggleRole = () => {
    const newRole = role === 'user' ? 'admin' : 'user';
    setRole(newRole);
  };

  return (
    <UserRoleContext.Provider 
      value={{ 
        role, 
        isAdmin: role === 'admin', 
        setRole, 
        toggleRole 
      }}
    >
      {children}
    </UserRoleContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useUserRole = (): UserRoleContextType => {
  const context = useContext(UserRoleContext);
  if (context === undefined) {
    throw new Error('useUserRole debe ser usado dentro de un UserRoleProvider');
  }
  return context;
};
