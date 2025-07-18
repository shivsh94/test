import Navigation from "@/components/nearby/Navigation";
import NearbyPlacesPage from "@/components/nearby/NearbyPlacesPage";
import StarRating from "@/components/StarRating/StarRating";

function Page() {
  return (
    <div className="flex flex-col items-center w-full ">
      <div className="w-full">
        <Navigation />
      </div>

      <div className="w-full">
        <NearbyPlacesPage />
      </div>
      <StarRating />

      <div className="mb-5"></div>
    </div>
  );
}

export default Page;
