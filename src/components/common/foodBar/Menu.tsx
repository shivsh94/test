"use client";
import { BookOpen } from "lucide-react";
import React, { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useCategoryStore,
  useMenuStore,
  useSlugStore,
} from "@/store/useProjectStore";

interface FloatingMenuButtonProps {
  outlet?: string;
  label?: string;
  title?: string;
}

const FloatingMenuButton: React.FC<FloatingMenuButtonProps> = ({
  outlet,
  label = "MENU",
  title = "Menu Categories",
}) => {
  const [open, setOpen] = useState(false);
  const hotelData = useSlugStore((state) => state.data);
  const { menuItems } = useMenuStore();
  const { categories } = useCategoryStore();

  const filteredCategories = outlet
    ? categories.filter((cat) => cat.outlet === outlet)
    : categories;

  const menuData = filteredCategories.reduce(
    (acc, category) => {
      const itemsInCategory = menuItems.filter(
        (item) => item.category_id === category.id
      );
      if (itemsInCategory.length > 0) {
        acc[category.name] = itemsInCategory;
      }
      return acc;
    },
    {} as Record<string, typeof menuItems>
  );

  const primaryColor = hotelData?.company?.primary_color ?? "#3b82f6";

  const formatCategoryName = (category: string) => {
    return category
      .replace(/([A-Z])/g, " $1")
      .trim()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <div className="fixed left-0 right-0 z-50 bottom-32 max-w-sm mx-auto pointer-events-none">
      <div className="absolute left-4 pointer-events-auto">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button
              className="flex items-center justify-center rounded-2xl text-black px-4 py-2 shadow-lg hover:text-white transition-colors border-2 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={
                {
                  backgroundColor: "white",
                  borderColor: primaryColor,
                  "--focus-ring-color": primaryColor,
                } as React.CSSProperties & Record<string, any>
              }
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = primaryColor;
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "white";
                e.currentTarget.style.color = "black";
              }}
              aria-label={`Open ${label.toLowerCase()} menu`}
            >
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span className="text-lg font-medium">{label}</span>
              </div>
            </button>
          </DialogTrigger>

          <DialogContent
            className="w-[90%] max-h-[80vh] overflow-y-auto rounded-lg shadow-xl bg-gradient-to-b from-white via-gray-50 to-gray-100"
            style={{ borderColor: primaryColor }}
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle
                className="text-center text-xl font-semibold"
                style={{ color: primaryColor }}
              >
                {title}
              </DialogTitle>
            </DialogHeader>
            <div className="divide-y divide-gray-300 py-4" role="menu">
              {Object.entries(menuData).map(([category, items]) => (
                <button
                  key={category}
                  role="menuitem"
                  className="py-2 px-2 flex justify-between items-center w-full text-left hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                  onClick={() => {
                    const element = document.getElementById(
                      `category-${category}`
                    );
                    element?.scrollIntoView({
                      behavior: "smooth",
                      block: "end",
                    });
                    setOpen(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      const element = document.getElementById(
                        `category-${category}`
                      );
                      element?.scrollIntoView({
                        behavior: "smooth",
                        block: "end",
                      });
                      setOpen(false);
                    }
                  }}
                  aria-label={`Jump to ${formatCategoryName(category)} category with ${items.length} items`}
                >
                  <span className="font-medium text-gray-700">
                    {formatCategoryName(category)}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({items.length})
                  </span>
                </button>
              ))}
            </div>
            <DialogFooter className="flex justify-center">
              <button
                className="px-6 py-2 rounded-full font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={
                  {
                    backgroundColor: primaryColor,
                    color: "white",
                    "--focus-ring-color": primaryColor,
                  } as React.CSSProperties & Record<string, any>
                }
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                Close
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default FloatingMenuButton;
