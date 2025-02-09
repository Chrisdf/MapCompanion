import { type Location } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface LocationListProps {
  locations: Location[];
  onLocationSelect: (location: Location) => void;
}

export default function LocationList({ locations, onLocationSelect }: LocationListProps) {
  if (locations.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        No locations added yet. Use the input above to add locations.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {locations.map((location) => (
        <Card
          key={location.id}
          className="p-3 cursor-pointer hover:bg-accent transition-colors"
          onClick={() => onLocationSelect(location)}
        >
          <div className="flex items-start gap-2">
            <MapPin className="h-5 w-5 mt-0.5 text-primary" />
            <div>
              <h3 className="font-medium">{location.name}</h3>
              {location.address && (
                <p className="text-sm text-muted-foreground">{location.address}</p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
