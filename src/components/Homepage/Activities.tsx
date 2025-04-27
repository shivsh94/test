'use client';
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";

interface Activity {
  id: string;
  title: string;
  price: string;
  originalPrice?: string;
  image: string;
  description: string;
}

export default function ActivitiesPage() {
  const activities: Activity[] = [
    {
      id: "1",
      title: "Rafting",
      price: "$50",
      originalPrice: "$65",
      image: "/rafting.jpg",
      description: "Experience breathtaking views and reconnect with nature on our guided hiking tours."
    },
    {
      id: "2",
      title: "Swimming",
      price: "$30",
      originalPrice: "$45",
      image: "/rafting.jpg",
      description: "Enjoy a refreshing swim in crystal-clear waters with lifeguard-supervised sessions."
    },
    {
      id: "3",
      title: "Cycling",
      price: "$40",
      originalPrice: "$55",
      image: "/rafting.jpg",
      description: "Join our cycling adventures and explore scenic trails with a group of fellow enthusiasts."
    },
    {
      id: "4",
      title: "Hiking",
      price: "$20",
      originalPrice: "$35",
      image: "/rafting.jpg",
      description: "Relax and rejuvenate with expert-led yoga sessions for all skill levels."
    },
    {
      id: "5",
      title: "Rock Climbing(Coming Soon)",
      price: "$60",
      originalPrice: "$75",
      image: "/rafting.jpg",
      description: "Challenge yourself with our thrilling rock climbing sessions, suitable for all skill levels."
    },
    {
      id: "6",
      title: "Camping",
      price: "$80",
      originalPrice: "$95",
      image: "/rafting.jpg",
      description: "Unwind under the stars with our all-inclusive camping experiences."
    }
  ];

  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [numPersons, setNumPersons] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");

  const slots = ["9 am to 10 am", "10 am to 11 am", "12 pm to 1 pm", "3 pm to 4 pm"];

  const incrementPersons = () => setNumPersons((prev) => prev + 1);
  const decrementPersons = () => setNumPersons((prev) => (prev > 1 ? prev - 1 : 1));

  const handleBookNow = () => {
    console.log({
      activity: selectedActivity?.title,
      persons: numPersons,
      date: selectedDate,
      slot: selectedSlot,
    });
    alert("Booking Confirmed!");
    setSelectedActivity(null);
  };

  return (
    <div className="mx-auto px-4">
      <div className="flex gap-2 items-center w-full mb-4">
        <Separator className="flex-1 bg-gradient-to-l from-gray-400 to-background" />
        <h1 className="text-lg font-bold text-center">Activities</h1>
        <Separator className="flex-1 bg-gradient-to-r from-gray-400 to-background" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {activities.map((activity) => (
          <Card
            key={activity.id}
            className="relative h-48 overflow-hidden rounded-md shadow-lg cursor-pointer border-none"
            onClick={() => setSelectedActivity(activity)}
          >
            <Image
              src={activity.image}
              alt={activity.title}
              className="absolute inset-0 w-full h-full object-cover"
              width={80}
              height={80}
            />
            <div className="absolute bottom-0 left-0 right-0 p-1 px-2 h-14 bg-background text-foreground rounded-md rounded-t-none shadow-xl ">
              <div className="relative w-full h-6 overflow-hidden">
                <motion.div
                  className="absolute whitespace-nowrap flex items-center text-base font-semibold"
                  initial={{ x: "100%" }} // Start at the default position
                  animate={
                    activity.title.length > 20
                      ? { x: ["0%", "-50%", "50%"] } // Moves to the left, then back to the start
                      : { x: 0 } // No animation for short titles
                  }
                  transition={
                    activity.title.length > 20
                      ? {
                          repeat: Infinity,
                          duration: 10, // Total time for both directions
                          ease: "linear", // Smooth continuous motion
                        }
                      : {}
                  }
                >
                  {/* Single instance of the title text */}
                  <span>{activity.title}</span>
                </motion.div>
              </div>
              <div className="flex items-baseline gap-2">
                {activity.originalPrice && (
                  <span className="text-xs line-through text-muted-foreground">
                    {activity.originalPrice}
                  </span>
                )}
                <span className="text-sm font-bold text-primary">{activity.price}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Dialog */}
      {selectedActivity && (
        <Dialog open={true} onOpenChange={() => setSelectedActivity(null)}>
          <DialogContent className="w-[90%] max-w-lg p-0 max-h-[80vh] rounded-md overflow-y-auto border-none">
            <div className="space-y-4">
              <Image
                src={selectedActivity.image}
                alt={selectedActivity.title}
                width={80}
                height={80}
                priority={true}
                className="w-full h-48 object-cover rounded-md"
              />
              <div className="px-4 space-y-2 pb-4">
                <DialogHeader>
                  <DialogTitle className="text-start text-xl">{selectedActivity.title}</DialogTitle>
                </DialogHeader>
                <div className="text-lg font-bold">
                  {selectedActivity.originalPrice && (
                    <span className="text-sm line-through text-muted-foreground mr-2">
                      {selectedActivity.originalPrice}
                    </span>
                  )}
                  {selectedActivity.price}
                </div>
                <p className="text-sm pt-2 pb-4">{selectedActivity.description}</p>

                {/* Number of Persons */}
                <div className="flex items-center font-bold justify-between mb-4">
                  <span className="text-base">Number of Persons<br/><span className="text-sm flex items-center">(Price changes)</span></span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={decrementPersons}
                      className="px-3 py-1 bg-gray-200 rounded-md"
                    >
                      -
                    </button>
                    <span className="">{numPersons}</span>
                    <button
                      onClick={incrementPersons}
                      className="px-3 py-1 bg-gray-200 rounded-md"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Date Picker */}
                <div className="mb-4">
                  <label className="block text-sm font-bold mb-1">Select Date:</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                {/* Slot Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-bold mb-1">Select Slot:</label>
                  <select
                    value={selectedSlot}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Select a slot</option>
                    {slots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Book Now Button */}
                <Button
                  onClick={handleBookNow}
                  className="w-full bg-blue-600 text-white py-2 rounded-md"
                >
                  Book Now
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
