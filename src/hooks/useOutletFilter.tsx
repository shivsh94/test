"use client";
import { useEffect, useMemo, useState } from "react";

import {
  getCurrentDay,
  getCurrentUTCTime,
  getDayName,
  isAvailableAtTime,
  isAvailableOnDay,
} from "@/hooks/menuFilterUtils";
import {
  CategoryItem,
  CategoryKey,
  MenuItem,
  Timing,
  useCategoryStore,
  useLabelStore,
  useMenuStore,
} from "@/store/useProjectStore";

interface Preferences {
  Veg: boolean;
  NonVeg: boolean;
}

type DayOfWeek = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
type OutletType = "Food" | "Bar";

interface UseMenuFiltersOptions {
  outlet: OutletType;
  showEmptyCategories?: boolean;
}

const initializeToggleStates = (labelItems: any[]) => {
  return labelItems.reduce((acc, label) => {
    acc[label.id] = false;
    return acc;
  }, {});
};

const useTimeFilter = (useCurrentTime: boolean) => {
  const [timeFilter, setTimeFilter] = useState<Timing | null>(null);

  useEffect(() => {
    if (!useCurrentTime) return;

    const updateTimeFilter = () => {
      setTimeFilter({ start: getCurrentUTCTime(), end: "23:59" });
    };

    updateTimeFilter();
    const interval = setInterval(updateTimeFilter, 1000);

    return () => clearInterval(interval);
  }, [useCurrentTime]);

  return [timeFilter, setTimeFilter] as const;
};

const filterMenuItems = (
  items: MenuItem[],
  categoryKey: CategoryKey,
  searchQuery: string,
  preferences: Preferences,
  toggleStates: Record<string, boolean>,
  labelItems: any[]
) => {
  return items.filter((item) => {
    const matchesSearch =
      searchQuery === "" ||
      categoryKey.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPreference =
      (!preferences.Veg && !preferences.NonVeg) ||
      (preferences.Veg && item.food_type === "Vegetarian") ||
      (preferences.NonVeg && item.food_type !== "Vegetarian");

    const matchesTag =
      Object.values(toggleStates).every((state) => !state) ||
      item.labels?.some(
        (labelId) =>
          toggleStates[labelId] &&
          labelItems.some((label) => label.id === labelId)
      );

    return matchesSearch && matchesPreference && matchesTag;
  });
};

const buildMenuMap = (
  categories: CategoryItem[],
  menuItems: MenuItem[],
  outlet: OutletType,
  selectedDay: DayOfWeek | null,
  timeFilter: Timing | null
) => {
  const filteredCategories = categories.filter((cat) => cat.outlet === outlet);
  const menuMap = new Map<CategoryKey & { available?: boolean }, MenuItem[]>();

  filteredCategories.forEach((category) => {
    const categoryAvailable =
      isAvailableOnDay(category, selectedDay) &&
      isAvailableAtTime(category, timeFilter);

    const categoryKey: CategoryKey = {
      name: category.name,
      id: category.id,
    };

    const items = menuItems
      .filter((item) => item.category_id === category.id)
      .map((item) => ({
        ...item,
        available:
          isAvailableOnDay(item, selectedDay) &&
          isAvailableAtTime(item, timeFilter),
      }));

    menuMap.set({ ...categoryKey, available: categoryAvailable }, items);
  });

  return menuMap;
};

export const useMenuFilters = ({
  outlet,
  showEmptyCategories = false,
}: UseMenuFiltersOptions) => {
  const { categories } = useCategoryStore();
  const { menuItems } = useMenuStore();
  const { labelItems } = useLabelStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [preferences, setPreferences] = useState<Preferences>({
    Veg: false,
    NonVeg: false,
  });
  const [toggleStates, setToggleStates] = useState<Record<string, boolean>>(
    () => initializeToggleStates(labelItems)
  );
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | null>(
    getCurrentDay()
  );
  const [useCurrentTime, setUseCurrentTime] = useState(true);
  const [timeFilter, setTimeFilter] = useTimeFilter(useCurrentTime);

  const menuData = useMemo(() => {
    return buildMenuMap(categories, menuItems, outlet, selectedDay, timeFilter);
  }, [categories, menuItems, selectedDay, timeFilter, outlet]);

  const filteredMenuData = useMemo(() => {
    const result = new Map<CategoryKey & { available?: boolean }, MenuItem[]>();

    menuData.forEach((items, categoryKey) => {
      const filteredItems = filterMenuItems(
        items,
        categoryKey,
        searchQuery,
        preferences,
        toggleStates,
        labelItems
      );

      if (filteredItems.length > 0 || showEmptyCategories) {
        result.set(categoryKey, filteredItems);
      }
    });

    return result;
  }, [
    searchQuery,
    preferences,
    toggleStates,
    menuData,
    labelItems,
    showEmptyCategories,
  ]);

  const activeFilters = useMemo(() => {
    const activePrefs = Object.entries(preferences)
      .filter(([, value]) => value)
      .map(([key]) => key);

    const activeTags = Object.entries(toggleStates)
      .filter(([, value]) => value)
      .map(([key]) => labelItems.find((l) => l.id === key)?.text || key);

    const timeFilterLabel = timeFilter ? [`Time: ${timeFilter.start} UTC`] : [];
    const dayFilter = selectedDay ? [getDayName(selectedDay)] : [];

    return [...activePrefs, ...activeTags, ...dayFilter, ...timeFilterLabel];
  }, [preferences, toggleStates, labelItems, selectedDay, timeFilter]);

  const handlePreferenceChange = (id: "Veg" | "NonVeg", checked: boolean) => {
    setPreferences((prev) => ({ ...prev, [id]: checked }));
  };

  const handleToggleChange = (toggleId: string, pressed: boolean) => {
    setToggleStates((prev) => ({ ...prev, [toggleId]: pressed }));
  };

  const handleDayChange = (day: DayOfWeek | null) => setSelectedDay(day);

  const handleTimeFilterChange = (time: Timing | null) => {
    setTimeFilter(time);
    setUseCurrentTime(false);
  };

  const toggleCurrentTimeFilter = (useCurrent: boolean) => {
    setUseCurrentTime(useCurrent);
    if (!useCurrent) setTimeFilter(null);
  };

  return {
    searchQuery,
    setSearchQuery,
    preferences,
    toggleStates,
    filteredMenuData,
    handlePreferenceChange,
    handleToggleChange,
    activeFilters,
    selectedDay,
    handleDayChange,
    getDayName,
    getCurrentDay,
    timeFilter,
    handleTimeFilterChange,
    useCurrentTime,
    toggleCurrentTimeFilter,
    getCurrentTime: getCurrentUTCTime,
  };
};
