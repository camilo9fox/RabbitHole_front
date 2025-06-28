"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  Cart,
  CartItemType,
  StandardProduct,
  CustomDesign,
  CustomDesignStatus,
  ProductCartItem,
  CustomCartItem,
  CustomView,
} from "../types/cart";
import {
  DisenoPersonalizadoDTO,
  AnguloDTO,
  ElementoDTO,
} from "../types/personalizedDesign";

/**
 * Convierte un diseño personalizado del formato frontend (CustomDesign)
 * al formato DTO del backend (DisenoPersonalizadoDTO)
 *
 * @param design - El diseño personalizado en formato frontend
 * @param usuarioId - ID del usuario (opcional)
 * @returns Un objeto DisenoPersonalizadoDTO listo para enviar al backend
 */
export const convertCustomDesignToDTO = (
  design: CustomDesign,
  usuarioId?: number | string
): DisenoPersonalizadoDTO => {
  // Función auxiliar para crear ElementoDTO
  const createViewElemento = (view: CustomView): ElementoDTO => ({
    tipo: view.image ? "IMAGEN" : "TEXTO",
    propiedadesDiseno: {
      posicionX: view.image ? view.imagePositionX : view.textPositionX,
      posicionY: view.image ? view.imagePositionY : view.textPositionY,
      anchura: view.image ? view.imageWidth : 0,
      altura: view.image ? view.imageHeight : 0,
      rotacion: 0,
    },
    propiedadesElemento: {
      texto: view.text === "" ? undefined : view.text,
      fuenteId: view.text === "" ? undefined : Number(view.textFont),
      colorId: view.text === "" ? undefined : view.textColor,
      tamano: view.text === "" ? undefined : view.textSize,
      url: view.image ?? "",
    },
  });

  // Crear ángulos para todas las vistas
  let angulos: AnguloDTO[] = [
    // Vista frontal
    {
      id: 0,
      tipoAnguloId: 1,
      nombreAngulo: "Frente",
      thumbnailBase64: design.front.previewImage,
      elemento: createViewElemento(design.front),
    },
    // Vista trasera
    {
      id: 0,
      tipoAnguloId: 2,
      nombreAngulo: "Espalda",
      thumbnailBase64: design.back.previewImage,
      elemento: createViewElemento(design.back),
    },
    // Vista izquierda
    {
      id: 0,
      tipoAnguloId: 3,
      nombreAngulo: "Izquierda",
      thumbnailBase64: design.left.previewImage,
      elemento: createViewElemento(design.left),
    },
    // Vista derecha
    {
      id: 0,
      tipoAnguloId: 4,
      nombreAngulo: "Derecha",
      thumbnailBase64: design.right.previewImage,
      elemento: createViewElemento(design.right),
    },
  ];

  if (!design.front.image && (!design.front.text || design.front.text === "")) {
    angulos = angulos.filter((angulo) => angulo.tipoAnguloId !== 1);
  }

  if (!design.back.image && (!design.back.text || design.back.text === "")) {
    angulos = angulos.filter((angulo) => angulo.tipoAnguloId !== 2);
  }

  if (!design.left.image && (!design.left.text || design.left.text === "")) {
    angulos = angulos.filter((angulo) => angulo.tipoAnguloId !== 3);
  }

  if (!design.right.image && (!design.right.text || design.right.text === "")) {
    angulos = angulos.filter((angulo) => angulo.tipoAnguloId !== 4);
  }

  // Mapear el estado del diseño al estadoId del backend
  const mapEstado = (): number => {
    switch (design.status) {
      case CustomDesignStatus.APPROVED:
        return 2;
      case CustomDesignStatus.REJECTED:
        return 3;
      case CustomDesignStatus.MODIFICATION_REQUESTED:
        return 4;
      case CustomDesignStatus.PENDING:
      default:
        return 1; // Por defecto estado "Pendiente"
    }
  };

  // Convertir ID de usuario a número
  const numericUserId = 1;
  // if (usuarioId) {
  //   numericUserId = typeof usuarioId === "string" ? parseInt(usuarioId) : Number(usuarioId);
  // }

  // Extraer ID de un objeto o convertir a string
  const extractId = (value: unknown): string => {
    if (typeof value === "object" && value !== null) {
      // Usamos una interfaz para definir la estructura esperada
      interface IdObject {
        id?: string | number;
        valorHex?: string; // Para objetos Color
      }
      const obj = value as IdObject;
      // Usamos el ID si existe, caso contrario manejamos mejor la conversión a string
      if (obj.id) {
        return String(obj.id);
      } else if (obj.valorHex) {
        return obj.valorHex; // Para objetos Color que tienen valorHex
      } else {
        // Evitamos [object Object] como resultado
        return "";
      }
    }
    return String(value);
  };

  // Construir y retornar el DTO
  return {
    usuarioId: numericUserId,
    detalle: design.name ?? "",
    cantidad: design.quantity,
    colorId: extractId(design.color),
    tallaId: extractId(design.size),
    precio: design.price || 0,
    estadoId: mapEstado(),
    creadoPorAdmin: false,
    angulos,
  };
};

