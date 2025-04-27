"use client";

import { useRef, useEffect, useState } from "react";
import { Command, CommandInput, CommandList } from "@/components/ui/command";
import { MenuSection } from "./MenuSection";
import { MenuFilters } from "./MenuFilters";
import { useMenuFilters } from "@/hooks/useMenuFilter";

export default function FilteredMenu() {
  const [isSticky, setIsSticky] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<HTMLDivElement>(null);

  const {
    searchQuery,
    setSearchQuery,
    preferences,
    toggleStates,
    filteredMenuData,
    handlePreferenceChange,
    handleToggleChange,
    activeFilters,
  } = useMenuFilters();

  const hasResults = filteredMenuData.size > 0;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: "0px",
      }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex flex-col">
      {/* Observer Element */}
      <div ref={observerRef} className="h-0" />

      {/* Header Section */}
      <div
        ref={headerRef}
        className={`bg-white pb-2 transition-all duration-200 ${
          isSticky ? "sticky top-0 left-0 right-0 z-40 shadow-md" : "relative"
        }`}
      >
        <div className="px-4 my-2">
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
        <MenuFilters
          preferences={Object.fromEntries(
            Object.entries(preferences).map(([key, value]) => [key, !!value])
          )}
          toggleStates={Object.fromEntries(
            Object.entries(toggleStates).map(([key, value]) => [key, !!value])
          )}
          onPreferenceChange={handlePreferenceChange}
          onToggleChange={handleToggleChange}
          activeFilters={activeFilters}
        />
      </div>

      {/* Menu Sections */}
      <div className="flex flex-col space-y-2">
        {hasResults ? (
          // Convert the Map entries to an array and map over them
          Array.from(filteredMenuData).map(([categoryKey, items]) => (
            <MenuSection
              key={categoryKey.id} // Use the category ID as the key
              id={categoryKey.id} // Use the category ID
              title={categoryKey.name} // Use the category name as the title
              menuItems={items.map((item) => ({
                ...item,
                price: item.price ?? "", // Convert null to an empty string
                sub_items: item.sub_items.map((subItem) => ({
                  ...subItem,
          
                })),
              }))}
            />
          ))
        ) : (
          <div className="text-center text-gray-600 py-10">
            No results found.
          </div>
        )}
      </div>
    </div>
  );
}
