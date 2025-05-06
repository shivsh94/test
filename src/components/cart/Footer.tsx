import React from "react";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { useSlugStore } from "@/store/useProjectStore";
import useCartStore from "@/store/useCartStore";
import { useMenuStore } from "@/store/useProjectStore";
import { toast } from "sonner";

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

function Footer() {
  const [loading, setLoading] = React.useState(false);
  const { cartItems } = useCartStore();
  const { menuItems = [] } = useMenuStore();
  const slug = useSlugStore((state) => state.data);

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

  const handlePayNow = async () => {
    if (totalItems === 0) {
      toast.warning("Your cart is empty");
      return;
    }

    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
      toast.error("Razorpay Key ID is not set");
      return;
    }

    setLoading(true);

    try {
      // TODO: Replace this block with actual order creation API
      // const orderResponse = await fetch("/api/create-razorpay-order", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ amount: totalBill * 100 }), // in paisa
      // });
      // const orderData = await orderResponse.json();
      // const orderId = orderData.id;

      const orderId = "order_9A33XWu170gUtm"; // Temporary hardcoded

      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: totalBill * 100, // in paisa
        currency: "INR",
        name: "Acme Corp",
        description: "Test Transaction",
        image: "https://example.com/your_logo",
        order_id: orderId,
        handler: async function (response: RazorpayResponse) {
          try {
            const verification = await fetch("/api/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(response),
            });

            const verificationData = await verification.json();
            if (verificationData.success) {
              toast.success("Payment successful!");
              // Do something like redirect or clear cart
            } else {
              toast.error("Payment verification failed");
            }
          } catch (err) {
            console.error("Verification failed", err);
            toast.error("Payment verification error");
          }
        },
        prefill: {
          name: "Customer Name",
          email: "customer@example.com",
          contact: "9999999999",
        },
        notes: {
          orderNote: "Additional order details",
        },
        theme: {
          color: slug?.company?.primary_color || "#3399cc",
        },
        callback_url: `${window.location.origin}/payment/callback`,
        redirect: true,
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed");
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
              onClick={handlePayNow}
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
