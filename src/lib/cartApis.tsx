import axios from "axios";
axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL;

export const getCart = async (entityId: string, customerId: string) => {
  const res = await axios.get(`/cart/${entityId}/customer/${customerId}/list/`);
  return {
    items: res.data?.items || [],
    count: res.data?.count || 0,
  };
};

export const addToCart = async (
  entity_id: string,
  customer_id: string,
  item_id: string,
  quantity: number,
  sub_item_id: string | null = null,
  token: string | null
) => {
  try {
    const res = await axios.post(
      `/cart/${entity_id}/add/`,
      {
        customer_id,
        item_id,
        quantity,
        sub_item_id,
      },
      {
        headers: {
          Captcha: token,
          "Content-Type": "application/json",
        },
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
  quantity: number,
  token: string | null = null
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

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Captcha"] = token;
    }

    const res = await axios.put(
      `/cart/${entity_id}/update/${cart_id}/`,
      payload,
      {
        headers,
      }
    );

    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to update cart";
      console.error("Error updating cart:", errorMessage, error.response?.data);
      throw new Error(errorMessage);
    }
    console.error("Error updating cart:", error);
    throw new Error("Failed to update cart due to unexpected error");
  }
};

export const deleteItem = async (entity_id: string, cart_id: string) => {
  const res = await axios.delete(`/cart/${entity_id}/delete/${cart_id}/`);
  return res.data;
};

export const clearCart = async (entity_id: string, customer_id: string) => {
  const res = await axios.delete(`/cart/${entity_id}/clear/${customer_id}/`);
  return res.data;
};
