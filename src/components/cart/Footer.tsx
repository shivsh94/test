import React from "react";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { useSlugStore } from "@/store/useProjectStore";
import useCartStore from "@/store/useCartStore";
import { useMenuStore } from "@/store/useProjectStore";
import { toast } from "sonner";
import { createOrder, verifyRazorpayPayment } from "@/lib/createOrderApi";
// import { createOrder, verifyRazorpayPayment } from "@/services/orderService";

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: Record<string, string>;
  theme: {
    color: string;
  };
  callback_url?: string;
  redirect?: boolean;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
    };
  }
}
const getLocalStorageItem = (key: string) => {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch (error) {
    console.log("Error parsing localStorage item:", error);
    return localStorage.getItem(key);
  }
};

function Footer() {
  const [loading, setLoading] = React.useState(false);
  const { cartItems, clearCart } = useCartStore();
  const { menuItems = [] } = useMenuStore();
  const slug = useSlugStore((state) => state.data);
  const formSubmissionResponse = getLocalStorageItem("formSubmissionResponse");
  const customerId = formSubmissionResponse?.id;

  const { totalItems, totalBill } = React.useMemo(() => {
    let itemsCount = 0;
    let billTotal = 0;

    cartItems.forEach((cartItem) => {
      const menuItem = menuItems.find((item) => item.id === cartItem.item_id);
      const subItem = menuItem?.sub_items?.find(
        (sub) => sub.id === cartItem.sub_item_id
      );
      const price = subItem?.price || menuItem?.price || 0;
      itemsCount += cartItem.quantity;
      billTotal += Number(price) * cartItem.quantity;
    });

    return { totalItems: itemsCount, totalBill: billTotal };
  }, [cartItems, menuItems]);

  const handlePaymentSuccess = async (orderId: string, paymentMethod: 'online' | 'pay_later') => {
    try {
      toast.success(`Order ${paymentMethod === 'online' ? 'and payment' : ''} successful!`);
      clearCart();
      // You might want to redirect to order confirmation page here
    } catch (error) {
      console.error("Order success handling failed:", error);
      toast.error("Order completion failed");
    }
  };

  const verifyPayment = async (
    entityId: string,
    orderId: string,
    razorpayResponse: RazorpayResponse,
    category: string = "Food & Beverage" // Default category
  ) => {
    try {
      const verification = await verifyRazorpayPayment(
        entityId,
        orderId,
        razorpayResponse.razorpay_payment_id,
        razorpayResponse.razorpay_signature,
        category,
        razorpayResponse.razorpay_order_id
      );
      
      return verification;
    } catch (error) {
      console.error("Payment verification failed:", error);
      throw error;
    }
  };

  const handlePayNow = async () => {
    if (totalItems === 0) {
      toast.warning("Your cart is empty");
      return;
    }

    setLoading(true);

    try {
      // Create order in your system and get Razorpay payment data
      const orderResponse = await createOrder(
        slug?.id || '',
        false, // pay_later = false for Pay Now
        customerId, // customer_id (replace with actual customer ID if available)
        '', // remark
        '' // location
      );

      if (!orderResponse.payment_data) {
        throw new Error("Payment data not received from server");
      }

      const paymentData = orderResponse.payment_data;

      const options: RazorpayOptions = {
        key: paymentData.key,
        amount: paymentData.amount,
        currency: paymentData.currency,
        name: paymentData.name || slug?.company?.name || "Order Payment",
        description: paymentData.description || "Complete your payment",
        image: paymentData.logo || slug?.company?.logo || "",
        order_id: paymentData.order_id,
        handler: async function (response: RazorpayResponse) {
          try {
            // Verify payment with our backend
            const verification = await verifyPayment(
              slug?.id || '',
              orderResponse.id,
              response,
              "Food & Beverage" // Or get category from slug/store
            );

            if (verification?.success) {
              await handlePaymentSuccess(orderResponse.id, 'online');
            } else {
              toast.error("Payment verification failed");
            }
          } catch (err) {
            console.error("Payment verification failed", err);
            toast.error("Payment verification error");
          }
        },
        prefill: {
          name: "Guest User", // Replace with actual customer name if available
          email: "guest@example.com", // Replace with actual customer email if available
          contact: "0000000000", // Replace with actual customer phone if available
        },
        notes: {
          order_id: orderResponse.id,
        },
        theme: {
          color: paymentData.color || slug?.company?.primary_color || "#3399cc",
        },
        callback_url: paymentData.callback_url,
        redirect: false,
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment initialization failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePayLater = async () => {
    if (totalItems === 0) {
      toast.warning("Your cart is empty");
      return;
    }

    setLoading(true);
    try {
      const orderResponse = await createOrder(
        slug?.id || '',
        true, // pay_later = true for Pay Later
        customerId, // customer_id (replace with actual customer ID if available)
        '', // remark
        '' // location
      );
      await handlePaymentSuccess(orderResponse.id, 'pay_later');
    } catch (error) {
      console.error("Pay Later error:", error);
      toast.error("Pay Later failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => console.log("Razorpay SDK loaded")}
      />
      <div className="border-t w-full max-w-sm shadow-lg fixed bottom-16 bg-white/80 backdrop-blur-lg h-16 flex p-2 px-6 items-center">
        <div className="flex flex-col justify-between w-full">
          <h2 className="text-xs">
            {totalItems > 0
              ? `Total (${totalItems} ${totalItems === 1 ? "item" : "items"})`
              : "Your cart is empty"}
          </h2>
          {totalItems > 0 && (
            <h6 className="text-lg font-semibold">₹ {totalBill.toFixed(2)}</h6>
          )}
        </div>

        {slug?.bar_paylater_enabled && (
          <div className="flex items-center mr-2">
            <Button
              className="text-white transition-colors hover:brightness-90"
              style={{
                backgroundColor: slug?.company?.primary_color || "#2563eb",
                opacity: totalItems === 0 || loading ? 0.7 : 1,
                cursor:
                  totalItems === 0 || loading ? "not-allowed" : "pointer",
              }}
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
            style={{
              backgroundColor: slug?.company?.primary_color || "#2563eb",
              opacity: totalItems === 0 || loading ? 0.7 : 1,
              cursor:
                totalItems === 0 || loading ? "not-allowed" : "pointer",
            }}
            onClick={handlePayNow}
            disabled={totalItems === 0 || loading}
          >
            {loading
              ? "Processing..."
              : totalItems > 0
              ? "Pay Now"
              : "Add Items"}
          </Button>
        </div>
      </div>
    </>
  );
}

export default Footer;