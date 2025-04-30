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
import { MenuItem, MenuSubItem } from "@/store/useProjectStore";
import { toast } from "sonner";
import { addToCart } from "@/lib/cartApis";
import { useSlugStore } from "@/store/useProjectStore";
import Image from "next/image";
import useCartStore from "@/store/useCartStore";

interface AddonsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: string;
  categoryId: string;
  item: MenuItem;
  category: string;
}

const getLocalStorageItem = (key: string) => {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch (error) {
    console.log("Error parsing localStorage item:", error);
    return localStorage.getItem(key);
  }
};

export function Addons({ open, onOpenChange, item }: AddonsProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSubItem, setSelectedSubItem] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const slugData = useSlugStore((state) => state.data);
  const entityId = slugData?.id;
  const formSubmissionResponse = getLocalStorageItem("formSubmissionResponse");
  const customerId = formSubmissionResponse?.id;

  const getCurrentDay = (): string => {
    const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    return days[new Date().getDay()];
  };

  const isWeekend = ["sat", "sun"].includes(getCurrentDay());
  const hasSubItems = !!item.sub_items?.length;
  const displayItems = useMemo(
    () => (hasSubItems ? item.sub_items! : [item]),
    [hasSubItems, item]
  );

  useEffect(() => {
    if (hasSubItems && displayItems.length > 0) {
      setSelectedSubItem(displayItems[0].id);
    }
  }, [hasSubItems, displayItems]);

  const selectedItem = hasSubItems
    ? (displayItems.find((subItem) => subItem.id === selectedSubItem) ?? null)
    : item;

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));

  const getPrice = (item: MenuItem | MenuSubItem): number => {
    const price =
      isWeekend && item.weekend_price ? item.weekend_price : item.price;
    return Number(price ?? 0);
  };

  const calculateTotal = (): number => {
    return selectedItem ? getPrice(selectedItem) * quantity : 0;
  };

  const handleAddToCart = async () => {
    if (!selectedItem || !entityId || !customerId) return;

    setIsLoading(true);
    try {
      const { items, count } = await addToCart(
        entityId,
        customerId,
        item.id,
        quantity,
        hasSubItems ? selectedItem.id : null
      );

      useCartStore.getState().setCartData(items);
      useCartStore.getState().setCount(count);

      toast.success(
        `${quantity} ${quantity > 1 ? "items" : "item"} added to cart`
      );
      onOpenChange(false);
      setQuantity(1);
    } catch (error) {
      toast.error("Failed to add item to cart");
      console.log("Add to cart error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-t-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <DialogTitle className="text-start">
              <p className="text-sm text-muted-foreground font-medium">
                {item.name}
                {hasSubItems && selectedItem && ` - ${selectedItem.name}`}
                {selectedItem && ` - ₹${getPrice(selectedItem).toFixed(2)}`}
              </p>
              <p className="text-xl font-bold mt-1 text-secondary-foreground">
                Customize your order
              </p>
            </DialogTitle>
          </div>

          {item.photo && (
            <div className="relative w-20 h-20 shrink-0">
              <Image
                src={item.photo}
                alt={selectedItem?.name || item.name}
                fill
                className="object-cover rounded-md"
                sizes="80px"
                priority
              />
            </div>
          )}
        </DialogHeader>

        <Separator />

        {item.description && (
          <div className="space-y-1">
            <h3 className="text-sm font-medium">Description</h3>
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </div>
        )}

        <div className="grid gap-4 py-2">
          {hasSubItems && (
            <div className="space-y-3">
              <h3 className="text-base font-medium">Select Variant</h3>
              <div className="grid gap-2">
                {displayItems.map((subItem) => (
                  <div
                    key={subItem.id}
                    className={`flex items-center justify-between p-3 rounded-md border cursor-pointer transition-colors ${
                      selectedSubItem === subItem.id
                        ? "border-primary bg-accent"
                        : "hover:bg-accent/50"
                    }`}
                    onClick={() => setSelectedSubItem(subItem.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                          selectedSubItem === subItem.id
                            ? "border-primary bg-primary"
                            : "border-muted-foreground"
                        }`}
                      >
                        {selectedSubItem === subItem.id && (
                          <div className="h-2 w-2 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="text-sm font-medium">
                        {subItem.name}
                      </span>
                    </div>
                    <span className="text-sm font-medium">
                      ₹{getPrice(subItem).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="sticky bottom-0 bg-background pt-4 pb-2">
          <div className="flex items-center justify-between w-full gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-10 w-10 p-0"
                onClick={decrementQuantity}
                disabled={quantity <= 1 || isLoading}
              >
                -
              </Button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <Button
                variant="outline"
                size="sm"
                className="h-10 w-10 p-0"
                onClick={incrementQuantity}
                disabled={isLoading}
              >
                +
              </Button>
            </div>

            <Button
              onClick={handleAddToCart}
              className="flex-1 h-12"
              disabled={
                (!selectedItem?.price && !selectedItem?.weekend_price) ||
                isLoading ||
                !entityId ||
                !customerId
              }
            >
              {isLoading
                ? "Adding..."
                : `Add ${quantity > 1 ? `${quantity} Items` : "Item"} | ₹${calculateTotal().toFixed(2)}`}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
