'use client';
import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSlugStore } from '@/store/useProjectStore';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface CartButtonProps {
  totalItems: number;
}
const CartButton = ({ totalItems }: CartButtonProps) => {
  const router = useRouter();
  const hotelData = useSlugStore((state) => state.data);
  const handleCartClick = () => {
    if (totalItems === 0) {
      toast.info('Your cart is empty');
      return;
    }
    router.push('/cart');
  };

  const primaryColor = hotelData?.company?.primary_color || '#22c55e'; 

  return (
    <div className="fixed bottom-32 right-0 left-0 z-50 max-w-sm mx-auto pointer-events-none">
      <div className="absolute right-4 pointer-events-auto">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="backdrop-blur-lg p-4 rounded-full shadow-lg flex items-center justify-center border-2 transition-all"
          style={{
            borderColor: primaryColor,
            backgroundColor: `${primaryColor}20`,
          }}
          onClick={handleCartClick}
          aria-label="View cart"
        >
          <div className="relative">
            <ShoppingCart 
              size={24} 
              className="text-gray-800 dark:text-white" 
            />
            <AnimatePresence>
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                >
                  {totalItems > 9 ? '9+' : totalItems}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </motion.button>
      </div>
    </div>
  );
};

export default CartButton;