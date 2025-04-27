import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { useCart } from '@/context/FoodCartContext';
import Image from 'next/image';

type MealAddon = {
  id: string;
  name: string;
  image: string;
  price: number;
};

const mealAddons = [
    {
      id: 'choco-mouse',
      name: 'Choco Mouse',
      image: '/tea.jpg',
      price: 59,
    },
    {
      id: 'pepsi-bottle',
      name: 'Pepsi Bottle',
      image: '/tea.jpg',
      price: 60,
    },
    {
      id: 'extra-crunchy',
      name: 'Extra Crunchy',
      image: '/tea.jpg',
      price: 20,
    },
    {
      id: 'black-forest',
      name: 'Black Forest',
      image: '/tea.jpg',
      price: 59,
    },
  ];

const CompleteYourMeal = () => {
  const { addToCart } = useCart();  

  const handleAddAddon = (addon: MealAddon) => {
    const cartItem = {
      ...addon,
      category: '', // Adding a category for the item
      quantity: 1,       // Setting a default quantity
    };
    addToCart(cartItem); 
  };
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className='text-zinc-500'>Complete Your Meal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex overflow-x-auto gap-4 custom-scrollbar">
          {mealAddons.map((addon) => (
            <div key={addon.id} className="relative w-24 flex flex-col items-center p-2 flex-shrink-0">
              <Image
                src={addon.image}
                alt={addon.name}
                className=" w-20 h-20 object-cover rounded-md"
                width={80}
                height={80}
              />
                <div className="absolute top-0 right-0 p-0 bg-white rounded border-2">
                <Plus strokeWidth={3} className='text-green-700' onClick={() => handleAddAddon(addon)}/>
                </div>
              <div className="mt-2 text-center text-sm">
                <p className="font-medium">
                {addon.name.length > 8 ? `${addon.name.slice(0, 8)}...` : addon.name}
                </p>
                <p className="text-gray-500">₹{addon.price}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CompleteYourMeal;