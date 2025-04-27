import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Percent } from 'lucide-react';

const savingsCornerData = [
  {
    id: 'savings-plan',
    description: 'Save ₹120 saved with this item',
    link: '/savings-plan'
  },
  {
    id: 'discount-coupons',
    description: 'Get 10% discounts on your favorite products.',
    link: '/discount-coupons'
  },
  {
    id: 'cashback-offers',
    description: 'Earn cash back on todays purchases.',
    link: '/cashback-offers'
  }
];

const SavingsCorner = () => {
  return (
    <Card  className="w-full">
    <CardHeader>
        <CardTitle className='text-zinc-500'>Savings Corner</CardTitle>
    </CardHeader>
    <div className="flex flex-col">
      {savingsCornerData.map((item) => (
          <CardContent key={item.id} className='flex space-x-2 text-sm px-4'>
            <div className='bg-orange-600 h-6 rounded p-1'>
            <Percent size={16} className='text-white'/>
            </div>
            {/* <img src={item.image} alt={item.title} className="w-full h-10 object-cover" /> */}
            {/* <CardTitle className="font-medium text-base">{item.title}</CardTitle> */}
            <div className="text-gray-500 whitespace-normal line-clamp-2">
                {item.description.length > 35 ? `${item.description.slice(0, 35)}...` : item.description}
            </div>            
            {/* <Button variant="primary" className="mt-4" href={item.link}>
              Learn More
            </Button> */}
          </CardContent>
      ))}
    </div>
    </Card>
  );
};

export default SavingsCorner;