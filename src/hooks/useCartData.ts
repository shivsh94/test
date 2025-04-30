import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { addToCart, clearCart, deleteItem, getCart, updateCart } from "@/lib/cartApis";
import useCartStore from "@/store/useCartStore";
import { useSlugStore } from "@/store/useProjectStore";
import { toast } from "sonner";

const getLocalStorageItem = (key: string) => {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch (error) {
    console.log("Error parsing localStorage item:", error);
    return localStorage.getItem(key);
  }
};

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
    refetch: refetchCart,
  } = useQuery({
    queryKey: ["cart-data", entityId, customerId],
    queryFn: () => {
      if (!entityId || !customerId) {
        throw new Error("Missing entityId or customerId");
      }
      return getCart(entityId, customerId);
    },
    enabled: !!entityId && !!customerId,
  });

  useEffect(() => {
    if (cartResponse) {
      setCartData(cartResponse.items);
      setCount(cartResponse.count);
    }
  }, [cartResponse, setCartData, setCount]);

  return {
    cartItems: cartResponse?.items || [],
    cartCount: cartResponse?.count || 0,
    isLoading: isCartLoading,
    isError: isCartError,
    refetchCart,
    customerId,
    entityId,
  };
};

export const useAddToCart = () => {
  const { cartItems, setCartData, setCount } = useCartStore();
  const { refetchCart } = useCartData();
  const slugData = useSlugStore((state) => state.data);
  const entityId = slugData?.id;
  const formSubmissionResponse = getLocalStorageItem("formSubmissionResponse");
  const customerId = formSubmissionResponse?.id;

  return useMutation({
    mutationFn: async (variables: {
      item_id: string;
      quantity: number;
      sub_item_id?: string;
    }) => {
      if (!entityId || !customerId) {
        throw new Error("Missing entityId or customerId");
      }
      return addToCart(
        entityId,
        customerId,
        variables.item_id,
        variables.quantity,
        variables.sub_item_id
      );
    },
    onMutate: async (variables) => {
      // Optimistic update logic
      const existingItem = cartItems.find(
        item => item.item_id === variables.item_id && 
               item.sub_item_id === variables.sub_item_id
      );

      const updatedItems = existingItem
        ? cartItems.map(item =>
            item.item_id === variables.item_id &&
            item.sub_item_id === variables.sub_item_id
              ? { ...item, quantity: item.quantity + variables.quantity }
              : item
          )
        : [
            ...cartItems,
            {
              id: `temp-${Date.now()}`,
              item_id: variables.item_id,
              sub_item_id: variables.sub_item_id || "",
              quantity: variables.quantity,
              customer_id: customerId || "",
              entity_id: entityId || ""
            }
          ];

      setCartData(updatedItems);
      setCount(updatedItems.length);
    },
    onSuccess: (data) => {
      // Replace optimistic items with server response
      setCartData(data.items);
      setCount(data.count);
      toast.success("Item added to cart");
    },
    onError: (error) => {
      console.error("Error adding item to cart:", error);
      toast.error("Failed to add item to cart");
      refetchCart(); // Revert to server state
    },
    retry: 1,
  });
};

export const useUpdateCart = () => {
  const { setCartData, setCount } = useCartStore();
  const { refetchCart } = useCartData();
  const slugData = useSlugStore((state) => state.data);
  const entityId = slugData?.id;

  return useMutation({
    mutationFn: async (variables: {
      cart_id: string;
      item_id: string;
      sub_item_id: string | null;
      quantity: number;
    }) => {
      if (!entityId) {
        throw new Error("Missing entityId");
      }
      return updateCart(
        entityId,
        variables.cart_id,
        variables.item_id,
        variables.sub_item_id,
        variables.quantity
      );
    },
    onSuccess: (data) => {
      setCartData(data.items);
      setCount(data.count);
      toast.success("Cart updated successfully");
    },
    onError: (error) => {
      console.log("Error updating cart:", error);
      refetchCart();
    },
    retry: 1,
  });
};

export const useDeleteCartItem = () => {
  const { cartItems, setCartData } = useCartStore();
  const slugData = useSlugStore((state) => state.data);
  const entityId = slugData?.id;

  return useMutation({
    mutationFn: async (cart_id: string) => {
      if (!entityId) {
        throw new Error("Missing entityId");
      }
      return deleteItem(entityId, cart_id);
    },
    onMutate: async (cart_id) => {
      // Optimistically update the UI
      const updatedItems = cartItems.filter(item => item.id !== cart_id);
      setCartData(updatedItems);
    },
    onError: (error) => {
      // Revert to original state on error
      setCartData(cartItems);
      console.error("Failed to delete item:", error);
    }
  });
};

export const useClearCart = () => {
  const { setCartData, setCount, clearCart: clearLocalCart } = useCartStore();
  const slugData = useSlugStore((state) => state.data);
  const entityId = slugData?.id;
  const formSubmissionResponse = getLocalStorageItem("formSubmissionResponse");
  const customerId = formSubmissionResponse?.id;

  return useMutation({
    mutationFn: async () => {
      if (!entityId || !customerId) {
        throw new Error("Missing entityId or customerId");
      }
      return clearCart(entityId, customerId);
    },
    onMutate: () => {
      // Optimistically clear local cart immediately
      clearLocalCart();
    },
    onSuccess: () => {
      // Confirm the clear (though local is already cleared)
      setCartData([]);
      setCount(0);
    },
    onError: (error) => {
      console.error("Error clearing cart:", error);
      // In a real app, you might want to refetch the cart here
    }
  });
};