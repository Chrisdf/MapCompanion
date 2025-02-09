import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { parseLocations } from "./lib/anthropic";
import { insertLocationListSchema, insertLocationSchema } from "@shared/schema";
import { ZodError } from "zod";

export function registerRoutes(app: Express): Server {
  app.post("/api/lists", async (req, res) => {
    try {
      const data = insertLocationListSchema.parse(req.body);
      const list = await storage.createList(data);
      res.json(list);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.get("/api/lists", async (_req, res) => {
    const lists = await storage.getAllLists();
    res.json(lists);
  });

  app.get("/api/lists/:id", async (req, res) => {
    const list = await storage.getList(Number(req.params.id));
    if (!list) {
      return res.status(404).json({ error: "List not found" });
    }
    res.json(list);
  });

  app.delete("/api/lists/:id", async (req, res) => {
    await storage.deleteList(Number(req.params.id));
    res.status(204).end();
  });

  app.post("/api/locations", async (req, res) => {
    try {
      const data = insertLocationSchema.parse(req.body);
      const location = await storage.addLocation(data);
      res.json(location);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.get("/api/lists/:id/locations", async (req, res) => {
    const locations = await storage.getLocations(Number(req.params.id));
    res.json(locations);
  });

  app.delete("/api/locations/:id", async (req, res) => {
    await storage.deleteLocation(Number(req.params.id));
    res.status(204).end();
  });

  app.post("/api/parse-locations", async (req, res) => {
    try {
      const { input } = req.body;
      if (!input || typeof input !== "string") {
        return res.status(400).json({ error: "Input text required" });
      }
      const locations = await parseLocations(input);
      res.json(locations);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ error: errorMessage });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}