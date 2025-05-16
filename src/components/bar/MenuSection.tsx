"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card"; 
import { ChevronDown, ChevronUp, Clock, Calendar } from "lucide-react";
import { MenuItem, Timing,Days } from "@/store/useProjectStore";
import { Addons } from "./Addons";
import DescriptionPopup from "./DescriptionPopup";

type DayOfWeek = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

interface MenuSectionProps {
  id: string;
  title: string;
  menuItems: MenuItem[];
  categoryDays? : Days 
  categoryTimings?: Timing[];
  isAvailable?: boolean;
  selectedDay?: string | null;
  timeFilter?: Timing
}

export function MenuSection({
  id,
  title,
  menuItems,
  categoryDays,
  categoryTimings,
  isAvailable = true,
  selectedDay,
  timeFilter,
}: MenuSectionProps) {
  // const { labelItems } = useLabelStore();
  const [isOpen, setIsOpen] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [popupItem, setPopupItem] = useState<MenuItem | null>(null);

  // const getLabelTextById = (labelId: string) => {
  //   const foundLabel = labelItems.find((label) => label.id === labelId);
  //   return foundLabel ? foundLabel.text : labelId;
  // };

  const getCurrentDay = (): DayOfWeek => {
    const days: DayOfWeek[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    return days[new Date().getDay()];
  };

  const isWeekend = getCurrentDay() === "sat" || getCurrentDay() === "sun";

  const titleCased = title
    .replace(/([A-Z])/g, " $1")
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  const getAvailableDays = () => {
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

    if (availableDays.length <= 3) {
      return `Available on ${availableDays.join(", ")}`;
    } else {
      return `Available ${availableDays.length} days a week`;
    }
  };

  const getAvailableTimes = () => {
    if (!categoryTimings || categoryTimings.length === 0)
      return "Available all day";

    return categoryTimings
      .map((timing) => {
        const startTime = timing.start.split("+")[0].substring(0, 5);
        const endTime = timing.end.split("+")[0].substring(0, 5);
        const formattedStart = formatTime(startTime);
        const formattedEnd = formatTime(endTime);
        return `${formattedStart} - ${formattedEnd}`;
      })
      .join(", ");
  };

  const formatTime = (time: string) => {
    if (!time) return "";

    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;

    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const isItemAvailable = (item: MenuItem) => {
    return !!item.available;
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
                      <span>{getAvailableDays()}</span>
                    </div>
                  )}
                  {categoryTimings && (
                    <div
                      className={`flex items-center mt-1 ${!isAvailable && timeFilter ? "text-destructive" : ""}`}
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{getAvailableTimes()}</span>
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
          {menuItems.map((item) => (
            <CollapsibleContent key={item.id} className="pb-2">
              <Card
                className={`${!isItemAvailable(item) ? "opacity-60 bg-muted" : ""}`}
              >
                <CardContent className="p-4">
                  <div className="flex space-x-4">
                    <div className="flex flex-col w-full space-y-2">
                      <div className="flex items-center space-x-2">
                        {/* <Image
                          src={
                            item.food_type === "Vegetarian"
                              ? "/veg.png"
                              : "/nonveg.png"
                          }
                          width={20}
                          height={20}
                          alt={
                            item.food_type === "Vegetarian"
                              ? "Vegetarian"
                              : "Non-vegetarian"
                          }
                        /> */}
                        {/* {item.labels && item.labels.length > 0 && (
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
                                )?.color || "#ef4444",
                            }}
                          >
                            {getLabelTextById(
                              Array.isArray(item.labels)
                                ? item.labels[0]
                                : item.labels
                            )}
                          </Badge>
                        )} */}
                      </div>
                      <h3
                        className={`text-base font-semibold ${!isItemAvailable(item) ? "text-muted-foreground" : ""}`}
                      >
                        {item.name}
                      </h3>

                      {(item.sub_items ?? []).length > 0 ? (
                        <p className="text-sm">
                          ₹{" "}
                          {Number(
                            isWeekend && item.sub_items?.[0]?.weekend_price
                              ? item.sub_items[0].weekend_price
                              : (item.sub_items?.[1]?.price ?? 0)
                          ).toFixed(2)}
                        </p>
                      ) : (
                        <p className="text-sm">
                          ₹{" "}
                          {Number(
                            isWeekend && item.weekend_price
                              ? item.weekend_price
                              : (item.price ?? 0)
                          ).toFixed(2)}
                        </p>
                      )}

                      <p className="text-xs text-muted-foreground leading-tight">
                        {item.description && item.description.length > 20
                          ? `${item.description.slice(0, 20)}...`
                          : item.description}
                        {item.description && item.description.length > 20 && (
                          <Button
                            variant="link"
                            className="text-xs h-auto p-0 ml-1"
                            onClick={() => setPopupItem(item)}
                          >
                            Show More
                          </Button>
                        )}
                      </p>
                    </div>
                    {item.photo && (
                      <div className="relative flex-shrink-0">
                        <Image
                          src={item.photo}
                          alt={item.name}
                          width={100}
                          height={100}
                          className={`w-24 h-24 rounded-md object-cover ${!isItemAvailable(item) ? "grayscale" : ""}`}
                        />
                        <CardFooter className="p-0 absolute -translate-y-3 left-1/2 -translate-x-1/2">
                          <Button
                            variant="outline"
                            className={`text-sm ${!isItemAvailable(item) ? "opacity-50 cursor-not-allowed" : ""}`}
                            onClick={() =>
                              isItemAvailable(item) && setSelectedItem(item)
                            }
                            disabled={!isItemAvailable(item)}
                            size="sm"
                          >
                            {isItemAvailable(item) ? "Add" : "Unavailable"}
                          </Button>
                        </CardFooter>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </CollapsibleContent>
          ))}
          {menuItems.length === 0 && (
            <div className="text-center text-gray-600 py-2">
              No items available
            </div>
          )}
        </Collapsible>
      </div>
      {selectedItem && (
        <Addons
          open={!!selectedItem}
          onOpenChange={() => setSelectedItem(null)}
          item={selectedItem}
          category={titleCased}
          itemId={selectedItem.id}
          categoryId={id}
        />
      )}
      {popupItem && (
        <DescriptionPopup item={popupItem} onClose={() => setPopupItem(null)} />
      )}
    </>
  );
}
