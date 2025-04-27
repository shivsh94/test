"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "../ui/separator";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useMemo } from "react";
import { useCart } from "@/context/FoodCartContext";
import Image from "next/image";
import { MenuItem, MenuSubItem } from "@/store/useProjectStore";

interface AddonsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: string;
  categoryId: string;
  item: MenuItem;
  category: string;
}

export function Addons({
  open,
  onOpenChange,
  categoryId,
  item,
  category,
}: AddonsProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedSubItem, setSelectedSubItem] = useState<string | null>(null);

  const getCurrentDay = (): "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun" => {
    const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    return days[new Date().getDay()] as "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
  };

  const isWeekend = getCurrentDay() === "sat" || getCurrentDay() === "sun";

  const hasSubItems = item.sub_items && item.sub_items.length > 0;
  const displayItems = useMemo(() => {
    return hasSubItems ? item.sub_items ?? [] : [item];
  }, [hasSubItems, item]);

  useEffect(() => {
    if (hasSubItems && (displayItems?.length ?? 0) > 0) {
      setSelectedSubItem(displayItems?.[0]?.id ?? null);
    }
  }, [hasSubItems, displayItems]);

  const selectedItem = hasSubItems
    ? displayItems?.find((subItem) => subItem.id === selectedSubItem) ?? null
    : item;

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const getPrice = () => {
    if (!selectedItem) return 0;
    
    const price = isWeekend && selectedItem.weekend_price 
      ? selectedItem.weekend_price 
      : selectedItem.price;
    
    return Number(price ?? 0) * quantity;
  };

  const getDisplayPrice = (item: MenuItem | MenuSubItem) => {
    return isWeekend && item.weekend_price 
      ? item.weekend_price 
      : item.price ?? "0";
  };

  const handleAddToCart = () => {
    if (!selectedItem) return;

    addToCart({
      id: `${selectedItem.id}-${Date.now()}`,
      menuItemId: selectedItem.id,
      name: selectedItem.name,
      photo: item.photo || "",
      category,
      categoryId,
      price: Number(getDisplayPrice(selectedItem)),
      quantity,
      isVeg: (item.food_type === "Vegetarian").toString(),
      parentName: hasSubItems ? item.name : null,
      parentId: hasSubItems ? item.id : null,
    });

    onOpenChange(false);
    setQuantity(1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="-translate-y-0 rounded-t-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between space-x-2 relative">
          <DialogTitle>
            <p className="text-sm text-muted-foreground font-medium text-start">
              {item.name}
              {hasSubItems && selectedItem && ` - ${selectedItem.name}`}
              {selectedItem &&
                ` - ₹${Number(getDisplayPrice(selectedItem)).toFixed(2)}`}
            </p>
            <p className="text-xl font-bold mt-1 text-start text-secondary-foreground">
              Customize your order
            </p>
          </DialogTitle>

          {(item.photo) && (
            <div className="relative w-20 h-20">
              <Image
                src={item.photo || "/fallback-image.jpg"}
                alt={selectedItem?.name || item.name}
                priority={true}
                fill
                className="object-cover rounded-md"
              />
            </div>
          )}
        </DialogHeader>
        <Separator />

        <div className="grid gap-2 pb-4">
          {hasSubItems && (
            <div>
              <h3 className="text-base font-medium mb-2">Select Variant</h3>
              <div className="grid grid-cols-1 gap-2">
                {displayItems.map((subItem) => (
                  <div
                    key={subItem.id}
                    className={`flex items-center justify-between rounded-md border p-3 cursor-pointer ${
                      selectedSubItem === subItem.id
                        ? "bg-accent border-primary"
                        : ""
                    }`}
                    onClick={() => setSelectedSubItem(subItem.id)}
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="variant"
                        checked={selectedSubItem === subItem.id}
                        onChange={() => setSelectedSubItem(subItem.id)}
                        className="h-4 w-4"
                      />
                      <label className="text-sm font-medium">
                        {subItem.name}
                      </label>
                    </div>
                    {subItem.price && (
                      <p className="text-sm font-medium">
                        ₹{Number(
                          isWeekend && subItem.weekend_price
                            ? subItem.weekend_price
                            : subItem.price
                        ).toFixed(2)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {item?.description && (
            <div className="mt-2">
              <h3 className="text-sm font-medium">Description</h3>
              <p className="text-sm text-muted-foreground">
                {item?.description}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="sticky bottom-0 bg-background flex flex-row items-center justify-center gap-2">
          <div>
            <div className="flex items-center space-x-4 ">
              <Button
                variant="outline"
                size="sm"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
              >
                -
              </Button>
              <span className="text-sm font-medium">{quantity}</span>
              <Button variant="outline" size="sm" onClick={incrementQuantity}>
                +
              </Button>
            </div>
          </div>
          <Button
            onClick={handleAddToCart}
            className="h-fit flex-1"
            disabled={!selectedItem?.price && !selectedItem?.weekend_price}
          >
            Add Item | ₹{getPrice().toFixed(2)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}