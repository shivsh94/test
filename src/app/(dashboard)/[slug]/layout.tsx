"use client";

import Script from "next/script";

import Footer from "@/components/Footer/FixedFooter";
import Navbar from "@/components/Header/Navbar";
import SwytwinLogo from "@/components/SwyftinBranding/SwyftinLogo";
import { Toaster } from "@/components/ui/toaster";
export default async function Layout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { slug: string };
}>) {
  return (
    <div className="min-h-screen bg-white shadow-xl relative flex flex-col w-full max-w-sm">
      <div>
        <Script
          strategy="beforeInteractive"
          src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY}`}
        />
        <Navbar slug={(await params).slug} />
      </div>
      <div className="flex flex-col flex-grow">{children}</div>
      <SwytwinLogo />
      <Toaster />
      <Footer />
    </div>
  );
}
