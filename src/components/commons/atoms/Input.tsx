'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';
import { useController } from 'react-hook-form';
import { useTheme } from 'next-themes';

type InputElement = HTMLInputElement | HTMLSelectElement;

interface InputProps extends Omit<InputHTMLAttributes<InputElement>, 'name' | 'value' | 'onChange' | 'onBlur'> {
  name: string;
  control: any;
  label?: string;
  error?: string;
  rules?: any;
  as?: 'select';
  className?: string;
  children?: ReactNode;
  value?: any;
}

const Input = forwardRef<HTMLInputElement | HTMLSelectElement, InputProps>(
  ({
    name,
    control,
    label,
    error,
    className = '',
    rules = {},
    ...props
  }: InputProps,
    ref
  ) => {
    const {
      field: { onChange: controllerOnChange, onBlur, value },
      fieldState: { error: fieldError },
    } = useController({
      name,
      control,
      rules,
    });

    const baseStyles = 'w-full rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-transparent px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-white/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all duration-200';

    const renderInput = () => {
      if (props.as === 'select') {
        return (
          <select
            ref={ref as React.RefCallback<HTMLSelectElement>}
            value={value}
            onChange={controllerOnChange}
            onBlur={onBlur}
            className={`${baseStyles} ${error || fieldError?.message ? 'border-red-500' : ''} ${className}`}
          >
            {props.children}
          </select>
        );
      }

      return (
        <input
          ref={ref as React.RefCallback<HTMLInputElement>}
          value={value}
          onChange={controllerOnChange}
          onBlur={onBlur}
          className={`${baseStyles} ${error || fieldError?.message ? 'border-red-500' : ''} ${className}`}
          {...props}
        />
      );
    };

    // Usar useTheme para obtener el tema actual
    const { resolvedTheme } = useTheme();
    const isDarkMode = resolvedTheme === 'dark';
    
    return (
      <div className="space-y-2">
        {label && (
          <label htmlFor={name} className={`text-sm ${isDarkMode ? 'text-white/90' : 'text-gray-700'}`}>
            {label}
          </label>
        )}
        {renderInput()}
        {(error || fieldError?.message) && (
          <div className="text-sm text-red-500">
            {error ?? fieldError?.message}
          </div>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
