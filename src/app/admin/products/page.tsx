'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useUserRole } from '@/context/UserRoleContext';
import { AdminProduct } from '@/types/product';
import { 
  getAdminProducts, 
  deleteAdminProduct, 
  toggleProductInStore
} from '@/services/adminProductService';
import { useRouter } from 'next/navigation';
import Button from '@/components/commons/atoms/Button';
import Text from '@/components/commons/atoms/Text';
import DataTable, { Column } from '@/components/commons/organisms/DataTable';
import PriceFormatter from '@/components/commons/atoms/PriceFormatter';
import DateFormatter from '@/components/commons/atoms/DateFormatter';
import DescriptionCell from '@/components/commons/molecules/DescriptionCell';
import StatusCell from '@/components/commons/molecules/StatusCell';
import ProductActions from '@/components/commons/molecules/ProductActions';

export default function AdminProductsPage() {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  const { isAdmin } = useUserRole();
  const router = useRouter();
  
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [categories, setCategories] = useState<{value: string; label: string}[]>([]);
  
  useEffect(() => {
    loadProducts();
  }, []);
  
  const loadProducts = () => {
    setIsLoading(true);
    const adminProducts = getAdminProducts();
    setProducts(adminProducts);
    
    const uniqueCategories = [...new Set(adminProducts.map(p => p.category))]
      .filter(category => category) 
      .sort((a, b) => a.localeCompare(b, 'es')) 
      .map(category => ({
        value: category,
        label: category
      }));
    
    setCategories(uniqueCategories);
    setIsLoading(false);
  };
  
  const handleDeleteProduct = (id: string) => {
    deleteAdminProduct(id);
    setDeleteConfirmId(null);
    loadProducts();
  };
  
  const handleToggleInStore = (id: string) => {
    const product = toggleProductInStore(id);
    if (product) {
      loadProducts();
    }
  };

  const handleEditProduct = (id: string) => {
    router.push(`/customize?productId=${id}`);
  };
  
  const columns: Column<AdminProduct>[] = [
    {
      id: 'id',
      header: 'ID',
      accessor: 'id',
    },
    {
      id: 'name',
      header: 'Nombre',
      accessor: 'name',
    },
    {
      id: 'description',
      header: 'Descripción',
      accessor: (product) => <DescriptionCell description={product.description} />,
    },
    {
      id: 'price',
      header: 'Precio',
      accessor: (product) => <PriceFormatter amount={product.price} />,
    },
    {
      id: 'status',
      header: 'Estado',
      accessor: (product) => <StatusCell inStore={product.inStore} />,
    },
    {
      id: 'createdAt',
      header: 'Creado',
      accessor: (product) => <DateFormatter timestamp={product.createdAt} format="short" />,
    },
  ];
  
  // Función para renderizar acciones para cada producto
  const renderActions = (product: AdminProduct) => {
    const isDeleting = deleteConfirmId === product.id;
    return (
      <ProductActions 
        product={product} 
        onEdit={() => handleEditProduct(product.id)} 
        onDelete={() => handleDeleteProduct(product.id)} 
        onToggleStore={() => handleToggleInStore(product.id)}
        isDeleting={isDeleting}
        onCancelDelete={() => isDeleting ? setDeleteConfirmId(null) : setDeleteConfirmId(product.id)}
      />
    );
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container mx-auto pt-24 pb-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Text variant="h1" className="mb-2">Administración de Productos</Text>
            <Text variant="body" className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
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
        
        {!isAdmin ? (
          <div className={`border-l-4 p-4 mb-6 ${isDarkMode ? 'bg-yellow-900 border-yellow-600 text-yellow-200' : 'bg-yellow-100 border-yellow-500 text-yellow-700'}`}>
            <p>No tienes permisos de administrador para gestionar productos.</p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : products.length === 0 ? (
          <div className={`rounded-lg border p-8 text-center ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <Text variant="h3" className="mb-4">No hay productos</Text>
            <Text variant="body" className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
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
          <div className={`rounded-lg shadow-md overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <DataTable 
              columns={columns} 
              data={products} 
              keyExtractor={(item) => item.id}
              actions={renderActions}
              searchFields={['name', 'description', 'category'] as (keyof AdminProduct)[]}
              filterOptions={categories}
              filterField={'category' as keyof AdminProduct}
              className="rounded-lg shadow-lg overflow-hidden"
            />
          </div>
        )}
      </div>
    </div>
  );
}
