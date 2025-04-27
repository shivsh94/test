"use client";

import React from "react";
// import { useRouter } from "next/navigation";
// import { useCart } from "@/context/RequestCartContext";
// import { Button } from "@/components/ui/button";
// import { X, ChevronLeft } from "lucide-react";
// import Image from "next/image";
// // import { userInfo } from "@/lib/actions/user.actions"; // Assuming this is where your API call is defined
// // import { toast } from "@/components/ui/use-toast"; // Assuming you're using toast for notifications
// import { userInfo } from "@/lib/serviceApis";
// import { toast } from "sonner";

const Cart = () => {
  // const { cartItems, removeFromCart, clearCart } = useCart();
  // const router = useRouter();

  // if (cartItems.length === 0) {
  //   return router.back();
  // }

  // const handlePlaceRequests = async () => {
  //   try {
      
  //     const requests = cartItems.map(item => 
  //       userInfo(
  //         "entity_id_here",
  //         item.title,
  //         item.description || "No description provided",
  //         item.location || "Not specified",
  //         item.category || "General",
  //         item.reservation_id || "", 
  //         item.customer_id || "",
  //         item.name || "",
  //         item.contact || ""
  //       )
  //     );

      
  //     await Promise.all(requests);
      
  //     clearCart();
      
  //     // Show success notification
  //     toast({
  //       title: "Requests submitted successfully",
  //       description: "Your service requests have been placed.",
  //     });
      
  //     // Redirect back or to a confirmation page
  //     router.back();
  //   } catch (error) {
  //     console.error("Error placing requests:", error);
  //     toast({
  //       title: "Error",
  //       description: "Failed to place some or all requests. Please try again.",
  //       variant: "destructive",
  //     });
  //   }
  // };

  return (
    <div className="w-full flex flex-col h-screen bg-white">
      {/* <div className="flex items-center p-4 border-b sticky top-0 z-50 bg-white">
        <button
          onClick={() => router.back()}
          className="absolute text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="mx-auto text-xl font-semibold">Review Requests</h1>
      </div> */}
      {/* <div className="flex-grow p-4">
        {cartItems.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center mb-2 p-4 shadow-md rounded-lg"
          >
            <div className="flex items-center">
              <Image
                src={item.image}
                alt={item.title}
                width={32}
                height={32}
                priority={true}
                className="w-8 h-8 mr-4"
              />
              <span className="font-semibold text-sm">{item.title}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => removeFromCart(item.id)}
              className="p-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div> */}
      {/* <div className="sticky bottom-0 w-full p-4 bg-white border-t shadow-md">
        <Button 
          onClick={handlePlaceRequests}
          className="w-full text-base rounded-full bg-blue-500 hover:bg-blue-600"
          size={"lg"}
        >
          Place Requests
        </Button>
      </div> */}
    </div>
  );
};

export default Cart;