import React from "react";
import { Button } from "@/components/ui/button";
import { useSlugStore } from "@/store/useProjectStore";
import useCartStore from "@/store/useCartStore";
import { useMenuStore } from "@/store/useProjectStore";
import { toast } from "sonner";

function Footer() {
  const { cartItems } = useCartStore();
  const { menuItems = [] } = useMenuStore();
  const slug = useSlugStore((state) => state.data);
  const { totalItems, totalBill } = React.useMemo(() => {
    let itemsCount = 0;
    let billTotal: number = 0;
    // console.log("cartItems", slug?.bar_paylater_enabled);

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

  const handlePayNow = () => {
    if (totalItems === 0) {
      toast.warning("Your cart is empty");
      return;
    }

    // {slug?.bar_paylater_enabled }
    // Add your payment logic here
    toast.success("Proceeding to payment");
    console.log("Payment initiated for:", { totalItems, totalBill });
  };

  return (
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
           opacity: totalItems === 0 ? 0.7 : 1,
           cursor: totalItems === 0 ? "not-allowed" : "pointer",
         }}
         onClick={handlePayNow}
         disabled={totalItems === 0}
       >
         Pay Later
       </Button>
       </div>
     )}

      <div className="flex items-center">
        <Button
          className="text-white transition-colors hover:brightness-90"
          style={{
            backgroundColor: slug?.company?.primary_color || "#2563eb",
            opacity: totalItems === 0 ? 0.7 : 1,
            cursor: totalItems === 0 ? "not-allowed" : "pointer",
          }}
          onClick={handlePayNow}
          disabled={totalItems === 0}
        >
          {/* {slug?.bar_paylater_enabled  ? 'Proceed' : 'Pay Now'} */}
          {totalItems > 0 ? "Pay Now" : "Add Items"}
        </Button>
      </div>
    </div>
  );
}

export default Footer;
