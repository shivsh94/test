// stores/combinedStore.ts
import { create } from "zustand";

interface DaySchedule {
  mon: boolean;
  tue: boolean;
  wed: boolean;
  thu: boolean;
  fri: boolean;
  sat: boolean;
  sun: boolean;
}

interface Field {
  name: string;
  field_type: string;
  label: string;
  placeholder: string;
  max_length: number;
  mandatory: boolean;
  options: any | null;
  price_vary: boolean;
  factor: number;
}

export interface Context {
  timings: any[];
  days: DaySchedule;
  fields?: Field[];
}

export interface Item {
  id: string;
  name: string;
  category_id: string;
  description: string;
  is_multiple: boolean;
  is_open: boolean;
  is_tax_inclusive: boolean;
  price: string;
  weekend_price: string;
  holiday_price: string;
  discount: string;
  position: number;
  cover: string;
  photos: string[];
  labels: string[];
  submit_button_text: string;
  submit_button_url: string | null;
  context: Context;
  taxes: any[];
  sub_items: any[];
}

export interface UpsellCategory {
  id: string;
  name: string;
  position: number;
  is_open: boolean;
  context: {
    timings: any[];
    days: DaySchedule;
  };
}

interface CombinedStoreState {
  items: Item[];
  itemsCount: number;
  itemsLoading: boolean;
  itemsError: string | null;

  upsellCategories: UpsellCategory[];
  upsellCategoriesCount: number;

  setItemsData: (data: { items: Item[]; count: number }) => void;
  setItemsLoading: (loading: boolean) => void;
  setItemsError: (error: string | null) => void;
  setUpsellCategoriesData: (data: {
    items: UpsellCategory[];
    count: number;
  }) => void;
}

export const useCombinedStore = create<CombinedStoreState>((set) => ({
  items: [],
  itemsCount: 0,
  itemsLoading: false,
  itemsError: null,

  upsellCategories: [],
  upsellCategoriesCount: 0,

  setItemsData: (data) =>
    set({
      items: data.items,
      itemsCount: data.count,
    }),

  setItemsLoading: (loading) => set({ itemsLoading: loading }),
  setItemsError: (error) => set({ itemsError: error }),

  setUpsellCategoriesData: (data) =>
    set({
      upsellCategories: data.items,
      upsellCategoriesCount: data.count,
    }),
}));
