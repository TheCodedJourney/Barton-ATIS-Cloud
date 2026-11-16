import type { Atis, Wx } from "../shared/atis";

// ATIS_SOURCE lets dev/tests point at a saved copy of the page.
const SOURCE = process.env.ATIS_SOURCE ?? "https://egcbatis.co.uk/main/index.php";

// Labels printed by the source page. A field's value is the text between its
// label and whichever label comes next, so reordering upstream doesn't break us.
const LABELS = {
  info: /INFO:?/,
  status: /AIRFIELD STATUS:/,
  nextUpdate: /NEXT (?:STATUS UPDATE|INSPECTION):/,
  touchAndGo: /TOUCH AND GO'?s:/i,
  rwy: /RWY/,
  qnh: /M\/CR QNH:?/,
  qfe: /BARTON QFE:?/,
  closes: /AIRFIELD CLOSES:/,
  runways: /RUNWAY STATUS:/,
  briefing: /BRIEFING:/,
  observation: /WEATHER OBSERVATION[^:\n]*:/,
  warnings: /MET WARNINGS:/,
} as const;

const ENTITIES: Record<string, string> = {
  "&amp;": "&", "&nbsp;": " ", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'",
};

function toText(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, "")
    .replace(/<\/?(br|tr|td|p|div|table)\b[^>]*>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&(amp|nbsp|lt|gt|quot|#39);/g, (m) => ENTITIES[m])
    .replace(/[ \t]+/g, " ");
}

const oneLine = (s: string | undefined) =>
  s?.replace(/\s+/g, " ").trim().replace(/(?<=\d)\s*z$/i, "") || null;

const lines = (s: string | undefined) =>
  s?.split("\n").map((l) => l.trim()).join("\n").replace(/\n{3,}/g, "\n\n").trim() || null;

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
  const body = html.slice(Math.max(0, html.search(/<body/i)));
  const noticeHtml = body.match(/style_highlight_data_text">([\s\S]*?)<\/span>/)?.[1];
  const text = toText(noticeHtml ? body.replace(noticeHtml, "") : body);

  const found = Object.entries(LABELS)
    .map(([key, re]) => ({ key, m: text.match(re) }))
    .filter((f) => f.m)
    .map(({ key, m }) => ({ key, start: m!.index!, end: m!.index! + m![0].length }))
    .sort((a, b) => a.start - b.start);
  const s: Partial<Record<keyof typeof LABELS, string>> = {};
  found.forEach((f, i) => {
    s[f.key as keyof typeof LABELS] = text.slice(f.end, found[i + 1]?.start);
  });

  const status = oneLine(s.status);
  const observation = oneLine(s.observation);
  return {
    fetchedAt: fetchedAt.toISOString(),
    sourceUpdated: text.match(/updated\s+(\d[\d:]*\s+[\d/]+)/i)?.[1] ?? null,
    parsed: status !== null,
    raw: status === null ? lines(text)?.slice(0, 1500) ?? null : null,
    status,
    infoLetter: s.info?.match(/\b[A-Z]\b/)?.[0] ?? null,
    infoTime: s.info?.match(/\d{4}/)?.[0] ?? null,
    nextStatusUpdate: oneLine(s.nextUpdate),
    touchAndGo: oneLine(s.touchAndGo),
    closes: oneLine(s.closes),
    runway: s.rwy?.match(/\b\d{2}[LRC]?\b/)?.[0] ?? null,
    circuit: s.rwy?.match(/\b(LH|RH|left|right)\b/i)?.[0].toUpperCase() ?? null,
    qnh: int(s.qnh),
    qfe: int(s.qfe),
    runways: Array.from(
      (s.runways ?? "").matchAll(/(\d{2}[LRC]?\/\d{2}[LRC]?)\s*-([^\n]*)/g),
      (m) => ({ id: m[1], state: oneLine(m[2]) }),
    ),
    briefing: lines(s.briefing),
    observation,
    wx: observation ? parseObservation(observation) : null,
    warnings: lines(s.warnings),
    notice: noticeHtml ? oneLine(toText(noticeHtml)) : null,
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
