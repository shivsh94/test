// app/activities/page.tsx
'use client';
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import Image from "next/image";
import { useCombinedData } from "@/hooks/useUpsellData";
import { Item, UpsellCategory } from "@/store/useUpsellStore";
import { ActivityDialog } from "./ActivityDialog";
import { useSlugStore } from "@/store/useProjectStore";

interface GroupedItems {
  categoryName: string;
  items: Item[];
}

export default function ActivitiesPage() {
  const upsellData = useCombinedData();
  const entity_id = useSlugStore((state) => state.data?.id);
  const [selectedActivity, setSelectedActivity] = useState<Item | null>(null);

  const groupedItems: GroupedItems[] = upsellData?.upsellCategories?.map((category: UpsellCategory) => {
    return {
      categoryName: category.name,
      items: upsellData?.items?.filter((item: Item) => item.category_id === category.id) || []
    };
  }) || [];

  const handleBookNow = (bookingDetails: {
    activity: string;
    persons: number;
    date: string;
    slot: string;
  }) => {
    console.log(bookingDetails);
    alert("Booking Confirmed!");
    setSelectedActivity(null);
  };

  return (
    <div className="mx-auto px-4">
      {groupedItems.map((group) => (
        <div key={group.categoryName} className="mb-8">
          {group.items.length > 0 && (
            <>
              <div className="flex gap-2 items-center w-full mb-4">
                <Separator className="flex-1 bg-gradient-to-l from-gray-400 to-background" />
                <h2 className="text-lg font-bold text-center">{group.categoryName}</h2>
                <Separator className="flex-1 bg-gradient-to-r from-gray-400 to-background" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {group.items.map((item) => (
                  <Card
                    key={item.id}
                    className="relative h-48 overflow-hidden rounded-md shadow-lg cursor-pointer border-none"
                    onClick={() => setSelectedActivity(item)}
                  >
                    <Image
                      src={item.cover}
                      alt={item.name}
                      className="absolute inset-0 w-full h-full object-cover"
                      width={80}
                      height={80}
                      priority
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-1 px-2 h-14 bg-background text-foreground rounded-md rounded-t-none shadow-xl ">
                      <div className="relative w-full h-6 overflow-hidden">
                        <motion.div
                          className="absolute whitespace-nowrap flex items-center text-base font-semibold"
                          initial={{ x: "100%" }}
                          animate={
                            item.name.length > 20
                              ? { x: ["0%", "-50%", "50%"] }
                              : { x: 0 }
                          }
                          transition={
                            item.name.length > 20
                              ? {
                                  repeat: Infinity,
                                  duration: 10,
                                  ease: "linear",
                                }
                              : {}
                          }
                        >
                          <span>{item.name}</span>
                        </motion.div>
                      </div>
                      <div className="flex items-baseline gap-2">
                        {item.discount && parseFloat(item.discount) > 0 && (
                          <span className="text-xs line-through text-muted-foreground">
                            ${(parseFloat(item.price) + parseFloat(item.discount)).toFixed(2)}
                          </span>
                        )}
                        <span className="text-sm font-bold text-primary">${item.price}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      ))}

      <ActivityDialog
        activity={selectedActivity}
        onClose={() => setSelectedActivity(null)}
        onBookNow={handleBookNow}
        entityId={entity_id || ""} 
      />
    </div>
  );
}