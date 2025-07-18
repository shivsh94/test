import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import {
  categoriesList,
  fetchHotelInfo,
  fetchIdInfo,
  fetchLabel,
  menuList,
  nearByPlaces,
} from "@/lib/HotelApis";
import {
  useCategoryStore,
  useIdStore,
  useLabelStore,
  useMenuStore,
  useNearbyStore,
  useSlugStore,
} from "@/store/useProjectStore";

export const useHotelData = (slug: string) => {
  const setData = useSlugStore((state) => state.setData);
  const setIdData = useIdStore((state) => state.setIdData);
  const setNearbyPlaces = useNearbyStore((state) => state.setNearbyPlaces);
  const setCategories = useCategoryStore((state) => state.setCategories);
  const setMenuItems = useMenuStore((state) => state.setMenuItems);
  const { setLabelItems } = useLabelStore();

  const dataUpdatedRef = useRef(false);

  const {
    data: hotel,
    isLoading: isHotelLoading,
    isError: isHotelError,
  } = useQuery({
    queryKey: ["hotel-info", slug],
    queryFn: () => fetchHotelInfo(slug),
  });

  const {
    data: hotelById,
    isLoading: isIdLoading,
    isError: isIdError,
  } = useQuery({
    queryKey: ["hotel-info-by-id", hotel?.id],
    queryFn: () => fetchIdInfo(hotel?.id),
    enabled: !!hotel?.id,
  });

  const {
    data: nearbyPlacesResponse,
    isLoading: isNearbyLoading,
    isError: isNearbyError,
  } = useQuery({
    queryKey: ["nearby-places", hotel?.id],
    queryFn: () => nearByPlaces(hotel?.id),
    enabled: !!hotel?.id,
  });

  const { data: categories } = useQuery({
    queryKey: ["categories-list", hotel?.id],
    queryFn: () => categoriesList(hotel?.id),
    enabled: !!hotel?.id,
  });

  const { data: menuItems } = useQuery({
    queryKey: ["menu-list", hotel?.id],
    queryFn: () => menuList(hotel?.id),
    enabled: !!hotel?.id,
  });

  const { data: label } = useQuery({
    queryKey: ["label", hotel?.id],
    queryFn: () => fetchLabel(hotel?.id, hotel?.company_id),
    enabled: !!hotel?.id,
  });

  useEffect(() => {
    if (hotel && !dataUpdatedRef.current) {
      setData(hotel);
      dataUpdatedRef.current = true;
    }
  }, [hotel, setData]);

  useEffect(() => {
    if (hotelById) {
      setIdData(hotelById);
    }
  }, [hotelById, setIdData]);

  useEffect(() => {
    if (nearbyPlacesResponse) {
      setNearbyPlaces(nearbyPlacesResponse);
    }
  }, [nearbyPlacesResponse, setNearbyPlaces]);

  useEffect(() => {
    if (categories) {
      setCategories(categories);
    }
  }, [categories, setCategories]);

  useEffect(() => {
    if (menuItems) {
      setMenuItems(menuItems);
    }
  }, [menuItems, setMenuItems]);

  useEffect(() => {
    if (label) {
      setLabelItems(label);
    }
  }, [label, setLabelItems]);

  return {
    hotel,
    hotelById,
    nearbyPlaces: nearbyPlacesResponse?.items || [],
    nearbyCount: nearbyPlacesResponse?.count || 0,
    labelItems: label?.items || [],
    labelCount: label?.count || 0,
    isLoading:
      isHotelLoading ||
      (isIdLoading && !!hotel?.id) ||
      (isNearbyLoading && !!hotel?.id),
    isError: isHotelError || isIdError || isNearbyError,
  };
};
