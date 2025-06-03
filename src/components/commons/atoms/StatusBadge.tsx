import React from 'react';

type StatusType = 'active' | 'inactive' | 'pending' | 'success' | 'warning' | 'danger';

interface StatusBadgeProps {
  status: StatusType;
  text?: string;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  text,
  className = ''
}) => {
  // Determinar el texto a mostrar
  const displayText = text ?? {
    active: 'Activo',
    inactive: 'Inactivo',
    pending: 'Pendiente',
    success: 'Completado',
    warning: 'Advertencia',
    danger: 'Error'
  }[status];
  
  // Determinar las clases de estilo según el estado
  const getStatusClasses = () => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'danger':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };
  
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClasses()} ${className}`}>
      {displayText}
    </span>
  );
};

export default StatusBadge;
