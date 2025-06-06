"use client";

import React from 'react';
import { AlertTriangle } from 'lucide-react';

const AccessDeniedMessage: React.FC = () => (
  <div className="container mx-auto px-4 py-8 pt-20">
    <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg text-center">
      <AlertTriangle className="mx-auto h-12 w-12 text-red-500 dark:text-red-400 mb-4" />
      <h2 className="text-2xl font-bold text-red-700 dark:text-red-300 mb-2">Acceso Denegado</h2>
      <p className="text-red-600 dark:text-red-200">
        No tienes permiso para acceder a esta página. Esta sección está reservada para administradores.
      </p>
    </div>
  </div>
);

export default AccessDeniedMessage;
