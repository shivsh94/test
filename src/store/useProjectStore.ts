// store/useProjectStore.ts
import { create } from 'zustand';

// Existing types
type Company = {
  name: string;
  country: string;
  logo: string;
  website: string;
  instagram: string;
  facebook: string;
  linkedin: string;
  primary_color: string;
  secondary_color: string;
  primary_text_color: string;
  secondary_text_color: string;
  font_family: string;
}


export type ProjectData = {
  name: string;
  short_name: string;
  category: string;
  email: string;
  contact: string;
  whatsapp: string;
  address: string;
  country: string;
  region: string;
  city: string;
  zip_code: string;
  location_url: string;
  latitude: string;
  longitude: string;
  timezone: string;
  currency: string;
  language: string;
  photos: string[];
  tnc: string;
  is_franchise: boolean;
  id: string;
  res_pay_enabled: boolean;
  res_security_amount: string;
  upsell_pay_enabled: boolean;
  cafe_pay_enabled: boolean;
  cafe_paylater_enabled: boolean;
  is_cafe_tab_enabled: boolean;
  is_cafe_open: boolean;
  bar_pay_enabled: boolean;
  bar_paylater_enabled: boolean;
  is_bar_tab_enabled: boolean;
  is_bar_open: boolean;
  booking_link: string;
  force_read_tnc_enabled: boolean;
  company_id: string;
  company: Company;
}

export type NearbyPlace = {
  name: string;
  description: string; // HTML content
  category: string;
  iframe: string; // HTML iframe
  cover: string; // URL string
  photos: string[]; // Array of URLs
  is_disabled: boolean;
  id: string; // UUID format
}

export type NearbyPlacesResponse = {
  items: NearbyPlace[];
  count: number;
};

// Notice Api 
export interface Item {
  id: string;
  name: string;
  description: string;
  icon: string;
  is_disabled: boolean;
}

export interface LabelItem {
  id: string;
  text: string;
  color: string;
  scope: string[];
}

export interface LabelItemsResponse {
  items: LabelItem[];
  count: number;
}


export type idData = {
  id?: string;
  items: Item[];
  name?: string;
  contact?: string;
};




type ProjectStore = {
  data: ProjectData | null;
  setData: (data: ProjectData) => void;
  clearData: () => void;
};

export const useSlugStore = create<ProjectStore>((set) => ({
  data: null,
  setData: (data) => set({ data }),
  clearData: () => set({ data: null }),
}));


type IdStore = {
  idData: idData | null;
  setIdData: (data: Partial<idData>) => void;
  clearIdData: () => void;
};

export const useIdStore = create<IdStore>((set, get) => ({
  idData: null,
  setIdData: (data) =>
    set({
      idData: {
        ...get().idData,
        ...data,
        items: data.items ?? [],
      },
    }),
  clearIdData: () => set({ idData: null }),
}));

// Nearby Places Store
type NearbyStore = {
  nearbyPlaces: NearbyPlace[];
  nearbyCount: number;
  setNearbyPlaces: (response: NearbyPlacesResponse) => void;
  clearNearbyPlaces: () => void;
};

export const useNearbyStore = create<NearbyStore>((set) => ({
  nearbyPlaces: [],
  nearbyCount: 0,
  setNearbyPlaces: (response) => set({ 
    nearbyPlaces: response.items,
    nearbyCount: response.count 
  }),
  clearNearbyPlaces: () => set({ 
    nearbyPlaces: [],
    nearbyCount: 0 
  }),
}));

// Define types for the category outlet data
export interface Timing {
  start: string;
  end: string;
}

export interface Days {
  mon: boolean;
  tue: boolean;
  wed: boolean;
  thu: boolean;
  fri: boolean;
  sat: boolean;
  sun: boolean;
}

export interface CategoryContext {
  timings: Timing[];
  days: Days;
}

export interface CategoryItem {
  id: string; 
  name: string;
  outlet: string;
  position: number;
  is_open: boolean;
  context: CategoryContext;
}

export interface CategoryOutlet {
  items: CategoryItem[];
  count: number;
}
export interface CategoryKey {
  name: string;
  id: string;
}

// Define types for menu items
export interface MenuItemContext {
  timings: Timing[];
  days: Days;
}

