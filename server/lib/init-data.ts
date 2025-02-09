import { storage } from "../storage";
import { type InsertLocation } from "@shared/schema";

const defaultHotels: Omit<InsertLocation, "listId">[] = [
  {
    name: "Dormy Inn Premium Kanda",
    placeId: "", // Will be populated by geocoding
    latitude: "",
    longitude: "",
    address: "",
    metadata: {},
  },
  {
    name: "Mitsui Garden Hotel Ginza Gochome",
    placeId: "",
    latitude: "",
    longitude: "",
    address: "",
    metadata: {},
  },
  {
    name: "Hotel Gracery Shinjuku",
    placeId: "",
    latitude: "",
    longitude: "",
    address: "",
    metadata: {},
  },
  {
    name: "All Day Place Shibuya",
    placeId: "",
    latitude: "",
    longitude: "",
    address: "",
    metadata: {},
  },
  {
    name: "Mitsui Garden in Gotanda",
    placeId: "",
    latitude: "",
    longitude: "",
    address: "",
    metadata: {},
  },
  {
    name: "Hotel Mystays Premier Akasaka",
    placeId: "",
    latitude: "",
    longitude: "",
    address: "",
    metadata: {},
  },
  {
    name: "Tokyo Prince Hotel",
    placeId: "",
    latitude: "",
    longitude: "",
    address: "",
  },
  {
    name: "Shibuya Excel Hotel Tokyu",
    placeId: "",
    latitude: "",
    longitude: "",
    address: "",
    metadata: {},
  },
  {
    name: "Via Inn Prime Akasaka",
    placeId: "",
    latitude: "",
    longitude: "",
    address: "",
    metadata: {},
  },
  {
    name: "Keio Plaza Hotel Tokyo",
    placeId: "",
    latitude: "",
    longitude: "",
    address: "",
    metadata: {},
  },
  {
    name: "Shibuya Tokyu REI Hotel",
    placeId: "",
    latitude: "",
    longitude: "",
    address: "",
    metadata: {},
  },
];

// Function to geocode a hotel name using Google Places API
async function geocodeHotel(name: string): Promise<{
  placeId: string;
  latitude: string;
  longitude: string;
  address: string;
} | null> {
  try {
    const query = encodeURIComponent(`${name} Tokyo, Japan`);
    const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${query}&inputtype=textquery&fields=place_id,formatted_address,geometry&key=${process.env.VITE_GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK" && data.candidates?.[0]) {
      const place = data.candidates[0];
      return {
        placeId: place.place_id,
        latitude: place.geometry.location.lat.toString(),
        longitude: place.geometry.location.lng.toString(),
        address: place.formatted_address,
      };
    }
    console.error(`Could not find location for: ${name}`);
    return null;
  } catch (error) {
    console.error(`Error geocoding ${name}:`, error);
    return null;
  }
}

export async function initializeDefaultData() {
  try {
    // Create default list if it doesn't exist
    let defaultList = await storage.getList(1);
    if (!defaultList) {
      defaultList = await storage.createList({
        name: "Tokyo Hotels",
        description: "Default list of hotels in Tokyo",
      });
    }

    // Delete existing list to force fresh initialization with geocoding
    await storage.deleteList(defaultList.id);
    defaultList = await storage.createList({
      name: "Tokyo Hotels",
      description: "Default list of hotels in Tokyo",
    });

    console.log("Initializing default hotels...");

    // Add each hotel with geocoding
    for (const hotel of defaultHotels) {
      const geocoded = await geocodeHotel(hotel.name);
      if (geocoded) {
        await storage.addLocation({
          ...hotel,
          ...geocoded,
          listId: defaultList.id,
        });
        console.log(`Added ${hotel.name} to database`);
      }
    }

    console.log("Finished initializing default hotels");
  } catch (error) {
    console.error("Error initializing default data:", error);
  }
}
