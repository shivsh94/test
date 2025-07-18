"use client";
import { Separator } from "@radix-ui/react-separator";
import { convert } from "html-to-text";
import Image from "next/image";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEventsData } from "@/hooks/useEventData";
import { cn } from "@/lib/utils";

export const Events = () => {
  const { data: eventsData } = useEventsData();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setUTCHours(parseInt(hours, 10));
    date.setUTCMinutes(parseInt(minutes, 10));
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC",
    });
  };

  const handleCardClick = (event: any) => {
    setSelectedEvent(event);
    setIsDialogOpen(true);
  };

  if (eventsData?.items?.length) {
    return (
      <div className="w-full px-4">
        <div className="flex gap-2 items-center w-full mb-4">
          <Separator className="flex-1 bg-gradient-to-l from-gray-400 to-background h-[1px]" />
          <h1 className="text-lg font-bold text-center">Upcoming Events</h1>
          <Separator className="flex-1 bg-gradient-to-r from-gray-400 to-background h-[1px]" />
        </div>

        <div className="relative">
          <ul className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar list-none pl-0">
            {eventsData.items.map((event, index) => (
              <li key={event.id} className="flex-shrink-0 w-2/3">
                <button
                  className={cn(
                    "relative rounded-lg overflow-hidden",
                    "h-[96px] w-full text-left p-0 border-none bg-transparent"
                  )}
                  onClick={() => handleCardClick(event)}
                >
                  {event.cover && (
                    <Image
                      src={event.cover}
                      alt={event.name}
                      fill
                      unoptimized
                      className="object-cover items-center justify-center"
                      priority={index === 0}
                    />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/20" />

                  <div className="relative h-full flex flex-col justify-between p-2">
                    <div className="text-white font-medium text-sm line-clamp-1 w-3/4">
                      {event.name}

                      <div className="flex gap-1 mt-6">
                        {event.is_repeat ? (
                          <>
                            {event.on_mon && <CompactDayPill day="M" />}
                            {event.on_tue && <CompactDayPill day="T" />}
                            {event.on_wed && <CompactDayPill day="W" />}
                            {event.on_thu && <CompactDayPill day="T" />}
                            {event.on_fri && <CompactDayPill day="F" />}
                            {event.on_sat && <CompactDayPill day="S" />}
                            {event.on_sun && <CompactDayPill day="S" />}
                          </>
                        ) : (
                          <span className="text-white text-xs">
                            {formatDate(event.at_date)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-end">
                      <div className="text-white text-xs">
                        {formatTime(event.start_time)} -{" "}
                        {formatTime(event.end_time)}
                      </div>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-center">
                {selectedEvent?.name}
              </DialogTitle>
            </DialogHeader>

            {selectedEvent && (
              <div className="space-y-4">
                {selectedEvent.cover && (
                  <div className="relative h-40 w-full rounded-lg overflow-hidden">
                    <Image
                      src={selectedEvent.cover}
                      alt={selectedEvent.name}
                      height={500}
                      width={500}
                      unoptimized
                      priority={true}
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="space-y-4 px-1">
                  <p className="text-sm text-gray-600">
                    {convert(selectedEvent.description)}
                  </p>
                  {selectedEvent.is_repeat ? (
                    <div>
                      <div className="flex flex-wrap gap-1">
                        {selectedEvent.on_mon && <ExpandedDayPill day="Mon" />}
                        {selectedEvent.on_tue && <ExpandedDayPill day="Tue" />}
                        {selectedEvent.on_wed && <ExpandedDayPill day="Wed" />}
                        {selectedEvent.on_thu && <ExpandedDayPill day="Thu" />}
                        {selectedEvent.on_fri && <ExpandedDayPill day="Fri" />}
                        {selectedEvent.on_sat && <ExpandedDayPill day="Sat" />}
                        {selectedEvent.on_sun && <ExpandedDayPill day="Sun" />}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="text-sm">
                        {formatDate(selectedEvent.at_date)}
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Time</p>
                      <p className="text-sm">
                        {formatTime(selectedEvent.start_time)} -{" "}
                        {formatTime(selectedEvent.end_time)}
                      </p>
                    </div>
                  </div>

                  {selectedEvent.redirect_url && (
                    <a
                      href={selectedEvent.redirect_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 w-full text-center px-4 py-2 bg-primary text-white rounded-md text-sm hover:bg-primary/90"
                    >
                      Visit Website
                    </a>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return null;
};

const CompactDayPill = ({ day }: { day: string }) => (
  <span className="bg-white/90 text-gray-800 text-xs h-5 w-5 flex items-center justify-center rounded-full font-medium shadow-sm">
    {day}
  </span>
);

const ExpandedDayPill = ({ day }: { day: string }) => (
  <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium border border-blue-200 hover:bg-blue-200 transition-colors">
    {day}
  </span>
);
