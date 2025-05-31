'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';
import { useController } from 'react-hook-form';
import { useTheme } from 'next-themes';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'name' | 'onChange' | 'onBlur'> {
  name: string;
  control: any;
  label?: ReactNode;
  error?: string;
  rules?: any;
  className?: string;
  labelClassName?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({
    name,
    control,
    label,
    error,
    className = '',
    labelClassName = '',
    rules = {},
    ...props
  }: CheckboxProps,
    ref
  ) => {
    const { resolvedTheme } = useTheme();
    const isDarkMode = resolvedTheme === 'dark';

    const {
      field: { onChange, onBlur, value, ref: hookFormRef },
      fieldState: { error: fieldError },
    } = useController({
      name,
      control,
      rules,
    });

    // Estilos para el contenedor del checkbox según el tema
    let bgStyle = '';
    if (value) {
      bgStyle = isDarkMode ? 'bg-gray-800' : 'bg-gray-100';
    }
    
    const hoverStyle = isDarkMode ? 'hover:bg-gray-800/70' : 'hover:bg-gray-50';
    
    const containerStyles = `flex items-center p-2 rounded-lg cursor-pointer transition-all duration-200 ${bgStyle} ${hoverStyle}`;

    // Estilos para el checkbox según el tema
    let checkboxBorderStyle = '';
    if (value) {
      // Siempre usar el mismo estilo para el checkbox seleccionado independientemente del tema
      checkboxBorderStyle = 'bg-accent border-accent';
    } else {
      // Ajustar el borde según el tema
      checkboxBorderStyle = isDarkMode ? 'border-gray-600' : 'border-gray-400';
    }
    
    // Asegurar que el checkbox tenga un buen contraste y sea visible en ambos modos
    const checkboxStyles = `w-5 h-5 border rounded flex items-center justify-center ${checkboxBorderStyle}`;

    return (
      <div className="space-y-1">
        <label className={`${containerStyles} ${className}`}>
          <div className="relative">
            <input
              type="checkbox"
              ref={(e) => {
                // Asignar ambas referencias
                if (typeof ref === 'function') ref(e);
                hookFormRef(e);
              }}
              checked={!!value}
              onChange={(e) => {
                onChange(e.target.checked);
              }}
              onBlur={onBlur}
              className="sr-only"
              {...props}
            />
            <div className={checkboxStyles}>
              {value && (
                <svg width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    fill={isDarkMode ? "#FFFFFF" : "#000000"} 
                    d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" 
                  />
                </svg>
              )}
            </div>
          </div>
          {label && (
            <span className={`ml-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} ${labelClassName}`}>
              {label}
            </span>
          )}
        </label>
        {(error || fieldError?.message) && (
          <div className="text-sm text-red-500 ml-7">
            {error ?? fieldError?.message}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
