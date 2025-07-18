import axios from "axios";

export const createOrder = async (
  entity_id: string,
  pay_later: boolean,
  customer_id: string,
  reservation_id: string | null,
  remark: string,
  location: string,
  token: string
) => {
  try {
    const response = await axios.post(
      `/order/${entity_id}/?pay_later=${pay_later}`,
      {
        customer_id,
        reservation_id,
        remark,
        location,
      },
      {
        headers: {
          Captcha: token,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to create order"
      );
    }
    throw new Error("Failed to create order");
  }
};

export const verifyRazorpayPayment = async (
  entity_id: string,
  order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string,
  category: string,
  razorpay_order_id: string,
  token: string
) => {
  try {
    const response = await axios.post(
      `/payment/${entity_id}/razorpay/${category}/${order_id}/verify/`,
      {
        order_id,
        razorpay_payment_id,
        razorpay_signature,
        razorpay_order_id,
      },
      {
        headers: {
          Captcha: token,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Payment verification failed"
      );
    }
    throw new Error("Payment verification failed");
  }
};

export const verifyStripePayment = async (
  entityId: string,
  orderId: string,
  paymentIntentId: string,
  category: string = "Food & Beverage",
  captchaToken: string
) => {
  try {
    const response = await axios.post(
      `/payment/${entityId}/stripe/${category}/${orderId}/verify/`,
      {
        payment_intent_id: paymentIntentId,
      },
      {
        headers: {
          Captcha: captchaToken,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Stripe payment verification error:", error);
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Payment verification failed"
      );
    }
    throw new Error("Payment verification failed");
  }
};

export const getStripeClientSecret = async (
  entityId: string,
  paymentIntentId: string
) => {
  try {
    const url = `/payment/${entityId}/stripe/client-secret/${paymentIntentId}`;
    const response = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Get client secret error:", error);
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to get client secret"
      );
    }
    throw new Error("Failed to get client secret");
  }
};
