import {
  pgTable,
  text,
  serial,
  integer,
  json,
  date,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const locationLists = pgTable("location_lists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
});

export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  listId: integer("list_id").notNull(),
  name: text("name").notNull(),
  placeId: text("place_id").notNull(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  address: text("address"),
  metadata: json("metadata").$type<Record<string, any>>(),
});

export const insertLocationListSchema = createInsertSchema(locationLists).pick({
  name: true,
  description: true,
});

export const insertLocationSchema = createInsertSchema(locations).pick({
  listId: true,
  name: true,
  placeId: true,
  latitude: true,
  longitude: true,
  address: true,
  metadata: true,
});

export type InsertLocationList = z.infer<typeof insertLocationListSchema>;
export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type LocationList = typeof locationLists.$inferSelect;
export const roomAvailability = pgTable("room_availability", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").notNull(),
  checkIn: date("check_in").notNull(),
  checkOut: date("check_out").notNull(),
  roomType: text("room_type").notNull(),
  pricePerNight: decimal("price_per_night").notNull(),
  available: integer("available").notNull(),
  lastUpdated: date("last_updated").notNull(),
});

export const insertRoomAvailabilitySchema = createInsertSchema(
  roomAvailability
).pick({
  locationId: true,
  checkIn: true,
  checkOut: true,
  roomType: true,
  pricePerNight: true,
  available: true,
  lastUpdated: true,
});

export type InsertRoomAvailability = z.infer<
  typeof insertRoomAvailabilitySchema
>;
export type RoomAvailability = typeof roomAvailability.$inferSelect;
export type Location = typeof locations.$inferSelect;
