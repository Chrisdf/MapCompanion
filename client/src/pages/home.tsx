import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { useDates } from "@/hooks/use-dates";
import { format } from "date-fns";
import MapView from "@/components/map-view";
import LocationList from "@/components/location-list";
import NaturalLanguageInput from "@/components/natural-language-input";
import HotelDetail from "@/components/hotel-detail";
import { type Location } from "@shared/schema";

export default function Home() {
  const [selectedLocations, setSelectedLocations] = useState<Location[]>([]);
  
  useEffect(() => {
    // Fetch default hotels on mount
    fetch('/api/lists/1/locations')
      .then(res => res.json())
      .then(locations => {
        setSelectedLocations(locations);
      })
      .catch(error => {
        console.error('Error fetching default hotels:', error);
      });
  }, []);
  const [selectedHotel, setSelectedHotel] = useState<Location | null>(null);
  const [center, setCenter] = useState({ lat: 35.6762, lng: 139.6503 }); // Tokyo coordinates

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 space-y-4">
        <Card className="p-4 relative">
          <h2 className="text-xl font-semibold mb-4">Select Your Dates</h2>
          <div className="flex gap-8 items-start justify-center">
            <div>
              <h3 className="text-sm font-medium mb-2">
                Check-in: {format(useDates((state) => state.checkIn), "MMM d, yyyy")}
              </h3>
              <Calendar
                mode="single"
                selected={useDates((state) => state.checkIn)}
                onSelect={(date) => date && useDates((state) => state.setDates(date, state.checkOut))}
                disabled={(date) => {
                  const checkOut = useDates((state) => state.checkOut);
                  return date < new Date() || date >= checkOut;
                }}
                className="rounded-md border"
              />
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">
                Check-out: {format(useDates((state) => state.checkOut), "MMM d, yyyy")}
              </h3>
              <Calendar
                mode="single"
                selected={useDates((state) => state.checkOut)}
                onSelect={(date) => date && useDates((state) => state.setDates(useDates.getState().checkIn, date))}
                disabled={(date) => {
                  const checkIn = useDates((state) => state.checkIn);
                  return date <= checkIn;
                }}
                className="rounded-md border"
              />
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 h-[600px] overflow-hidden">
          <MapView
            center={center}
            locations={selectedLocations}
            onCenterChange={setCenter}
            onLocationSelect={setSelectedHotel}
          />
        </Card>

          <div className="space-y-4">
          <Card className="p-4">
            <NaturalLanguageInput onLocationsFound={setSelectedLocations} />
          </Card>

          <Card className="h-[460px]">
            <ScrollArea className="h-full p-4">
              <h2 className="text-xl font-semibold mb-4">Locations</h2>
              <Separator className="mb-4" />
              <LocationList
                locations={selectedLocations}
                onLocationSelect={(loc) => {
                  const lat = Number(loc.latitude);
                  const lng = Number(loc.longitude);
                  if (!isNaN(lat) && !isNaN(lng)) {
                    setCenter({ lat, lng });
                  }
                  setSelectedHotel(loc);
                }}
              />
            </ScrollArea>
          </Card>
          </div>
        </div>
      </div>

      <HotelDetail 
        hotel={selectedHotel} 
        onClose={() => setSelectedHotel(null)} 
      />
    </div>
  );
}
