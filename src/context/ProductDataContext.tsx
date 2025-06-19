"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  fetchColors,
  fetchSizes,
  fetchFonts,
  fetchCategories,
} from "@/services";
import {
  ColorOption,
  SizeOption,
  FontOption,
  ProductCategoryDTO,
} from "@/types/productData";

interface ProductDataContextType {
  colors: ColorOption[];
  sizes: SizeOption[];
  fonts: FontOption[];
  categories: ProductCategoryDTO[];
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>; // Función para refrescar los datos manualmente
}

const ProductDataContext = createContext<ProductDataContextType | undefined>(
  undefined
);

export const ProductDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [colors, setColors] = useState<ColorOption[]>([]);
  const [sizes, setSizes] = useState<SizeOption[]>([]);
  const [fonts, setFonts] = useState<FontOption[]>([]);
  const [categories, setCategories] = useState<ProductCategoryDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para cargar datos del backend
  const loadProductData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      //Obtener datos usando los servicios
      const [colorsData, sizesData, fontsData, categoriesData] =
        await Promise.all([
          fetchColors(),
          fetchSizes(),
          fetchFonts(),
          fetchCategories(),
        ]);

      setColors(colorsData);
      setSizes(sizesData);
      setFonts(fontsData);
      setCategories(categoriesData);
    } catch (err: unknown) {
      console.error("Error fetching product data:", err);
      setError((err as Error).message ?? "Error al cargar datos de productos");

      // Usar datos por defecto en caso de error para no bloquear la aplicación
      setColors(getDefaultColors());
      setSizes(getDefaultSizes());
      setFonts(getDefaultFonts());
      setCategories(getDefaultCategories());
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadProductData();
  }, [loadProductData]);

  // Función para refrescar datos manualmente
  const refreshData = useCallback(async () => {
    await loadProductData();
  }, [loadProductData]);

  // Memoizar el valor del contexto para evitar renderizaciones innecesarias
  const contextValue = useMemo(
    () => ({
      colors,
      sizes,
      fonts,
      categories,
      isLoading,
      error,
      refreshData,
    }),
    [colors, sizes, fonts, categories, isLoading, error, refreshData]
  );

  return (
    <ProductDataContext.Provider value={contextValue}>
      {children}
    </ProductDataContext.Provider>
  );
};

// Hook personalizado para acceder al contexto
export const useProductData = () => {
  const context = useContext(ProductDataContext);
  if (context === undefined) {
    throw new Error(
      "useProductData debe ser utilizado dentro de un ProductDataProvider"
    );
  }
  return context;
};

// Funciones para obtener datos por defecto en caso de error
function getDefaultColors(): ColorOption[] {
  return [
    {
      id: "white",
      label: "Blanco",
      value: "#FFFFFF",
      textPreview: "#000000",
      priceModifier: 0,
    },
    {
      id: "black",
      label: "Negro",
      value: "#1A1A1A",
      textPreview: "#FFFFFF",
      priceModifier: 0,
    },
    {
      id: "gray",
      label: "Gris",
      value: "#808080",
      textPreview: "#FFFFFF",
      priceModifier: 0,
    },
  ];
}

function getDefaultSizes(): SizeOption[] {
  return [
    { id: "s", label: "S", priceModifier: 0 },
    { id: "m", label: "M", priceModifier: 0 },
    { id: "l", label: "L", priceModifier: 0 },
    { id: "xl", label: "XL", priceModifier: 500 },
  ];
}

function getDefaultFonts(): FontOption[] {
  return [
    { id: "arial", label: "Arial", value: "Arial" },
    { id: "roboto", label: "Roboto", value: "Roboto" },
    { id: "opensans", label: "Open Sans", value: "Open Sans" },
  ];
}

function getDefaultCategories(): ProductCategoryDTO[] {
  return [
    { id: "1", nombre: "Minimalista", descripcion: "Poleras" },
    { id: "2", nombre: "Moderno", descripcion: "Poleras" },
    { id: "3", nombre: "Retro", descripcion: "Poleras" },
  ];
}
