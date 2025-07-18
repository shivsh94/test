// hooks/useEventData.ts
import { useQuery } from "@tanstack/react-query";

import { getEvents } from "@/lib/eventApis";
import { useSlugStore } from "@/store/useProjectStore";

export interface EventItem {
  name: string;
  description: string;
  redirect_url: string;
  is_repeat: boolean;
  at_date: string | null;
  start_time: string;
  end_time: string;
  on_mon: boolean;
  on_tue: boolean;
  on_wed: boolean;
  on_thu: boolean;
  on_fri: boolean;
  on_sat: boolean;
  on_sun: boolean;
  cover: string;
  is_disabled: boolean;
  id: string;
}

export interface EventsResponse {
  items: EventItem[];
  count: number;
}

export const useEventsData = () => {
  const entity_id = useSlugStore((state) => state.data?.id);

  return useQuery<EventsResponse, Error>({
    queryKey: ["events", entity_id],
    queryFn: () => {
      if (!entity_id) throw new Error("No entity_id provided");
      return getEvents(entity_id);
    },
    enabled: !!entity_id,
    staleTime: 1000 * 60 * 5,
  });
};
