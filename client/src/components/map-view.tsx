import { useEffect, useRef } from "react";
import { type Location } from "@shared/schema";

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
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.onload = initMap;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
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
        lat: Number(location.latitude), 
        lng: Number(location.longitude) 
      };

      // Only create marker if coordinates are valid
      if (!isNaN(position.lat) && !isNaN(position.lng)) {
        const marker = new window.google.maps.Marker({
          position,
          map: googleMapRef.current,
          title: location.name,
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