import { create } from "zustand";
import { CheckinAttribute } from "@/store/useCheck-inStore";
import { isValidPhoneNumber } from "react-phone-number-input";

interface FileUploadState {
  file: File | null;
  preview: string | null;
  uploadStatus: "idle" | "uploading" | "success" | "error";
  fileError: string | null;
}

interface FormValue {
  value: any;
  is_default: boolean;
}

interface DetailFormState {
  formValues: Record<string, FormValue>;
  fileUploads: Record<string, FileUploadState>;
  phoneNumberValidity: Record<string, boolean>;
  dropdownStates: Record<string, boolean>;
  datePickerStates: Record<string, boolean>;
  selectedCountry: string;
  selectedRegion: string;
  isCountryDropdownOpen: boolean;
  isRegionDropdownOpen: boolean;
  initializeForm: (attributes: CheckinAttribute[]) => void;
  handleValueChange: (
    fieldName: string,
    value: any,
    is_default?: boolean
  ) => void;
  handlePhoneNumberChange: (fieldName: string, value?: string) => void;
  handleFileUpload: (
    file: File,
    fieldName: string,
    fieldType: "Image" | "File"
  ) => void;
  removeFile: (fieldName: string) => void;
  toggleDropdown: (fieldName: string, isOpen: boolean) => void;
  toggleDatePicker: (fieldName: string, isOpen: boolean) => void;
  setSelectedCountry: (country: string) => void;
  setSelectedRegion: (region: string) => void;
  setIsCountryDropdownOpen: (isOpen: boolean) => void;
  setIsRegionDropdownOpen: (isOpen: boolean) => void;
  resetForm: () => void;
}

export const useDetailFormStore = create<DetailFormState>((set) => ({
  formValues: {},
  fileUploads: {},
  phoneNumberValidity: {},
  dropdownStates: {},
  datePickerStates: {},
  selectedCountry: "India",
  selectedRegion: "",
  isCountryDropdownOpen: false,
  isRegionDropdownOpen: false,

  initializeForm: (attributes) => {
    const initialValues: Record<string, FormValue> = {};
    const initialFileUploads: Record<string, FileUploadState> = {};
    const initialDropdownStates: Record<string, boolean> = {};
    const initialDatePickerStates: Record<string, boolean> = {};
    const initialPhoneValidity: Record<string, boolean> = {};

    attributes.forEach((attr) => {
      let defaultValue;
      switch (attr.field_type) {
        case "Checkbox":
          defaultValue = false;
          break;
        case "Number":
        case "Amount":
          defaultValue = 0;
          break;
        case "Multi Select Dropdown":
          defaultValue = [];
          break;
        default:
          defaultValue = "";
      }

      initialValues[attr.name] = {
        value: defaultValue,
        is_default: attr.is_default || false,
      };

      if (attr.field_type === "Image" || attr.field_type === "File") {
        initialFileUploads[attr.name] = {
          file: null,
          preview: null,
          uploadStatus: "idle",
          fileError: null,
        };
      }

      initialDropdownStates[attr.name] = false;

      if (attr.field_type === "Date") {
        initialDatePickerStates[attr.name] = false;
      }

      if (attr.field_type === "Phone") {
        initialPhoneValidity[attr.name] = true;
      }
    });

    set({
      formValues: initialValues,
      fileUploads: initialFileUploads,
      dropdownStates: initialDropdownStates,
      datePickerStates: initialDatePickerStates,
      phoneNumberValidity: initialPhoneValidity,
    });
  },

  handleValueChange: (fieldName, value, is_default = false) => {
    set((state) => ({
      formValues: {
        ...state.formValues,
        [fieldName]: {
          value,
          is_default,
        },
      },
    }));
  },

  handlePhoneNumberChange: (fieldName, value = "") => {
    set((state) => {
      const newFormValues = {
        ...state.formValues,
        [fieldName]: {
          value,
          is_default: state.formValues[fieldName]?.is_default || false,
        },
      };

      const isValid = value === "" || isValidPhoneNumber(value);

      return {
        formValues: newFormValues,
        phoneNumberValidity: {
          ...state.phoneNumberValidity,
          [fieldName]: isValid,
        },
      };
    });
  },

  handleFileUpload: (file, fieldName, fieldType) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      set((state) => ({
        fileUploads: {
          ...state.fileUploads,
          [fieldName]: {
            file,
            preview: fieldType === "Image" ? (reader.result as string) : null,
            uploadStatus: "uploading",
            fileError: null,
          },
        },
      }));
    };
    reader.readAsDataURL(file);
  },

  removeFile: (fieldName) => {
    set((state) => ({
      fileUploads: {
        ...state.fileUploads,
        [fieldName]: {
          file: null,
          preview: null,
          uploadStatus: "idle",
          fileError: null,
        },
      },
    }));
  },

  toggleDropdown: (fieldName, isOpen) => {
    set((state) => ({
      dropdownStates: {
        ...state.dropdownStates,
        [fieldName]: isOpen,
      },
    }));
  },

  toggleDatePicker: (fieldName, isOpen) => {
    set((state) => ({
      datePickerStates: {
        ...state.datePickerStates,
        [fieldName]: isOpen,
      },
    }));
  },

  setSelectedCountry: (country) => set({ selectedCountry: country }),
  setSelectedRegion: (region) => set({ selectedRegion: region }),
  setIsCountryDropdownOpen: (isOpen) => set({ isCountryDropdownOpen: isOpen }),
  setIsRegionDropdownOpen: (isOpen) => set({ isRegionDropdownOpen: isOpen }),

  resetForm: () =>
    set({
      formValues: {},
      fileUploads: {},
      phoneNumberValidity: {},
      dropdownStates: {},
      datePickerStates: {},
      selectedCountry: "India",
      selectedRegion: "",
      isCountryDropdownOpen: false,
      isRegionDropdownOpen: false,
    }),
}));