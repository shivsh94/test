import { create } from "zustand";

export interface CartItem {
  id: string;
  item_id: string;
  sub_item_id: string | null;
  quantity: number;
  customer_id: string;
  entity_id: string;
}

export interface CartStore {
  cartItems: CartItem[];
  count: number;
  setCartData: (items: CartItem[]) => void;
  setCount: (count: number) => void;
  clearCart: () => void;
  addItem: (item: CartItem) => void;
  updateItem: (itemId: string, updatedItem: Partial<CartItem>) => void;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (
    itemId: string,
    subItemId: string | null,
    quantity: number
  ) => void;
}

const useCartStore = create<CartStore>((set) => ({
  cartItems: [],
  count: 0,
  setCartData: (items) => set({ cartItems: items, count: items.length }),
  setCount: (count) => set({ count }),
  clearCart: () => set({ cartItems: [], count: 0 }),

  addItem: (item) =>
    set((state) => {
      const newCartItems = [...state.cartItems, item];
      console.log("Adding item to cart:", item);

      return {
        cartItems: newCartItems,
        count: newCartItems.length,
      };
    }),

  updateItem: (itemId, updatedItem) =>
    set((state) => {
      const newCartItems = state.cartItems.map((item) =>
        item.id === itemId ? { ...item, ...updatedItem } : item
      );
      return {
        cartItems: newCartItems,
        count: newCartItems.length,
      };
    }),

  removeItem: (itemId) =>
    set((state) => {
      const newCartItems = state.cartItems.filter((item) => item.id !== itemId);
      return {
        cartItems: newCartItems,
        count: newCartItems.length,
      };
    }),

  updateItemQuantity: (itemId, subItemId, quantity) =>
    set((state) => {
      const newCartItems = state.cartItems.map((item) =>
        item.item_id === itemId &&
        (subItemId ? item.sub_item_id === subItemId : !item.sub_item_id)
          ? { ...item, quantity }
          : item
      );
      return {
        cartItems: newCartItems,
        count: newCartItems.length,
      };
    }),
}));

export default useCartStore;
