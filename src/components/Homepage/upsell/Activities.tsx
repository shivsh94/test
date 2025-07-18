"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCombinedData } from "@/hooks/useUpsellData";
import { useSlugStore } from "@/store/useProjectStore";
import { Item, UpsellCategory } from "@/store/useUpsellStore";

import { getSymbolFromCurrency } from "../../../utils/currency";
import { ActivityDialog } from "./ActivityDialog";

interface GroupedItems {
  categoryName: string;
  items: Item[];
}

export default function ActivitiesPage() {
  const upsellData = useCombinedData();
  const entity_id = useSlugStore((state) => state.data?.id);
  const currency = useSlugStore((state) => state.data?.currency);
  const currencySymbol =
    getSymbolFromCurrency(currency || "INR") || currency || "₹";
  const [selectedActivity, setSelectedActivity] = useState<Item | null>(null);

  const groupedItems: GroupedItems[] =
    upsellData?.upsellCategories?.map((category: UpsellCategory) => {
      return {
        categoryName: category.name,
        items:
          upsellData?.items?.filter(
            (item: Item) => item.category_id === category.id
          ) || [],
      };
    }) || [];

  const calculateDiscountedPrice = (
    price: string | number,
    discount: string | null | undefined
  ): number => {
    const priceNum = typeof price === "string" ? parseFloat(price) : price || 0;
    const discountNum = discount ? parseFloat(discount) : 0;
    return priceNum - discountNum;
  };

  const getLowestPrice = (item: Item) => {
    if (!item.sub_items || item.sub_items.length === 0) {
      const basePrice = item.price || "0";
      return calculateDiscountedPrice(basePrice, item.discount);
    }

    let lowestPrice = Infinity;
    item.sub_items.forEach((subItem) => {
      const basePrice = subItem.price || "0";
      const discountedPrice = calculateDiscountedPrice(
        basePrice,
        subItem.discount
      );
      if (discountedPrice < lowestPrice) {
        lowestPrice = discountedPrice;
      }
    });

    return lowestPrice;
  };

  const hasDiscount = (item: Item) => {
    if (item.discount && parseFloat(item.discount) > 0) return true;

    if (item.sub_items) {
      return item.sub_items.some(
        (subItem) => subItem.discount && parseFloat(subItem.discount) > 0
      );
    }

    return false;
  };

  const getOriginalPrice = (item: Item) => {
    if (!item.sub_items || item.sub_items.length === 0) {
      return parseFloat(item.price || "0");
    }

    let lowestOriginal = Infinity;
    item.sub_items.forEach((subItem) => {
      const price = parseFloat(subItem.price || "0");
      if (price < lowestOriginal) {
        lowestOriginal = price;
      }
    });

    return lowestOriginal;
  };

  const handleBookNow = (bookingDetails: {
    activity: string;
    persons?: number;
    date?: string;
    slot?: string;
    selectedSubItem?: string;
    selectedSubItemPrice?: number;
    formValues?: Record<string, any>;
  }) => {
    console.log(bookingDetails);
    alert("Booking Confirmed!");
    setSelectedActivity(null);
  };

  return (
    <div className="mx-auto px-4 pb-3">
      {groupedItems.map((group) => (
        <div key={group.categoryName} className="mb-8">
          {group.items.length > 0 && (
            <>
              <div className="flex gap-2 items-center w-full mb-4">
                <Separator className="flex-1 bg-gradient-to-l from-gray-400 to-background" />
                <h2 className="text-lg font-bold text-center">
                  {group.categoryName}
                </h2>
                <Separator className="flex-1 bg-gradient-to-r from-gray-400 to-background" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {group.items.map((item) => {
                  const lowestPrice = getLowestPrice(item);
                  const originalPrice = getOriginalPrice(item);
                  const itemHasDiscount = hasDiscount(item);

                  return (
                    <Card
                      key={item.id}
                      className="relative h-48 overflow-hidden rounded-md shadow-lg cursor-pointer border-none group"
                      onClick={() => setSelectedActivity(item)}
                    >
                      <Image
                        src={item.cover}
                        alt={item.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        width={200}
                        height={200}
                        unoptimized
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

                      <div className="absolute bottom-0 left-0 right-0 p-2 px-3 h-16 bg-background/90 text-foreground rounded-md rounded-t-none shadow-xl">
                        <div className="relative w-full h-6 overflow-hidden">
                          <motion.div
                            className="absolute whitespace-nowrap flex items-center text-base font-semibold"
                            initial={{ x: "100%" }}
                            animate={
                              item.name.length > 16
                                ? { x: ["0%", "-50%", "50%"] }
                                : { x: 0 }
                            }
                            transition={
                              item.name.length > 16
                                ? {
                                    repeat: Infinity,
                                    duration: 10,
                                    ease: "linear",
                                  }
                                : {}
                            }
                          >
                            <span>{item.name}</span>
                          </motion.div>
                        </div>
                        <div className="flex items-baseline gap-2 mt-1">
                          {itemHasDiscount && (
                            <div className="flex items-center gap-1">
                              <span className="text-xs line-through text-muted-foreground">
                                {currencySymbol}
                                {originalPrice.toFixed(2)}
                              </span>
                            </div>
                          )}
                          <span className="text-sm font-bold text-primary">
                            {currencySymbol}
                            {lowestPrice.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </div>
      ))}

      <ActivityDialog
        activity={selectedActivity}
        onClose={() => setSelectedActivity(null)}
        onBookNow={handleBookNow}
        entityId={entity_id ?? ""}
      />
    </div>
  );
}
