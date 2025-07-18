"use client";

import Script from "next/script";
import React from "react";
import { toast } from "sonner";

import StripePaymentModal from "@/components/payment/StripePaymentModal";

declare global {
  interface Window {
    Stripe: any;
    Razorpay: new (options: any) => { open: () => void };
  }
}

import { Button } from "@/components/ui/button";
import { useClearCart } from "@/hooks/useCartData";
import { useReservationData } from "@/hooks/useReservation";
import {
  createOrder,
  getStripeClientSecret,
  verifyRazorpayPayment,
  verifyStripePayment,
} from "@/lib/createOrderApi";
import useCartStore from "@/store/useCartStore";
import { useMenuStore, useSlugStore } from "@/store/useProjectStore";
import { getCaptchaToken } from "@/utils/captcha";
import { getSymbolFromCurrency } from "@/utils/currency";

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface StripeResponse {
  stripe_payment_intent_id: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image: string;
  order_id: string;
  handler: (response: RazorpayResponse) => Promise<void>;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: {
    order_id: string;
  };
  theme: {
    color: string;
  };
  callback_url: string;
  redirect: boolean;
}

const getLocalStorageItem = (key: string) => {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(key) ?? "null");
  } catch (error) {
    console.log("Error parsing localStorage item:", error);
    return localStorage.getItem(key);
  }
};

const calculateDiscountedPrice = (price: number, discount: string): number => {
  const discountNum = parseFloat(discount);
  return isNaN(discountNum) || discountNum <= 0 ? price : price - discountNum;
};

const getCurrentDay = (): string => {
  const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return days[new Date().getDay()];
};

const getItemText = (count: number): string => (count === 1 ? "item" : "items");

const calculateCartTotals = (
  cartItems: any[],
  menuItems: any[],
  isWeekend: boolean
) => {
  return cartItems.reduce(
    (acc, cartItem) => {
      const menuItem = menuItems.find((item) => item.id === cartItem.item_id);
      const subItem = menuItem?.sub_items?.find(
        (sub: any) => sub.id === cartItem.sub_item_id
      );

      const priceSource = subItem || menuItem;
      if (!priceSource) return acc;

      const price = Number(
        isWeekend && priceSource.weekend_price
          ? priceSource.weekend_price
          : (priceSource.price ?? 0)
      );
      const discount = priceSource.discount ?? "0";
      const discountedPrice = calculateDiscountedPrice(price, discount);

      return {
        totalItems: acc.totalItems + cartItem.quantity,
        totalBill: acc.totalBill + discountedPrice * cartItem.quantity,
        originalTotalBill: acc.originalTotalBill + price * cartItem.quantity,
      };
    },
    { totalItems: 0, totalBill: 0, originalTotalBill: 0 }
  );
};

const getPaymentDescription = (slug: any): string =>
  slug?.company?.name ? `${slug.company.name} Order Payment` : "Order Payment";

const getPaymentThemeColor = (slug: any): string =>
  slug?.company?.primary_color ?? "#3399cc";

const getRazorpayOptions = (
  paymentData: any,
  totalBill: number,
  slug: any,
  orderResponse: any,
  handleVerification: (response: RazorpayResponse) => Promise<void>
): RazorpayOptions => ({
  key: paymentData.key,
  amount: Math.round(totalBill * 100),
  currency: paymentData.currency,
  name: getPaymentDescription(slug),
  description: paymentData.description ?? "Complete your payment",
  image: paymentData.logo ?? slug?.company?.logo ?? "",
  order_id: paymentData.order_id,
  handler: handleVerification,
  prefill: {
    name: "Guest User",
    email: "guest@example.com",
    contact: "0000000000",
  },
  notes: {
    order_id: orderResponse.id,
  },
  theme: {
    color: getPaymentThemeColor(slug),
  },
  callback_url: paymentData.callback_url,
  redirect: false,
});

