"use client";
import React from "react";
import { BeverageItemCard } from "@/components/bar/ItemCards";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useParams } from "next/navigation";
import { useSearch } from "@/hooks/useSearch";
import { Command, CommandInput, CommandList } from "@/components/ui/command";
import { useCart } from "@/context/FoodCartContext";
import CartButton from "@/components/cart/cartButton";
import { useCategoryStore, useMenuStore } from "@/store/useProjectStore";
import { useRouter } from "next/navigation";

export default function CategoryPage() {
  const { menuItems } = useMenuStore();
  const { categories } = useCategoryStore();
  const { categoryId } = useParams();
  const { cartItems } = useCart();

  const barItems = menuItems.filter((item) => item.category_id === categoryId);
  const category = categories.find((cat) => cat.id === categoryId);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const router = useRouter();

  const { searchQuery, setSearchQuery, filteredItems } = useSearch(barItems);

  if (!filteredItems.length) {
    return <div>No items found in this category</div>;
  }

  const handleAddToCart = (item: (typeof barItems)[0]) => {
    console.log("Added to cart:", item);
  };

  const categoryList = Array.isArray(categories) ? categories : [];
  const Barcategories = categoryList.filter((item) => item.outlet === "Bar");
  console.log("Bar Categories:", Barcategories);

  return (
    <main className="container mx-auto p-4">
      <CartButton totalItems={totalItems} />

      <div className="px-2 my-1">
        <Command shouldFilter={false} className="rounded-lg border">
          <CommandList>
            <CommandInput
              placeholder="Search..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="text-base"
            />
          </CommandList>
        </Command>
      </div>
      <div className="flex space-x-2 items-center my-4">
        <Link href="/bar" className="text-foreground">
          <ChevronLeft />
        </Link>
        <h1 className="text-lg font-bold">{category?.name}</h1>
      </div>

      {/* Items List */}
      <div className="space-y-4">
        {filteredItems.map((item) => (
          <BeverageItemCard
            key={item.id}
            item={item}
            onAddClick={handleAddToCart}
          />
        ))}
        {barItems.length === 0 && (
          <p className="text-center text-muted-foreground">No items found</p>
        )}
      </div>
      <div className="mt-8">
        <h2 className="text-lg font-bold mb-4">
          Explore Other Categories
        </h2>
        <div className="flex overflow-x-auto space-x-2 pb-2 custom-scrollbar">
          {Barcategories.filter(
            (otherCategory) => otherCategory.id !== categoryId
          ).map((otherCategory) => (
            <div
              key={otherCategory.id}
              onClick={() =>
                router.replace(
                  `${window.location.href.split("/").slice(0, -1).join("/")}/${otherCategory.id}`
                )
              }
              className="p-2 border rounded-lg shadow-md hover:bg-gray-50 flex-shrink-0 w-[8rem] bg-cover bg-center"
              // style={{ backgroundImage: `url(${otherCategory.photo})` }}
            >
              <div className="bg-white bg-opacity-50 rounded p-2">
                <h3 className="text-lg font-semibold text-black">
                  {otherCategory.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
