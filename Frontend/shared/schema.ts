import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ATIS Information Schema
export const atisInfo = pgTable("atis_info", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  informationCode: text("information_code").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  airfieldStatus: text("airfield_status").notNull(),
  nextStatusUpdate: text("next_status_update"),
  touchAndGo: text("touch_and_go").notNull(),
  runwayInUse: text("runway_in_use").notNull(),
  circuitDirection: text("circuit_direction").notNull(),
  qnh: integer("qnh").notNull(),
  qfe: integer("qfe").notNull(),
  closingTime: text("closing_time"),
});


// Weather Observation Schema
export const weatherObs = pgTable("weather_obs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  timestamp: timestamp("timestamp").notNull(),
  metar: text("metar").notNull(),
  windDirection: integer("wind_direction"),
  windSpeed: integer("wind_speed"),
  windGust: integer("wind_gust"),
  visibility: text("visibility"),
  temperature: integer("temperature"),
  dewpoint: integer("dewpoint"),
  pressure: integer("pressure"),
  cloudCoverage: text("cloud_coverage"),
  warnings: text("warnings"),
});

// Runway Status Schema
export const runwayStatus = pgTable("runway_status", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  timestamp: timestamp("timestamp").notNull(),
  runwayId: text("runway_id").notNull(),
  condition: text("condition").notNull(),
  surfaceState: text("surface_state").notNull(),
});

// NOTAM Schema
export const notams = pgTable("notams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  timestamp: timestamp("timestamp").notNull(),
  category: text("category").notNull(),
  severity: text("severity").notNull(),
  content: text("content").notNull(),
  validFrom: timestamp("valid_from").notNull(),
  validTo: timestamp("valid_to"), // nullable by default
  active: boolean("active").notNull().default(true),
});

// Historical Statistics Schema
export const historicalStats = pgTable("historical_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  timestamp: timestamp("timestamp").notNull(),
  dataType: text("data_type").notNull(),
  data: json("data").notNull(),
});

// Insert Schemas
export const insertAtisInfoSchema = createInsertSchema(atisInfo).omit({ id: true });
export const insertWeatherObsSchema = createInsertSchema(weatherObs).omit({ id: true });
export const insertRunwayStatusSchema = createInsertSchema(runwayStatus).omit({ id: true });
export const insertNotamSchema = createInsertSchema(notams).omit({ id: true });
export const insertHistoricalStatsSchema = createInsertSchema(historicalStats).omit({ id: true });

// Types
export type AtisInfo = typeof atisInfo.$inferSelect;
export type InsertAtisInfo = z.infer<typeof insertAtisInfoSchema>;

export type WeatherObs = typeof weatherObs.$inferSelect;
export type InsertWeatherObs = z.infer<typeof insertWeatherObsSchema>;

export type RunwayStatus = typeof runwayStatus.$inferSelect;
export type InsertRunwayStatus = z.infer<typeof insertRunwayStatusSchema>;

export type Notam = typeof notams.$inferSelect;
export type InsertNotam = z.infer<typeof insertNotamSchema>;

export type HistoricalStats = typeof historicalStats.$inferSelect;
export type InsertHistoricalStats = z.infer<typeof insertHistoricalStatsSchema>;

// Frontend-specific types
export interface CurrentAtisData {
  atis: AtisInfo;
  weather: WeatherObs;
  runways: RunwayStatus[];
  notams: Notam[];
  lastUpdated: Date;
}

export interface HistoricalDataPoint {
  timestamp: Date;
  qnh: number;
  qfe: number;
  temperature: number;
  windSpeed: number;
  windDirection: number;
}

export interface DocumentDownloadRequest {
  type: 'notam' | 'aerodrome';
  categories?: string[];
  sections?: string[];
}
