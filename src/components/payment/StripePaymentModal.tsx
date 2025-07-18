import React, { useState } from "react";
import { toast } from "sonner";

interface StripePaymentModalProps {
  stripe: any;
  elements: any;
  orderResponse: any;
  slug: any;
  onSuccess: (paymentIntentId: string) => Promise<void>;
  onClose: () => void;
  themeColor: string;
}

const StripePaymentModal: React.FC<StripePaymentModalProps> = ({
  stripe,
  elements,
  orderResponse,
  slug,
  onSuccess,
  onClose,
  themeColor,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async () => {
    if (!stripe || !elements) {
      toast.error("Payment system not ready");
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success?order_id=${orderResponse.id}`,
        },
        redirect: "if_required",
      });

      if (error) {
        console.error("Payment confirmation error:", error);
        toast.error(error.message || "Payment failed");
      } else if (paymentIntent) {
        console.log("Payment Intent Status:", paymentIntent.status);

        if (paymentIntent.status === "succeeded") {
          await onSuccess(paymentIntent.id);
          onClose();
        } else if (paymentIntent.status === "requires_action") {
          toast.info("Additional authentication required");
        } else {
          toast.error(`Payment status: ${paymentIntent.status}`);
        }
      }
    } catch (err) {
      console.error("Payment processing error:", err);
      toast.error("Payment processing failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[999]" onClick={onClose} />

      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-[1000] w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Complete Payment</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-light"
            disabled={isProcessing}
          >
            ×
          </button>
        </div>

        <div className="mb-6">
          <div id="stripe-payment-element-mount" className="min-h-[50px]" />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isProcessing}
            className="flex-1 px-4 py-3 rounded-md text-white font-semibold hover:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: themeColor }}
          >
            {isProcessing ? "Processing..." : "Pay Now"}
          </button>
        </div>
      </div>
    </>
  );
};

export default StripePaymentModal;
