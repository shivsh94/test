import { useMutation } from "@tanstack/react-query";
import axios from "axios";

axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL;

interface PaymentPayload {
  id: string;
  payment_method: string;
  category: string;
}

export const createPayment = async (
  entity_id: string,
  payload: PaymentPayload
) => {
  try {
    const response = await axios.post(`/payment/${entity_id}/create/`, payload);
    return response.data;
  } catch (error) {
    console.error("Error creating payment:", error);
    throw error;
  }
};

export const useCreatePayment = () => {
  return useMutation({
    mutationFn: ({
      entity_id,
      payload,
    }: {
      entity_id: string;
      payload: PaymentPayload;
    }) => createPayment(entity_id, payload),
  });
};
