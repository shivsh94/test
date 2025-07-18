"use client";

import {
  ClipboardPen,
  Key,
  MapPin,
  NotepadText,
  Star,
  Wifi,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useIdStore, useSlugStore } from "@/store/useProjectStore";

import { Skeleton } from "../ui/skeleton";

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

type IconName =
  | "Wifi"
  | "MapPin"
  | "NotepadText"
  | "Star"
  | "Key"
  | "ClipboardPen";

const iconComponents: Record<IconName, React.ElementType> = {
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
  icon: IconName | { svg: string };
  type: CardType;
  content?: string;
  url?: string;
  secondaryColor?: string;
  primaryTextColor?: string;
  isMap?: boolean;
}

interface CardItem {
  id: string;
  name: string;
  icon: string;
  description?: string;
  is_disabled?: boolean;
}

interface Services {
  [key: string]:
    | {
        [key: string]: boolean;
      }
    | boolean;
}

const SkeletonCard: React.FC = () => (
  <Card className="flex flex-col items-center justify-center w-16 h-16 rounded-xl">
    <CardHeader className="flex flex-col items-center justify-center gap-1 p-0">
      <Skeleton className="w-5 h-5 rounded" />
      <Skeleton className="w-10 h-3 rounded" />
    </CardHeader>
  </Card>
);

const CardIcon: React.FC<{
  icon: IconName | { svg: string };
  primaryTextColor?: string;
}> = ({ icon, primaryTextColor }) => {
  if (typeof icon === "string") {
    const IconComponent = iconComponents[icon];
    if (!IconComponent) {
      console.warn(`Icon component not found for: ${icon}`);
      return <div className="w-5 h-5" />;
    }
    return (
      <IconComponent className="w-5 h-5" style={{ color: primaryTextColor }} />
    );
  }
  return (
    <div
      className="w-5 h-5"
      style={{ color: primaryTextColor }}
      dangerouslySetInnerHTML={{ __html: icon.svg }}
    />
  );
};

const CardDialog: React.FC<{
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  content?: string;
  isMap?: boolean;
}> = ({ open, setOpen, title, content, isMap }) => {
  const iframeHtml = useMemo(() => {
    if (!isMap || !content) return null;

    // First decode HTML entities
    const decodedContent = content
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

    // Then extract iframe
    const match = decodedContent.match(/<iframe[^>]*>[\s\S]*?<\/iframe>/i);
    return match ? match[0] : null;
  }, [isMap, content]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className={`${
          isMap
            ? "w-[90%] h-[80vh] max-h-[40%] p-0"
            : "w-[90%] max-h-[60%] overflow-y-auto overflow-x-hidden"
        } rounded-lg`}
      >
        {isMap && iframeHtml ? (
          <div className="w-full flex flex-col">
            <div className="p-3 border-b bg-background">
              <DialogTitle className="text-lg font-semibold">
                {title}
              </DialogTitle>
            </div>
            <div
              className="flex-1 w-full h-full overflow-hidden flex justify-center items-center"
              style={{
                minHeight: "200px",
              }}
            >
              <div
                className="w-full h-full flex justify-center items-center py-8 [&>iframe]:w-[95%] [&>iframe]:h-full [&>iframe]:border-0"
                dangerouslySetInnerHTML={{ __html: iframeHtml }}
              />
            </div>
          </div>
        ) : (
          <DialogHeader className="text-center">
            <DialogTitle className="my-1">{title}</DialogTitle>
            <div
              className="text-sm text-muted-foreground text-left whitespace-pre-wrap p-3"
              dangerouslySetInnerHTML={{
                __html: content ?? "Not defined",
              }}
            />
          </DialogHeader>
        )}
      </DialogContent>
    </Dialog>
  );
};

const InfoCard: React.FC<MergedCardProps> = React.memo(
  ({
    id: _id,
    title,
    icon,
    type,
    content,
    url,
    secondaryColor,
    primaryTextColor,
    isMap,
  }) => {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const rid = searchParams.get("rid");

    const handleAction = useCallback(() => {
      try {
        if (content?.startsWith("http")) {
          window.open(content, "_blank", "noopener,noreferrer");
          return;
        }

        if (type === "redirect" && url) {
          window.open(url, "_blank", "noopener,noreferrer");
        } else if (type === "navigate" && url) {
          const targetUrl = rid ? `${url}?rid=${rid}` : url;
          router.push(targetUrl);
        } else if (type === "popup") {
          setOpen(true);
        }
      } catch (error) {
        console.error("Error handling card action:", error);
      }
    }, [content, type, url, router, rid]);

    if (!secondaryColor || !primaryTextColor) {
      return <SkeletonCard />;
    }

    return (
      <>
        <Card
          className="flex flex-col items-center justify-center w-16 h-16 rounded-xl cursor-pointer transition-transform hover:scale-105"
          style={{ backgroundColor: secondaryColor }}
          onClick={handleAction}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleAction();
            }
          }}
        >
          <CardHeader className="flex flex-col items-center p-0">
            <CardIcon icon={icon} primaryTextColor={primaryTextColor} />
            <CardTitle
              className="text-xs font-light mt-1 text-center"
              style={{ color: primaryTextColor }}
            >
              {title}
            </CardTitle>
          </CardHeader>
        </Card>

        {type === "popup" && (
          <CardDialog
            open={open}
            setOpen={setOpen}
            title={title}
            content={content}
            isMap={isMap}
          />
        )}
      </>
    );
  }
);
InfoCard.displayName = "InfoCard";

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
] as const;

