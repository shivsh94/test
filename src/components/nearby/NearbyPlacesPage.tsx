"use client";

import { useMemo, useState, useRef } from "react";
import Masonry from "react-masonry-css";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNearbyStore } from "@/store/useProjectStore";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Autoplay from "embla-carousel-autoplay";


interface Place {
  id: string;
  name: string;
  description?: string;
  category?: string;
  cover?: string;
  iframe?: string;
  is_disabled?: boolean;
  photos?: string[];
}

const BREAKPOINT_COLUMNS = { default: 2 };
const DEFAULT_CATEGORY = "Other";
const PLACEHOLDER_IMAGE = "/placeholder-image.jpg";

export default function NearbyPlacesPage() {
  const { nearbyPlaces } = useNearbyStore();
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const placesByCategory = useMemo(() => {
    return (nearbyPlaces || [])
      .filter((place) => !place.is_disabled)
      .reduce<Record<string, Place[]>>((acc, place) => {
        const category = place.category || DEFAULT_CATEGORY;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(place);
        return acc;
      }, {});
  }, [nearbyPlaces]);

  const handlePlaceClick = (place: Place) => {
    setSelectedPlace(place);
    setIsFullScreen(false);
  };

  const handleCloseDialog = () => {
    setSelectedPlace(null);
    setIsFullScreen(false);
  };

  if (Object.keys(placesByCategory).length === 0) {
    return <div className="text-center py-10">No nearby places found.</div>;
  }

  return (
    <div className="mx-auto px-4 space-y-8">
      {Object.entries(placesByCategory).map(([category, places]) => (
        <CategorySection
          key={category}
          category={category}
          places={places}
          onPlaceClick={handlePlaceClick}
        />
      ))}

      <PlaceDetailsDialog
        place={selectedPlace}
        onClose={handleCloseDialog}
        isFullScreen={isFullScreen}
        setIsFullScreen={setIsFullScreen}
      />
    </div>
  );
}

function CategorySection({
  category,
  places,
  onPlaceClick,
}: {
  category: string;
  places: Place[];
  onPlaceClick: (place: Place) => void;
}) {
  const categoryId = category.toLowerCase().replace(/ /g, "-");

  return (
    <section id={categoryId}>
      <CategoryHeader title={category} />
      <Masonry
        breakpointCols={BREAKPOINT_COLUMNS}
        className="flex gap-4"
        columnClassName="flex flex-col gap-4"
      >
        {places.map((place, index) => (
          <PlaceCard
            key={place.id || `place-${index}`}
            place={place}
            index={index}
            onClick={() => onPlaceClick(place)}
          />
        ))}
      </Masonry>
    </section>
  );
}

function CategoryHeader({ title }: { title: string }) {
  return (
    <div className="flex gap-2 items-center w-full my-4">
      <Separator className="flex-1 bg-gradient-to-l from-gray-400 to-background" />
      <h1 className="text-lg font-bold text-center">{title}</h1>
      <Separator className="flex-1 bg-gradient-to-r from-gray-400 to-background" />
    </div>
  );
}

function PlaceCard({
  place,
  index,
  onClick,
}: {
  place: Place;
  index: number;
  onClick: () => void;
}) {
  const cardHeight = 200 + (index % 2) * 50;

  return (
    <Card
      className="relative overflow-hidden rounded-md shadow-lg cursor-pointer transition-transform hover:scale-105"
      style={{ height: `${cardHeight}px` }}
      onClick={onClick}
    >
      <Image
        src={place.cover || PLACEHOLDER_IMAGE}
        alt={place.name}
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-60 text-white">
        <h3 className="text-base font-semibold truncate">{place.name}</h3>
      </div>
    </Card>
  );
}

function PhotoCarousel({ photos }: { photos: string[] }) {
  const plugin = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false })
  );

  if (!photos || photos.length === 0) return null;

  return (
    <Carousel
      className="w-full"
      plugins={[plugin.current]}
      opts={{
        align: "start",
        loop: true,
      }}
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {photos.map((photo, index) => (
          <CarouselItem key={`photo-${index}`}>
            <div className="h-64 w-full rounded-md overflow-hidden">
              <Image
                src={photo || PLACEHOLDER_IMAGE}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-2" />
      <CarouselNext className="right-2" />
    </Carousel>
  );
}

function PlaceDetailsDialog({
  place,
  onClose,
}: {
  place: Place | null;
  onClose: () => void;
  isFullScreen: boolean;
  setIsFullScreen: (value: boolean) => void;
}) {
  if (!place) return null;

  const photos = place.photos?.length
    ? place.photos
    : place.cover
      ? [place.cover]
      : [];

  const hasPhotos = photos.length > 0;
  const hasDescription = !!place.description;
  const hasIframe = !!place.iframe;

  return (
    <>
      <Dialog open={!!place} onOpenChange={onClose}>
        <DialogContent className="w-full max-w-md p-0 rounded-xl border-none overflow-y-auto max-h-[80vh]">
          <div className={cn("space-y-4 relative", hasPhotos ? "" : "pt-4")}>
            {photos.length > 1 ? (
              <PhotoCarousel photos={photos} />
            ) : hasPhotos ? (
              <Image
                src={photos[0] || PLACEHOLDER_IMAGE}
                alt={place.name}
                className="w-full h-64 object-cover rounded-t-lg"
              />
            ) : null}

            <div className="px-4 pb-4 space-y-4">
              <DialogHeader>
                <DialogTitle className="text-left font-bold text-xl">
                  {place.name}
                </DialogTitle>
              </DialogHeader>

              {hasDescription && (
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: place.description || "" }}
                />
              )}

              {hasIframe && (
                <div
                  className="rounded-lg mb-4 overflow-hidden"
                  style={{
                    width: "100%",
                    height: "300px",
                    border: "0",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: place.iframe || "",
                  }}
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
