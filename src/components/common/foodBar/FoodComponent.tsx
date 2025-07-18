"use client";

import { useEffect, useRef, useState } from "react";

import { Command, CommandInput, CommandList } from "@/components/ui/command";

import { MenuFilters } from "./MenuFilters";
import { MenuSection } from "./MenuSection";

interface FilteredMenuProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  filteredMenuData: Map<{ id: string; name: string }, any[]>;
  // Make all filter-related props optional
  preferences?: Record<string, boolean>;
  toggleStates?: Record<string, boolean>;
  handlePreferenceChange?: (key: string, value: boolean) => void;
  handleToggleChange?: (key: string, value: boolean) => void;
  activeFilters?: number;
  showFilters?: boolean; // New prop to control filter visibility
}

export function FilteredMenu({
  searchQuery,
  setSearchQuery,
  preferences = {},
  toggleStates = {},
  filteredMenuData,
  handlePreferenceChange = () => {},
  handleToggleChange = () => {},
  showFilters = true, // Default to true for backward compatibility
}: Readonly<FilteredMenuProps>) {
  const [isSticky, setIsSticky] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<HTMLDivElement>(null);

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
        {showFilters && (
          <MenuFilters
            preferences={preferences}
            toggleStates={toggleStates}
            onPreferenceChange={handlePreferenceChange}
            onToggleChange={handleToggleChange}
            activeFilters={[]}
          />
        )}
      </div>

      {/* Menu Sections */}
      <div className="flex flex-col space-y-2">
        {hasResults ? (
          Array.from(filteredMenuData).map(([categoryKey, items]) => (
            <MenuSection
              key={categoryKey.id}
              id={categoryKey.id}
              title={categoryKey.name}
              menuItems={items.map((item) => ({
                ...item,
                price: item.price ?? "",
                sub_items: item.sub_items.map((subItem: any) => ({
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
