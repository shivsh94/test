"use client";

import { convert } from "html-to-text";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Minus,
  Plus,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  useAddToCart,
  useDeleteCartItem,
  useUpdateCart,
} from "@/hooks/useCartData";
import useCartStore from "@/store/useCartStore";
import {
  Days,
  MenuItem,
  Timing,
  useLabelStore,
  useSlugStore,
} from "@/store/useProjectStore";
import { getSymbolFromCurrency } from "@/utils/currency";

import { Addons } from "./Addons";
import DescriptionPopup from "./DescriptionPopup";

type DayOfWeek = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface MenuSectionProps {
  id: string;
  title: string;
  menuItems: MenuItem[];
  categoryDays?: Days;
  categoryTimings?: Timing[];
  isAvailable?: boolean;
  selectedDay?: string | null;
  timeFilter?: Timing;
  showFoodType?: boolean;
  showToastNotifications?: boolean;
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

const calculateDiscountedPrice = (price: string, discount: string) => {
  const priceNum = parseFloat(price);
  const discountNum = parseFloat(discount);
  if (isNaN(priceNum)) return "0.00";
  if (isNaN(discountNum)) return priceNum.toFixed(2);
  return (priceNum - discountNum).toFixed(2);
};

const formatTime = (time: string) => {
  if (!time) return "";
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minutes} ${ampm}`;
};

const getCurrentDay = (): DayOfWeek => {
  const days: DayOfWeek[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return days[new Date().getDay()];
};

const getAvailableDaysText = (categoryDays?: Days) => {
  if (!categoryDays) return "";

  const dayNames = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const dayFullNames = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const availableDays = dayNames
    .filter((day) => categoryDays[day as keyof typeof categoryDays])
    .map((day) => dayFullNames[dayNames.indexOf(day)]);

  if (availableDays.length === 7) return "Available every day";
  if (availableDays.length === 0) return "Not available";
  if (availableDays.length <= 3)
    return `Available on ${availableDays.join(", ")}`;
  return `Available ${availableDays.length} days a week`;
};

const getAvailableTimesText = (categoryTimings?: Timing[]) => {
  if (!categoryTimings || categoryTimings.length === 0)
    return "Available all day";

  return categoryTimings
    .map((timing) => {
      const startTime = timing.start.split("+")[0].substring(0, 5);
      const endTime = timing.end.split("+")[0].substring(0, 5);
      return `${formatTime(startTime)} - ${formatTime(endTime)}`;
    })
    .join(", ");
};

const renderPrice = (
  item: MenuItem | (MenuItem["sub_items"] extends (infer U)[] ? U : never),
  isSubItem = false,
  isWeekend: boolean
) => {
  const price =
    isWeekend && (item as any).weekend_price
      ? (item as any).weekend_price
      : ((item as any).price ?? "0");
  const discount = (item as any).discount ?? "0";
  const currency = useSlugStore((state) => state.data?.currency);
  const currencySymbol = getSymbolFromCurrency(currency || "INR");

  return (
    <p className="text-sm">
      {discount && discount !== "0" && (
        <span className="line-through text-muted-foreground mr-2">
          {currencySymbol} {Number(price).toFixed(2)}
        </span>
      )}
      {currencySymbol} {calculateDiscountedPrice(price, discount)}
    </p>
  );
};

const renderDescription = (
  item: MenuItem,
  onShowMore: (item: MenuItem) => void
) => {
  const convertedDescription = convert(item.description || "");
  if (!convertedDescription.trim()) return null;

  const isLongDescription = convertedDescription.length > 20;
  const displayText = isLongDescription
    ? `${convertedDescription.slice(0, 20)}...`
    : convertedDescription;

  return (
    <p className="text-xs text-muted-foreground leading-tight">
      {displayText}
      {isLongDescription && (
        <Button
          variant="link"
          className="text-xs h-auto p-0 ml-1"
          onClick={() => onShowMore(item)}
        >
          Show More
        </Button>
      )}
    </p>
  );
};

const QuantityControls = ({
  itemId,
  quantity,
  onQuantityChange,
}: {
  itemId: string;
  quantity: number;
  onQuantityChange: (itemId: string, change: number) => void;
}) => (
  <div className="flex items-center gap-1 bg-background rounded-md border">
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-7 p-0"
      onClick={() => onQuantityChange(itemId, -1)}
    >
      <Minus className="h-4 w-8" />
    </Button>
    <span className="text-sm w-6 text-center">{quantity}</span>
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-7 p-0"
      onClick={() => onQuantityChange(itemId, 1)}
    >
      <Plus className="h-4 w-8" />
    </Button>
  </div>
);

export function MenuSection({
  id,
  title,
  menuItems,
  categoryDays,
  categoryTimings,
  isAvailable = true,
  selectedDay,
  timeFilter,
  showFoodType = false,
  showToastNotifications = false,
}: Readonly<MenuSectionProps>) {
  const { labelItems } = useLabelStore();
  const [isOpen, setIsOpen] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [popupItem, setPopupItem] = useState<MenuItem | null>(null);
  const { mutate: addToCartMutation } = useAddToCart();
  const { mutate: updateCartItem } = useUpdateCart();
  const { mutate: deleteCartItem } = useDeleteCartItem();
  const { cartItems = [] } = useCartStore();
  const slugData = useSlugStore((state) => state.data);
  const entityId = slugData?.id;
  const formSubmissionResponse = getLocalStorageItem("formSubmissionResponse");
  const customerId = formSubmissionResponse?.id;
  const currency = useSlugStore((state) => state.data?.currency);
  const currencySymbol = getSymbolFromCurrency(currency || "INR");

  const isWeekend = getCurrentDay() === "sat" || getCurrentDay() === "sun";

  const getLabelTextById = (labelId: string) => {
    const foundLabel = labelItems.find((label) => label.id === labelId);
    return foundLabel ? foundLabel.text : labelId;
  };

  const titleCased = title
    .replace(/([A-Z])/g, " $1")
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  const isItemAvailable = (item: MenuItem) => !!item.available;

  const isItemInCart = (itemId: string, subItemId?: string) => {
    return cartItems.some(
      (cartItem) =>
        cartItem.item_id === itemId &&
        (subItemId ? cartItem.sub_item_id === subItemId : !cartItem.sub_item_id)
    );
  };

  const getCartItemQuantity = (itemId: string, subItemId?: string) => {
    const cartItem = cartItems.find(
      (cartItem) =>
        cartItem.item_id === itemId &&
        (subItemId ? cartItem.sub_item_id === subItemId : !cartItem.sub_item_id)
    );
    return cartItem ? cartItem.quantity : 0;
  };

  const canAddItemToCart = (item: MenuItem) =>
    isItemAvailable(item) && entityId && customerId;

  const handleAddItem = (item: MenuItem, quantity: number = 1) => {
    if (!canAddItemToCart(item)) return;

    const hasSubItems = (item.sub_items ?? []).length > 0;
    if (hasSubItems) {
      setSelectedItem(item);
      return;
    }

    const existingCartItem = cartItems.find(
      (cartItem) => cartItem.item_id === item.id && !cartItem.sub_item_id
    );

    try {
      if (existingCartItem) {
        updateCartItem({
          cart_id: existingCartItem.id,
          item_id: existingCartItem.item_id,
          sub_item_id: existingCartItem.sub_item_id ?? null,
          quantity: existingCartItem.quantity + quantity,
        });
      } else {
        addToCartMutation({
          item_id: item.id,
          quantity: quantity,
        });
      }

      if (showToastNotifications) {
        if (existingCartItem) {
          toast.success(
            `Added ${quantity} more ${item.name} to cart (Total: ${existingCartItem.quantity + quantity})`
          );
        } else {
          toast.success(`${quantity} ${item.name} added to cart`, {
            action: {
              label: "View Cart",
              onClick: () => (window.location.href = "/cart"),
            },
          });
        }
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add item to cart"
      );
    }
  };

  const handleQuantityChange = (itemId: string, change: number) => {
    const currentQuantity = getCartItemQuantity(itemId);
    const newQuantity = currentQuantity + change;
    const cartItem = cartItems.find(
      (item) => item.item_id === itemId && !item.sub_item_id
    );

    if (!cartItem) return;

    if (newQuantity < 1) {
      deleteCartItem(cartItem.id);
    } else {
      updateCartItem({
        cart_id: cartItem.id,
        item_id: cartItem.item_id,
        sub_item_id: cartItem.sub_item_id ?? null,
        quantity: newQuantity,
      });
    }
  };

  const renderFoodTypeIndicator = (item: MenuItem) => {
    if (!showFoodType) return null;
    const isVegetarian = item.food_type === "Vegetarian";
    return (
      <Image
        src={isVegetarian ? "/veg.png" : "/nonveg.png"}
        width={20}
        height={20}
        unoptimized
        alt={isVegetarian ? "Vegetarian" : "Non-vegetarian"}
      />
    );
  };

  const renderItemActions = (item: MenuItem) => {
    if (!canAddItemToCart(item)) {
      return (
        <Button
          variant="outline"
          className="text-sm opacity-50 cursor-not-allowed"
          disabled
          size="sm"
        >
          Unavailable
        </Button>
      );
    }

    const hasSubItems = (item.sub_items ?? []).length > 0;
    const inCart = isItemInCart(item.id);
    const quantity = getCartItemQuantity(item.id);

    if (hasSubItems) {
      return (
        <Button
          variant="outline"
          className={`text-sm ${inCart ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
          onClick={() => handleAddItem(item)}
          size="sm"
        >
          {inCart ? "Added" : "Add"}
        </Button>
      );
    }

    if (inCart) {
      return (
        <QuantityControls
          itemId={item.id}
          quantity={quantity}
          onQuantityChange={handleQuantityChange}
        />
      );
    }

    return (
      <Button
        variant="outline"
        className="text-sm"
        onClick={() => handleAddItem(item)}
        size="sm"
      >
        Add
      </Button>
    );
  };

  return (
    <>
      <div id={`category-${title}`} className="scroll-mt-4">
        <Collapsible
          open={isOpen}
          onOpenChange={setIsOpen}
          className={`w-full space-y-4 px-4 ${!isAvailable ? "opacity-70" : ""}`}
        >
          <CollapsibleTrigger asChild>
            <div
              className={`flex items-center justify-between py-2 ${!isAvailable ? "cursor-pointer" : ""}`}
            >
              <div className="flex flex-col">
                <h1
                  className={`text-lg font-bold ${!isAvailable ? "text-muted-foreground" : ""}`}
                >
                  {titleCased}
                </h1>
                <div className="flex flex-col text-xs text-muted-foreground mt-1">
                  {categoryDays && (
                    <div
                      className={`flex items-center ${!isAvailable && selectedDay ? "text-destructive" : ""}`}
                    >
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{getAvailableDaysText(categoryDays)}</span>
                    </div>
                  )}
                  {categoryTimings && (
                    <div
                      className={`flex items-center mt-1 ${!isAvailable && timeFilter ? "text-destructive" : ""}`}
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{getAvailableTimesText(categoryTimings)}</span>
                    </div>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="sm" className="p-1">
                {isOpen ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
                <span className="sr-only">Toggle</span>
              </Button>
            </div>
          </CollapsibleTrigger>

          {menuItems.length === 0 ? (
            <div className="text-center text-gray-600 py-2">
              No items available
            </div>
          ) : (
            menuItems.map((item) => (
              <CollapsibleContent key={item.id} className="pb-2">
                <Card
                  className={`${!isItemAvailable(item)} ${
                    isItemInCart(item.id) ? "border-green-500" : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex space-x-4">
                      <div className="flex flex-col flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          {renderFoodTypeIndicator(item)}
                          {item.labels && item.labels.length > 0 && (
                            <Badge
                              variant="destructive"
                              className="text-xs"
                              style={{
                                backgroundColor:
                                  labelItems.find(
                                    (label) =>
                                      label.id ===
                                      (Array.isArray(item.labels)
                                        ? item.labels[0]
                                        : item.labels)
                                  )?.color ?? "#f87171",
                              }}
                            >
                              {getLabelTextById(
                                Array.isArray(item.labels)
                                  ? item.labels[0]
                                  : item.labels
                              )}
                            </Badge>
                          )}
                        </div>
                        <h3
                          className={`text-base font-semibold ${!isItemAvailable(item) ? "text-muted-foreground" : ""}`}
                        >
                          {item.name}
                        </h3>
                        {(item.sub_items ?? []).length > 0
                          ? renderPrice(item.sub_items![0], true, isWeekend)
                          : renderPrice(item, false, isWeekend)}
                        {renderDescription(item, setPopupItem)}
                      </div>

                      {item.photo ? (
                        <div className="flex flex-col items-end space-y-2 relative">
                          <div className="relative flex-shrink-0">
                            <Image
                              src={item.photo}
                              alt={item.name}
                              width={100}
                              height={100}
                              unoptimized
                              className={`w-24 h-24 rounded-md object-cover ${
                                !isItemAvailable(item) ? "grayscale" : ""
                              }`}
                            />
                            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                              {renderItemActions(item)}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center min-w-[80px]">
                          {renderItemActions(item)}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </CollapsibleContent>
            ))
          )}
        </Collapsible>
      </div>

      {selectedItem && (
        <Addons
          open={!!selectedItem}
          onOpenChange={() => setSelectedItem(null)}
          item={selectedItem}
          showViewCartAction={true}
          showCartQuantity={true}
        />
      )}
      {popupItem && (
        <DescriptionPopup item={popupItem} onClose={() => setPopupItem(null)} />
      )}
    </>
  );
}
