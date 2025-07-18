"use client";

import { ChevronLeft, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import Footer from "@/components/cart/Footer";
import { Button } from "@/components/ui/button";
import { useClearCart } from "@/hooks/useCartData";
import useCartStore from "@/store/useCartStore";

interface CartLayoutProps {
  children: React.ReactNode;
}

export default function CartLayout({ children }: Readonly<CartLayoutProps>) {
  const router = useRouter();
  const { cartItems } = useCartStore();
  const { mutate: clearCart, isPending: isClearPending } = useClearCart();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleClearCartClick = () => {
    if (cartItems.length === 0) return;
    setShowConfirmDialog(true);
  };

  const handleConfirmClear = () => {
    clearCart();
    setShowConfirmDialog(false);
  };

  const handleCancelClear = () => {
    setShowConfirmDialog(false);
  };

  return (
    <div className="w-full max-w-sm min-h-screen flex flex-col bg-white">
      <div className="flex items-center p-4 border-b sticky top-0 z-50 bg-white">
        <button
          onClick={() => router.back()}
          className="absolute text-gray-600 hover:text-gray-900"
          aria-label="Go back"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="mx-auto text-xl font-semibold">Cart</h1>

        {cartItems.length > 0 && (
          <Button
            onClick={handleClearCartClick}
            variant="ghost"
            size="icon"
            className="text-gray-400  px-2 py-1 bg-gray-100 hover:bg-gray-200 hover:text-red-600"
            disabled={isClearPending}
            aria-label="Clear cart"
          >
            {isClearPending ? (
              <span className="animate-pulse">...</span>
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>

      <main className="flex-grow p-4">{children}</main>

      <div className="w-full max-w-sm mx-auto relative">
        <Footer />
      </div>

      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 animate-in fade-in-0 zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                Clear Cart
              </h2>
              <button
                onClick={handleCancelClear}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              <p className="text-gray-600 mb-6">
                Are you sure you want to clear your entire cart?
              </p>

              <div className="flex gap-3 justify-end">
                <Button
                  onClick={handleCancelClear}
                  variant="outline"
                  className="px-4 py-2"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmClear}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
                  disabled={isClearPending}
                >
                  {isClearPending ? "Clearing..." : "Clear Cart"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
