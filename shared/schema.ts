import { pgTable, text, serial, integer, json } from "drizzle-orm/pg-core";
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
export type Location = typeof locations.$inferSelect;
