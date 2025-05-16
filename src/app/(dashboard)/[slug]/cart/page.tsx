"use client";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
// import MealAddons from "@/components/cart/MealAddons";
// import Savings from "@/components/cart/Savings";
import useCartStore from "@/store/useCartStore";
import { useMenuStore } from "@/store/useProjectStore";
import { useEffect } from "react";
import { useDeleteCartItem, useUpdateCart } from "@/hooks/useCartData";
import Image from "next/image";

export default function CartPage() {
  const { cartItems = [] } = useCartStore();
  const { menuItems = [] } = useMenuStore();

  // console.log("Cart Items:", cartItems);
  // console.log("Menu Items:", menuItems);

  const { mutate: updateCartItem, isPending: isUpdatePending } =
    useUpdateCart();
  const { mutate: deleteItem, isPending: isDeletePending } =
    useDeleteCartItem();

  const isPending = isUpdatePending || isDeletePending;

  useEffect(() => {
    if (cartItems.length > 0 && menuItems.length > 0) {
      cartItems.forEach((cartItem) => {
        const matchedMenuItem = menuItems.find(
          (menuItem) => menuItem.id === cartItem.item_id
        );

        if (!matchedMenuItem) {
          console.warn(
            `No menu item match found for item_id: ${cartItem.item_id}`
          );
        }
      });
    }
  }, [cartItems, menuItems]);

  const removeFromCart = (cartId: string) => {
    deleteItem(cartId);
  };

  const updateQuantity = (item: (typeof cartItems)[0], newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(item.id);
      return;
    }

    updateCartItem({
      cart_id: item.id,
      item_id: item.item_id,
      sub_item_id: item.sub_item_id || null,
      quantity: newQuantity,
    });
  };

  const incrementQuantity = (item: (typeof cartItems)[0]) => {
    updateQuantity(item, item.quantity + 1);
  };

  const decrementQuantity = (item: (typeof cartItems)[0]) => {
    updateQuantity(item, item.quantity - 1);
  };

  return (
    <div className="">
      {cartItems.length === 0 ? (
        <p className="">No items in the cart</p>
      ) : (
        <div className="space-y-4">
          {cartItems.map((item) => {
            const menuItem = menuItems.find((mi) => mi.id === item.item_id);
            const subItem = menuItem?.sub_items?.find(
              (si) => si.id === item.sub_item_id
            );

            const effectivePrice = subItem?.price || menuItem?.price || 0;
            const displayName = menuItem?.name || "Item";
            const displaySubItemName = subItem?.name;

            return (
              <div
                key={item.id}
                className="flex items-center border p-2 w-full justify-between rounded-xl shadow-sm"
              >
                <div>{/* Optional image placeholder */}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-base">{displayName}</h3>
                  {displaySubItemName && (
                    <h6 className="text-xs text-gray-600">
                      {displaySubItemName}
                    </h6>
                  )}
                  <p className="text-base mt-2">
                    ₹ {(Number(effectivePrice) * item.quantity).toFixed(2)}
                  </p>

                  <Image
                    src={
                      menuItem?.food_type === "Vegetarian"
                        ? "/veg.png"
                        : "/nonveg.png"
                    }
                    width={20}
                    height={20}
                    alt={
                      menuItem?.food_type === "Vegetarian"
                        ? "Vegetarian"
                        : "Non-vegetarian"
                    }
                  />
                </div>
                <div className="flex flex-col items-end justify-between h-full space-y-4">
                  <Button
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-400 hover:text-gray-700 px-2 py-1 bg-gray-100 hover:bg-gray-200"
                    disabled={isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <div className="flex items-center w-20">
                    <button
                      onClick={() => decrementQuantity(item)}
                      className="px-1 py-0 w-5 bg-gray-200 rounded hover:bg-gray-300 items-start"
                      disabled={isPending}
                    >
                      -
                    </button>
                    <span className="text-base flex-grow text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => incrementQuantity(item)}
                      className="px-1 py-0 w-5 bg-gray-200 rounded hover:bg-gray-300 items-end"
                      disabled={isPending}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* <MealAddons /> */}
          {/* <Savings /> */}
        </div>
      )}
    </div>
  );
}
