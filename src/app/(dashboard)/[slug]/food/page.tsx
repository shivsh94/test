"use client";

import CartButton from "@/components/cart/cartButton";
import Menu from "@/components/common/foodBar/Menu";
import FoodComponent from "@/components/food/FoodComponent";
import useCartStore from "@/store/useCartStore";

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
