'use client';

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  FerrisWheel,
  Coffee,
  Wine,
  TreePalm,
  Landmark,
  Dumbbell,
  ShoppingBag,
  Banknote,
  Bus,
  Clapperboard,
  Hospital,
  MoreHorizontal 
} from 'lucide-react';
import { useNearbyStore } from "@/store/useProjectStore";


interface NavigationItem {
  label: string;
  icon: React.ReactNode;
  id: string;
}

const NAVIGATION_ITEMS: NavigationItem[] = [
  { label: 'Attraction', icon: <FerrisWheel className="w-5 h-5" />, id: 'attraction' },
  { label: 'Cafe / Restaurant', icon: <Coffee className="w-5 h-5" />, id: 'cafe-restaurant' },
  { label: 'Bar / Pub', icon: <Wine className="w-5 h-5" />, id: 'bar-pub' },
  { label: 'Natural Spectacle', icon: <TreePalm className="w-5 h-5" />, id: 'natural-spectacle' },
  { label: 'Heritage Site', icon: <Landmark className="w-5 h-5" />, id: 'heritage-site' },
  { label: 'Sport', icon: <Dumbbell className="w-5 h-5" />, id: 'sport' },
  { label: 'Shopping', icon: <ShoppingBag className="w-5 h-5" />, id: 'shopping' },
  { label: 'ATM / Bank', icon: <Banknote className="w-5 h-5" />, id: 'atm-bank' },
  { label: 'Transport', icon: <Bus className="w-5 h-5" />, id: 'transport' },
  { label: 'Entertainment', icon: <Clapperboard className="w-5 h-5" />, id: 'entertainment' },
  { label: 'Pharmacy / Hospital', icon: <Hospital className="w-5 h-5" />, id: 'pharmacy-hospital' },
  { label: 'Other', icon: <MoreHorizontal className="w-5 h-5" />, id: 'other' }
];

const Navigation = () => {
  const nearbyPlaces = useNearbyStore((state) => state.nearbyPlaces || []);
  
  const filteredNavigationItems = useMemo(() => {
    
    const activePlaces = nearbyPlaces.filter(place => !place.is_disabled);
    
    if (activePlaces.length === 0) {
      return [];
    }
    
   
    const categoriesInStore = Array.from(
      new Set(activePlaces.map(item => item.category || 'Other'))
    ); 
    
    return NAVIGATION_ITEMS.filter(item => 
      item.label === 'Other' || categoriesInStore.includes(item.label)
    );
  }, [nearbyPlaces]);
  

  if (filteredNavigationItems.length === 0) {
    return null;
  }

  
  const scrollToSection = (id: string) => {
    
    const sectionId = id.toLowerCase().replace(/ /g, '-');
    const element = document.getElementById(sectionId);
    
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="flex flex-col shrink-0" aria-label="Category navigation">
      <div className="overflow-x-auto overflow-y-hidden custom-scrollbar whitespace-nowrap mt-4 px-4 flex gap-2">
        {filteredNavigationItems.map(({ label, icon, id }) => (
          <CategoryButton
            key={id}
            label={label}
            icon={icon}
            onClick={() => scrollToSection(label)} 
          />
        ))}
      </div>
    </nav>
  );
};

const CategoryButton = ({ 
  label, 
  icon, 
  onClick 
}: { 
  label: string; 
  icon: React.ReactNode; 
  onClick: () => void 
}) => (
  <Card
    className="rounded-full my-1 cursor-pointer hover:bg-blue-50 transition-colors"
    onClick={onClick}
  >
    <CardContent className="flex gap-4 px-4 py-2">
      <div className="flex items-center gap-2 text-gray-700">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
    </CardContent>
  </Card>
);

export default Navigation;