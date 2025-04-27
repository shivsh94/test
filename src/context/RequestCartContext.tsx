'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface RequestItem {
  id: string;
  title: string;
  image: string;
  category: string; // Changed from optional to required
}

interface CartContextType {
  cartItems: RequestItem[];
  addToCart: (item: RequestItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a RequestCartProvider');
  }
  return context;
};

export const RequestCartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<RequestItem[]>([]);

  useEffect(() => {
    const storedItems = localStorage.getItem('requestCart');
    setCartItems(storedItems ? JSON.parse(storedItems) : []);
  }, []);

  useEffect(() => {
    localStorage.setItem('requestCart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item: RequestItem) => {
    setCartItems((prev) => [...prev, item]);
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('requestCart');
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};