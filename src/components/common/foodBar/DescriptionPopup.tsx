"use client";

import Image from "next/image";
import React from "react";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MenuItem, useSlugStore } from "@/store/useProjectStore";
import { getSymbolFromCurrency } from "@/utils/currency";

interface DescriptionPopupProps {
  item: MenuItem;
  onClose: () => void;
  showFoodType?: boolean;
}

export default function DescriptionPopup({
  item,
  onClose,
  showFoodType = false,
}: Readonly<DescriptionPopupProps>) {
  const getCurrentDay = (): string => {
    const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    return days[new Date().getDay()];
  };
  const currency = useSlugStore((state) => state.data?.currency);
  const currencySymbol = getSymbolFromCurrency(currency || "INR");

  const isWeekend = ["sat", "sun"].includes(getCurrentDay());
  const isHoliday = false;

  const calculateDiscountedPrice = (
    price: string | number,
    discount: string | null | undefined
  ): number => {
    const priceNum = typeof price === "string" ? parseFloat(price) : price || 0;
    const discountNum = discount ? parseFloat(discount) : 0;

    if (isNaN(priceNum)) return 0;
    if (isNaN(discountNum)) return priceNum;

    return priceNum - discountNum;
  };

  const getApplicablePrice = (
    basePrice: any,
    holidayPrice?: any,
    weekendPrice?: any
  ) => {
    if (isHoliday && holidayPrice) return holidayPrice;
    if (isWeekend && weekendPrice) return weekendPrice;
    return basePrice;
  };

  const getPriceAsNumber = (price: string | number) => {
    return typeof price === "string" ? parseFloat(price) : (price ?? 0);
  };

  const getLowestPrice = () => {
    // Handle non-multiple items
    if (!item.is_multiple || !item.sub_items?.length) {
      const applicablePrice = getApplicablePrice(
        item.price,
        item.holiday_price,
        item.weekend_price
      );
      const priceValue = getPriceAsNumber(applicablePrice);
      return calculateDiscountedPrice(priceValue, item.discount);
    }

    // Handle multiple items
    let lowestPrice = Infinity;

    item.sub_items.forEach((subItem) => {
      const applicablePrice = getApplicablePrice(
        subItem.price,
        subItem.holiday_price,
        subItem.weekend_price
      );
      const priceValue = getPriceAsNumber(applicablePrice);
      const discountedPrice = calculateDiscountedPrice(
        priceValue,
        subItem.discount
      );

      if (discountedPrice < lowestPrice) {
        lowestPrice = discountedPrice;
      }
    });

    return lowestPrice;
  };

  const renderHtmlDescription = (description: string) => (
    <div className="space-y-1">
      <div
        className="prose prose-sm max-w-none text-sm text-muted-foreground"
        dangerouslySetInnerHTML={{ __html: description }}
      />
    </div>
  );

  const renderPlainDescription = (description: string) => (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground whitespace-pre-line">
        {description}
      </p>
    </div>
  );

  const renderDescription = () => {
    if (!item.description) return null;

    try {
      if (item.description.startsWith("<")) {
        return renderHtmlDescription(item.description);
      }
    } catch (error) {
      console.error("Error rendering HTML description:", error);
    }

    return renderPlainDescription(item.description);
  };

  const getFoodTypeStyles = (foodType: string) => {
    const isVegetarian = foodType === "Vegetarian";
    return {
      className: `inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
        isVegetarian ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      }`,
      imageSrc: isVegetarian ? "/veg.png" : "/nonveg.png",
      imageAlt: isVegetarian ? "Vegetarian" : "Non-vegetarian",
      label: isVegetarian ? "Vegetarian" : "Non-Vegetarian",
    };
  };

  const lowestPrice = getLowestPrice();

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-[90%] max-w-md rounded-lg">
        <DialogHeader>
          <DialogTitle className="flex justify-center text-xl">
            {item.name}
          </DialogTitle>
        </DialogHeader>

        {item.photo && (
          <div className="relative w-full h-48 mx-auto mb-4">
            <Image
              src={item.photo}
              alt={item.name}
              fill
              unoptimized
              className="object-cover rounded-lg"
              sizes="(max-width: 640px) 100vw, 640px"
              priority
            />
          </div>
        )}

        <div className="text-gray-700 text-base mb-4 px-2 break-words whitespace-pre-line max-h-[200px] overflow-y-auto">
          {renderDescription() ?? "No description available."}
        </div>

        <DialogFooter className="flex flex-col gap-3">
          <div className="flex flex-row w-full justify-between items-center">
            <div className="flex items-center gap-2">
              <p className="font-bold text-xl text-primary">
                {currencySymbol}
                {lowestPrice.toFixed(2)}
              </p>
              {(isWeekend || isHoliday) && (
                <Badge variant="outline">
                  {isHoliday ? "Holiday Price" : "Weekend Price"}
                </Badge>
              )}
            </div>

            {showFoodType && item.food_type && (
              <div className={getFoodTypeStyles(item.food_type).className}>
                <Image
                  src={getFoodTypeStyles(item.food_type).imageSrc}
                  width={20}
                  height={20}
                  unoptimized
                  alt={getFoodTypeStyles(item.food_type).imageAlt}
                />
                {getFoodTypeStyles(item.food_type).label}
              </div>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
