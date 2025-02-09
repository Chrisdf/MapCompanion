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
    if (googleMapRef.current) {
      googleMapRef.current.setCenter(center);
    }
  }, [center]);

  useEffect(() => {
    if (!googleMapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    locations.forEach((location) => {
      const marker = new window.google.maps.Marker({
        position: { 
          lat: Number(location.latitude), 
          lng: Number(location.longitude) 
        },
        map: googleMapRef.current,
        title: location.name,
      });
      markersRef.current.push(marker);
    });
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
      onCenterChange({
        lat: newCenter.lat(),
        lng: newCenter.lng(),
      });
    });
  }

  return (
    <div ref={mapRef} className="w-full h-full rounded-lg" />
  );
}
