"use client";

import { useMutation } from "@tanstack/react-query";
import { ChevronLeft, X } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { toast, Toaster } from "sonner";

import { Button } from "@/components/ui/button";
import { useCart } from "@/context/RequestCartContext";
import { ServiceRequest } from "@/lib/serviceApis";
import { useSlugStore } from "@/store/useProjectStore";
import { getCaptchaToken } from "@/utils/captcha";
import { getLocalStorageItem } from "@/utils/storageUtils";

const Cart = () => {
  const { cartItems, removeFromCart, clearCart } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const slugData = useSlugStore((state) => state.data);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const entity_id = slugData?.id ?? "default-entity-id";
  const rid = searchParams.get("rid");
  console.log("RID:", rid);

  const formSubmissionResponse = getLocalStorageItem("formSubmissionResponse");
  const userInfo = getLocalStorageItem("userContactInfo");
  const customer_id = formSubmissionResponse?.id;
  const description = "--";
  const name = userInfo?.name;
  const location = "--";

  const { mutate: submitRequests } = useMutation({
    mutationFn: async (requests: Promise<any>[]) => {
      return await Promise.all(requests);
    },
    onSuccess: () => {
      toast.success(
        <div>
          <strong>Requests submitted successfully</strong>
          <p>Your service requests have been placed.</p>
        </div>
      );

      const parentPath = rid
        ? `${pathname.replace("/place-request", "")}?rid=${rid}`
        : pathname.replace("/place-request", "");

      console.log("Parent Path:", parentPath);

      clearCart();
      setTimeout(() => {
        router.push(parentPath);
      }, 1500);
    },
    onError: (error) => {
      console.error("Error placing requests:", error);
      setIsSubmitting(false);
      toast.error(
        <div>
          <strong>Error</strong>
          <p>Failed to place some or all requests. Please try again.</p>
        </div>
      );
    },
  });

  if (cartItems.length === 0 && !isSubmitting) {
    const backPath = rid
      ? `${pathname.replace("/place-request", "/requests")}?rid=${rid}`
      : pathname.replace("/place-request", "/requests");
    router.push(backPath);
    return null;
  }

  const handlePlaceRequests = async () => {
    setIsSubmitting(true);

    try {
      const token = await getCaptchaToken();
      const requests = cartItems.map((item) =>
        ServiceRequest(
          entity_id,
          item.title,
          description,
          location,
          item.category || "General",
          rid ?? null,
          customer_id || "",
          name || "",
          token ?? null
        )
      );

      submitRequests(requests);
    } catch (error) {
      console.error("Error creating requests:", error);
      setIsSubmitting(false);
    }
  };

  const handleBackNavigation = () => {
    const backPath = rid
      ? `${pathname.replace("/place-request", "/requests")}?rid=${rid}`
      : pathname.replace("/place-request", "/requests");
    router.push(backPath);
  };

  return (
    <div className="w-full flex flex-col h-screen bg-white">
      <Toaster position="top-center" richColors closeButton />

      <div className="flex items-center p-4 border-b sticky top-0 z-50 bg-white">
        <button
          onClick={handleBackNavigation}
          className="absolute text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="mx-auto text-xl font-semibold">Review Requests</h1>
      </div>

      <div className="flex-grow p-4">
        {cartItems.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center mb-2 p-4 shadow-md rounded-lg"
          >
            <div className="flex items-center">
              <Image
                src={item.image}
                alt={item.title}
                width={32}
                height={32}
                unoptimized
                priority={true}
                className="w-8 h-8 mr-4"
              />
              <span className="font-semibold text-sm">{item.title}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => removeFromCart(item.id)}
              className="p-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 w-full p-4 bg-white border-t shadow-md">
        <Button
          onClick={handlePlaceRequests}
          className="w-full text-base rounded-full bg-blue-500 hover:bg-blue-600"
          size={"lg"}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Placing Requests..." : "Place Requests"}
        </Button>
      </div>
    </div>
  );
};

export default Cart;
