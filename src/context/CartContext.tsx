/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  Cart,
  CartItem,
  CartItemType,
  StandardProduct,
  CustomDesign,
  CustomDesignStatus,
  ProductCartItem,
  CustomCartItem,
  CustomView,
} from "../types/cart";
import { usePersistentCartApi } from "@/hooks/usePersistentCartApi";
import {
  DisenoPersonalizadoDTO,
  AnguloDTO,
  ElementoDTO,
} from "../types/personalizedDesign";
import { addThumbnailCartItem } from "@/services/thumbnailService";
import { convertProductoToStandardProduct } from "@/utils/typeConverters";

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
  let numericUserId = 1;
  if (usuarioId) {
    numericUserId = Number(usuarioId);
  }

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
    }
  | { type: "SET_CART_FROM_BACKEND"; items: CartItem[] }; // <-- Agregado

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
        const updatedItems = [...state.items];
        // Haz una copia del objeto antes de modificar
        const updatedItem = { ...updatedItems[existingItemIndex] };
        updatedItem.quantity += quantity;
        updatedItems[existingItemIndex] = updatedItem;

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

    case "SET_CART_FROM_BACKEND": {
      const { items } = action;
      // Recalcula totales
      let totalItems = 0;
      let totalPrice = 0;
      items.forEach((item: any) => {
        totalItems += item.cantidad ?? item.quantity ?? 0;
        totalPrice += item.price;
      });
      return {
        ...state,
        items: items,
        totalItems,
        totalPrice,
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
  persistentCart: any;
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
  }, [cart.items, cart]);

  // --- INTEGRACIÓN CON CARRITO PERSISTENTE ---
  const persistentCart = usePersistentCartApi();
  const [userId, setUserId] = useState<number | null>(null);
  const [hasInsertionOnMemoryCart, setHasInsertionOnMemoryCart] =
    useState(false);
  const [hasMergedCart, setHasMergedCart] = useState(false);
  const [hasBackendInsertion, setHasBackendInsertion] = useState(false);

  useEffect(() => {
    if (persistentCart.userId !== null) {
      setUserId(persistentCart.userId);
    } else {
      persistentCart.refreshCart();
    }
    console.log({ persistentCart });
  }, [persistentCart]);

  useEffect(() => {
    if (cart.items.length > 0 && userId === null) {
      setHasInsertionOnMemoryCart(true);
    }
  }, [cart, userId]);

  useEffect(() => {
    if (userId === null && hasMergedCart) {
      setHasMergedCart(false);
    }
  }, [userId, hasMergedCart]);

  // --- FUSIÓN DE CARRITOS AL INICIAR SESIÓN ---
  // Flag para evitar merge infinito

  const addThumbnailToProductCartItem = async (productItem: {
    id: number;
    previewImages: {
      frente: string;
      espalda: string;
      izquierda: string;
      derecha: string;
    };
  }) => {
    await addThumbnailCartItem(
      productItem.id,
      "frente",
      productItem.previewImages.frente
    );
    await addThumbnailCartItem(
      productItem.id,
      "espalda",
      productItem.previewImages.espalda
    );
    await addThumbnailCartItem(
      productItem.id,
      "izquierda",
      productItem.previewImages.izquierda
    );
    await addThumbnailCartItem(
      productItem.id,
      "derecha",
      productItem.previewImages.derecha
    );
  };

  useEffect(() => {
    // Solo fusionar si hay usuario identificado, el carrito local tiene ítems y no se ha mergeado aún
    if (
      userId !== null &&
      (hasInsertionOnMemoryCart ||
        (cart.items.length === 0 &&
          persistentCart.items.length > 0 &&
          !hasBackendInsertion)) &&
      !hasMergedCart
    ) {
      const mergeCarts = async () => {
        // 1. Obtener ítems del backend (persistente)
        await persistentCart.refreshCart();
        let backendItems = persistentCart.items;

        // 2. Fusionar ítems locales con los del backend
        if (cart.items.length > 0) {
          await Promise.all(
            cart.items.map(async (item) => {
              // Fusionar productos estándar
              if (
                item.type === CartItemType.STANDARD ||
                item.type === CartItemType.PRODUCT
              ) {
                const color = item.product?.color ?? "";
                const size = item.product?.size ?? "";
                const exists = backendItems.some(
                  (b) =>
                    b.productoId === Number(item.product?.id) &&
                    b.colorId === color &&
                    b.tallaId === size
                );
                if (!exists) {
                  backendItems =
                    (await persistentCart.addProductItem({
                      productId: Number(item.product?.id),
                      quantity: item.quantity,
                      color,
                      size,
                      tipoItemId: 1,
                    })) ?? [];
                  const updatedItem: any = backendItems.find(
                    (b: any) => b.productoId === item.product?.id
                  );
                  if (updatedItem) {
                    const { id } = updatedItem;
                    const itemForCreateThumbnail: any = {
                      id,
                      previewImages: item.product?.previewImages,
                    };
                    await addThumbnailToProductCartItem(itemForCreateThumbnail);
                  }
                }
                // else {
                //   // Si existe, suma cantidades
                //   const backendItem = backendItems.find(
                //     (b) =>
                //       b.productoId === item.product?.id &&
                //       b.colorId === color &&
                //       b.tallaId === size
                //   );
                //   if (backendItem) {
                //     await persistentCart.updateQuantity(
                //       Number(backendItem.id),
                //       item.quantity + backendItem.cantidad
                //     );
                //   }
                // }
              }
              // Fusionar diseños personalizados
              if (item.type === CartItemType.CUSTOM) {
                const exists = backendItems.some(
                  (b) => b.disenoPersonalizadoId === Number(item.design?.id)
                );
                if (!exists) {
                  const designDTO = convertCustomDesignToDTO(
                    item.design!,
                    userId
                  );
                  await persistentCart.addCustomItem({
                    design: designDTO,
                    quantity: item.quantity,
                    tipoItemId: 2,
                  });
                }
                // else {
                //   // Si existe, suma cantidades
                //   const backendItem = backendItems.find(
                //     (b) => b.disenoPersonalizadoId === Number(item.design?.id)
                //   );
                //   if (backendItem) {
                //     await persistentCart.updateQuantity(
                //       Number(backendItem.id),
                //       item.quantity + backendItem.cantidad
                //     );
                //   }
                // }
              }
            })
          );
        }
        // 3. Refrescar el persistente y sincronizar el local con el backend
        const updatedItems = (await persistentCart.refreshCart()) ?? [];
        // Adaptar los items del backend al formato CartItem (memoria)
        if (updatedItems.length > 0) {
          const adaptedItems: CartItem[] = updatedItems
            .map((b: any) => {
              if (b.productoId) {
                // Producto estándar
                const standardProduct = convertProductoToStandardProduct(
                  {
                    ...b.producto!,
                    thumbnails: b.thumbnails,
                  },
                  {
                    colorId: b.colorId,
                    tallaId: b.tallaId,
                    precioUnitario: b.precioUnitario,
                  }
                );
                return {
                  id: b.id?.toString() ?? crypto.randomUUID(),
                  type: CartItemType.STANDARD,
                  productId: b.productoId?.toString(),
                  color: b.colorId,
                  size: b.tallaId,
                  quantity: b.cantidad,
                  unitPrice: b.precioUnitario,
                  price: b.subtotal,
                  // product: puedes mapear si tienes info suficiente
                  product: standardProduct,
                };
              } else if (b.disenoPersonalizadoId) {
                // Diseño personalizado
                const emptyAngle = {
                  text: "",
                  image: null,
                  textFont: "",
                  textColor: "",
                  textSize: 0,
                  textPositionX: 0,
                  textPositionY: 0,
                  imagePositionX: 0,
                  imagePositionY: 0,
                  imageWidth: 0,
                  imageHeight: 0,
                  previewImage: "",
                };
                const getAngleFormat = (angle: string) => {
                  const angleDTO = b.disenoPersonalizado.angulos.find(
                    (a: AnguloDTO) => a.nombreAngulo === angle
                  );
                  return {
                    text: angleDTO?.elemento.propiedadesElemento.contenido,
                    image: angleDTO?.elemento.propiedadesElemento.urlImagen,
                    textFont: angleDTO?.elemento.propiedadesElemento.fontFamily,
                    textColor: angleDTO?.elemento.propiedadesElemento.color,
                    textSize: angleDTO?.elemento.propiedadesElemento.fontSize,
                    textPositionX:
                      angleDTO?.elemento.propiedadesDiseno.posicionX,
                    textPositionY:
                      angleDTO?.elemento.propiedadesDiseno.posicionY,
                    imagePositionX:
                      angleDTO?.elemento.propiedadesDiseno.posicionX,
                    imagePositionY:
                      angleDTO?.elemento.propiedadesDiseno.posicionY,
                    imageWidth: angleDTO?.elemento.propiedadesDiseno.anchura,
                    imageHeight: angleDTO?.elemento.propiedadesDiseno.altura,
                    previewImage: angleDTO?.thumbnailUrl,
                  };
                };
                const convertedDesign: CustomDesign = {
                  id: b.disenoPersonalizadoId?.toString(),
                  name: b.disenoPersonalizado.nombre,
                  front: b.disenoPersonalizado.angulos.find(
                    (a: AnguloDTO) => a.nombreAngulo === "Frente"
                  )
                    ? getAngleFormat("Frente")
                    : emptyAngle,
                  back: b.disenoPersonalizado.angulos.find(
                    (a: AnguloDTO) => a.nombreAngulo === "Espalda"
                  )
                    ? getAngleFormat("Espalda")
                    : emptyAngle,
                  left: b.disenoPersonalizado.angulos.find(
                    (a: AnguloDTO) => a.nombreAngulo === "Izquierda"
                  )
                    ? getAngleFormat("Izquierda")
                    : emptyAngle,
                  right: b.disenoPersonalizado.angulos.find(
                    (a: AnguloDTO) => a.nombreAngulo === "Derecha"
                  )
                    ? getAngleFormat("Derecha")
                    : emptyAngle,
                  color: b.colorId,
                  size: b.tallaId,
                  status: b.status,
                  rejectionReason: b.rejectionReason,
                  modificationNotes: b.modificationNotes,
                  price: b.subtotal,
                  createdAt: b.creadoEn,
                  updatedAt: b.actualizadoEn,
                };
                return {
                  id: b.id?.toString() ?? crypto.randomUUID(),
                  type: CartItemType.CUSTOM,
                  designId: b.disenoPersonalizadoId?.toString(),
                  quantity: b.cantidad,
                  unitPrice: b.precioUnitario,
                  price: b.subtotal, // O subtotal
                  // design: puedes mapear si tienes info suficiente
                  design: convertedDesign,
                };
              }
              // Fallback: ignora items no reconocidos
              return null;
            })
            .filter(Boolean) as CartItem[];
          console.log({ persistentCartItems: updatedItems });
          console.log({ adaptedItems });
          dispatch({ type: "SET_CART_FROM_BACKEND", items: adaptedItems });
        }
        if (updatedItems.length > 0 || cart.items.length > 0) {
          setHasMergedCart(true); // Marcar como mergeado
        }
      };
      mergeCarts();
      // Si el usuario hace logout, resetea el flag
    }
  }, [userId, cart.items, persistentCart, hasMergedCart]);

  // --- Funciones para manipular el carrito ---
  // Añadir producto estándar
  const waitForProductInCart = async (
    product: StandardProduct,
    maxRetries = 10,
    delayMs = 200
  ) => {
    for (let i = 0; i < maxRetries; i++) {
      const items = (await persistentCart.refreshCart()) ?? [];
      const found = items.find(
        (b: any) =>
          b.productoId === Number(product.id) &&
          b.colorId === product.color &&
          b.tallaId === product.size
      );
      if (found) return found;
      await new Promise((res) => setTimeout(res, delayMs));
    }
    return undefined;
  };

  const addStandardItem = useCallback(
    async (product: StandardProduct, quantity: number) => {
      try {
        persistentCart.setLoading(true);
        persistentCart.setActualAction("addStandardItem");
        if (userId !== null) {
          await persistentCart.addProductItem({
            productId: Number(product.id),
            quantity,
            color: product.color,
            size: product.size,
            tipoItemId: 1,
          });
          setHasBackendInsertion(true);
          const updatedItem = await waitForProductInCart(product);
          if (updatedItem) {
            const { id } = updatedItem;
            const itemForCreateThumbnail: any = {
              id,
              previewImages: product.previewImages,
            };
            if (
              !persistentCart.items.some(
                (item: any) =>
                  item.productoId === Number(product.id) &&
                  item.colorId === product.color &&
                  item.tallaId === product.size
              )
            ) {
              await addThumbnailToProductCartItem(itemForCreateThumbnail);
            }
          }
          // Refresca para asegurar consistencia final
          await persistentCart.refreshCart();
        }
        dispatch({ type: "ADD_STANDARD_ITEM", product, quantity });
      } catch (error) {
        console.error("Error al agregar producto estándar:", error);
      } finally {
        persistentCart.setLoading(false);
        persistentCart.setActualAction("");
      }
    },
    [userId, persistentCart, dispatch]
  );

  // Añadir diseño personalizado
  const addCustomItem = useCallback(
    async (design: CustomDesign, quantity: number) => {
      // Siempre actualiza el local primero para una UI reactiva
      try {
        persistentCart.setLoading(true);
        persistentCart.setActualAction("addCustomItem");
        if (userId !== null) {
          const designDTO = convertCustomDesignToDTO(design, userId);
          await persistentCart.addCustomItem({
            design: designDTO,
            quantity,
            tipoItemId: 2,
          });
          await persistentCart.refreshCart();
        }
        dispatch({ type: "ADD_CUSTOM_ITEM", design, quantity });
      } catch (error) {
        console.error("Error al agregar diseño personalizado:", error);
      } finally {
        persistentCart.setLoading(false);
        persistentCart.setActualAction("");
      }
    },
    [userId, persistentCart, dispatch]
  );

  // Eliminar ítem (por índice en local, por objeto en backend)
  const removeItem = useCallback(
    async (itemIndex: number) => {
      try {
        persistentCart.setLoading(true);
        persistentCart.setActualAction("removeItem");
        // Siempre actualiza el local primero para una UI reactiva
        if (userId !== null) {
          const backendItem = persistentCart.items[itemIndex];
          if (backendItem) {
            await persistentCart.removeItem(backendItem);
            await persistentCart.refreshCart();
          }
        }
        dispatch({ type: "REMOVE_ITEM", itemIndex });
      } catch (error) {
        console.error("Error al eliminar ítem:", error);
      } finally {
        persistentCart.setLoading(false);
        persistentCart.setActualAction("");
      }
    },
    [userId, persistentCart, dispatch]
  );

  // Actualizar cantidad (solo local, o implementar en backend si existe endpoint)
  const updateQuantity = useCallback(
    async (itemIndex: number, quantity: number) => {
      // Siempre actualiza el local primero para una UI reactiva
      if (userId !== null) {
        // (Opcional: implementar updateQuantity en backend si existe)
        // Por ahora, eliminar y volver a agregar con nueva cantidad
        const backendItem = persistentCart.items[itemIndex];
        if (backendItem) {
          await persistentCart.updateQuantity(Number(backendItem.id), quantity);
          await persistentCart.refreshCart();
        }
      }
      dispatch({ type: "UPDATE_QUANTITY", itemIndex, quantity });
    },
    [userId, persistentCart, dispatch]
  );

  // Vaciar carrito
  const clearCart = useCallback(async () => {
    if (userId !== null) {
      await persistentCart.clearCart();
    }
    dispatch({ type: "CLEAR_CART" });
  }, [userId, persistentCart, dispatch]);

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
      persistentCart,
    }),
    [
      cart,
      addStandardItem,
      addCustomItem,
      removeItem,
      updateQuantity,
      clearCart,
      updateCustomDesignStatus,
      persistentCart,
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
