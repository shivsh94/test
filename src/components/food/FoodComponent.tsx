"use client";

import { useMenuFilters } from "@/hooks/useOutletFilter";

import { FilteredMenu } from "../common/foodBar/FoodComponent";

type FilteredMenuProps = React.ComponentProps<typeof FilteredMenu>;

export default function BarComponent() {
  const {
    searchQuery,
    setSearchQuery,
    preferences,
    toggleStates,
    filteredMenuData,
    handlePreferenceChange,
    handleToggleChange,
    activeFilters,
  } = useMenuFilters({
    outlet: "Food",
    showEmptyCategories: false,
  });

  const adaptedPreferences: Record<string, boolean> = Object.fromEntries(
    Object.entries(preferences).map(([key, value]) => [key, !!value])
  );

  const adaptedToggleStates: Record<string, boolean> = Object.fromEntries(
    Object.entries(toggleStates).map(([key, value]) => [key, !!value])
  );

  const adaptedHandlePreferenceChange: FilteredMenuProps["handlePreferenceChange"] =
    (key: string, value: boolean) => {
      if (key === "Veg" || key === "NonVeg") {
        handlePreferenceChange(key, value);
      }
    };

  const activeFiltersCount = Array.isArray(activeFilters)
    ? activeFilters.length
    : typeof activeFilters === "number"
      ? activeFilters
      : 0;

  return (
    <FilteredMenu
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      filteredMenuData={filteredMenuData}
      preferences={adaptedPreferences}
      toggleStates={adaptedToggleStates}
      handlePreferenceChange={adaptedHandlePreferenceChange}
      handleToggleChange={handleToggleChange}
      activeFilters={activeFiltersCount}
    />
  );
}
