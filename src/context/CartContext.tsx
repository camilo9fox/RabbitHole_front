"use client";

import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { 
  Cart, 
  CartItem, 
  CartItemType, 
  StandardProduct, 
  CustomDesign, 
  CustomDesignStatus 
} from '../types/cart';

// Estado inicial del carrito
const initialCart: Cart = {
  items: [],
  totalPrice: 0,
  totalItems: 0
};

// Acciones para el reducer
type CartAction = 
  | { type: 'ADD_STANDARD_ITEM'; product: StandardProduct; quantity: number }
  | { type: 'ADD_CUSTOM_ITEM'; design: CustomDesign; quantity: number }
  | { type: 'REMOVE_ITEM'; itemIndex: number }
  | { type: 'UPDATE_QUANTITY'; itemIndex: number; quantity: number }
  | { type: 'CLEAR_CART' }
  | { type: 'UPDATE_CUSTOM_DESIGN_STATUS'; designId: string; status: CustomDesignStatus; notes?: string };

// Reducer para manejar las acciones del carrito
const cartReducer = (state: Cart, action: CartAction): Cart => {
  switch (action.type) {
    case 'ADD_STANDARD_ITEM': {
      const { product, quantity } = action;
      
      // Verificar si el producto ya está en el carrito
      const existingItemIndex = state.items.findIndex(
        item => item.type === CartItemType.STANDARD && 
               'product' in item && 
               item.product.id === product.id &&
               item.product.size === product.size &&
               item.product.color === product.color
      );
      
      if (existingItemIndex >= 0) {
        // Actualizar cantidad si ya existe
        const updatedItems = [...state.items];
        const existingItem = updatedItems[existingItemIndex] as { quantity: number };
        existingItem.quantity += quantity;
        
        return {
          ...state,
          items: updatedItems,
          totalItems: state.totalItems + quantity,
          totalPrice: state.totalPrice + (product.price * quantity)
        };
      }
      
      // Agregar nuevo item si no existe
      const newItem: CartItem = {
        type: CartItemType.STANDARD,
        product,
        quantity,
        price: product.price
      };
      
      return {
        ...state,
        items: [...state.items, newItem],
        totalItems: state.totalItems + quantity,
        totalPrice: state.totalPrice + (product.price * quantity)
      };
    }
    
    case 'ADD_CUSTOM_ITEM': {
      const { design, quantity } = action;
      const price = design.price; // Usamos el precio del diseño personalizado
      
      // Los diseños personalizados siempre se agregan como nuevos items
      const newItem: CartItem = {
        type: CartItemType.CUSTOM,
        design,
        quantity,
        price
      };
      
      return {
        ...state,
        items: [...state.items, newItem],
        totalItems: state.totalItems + quantity,
        totalPrice: state.totalPrice + (price * quantity)
      };
    }
    
    case 'REMOVE_ITEM': {
      const { itemIndex } = action;
      const itemToRemove = state.items[itemIndex];
      
      if (!itemToRemove) return state;
      
      const itemPrice = itemToRemove.price * itemToRemove.quantity;
      
      return {
        ...state,
        items: state.items.filter((_, index) => index !== itemIndex),
        totalItems: state.totalItems - itemToRemove.quantity,
        totalPrice: state.totalPrice - itemPrice
      };
    }
    
    case 'UPDATE_QUANTITY': {
      const { itemIndex, quantity } = action;
      
      if (itemIndex < 0 || itemIndex >= state.items.length || quantity <= 0) {
        return state;
      }
      
      const updatedItems = [...state.items];
      const item = updatedItems[itemIndex];
      const priceDifference = item.price * (quantity - item.quantity);
      
      updatedItems[itemIndex] = {
        ...item,
        quantity
      };
      
      return {
        ...state,
        items: updatedItems,
        totalItems: state.totalItems + (quantity - item.quantity),
        totalPrice: state.totalPrice + priceDifference
      };
    }
    
    case 'CLEAR_CART': {
      return initialCart;
    }
    
    case 'UPDATE_CUSTOM_DESIGN_STATUS': {
      const { designId, status, notes } = action;
      
      const updatedItems = state.items.map(item => {
        if (
          item.type === CartItemType.CUSTOM && 
          'design' in item && 
          item.design.id === designId
        ) {
          return {
            ...item,
            design: {
              ...item.design,
              status,
              ...(status === CustomDesignStatus.REJECTED && { rejectionReason: notes }),
              ...(status === CustomDesignStatus.MODIFICATION_REQUESTED && { modificationNotes: notes }),
              updatedAt: new Date()
            }
          };
        }
        return item;
      });
      
      return {
        ...state,
        items: updatedItems
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
  updateCustomDesignStatus: (designId: string, status: CustomDesignStatus, notes?: string) => void;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

// Proveedor del contexto
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Cargar carrito del localStorage si existe
  const [cart, dispatch] = useReducer(cartReducer, initialCart, () => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : initialCart;
    }
    return initialCart;
  });
  
  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart]);
  
  // Funciones para manipular el carrito
  const addStandardItem = useCallback((product: StandardProduct, quantity: number) => {
    dispatch({ type: 'ADD_STANDARD_ITEM', product, quantity });
  }, []);
  
  const addCustomItem = useCallback((design: CustomDesign, quantity: number) => {
    dispatch({ type: 'ADD_CUSTOM_ITEM', design, quantity });
  }, []);
  
  const removeItem = useCallback((itemIndex: number) => {
    dispatch({ type: 'REMOVE_ITEM', itemIndex });
  }, []);
  
  const updateQuantity = useCallback((itemIndex: number, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', itemIndex, quantity });
  }, []);
  
  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);
  
  const updateCustomDesignStatus = useCallback((designId: string, status: CustomDesignStatus, notes?: string) => {
    dispatch({ type: 'UPDATE_CUSTOM_DESIGN_STATUS', designId, status, notes });
  }, []);
  
  // Memorizar el valor del contexto para evitar renderizados innecesarios
  const contextValue = useMemo(() => ({
    cart,
    addStandardItem,
    addCustomItem,
    removeItem,
    updateQuantity,
    clearCart,
    updateCustomDesignStatus
  }), [cart, addStandardItem, addCustomItem, removeItem, updateQuantity, clearCart, updateCustomDesignStatus]);
  
  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
