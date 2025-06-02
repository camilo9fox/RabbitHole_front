'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useUserRole } from '@/context/UserRoleContext';
import { AdminProduct } from '@/types/product';
import { getAdminProducts, deleteAdminProduct } from '@/services/adminProductService';
import { useRouter } from 'next/navigation';
import Text from '@/components/commons/atoms/Text';
import Button from '@/components/commons/atoms/Button';

export default function AdminProductsPage() {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  const { isAdmin } = useUserRole();
  const router = useRouter();
  
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  // Cargar productos al montar el componente
  useEffect(() => {
    loadProducts();
  }, []);
  
  // Función para cargar productos
  const loadProducts = () => {
    setIsLoading(true);
    const adminProducts = getAdminProducts();
    setProducts(adminProducts);
    setIsLoading(false);
  };
  
  // Función para eliminar un producto
  const handleDeleteProduct = (id: string) => {
    deleteAdminProduct(id);
    setDeleteConfirmId(null);
    loadProducts();
  };
  
  // Función para formatear fecha
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Función para formatear precio
  const formatPrice = (price: number) => {
    return price.toLocaleString('es-CL', {
      style: 'currency',
      currency: 'CLP'
    });
  };
  
  // Si el usuario no es administrador, redirigir a la página principal
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Text variant="h2" className="mb-4 text-center">Acceso Restringido</Text>
        <Text variant="body" className="mb-6 text-center">
          Esta página está reservada para administradores.
        </Text>
        <Button 
          variant="primary"
          onClick={() => router.push('/')}
        >
          Volver al Inicio
        </Button>
      </div>
    );
  }
  
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Text variant="h1" className="mb-2">Administración de Productos</Text>
            <Text variant="body" className="text-gray-500 dark:text-gray-400">
              Gestiona los productos disponibles en la tienda
            </Text>
          </div>
          <Button 
            variant="primary"
            onClick={() => router.push('/customize')}
          >
            Crear Nuevo Producto
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : products.length === 0 ? (
          <div className={`rounded-lg border p-8 text-center ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <Text variant="h3" className="mb-4">No hay productos</Text>
            <Text variant="body" className="mb-6 text-gray-500 dark:text-gray-400">
              Aún no has creado ningún producto. Comienza creando tu primer diseño.
            </Text>
            <Button 
              variant="primary"
              onClick={() => router.push('/customize')}
            >
              Crear Primer Producto
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {products.map(product => (
              <div 
                key={product.id} 
                className={`rounded-lg border overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
              >
                <div className="flex flex-col md:flex-row">
                  {/* Miniatura del producto */}
                  <div className="md:w-48 h-48 flex-shrink-0">
                    {product.thumbnail ? (
                      <img 
                        src={product.thumbnail} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <span className="text-gray-400">Sin imagen</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Información del producto */}
                  <div className="p-4 flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <Text variant="h3" className="mb-1">{product.name}</Text>
                        <Text variant="body" className="text-gray-500 dark:text-gray-400 mb-2">
                          {product.category} • {formatPrice(product.price)}
                        </Text>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="secondary"
                          size="sm"
                          onClick={() => router.push(`/customize?productId=${product.id}`)}
                        >
                          Editar
                        </Button>
                        {deleteConfirmId === product.id ? (
                          <div className="flex space-x-2">
                            <Button 
                              variant="primary"
                              size="sm"
                              onClick={() => handleDeleteProduct(product.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Confirmar
                            </Button>
                            <Button 
                              variant="secondary"
                              size="sm"
                              onClick={() => setDeleteConfirmId(null)}
                            >
                              Cancelar
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            variant="secondary"
                            size="sm"
                            onClick={() => setDeleteConfirmId(product.id)}
                            className="text-red-600 border-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
                          >
                            Eliminar
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <Text variant="body" className="mt-2 line-clamp-2">
                      {product.description}
                    </Text>
                    
                    <div className="mt-4 flex flex-wrap gap-2">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Creado: {formatDate(product.createdAt)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Actualizado: {formatDate(product.updatedAt)}
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Text variant="body" className="text-sm font-medium mb-2">
                        Colores disponibles:
                      </Text>
                      <div className="flex flex-wrap gap-1">
                        {product.availableColors.map((color, index) => (
                          <div 
                            key={index}
                            className="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <Text variant="body" className="text-sm font-medium mb-2">
                        Tallas disponibles:
                      </Text>
                      <div className="flex flex-wrap gap-1">
                        {product.availableSizes.map((size, index) => (
                          <div 
                            key={index}
                            className={`px-2 py-1 text-xs rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
                          >
                            {size}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
