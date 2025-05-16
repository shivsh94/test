// hooks/useCombinedData.ts
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSlugStore } from "@/store/useProjectStore";
// import { useCombinedStore } from "@/store/combinedStore";
import { getUpsellCategories, getupsellItems } from "@/lib/upsellApis";
import { useCombinedStore } from "@/store/useUpsellStore";

export const useCombinedData = () => {
  const entity_id = useSlugStore((state) => state.data?.id);
  
  // Get all store actions and state at once
  const {
    items,
    itemsCount,
    itemsLoading,
    itemsError,
    upsellCategories,
    upsellCategoriesCount,
    setItemsData,
    setItemsLoading,
    setItemsError,
    setUpsellCategoriesData
  } = useCombinedStore();

  // Items query
  const { 
    data: itemsData, 
    isLoading: itemsLoadingQuery, 
    isError: itemsErrorQuery 
  } = useQuery({
    queryKey: ["items", entity_id],
    queryFn: () => {
      if (!entity_id) throw new Error("No entity_id provided");
      return getupsellItems(entity_id);
    },
    enabled: !!entity_id,
  });

  // Upsell categories query
  const { 
    data: upsellData 
  } = useQuery({
    queryKey: ["upsell-categories", entity_id],
    queryFn: () => {
      if (!entity_id) throw new Error("No entity_id provided");
      return getUpsellCategories(entity_id);
    },
    enabled: !!entity_id,
  });

  // Sync items data with store
  useEffect(() => {
    if (itemsData) {
      setItemsData(itemsData);
      setItemsLoading(false);
    }
  }, [itemsData, setItemsData, setItemsLoading]);

  // Sync loading state
  useEffect(() => {
    setItemsLoading(itemsLoadingQuery);
  }, [itemsLoadingQuery, setItemsLoading]);

  // Sync error state
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
    // Items
    items: itemsData?.items || items,
    itemsCount: itemsData?.count || itemsCount,
    // Upsell Categories
    upsellCategories: upsellData?.items || upsellCategories,
    upsellCategoriesCount: upsellData?.count || upsellCategoriesCount,
    
    // Manual refetch if needed
    // refetchItems: () => queryClient.invalidateQueries({ queryKey: ["items", entity_id] }),
    // refetchUpsellCategories: () => queryClient.invalidateQueries({ queryKey: ["upsell-categories", entity_id] })
  };
};