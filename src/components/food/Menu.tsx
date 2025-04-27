"use client";
import React, { useState } from "react";
import { BookOpen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useSlugStore, useMenuStore, useCategoryStore } from "@/store/useProjectStore";

const FloatingMenuButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const hotelData = useSlugStore((state) => state.data);
  const { menuItems } = useMenuStore();
  const { categories } = useCategoryStore();

  // const foodCategories = categories.filter(cat => cat.outlet === 'Bar');


  const menuData = categories.reduce((acc, category) => {
    const itemsInCategory = menuItems.filter(item => item.category_id === category.id);
    if (itemsInCategory.length > 0) {
      acc[category.name] = itemsInCategory;
    }
    return acc;
  }, {} as Record<string, typeof menuItems>);

  const primaryColor = hotelData?.company?.primary_color || "#3b82f6";

  return (
    <div className="fixed left-0 right-0 z-50 bottom-32 max-w-sm mx-auto pointer-events-none">
      <div className="absolute left-4 pointer-events-auto">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            className="flex items-center justify-center rounded-2xl text-black px-4 py-2 shadow-lg hover:text-white transition-colors border-2"
            style={{
              backgroundColor: "white",
              borderColor: primaryColor,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = primaryColor;
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "white";
              e.currentTarget.style.color = "black";
            }}
          >
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span className="text-lg font-medium">MENU</span>
            </div>
          </DialogTrigger>

          <DialogContent 
            className="w-[90%] max-h-[80vh] overflow-y-auto rounded-lg shadow-xl bg-gradient-to-b from-white via-gray-50 to-gray-100"
            style={{ borderColor: primaryColor }}
          >
            <DialogHeader>
              <DialogTitle 
                className="text-center text-xl font-semibold"
                style={{ color: primaryColor }}
              >
                Menu Categories
              </DialogTitle>
            </DialogHeader>
            <div className="divide-y divide-gray-300 py-4">
              {Object.entries(menuData).map(([category, items]) => (
                <div
                  key={category}
                  className="py-2 px-2 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors"
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
                >
                  <span className="font-medium text-gray-700">
                    {category
                      .replace(/([A-Z])/g, " $1")
                      .trim()
                      .split(" ")
                      .map(
                        (word) =>
                          word.charAt(0).toUpperCase() +
                          word.slice(1).toLowerCase()
                      )
                      .join(" ")}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({items.length})
                  </span>
                </div>
              ))}
            </div>
            <DialogFooter className="flex justify-center">
              <button
                className="px-6 py-2 rounded-full font-medium transition"
                style={{
                  backgroundColor: primaryColor,
                  color: "white",
                }}
                onClick={() => setOpen(false)}
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