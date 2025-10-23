import {
  type AtisInfo,
  type InsertAtisInfo,
  type WeatherObs,
  type InsertWeatherObs,
  type RunwayStatus,
  type InsertRunwayStatus,
  type Notam,
  type InsertNotam,
  type HistoricalStats,
  type InsertHistoricalStats,
  type CurrentAtisData,
  type HistoricalDataPoint,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getCurrentAtis(): Promise<CurrentAtisData>;
  getHistoricalData(from: Date, to: Date): Promise<HistoricalDataPoint[]>;
  createAtisInfo(data: InsertAtisInfo): Promise<AtisInfo>;
  createWeatherObs(data: InsertWeatherObs): Promise<WeatherObs>;
  createRunwayStatus(data: InsertRunwayStatus): Promise<RunwayStatus>;
  createNotam(data: InsertNotam): Promise<Notam>;
  getActiveNotams(): Promise<Notam[]>;
}

export class MemStorage implements IStorage {
  private atisInfo: Map<string, AtisInfo>;
  private weatherObs: Map<string, WeatherObs>;
  private runwayStatuses: Map<string, RunwayStatus>;
  private notams: Map<string, Notam>;
  private historicalData: HistoricalDataPoint[];

  constructor() {
    this.atisInfo = new Map();
    this.weatherObs = new Map();
    this.runwayStatuses = new Map();
    this.notams = new Map();
    this.historicalData = [];
    
    this.seedData();
  }

