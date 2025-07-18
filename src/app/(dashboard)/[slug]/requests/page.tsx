"use client";

import { ChevronDown, ChevronLeft, ChevronUp, Plus } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Command, CommandInput, CommandList } from "@/components/ui/command";
import { useCart } from "@/context/RequestCartContext";
import { useSlugStore } from "@/store/useProjectStore";

interface RequestItem {
  id: string;
  title: string;
  image: string;
  category?: string;
  location?: string;
}

interface RequestCategory {
  category: string;
  items: RequestItem[];
}

const requestsData: RequestCategory[] = [
  {
    category: "Housekeeping",
    items: [
      { id: "1", title: "Replenish Amenities", image: "/amenities.png" },
      { id: "2", title: "Garbage Clearance", image: "/bin.png" },
      { id: "3", title: "Room Cleaning", image: "/broom.png" },
      { id: "4", title: "Washroom Cleaning", image: "/toilet.png" },
      { id: "5", title: "Linen Change", image: "/bed-sheets.png" },
      { id: "6", title: "Fresh Towels", image: "/towel.png" },
    ],
  },
  {
    category: "Maintenance",
    items: [
      { id: "7", title: "Hot Water Issue", image: "/shower.png" },
      {
        id: "8",
        title: "Air Conditioner Issue",
        image: "/air-conditioner.png",
      },
      { id: "9", title: "Other Issue", image: "/unknown-search.png" },
      { id: "10", title: "Wifi Issue", image: "/wifi.png" },
    ],
  },
  {
    category: "Management",
    items: [
      { id: "11", title: "First Aid", image: "/first-aid-kit.png" },
      { id: "12", title: "Iron", image: "/iron.png" },
      { id: "13", title: "Umbrella", image: "/umbrella.png" },
      { id: "14", title: "Hair Dryer", image: "/hairdryer.png" },
      { id: "15", title: "Luggage Storage", image: "/luggage.png" },
      { id: "16", title: "Staff Assistance", image: "/staff.png" },
      { id: "17", title: "Lost & Found", image: "/education.png" },
    ],
  },
];

interface CollapsibleCategoryProps {
  category: string;
  items: RequestItem[];
}

function CollapsibleCategory({
  category,
  items,
}: Readonly<CollapsibleCategoryProps>) {
  const [isOpen, setIsOpen] = useState(true);
  const { addToCart, removeFromCart, cartItems } = useCart();
  type Services = {
    [category: string]: {
      [serviceTitle: string]: boolean;
    };
  };

  const services: Services | undefined =
    useSlugStore((state) => state.data?.context?.services) ?? undefined;

  const filteredItems = items.filter((item) => {
    return services?.[category]?.[item.title] === true;
  });

  const handleAddClick = (item: RequestItem) => {
    const isItemInCart = cartItems.some((cartItem) => cartItem.id === item.id);

    if (isItemInCart) {
      removeFromCart(item.id);
    } else {
      addToCart({
        ...item,
        category: category,
      });
    }
  };

  if (filteredItems.length === 0) return null;

  return (
    <Collapsible
      className="w-full space-y-2 px-4"
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between py-2">
          <h1 className="text-lg font-bold">{category}</h1>
          <Button variant="ghost" size="sm" className="bg-gray-200 p-1">
            {isOpen ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle</span>
          </Button>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        {filteredItems.map((request) => {
          const isAdded = cartItems.some(
            (cartItem) => cartItem.id === request.id
          );
          return (
            <div
              key={request.id}
              className={`flex items-center justify-between p-4 mb-2 rounded-lg shadow-md ${
                isAdded ? "bg-blue-100" : "bg-white"
              }`}
            >
              <div className="flex items-center">
                <Image
                  src={request.image}
                  alt={request.title}
                  width={32}
                  height={32}
                  unoptimized
                  priority={true}
                  className="w-8 h-8 mr-4 object-cover"
                />
                <span className="font-semibold text-sm">{request.title}</span>
              </div>
              <button
                type="button"
                className={`flex items-center border rounded space-x-1 px-2 py-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isAdded ? "bg-blue-500 text-white" : "hover:bg-gray-100"
                }`}
                onClick={() => handleAddClick(request)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleAddClick(request);
                  }
                }}
                aria-pressed={isAdded}
              >
                {isAdded ? (
                  <p className="text-sm flex items-center">Added</p>
                ) : (
                  <>
                    <Plus size={12} className="flex items-center" />
                    <p className="text-sm flex items-center">Add</p>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  );
}

function RequestsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState<string>("");
  const { cartItems } = useCart();
  const rid = searchParams.get("rid");

  const filteredRequests: RequestCategory[] = requestsData.map((category) => ({
    ...category,
    items: category.items.filter((request) =>
      request.title.toLowerCase().includes(search.toLowerCase())
    ),
  }));

  const handleProceedToPayment = () => {
    const currentPath = window.location.pathname;
    const newPath = currentPath.replace("/requests", "/place-request");
    const urlWithParams = rid ? `${newPath}?rid=${rid}` : newPath;
    router.push(urlWithParams);
  };

  const handleBackNavigation = () => {
    const currentPath = window.location.pathname;
    const basePath = currentPath.split("/")[1];
    const backUrl = rid ? `/${basePath}?rid=${rid}` : `/${basePath}`;
    router.push(backUrl);
  };

  return (
    <div>
      <div className="w-full min-h-screen">
        <div className="flex flex-1 shrink-0 items-center p-4 border-b sticky top-0 z-50 bg-white">
          <button
            onClick={handleBackNavigation}
            className="absolute text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="mx-auto text-xl font-semibold">Requests</h1>
        </div>

        <div className="px-4 my-2">
          <Command shouldFilter={false} className="rounded-lg border">
            <CommandList>
              <CommandInput
                placeholder="Search..."
                value={search}
                onValueChange={setSearch}
                className="text-base"
              />
            </CommandList>
          </Command>
        </div>

        {filteredRequests.map(
          (category) =>
            category.items.length > 0 && (
              <CollapsibleCategory
                key={`${category.category}-${category.items.length}`}
                category={category.category}
                items={category.items}
              />
            )
        )}
      </div>

      <div className="sticky bottom-0 w-full p-4 bg-white border-t shadow-md">
        <Button
          onClick={handleProceedToPayment}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white text-base rounded-full"
          variant="ghost"
          size={"lg"}
          disabled={cartItems.length === 0}
        >
          {cartItems.length > 0
            ? `Review Requests (${cartItems.length} items)`
            : "Review Requests"}
        </Button>
      </div>
    </div>
  );
}

export default RequestsPage;
