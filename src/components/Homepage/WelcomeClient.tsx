"use client";
import { useSearchParams } from "next/navigation";
import { FC, useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useReservationData } from "@/hooks/useReservation";
import { useSlugStore } from "@/store/useProjectStore";
import { useReservationStore } from "@/store/useReservationStore";
import { getLocalStorageItem } from "@/utils/storageUtils";

import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";

const WelcomeClient: FC = () => {
  const hotelData = useSlugStore((state) => state.data);
  const searchParams = useSearchParams();
  const reservation_id = searchParams.get("rid");
  const currentState = useReservationStore.getState().reservation;

  useReservationData();

  const [userInfo, setUserInfo] = useState(() =>
    getLocalStorageItem("formSubmissionResponse")
  );

  useEffect(() => {
    const handleUserInfoUpdated = (event: CustomEvent) => {
      setUserInfo(event.detail);
    };

    window.addEventListener(
      "userInfoUpdated",
      handleUserInfoUpdated as EventListener
    );

    return () => {
      window.removeEventListener(
        "userInfoUpdated",
        handleUserInfoUpdated as EventListener
      );
    };
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return dateString.split("T")[0];
  };

  useEffect(() => {
    if (reservation_id && currentState) {
      const existingUserInfo = getLocalStorageItem("formSubmissionResponse");

      const updatedUserInfo = {
        ...existingUserInfo,
        id: currentState.customer_id,
        name: currentState.name,
        contact: currentState.customer?.contact || existingUserInfo?.contact,
        timestamp: existingUserInfo?.timestamp || new Date().toISOString(),
      };

      if (
        JSON.stringify(existingUserInfo) !== JSON.stringify(updatedUserInfo)
      ) {
        localStorage.setItem(
          "formSubmissionResponse",
          JSON.stringify(updatedUserInfo)
        );
        setUserInfo(updatedUserInfo);
      }
    }
  }, [currentState, reservation_id]);

  if (!hotelData) {
    return (
      <Card className="border-none rounded-none shadow-none mt-60">
        <CardHeader className="flex flex-col space-y-1 p-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="w-full px-4 pb-2">
          <div className="flex flex-col border rounded-md shadow-md">
            <div className="p-2 rounded-t-md">
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="p-2 flex justify-between items-center text-sm text-gray-500">
              <div className="">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Separator orientation="vertical" className="h-6 bg-gray-300" />
              <div className="">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayName = currentState?.name ?? userInfo?.name;

  return (
    <Card className="border-none rounded-none shadow-none mt-2">
      <CardHeader className="flex flex-col space-y-1 p-4">
        <CardTitle className="text-xl">{displayName}</CardTitle>
        <p className="text-sm text-gray-500">
          Welcome to{" "}
          <span className="font-bold">
            {hotelData?.name}, {hotelData?.region}
          </span>
        </p>
      </CardHeader>

      {reservation_id && (
        <CardContent className="w-full px-4 pb-2">
          <div className=" flex flex-col border rounded-md shadow-md">
            <div
              className="p-2 rounded-t-md"
              style={{ backgroundColor: hotelData?.company?.secondary_color }}
            >
              <p
                className="text-sm font-medium "
                style={{ color: hotelData?.company?.primary_text_color }}
              >
                Reservation ID:{" "}
                <span className="font-bold">{currentState?.ref_no}</span>
              </p>
            </div>

            <div className="p-2 flex justify-between items-center text-sm text-gray-500">
              <div className="">
                <p className="font-medium text-xs">Check-in</p>
                <p className="text-foreground font-bold">
                  {formatDate(currentState?.checkin_date ?? "")}
                </p>
              </div>
              <Separator orientation="vertical" className="h-6 bg-gray-300" />
              <div className="">
                <p className="font-medium text-xs text-end">Check-out</p>
                <p className="text-foreground font-bold">
                  {formatDate(currentState?.checkout_date ?? "")}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
export { WelcomeClient as default };
export type { FC };
