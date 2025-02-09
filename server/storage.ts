import { 
  locationLists, type LocationList, type InsertLocationList,
  locations, type Location, type InsertLocation 
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  async createList(list: InsertLocationList): Promise<LocationList> {
    const [newList] = await db
      .insert(locationLists)
      .values(list)
      .returning();
    return newList;
  }

  async getList(id: number): Promise<LocationList | undefined> {
    const [list] = await db
      .select()
      .from(locationLists)
      .where(eq(locationLists.id, id));
    return list;
  }

  async getAllLists(): Promise<LocationList[]> {
    return db.select().from(locationLists);
  }

  async deleteList(id: number): Promise<void> {
    // Delete associated locations first
    await db
      .delete(locations)
      .where(eq(locations.listId, id));

    await db
      .delete(locationLists)
      .where(eq(locationLists.id, id));
  }

  async addLocation(location: InsertLocation): Promise<Location> {
    const [newLocation] = await db
      .insert(locations)
      .values(location)
      .returning();
    return newLocation;
  }

  async getLocations(listId: number): Promise<Location[]> {
    return db
      .select()
      .from(locations)
      .where(eq(locations.listId, listId));
  }

  async deleteLocation(id: number): Promise<void> {
    await db
      .delete(locations)
      .where(eq(locations.id, id));
  }
}

export const storage = new DatabaseStorage();