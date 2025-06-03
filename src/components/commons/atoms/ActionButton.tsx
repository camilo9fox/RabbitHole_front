import React from 'react';
import { useTheme } from 'next-themes';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'warning';

interface ActionButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: ButtonVariant;
  className?: string;
  disabled?: boolean;
  title?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  className = '',
  disabled = false,
  title
}) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'secondary':
        return isDarkMode 
          ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
          : 'bg-gray-200 hover:bg-gray-300 text-gray-800';
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white';
      case 'warning':
        return 'bg-yellow-500 hover:bg-yellow-600 text-white';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`px-3 py-1 rounded text-xs font-medium transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
        getVariantClasses()
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      {children}
    </button>
  );
};

export default ActionButton;
