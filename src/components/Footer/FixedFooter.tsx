"use client";
import { FC, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, MapPin, Utensils, Martini, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/FoodCartContext";
import { useSlugStore } from "@/store/useProjectStore";

const Footer: FC = () => {
  const currentPath = usePathname();
  const { cartItems } = useCart();
  const hotelData = useSlugStore((state) => state.data);
  const [isShown, setIsShown] = useState<boolean>(false);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (
      currentPath.includes("/requests") ||
      currentPath.includes("/place-request")
    ) {
      setIsShown(false);
    } else {
      setIsShown(true);
    }
  }, [currentPath]);

  // Get base path like /project1-in
  const basePath = currentPath.split("/")[1];
  const prefix = `/${basePath}`;

  const menuItems = [
    { label: "Home", icon: <Home size={24} />, path: "" },
    { label: "Nearby", icon: <MapPin size={24} />, path: "nearby" },
    { label: "Food", icon: <Utensils size={24} />, path: "food" },
    { label: "Bar", icon: <Martini size={24} />, path: "bar" },
    {
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
  ];

  if (!isShown) return null;
  return (
    <footer className="sticky bottom-0 w-full h-16 bg-white/60 backdrop-blur-lg shadow-2xl z-50 border-t border-gray-200">
      <nav className="flex justify-evenly h-full">
        {menuItems.map((item, index) => {
          const href = item.path === "" ? prefix : `${prefix}/${item.path}`;
          const isActive = currentPath === href;

          return (
            <Link
              href={href}
              key={index}
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
