import { create } from 'zustand';

export interface CartItem {
  id: string;
  item_id: string;
  sub_item_id: string;
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
}

const useCartStore = create<CartStore>((set) => ({
  cartItems: [],
  count: 0,
  setCartData: (items) => set({ cartItems: items, count: items.length }),
  setCount: (count) => set({ count }),
  clearCart: () => set({ cartItems: [], count: 0 }),
}));

export default useCartStore;