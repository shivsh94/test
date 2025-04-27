"use client";
import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "../ui/separator";
import { useSlugStore} from "@/store/useProjectStore";
import { Skeleton } from "../ui/skeleton";

const WelcomeClient: FC = () => {
  const hotelData = useSlugStore((state) => state.data);

  if (!hotelData) {
    return (
      <Card className="border-none rounded-none shadow-none mt-2">
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
  return (
    <Card className="border-none rounded-none shadow-none mt-2">
      <CardHeader className="flex flex-col space-y-1 p-4">
        <CardTitle className="text-xl">Ohai Nikhil Aggarwal</CardTitle>
        <p className="text-sm text-gray-500">
          Welcome to{" "}
          <span className="font-bold">
            {hotelData?.company?.name},{hotelData?.region}
          </span>
        </p>
      </CardHeader>

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
              Reservation ID: <span className="font-bold">RESHMU11850</span>
            </p>
          </div>

          <div className="p-2 flex justify-between items-center text-sm text-gray-500">
            <div className="">
              <p className="font-medium text-xs">Check-in</p>
              <p className="text-foreground font-bold">Sun, 01 Dec, 2024</p>
            </div>
            <Separator orientation="vertical" className="h-6 bg-gray-300" />
            <div className="">
              <p className="font-medium text-xs text-end">Check-out</p>
              <p className="text-foreground font-bold">Mon, 02 Dec, 2024</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WelcomeClient;
