import { 
  LocationList, InsertLocationList, 
  Location, InsertLocation 
} from "@shared/schema";

export interface IStorage {
  // List operations
  createList(list: InsertLocationList): Promise<LocationList>;
  getList(id: number): Promise<LocationList | undefined>;
  getAllLists(): Promise<LocationList[]>;
  deleteList(id: number): Promise<void>;

  // Location operations
  addLocation(location: InsertLocation): Promise<Location>;
  getLocations(listId: number): Promise<Location[]>;
  deleteLocation(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private lists: Map<number, LocationList>;
  private locations: Map<number, Location>;
  private listCounter: number;
  private locationCounter: number;

  constructor() {
    this.lists = new Map();
    this.locations = new Map();
    this.listCounter = 1;
    this.locationCounter = 1;
  }

  async createList(list: InsertLocationList): Promise<LocationList> {
    const id = this.listCounter++;
    const newList: LocationList = { 
      ...list, 
      id, 
      description: list.description ?? null 
    };
    this.lists.set(id, newList);
    return newList;
  }

  async getList(id: number): Promise<LocationList | undefined> {
    return this.lists.get(id);
  }

  async getAllLists(): Promise<LocationList[]> {
    return Array.from(this.lists.values());
  }

  async deleteList(id: number): Promise<void> {
    this.lists.delete(id);
    // Delete associated locations
    const locationsToDelete = Array.from(this.locations.entries())
      .filter(([, location]) => location.listId === id)
      .map(([id]) => id);

    locationsToDelete.forEach(id => this.locations.delete(id));
  }

  async addLocation(location: InsertLocation): Promise<Location> {
    const id = this.locationCounter++;
    const newLocation: Location = {
      ...location,
      id,
      address: location.address ?? null,
      metadata: location.metadata ?? null
    };
    this.locations.set(id, newLocation);
    return newLocation;
  }

  async getLocations(listId: number): Promise<Location[]> {
    return Array.from(this.locations.values())
      .filter(loc => loc.listId === listId);
  }

  async deleteLocation(id: number): Promise<void> {
    this.locations.delete(id);
  }
}

export const storage = new MemStorage();