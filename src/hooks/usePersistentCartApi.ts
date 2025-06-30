/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Item as BackendCartItem } from "@/types/cart";
import { DisenoPersonalizadoDTO } from "@/types/personalizedDesign";
import * as cartService from "@/services/cartService";
import * as designService from "@/services/diseñoPersonalizadoService";
import { validateToken } from "@/services/userService";

interface UsePersistentCartApi {
  items: BackendCartItem[];
  cartId: number | null;
  loading: boolean;
  error: string | null;
  refreshCart: () => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  userId: number | null;
  setLoading: (loading: boolean) => void;
  actualAction: string | null;
  setActualAction: (action: string) => void;
  // Cambiamos la firma para aceptar los datos mínimos necesarios
  /**
   * Agrega un producto estándar al carrito persistente.
   * tipoItemId es obligatorio y debe ser provisto por el caller (extraído del producto o hardcodeado).
   */
  addProductItem: (payload: {
    productId: number;
    quantity: number;
    color: string;
    size: string;
    tipoItemId: number;
  }) => Promise<void>;
  /**
   * Agrega un diseño personalizado al carrito persistente.
   * tipoItemId es obligatorio y debe ser provisto por el caller (extraído del diseño o hardcodeado).
   */
  addCustomItem: (payload: {
    design: DisenoPersonalizadoDTO;
    quantity: number;
    tipoItemId: number;
  }) => Promise<void>;
  removeItem: (item: BackendCartItem) => Promise<void>;
  clearCart: () => Promise<void>;
}

export function usePersistentCartApi(): UsePersistentCartApi {
  const { data: session } = useSession();
  const [items, setItems] = useState<BackendCartItem[]>([]);
  const [cartId, setCartId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [actualAction, setActualAction] = useState<string | null>(null);

  const fetchUserID = useCallback(async () => {
    try {
      const res = await validateToken(session!.accessToken!);
      if (userId !== res.usuario.id) {
        setUserId(res.usuario.id);
      }
    } catch (error) {
      console.error("Error al validar token:", error);
      throw error;
    }
  }, [session]);

  useEffect(() => {
    if (session?.accessToken) {
      fetchUserID();
    }
  }, [fetchUserID, session]);

  // Refresca el carrito desde el backend y actualiza cartId
  // Mutex para evitar condición de carrera al crear carrito
  const createCartPromiseRef = useRef<Promise<any> | null>(null);

  const refreshCart = useCallback(async () => {
    if (!userId) return [];
    // setLoading(true);
    setError(null);
    try {
      let cart;
      if (!cartId) {
        // Si ya hay una promesa de creación en curso, espera esa
        if (!createCartPromiseRef.current) {
          createCartPromiseRef.current = cartService.initCart(Number(userId));
        }
        cart = await createCartPromiseRef.current;
        setCartId(cart.id);
        createCartPromiseRef.current = null;
      } else {
        cart = await cartService.getCartByID(Number(cartId));
      }
      setItems(cart.items ?? []);
      return cart.items ?? [];
    } catch (e: any) {
      setError(e.message ?? "Error cargando el carrito persistente");
      createCartPromiseRef.current = null;
      return [];
    } finally {
      // setLoading(false);
    }
  }, [userId, cartId]);

  useEffect(() => {
    if (userId) {
      refreshCart();
    }
  }, [refreshCart, userId]);

  // Añade un producto estándar al carrito persistente
  const addProductItem = useCallback(
    async (payload: {
      productId: number;
      quantity: number;
      color: string;
      size: string;
      tipoItemId: number;
    }) => {
      if (!userId || !cartId) return;
      // setLoading(true);
      setError(null);
      try {
        const prodItem = {
          productoId: payload.productId,
          cantidad: payload.quantity,
          colorId: payload.color,
          tallaId: payload.size,
          tipoItemId: payload.tipoItemId, // Obligatorio para el backend
        };
        const response = await cartService.addProductToCart(prodItem, cartId);
        setItems(response.items);
        return response.items;
      } catch (e: any) {
        setError(
          e?.message ?? "Error añadiendo producto al carrito persistente"
        );
      } finally {
        // setLoading(false);
      }
    },
    [cartId, userId]
  );

  // Añade un diseño personalizado al carrito persistente
  const addCustomItem = useCallback(
    async (payload: {
      design: DisenoPersonalizadoDTO;
      quantity: number;
      tipoItemId: number;
    }) => {
      if (!userId || !cartId) return;
      // setLoading(true);
      setError(null);
      try {
        // 1. Crear el diseño personalizado en la BD
        const design = await designService.createPersonalizedDesign(
          payload.design
        );
        // 2. Construir el objeto newCustomItem
        const customItem = {
          disenoId: design.id,
          tipoItemId: payload.tipoItemId, // Obligatorio para el backend
          cantidad: payload.quantity,
          colorId: payload.design.colorId,
          tallaId: payload.design.tallaId,
        };
        await cartService.addCustomItemToCart(customItem, cartId);
        await refreshCart();
      } catch (e: any) {
        setError(
          e?.message ??
            "Error añadiendo diseño personalizado al carrito persistente"
        );
      } finally {
        // setLoading(false);
      }
    },
    [cartId, refreshCart, userId]
  );

  // Elimina un item (y el diseño si corresponde)
  const removeItem = useCallback(
    async (item: BackendCartItem) => {
      if (!userId || !cartId) return;
      // setLoading(true);
      setError(null);
      try {
        await cartService.deleteItemFromCart(cartId, Number(item.id));
        if (item.disenoPersonalizadoId) {
          await designService.deletePersonalizedDesign(
            item.disenoPersonalizadoId
          );
        }
        await refreshCart();
      } catch (e: any) {
        setError(e.message ?? "Error eliminando item del carrito persistente");
      } finally {
        // setLoading(false);
      }
    },
    [cartId, refreshCart, userId]
  );

  const updateQuantity = useCallback(
    async (itemId: number, quantity: number) => {
      if (!userId || !cartId) return;
      // setLoading(true);
      setError(null);
      try {
        await cartService.updateItemQuantity(cartId, itemId, quantity);
        await refreshCart();
      } catch (e: any) {
        setError(e.message ?? "Error actualizando cantidad del item");
      } finally {
        // setLoading(false);
      }
    },
    [cartId, refreshCart, userId]
  );

  // Vacía el carrito
  const clearCart = useCallback(async () => {
    if (!userId || !cartId) return;
    // setLoading(true);
    setError(null);
    try {
      await cartService.emptyCart(cartId);
      await refreshCart();
    } catch (e: any) {
      setError(e.message ?? "Error vaciando el carrito persistente");
    } finally {
      // setLoading(false);
    }
  }, [cartId, refreshCart, userId]);

  return {
    items,
    cartId,
    loading,
    setLoading,
    actualAction,
    setActualAction,
    error,
    refreshCart,
    addProductItem,
    addCustomItem,
    updateQuantity,
    removeItem,
    clearCart,
    userId,
  };
}