const useRequestsUrl = (): string | null => {
  const [requestsUrl, setRequestsUrl] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const pathSegments = window.location.pathname.split("/");
      const basePath = pathSegments[1] || "";
      setRequestsUrl(`/${basePath}/requests`);
    }
  }, []);

  return requestsUrl;
};

const useBaseCards = (
  requestsUrl: string | null,
  tnc?: string,
  areAllServicesFalse?: boolean
): Omit<MergedCardProps, "secondaryColor" | "primaryTextColor">[] => {
  return useMemo(() => {
    const cards: Omit<
      MergedCardProps,
      "secondaryColor" | "primaryTextColor"
    >[] = [];

    if (!areAllServicesFalse && requestsUrl) {
      cards.push({
        title: "Requests",
        icon: "ClipboardPen",
        type: "navigate",
        url: requestsUrl,
      });
    }

    cards.push({
      title: "Rules",
      icon: "NotepadText",
      type: "popup",
      content: tnc ?? "Not defined",
    });

    return cards;
  }, [requestsUrl, tnc, areAllServicesFalse]);
};

const useDynamicCards = (
  items: CardItem[]
): [MergedCardProps[], MergedCardProps[]] => {
  return useMemo(() => {
    return items
      .filter((item) => !item.is_disabled)
      .reduce(
        (acc, card) => {
          const isSocial = socialMediaKeywords.some((keyword) =>
            card.name.toLowerCase().includes(keyword)
          );

          const isMap = card.name.toLowerCase() === "location";
          let description = card.description;
          if (!isMap && description) {
            description = description
              .replace(/&lt;/g, "<")
              .replace(/&gt;/g, ">")
              .replace(/&amp;/g, "&")
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'")
              .replace(/<[^>]+>/g, "");
          }

          const newCard: Omit<
            MergedCardProps,
            "secondaryColor" | "primaryTextColor"
          > = {
            id: card.id,
            title: capitalize(card.name),
            icon:
              typeof card.icon === "string" && card.icon in iconComponents
                ? (card.icon as IconName)
                : { svg: card.icon },
            type: isMap
              ? "popup"
              : description?.startsWith("http")
                ? "redirect"
                : "popup",
            content: description,
            isMap,
          };

          acc[isSocial ? 1 : 0].push(newCard);
          return acc;
        },
        [[], []] as [MergedCardProps[], MergedCardProps[]]
      );
  }, [items]);
};

const InfoCards: React.FC = () => {
  const items = useIdStore((state) => state.idData?.items);
  const services = useSlugStore((state) => state.data?.context?.services);
  const tnc = useSlugStore((state) => state.data?.tnc);
  const secondaryColor = useSlugStore(
    (state) => state.data?.company?.secondary_color
  );
  const primaryTextColor = useSlugStore(
    (state) => state.data?.company?.primary_text_color
  );
  const isDataLoaded = useSlugStore((state) => !!state.data);
  const requestsUrl = useRequestsUrl();

  const areAllServicesFalse = useMemo(() => {
    if (!services) return true;
    return !Object.values(services).some((category) => {
      if (typeof category === "boolean") return category;
      if (typeof category === "object" && category !== null) {
        return Object.values(category).some((val) => val === true);
      }
      return false;
    });
  }, [services]);

  const baseCards = useBaseCards(requestsUrl, tnc, areAllServicesFalse);
  const dynamicItems = Array.isArray(items) ? items : [];
  const [normalCards, socialCards] = useDynamicCards(dynamicItems);

  const finalCards = useMemo(
    () => [...baseCards, ...normalCards, ...socialCards],
    [baseCards, normalCards, socialCards]
  );

  if (!isDataLoaded) {
    return (
      <div className="flex items-center h-20 pl-4 my-4 w-full overflow-x-auto overflow-y-hidden">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-shrink-0 mr-4">
            <SkeletonCard />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center h-20 pl-4 my-4 w-full overflow-x-auto overflow-y-hidden custom-scrollbar snap-x snap-mandatory">
      {finalCards.map((card, index) => (
        <div
          key={card.id ?? `${card.title}-${index}`}
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
