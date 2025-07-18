"use client";
import { useMenuFilters } from "@/hooks/useOutletFilter";

import { FilteredMenu } from "../../components/common/foodBar/FoodComponent";

export default function BarFoodComponent() {
  const { searchQuery, setSearchQuery, filteredMenuData } = useMenuFilters({
    outlet: "Bar",
    showEmptyCategories: false,
  });

  return (
    <FilteredMenu
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      filteredMenuData={filteredMenuData}
      showFilters={false}
    />
  );
}
