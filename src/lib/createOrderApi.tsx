import axios from "axios";

export const createOrder = async (
  entity_id: string,
  pay_later: boolean,
  customer_id: string,
  remark: string,
  location: string
) => {
  try {
    const response = await axios.post(
      `http://localhost:8000/server/guest/v1/order/${entity_id}/?pay_later=${pay_later}`,
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
