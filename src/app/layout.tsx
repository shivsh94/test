"use client"; // Client component since we're using Zustand
import "./globals.css";

import { Nunito } from "next/font/google";
import Head from "next/head";
import { useEffect } from "react";

import { CartProvider } from "@/context/FoodCartContext";
import { RequestCartProvider } from "@/context/RequestCartContext";
import { useSlugStore } from "@/store/useProjectStore";

interface RootLayoutProps {
  children: React.ReactNode;
}

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-nunito",
});

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  const hotelData = useSlugStore((state) => state.data);

  useEffect(() => {
    if (hotelData?.name) {
      document.title = hotelData.name;
    }
    if (hotelData?.company.logo) {
      let favicon = document.querySelector(
        "link[rel='icon']"
      ) as HTMLLinkElement;
      if (!favicon) {
        favicon = document.createElement("link");
        favicon.rel = "icon";
        document.head.appendChild(favicon);
      }
      favicon.href = hotelData.company.logo;
    }
  }, [hotelData]);

  return (
    <html lang="en">
      <Head>
        <link rel="icon" href="" id="link" />
      </Head>
      <CartProvider>
        <body
          className={`${nunito.variable} antialiased`}
          style={{ fontFamily: "var(--font-nunito)" }}
        >
          <RequestCartProvider>{children}</RequestCartProvider>
          {/* <Toaster /> */}
        </body>
      </CartProvider>
    </html>
  );
}
