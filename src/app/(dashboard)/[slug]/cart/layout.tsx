"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Trash2 } from "lucide-react";
import Footer from "@/components/cart/Footer";
import { Button } from "@/components/ui/button";
import { useClearCart } from "@/hooks/useCartData";
import useCartStore from "@/store/useCartStore";
// import { useCartStore } from "@/store/useCartStore";

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { cartItems } = useCartStore();
  const { mutate: clearCart, isPending: isClearPending } = useClearCart();

  const handleClearCart = () => {
    if (cartItems.length === 0) return;
    if (confirm("Are you sure you want to clear your entire cart?")) {
      clearCart();
    }
  };

  return (
    <div className="w-full max-w-sm min-h-screen flex flex-col bg-white pb-16">
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
            onClick={handleClearCart}
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-gray-700 px-2 py-1 bg-gray-100 hover:bg-gray-200"
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
    </div>
  );
}
