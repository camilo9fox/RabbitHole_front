'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import Text from '@/components/commons/atoms/Text';
// No necesitamos Image por ahora
import { useFormContext } from 'react-hook-form';

interface AdminProductFieldsProps {
  productId?: string;
  thumbnail?: string;
}

const AdminProductForm: React.FC<AdminProductFieldsProps> = ({ productId }) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  const isEditing = !!productId;
  
  // Usamos useFormContext para acceder al formulario principal
  const { register, formState: { errors } } = useFormContext();
  
  return (
    <div className={`admin-product-fields space-y-4 mt-4 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white border border-gray-200'}`}>
      <Text variant="h3" className={`mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{isEditing ? 'Editar Producto' : 'Datos del Producto'}</Text>
      
      <div className="mb-4">
        <label htmlFor="admin-name">
          <Text variant="body" className={`mb-2 font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Nombre del Producto</Text>
        </label>
        <input
          id="admin-name"
          type="text"
          className={`w-full p-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
          placeholder="Nombre del producto"
          {...register('admin.name', { required: 'El nombre es obligatorio' })}
        />
        {errors.admin && 'name' in errors.admin && (
          <Text variant="small" className="text-red-500 mt-1">
            El nombre es obligatorio
          </Text>
        )}
      </div>
      
      <div className="mb-4">
        <label htmlFor="admin-description">
          <Text variant="body" className={`mb-2 font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Descripción</Text>
        </label>
        <textarea
          id="admin-description"
          className={`w-full p-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
          placeholder="Descripción del producto"
          rows={3}
          {...register('admin.description', { required: 'La descripción es obligatoria' })}
        />
        {errors.admin && 'description' in errors.admin && (
          <Text variant="small" className="text-red-500 mt-1">
            La descripción es obligatoria
          </Text>
        )}
      </div>
      
      <div className="mb-4">
        <label htmlFor="admin-category">
          <Text variant="body" className={`mb-2 font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Categoría</Text>
        </label>
        <input
          id="admin-category"
          type="text"
          className={`w-full p-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
          placeholder="Categoría del producto (ej: Urbano, Minimalista, etc.)"
          {...register('admin.category', { required: 'La categoría es obligatoria' })}
        />
        {errors.admin && 'category' in errors.admin && (
          <Text variant="small" className="text-red-500 mt-1">
            La categoría es obligatoria
          </Text>
        )}
      </div>
    </div>
  );
};

export default AdminProductForm;
