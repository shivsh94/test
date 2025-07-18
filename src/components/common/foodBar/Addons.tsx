"use client";

import { Separator } from "@radix-ui/react-separator";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAddToCart, useUpdateCart } from "@/hooks/useCartData";
import useCartStore from "@/store/useCartStore";
import { MenuItem, MenuSubItem, useSlugStore } from "@/store/useProjectStore";
import { getSymbolFromCurrency } from "@/utils/currency";

interface AddonsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: MenuItem;
  showViewCartAction?: boolean;
  showCartQuantity?: boolean;
}

const getLocalStorageItem = (key: string) => {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(key) ?? "null");
  } catch (error) {
    console.log("Error parsing localStorage item:", error);
    return localStorage.getItem(key);
  }
};

const getCurrentDay = (): string => {
  const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return days[new Date().getDay()];
};

const calculateDiscountedPrice = (price: string, discount: string) => {
  const priceNum = parseFloat(price);
  const discountNum = parseFloat(discount);
  if (isNaN(priceNum)) return 0;
  if (isNaN(discountNum)) return priceNum;

  return priceNum - discountNum;
};

export function Addons({
  open,
  onOpenChange,
  item,
  showViewCartAction = true,
  showCartQuantity = true,
}: Readonly<AddonsProps>) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSubItem, setSelectedSubItem] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const slugData = useSlugStore((state) => state.data);
  const entityId = slugData?.id;
  const formSubmissionResponse = getLocalStorageItem("formSubmissionResponse");
  const customerId = formSubmissionResponse?.id;
  const { mutate: addToCartMutation } = useAddToCart();
  const { mutate: updateCartItem } = useUpdateCart();
  const { cartItems = [] } = useCartStore();
  const currency = useSlugStore((state) => state.data?.currency);
  const currencySymbol = getSymbolFromCurrency(currency || "INR");

  const isWeekend = ["sat", "sun"].includes(getCurrentDay());
  const hasSubItems = !!item.sub_items?.length;
  const displayItems = useMemo(
    () => (hasSubItems ? item.sub_items! : [item]),
    [hasSubItems, item]
  );

  const getCartItem = (subItemId?: string) => {
    return cartItems.find(
      (cartItem) =>
        cartItem.item_id === item.id &&
        (subItemId ? cartItem.sub_item_id === subItemId : !cartItem.sub_item_id)
    );
  };

  const isItemInCart = (subItemId?: string) => !!getCartItem(subItemId);
  const getCartItemQuantity = (subItemId?: string) =>
    getCartItem(subItemId)?.quantity ?? 0;

  useEffect(() => {
    if (hasSubItems && displayItems.length > 0) {
      setSelectedSubItem(displayItems[0].id);
    }
  }, [hasSubItems, displayItems]);

  const selectedItem = hasSubItems
    ? (displayItems.find((subItem) => subItem.id === selectedSubItem) ?? null)
    : item;

  console.log("Selected Item:", selectedItem);

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));

  const getPrice = (item: MenuItem | MenuSubItem): number => {
    const price =
      isWeekend && item.weekend_price ? item.weekend_price : item.price;
    return Number(price ?? 0);
  };

  const getDiscountedPrice = (item: MenuItem | MenuSubItem): number => {
    const basePrice = getPrice(item);
    const discount = item.discount ? parseFloat(item.discount) : 0;
    return discount <= 0
      ? basePrice
      : calculateDiscountedPrice(basePrice.toString(), discount.toString());
  };

  const calculateTotal = (): number => {
    return selectedItem ? getDiscountedPrice(selectedItem) * quantity : 0;
  };

  const handleAddToCart = async () => {
    if (!selectedItem || !entityId || !customerId) return;

    const existingCartItem = getCartItem(selectedItem?.id);

    setIsLoading(true);
    try {
      const toastOptions = showViewCartAction
        ? {
            action: {
              label: "View Cart",
              onClick: () => (window.location.href = "/cart"),
            },
          }
        : {};

      if (existingCartItem) {
        updateCartItem({
          cart_id: existingCartItem.id,
          item_id: existingCartItem.item_id,
          sub_item_id: existingCartItem.sub_item_id ?? null,
          quantity: existingCartItem.quantity + quantity,
        });
        toast.success(
          `Added ${quantity} more to cart (Total: ${existingCartItem.quantity + quantity})`,
          toastOptions
        );
      } else {
        addToCartMutation({
          item_id: item.id,
          quantity,
          sub_item_id: hasSubItems ? selectedItem?.id : undefined,
        });

        toast.success(
          `${quantity} ${quantity > 1 ? "items" : "item"} added to cart`,
          toastOptions
        );
      }
      onOpenChange(false);
      setQuantity(1);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add item to cart"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderDescription = () => {
    if (!item.description) return null;

    return (
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Description</h3>
        <div
          className="prose prose-sm max-w-none text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: item.description }}
        />
      </div>
    );
  };

  const renderVariantSelection = () => {
    if (!hasSubItems) return null;

    return (
      <div className="space-y-3">
        <h3 className="text-base font-medium">Select Variant</h3>
        <div className="grid gap-2">
          {displayItems.map((subItem) => {
            const hasDiscount = subItem.discount && subItem.discount !== "0";
            const originalPrice = getPrice(subItem);
            const discountedPrice = getDiscountedPrice(subItem);
            const inCart = isItemInCart(subItem.id);
            const cartQuantity = showCartQuantity
              ? getCartItemQuantity(subItem.id)
              : 0;

            return (
              <button
                key={subItem.id}
                className={`flex items-center justify-between p-3 rounded-md border transition-colors relative w-full text-left ${
                  selectedSubItem === subItem.id
                    ? "border-primary bg-accent"
                    : "hover:bg-accent/50"
                } ${inCart ? "border-green-500" : ""}`}
                onClick={() => setSelectedSubItem(subItem.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedSubItem(subItem.id);
                  }
                }}
                aria-pressed={selectedSubItem === subItem.id}
                aria-describedby={`price-${subItem.id}`}
                tabIndex={0}
              >
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded-full border flex items-center justify-center">
                    {selectedSubItem === subItem.id && (
                      <div className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="text-sm font-medium">{subItem.name}</span>
                </div>
                <div
                  id={`price-${subItem.id}`}
                  className="flex flex-col items-end"
                >
                  {" "}
                  {hasDiscount && (
                    <span className="text-xs line-through text-muted-foreground">
                      {currencySymbol}
                      {originalPrice.toFixed(2)}
                    </span>
                  )}{" "}
                  <span className="text-sm font-medium">
                    {currencySymbol}
                    {discountedPrice.toFixed(2)}{" "}
                  </span>{" "}
                  {showCartQuantity && inCart && (
                    <span className="text-xs text-green-600">
                      In cart: {cartQuantity}
                    </span>
                  )}{" "}
                </div>{" "}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const getButtonText = () => {
    if (isLoading) return "Adding...";
    const total = calculateTotal().toFixed(2);
    if (isItemInCart(selectedItem?.id))
      return `Add More | {currencySymbol }${total}`;
    return quantity > 1
      ? `Add ${quantity} Items | {currencySymbol }${total}`
      : `Add Item | {currencySymbol }${total}`;
  };

  const getButtonClass = () => {
    const baseClass = "flex-1 h-12";
    return isItemInCart(selectedItem?.id)
      ? `${baseClass} bg-green-600 hover:bg-green-700`
      : baseClass;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="py-0 px-6 sm:max-w-[425px] rounded-t-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-start justify-between gap-4 pt-6">
          <div>
            <DialogTitle className="text-start">
              <p className="text-sm text-muted-foreground font-medium">
                {item.name}
                {hasSubItems && selectedItem && ` - ${selectedItem.name}`}
                {selectedItem && (
                  <span className="ml-2">
                    {selectedItem.discount && selectedItem.discount !== "0" && (
                      <span className="line-through text-muted-foreground mr-1">
                        {currencySymbol}
                        {getPrice(selectedItem).toFixed(2)}
                      </span>
                    )}
                    <span>
                      {currencySymbol}
                      {getDiscountedPrice(selectedItem).toFixed(2)}
                    </span>
                  </span>
                )}
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
                alt={selectedItem?.name ?? item.name}
                fill
                unoptimized
                className="object-cover rounded-md"
                sizes="80px"
                priority
              />
            </div>
          )}
        </DialogHeader>

        <Separator />

        {item.description && renderDescription()}

        <div className="grid gap-4 py-2">{renderVariantSelection()}</div>

        <DialogFooter className="sticky bottom-0 bg-background pt-4 pb-6">
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
              className={getButtonClass()}
              disabled={
                (!selectedItem?.price && !selectedItem?.weekend_price) ||
                isLoading ||
                !entityId ||
                !customerId
              }
            >
              {getButtonText()}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
