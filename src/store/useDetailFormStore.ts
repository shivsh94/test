import { create } from "zustand";

import { BaseFormState, createFormStoreSlice } from "./formStoreFactory";

export const useDetailFormStore = create<BaseFormState>(createFormStoreSlice);
