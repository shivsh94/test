import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";

import {
  addToCart,
  clearCart,
  deleteItem,
  getCart,
  updateCart,
} from "@/lib/cartApis";
import useCartStore, { CartItem } from "@/store/useCartStore";
import { useSlugStore } from "@/store/useProjectStore";
import { getCaptchaToken } from "@/utils/captcha";

const getLocalStorageItem = (key: string) => {
  if (typeof window === "undefined") return null;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error parsing localStorage item "${key}":`, error);
    return null;
  }
};

interface CartResponse {
  items?: CartItem[];
  count?: number;
  id?: string;
  message?: string | null;
}

export const useCartData = () => {
  const formSubmissionResponse = getLocalStorageItem("formSubmissionResponse");
  const customerId = formSubmissionResponse?.id;
  const slugData = useSlugStore((state) => state.data);
  const entityId = slugData?.id;
  const { setCartData, setCount } = useCartStore();

  const {
    data: cartResponse,
    isLoading: isCartLoading,
    isError: isCartError,
    error: cartError,
    refetch: refetchCart,
  } = useQuery<CartResponse>({
    queryKey: ["cart-data", entityId, customerId],
    queryFn: async () => {
      if (!entityId || !customerId) {
        throw new Error("Missing entityId or customerId");
      }
      const response = await getCart(entityId, customerId);

      if (!response || typeof response !== "object") {
        throw new Error("Invalid cart response format");
      }

      return response;
    },
    enabled: !!entityId && !!customerId,
    retry: 1,
  });

  useEffect(() => {
    if (cartResponse?.items) {
      setCartData(cartResponse.items);
      setCount(cartResponse.items.length);
    } else if (cartResponse && !cartResponse.items) {
      setCartData([]);
      setCount(0);
    }
  }, [cartResponse, setCartData, setCount]);

  return {
    cartItems: cartResponse?.items ?? [],
    cartCount: cartResponse?.items?.length ?? 0,
    isLoading: isCartLoading,
    isError: isCartError,
    error: cartError,
    refetchCart,
    customerId,
    entityId,
  };
};

export const useAddToCart = () => {
  const { setCartData, setCount } = useCartStore();
  const { refetchCart } = useCartData();
  const slugData = useSlugStore((state) => state.data);
  const entityId = slugData?.id;
  const formSubmissionResponse = getLocalStorageItem("formSubmissionResponse");
  const customerId = formSubmissionResponse?.id;

  return useMutation<
    CartResponse,
    Error,
    {
      item_id: string;
      quantity: number;
      sub_item_id?: string;
    }
  >({
    mutationFn: async (variables) => {
      const token = await getCaptchaToken();
      if (!entityId || !customerId) {
        throw new Error("Missing entityId or customerId");
      }
      if (!entityId || !customerId) {
        throw new Error("Missing entityId or customerId");
      }
      const response = await addToCart(
        entityId,
        customerId,
        variables.item_id,
        variables.quantity,
        variables.sub_item_id ?? null,
        token ? token : null
      );

      if (!response || typeof response !== "object") {
        throw new Error("Invalid add to cart response format");
      }

      return response;
    },
    onSuccess: (response) => {
      if (response?.items) {
        setCartData(response.items);
        setCount(response.items.length);
        toast.success("Item added to cart");
      } else {
        refetchCart()
          .then(() => toast.success("Item added to cart"))
          .catch(() => toast.error("Added to cart but couldn't refresh data"));
      }
    },
    onError: (error) => {
      console.error("Error adding item to cart:", error);
      toast.error(error.message || "Failed to add item to cart");
      refetchCart().catch(() => console.error("Failed to refetch cart"));
    },
    retry: 1,
  });
};

export const useUpdateCart = () => {
  const { setCartData, setCount } = useCartStore();
  const { refetchCart } = useCartData();
  const slugData = useSlugStore((state) => state.data);
  const entityId = slugData?.id;

  return useMutation<
    CartResponse,
    Error,
    {
      cart_id: string;
      item_id: string;
      sub_item_id: string | null;
      quantity: number;
    }
  >({
    mutationFn: async (variables) => {
      const token = await getCaptchaToken();
      if (!token) {
        throw new Error("Captcha token is required");
      }

      if (!entityId) {
        throw new Error("Missing entityId");
      }
      const response = await updateCart(
        entityId,
        variables.cart_id,
        variables.item_id,
        variables.sub_item_id,
        variables.quantity,
        token
      );
      if (!response || typeof response !== "object") {
        throw new Error("Invalid update response format");
      }

      return response;
    },
    onSuccess: (data) => {
      if (data?.items) {
        setCartData(data.items);
        setCount(data.items.length);
        toast.success("Cart updated successfully");
      } else {
        refetchCart()
          .then(() => toast.success("Cart updated successfully"))
          .catch(() => toast.error("Updated but couldn't refresh cart"));
      }
    },
    onError: (error) => {
      console.error("Error updating cart:", error);
      toast.error(error.message || "Failed to update cart");
      refetchCart().catch(() => console.error("Failed to refetch cart"));
    },
    retry: 1,
  });
};

export const useDeleteCartItem = () => {
  const { cartItems = [], setCartData, setCount } = useCartStore();
  const { refetchCart } = useCartData();
  const slugData = useSlugStore((state) => state.data);
  const entityId = slugData?.id;

  return useMutation({
    mutationFn: async (cart_id: string) => {
      if (!entityId) {
        throw new Error("Missing entityId");
      }
      const response = await deleteItem(entityId, cart_id);

      if (!response || typeof response !== "object") {
        throw new Error("Invalid delete response format");
      }

      return response;
    },
    onMutate: (cart_id) => {
      const updatedItems = cartItems.filter((item) => item.id !== cart_id);
      setCartData(updatedItems);
      setCount(updatedItems.length);
    },
    onSuccess: () => {
      toast.success("Item removed from cart");
    },
    onError: (error) => {
      console.error("Failed to delete item:", error);
      toast.error(error.message || "Failed to remove item from cart");
      refetchCart().catch(() => console.error("Failed to refetch cart"));
    },
  });
};

export const useClearCart = () => {
  const { setCartData, setCount } = useCartStore();
  const { refetchCart } = useCartData();
  const slugData = useSlugStore((state) => state.data);
  const entityId = slugData?.id;
  const formSubmissionResponse = getLocalStorageItem("formSubmissionResponse");
  const customerId = formSubmissionResponse?.id;

  return useMutation({
    mutationFn: async () => {
      if (!entityId || !customerId) {
        throw new Error("Missing entityId or customerId");
      }
      const response = await clearCart(entityId, customerId);

      if (!response || typeof response !== "object") {
        throw new Error("Invalid clear cart response format");
      }

      return response;
    },
    onMutate: () => {
      setCartData([]);
      setCount(0);
    },
    onSuccess: () => {
      toast.success("Cart cleared successfully");
    },
    onError: (error) => {
      console.error("Error clearing cart:", error);
      toast.error(error.message || "Failed to clear cart");
      refetchCart().catch(() => console.error("Failed to refetch cart"));
    },
  });
};
