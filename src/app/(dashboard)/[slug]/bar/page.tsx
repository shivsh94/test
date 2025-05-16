'use client';

import Menu from '@/components/bar/Menu';
import FoodComponent from '@/components/bar/FoodComponent';
import useCartStore from '@/store/useCartStore';
import CartButton from '@/components/cart/cartButton';

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