// Estado inicial del carrito
const initialCart: Cart = {
  items: [],
  totalPrice: 0,
  totalItems: 0,
};

// Acciones para el reducer
type CartAction =
  | { type: "ADD_STANDARD_ITEM"; product: StandardProduct; quantity: number }
  | { type: "ADD_CUSTOM_ITEM"; design: CustomDesign; quantity: number }
  | { type: "REMOVE_ITEM"; itemIndex: number }
  | { type: "UPDATE_QUANTITY"; itemIndex: number; quantity: number }
  | { type: "CLEAR_CART" }
  | {
      type: "UPDATE_CUSTOM_DESIGN_STATUS";
      designId: string;
      status: CustomDesignStatus;
      notes?: string;
    };

// Reducer para manejar las acciones del carrito
const cartReducer = (state: Cart, action: CartAction): Cart => {
  switch (action.type) {
    case "ADD_STANDARD_ITEM": {
      const { product, quantity } = action;

      // Verificar si el producto ya está en el carrito
      const existingItemIndex = state.items.findIndex(
        (item) =>
          item.type === CartItemType.STANDARD &&
          "product" in item &&
          item.product?.id === product.id &&
          item.product?.size === product.size &&
          item.product?.color === product.color
      );

      if (existingItemIndex >= 0) {
        // Actualizar cantidad si ya existe
        const updatedItems = [...state.items];
        const existingItem = updatedItems[existingItemIndex] as {
          quantity: number;
        };
        existingItem.quantity += quantity;

        return {
          ...state,
          items: updatedItems,
          totalItems: state.totalItems + quantity,
          totalPrice: state.totalPrice + product.price * quantity,
        };
      }

      // Agregar nuevo item si no existe
      const newItem: ProductCartItem = {
        id: crypto.randomUUID(), // Generar un ID único para este item
        type: CartItemType.STANDARD,
        productId: product.id,
        color: product.color,
        size: product.size,
        quantity,
        unitPrice: product.price,
        price: product.price,
        product, // Mantener el producto completo para compatibilidad
      };

      return {
        ...state,
        items: [...state.items, newItem],
        totalItems: state.totalItems + quantity,
        totalPrice: state.totalPrice + product.price * quantity,
      };
    }

    case "ADD_CUSTOM_ITEM": {
      const { design, quantity } = action;
      const price = design.price; // Usamos el precio del diseño personalizado

      // Los diseños personalizados siempre se agregan como nuevos items
      const newItem: CustomCartItem = {
        id: design.id || crypto.randomUUID(), // Usar el ID del diseño o generar uno nuevo
        type: CartItemType.CUSTOM,
        designId: design.id,
        quantity,
        unitPrice: price,
        price,
        design, // Mantener el diseño completo para compatibilidad
      };

      return {
        ...state,
        items: [...state.items, newItem],
        totalItems: state.totalItems + quantity,
        totalPrice: state.totalPrice + price * quantity,
      };
    }

    case "REMOVE_ITEM": {
      const { itemIndex } = action;
      const itemToRemove = state.items[itemIndex];

      if (!itemToRemove) return state;

      const itemPrice = (itemToRemove.price ?? 0) * itemToRemove.quantity;

      return {
        ...state,
        items: state.items.filter((_, index) => index !== itemIndex),
        totalItems: state.totalItems - itemToRemove.quantity,
        totalPrice: state.totalPrice - itemPrice,
      };
    }

    case "UPDATE_QUANTITY": {
      const { itemIndex, quantity } = action;

      if (itemIndex < 0 || itemIndex >= state.items.length || quantity <= 0) {
        return state;
      }

      const updatedItems = [...state.items];
      const item = updatedItems[itemIndex];
      const priceDifference = (item.price ?? 0) * (quantity - item.quantity);

      updatedItems[itemIndex] = {
        ...item,
        quantity,
      };

      return {
        ...state,
        items: updatedItems,
        totalItems: state.totalItems + (quantity - item.quantity),
        totalPrice: state.totalPrice + priceDifference,
      };
    }

    case "CLEAR_CART": {
      return initialCart;
    }

    case "UPDATE_CUSTOM_DESIGN_STATUS": {
      const { designId, status, notes } = action;

      const updatedItems = state.items.map((item) => {
        if (
          item.type === CartItemType.CUSTOM &&
          "design" in item &&
          item.design?.id === designId
        ) {
          return {
            ...item,
            design: {
              ...item.design,
              status,
              ...(status === CustomDesignStatus.REJECTED && {
                rejectionReason: notes,
              }),
              ...(status === CustomDesignStatus.MODIFICATION_REQUESTED && {
                modificationNotes: notes,
              }),
              updatedAt: new Date(),
            },
          };
        }
        return item;
      });

      return {
        ...state,
        items: updatedItems,
      };
    }

    default:
      return state;
  }
};

