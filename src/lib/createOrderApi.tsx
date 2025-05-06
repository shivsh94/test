import axios from "axios";
axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const createOrder = async (
  entity_id: string,
  pay_later: boolean,
  customer_id: string,
  remark: string,
  location: string
) => {
  try {
    const response = await axios.post(
      `/order/${entity_id}/?pay_later=${pay_later}`,
      {
        customer_id,
        remark,
        location,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating cart:", error);
    throw error;
  }
};
