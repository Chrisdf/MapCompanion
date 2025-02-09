import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import MapView from "@/components/map-view";
import LocationList from "@/components/location-list";
import NaturalLanguageInput from "@/components/natural-language-input";
import { type Location } from "@shared/schema";

export default function Home() {
  const [selectedLocations, setSelectedLocations] = useState<Location[]>([]);
  const [center, setCenter] = useState({ lat: 35.6762, lng: 139.6503 }); // Tokyo coordinates

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 h-[600px]">
          <MapView
            center={center}
            locations={selectedLocations}
            onCenterChange={setCenter}
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
                }}
              />
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  );
}