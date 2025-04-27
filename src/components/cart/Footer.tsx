import React from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/FoodCartContext";
import { useSlugStore } from "@/store/useProjectStore";

function Footer() {
  const { cartItems } = useCart();
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalBill = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const hotelData = useSlugStore((state) => state.data);
  return (
    <div className="border-t w-full shadow-lg sticky bottom-0 bg-white/80 backdrop-blur-lg h-16 flex p-2 px-6">
      <div className="flex flex-col justify-between w-full">
        <h2 className="text-xs">
          Total Bill {totalItems > 0 && `(${totalItems} items)`}
        </h2>
        <h6 className="text-lg font-semibold">₹ {totalBill.toFixed(2)}</h6>
      </div>
      <div className="flex items-center">
        <Button
          className="text-white transition-colors"
          style={{ backgroundColor: hotelData?.company.primary_color }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.filter = "brightness(80%)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.filter = "brightness(90%)")
          }
        >
          Pay Now
        </Button>
      </div>
    </div>
  );
}

export default Footer;
