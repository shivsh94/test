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

export const verifyRazorpayPayment = async (
  entity_id: string,
  order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string,
  category: string,
  razorpay_order_id: string
) => {
  try {
    const response = await axios.post(
      `/payment/${entity_id}/razorpay/${category}/${order_id}/verify`,
      {
        order_id,
        razorpay_payment_id,
        razorpay_signature,
        razorpay_order_id,
      }
    );
    return response.data;
  } catch (error) {
    console.log("Error verifying payment:", error);
  }
}