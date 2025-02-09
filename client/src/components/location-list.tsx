import { type Location } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Building2, MapPin } from "lucide-react";

interface LocationListProps {
  locations: Location[];
  onLocationSelect: (location: Location) => void;
}

export default function LocationList({ locations, onLocationSelect }: LocationListProps) {
  if (locations.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        No hotels added yet. Use the input above to add hotels to your list.
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
            <Building2 className="h-5 w-5 mt-0.5 text-primary" />
            <div className="flex-1">
              <h3 className="font-medium">{location.name}</h3>
              {location.address && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {location.address}
                </p>
              )}
              {location.metadata?.context && (
                <p className="text-sm text-blue-600 mt-1">
                  {location.metadata.context}
                </p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}