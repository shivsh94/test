'use client';

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

import Image from "next/image";
import { MenuItem } from "@/store/useProjectStore";

interface DescriptionPopupProps {
  item: MenuItem;
  onClose: () => void;
}

export default function DescriptionPopup({ item, onClose }: DescriptionPopupProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-[90%] rounded-lg">
        <DialogHeader>
          <DialogTitle className="flex justify-center text-xl">{item.name}</DialogTitle>
        </DialogHeader>
        
        {item.photo && (
          <div className="relative w-full h-40 mx-auto">
            <Image 
              src={item.photo} 
              alt={item.name} 
              fill 
              className="object-cover rounded" 
              sizes="(max-width: 640px) 100vw, 640px"
            />
          </div>
        )}

        <DialogDescription className="text-gray-700 text-base mb-2">
           {item.description}
        </DialogDescription>

        <DialogFooter>
            <div className="flex flex-row w-full justify-between items-center">
                <p className="font-bold text-lg">Price: ₹{typeof item.price === 'number' ? item.price : item.price}</p>

            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}