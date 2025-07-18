import { useMemo, useState } from "react";

import { MenuItem } from "@/store/useProjectStore";

/**
 * A custom hook to filter items based on a search query.
 * @param items - Array of items to search through.
 */
export function useSearch(items: MenuItem[]) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;

    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, items]);

  return { searchQuery, setSearchQuery, filteredItems };
}
