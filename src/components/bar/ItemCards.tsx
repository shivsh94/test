'use client';
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import DescriptionPopup from "@/components/bar/DescriptionPopup";
import { Addons } from "./Addons";
import { MenuItem} from "@/store/useProjectStore";

interface BeverageItemCardProps {
  item: MenuItem
  onAddClick: (item:MenuItem) => void; 
}

export function BeverageItemCard({ item, onAddClick }: BeverageItemCardProps) {

  const [showPopup, setShowPopup] = useState(false); 
  const [showAddons, setShowAddons] = useState(false); 

  if (!item) {
    return <div className="p-4 border rounded-md">Item not found</div>;
  }

  const displayPrice = item.is_multiple && item.sub_items?.length
    ? `₹ ${Number(item.sub_items[1].price).toFixed(2)}`
    : `₹ ${Number(item.price).toFixed(2)}`;
  
  const description = item.description || '';
  const truncatedDescription = description.length > 40
    ? `${description.slice(0, 40)}...`
    : description;

  return (
    <div className="flex shadow-lg p-4 border rounded-md space-x-4">
      <div className="flex flex-col w-full">
        <h3 className="text-base font-semibold">{item.name}</h3>
        
        <p className="text-sm font-semibold py-1">{displayPrice}</p>
        
        <p className="text-xs text-gray-600 leading-tight">
          {truncatedDescription}
          {description.length > 40 && (
            <button
              className="text-blue-500 text-sm cursor-pointer ml-1"
              onClick={() => setShowPopup(true)} 
            >
              Show More
            </button>
          )}
        </p>
      </div>

      <div className="flex flex-col items-center justify-center mb-2">
        {item.photo && (
          <div className="relative">
            <Image
              src={item.photo}
              alt={item.name}
              width={100}
              height={100}
              className="w-40 h-20 rounded-md object-cover"
              priority={true}
            />
            <Button
              variant="outline"
              className="text-sm -bottom-4 absolute left-1/2 -translate-x-1/2 z-10"
              onClick={() => {
                setShowAddons(true);
                onAddClick(item);
              }}
            >
              Add
            </Button>
          </div>
        )}
      </div>

      {showPopup && (
        <DescriptionPopup
          item={item}
          onClose={() => setShowPopup(false)}
        />
      )}

      {showAddons && (
        <Addons
          open={showAddons}
          onOpenChange={setShowAddons}
          item={item}
          category=""
          categoryId=""
        />
      )}
    </div>
  );
}