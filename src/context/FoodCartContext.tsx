'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { getCartFromLocalStorage, saveCartToLocalStorage } from '@/utils/storageUtils';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  photo?: string;
  category: string;
  size?: '30ml' | '60ml' | 'Half' | 'Full'; 
  quantity: number;
  menuItemId: string;
  categoryId: string;
  isVeg: string;
  parentName?: string | null; 
  parentId?: string | null; 
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  incrementQuantity: (id: string, size?: string) => void;
  decrementQuantity: (id: string, size?: string) => void;
  removeFromCart: (id: string, size?: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => getCartFromLocalStorage());

  useEffect(() => {
    saveCartToLocalStorage(cartItems);
  }, [cartItems]); 

  const addToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const existingItem = prev.find(
        (cartItem) =>
          cartItem.id === item.id && cartItem.size === item.size 
      );

      if (existingItem) {
        return prev.map((cartItem) =>
          cartItem.id === item.id && cartItem.size === item.size
            ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
            : cartItem
        );
      }
      
      return [...prev, { ...item}];
    });
  };

  const incrementQuantity = (id: string, size?: string) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id && item.size === size ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decrementQuantity = (id: string, size?: string) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === id && item.size === size
            ? { ...item, quantity: Math.max(1, item.quantity - 1) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id: string, size?: string) => {
    setCartItems((prev) => prev.filter((item) => !(item.id === id && item.size === size)));
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        incrementQuantity,
        decrementQuantity,
        removeFromCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
