import { CartItem } from "@/store/useCartStore";
import axios from "axios";

export const getCart = async (entityId: string, customerId: string) => {
  const res = await axios.get(
    `http://localhost:8000/server/guest/v1/cart/${entityId}/customer/${customerId}/list/`
  );
  return res.data;
};

export const addToCart = async (
  entity_id: string,
  customer_id: string,
  item_id: string,
  quantity: number,
  sub_item_id: string | null = null
): Promise<{ items: CartItem[]; count: number }> => {

  try {
    const res = await axios.post(
      `http://localhost:8000/server/guest/v1/cart/${entity_id}/add/`,
      {
        customer_id,
        item_id,
        quantity,
        sub_item_id,
      }
    );
    return res.data;
  } catch (error) {
    console.log("Error adding to cart:", error);
    throw error;
  }
};

export const updateCart = async (
  entity_id: string,
  cart_id: string,
  item_id: string,
  sub_item_id: string | null,
  quantity: number
) => {
  if (!entity_id || !cart_id || !item_id) {
    throw new Error("Missing required parameters");
  }
  if (quantity <= 0) {
    throw new Error("Quantity must be greater than 0");
  }

  try {
    const payload = {
      item_id,
      quantity,
      ...(sub_item_id && { sub_item_id }),
    };

    const res = await axios.put(
      `http://localhost:8000/server/guest/v1/cart/${entity_id}/update/${cart_id}/`,
      payload
    );
    return res.data;
  } catch (error) {
    console.error("Error updating cart:", error);
    throw error;
  }
};

export const deleteItem = async (entity_id: string, cart_id: string) => {
  const res = await axios.delete(
    `http://localhost:8000/server/guest/v1/cart/${entity_id}/delete/${cart_id}/`
  );
  return res.data;
};

export const clearCart = async (entity_id: string, customer_id: string) => {
  const res = await axios.delete(
    `http://localhost:8000/server/guest/v1/cart/${entity_id}/clear/${customer_id}/`
  );
  return res.data;
};
