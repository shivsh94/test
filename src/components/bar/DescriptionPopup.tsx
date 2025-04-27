"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import Image from "next/image";
import { MenuItem } from "@/store/useProjectStore";

interface BeverageDescriptionPopupProps {
  item: MenuItem;
  onClose: () => void;
}

export default function BeverageDescriptionPopup({
  item,
  onClose,
}: BeverageDescriptionPopupProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-[90%] rounded-lg">
        <DialogHeader>
          <DialogTitle className="flex justify-center text-xl">
            {item.name}
          </DialogTitle>
        </DialogHeader>

        {item.photo && (
          <div className="relative w-full h-44 mx-auto">
            <Image
              src={item.photo}
              alt={item.name}
              fill
              priority={true}
              className="object-cover rounded"
              sizes="(max-width: 640px) 100vw, 640px"
            />
          </div>
        )}

        <DialogDescription>
          {item.description}
          {/* {item.alcohol_percentage && <p className="text-sm text-gray-600">ABV: {item.alcohol_percentage}%</p>}
          {item.quantity && <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>}
          {item.serving_size && <p className="text-sm text-gray-600">Serving Size: {item.serving_size}</p>}
          {item.brand && <p className="text-sm text-gray-600">Brand: {item.brand}</p>}
          {item.origin && <p className="text-sm text-gray-600">Origin: {item.origin}</p>} */}
        </DialogDescription>

        <DialogFooter>
          <div className="flex flex-row w-full justify-between items-center">
            <p className="font-bold text-lg">Price: ₹{item?.price}</p>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
