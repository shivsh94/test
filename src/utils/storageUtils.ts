const CART_STORAGE_KEY = "cartItems";
import { CartItem } from '@/context/FoodCartContext';

const REQUEST_CART_STORAGE_KEY = "requestCartItems";
import { RequestItem } from '@/context/RequestCartContext';

export const getCartFromLocalStorage = (): CartItem[] => {
  if (typeof window === "undefined") return []; // Ensure this runs only in the browser
  const storedCart = localStorage.getItem(CART_STORAGE_KEY);
  return storedCart ? JSON.parse(storedCart) : [];
};

export const saveCartToLocalStorage = (cartItems: CartItem[]): void => {
  if (typeof window === "undefined") return; // Ensure this runs only in the browser
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
};

export const getRequestCartFromLocalStorage = (): RequestItem[] => {
  if (typeof window === "undefined") return []; // Only run in the browser
  const storedCart = localStorage.getItem(REQUEST_CART_STORAGE_KEY);
  return storedCart ? JSON.parse(storedCart) : [];
};

export const saveRequestCartToLocalStorage = (cartItems: RequestItem[]): void => {
  if (typeof window === "undefined") return; 
  localStorage.setItem(REQUEST_CART_STORAGE_KEY, JSON.stringify(cartItems));
};

export const savedResponse = () => {
  if (typeof window === "undefined") return;
  return localStorage.getItem('formSubmissionResponse') 
    ? JSON.parse(localStorage.getItem('formSubmissionResponse') as string) 
    : null;
}
