import type { Express } from "express";
import { createServer, type Server } from "http";
import atis from "../api/atis";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/atis", atis);
  return createServer(app);
}
