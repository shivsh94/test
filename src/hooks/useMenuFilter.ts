"use client";

import { useState, useMemo, useEffect } from "react";
import {
  MenuItem,
  CategoryItem,
  CategoryKey,
  Timing,
  useCategoryStore,
  useMenuStore,
  useLabelStore,
} from "@/store/useProjectStore";

interface Preferences {
  Veg: boolean;
  NonVeg: boolean;
}

type DayOfWeek = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";



// interface MenuItem {
//   id: string;
//   name: string;
//   category_id: string;
//   description?: string;
//   food_type?: string;
//   labels?: string[];
//   price: string;
//   position: number;
//   is_open: boolean;
//   outlet: string;
//   context?: {
//     days?: Record<DayOfWeek, boolean>;
//     timings?: Array<{ start_time?: string; end_time?: string }>;
//   };
//   available?: boolean;
// }

// interface Category {
//   id: string;
//   name: string;
//   outlet: string;
//   position: number;
//   is_open: boolean;
//   items: MenuItem[];
//   available?: boolean;
//   count?: number;
  
//   context?: {
//     days?: Record<DayOfWeek, boolean>;
//     timings?: Array<{ start_time?: string; end_time?: string }>;
//   };
// }

export const useMenuFilters = () => {
  const { categories } = useCategoryStore();
  const { menuItems } = useMenuStore();
  const { labelItems } = useLabelStore();

  console.log("Categories:", categories);
  console.log("Menu Items:", menuItems);

  const [searchQuery, setSearchQuery] = useState("");
  const [preferences, setPreferences] = useState<Preferences>({
    Veg: false,
    NonVeg: false,
  });

  const [toggleStates, setToggleStates] = useState<Record<string, boolean>>(
    () => {
      const initialState: Record<string, boolean> = {};
      labelItems.forEach((label) => {
        initialState[label.id] = false;
      });
      return initialState;
    }
  );

  const [selectedDay, setSelectedDay] = useState<DayOfWeek | null>(
    getCurrentDay()
  );
  const [timeFilter, setTimeFilter] = useState<Timing | null>(null);
  const [useCurrentTime, setUseCurrentTime] = useState<boolean>(true);

  function getCurrentDay(): DayOfWeek {
    const days: DayOfWeek[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    return days[new Date().getDay()];
  }
  // console.log("Current Day:", getCurrentDay());

  function getCurrentTime(): string {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  useEffect(() => {
    if (useCurrentTime) {
      const interval = setInterval(() => {
        const currentTime = getCurrentTime();
        setTimeFilter({ start: currentTime, end: "23:59" });
      }, 60000);

      setTimeFilter({ start: getCurrentTime(), end: "23:59" });

      return () => clearInterval(interval);
    }
  }, [useCurrentTime]);

  const isAvailableOnDay = (
    item: CategoryItem | MenuItem,
    day: DayOfWeek | null
  ): boolean => {
    if (!day) return true;
    return item.context?.days?.[day] === true || false;
  };

  const isAvailableAtTime = (
    item: CategoryItem | MenuItem,
    time: Timing | null
  ): boolean => {
    if (!time) return true;
    if (!item.context?.timings || item.context.timings.length === 0)
      return true;

    return item.context.timings.some((timing) => {
      if (!timing.start || !timing.end) return true;

      const startTime = timing.start.split("+")[0].substring(0, 5);
      const endTime = timing.end.split("+")[0].substring(0, 5);

      return startTime <= time.start && endTime >= time.start;
    });
  };

  const menuData = useMemo(() => {
      const categoryList = Array.isArray(categories) ? categories : [];
      const foodCategories = categoryList.filter(
        (cat): cat is CategoryItem => cat.outlet === "Food"
      );

    const menuMap = new Map<
      CategoryKey & { available?: boolean },MenuItem[]>();
    const tempMap = new Map<string,{ categoryKey: CategoryKey; items: MenuItem[]; available: boolean }>();

    foodCategories.forEach((category) => {
      const categoryAvailable =
        isAvailableOnDay(category, selectedDay) &&
        isAvailableAtTime(category, timeFilter);

      const categoryKey: CategoryKey = {
        name: category.name,
        id: category.id,
      };

      tempMap.set(category.id, {
        categoryKey,
        items: [],
        available: categoryAvailable,
      });
    });

    menuItems.forEach((item: MenuItem) => {
      const categoryData = tempMap.get(item.category_id);

      if (categoryData) {
        const itemAvailable =
          isAvailableOnDay(item, selectedDay) &&
          isAvailableAtTime(item, timeFilter);

        const itemWithAvailability: MenuItem = {
          ...item,
          available: itemAvailable,
        };

        categoryData.items.push(itemWithAvailability);
      }
    });

    tempMap.forEach(({ categoryKey, items, available }) => {
      menuMap.set({ ...categoryKey, available }, items);
    });

    return menuMap;
  }, [categories, menuItems, selectedDay, timeFilter]);

  const filteredMenuData = useMemo(() => {
    const result = new Map<CategoryKey & { available?: boolean }, MenuItem[]>();

    menuData.forEach((items, categoryKey) => {
      const filteredItems = items.filter((item) => {
        const matchesSearch =
          searchQuery === "" ||
          categoryKey.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.description &&
            item.description.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesPreference =
          (!preferences.Veg && !preferences.NonVeg) ||
          (preferences.Veg && item.food_type === "Vegetarian") ||
          (preferences.NonVeg && item.food_type !== "Vegetarian");

        // Check if item has any of the active labels
        const matchesTag =
          Object.values(toggleStates).every((state) => !state) ||
          (item.labels &&
            item.labels.some(
              (labelId) =>
                toggleStates[labelId] &&
                labelItems.some((label) => label.id === labelId)
            ));

        return matchesSearch && matchesPreference && matchesTag;
      });

      if (filteredItems.length > 0 || true) {
        result.set(categoryKey, filteredItems);
      }
    });

    return result;
  }, [searchQuery, preferences, toggleStates, menuData, labelItems]);

  const handlePreferenceChange = (
    id: "Veg" | "NonVeg",
    checked: boolean
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [id]: checked,
    }));
  };

  const handleToggleChange = (toggleId: string, pressed: boolean) => {
    setToggleStates((prev) => ({
      ...prev,
      [toggleId]: pressed,
    }));
  };

  const handleDayChange = (day: DayOfWeek | null) => {
    setSelectedDay(day);
  };

  const handleTimeFilterChange = (time: Timing | null) => {
    setTimeFilter(time);
    setUseCurrentTime(false);
  };

  const toggleCurrentTimeFilter = (useCurrent: boolean) => {
    setUseCurrentTime(useCurrent);
    if (!useCurrent) {
      setTimeFilter(null);
    }
  };

  const getDayName = (day: DayOfWeek): string => {
    const dayNames: Record<DayOfWeek, string> = {
      mon: "Monday",
      tue: "Tuesday",
      wed: "Wednesday",
      thu: "Thursday",
      fri: "Friday",
      sat: "Saturday",
      sun: "Sunday",
    };
    return dayNames[day];
  };

  const activeFilters = [
    ...Object.entries(preferences)
      .filter(([, value]) => value)
      .map(([key]) => key),
    ...Object.entries(toggleStates)
      .filter(([, value]) => value)
      .map(([key]) => {
        const label = labelItems.find((l) => l.id === key);
        return label ? label.text : key;
      }),
    ...(selectedDay ? [getDayName(selectedDay)] : []),
    ...(timeFilter ? [`Time: ${timeFilter.start}`] : []),
  ];

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
    getCurrentTime,
  };
};
