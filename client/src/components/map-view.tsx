import { useEffect, useRef } from "react";
import { type Location } from "@shared/schema";
import { Loader } from "@googlemaps/js-api-loader";

interface MapViewProps {
  center: { lat: number; lng: number };
  locations: Location[];
  onCenterChange: (center: { lat: number; lng: number }) => void;
}

declare global {
  interface Window {
    google: any;
  }
}

export default function MapView({ center, locations, onCenterChange }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      version: "weekly",
      libraries: ["places"]
    });

    loader.load().then(() => initMap());

    return () => {
      if (markersRef.current) {
        markersRef.current.forEach(marker => marker.setMap(null));
      }
    };
  }, []);

  useEffect(() => {
    if (googleMapRef.current && center.lat && center.lng) {
      googleMapRef.current.setCenter(center);
    }
  }, [center]);

  useEffect(() => {
    if (!googleMapRef.current || !locations.length) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Create bounds object to encompass all markers
    const bounds = new window.google.maps.LatLngBounds();

    // Add new markers
    locations.forEach((location) => {
      const position = { 
        lat: parseFloat(location.latitude), 
        lng: parseFloat(location.longitude) 
      };

      // Only create marker if coordinates are valid
      if (!isNaN(position.lat) && !isNaN(position.lng)) {
        const marker = new window.google.maps.Marker({
          position,
          map: googleMapRef.current,
          title: location.name,
          animation: window.google.maps.Animation.DROP
        });

        // Add info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div class="p-2">
              <h3 class="font-bold">${location.name}</h3>
              ${location.address ? `<p class="text-sm">${location.address}</p>` : ''}
              ${location.metadata?.context ? `<p class="text-sm text-blue-600">${location.metadata.context}</p>` : ''}
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(googleMapRef.current, marker);
        });

        markersRef.current.push(marker);
        bounds.extend(position);
      }
    });

    // Adjust map to fit all markers if there are any
    if (markersRef.current.length > 0) {
      googleMapRef.current.fitBounds(bounds);

      // Get the center after fitting bounds
      const newCenter = googleMapRef.current.getCenter();
      onCenterChange({
        lat: newCenter.lat(),
        lng: newCenter.lng(),
      });
    }
  }, [locations]);

  function initMap() {
    if (!mapRef.current) return;

    const mapOptions = {
      center,
      zoom: 12,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ],
    };

    googleMapRef.current = new window.google.maps.Map(
      mapRef.current,
      mapOptions
    );

    googleMapRef.current.addListener("center_changed", () => {
      const newCenter = googleMapRef.current.getCenter();
      if (newCenter) {
        onCenterChange({
          lat: newCenter.lat(),
          lng: newCenter.lng(),
        });
      }
    });
  }

  return (
    <div ref={mapRef} className="w-full h-full rounded-lg" />
  );
}