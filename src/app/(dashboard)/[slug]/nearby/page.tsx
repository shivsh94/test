import NearbyPlacesPage from '@/components/nearby/NearbyPlacesPage';
import Navigation from '@/components/nearby/Navigation';

function Page() {
  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full">
        <Navigation />
      </div>
      
      <div className="w-full">
        <NearbyPlacesPage />
      </div>

      <div className="mb-10"></div>
    </div>
  );
}

export default Page;