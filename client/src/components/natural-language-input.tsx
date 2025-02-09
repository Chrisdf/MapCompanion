import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { type Location } from "@shared/schema";
import { Textarea } from "@/components/ui/textarea";

interface NaturalLanguageInputProps {
  onLocationsFound: (locations: Location[]) => void;
}

export default function NaturalLanguageInput({ onLocationsFound }: NaturalLanguageInputProps) {
  const [input, setInput] = useState("");
  const { toast } = useToast();

  // Function to geocode a hotel name using Google Places API
  async function geocodeHotel(name: string): Promise<{ 
    placeId: string;
    latitude: string;
    longitude: string;
    address: string;
  } | null> {
    const geocoder = new window.google.maps.places.PlacesService(
      document.createElement('div')
    );

    return new Promise((resolve) => {
      geocoder.findPlaceFromQuery(
        {
          query: `${name} Tokyo`,
          fields: ['place_id', 'geometry', 'formatted_address']
        },
        (results: any, status: any) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && results[0]) {
            const place = results[0];
            resolve({
              placeId: place.place_id,
              latitude: place.geometry.location.lat().toString(),
              longitude: place.geometry.location.lng().toString(),
              address: place.formatted_address
            });
          } else {
            resolve(null);
          }
        }
      );
    });
  }

  const parseLocationsMutation = useMutation({
    mutationFn: async (text: string) => {
      // First, parse the hotels using Anthropic
      const res = await apiRequest("POST", "/api/parse-locations", { input: text });
      const parsedHotels = await res.json();

      // Then, geocode each hotel
      const geocodedHotels = await Promise.all(
        parsedHotels.map(async (hotel: any) => {
          const geocodeResult = await geocodeHotel(hotel.name);
          if (!geocodeResult) {
            toast({
              title: "Warning",
              description: `Could not find location for: ${hotel.name}`,
              variant: "destructive",
            });
            return null;
          }

          return {
            listId: 1, // Default list ID
            name: hotel.name,
            ...geocodeResult,
            metadata: { context: hotel.context }
          };
        })
      );

      // Filter out any hotels that couldn't be geocoded
      const validHotels = geocodedHotels.filter(Boolean);

      // Add all hotels to the database
      const addedHotels = await Promise.all(
        validHotels.map(hotel =>
          apiRequest("POST", "/api/locations", hotel).then(res => res.json())
        )
      );

      return addedHotels;
    },
    onSuccess: (data) => {
      onLocationsFound(data);
      setInput("");
      toast({
        title: "Hotels added successfully",
        description: `Added ${data.length} hotels to the map`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error processing hotels",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    parseLocationsMutation.mutate(input);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-2">Add Hotels to Map</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Paste your list of hotels below. Each hotel should be on a new line.
          You can include notes in parentheses (e.g., "high floor available").
        </p>
      </div>

      <div className="space-y-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter hotels (one per line)..."
          className="min-h-[200px] font-mono"
          disabled={parseLocationsMutation.isPending}
        />
        <Button 
          type="submit"
          className="w-full"
          disabled={parseLocationsMutation.isPending || !input.trim()}
        >
          {parseLocationsMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Processing Hotels...
            </>
          ) : (
            'Add Hotels to Map'
          )}
        </Button>
      </div>
    </form>
  );
}