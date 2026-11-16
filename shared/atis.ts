// Types only: api/atis.ts must stay self-contained at runtime on Vercel.

export interface Wx {
  windDir: number | null; // degrees, null = variable
  windSpeed: number;
  windGust: number | null;
  visibility: string | null;
  temperature: number | null;
  dewpoint: number | null;
  cloud: string[];
}

export interface Atis {
  fetchedAt: string; // ISO time our function read the source
  sourceUpdated: string | null; // "updated" stamp as printed by the source
  parsed: boolean; // false = source layout not recognised, see `raw`
  raw: string | null;
  status: string | null;
  infoLetter: string | null;
  infoTime: string | null;
  nextStatusUpdate: string | null;
  touchAndGo: string | null;
  closes: string | null;
  runway: string | null;
  circuit: string | null;
  qnh: number | null;
  qfe: number | null;
  runways: { id: string; state: string | null }[];
  briefing: string | null;
  observation: string | null;
  wx: Wx | null;
  warnings: string | null;
  notice: string | null;
}
