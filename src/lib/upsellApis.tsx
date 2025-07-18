import axios from "axios";

axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL;

export const getUpsellCategories = async (entity_id: string) => {
  try {
    const response = await axios.get(`/upsell/${entity_id}/category/list/`);
    return response.data;
  } catch (error) {
    console.log("Error fetching upsell categories:", error);
    throw error;
  }
};

export const getupsellItems = async (entity_id: string) => {
  try {
    const response = await axios.get(`/upsell/${entity_id}/item/list/`);
    return response.data;
  } catch (error) {
    console.log("Error fetching upsell items:", error);
    throw error;
  }
};

export const getUpsellItemDetails = async (
  entity_id: string,
  item_id: string
) => {
  try {
    const response = await axios.get(
      `/upsell/${entity_id}/item/read/${item_id}/`
    );
    return response.data;
  } catch (error) {
    console.log("Error fetching upsell item details:", error);
    throw error;
  }
};

import { useMutation } from "@tanstack/react-query";

export interface UpsellOrderData {
  name: string;
  location: string;
  item_id: string;
  sub_item_id?: string;
  customer_id?: string;
  reservation_id?: string;
  context?: {
    details?: Array<{
      name: string;
      label: string;
      value: string;
      price_vary: boolean;
      factor: number;
    }>;
    discounts?: Array<{
      category: string;
      name: string;
      value: number;
    }>;
  };
  // contact: string;
}

export const useCreateUpsellOrder = () => {
  return useMutation({
    mutationFn: async ({
      entity_id,
      pay_later,
      orderDetails,
    }: {
      entity_id: string;
      pay_later: boolean;
      orderDetails: UpsellOrderData;
    }) => {
      const response = await axios.post(
        `/upsell/${entity_id}/order/create/?pay_later=${pay_later}`,
        orderDetails
      );
      return response.data;
    },

    onError: (error) => {
      console.error("Error creating order:", error);
    },
  });
};
