import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { getReservation } from "@/lib/reservationApi";
import { useSlugStore } from "@/store/useProjectStore";
import { useReservationStore } from "@/store/useReservationStore";

export const useReservationData = () => {
  // Always call hooks unconditionally at the top
  const entity_id = useSlugStore((state) => state.data?.id);
  const searchParams = useSearchParams();
  const reservation_id = searchParams.get("rid");

  const { setReservationData, setReservationLoading, setReservationError } =
    useReservationStore();

  // Move the condition into the query's enabled property
  const {
    data: reservationData,
    isLoading: reservationLoadingQuery,
    isError: reservationErrorQuery,
    error: queryError,
  } = useQuery({
    queryKey: ["reservation", entity_id, reservation_id],
    queryFn: () => {
      if (!entity_id || !reservation_id) {
        throw new Error("Missing required parameters");
      }
      return getReservation(entity_id, reservation_id);
    },
    enabled: !!entity_id && !!reservation_id,
  });

  useEffect(() => {
    setReservationLoading(reservationLoadingQuery);

    if (reservationData) {
      setReservationData(reservationData);
    }

    if (reservationErrorQuery) {
      setReservationError(
        queryError instanceof Error
          ? queryError.message
          : "Failed to fetch reservation"
      );
    }
  }, [
    reservationData,
    reservationLoadingQuery,
    reservationErrorQuery,
    queryError,
    setReservationData,
    setReservationLoading,
    setReservationError,
  ]);

  return {
    reservation: reservationData,
    loading: reservationLoadingQuery,
    error: reservationErrorQuery ? String(queryError) : null,
  };
};
