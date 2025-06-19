"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useUserRole } from "@/context/UserRoleContext";
import { useRouter } from "next/navigation";
import Button from "@/components/commons/atoms/Button";
import Text from "@/components/commons/atoms/Text";
import DataTable, { Column } from "@/components/commons/organisms/DataTable";
import PriceFormatter from "@/components/commons/atoms/PriceFormatter";
import DescriptionCell from "@/components/commons/molecules/DescriptionCell";
import StatusCell from "@/components/commons/molecules/StatusCell";
import ProductActions from "@/components/commons/molecules/ProductActions";
import { ProductOnGetDTO } from "@/types/productData";
import {
  deleteProduct,
  fetchCategories,
  fetchProducts,
  toggleActiveProduct,
} from "@/services";

export default function AdminProductsPage() {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const { isAdmin } = useUserRole();
  const router = useRouter();

  const [products, setProducts] = useState<ProductOnGetDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [categories, setCategories] = useState<
    { value: string; label: string }[]
  >([]);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const adminProducts = await fetchProducts();
      setProducts(adminProducts);

      setIsLoading(false);
    } catch (error) {
      console.error("Error al cargar productos:", error);
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categories = await fetchCategories();
      setCategories(
        categories.map((category) => ({
          value: category.nombre,
          label: category.nombre,
        }))
      );
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      await deleteProduct(id);
      setDeleteConfirmId(null);
      loadProducts();
    } catch (error) {
      console.error("Error al eliminar producto:", error);
    }
  };

  const handleToggleInStock = async (id: number) => {
    const product = await toggleActiveProduct(id);
    if (product) {
      loadProducts();
    }
  };

  const handleEditProduct = (id: number) => {
    router.push(`/customize?productId=${id}`);
  };

  const columns: Column<ProductOnGetDTO>[] = [
    {
      id: "id",
      header: "ID",
      accessor: "id",
    },
    {
      id: "name",
      header: "Nombre",
      accessor: "nombre",
    },
    {
      id: "description",
      header: "Descripción",
      accessor: (product) => (
        <DescriptionCell description={product.descripcion} />
      ),
    },
    {
      id: "price",
      header: "Precio",
      accessor: (product) => (
        <PriceFormatter amount={product.disenoPersonalizado.precio} />
      ),
    },
    {
      id: "status",
      header: "Estado",
      accessor: (product) => <StatusCell inStock={product.activo === 1} />,
    },
    {
      id: "createdAt",
      header: "Creado",
      accessor: (product) =>
        product.creadoEn
          .filter((_, index) => index in [0, 1, 2])
          .toString()
          .split(",")
          .reverse()
          .join(" - "),
    },
    {
      id: "updatedAt",
      header: "Actualizado",
      accessor: (product) =>
        product.actualizadoEn
          .filter((_, index) => index in [0, 1, 2])
          .toString()
          .split(",")
          .reverse()
          .join(" - "),
    },
    {
      id: "category",
      header: "Categoría",
      accessor: (product) => product.categoriaNombre,
    },
  ];

  // Función para renderizar acciones para cada producto
  const renderActions = (product: ProductOnGetDTO) => {
    const isDeleting = deleteConfirmId === product.id;
    return (
      <ProductActions
        product={product}
        onEdit={() => handleEditProduct(product.id)}
        onDelete={() => handleDeleteProduct(product.id)}
        onToggleStore={() => handleToggleInStock(product.id)}
        isDeleting={isDeleting}
        onCancelDelete={() =>
          isDeleting ? setDeleteConfirmId(null) : setDeleteConfirmId(product.id)
        }
      />
    );
  };

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="container mx-auto pt-24 pb-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Text variant="h1" className="mb-2">
              Administración de Productos
            </Text>
            <Text
              variant="body"
              className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              Gestiona los productos disponibles en la tienda
            </Text>
          </div>
          <Button variant="primary" onClick={() => router.push("/customize")}>
            Crear Nuevo Producto
          </Button>
        </div>

        {!isAdmin ? (
          <div
            className={`border-l-4 p-4 mb-6 ${
              isDarkMode
                ? "bg-yellow-900 border-yellow-600 text-yellow-200"
                : "bg-yellow-100 border-yellow-500 text-yellow-700"
            }`}
          >
            <p>No tienes permisos de administrador para gestionar productos.</p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : products.length === 0 ? (
          <div
            className={`rounded-lg border p-8 text-center ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <Text variant="h3" className="mb-4">
              No hay productos
            </Text>
            <Text
              variant="body"
              className={`mb-6 ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Aún no has creado ningún producto. Comienza creando tu primer
              diseño.
            </Text>
            <Button variant="primary" onClick={() => router.push("/customize")}>
              Crear Primer Producto
            </Button>
          </div>
        ) : (
          <div
            className={`rounded-lg shadow-md overflow-hidden ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <DataTable
              columns={columns}
              data={products}
              keyExtractor={(item) => item.id}
              actions={renderActions}
              searchFields={
                [
                  "nombre",
                  "descripcion",
                  "categoriaNombre",
                ] as (keyof ProductOnGetDTO)[]
              }
              filterOptions={categories}
              filterField={"categoriaNombre" as keyof ProductOnGetDTO}
              className="rounded-lg shadow-lg overflow-hidden"
            />
          </div>
        )}
      </div>
    </div>
  );
}
