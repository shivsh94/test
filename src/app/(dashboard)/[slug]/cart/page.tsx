'use client';
import { useCart } from '@/context/FoodCartContext';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import MealAddons from '@/components/cart/MealAddons'
import Savings from '@/components/cart/Savings'

export default function CartPage() {
  const { cartItems, incrementQuantity, decrementQuantity, removeFromCart} = useCart();

  // console.log("Cart Items:", cartItems);

  return (
    <div className="">
      <h1 className="text-lg font-bold">
        {/* Cart {totalItems > 0 && `(${totalItems} items)`} */}
      </h1>
      {cartItems.length === 0 ? (
        <p className=''>No items in the cart</p>
      ) : (
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center space-x-4 border p-2 w-full justify-between rounded-xl shadow-sm"
            >
              <div>
                {item.photo && (
                  <Image
                    src={item.photo}
                    alt={item.name}
                    width={50}
                    height={50}
                    className="rounded-md h-20 w-20"
                  />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-base">{item.parentName}</h3>
                <div className='flex'>
                <h6 className="text-xs text-gray-600">{item.category}</h6>
                {item.name && <h6 className="text-xs text-gray-600">, {item.name}</h6>}
                </div>
                <p className="text-base mt-2 ">₹ {(item.price * item.quantity).toFixed(2)}</p>
              </div>
              <div className="flex flex-col items-end justify-between h-full space-y-4">
                {/* Remove Button */}
                <Button
                  onClick={() => removeFromCart(item.id, item.size)}
                  className="text-gray-400 hover:text-gray-700 px-2 py-1 bg-gray-100 hover:bg-gray-200" 
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                {/* Increment/Decrement Section */}
                <div className="flex items-center w-20">
                  <button
                    onClick={() => {
                      if (item.quantity === 1) {
                        removeFromCart(item.id, item.size); // Remove item from cart if quantity gets less than 1
                      } else {
                        decrementQuantity(item.id, item.size); 
                      }
                    }}
                  className="px-1 py-0 w-5 bg-gray-200 rounded hover:bg-gray-300 items-start"
                  >
                    -
                  </button>
                  <span className="text-base flex-grow text-center">{item.quantity}</span>
                  <button
                    onClick={() => incrementQuantity(item.id, item.size)}
                    className="px-1 py-0 w-5 bg-gray-200 rounded hover:bg-gray-300 items-end"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}

          <MealAddons />

          <Savings />

          {/* Total Section */}

        </div>
      )}
    </div>
  );
}
