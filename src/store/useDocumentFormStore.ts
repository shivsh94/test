import { create } from "zustand";

import { BaseFormState, createFormStoreSlice } from "./formStoreFactory";

export const useDocumentFormStore = create<BaseFormState>(createFormStoreSlice);
