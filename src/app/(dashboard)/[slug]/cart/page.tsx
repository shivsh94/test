"use client";
import { ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { useDeleteCartItem, useUpdateCart } from "@/hooks/useCartData";
import useCartStore from "@/store/useCartStore";
import {
  useCategoryStore,
  useMenuStore,
  useSlugStore,
} from "@/store/useProjectStore";
import { getSymbolFromCurrency } from "@/utils/currency";

export default function CartPage() {
  const { cartItems = [] } = useCartStore();
  const { menuItems = [] } = useMenuStore();
  const categoryStore = useCategoryStore();
  const categories = categoryStore.categories;

  const currency = useSlugStore((state) => state.data?.currency);
  const currencySymbol = getSymbolFromCurrency(currency || "INR");

  const { mutate: updateCartItem, isPending: isUpdatePending } =
    useUpdateCart();
  const { mutate: deleteItem, isPending: isDeletePending } =
    useDeleteCartItem();
  const isPending = isUpdatePending || isDeletePending;

  useEffect(() => {
    if (cartItems.length > 0 && menuItems.length > 0) {
      validateCartItems(cartItems, menuItems);
    }
  }, [cartItems, menuItems]);

  const validateCartItems = (items: typeof cartItems, menuItems: any[]) => {
    items.forEach((cartItem) => {
      const matchedMenuItem = menuItems.find(
        (menuItem) => menuItem.id === cartItem.item_id
      );
      if (!matchedMenuItem) {
        console.warn(
          `No menu item match found for item_id: ${cartItem.item_id}`
        );
      }
    });
  };

  const showFoodIcon = (menuItem: any) => {
    if (!menuItem || !categories) return false;
    const matchedCategory = categories.find(
      (cat) => cat.id === menuItem.category_id
    );
    return matchedCategory?.outlet === "Food";
  };

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
      sub_item_id: item.sub_item_id ?? null,
      quantity: newQuantity,
    });
  };

  const incrementQuantity = (item: (typeof cartItems)[0]) => {
    updateQuantity(item, item.quantity + 1);
  };

  const decrementQuantity = (item: (typeof cartItems)[0]) => {
    updateQuantity(item, item.quantity - 1);
  };

  const isWeekend = () => {
    const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    const currentDay = days[new Date().getDay()];
    return ["sat", "sun"].includes(currentDay);
  };

  const calculateDiscountedPrice = (
    price: number,
    discount: string
  ): number => {
    const discountNum = parseFloat(discount);
    return isNaN(discountNum) || discountNum <= 0 ? price : price - discountNum;
  };

  const getPriceInfo = (item: (typeof cartItems)[0]) => {
    const menuItem = menuItems.find((mi) => mi.id === item.item_id);
    const subItem = menuItem?.sub_items?.find(
      (si) => si.id === item.sub_item_id
    );

    let originalPrice = 0;
    let discount = "0";

    if (subItem) {
      originalPrice = Number(
        isWeekend() && subItem.weekend_price
          ? subItem.weekend_price
          : subItem.price || 0
      );
      discount = subItem.discount || "0";
    } else if (menuItem) {
      originalPrice = Number(
        isWeekend() && menuItem.weekend_price
          ? menuItem.weekend_price
          : (menuItem.price ?? 0)
      );
      discount = menuItem.discount ?? "0";
    }

    const discountedPrice = calculateDiscountedPrice(originalPrice, discount);
    const hasDiscount = discountedPrice !== originalPrice;
    const totalOriginalPrice = originalPrice * item.quantity;
    const totalDiscountedPrice = discountedPrice * item.quantity;

    return {
      originalPrice,
      discountedPrice,
      hasDiscount,
      totalOriginalPrice,
      totalDiscountedPrice,
      menuItem,
      subItem,
    };
  };

  const renderEmptyCart = () => (
    <div className="flex flex-col items-center justify-center pt-44 min-h-64 text-center">
      <ShoppingCart className="w-24 h-24 text-gray-300 mb-4" />
      <p className="text-gray-500 text-lg">Your cart is empty</p>
    </div>
  );

  const renderCartItem = (item: (typeof cartItems)[0]) => {
    const {
      hasDiscount,
      totalOriginalPrice,
      totalDiscountedPrice,
      menuItem,
      subItem,
    } = getPriceInfo(item);

    const displayName = menuItem?.name ?? "Item";
    const displaySubItemName = subItem?.name;

    return (
      <div
        key={item.id}
        className="flex border p-4 w-full rounded-xl shadow-sm relative min-h-[90px]"
      >
        <Button
          onClick={() => removeFromCart(item.id)}
          className="absolute top-2 right-2 text-gray-400 hover:text-red-600 p-1 h-auto bg-transparent hover:bg-red-50 border-0 shadow-none"
          disabled={isPending}
        >
          <Trash2 className="w-4 h-4" />
        </Button>

        <div className="flex-1 pr-12">
          <div className="flex items-start mb-2">
            {showFoodIcon(menuItem) && (
              <Image
                src={
                  menuItem?.food_type === "Vegetarian"
                    ? "/veg.png"
                    : "/nonveg.png"
                }
                width={20}
                height={20}
                unoptimized
                alt={
                  menuItem?.food_type === "Vegetarian"
                    ? "Vegetarian"
                    : "Non-vegetarian"
                }
                className="mr-2"
              />
            )}
            <div className="flex gap-3">
              <h3 className="font-semibold text-base leading-tight">
                {displayName}
              </h3>
              {displaySubItemName && (
                <h6 className="text-xs text-gray-600 text-center mt-1">
                  {displaySubItemName}
                </h6>
              )}
            </div>
          </div>

          <div className="flex items-center">
            {hasDiscount && (
              <span className="text-sm line-through text-gray-400 mr-2">
                {currencySymbol}
                {totalOriginalPrice.toFixed(2)}
              </span>
            )}
            <span className="text-base font-semibold">
              {currencySymbol}
              {totalDiscountedPrice.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="absolute bottom-2 right-2 flex items-center bg-gray-100 rounded-lg">
          <button
            onClick={() => decrementQuantity(item)}
            className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-l-lg transition-colors"
            disabled={isPending}
          >
            -
          </button>
          <span className="px-4 py-2 text-base font-medium min-w-[40px] text-center bg-white">
            {item.quantity}
          </span>
          <button
            onClick={() => incrementQuantity(item)}
            className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-r-lg transition-colors"
            disabled={isPending}
          >
            +
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="">
      {cartItems.length === 0 ? (
        renderEmptyCart()
      ) : (
        <div className="space-y-4">{cartItems.map(renderCartItem)}</div>
      )}
    </div>
  );
}
