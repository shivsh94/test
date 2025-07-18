import { create } from "zustand";

type FieldType =
  | "Text"
  | "Long Text"
  | "Sign"
  | "Email"
  | "Phone"
  | "Number"
  | "Amount"
  | "Date"
  | "Time"
  | "Image"
  | "File"
  | "URL"
  | "Checkbox"
  | "Country"
  | "State"
  | "Dropdown"
  | "Multi Select Dropdown";

type FieldFor =
  | "Both Domestic & International Customer"
  | "Domestic Customer"
  | "International Customer";
type ShowOnScreen = "Detail" | "Document";

interface FieldContext {
  options?: Record<string, string>;
  min_length?: number;
  max_length?: number;
  min_value?: number;
  max_value?: number;
}

export interface CheckinAttribute {
  required: boolean;
  name: string;
  label: string;
  section: string;
  field_type: FieldType;
  field_for: FieldFor;
  help_text: string;
  show_on_screen: ShowOnScreen;
  show_on_staff_form: boolean;
  show_on_main_guest_form: boolean;
  show_on_extra_guest_form: boolean;
  position: number;
  is_required: boolean;
  is_disabled: boolean;
  context: FieldContext;
  is_default: boolean;
}

interface CheckinResponse {
  items: CheckinAttribute[];
  count: number;
}

interface CheckinStore {
  checkinAttributes: CheckinAttribute[];
  count: number;
  setCheckinData: (response: CheckinResponse) => void;
  clearCheckinData: () => void;
}

const useCheckinStore = create<CheckinStore>((set) => ({
  checkinAttributes: [],
  count: 0,
  setCheckinData: (response) =>
    set({
      checkinAttributes: response.items,
      count: response.count,
    }),
  clearCheckinData: () => set({ checkinAttributes: [], count: 0 }),
}));

export default useCheckinStore;
