const CART_STORAGE_KEY = "cartItems";
import { CartItem } from "@/context/FoodCartContext";

const REQUEST_CART_STORAGE_KEY = "requestCartItems";
import { RequestItem } from "@/context/RequestCartContext";

const FORM_SUBMISSION_KEY = "formSubmissionResponse";

// Cart related functions
export const getCartFromLocalStorage = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  const storedCart = localStorage.getItem(CART_STORAGE_KEY);
  return storedCart ? JSON.parse(storedCart) : [];
};

export const saveCartToLocalStorage = (cartItems: CartItem[]): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
};

// Request cart related functions
export const getRequestCartFromLocalStorage = (): RequestItem[] => {
  if (typeof window === "undefined") return [];
  const storedCart = localStorage.getItem(REQUEST_CART_STORAGE_KEY);
  return storedCart ? JSON.parse(storedCart) : [];
};

export const saveRequestCartToLocalStorage = (
  cartItems: RequestItem[]
): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(REQUEST_CART_STORAGE_KEY, JSON.stringify(cartItems));
};

// Form submission related functions
// export const storeFormSubmission = (data: any, slug: string): void => {
//   if (typeof window === "undefined") return;
//   try {
//     const submission = {
//       ...data,
//       slug,
//       timestamp: new Date().toISOString()
//     };
//     localStorage.setItem(FORM_SUBMISSION_KEY, JSON.stringify(submission));
//   } catch (error) {
//     console.error("Error storing form submission:", error);
//   }
// };

// export const clearFormSubmissionIfSlugChanged = (currentSlug: string): void => {
//   if (typeof window === "undefined") return;
//   try {
//     const stored = localStorage.getItem(FORM_SUBMISSION_KEY);
//     if (!stored) return;

//     const parsed = JSON.parse(stored);
//     if (parsed.slug && parsed.slug !== currentSlug) {
//       localStorage.removeItem(FORM_SUBMISSION_KEY);
//     }
//   } catch (error) {
//     console.error("Error checking form submission:", error);
//     localStorage.removeItem(FORM_SUBMISSION_KEY);
//   }
// };

export const getFormSubmission = (): any => {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(FORM_SUBMISSION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Error getting form submission:", error);
    return null;
  }
};

export const savedResponse = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    return !!localStorage.getItem(FORM_SUBMISSION_KEY);
  } catch (error) {
    console.error("Error accessing localStorage:", error);
    return false;
  }
};

export const getLocalStorageItem = (key: string) => {
  if (typeof window === "undefined") return null;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error getting localStorage item ${key}:`, error);
    return null;
  }
};

export const setLocalStorageItem = (key: string, value: any) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(
      new CustomEvent("localStorageChange", {
        detail: { key, value },
      })
    );
  } catch (error) {
    console.error(`Error setting localStorage item ${key}:`, error);
  }
};

export const removeLocalStorageItem = (key: string) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
    window.dispatchEvent(
      new CustomEvent("localStorageChange", {
        detail: { key, value: null },
      })
    );
  } catch (error) {
    console.error(`Error removing localStorage item ${key}:`, error);
  }
};

export const storeFormSubmission = (formData: any, currentSlug: string) => {
  const formSubmissionData = {
    ...formData,
    slug: currentSlug,
    timestamp: new Date().toISOString(),
  };
  setLocalStorageItem("formSubmissionResponse", formSubmissionData);
};

export const validateAndClearFormSubmission = (currentSlug: string) => {
  const formSubmissionResponse = getLocalStorageItem("formSubmissionResponse");

  if (formSubmissionResponse) {
    if (
      formSubmissionResponse.slug &&
      formSubmissionResponse.slug !== currentSlug
    ) {
      console.log(
        `Slug mismatch: stored=${formSubmissionResponse.slug}, current=${currentSlug}`
      );
      removeLocalStorageItem("formSubmissionResponse");
      return null;
    }

    if (!formSubmissionResponse.slug) {
      console.log("No slug found in stored form submission, clearing...");
      removeLocalStorageItem("formSubmissionResponse");
      return null;
    }
  }

  return formSubmissionResponse;
};

export const clearFormSubmissionIfSlugChanged = (currentSlug: string) => {
  return validateAndClearFormSubmission(currentSlug);
};

export const isValidUserSession = (currentSlug: string) => {
  const formSubmissionResponse = validateAndClearFormSubmission(currentSlug);
  return !!formSubmissionResponse;
};
