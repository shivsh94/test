"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Wifi,
  MapPin,
  NotepadText,
  Star,
  Key,
  ClipboardPen,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useSlugStore, useIdStore } from "@/store/useProjectStore";
import { Skeleton } from "../ui/skeleton";

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const iconComponents = {
  Wifi,
  MapPin,
  NotepadText,
  Star,
  Key,
  ClipboardPen,
};

type CardType = "popup" | "redirect" | "navigate";

interface MergedCardProps {
  id?: string;
  title: string;
  icon: keyof typeof iconComponents | string;
  type: CardType;
  content?: string;
  url?: string;
  secondaryColor?: string;
  primaryTextColor?: string;
}

const InfoCard = React.memo(
  ({
    title,
    icon,
    type,
    content,
    url,
    secondaryColor,
    primaryTextColor,
  }: MergedCardProps) => {
    const IconComponent = iconComponents[icon as keyof typeof iconComponents];
    const [open, setOpen] = useState(false);
    const router = useRouter();

    const handleClick = useCallback(() => {
      if (type === "redirect" && url) {
        window.open(url, "_blank");
      } else if (type === "popup") {
        setOpen(true);
      } else if (type === "navigate" && url) {
        router.replace(`${window.location.href}/${url}`);
      }
    }, [type, url, router]);

    const handleLinkOrPopup = useCallback(() => {
      if (content?.startsWith("http")) {
        window.open(content, "_blank");
      } else {
        handleClick();
      }
    }, [content, handleClick]);

    if (!secondaryColor || !primaryTextColor) {
      return (
        <Card className="flex flex-col items-center justify-center w-16 h-16 rounded-xl">
          <CardHeader className="flex flex-col items-center justify-center gap-1 p-0">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="w-10 h-3 rounded" />
          </CardHeader>
        </Card>
      );
    }

    return (
      <>
        <Card
          className="flex flex-col items-center justify-center w-16 h-16 rounded-xl cursor-pointer"
          style={{ backgroundColor: secondaryColor }}
          onClick={handleLinkOrPopup}
        >
          <CardHeader className="flex flex-col items-center p-0">
            {IconComponent ? (
              <IconComponent
                className="w-5 h-5"
                style={{ color: primaryTextColor }}
              />
            ) : (
              <div
                className="w-5 h-5"
                style={{ color: primaryTextColor }}
                dangerouslySetInnerHTML={{ __html: icon }}
              />
            )}
            <CardTitle
              className="text-xs font-light mt-1"
              style={{ color: primaryTextColor }}
            >
              {title}
            </CardTitle>
          </CardHeader>
        </Card>

        {type === "popup" && open && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="w-[90%] rounded-lg">
              <DialogHeader className="text-center">
                <DialogTitle className="my-1">{title}</DialogTitle>
                <div
                  className="text-sm text-muted-foreground text-left whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: content || "Not defined",
                  }}
                />
              </DialogHeader>
            </DialogContent>
          </Dialog>
        )}
      </>
    );
  }
);

InfoCard.displayName = "InfoCard";

const InfoCards: React.FC = () => {
  const items = useIdStore((state) => state.idData?.items);
  const locationUrl = useSlugStore((state) => state.data?.location_url);
  const tnc = useSlugStore((state) => state.data?.tnc);
  const secondaryColor = useSlugStore(
    (state) => state.data?.company?.secondary_color
  );
  const primaryTextColor = useSlugStore(
    (state) => state.data?.company?.primary_text_color
  );
  const isDataLoaded = useSlugStore((state) => !!state.data);

  const finalCards = useMemo(() => {
    const socialMediaKeywords = [
      "facebook",
      "instagram",
      "twitter",
      "linkedin",
      "youtube",
      "snapchat",
      "whatsapp",
      "pinterest",
      "tiktok",
    ];

    const dynamicCards = Array.isArray(items) ? items : [];
    const allCards: Omit<
      MergedCardProps,
      "secondaryColor" | "primaryTextColor"
    >[] = [];

    if (locationUrl) {
      allCards.push({
        title: "Location",
        icon: "MapPin",
        type: "redirect",
        url: locationUrl,
      });
    }

    allCards.push(
      {
        title: "Requests",
        icon: "ClipboardPen",
        type: "navigate",
        url: "/requests",
      },
      {
        title: "Rules",
        icon: "NotepadText",
        type: "popup",
        content: tnc || "Not defined",
      }
    );

    const normalCards: typeof allCards = [];
    const socialCards: typeof allCards = [];

    dynamicCards.forEach((card) => {
      const isSocial = socialMediaKeywords.some((keyword) =>
        card.name.toLowerCase().includes(keyword)
      );

      const newCard = {
        id: card.id,
        title: capitalize(card.name),
        icon: card.icon,
        type: "popup" as CardType,
        content: card.description,
      };

      if (isSocial) {
        socialCards.push(newCard);
      } else {
        normalCards.push(newCard);
      }
    });

    return [...allCards, ...normalCards, ...socialCards];
  }, [items, locationUrl, tnc]);

  if (!isDataLoaded) {
    return (
      <div className="flex items-center h-20 pl-4 my-4 w-full overflow-x-auto overflow-y-hidden">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-shrink-0 mr-4">
            <Card className="flex flex-col items-center justify-center w-16 h-16 rounded-xl">
              <CardHeader className="flex flex-col items-center justify-center gap-1 p-0">
                <Skeleton className="w-5 h-5 rounded" />
                <Skeleton className="w-10 h-3 rounded" />
              </CardHeader>
            </Card>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center h-20 pl-4 my-4 w-full overflow-x-auto overflow-y-hidden custom-scrollbar snap-x snap-mandatory">
      {finalCards.map((card, index) => (
        <div
          key={card.id || card.title + index}
          className="flex-shrink-0 mr-4 snap-center"
        >
          <InfoCard
            {...card}
            secondaryColor={secondaryColor}
            primaryTextColor={primaryTextColor}
          />
        </div>
      ))}
    </div>
  );
};

export default InfoCards;