  private seedData() {
    const now = new Date();
    
    const currentAtis: AtisInfo = {
      id: randomUUID(),
      informationCode: "U",
      timestamp: now,
      airfieldStatus: "Airfield Open",
      nextStatusUpdate: "Next Day",
      touchAndGo: "Permitted",
      runwayInUse: "26L",
      circuitDirection: "RH",
      qnh: 993,
      qfe: 991,
      closingTime: "1655z",
    };
    this.atisInfo.set(currentAtis.id, currentAtis);

    const currentWeather: WeatherObs = {
      id: randomUUID(),
      timestamp: now,
      metar: "EGCB 231605Z 33009KT 9999 SCT024 FEW040 11/05 Q0993",
      windDirection: 330,
      windSpeed: 9,
      windGust: null,
      visibility: "9999m",
      temperature: 11,
      dewpoint: 5,
      pressure: 993,
      cloudCoverage: "SCT024 FEW040",
      warnings: "W TO NW WINDS WITH MEAN 20-22KT AT TIMES AND GUSTS OF 28-35KT ARE LIKELY TO OCCUR. Valid: 231200 to 231800 UTC",
    };
    this.weatherObs.set(currentWeather.id, currentWeather);

    const runways = [
      { runwayId: "08L/26R", condition: "Operational", surfaceState: "Firm / Damp" },
      { runwayId: "08R/26L", condition: "Operational", surfaceState: "Firm / Damp" },
      { runwayId: "02/20", condition: "Operational", surfaceState: "Firm / Damp" },
      { runwayId: "13/31", condition: "Operational", surfaceState: "Firm / Damp" },
    ];

    runways.forEach((runway) => {
      const status: RunwayStatus = {
        id: randomUUID(),
        timestamp: now,
        runwayId: runway.runwayId,
        condition: runway.condition,
        surfaceState: runway.surfaceState,
      };
      this.runwayStatuses.set(status.id, status);
    });

    const notamsData = [
      {
        category: "Fuel",
        severity: "high",
        content: "JET A1 NOT AVAILABLE DUE TO DELIVERY",
        validFrom: new Date(now.getTime() - 86400000),
        validTo: new Date(now.getTime() + 172800000),
      },
      {
        category: "Aerodrome",
        severity: "medium",
        content: "B4 HOLDING POINT CLOSED MARKINGS NOT PRESENT",
        validFrom: new Date(now.getTime() - 172800000),
        validTo: null,
      },
      {
        category: "Taxiway",
        severity: "medium",
        content: "B3 RUNWAY ENTRY / EXIT POINT REDUCED WING TIP CLEARANCE DUE RED AND WHITE MARKER BOARDS",
        validFrom: new Date(now.getTime() - 259200000),
        validTo: null,
      },
      {
        category: "Taxiway",
        severity: "low",
        content: "T2 SITUATED AT RUNWAY EXIT POINT NEAR B1",
        validFrom: new Date(now.getTime() - 432000000),
        validTo: null,
      },
      {
        category: "Taxiway",
        severity: "high",
        content: "TWY C CLOSED",
        validFrom: new Date(now.getTime() - 345600000),
        validTo: null,
      },
      {
        category: "Taxiway",
        severity: "medium",
        content: "TWY D GREEN REFLECTIVE MARKERS AND D1 HOLD BOARDS NOT PRESENT",
        validFrom: new Date(now.getTime() - 518400000),
        validTo: null,
      },
    ];

    notamsData.forEach((notamData) => {
      const notam: Notam = {
        id: randomUUID(),
        timestamp: now,
        category: notamData.category,
        severity: notamData.severity,
        content: notamData.content,
        validFrom: notamData.validFrom,
        validTo: notamData.validTo,
        active: true,
      };
      this.notams.set(notam.id, notam);
    });

    for (let i = 0; i < 168; i++) {
      const timestamp = new Date(now.getTime() - i * 3600000);
      const variation = Math.sin(i / 12) * 5;
      
      this.historicalData.push({
        timestamp,
        qnh: 993 + Math.floor(variation),
        qfe: 991 + Math.floor(variation),
        temperature: 11 + Math.floor(Math.sin(i / 24) * 8),
        windSpeed: 9 + Math.floor(Math.random() * 6),
        windDirection: 330 + Math.floor(Math.random() * 40 - 20),
      });
    }

    this.historicalData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async getCurrentAtis(): Promise<CurrentAtisData> {
    const currentAtis = Array.from(this.atisInfo.values())[0];
    const currentWeather = Array.from(this.weatherObs.values())[0];
    const runways = Array.from(this.runwayStatuses.values());
    const notams = await this.getActiveNotams();

    return {
      atis: currentAtis,
      weather: currentWeather,
      runways,
      notams,
      lastUpdated: new Date(),
    };
  }

  async getHistoricalData(from: Date, to: Date): Promise<HistoricalDataPoint[]> {
    return this.historicalData.filter(
      (point) => point.timestamp >= from && point.timestamp <= to
    );
  }

  async createAtisInfo(data: InsertAtisInfo): Promise<AtisInfo> {
    const id = randomUUID();
    const atis: AtisInfo = { ...data, id };
    this.atisInfo.set(id, atis);
    return atis;
  }

  async createWeatherObs(data: InsertWeatherObs): Promise<WeatherObs> {
    const id = randomUUID();
    const weather: WeatherObs = { ...data, id };
    this.weatherObs.set(id, weather);
    return weather;
  }

  async createRunwayStatus(data: InsertRunwayStatus): Promise<RunwayStatus> {
    const id = randomUUID();
    const runway: RunwayStatus = { ...data, id };
    this.runwayStatuses.set(id, runway);
    return runway;
  }

  async createNotam(data: InsertNotam): Promise<Notam> {
    const id = randomUUID();
    const notam: Notam = { ...data, id };
    this.notams.set(id, notam);
    return notam;
  }

  async getActiveNotams(): Promise<Notam[]> {
    return Array.from(this.notams.values())
      .filter((notam) => notam.active)
      .sort((a, b) => {
        const severityOrder = { high: 0, medium: 1, low: 2 };
        return (
          severityOrder[a.severity as keyof typeof severityOrder] -
          severityOrder[b.severity as keyof typeof severityOrder]
        );
      });
  }
}

export const storage = new MemStorage();
