import { isValidPhoneNumber } from "react-phone-number-input";
import { StateCreator } from "zustand";

type AttributeType = {
  name: string;
  field_type: string;
  is_default?: boolean;
};

interface FileUploadState {
  file: File | null;
  preview: string | null;
  uploadStatus: "idle" | "uploading" | "success" | "error";
  fileError: string | null;
  queue: File[];
  fieldType?: "Image" | "File";
}

interface FormValue {
  value: any;
  is_default: boolean;
}

export interface BaseFormState {
  formValues: Record<string, FormValue>;
  fileUploads: Record<string, FileUploadState>;
  phoneNumberValidity: Record<string, boolean>;
  dropdownStates: Record<string, boolean>;
  datePickerStates: Record<string, boolean>;
  selectedCountry: string;
  selectedRegion: string;
  isCountryDropdownOpen: boolean;
  isRegionDropdownOpen: boolean;

  initializeForm: (attributes: AttributeType[]) => void;
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
  completeFileUpload: (
    fieldName: string,
    success: boolean,
    url?: string,
    error?: string
  ) => void;
}

export const createFormStoreSlice: StateCreator<BaseFormState> = (set) => ({
  formValues: {},
  fileUploads: {},
  phoneNumberValidity: {},
  dropdownStates: {},
  datePickerStates: {},
  selectedCountry: "IN",
  selectedRegion: "",
  isCountryDropdownOpen: false,
  isRegionDropdownOpen: false,

  initializeForm: (attributes) => {
    const formValues: Record<string, FormValue> = {};
    const fileUploads: Record<string, FileUploadState> = {};
    const dropdownStates: Record<string, boolean> = {};
    const datePickerStates: Record<string, boolean> = {};
    const phoneValidity: Record<string, boolean> = {};

    attributes.forEach((attr) => {
      let defaultValue: any;
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
        case "Country":
          defaultValue = "IN";
          break;
        case "Date":
          defaultValue = null;
          break;
        default:
          defaultValue = "";
      }

      formValues[attr.name] = {
        value: defaultValue,
        is_default: attr.is_default || false,
      };

      if (["Image", "File"].includes(attr.field_type)) {
        fileUploads[attr.name] = {
          file: null,
          preview: null,
          uploadStatus: "idle",
          fileError: null,
          queue: [],
          fieldType: attr.field_type as "Image" | "File",
        };
      }

      if (attr.field_type === "Date") datePickerStates[attr.name] = false;
      if (attr.field_type === "Phone") phoneValidity[attr.name] = true;

      dropdownStates[attr.name] = false;
    });

    set({
      formValues,
      fileUploads,
      phoneNumberValidity: phoneValidity,
      dropdownStates,
      datePickerStates,
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
      const isValid = value === "" || isValidPhoneNumber(value);
      return {
        formValues: {
          ...state.formValues,
          [fieldName]: {
            value,
            is_default: state.formValues[fieldName]?.is_default || false,
          },
        },
        phoneNumberValidity: {
          ...state.phoneNumberValidity,
          [fieldName]: isValid,
        },
      };
    });
  },

  handleFileUpload: (file, fieldName, fieldType) => {
    set((state) => {
      const currentState = state.fileUploads[fieldName] || {
        file: null,
        preview: null,
        uploadStatus: "idle",
        fileError: null,
        queue: [],
        fieldType,
      };

      // If already uploading, add to queue
      if (currentState.uploadStatus === "uploading") {
        return {
          fileUploads: {
            ...state.fileUploads,
            [fieldName]: {
              ...currentState,
              queue: [...currentState.queue, file],
            },
          },
        };
      }

      // Start upload immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        set((state) => ({
          fileUploads: {
            ...state.fileUploads,
            [fieldName]: {
              ...state.fileUploads[fieldName],
              file,
              preview: fieldType === "Image" ? (reader.result as string) : null,
              uploadStatus: "uploading",
              fileError: null,
              fieldType,
            },
          },
        }));
      };
      reader.readAsDataURL(file);

      return {
        fileUploads: {
          ...state.fileUploads,
          [fieldName]: {
            ...currentState,
            uploadStatus: "uploading",
            fieldType,
          },
        },
      };
    });
  },

  removeFile: (fieldName) =>
    set((state) => {
      const currentPreview = state.fileUploads[fieldName]?.preview;
      // Clean up blob URL when removing file
      if (currentPreview && currentPreview.startsWith("blob:")) {
        URL.revokeObjectURL(currentPreview);
      }

      return {
        fileUploads: {
          ...state.fileUploads,
          [fieldName]: {
            file: null,
            preview: null,
            uploadStatus: "idle",
            fileError: null,
            queue: [],
            fieldType: state.fileUploads[fieldName]?.fieldType,
          },
        },
        formValues: {
          ...state.formValues,
          [fieldName]: {
            ...state.formValues[fieldName],
            value: "",
          },
        },
      };
    }),

  completeFileUpload: (fieldName, success, url, error) => {
    set((state) => {
      const currentState = state.fileUploads[fieldName];
      const [nextFile, ...remainingQueue] = currentState?.queue || [];

      if (!success || !nextFile) {
        // Keep the current blob preview even after successful upload
        // Only clean up if there was an error or if it's not a blob URL
        const currentPreview = currentState?.preview;
        let preservedPreview = currentPreview;

        if (!success && currentPreview && currentPreview.startsWith("blob:")) {
          // Only clean up blob URL if upload failed
          URL.revokeObjectURL(currentPreview);
          preservedPreview = null;
        }

        return {
          fileUploads: {
            ...state.fileUploads,
            [fieldName]: {
              ...currentState,
              uploadStatus: success ? "success" : "error",
              preview: preservedPreview, // Keep the blob preview for successful uploads
              fileError: error || null,
              queue: [],
            },
          },
          ...(success && url
            ? {
                formValues: {
                  ...state.formValues,
                  [fieldName]: {
                    value: url,
                    is_default:
                      state.formValues[fieldName]?.is_default || false,
                  },
                },
              }
            : {}),
        };
      }

      // Process next file in queue
      const reader = new FileReader();
      reader.onloadend = () => {
        set((state) => ({
          fileUploads: {
            ...state.fileUploads,
            [fieldName]: {
              ...state.fileUploads[fieldName],
              file: nextFile,
              preview: reader.result as string,
              uploadStatus: "uploading",
              fileError: null,
              queue: remainingQueue,
              fieldType: state.fileUploads[fieldName]?.fieldType,
            },
          },
        }));
      };
      reader.readAsDataURL(nextFile);

      return {
        fileUploads: {
          ...state.fileUploads,
          [fieldName]: {
            ...currentState,
            queue: remainingQueue,
          },
        },
      };
    });
  },

  // ... rest of your methods remain the same ...
  toggleDropdown: (fieldName, isOpen) =>
    set((state) => ({
      dropdownStates: {
        ...state.dropdownStates,
        [fieldName]: isOpen,
      },
    })),

  toggleDatePicker: (fieldName, isOpen) =>
    set((state) => ({
      datePickerStates: {
        ...state.datePickerStates,
        [fieldName]: isOpen,
      },
    })),

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
      selectedCountry: "IN",
      selectedRegion: "",
      isCountryDropdownOpen: false,
      isRegionDropdownOpen: false,
    }),
});
