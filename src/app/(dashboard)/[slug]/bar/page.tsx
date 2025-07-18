"use client";

import FoodComponent from "@/components/bar/FoodComponent";
import CartButton from "@/components/cart/cartButton";
import useCartStore from "@/store/useCartStore";

import Menu from "../../../../components/common/foodBar/Menu";

export default function Page() {
  const { cartItems } = useCartStore();

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex flex-col my-2">
      <Menu />
      <CartButton totalItems={totalItems} />
      <FoodComponent />
    </div>
  );
}
