"use client";

import { LogIn, CreditCard } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { motion } from "framer-motion";
import { useIdStore } from "@/store/useProjectStore";
import { useEffect, useState, useMemo } from "react";
import { Skeleton } from "../ui/skeleton";
import { useHotelData } from "@/hooks/useHotelData";
import Image from "next/image";
import PopUpForm from "../Register-Form/popUpForm";
import { usePathname } from "next/navigation";
import { savedResponse } from "@/utils/storageUtils";

interface NavbarProps {
  slug: string;
}

const Navbar: React.FC<NavbarProps> = ({ slug }) => {
  const { hotel, isLoading, isError } = useHotelData(slug);
  const idData = useIdStore((state) => state.idData);
  const [showDrawer, setShowDrawer] = useState(false);
  const pathname = usePathname();
  const [isShown, setIsShown] = useState<boolean>(false);



  useEffect(() => {
    if (pathname.includes("/cart") || pathname.includes("/requests") || pathname.includes("/place-request")) {
      setIsShown(false);
    } else {
      setIsShown(true);
    }
  }, [pathname]);

  useEffect(() => {
    const isUser = savedResponse();
    if (!isUser) {
      setShowDrawer(true);
    }
  }, [idData]);

  const hotelData = useMemo(
    () => [
      {
        title: "Online Check-in",
        icon: "LogIn",
        link: "/check-in",
      },
      {
        title: "Pay Due Amount",
        icon: "CreditCard",
        link: "/",
      },
    ],
    []
  );

  if (isLoading) {
    return (
      <div className="px-6 py-10 animate-fade-in-up">
        <Skeleton className="w-full h-56 rounded-xl mb-6 animate-fade-in-up" />
        <div className="grid grid-cols-2 gap-4 w-full px-2 -mt-12">
          {[...Array(2)].map((_, i) => (
            <Skeleton
              key={i}
              className="h-32 rounded-xl bg-gray-300 animate-fade-in-up"
            />
          ))}
        </div>
      </div>
    );
  }
  if (isError || !hotel) return <p>Failed to load hotel data.</p>;

  const { company, photos, name, city, region, country } = hotel;
  const primaryColor = company?.primary_color || "#1e40af";

  if(!isShown) return null;

  return (
    <div className="relative font-sans">
      <div
        className="relative w-full bg-cover bg-center overflow-hidden border-none"
        style={{
          backgroundImage: `url(${Array.isArray(photos) && photos[0] ? photos[0] : "/default-cover.jpg"})`,
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
            <Image
              src={company?.logo || "/default-logo.png"}
              alt="Hotel Logo"
              width={70}
              height={70}
              className="object-contain"
            />
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

      <div className="grid grid-cols-2 gap-4 w-full px-8 -mt-12 relative z-10">
        {hotelData.map((card) => {
          const isCheckIn = card.title === "Online Check-in";
          return (
            <Card
              key={card.title}
              className={`shadow-lg hover:shadow-xl transition-shadow rounded-xl ${
                isCheckIn ? "border-0" : ""
              }`}
              style={{
                backgroundColor: isCheckIn ? primaryColor : "white",
              }}
            >
              <CardHeader className="flex flex-col items-center p-4">
                <Link
                  href={card.link}
                  className="flex flex-col items-center w-full transition-colors"
                  style={{
                    color: isCheckIn ? "white" : primaryColor,
                  }}
                >
                  <div>
                    {card.icon === "LogIn" && (
                      <LogIn className="w-6 h-6" strokeWidth={3} />
                    )}
                    {card.icon === "CreditCard" && (
                      <CreditCard className="w-6 h-6" strokeWidth={3} />
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
      />
    </div>
  );
};

export default Navbar;
