import type { Atis, Wx } from "../shared/atis";

// ATIS_SOURCE lets dev/tests point at a saved copy of the page.
const SOURCE = process.env.ATIS_SOURCE ?? "https://egcbatis.co.uk/";

// Labels printed by the source page (Next.js site, live since Nov 2026). A field's
// value is the text between its label and whichever label comes next, so
// reordering upstream doesn't break us. Each label starts a line.
const LABELS = {
  notice: /^Please book out/m,
  info: /^Information\b/m,
  nextUpdate: /^Next Status Update:/m,
  closes: /^Airfield closes/m,
  sunset: /^Sunset/m,
  rwy: /^Runway \/ circuit/m,
  qnh: /^Manchester QNH/m,
  qfe: /^Barton QFE/m,
  touchAndGo: /^Touch and go'?s/im,
  runways: /^Runway status/m,
  weather: /^Weather$/m,
  observation: /^Weather observation[^\n]*/m,
  warnings: /^Met warnings/m,
  briefing: /^Briefing/m,
  station: /^Wind & weather station/m,
} as const;

const ENTITIES: Record<string, string> = { amp: "&", nbsp: " ", lt: "<", gt: ">", quot: '"' };

function toText(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|svg)[\s\S]*?<\/\1>/gi, "")
    .replace(/<\/?(br|tr|td|p|div|table|li|ul|h\d|section)\b[^>]*>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&(?:#x([\da-f]+)|#(\d+)|(\w+));/gi, (m, hex, dec, name) =>
      hex ? String.fromCodePoint(parseInt(hex, 16)) : dec ? String.fromCodePoint(+dec) : ENTITIES[name] ?? m)
    .replace(/[ \t]+/g, " ")
    .replace(/^ | $/gm, "");
}

const oneLine = (s: string | undefined) =>
  s?.replace(/\s+/g, " ").trim().replace(/(?<=\d)\s*z$/i, "") || null;

const lines = (s: string | undefined) =>
  s?.split("\n").map((l) => l.trim()).filter(Boolean).join("\n") || null;

const int = (s: string | undefined) => {
  const m = s?.match(/\d{3,4}/);
  return m ? Number(m[0]) : null;
};

const temp = (s: string) => (s.startsWith("M") ? -Number(s.slice(1)) : Number(s));

// Best effort: the observation is hand-typed and labelled unofficial upstream.
export function parseObservation(obs: string): Wx | null {
  const wind = obs.match(/\b(VRB|\d{3})(\d{2,3})(?:G(\d{2,3}))?KT\b/);
  if (!wind) return null;
  const rest = obs.slice(wind.index! + wind[0].length);
  const t = rest.match(/\b(M?\d{2})\/(M?\d{2})\b/);
  return {
    windDir: wind[1] === "VRB" ? null : Number(wind[1]),
    windSpeed: Number(wind[2]),
    windGust: wind[3] ? Number(wind[3]) : null,
    visibility: rest.match(/\b(CAVOK|\d{4})\b/)?.[1] ?? null,
    temperature: t ? temp(t[1]) : null,
    dewpoint: t ? temp(t[2]) : null,
    cloud: rest.match(/\b(?:FEW|SCT|BKN|OVC)\d{3}(?:CB|TCU)?\b|\bNSC\b/g) ?? [],
  };
}

export function parseAtis(html: string, fetchedAt = new Date()): Atis {
  const text = toText(html.slice(Math.max(0, html.search(/<body/i))));

  const found = Object.entries(LABELS)
    .map(([key, re]) => ({ key, m: text.match(re) }))
    .filter((f) => f.m)
    .map(({ key, m }) => ({ key, start: m!.index!, end: m!.index! + m![0].length }))
    .sort((a, b) => a.start - b.start);
  const s: Partial<Record<keyof typeof LABELS, string>> = {};
  found.forEach((f, i) => {
    s[f.key as keyof typeof LABELS] = text.slice(f.end, found[i + 1]?.start);
  });

  // Info block: letter + issue time, then the status line(s), e.g. "J 12:30" / "Airfield Open".
  const info = (s.info ?? "").split("\n").map((l) => l.trim()).filter((l) => l && l !== "—");
  const issued = info[0]?.match(/^([A-Z])\s+(\d{2}):?(\d{2})$/);
  const status = oneLine((issued ? info.slice(1) : info).join(" "));
  const observation = oneLine(s.observation);
  return {
    fetchedAt: fetchedAt.toISOString(),
    sourceUpdated: text.match(/Data refreshed\s+([\d/]+ [\d:]+)/)?.[1] ?? null,
    parsed: status !== null,
    raw: status === null ? lines(text)?.slice(0, 1500) ?? null : null,
    status,
    infoLetter: issued?.[1] ?? null,
    infoTime: issued ? issued[2] + issued[3] : null,
    nextStatusUpdate: oneLine(s.nextUpdate),
    touchAndGo: oneLine(s.touchAndGo),
    closes: oneLine(s.closes),
    sunset: oneLine(s.sunset),
    runway: s.rwy?.match(/\b\d{2}[LRC]?\b/)?.[0] ?? null,
    circuit: s.rwy?.match(/\b(LH|RH|left|right)\b/i)?.[0].toUpperCase() ?? null,
    qnh: int(s.qnh),
    qfe: int(s.qfe),
    runways: Array.from(
      (s.runways ?? "").matchAll(/^(\d{2}[LRC]?) ?\/ ?(\d{2}[LRC]?)\n?([^\n]*)/gm),
      (m) => ({ id: `${m[1]}/${m[2]}`, state: oneLine(m[3]) }),
    ),
    briefing: lines(s.briefing),
    observation,
    wx: observation ? parseObservation(observation) : null,
    warnings: lines(s.warnings),
    notice: s.notice ? oneLine("Please book out" + s.notice) : null,
  };
}

interface Res {
  setHeader(name: string, value: string): unknown;
  status(code: number): { json(body: unknown): unknown };
}

// Runs as a Vercel function and as the Express dev route. No cron: the CDN
// caches each answer for 30s, so the source sees at most one request per 30s
// however many pilots are watching, and none when nobody is.
export default async function handler(_req: unknown, res: Res) {
  try {
    const r = await fetch(SOURCE, {
      headers: { "user-agent": "Mozilla/5.0 (compatible; WindsockATIS/1.0)" },
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) throw new Error(`source responded ${r.status}`);
    const atis = parseAtis(await r.text());
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=30");
    res.status(200).json(atis);
  } catch (err) {
    console.error("ATIS fetch failed:", err);
    res.setHeader("Cache-Control", "no-store");
    res.status(502).json({ error: "ATIS source unreachable" });
  }
}
