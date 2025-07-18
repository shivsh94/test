"use client";
import { Home, MapPin, Martini, ShoppingCart, Utensils } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { FC, useEffect, useState } from "react";

import { useCart } from "@/context/FoodCartContext";
import { useSlugStore } from "@/store/useProjectStore";

const Footer: FC = () => {
  const currentPath = usePathname();
  const searchParams = useSearchParams();
  const { cartItems } = useCart();
  const hotelData = useSlugStore((state) => state.data);
  const [isShown, setIsShown] = useState<boolean>(false);
  const reservation_id = searchParams.get("rid");

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const isFood = hotelData?.cafe_pay_enabled;
  const isBar = hotelData?.bar_pay_enabled;
  const showCart = isFood || isBar;

  useEffect(() => {
    if (
      currentPath.includes("/requests") ||
      currentPath.includes("/place-request") ||
      currentPath.includes("/check-in")
    ) {
      setIsShown(false);
    } else {
      setIsShown(true);
    }
  }, [currentPath]);

  const basePath = currentPath.split("/")[1];
  const prefix = `/${basePath}`;

  const baseMenuItems = [
    { id: "home", label: "Home", icon: <Home size={24} />, path: "" },
    {
      id: "nearby",
      label: "Nearby",
      icon: <MapPin size={24} />,
      path: "nearby",
    },
  ];

  const foodMenuItem = isFood
    ? [
        {
          id: "food",
          label: "Food",
          icon: <Utensils size={24} />,
          path: "food",
        },
      ]
    : [];

  const barMenuItem = isBar
    ? [{ id: "bar", label: "Bar", icon: <Martini size={24} />, path: "bar" }]
    : [];

  const cartMenuItem = showCart
    ? [
        {
          id: "cart",
          label: "Cart",
          icon: (
            <div className="relative">
              <ShoppingCart size={24} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </div>
          ),
          path: "cart",
        },
      ]
    : [];

  const menuItems = [
    ...baseMenuItems,
    ...foodMenuItem,
    ...barMenuItem,
    ...cartMenuItem,
  ];

  const withParams = (path: string) => {
    return reservation_id ? `${path}?rid=${reservation_id}` : path;
  };

  if (!isShown) return null;
  return (
    <footer className="sticky max-w-sm bottom-0 w-full h-16 bg-white/60 backdrop-blur-lg shadow-2xl z-20 border-t border-gray-200">
      <nav className="flex justify-evenly h-full">
        {menuItems.map((item) => {
          const href = item.path === "" ? prefix : `${prefix}/${item.path}`;
          const isActive = currentPath === href;

          return (
            <Link
              href={withParams(href)}
              key={item.id}
              className="flex flex-col items-center justify-center w-16 transition-colors duration-200 cursor-pointer"
              style={{
                color: isActive ? hotelData?.company?.primary_color : "black",
              }}
              onMouseEnter={(e) => {
                if (!isActive && hotelData?.company?.primary_color) {
                  e.currentTarget.style.color = hotelData.company.primary_color;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = "black";
                }
              }}
            >
              <div className="flex flex-col items-center gap-0.5">
                {item.icon}
                <span className="text-xs font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </footer>
  );
};

export default Footer;