function Footer() {
  const [loading, setLoading] = React.useState(false);
  const [showStripeModal, setShowStripeModal] = React.useState(false);
  const [stripeData, setStripeData] = React.useState<{
    stripe: any;
    elements: any;
    orderResponse: any;
  } | null>(null);
  const { cartItems } = useCartStore();
  const { menuItems = [] } = useMenuStore();
  const slug = useSlugStore((state) => state.data);
  const formSubmissionResponse = getLocalStorageItem("formSubmissionResponse");
  const customerId = formSubmissionResponse?.id;
  const { reservation } = useReservationData();
  const reservation_id = reservation?.id;
  const isWeekend = ["sat", "sun"].includes(getCurrentDay());
  const { mutate: clearCart } = useClearCart();
  const currency = useSlugStore((state) => state.data?.currency);
  const currencySymbol =
    getSymbolFromCurrency(currency || "INR") || currency || "{currencySymbol }";

  const { totalItems, totalBill } = React.useMemo(
    () => calculateCartTotals(cartItems, menuItems, isWeekend),
    [cartItems, menuItems, isWeekend]
  );

  const handlePaymentSuccess = async (
    orderId: string,
    paymentMethod: "online" | "pay_later"
  ) => {
    toast.success(
      `Order ${paymentMethod === "online" ? "and payment" : ""} successful!`
    );
  };

  const verifyPayment = async (
    entityId: string,
    orderId: string,
    response: RazorpayResponse | StripeResponse,
    category: string = "Food & Beverage",
    gateway: string = "razorpay"
  ) => {
    const token = await getCaptchaToken();
    if (!token) {
      toast.error("Captcha verification failed");
      return null;
    }

    if (gateway === "stripe" && "stripe_payment_intent_id" in response) {
      const stripeResponse = await verifyStripePayment(
        entityId,
        orderId,
        response.stripe_payment_intent_id,
        category,
        token
      );
      return stripeResponse;
    } else if (gateway === "razorpay" && "razorpay_payment_id" in response) {
      const razorpayResponse = await verifyRazorpayPayment(
        entityId,
        orderId,
        response.razorpay_payment_id,
        response.razorpay_signature,
        category,
        response.razorpay_order_id,
        token
      );
      return razorpayResponse;
    }

    return null;
  };

  const handleVerification = async (
    slugId: string,
    orderId: string,
    response: RazorpayResponse | StripeResponse,
    gateway: string = "razorpay"
  ) => {
    const verification = await verifyPayment(
      slugId,
      orderId,
      response,
      "Food & Beverage",
      gateway
    );
    if (verification?.success) {
      await handlePaymentSuccess(orderId, "online");
    } else {
      toast.error("Payment verification failed");
    }
  };

  const handleStripePayment = async (paymentData: any, orderResponse: any) => {
    try {
      const stripe = window.Stripe(paymentData.publishable_key);

      const clientSecretResponse = await getStripeClientSecret(
        slug?.id ?? "",
        paymentData.payment_intent_id
      );

      if (
        !clientSecretResponse.success ||
        !clientSecretResponse.client_secret
      ) {
        toast.error("Failed to initialize payment");
        setLoading(false);
        return;
      }

      const elements = stripe.elements({
        clientSecret: clientSecretResponse.client_secret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: getPaymentThemeColor(slug),
          },
        },
      });

      const paymentElement = elements.create("payment");

      setStripeData({ stripe, elements, orderResponse });
      setShowStripeModal(true);

      setTimeout(async () => {
        try {
          await paymentElement.mount("#stripe-payment-element-mount");
          console.log("Payment element mounted successfully");
        } catch (error) {
          console.error("Error mounting payment element:", error);
          toast.error("Failed to load payment form");
          setShowStripeModal(false);
          setLoading(false);
        }
      }, 100);
    } catch (error) {
      console.error("Stripe payment error:", error);
      toast.error("Stripe payment initialization failed");
      setLoading(false);
    }
  };

  const handleStripeSuccess = async (paymentIntentId: string) => {
    if (!stripeData) return;

    const stripeResponse = {
      stripe_payment_intent_id: paymentIntentId,
    };

    await handleVerification(
      slug?.id ?? "",
      stripeData.orderResponse.id,
      stripeResponse,
      "stripe"
    );

    clearCart();
    setLoading(false);
  };

  const handleStripeClose = () => {
    setShowStripeModal(false);
    setStripeData(null);
    setLoading(false);
  };

  const handleOrderCreation = async (
    slugId: string,
    payLater: boolean,
    customerId: string,
    token: string
  ) => {
    const orderResponse = await createOrder(
      slugId,
      payLater,
      customerId,
      reservation_id,
      "",
      "",
      token
    );

    if (!orderResponse.payment_data && !payLater) {
      throw new Error("Payment data not received from server");
    }

    return orderResponse;
  };

  const handlePayment = async (payLater: boolean) => {
    if (totalItems === 0) {
      toast.warning("Your cart is empty");
      return;
    }

    setLoading(true);
    let gateway: string | undefined;
    try {
      const token = await getCaptchaToken();
      if (!token) {
        toast.error("Captcha verification failed");
        setLoading(false);
        return;
      }

      const orderResponse = await handleOrderCreation(
        slug?.id ?? "",
        payLater,
        customerId,
        token
      );

      if (!orderResponse || !orderResponse.id) {
        toast.error("Order creation failed");
        setLoading(false);
        return;
      }

      console.log("Order created successfully:", orderResponse);

      if (payLater) {
        clearCart();
        await handlePaymentSuccess(orderResponse.id, "pay_later");
        setLoading(false);
        return;
      }

      gateway = orderResponse?.payment_data?.gateway?.toLowerCase();
      console.log("Payment gateway:", gateway);

      if (gateway === "razorpay") {
        const options = getRazorpayOptions(
          orderResponse.payment_data,
          totalBill,
          slug,
          orderResponse,
          async (response) => {
            await handleVerification(
              slug?.id ?? "",
              orderResponse.id,
              response,
              "razorpay"
            );
            clearCart();
          }
        );

        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.open();
        setLoading(false);
      } else if (gateway === "stripe") {
        await handleStripePayment(orderResponse.payment_data, orderResponse);
      } else if (gateway === "payu") {
        const redirectUrl = orderResponse.payment_data?.payment_url;
        if (!redirectUrl) {
          toast.error("Payment URL not provided by PayU");
          setLoading(false);
          return;
        }

        clearCart();
        toast.loading("Redirecting to PayU...");
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 1000);
      } else {
        toast.error("Unknown or unsupported payment gateway");
        setLoading(false);
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(
        payLater ? "Pay Later failed" : "Payment initialization failed"
      );
      setLoading(false);
    }
  };

  const handlePayNow = () => handlePayment(false);
  const handlePayLater = () => handlePayment(true);

  const buttonStyle = {
    backgroundColor: getPaymentThemeColor(slug),
    opacity: totalItems === 0 || loading ? 0.7 : 1,
    cursor: totalItems === 0 || loading ? "not-allowed" : "pointer",
  };

  return (
    <>
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => {
          console.log("Razorpay SDK loaded");
        }}
      />
      <Script
        id="stripe-js"
        src="https://js.stripe.com/v3/"
        onLoad={() => {
          console.log("Stripe SDK loaded");
        }}
      />

      {/* Stripe Payment Modal */}
      {showStripeModal && stripeData && (
        <StripePaymentModal
          stripe={stripeData.stripe}
          elements={stripeData.elements}
          orderResponse={stripeData.orderResponse}
          slug={slug}
          onSuccess={handleStripeSuccess}
          onClose={handleStripeClose}
          themeColor={getPaymentThemeColor(slug)}
        />
      )}

      <div className="border-t w-full max-w-sm shadow-lg fixed bottom-16 bg-white/80 backdrop-blur-lg h-16 flex px-6 items-center">
        <div className="flex flex-col justify-between w-full">
          <h2 className="text-xs">
            {totalItems > 0
              ? `Total (${totalItems} ${getItemText(totalItems)})`
              : "Your cart is empty"}
          </h2>
          {totalItems > 0 && (
            <div className="flex items-center gap-2">
              <h6 className="text-lg font-semibold">
                {currencySymbol} {totalBill.toFixed(2)}
              </h6>
            </div>
          )}
        </div>

        {slug?.bar_paylater_enabled === true && (
          <div className="flex items-center mr-2">
            <Button
              className="text-white transition-colors hover:brightness-90"
              style={buttonStyle}
              onClick={handlePayLater}
              disabled={totalItems === 0 || loading}
            >
              {loading ? "Processing..." : "Pay Later"}
            </Button>
          </div>
        )}

        <div className="flex items-center">
          <Button
            className="text-white transition-colors hover:brightness-90"
            style={buttonStyle}
            onClick={handlePayNow}
            disabled={totalItems === 0 || loading}
          >
            {slug?.cafe_pay_enabled === true
              ? loading
                ? "Processing..."
                : "Pay Now"
              : loading
                ? "Processing..."
                : "Order Now"}
          </Button>
        </div>
      </div>
    </>
  );
}

export default Footer;
