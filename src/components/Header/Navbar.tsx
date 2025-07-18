"use client";

import { motion } from "framer-motion";
import { CreditCard, LogIn, NotepadText, Utensils } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useEffect, useMemo, useState } from "react";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useHotelData } from "@/hooks/useHotelData";
import { useReservationData } from "@/hooks/useReservation";
import { verifyRazorpayPayment } from "@/lib/createOrderApi";
import { useCreatePayment } from "@/lib/createPayment";
import { useReservationStore } from "@/store/useReservationStore";
import { getCaptchaToken } from "@/utils/captcha";
import {
  getLocalStorageItem,
  isValidUserSession,
  validateAndClearFormSubmission,
} from "@/utils/storageUtils";

import dummyPhoto from "../../../public/house.webp";
import PopUpForm from "../Register-Form/popUpForm";
import { Skeleton } from "../ui/skeleton";

declare global {
  interface Window {
    Razorpay: new (options: any) => { open: () => void };
  }
}

interface NavbarProps {
  slug: string;
}

const Navbar: React.FC<NavbarProps> = ({ slug }) => {
  const { hotel, isLoading, isError } = useHotelData(slug);
  const [showDrawer, setShowDrawer] = useState<boolean | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reservation_id = searchParams.get("rid");
  const [isShown, setIsShown] = useState<boolean>(false);
  const { reservation: reservationData } = useReservationStore();
  const tnc = hotel?.tnc ?? "";
  const [rulesDialogOpen, setRulesDialogOpen] = useState(false);
  const { toast } = useToast();
  useReservationData();
  const [localGuest, setLocalGuest] = useState(() =>
    getLocalStorageItem("guestData")
  );
  const { mutate: createPayment, isPending: isPaymentPending } =
    useCreatePayment();
  const reservationId = reservationData?.id || "";

  useEffect(() => {
    const validFormSubmission = validateAndClearFormSubmission(slug);
    const hasValidSession = isValidUserSession(slug);
  }, [slug]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "guestData") {
        setLocalGuest(getLocalStorageItem("guestData"));
      }
    };

    const handleCustomStorageChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.key === "guestData") {
        setLocalGuest(getLocalStorageItem("guestData"));
      }
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(
      "localStorageChange",
      handleCustomStorageChange as EventListener
    );

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "localStorageChange",
        handleCustomStorageChange
      );
    };
  }, []);

  useEffect(() => {
    if (localGuest) {
      try {
        const currentPath = window.location.pathname;
        const propertyName = currentPath.split("/")[1];

        if (reservation_id && localGuest.rid !== reservation_id) {
          localStorage.removeItem("guestData");
          setLocalGuest(null);
          return;
        }

        if (localGuest.currentProperty !== propertyName) {
          localStorage.removeItem("guestData");
          setLocalGuest(null);
        }
      } catch (error) {
        console.error("Error processing localGuest data:", error);
        localStorage.removeItem("guestData");
        setLocalGuest(null);
      }
    }
  }, [localGuest, pathname, reservation_id]);

  useEffect(() => {
    if (
      pathname.includes("/cart") ||
      pathname.includes("/requests") ||
      pathname.includes("/place-request") ||
      pathname.includes("/check-in")
    ) {
      setIsShown(false);
    } else {
      setIsShown(true);
    }
  }, [pathname]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const hasValidSession = isValidUserSession(slug);
      setShowDrawer(!hasValidSession);
    }, 1000);

    return () => clearTimeout(timer);
  }, [slug]);

  const handleFormSubmitSuccess = (submittedData: {
    id: any;
    name: string;
    contact: string;
  }) => {
    setShowDrawer(false);
    window.dispatchEvent(
      new CustomEvent("userInfoUpdated", {
        detail: submittedData,
      })
    );
  };

  const handlePaymentVerification = async (
    razorpayResponse: any,
    orderId: string
  ) => {
    try {
      const token = await getCaptchaToken();
      if (!token) {
        toast({
          title: "Error",
          description: "Captcha verification failed",
          variant: "destructive",
        });
        return;
      }

      const verification = await verifyRazorpayPayment(
        hotel?.id || "",
        orderId,
        razorpayResponse.razorpay_payment_id,
        razorpayResponse.razorpay_signature,
        "Reservation",
        razorpayResponse.razorpay_order_id,
        token
      );

      toast({
        title: "Payment Successful",
        description: "Your payment has been processed successfully",
        duration: 3000,
      });
    } catch (err) {
      console.error("Verification failed:", err);
      toast({
        title: "Payment Verification Failed",
        description: "There was an issue verifying your payment",
        variant: "destructive",
      });
    }
  };

  const handlePayDueAmount = async () => {
    if (!reservationId || !hotel?.id) return;

    try {
      const token = await getCaptchaToken();
      if (!token) {
        toast({
          title: "Error",
          description: "Captcha verification failed",
          variant: "destructive",
        });
        return;
      }

      createPayment(
        {
          entity_id: hotel.id,
          payload: {
            id: reservationId,
            payment_method: "UPI",
            category: "Reservation",
          },
        },
        {
          onSuccess: (response) => {
            if (response?.payment_data?.success) {
              const paymentData = response.payment_data.data;

              const options = {
                key: paymentData.key,
                amount: paymentData.amount,
                currency: paymentData.currency,
                name: hotel.company?.name || "Hotel Booking",
                description:
                  paymentData.description || "Payment for reservation",
                image: hotel.company?.logo || "",
                order_id: paymentData.order_id,
                handler: (razorpayResponse: any) =>
                  handlePaymentVerification(razorpayResponse, response.id),
                prefill: {
                  name: "Guest User",
                  email: "guest@example.com",
                  contact: "0000000000",
                },
                theme: {
                  color: hotel.company?.primary_color || "#1e40af",
                },
                modal: {
                  ondismiss: () => {
                    toast({
                      title: "Payment Cancelled",
                      description: "You cancelled the payment process",
                      variant: "default",
                    });
                  },
                },
              };

              const rzp = new window.Razorpay(options);
              rzp.open();
            } else {
              toast({
                title: "Payment Error",
                description:
                  response?.message || "Failed to initialize payment",
                variant: "destructive",
              });
            }
          },
          onError: (error) => {
            toast({
              title: "Payment Error",
              description: error?.message || "Failed to process payment",
              variant: "destructive",
            });
          },
        }
      );
    } catch (err) {
      console.error("Payment initialization failed:", err);
      toast({
        title: "Error",
        description: "Failed to initialize payment process",
        variant: "destructive",
      });
    }
  };

  const hotelData = useMemo(() => {
    const linkSuffix = reservation_id ? `?rid=${reservation_id}` : "";
    type HotelDataItem = {
      title: string;
      icon: string;
      link: string;
      onClick?: () => void;
    };

    const baseItems: HotelDataItem[] = [
      {
        title: localGuest ? "Add more guest" : "Online Check-in",
        icon: "LogIn",
        link: `/check-in${linkSuffix}`,
      },
    ];

    const total = parseFloat(reservationData?.total_amount ?? "0");
    const paid = parseFloat(reservationData?.paid_amount ?? "0");
    const refund = parseFloat(reservationData?.refunded_amount ?? "0");
    const dueAmount = total - (paid + refund);

    if (dueAmount >= 1) {
      baseItems.push({
        title: "Pay Due Amount",
        icon: "CreditCard",
        link: "#",
        onClick: handlePayDueAmount,
      });
    } else {
      baseItems.push({
        title: "Rules",
        icon: "NotepadText",
        link: "#",
        onClick: () => setRulesDialogOpen(true),
      });
    }

    return baseItems;
  }, [reservationData, localGuest, reservation_id, handlePayDueAmount]);

  if (!isShown) return null;

  if (isLoading || showDrawer === null) {
    return (
      <div className="relative font-sans">
        <div className="relative w-full bg-gray-200 overflow-hidden border-none h-60">
          <svg
            className="absolute -bottom-8 left-0 w-full h-24"
            viewBox="0 0 1440 100"
            preserveAspectRatio="none"
          >
            <path
              fill="white"
              d="M0,100 L1440,100 L1440,40 C1440,40 1200,80 720,80 C240,80 0,40 0,40 Z"
            />
          </svg>
          <div
            className="absolute bottom-0 left-0 w-full h-16"
            style={{
              background: "linear-gradient(to top, white, transparent)",
              transform: "scale(1.5)",
            }}
          />
        </div>

        <div className="w-full px-8 -mt-12 relative z-10 grid grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <Skeleton
              key={`skeleton-${crypto.randomUUID()}`}
              className="h-24 rounded-xl"
            />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !hotel) return <p>Failed to load hotel data.</p>;

  const { company, photos, name, city, region, country } = hotel;
  const primaryColor = company?.primary_color || "#1e40af";

  return (
    <div className="relative font-sans">
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />

      <div
        className="relative w-full bg-cover bg-center overflow-hidden border-none"
        style={{
          backgroundImage: `url(${
            Array.isArray(photos) && photos.length > 0
              ? photos[0]
              : dummyPhoto.src
          })`,
          paddingBottom: "80px",
        }}
      >
        <svg
          className="absolute -bottom-8 left-0 w-full h-24"
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
        >
          <path
            fill="white"
            d="M0,100 L1440,100 L1440,40 C1440,40 1200,80 720,80 C240,80 0,40 0,40 Z"
          />
        </svg>
        <div
          className="absolute bottom-0 left-0 w-full h-16"
          style={{
            background: "linear-gradient(to top, white, transparent)",
            transform: "scale(1.5)",
          }}
        />

        <div className="flex items-center justify-center mb-10 w-full px-6 pb-16">
          <Card className="h-14 flex items-center border-none p-2 px-2 w-full rounded-t-none bg-[#869099] bg-opacity-95">
            {company?.logo && (
              <Image
                src={company?.logo}
                alt=" "
                unoptimized
                width={70}
                height={70}
                className="object-contain"
              />
            )}
            <div className="overflow-hidden w-full flex flex-col mb-2">
              <motion.div
                style={{ display: "inline-block" }}
                initial={{ x: "100%" }}
                animate={{ x: "-100%" }}
                transition={{
                  x: {
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 10,
                    ease: "linear",
                  },
                }}
                className="whitespace-nowrap w-full"
              >
                <h1 className="text-xl font-bold mt-2 text-white">{name}</h1>
                <p className="text-sm text-white">
                  {city}, {region}, {country}
                </p>
              </motion.div>
            </div>
          </Card>
        </div>
      </div>

      <div
        className={`w-full px-8 -mt-12 relative z-10 ${hotelData.length > 1 ? "grid grid-cols-2 gap-4" : "flex justify-center"}`}
      >
        {hotelData.map((card) => {
          const isCheckIn =
            card.title === "Online Check-in" || card.title === "Add more guest";
          return (
            <Card
              key={card.title}
              className={`shadow-lg hover:shadow-xl transition-shadow rounded-xl ${
                isCheckIn ? "border-0" : ""
              } ${hotelData.length === 1 ? "w-full max-w-md" : ""}`}
              style={{
                backgroundColor: isCheckIn ? primaryColor : "white",
              }}
            >
              <CardHeader className="flex flex-col items-center p-4">
                <Link
                  href={`/${pathname.split("/")[1]}${card.link}`}
                  className="flex flex-col items-center w-full transition-colors"
                  style={{
                    color: isCheckIn ? "white" : primaryColor,
                  }}
                  onClick={(e) => {
                    if (card.onClick) {
                      e.preventDefault();
                      card.onClick();
                    }
                  }}
                >
                  <div>
                    {card.icon === "LogIn" && (
                      <LogIn className="w-6 h-6" strokeWidth={3} />
                    )}
                    {card.icon === "CreditCard" && (
                      <CreditCard className="w-6 h-6" strokeWidth={3} />
                    )}
                    {card.icon === "Utensils" && (
                      <Utensils className="w-6 h-6" strokeWidth={3} />
                    )}
                    {card.icon === "NotepadText" && (
                      <NotepadText className="w-6 h-6" strokeWidth={3} />
                    )}
                  </div>
                  <CardTitle
                    className="text-base font-bold pt-2 text-center whitespace-nowrap"
                    style={{
                      color: isCheckIn ? "white" : primaryColor,
                    }}
                  >
                    {card.title}
                  </CardTitle>
                </Link>
              </CardHeader>
            </Card>
          );
        })}
      </div>
      <PopUpForm
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        onSubmitSuccess={handleFormSubmitSuccess}
        pathname={pathname}
        slug={slug}
      />

      <Dialog open={rulesDialogOpen} onOpenChange={setRulesDialogOpen}>
        <DialogContent className="w-[90%] h-[70%] overflow-y-auto rounded-lg">
          <DialogHeader className="text-center">
            <DialogTitle className="my-1">Rules</DialogTitle>
            <div
              className="text-sm text-muted-foreground text-left whitespace-pre-wrap"
              dangerouslySetInnerHTML={{
                __html: tnc || "No rules defined",
              }}
            />
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Navbar;
