import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getCheckinAttributes } from "@/lib/check-inApis";
import useCheckinStore from "@/store/useCheck-inStore";
import { useSlugStore } from "@/store/useProjectStore";

export const useCheckinAttributes = () => {
  const slugData = useSlugStore((state) => state.data);
  const entityId = slugData?.id;
  const { setCheckinData, clearCheckinData } = useCheckinStore();

  const {
    data: checkinResponse,
    isLoading: isCheckinLoading,
    isError: isCheckinError,
    refetch: refetchCheckin,
    error: checkinError,
  } = useQuery({
    queryKey: ["checkin-attributes", entityId],
    queryFn: async () => {
      if (!entityId) {
        throw new Error("Entity ID is required");
      }
      return await getCheckinAttributes(entityId);
    },
    enabled: !!entityId,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (checkinResponse) {
      setCheckinData(checkinResponse);
      console.log("Checkin data set:", checkinResponse);
    } else {
      clearCheckinData();
    }
  }, [checkinResponse, setCheckinData, clearCheckinData]);

  return {
    checkinAttributes: checkinResponse?.items ?? [],
    checkinCount: checkinResponse?.count ?? 0,
    isLoading: isCheckinLoading,
    isError: isCheckinError,
    error: checkinError,
    refetchCheckin,
    entityId,
  };
};
