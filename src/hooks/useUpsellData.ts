import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getUpsellCategories, getupsellItems } from "@/lib/upsellApis";
import { useSlugStore } from "@/store/useProjectStore";
import { useCombinedStore } from "@/store/useUpsellStore";
export const useCombinedData = () => {
  const entity_id = useSlugStore((state) => state.data?.id);
  const {
    items,
    itemsCount,
    upsellCategories,
    upsellCategoriesCount,
    setItemsData,
    setItemsLoading,
    setItemsError,
    setUpsellCategoriesData,
  } = useCombinedStore();

  const {
    data: itemsData,
    isLoading: itemsLoadingQuery,
    isError: itemsErrorQuery,
  } = useQuery({
    queryKey: ["items", entity_id],
    queryFn: () => {
      if (!entity_id) throw new Error("No entity_id provided");
      return getupsellItems(entity_id);
    },
    enabled: !!entity_id,
  });

  const { data: upsellData } = useQuery({
    queryKey: ["upsell-categories", entity_id],
    queryFn: () => {
      if (!entity_id) throw new Error("No entity_id provided");
      return getUpsellCategories(entity_id);
    },
    enabled: !!entity_id,
  });

  useEffect(() => {
    if (itemsData) {
      setItemsData(itemsData);
      setItemsLoading(false);
    }
  }, [itemsData, setItemsData, setItemsLoading]);

  useEffect(() => {
    setItemsLoading(itemsLoadingQuery);
  }, [itemsLoadingQuery, setItemsLoading]);

  useEffect(() => {
    if (itemsErrorQuery) {
      setItemsError("Failed to fetch items");
    }
  }, [itemsErrorQuery, setItemsError]);

  useEffect(() => {
    if (upsellData) {
      setUpsellCategoriesData(upsellData);
    }
  }, [upsellData, setUpsellCategoriesData]);

  return {
    items: itemsData?.items || items,
    itemsCount: itemsData?.count || itemsCount,
    upsellCategories: upsellData?.items || upsellCategories,
    upsellCategoriesCount: upsellData?.count || upsellCategoriesCount,
  };
};
