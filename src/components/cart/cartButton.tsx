'use client';
import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSlugStore } from '@/store/useProjectStore';

interface CartButtonProps {
  totalItems: number; 
}

const CartButton: React.FC<CartButtonProps> = ({ totalItems }) => {
  const router = useRouter();
  const hotelData = useSlugStore((state) => state.data);

  const handleCartClick = () => {
    router.push('/cart');
  };

  return (
    <div className="fixed bottom-32 right-0 left-0 z-50 max-w-sm mx-auto pointer-events-none">
      <div className="absolute right-4 pointer-events-auto">
        <button
          className="backdrop-blur-lg p-4 rounded-full shadow-lg flex items-center justify-center border-2"
          style={{
            borderColor: hotelData?.company?.primary_color || "green",
              
          }}
          onClick={handleCartClick}
        >
          <div className="relative">
            <ShoppingCart size={24} />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </div>
        </button>
      </div>
    </div>
  );
};

export default CartButton;