// Crear el contexto
interface CartContextProps {
  cart: Cart;
  addStandardItem: (product: StandardProduct, quantity: number) => void;
  addCustomItem: (design: CustomDesign, quantity: number) => void;
  removeItem: (itemIndex: number) => void;
  updateQuantity: (itemIndex: number, quantity: number) => void;
  clearCart: () => void;
  updateCustomDesignStatus: (
    designId: string,
    status: CustomDesignStatus,
    notes?: string
  ) => void;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

// Proveedor del contexto
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Cargar carrito del localStorage si existe
  const [cart, dispatch] = useReducer(cartReducer, initialCart, () => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);

        // Recalcular totalItems y totalPrice para asegurarnos que sean correctos
        let totalItems = 0;
        let totalPrice = 0;

        if (Array.isArray(parsedCart.items)) {
          // Definimos un tipo para el item del carrito que puede ser incompleto durante la carga inicial
          type PartialCartItem = {
            type: CartItemType;
            product?: StandardProduct;
            design?: CustomDesign;
            quantity: number;
            price?: number;
            unitPrice?: number;
          };

          parsedCart.items = parsedCart.items.map((item: PartialCartItem) => {
            // Asegurar que los items cumplan con las interfaces necesarias
            if (
              item.type === CartItemType.STANDARD ||
              item.type === CartItemType.PRODUCT
            ) {
              if (!("productId" in item)) {
                return {
                  ...item,
                  id: item.product?.id ?? crypto.randomUUID(),
                  productId: item.product?.id ?? "",
                  unitPrice: item.price ?? 0,
                } as ProductCartItem;
              }
            } else if (item.type === CartItemType.CUSTOM) {
              if (!("designId" in item)) {
                return {
                  ...item,
                  id: item.design?.id ?? crypto.randomUUID(),
                  designId: item.design?.id ?? "",
                  unitPrice: item.price ?? 0,
                } as CustomCartItem;
              }
            }
            return item;
          });

          // Recalcular totales
          parsedCart.items.forEach((item: PartialCartItem) => {
            if (item && typeof item.quantity === "number") {
              totalItems += item.quantity;
              totalPrice += (item.price ?? item.unitPrice ?? 0) * item.quantity;
            }
          });
        }

        return {
          ...parsedCart,
          totalItems,
          totalPrice,
        };
      }
      return initialCart;
    }
    return initialCart;
  });

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart]);

  // Funciones para manipular el carrito
  const addStandardItem = useCallback(
    (product: StandardProduct, quantity: number) => {
      dispatch({ type: "ADD_STANDARD_ITEM", product, quantity });
    },
    []
  );

  const addCustomItem = useCallback(
    (design: CustomDesign, quantity: number) => {
      dispatch({ type: "ADD_CUSTOM_ITEM", design, quantity });
    },
    []
  );

  const removeItem = useCallback((itemIndex: number) => {
    dispatch({ type: "REMOVE_ITEM", itemIndex });
  }, []);

  const updateQuantity = useCallback((itemIndex: number, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", itemIndex, quantity });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" });
  }, []);

  const updateCustomDesignStatus = useCallback(
    (designId: string, status: CustomDesignStatus, notes?: string) => {
      dispatch({
        type: "UPDATE_CUSTOM_DESIGN_STATUS",
        designId,
        status,
        notes,
      });
    },
    []
  );

  // Memorizar el valor del contexto para evitar renderizados innecesarios
  const contextValue = useMemo(
    () => ({
      cart,
      addStandardItem,
      addCustomItem,
      removeItem,
      updateQuantity,
      clearCart,
      updateCustomDesignStatus,
    }),
    [
      cart,
      addStandardItem,
      addCustomItem,
      removeItem,
      updateQuantity,
      clearCart,
      updateCustomDesignStatus,
    ]
  );

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
