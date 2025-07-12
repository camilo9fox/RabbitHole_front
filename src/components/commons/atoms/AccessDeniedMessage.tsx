"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

interface AccessDeniedMessageProps {
  isDarkMode: boolean;
}

const AccessDeniedMessage: React.FC<AccessDeniedMessageProps> = ({
  isDarkMode,
}) => (
  <div className="container mx-auto px-4 py-8 pt-20 mt-20">
    <div
      className={
        isDarkMode
          ? "p-6 rounded-lg text-center bg-red-900/20"
          : "p-6 rounded-lg text-center bg-red-50"
      }
    >
      <AlertTriangle
        className={
          isDarkMode
            ? "mx-auto h-12 w-12 text-red-500 mb-4"
            : "mx-auto h-12 w-12 text-red-500 mb-4"
        }
      />
      <h2
        className={
          isDarkMode
            ? "text-2xl font-bold text-red-700 mb-2"
            : "text-2xl font-bold text-red-700 mb-2"
        }
      >
        Acceso Denegado
      </h2>
      <p className={isDarkMode ? "text-red-600" : "text-red-600"}>
        No tienes permiso para acceder a esta página. Esta sección está
        reservada para administradores.
      </p>
    </div>
  </div>
);

export default AccessDeniedMessage;