export interface MenuItemTax {
  id?: string;
  tax_type_id?: string;
  tax_type_order?: number;
}

export interface MenuSubItem {
  id: string;
  name: string;
  price: string;
  weekend_price: string;
  holiday_price: string;
  discount: string;
  position: number; 
}

export type MenuItem = {
  id: string;
  name: string;
  category_id: string;
  description: string;
  food_type: string;
  is_multiple: boolean;
  is_open: boolean;
  is_tax_inclusive: boolean;
  price: string | null;
  weekend_price: string | null;
  holiday_price: string | null;
  discount: string | null;
  position: number;
  photo: string;
  labels: string[];
  context: MenuItemContext;
  taxes: MenuItemTax[];
  sub_items: MenuSubItem[];
  available?: boolean;
}

export interface MenuResponse {
  items: MenuItem[];
  count: number;
}

// Category Store
type CategoryStore = {
  categories: CategoryItem[];
  categoryCount: number;
  setCategories: (response: CategoryOutlet) => void;
  addCategory: (category: CategoryItem) => void;
  updateCategory: (id: string, data: Partial<CategoryItem>) => void;
  removeCategory: (id: string) => void;
  clearCategories: () => void;
};

type LabelStore = {
  labelItems: LabelItem[];
  labelCount: number;
  setLabelItems: (response: LabelItemsResponse) => void;
};

export const useLabelStore = create<LabelStore>((set) => ({
  labelItems: [],
  labelCount: 0,
  setLabelItems: (response) => set({ 
    labelItems: response.items,
    labelCount: response.count 
  }),
}));

export const useCategoryStore = create<CategoryStore>((set) => ({
  categories: [],
  categoryCount: 0,
  setCategories: (response) => set({ 
    categories: response.items,
    categoryCount: response.count 
  }),
  addCategory: (category) => set((state) => ({ 
    categories: [...state.categories, category],
    categoryCount: state.categoryCount + 1
  })),
  updateCategory: (id, data) => set((state) => ({
    categories: state.categories.map(cat => 
      cat.id === id ? { ...cat, ...data } : cat
    ),
    categoryCount: state.categoryCount
  })),
  removeCategory: (id) => set((state) => ({
    categories: state.categories.filter(cat => cat.id !== id),
    categoryCount: state.categoryCount - 1
  })),
  clearCategories: () => set({ 
    categories: [],
    categoryCount: 0
  }),
}));

// Menu Items Store
 type MenuStore = {
  menuItems: MenuItem[];
  menuCount: number;
  setMenuItems: (response: MenuResponse) => void;
  addMenuItem: (menuItem: MenuItem) => void;
  updateMenuItem: (id: string, data: Partial<MenuItem>) => void;
  removeMenuItem: (id: string) => void;
  clearMenuItems: () => void;
  getMenuItemsByCategory: (categoryId: string) => MenuItem[];
};

export const useMenuStore = create<MenuStore>((set, get) => ({
  menuItems: [],
  menuCount: 0,
  setMenuItems: (response) => set({ 
    menuItems: response.items,
    menuCount: response.count 
  }),
  addMenuItem: (menuItem) => set((state) => ({ 
    menuItems: [...state.menuItems, menuItem],
    menuCount: state.menuCount + 1
  })),
  updateMenuItem: (id, data) => set((state) => ({
    menuItems: state.menuItems.map(item => 
      item.id === id ? { ...item, ...data } : item
    ),
    menuCount: state.menuCount
  })),
  removeMenuItem: (id) => set((state) => ({
    menuItems: state.menuItems.filter(item => item.id !== id),
    menuCount: state.menuCount - 1
  })),
  clearMenuItems: () => set({ 
    menuItems: [],
    menuCount: 0
  }),
  getMenuItemsByCategory: (categoryId) => {
    return get().menuItems.filter(item => item.category_id === categoryId);
  }
}));


export const useAllStores = () => {
  const slugStore = useSlugStore();
  const idStore = useIdStore();
  const nearbyStore = useNearbyStore();
  const categoryStore = useCategoryStore();
  const menuStore = useMenuStore();
  const labelStore = useLabelStore();

  return {
    ...slugStore,
    ...idStore,
    ...nearbyStore,
    ...categoryStore,
    ...menuStore,
    ...labelStore,
  };
};