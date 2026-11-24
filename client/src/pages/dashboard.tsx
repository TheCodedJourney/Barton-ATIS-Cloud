import { useEffect, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ExternalLink } from "lucide-react";
import type { Atis } from "@shared/atis";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { WindDial, windComponents } from "@/components/wind-dial";

const OFFICIAL = "https://egcbatis.co.uk/";
const LINKS = [
  ["Book Out", "https://www.egcbatis.co.uk/pilotbookout"],
  ["Inbound PPR", "https://www.egcbatis.co.uk/inboundppr"],
  ["Account Portal", "https://egcb.redatlas.co.uk/self-service"],
  ["Visitor Payments", "https://egcb.redatlas.co.uk/self-service/visitor?embedded=true"],
  ["Webcams", "https://webcams.bartonaerodrome.co.uk"],
  ["Official ATIS", OFFICIAL],
] as const;
const STALE_AFTER_S = 90;

type Tone = "good" | "warn" | "bad" | "idle";
const TONE: Record<Tone, string> = {
  good: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  warn: "border-amber-500/50 bg-amber-500/10 text-amber-800 dark:text-amber-300",
  bad: "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300",
  idle: "border-border bg-muted/50 text-muted-foreground",
};
const DOT: Record<Tone, string> = {
  good: "bg-emerald-500", warn: "bg-amber-500", bad: "bg-red-500", idle: "bg-muted-foreground",
};

const statusTone = (s: string | null): Tone =>
  !s ? "idle" : /closed/i.test(s) ? "bad" : /open/i.test(s) ? "good" : "warn";

const surfaceTone = (s: string | null): Tone =>
  !s ? "idle"
    : /not available|closed|unusable/i.test(s) ? "bad"
    : /wet|soft|caution|limited/i.test(s) ? "warn"
    : "good";

const utc = (ms: number) => new Date(ms).toISOString().slice(11, 19) + "z";

function useNow() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

const Label = ({ children }: { children: ReactNode }) => (
  <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{children}</h3>
);

const Card = ({ className, children }: { className?: string; children: ReactNode }) => (
  <section className={cn("rounded-2xl border bg-card p-5 shadow-sm", className)}>{children}</section>
);

function Stat({ label, value, unit, sub }: { label: string; value: ReactNode; unit?: string; sub?: string | null }) {
  return (
    <Card>
      <Label>{label}</Label>
      <p className="mt-2 font-mono text-4xl font-semibold tabular-nums tracking-tight sm:text-5xl">
        {value ?? <span className="text-muted-foreground/50">—</span>}
        {value != null && unit && <span className="ml-1 text-base font-medium text-muted-foreground">{unit}</span>}
      </p>
      <p className="mt-1 h-5 text-sm text-muted-foreground">{sub}</p>
    </Card>
  );
}

function Wind({ atis }: { atis: Atis }) {
  const { wx, runway, observation } = atis;
  const c = wx && wx.windDir !== null && runway ? windComponents(wx.windDir, wx.windSpeed, runway) : null;
  return (
    <Card className="lg:col-span-2">
      <Label>Wind &amp; weather · unofficial observation</Label>
      {wx ? (
        <div className="mt-3 flex flex-col items-center gap-5 sm:flex-row">
          <WindDial windDir={wx.windDir} runway={runway} />
          <div className="w-full space-y-3">
            <p className="font-mono text-4xl font-semibold tabular-nums">
              {wx.windDir === null ? "VRB" : `${String(wx.windDir).padStart(3, "0")}°`}
              <span className="text-muted-foreground"> / </span>
              {wx.windSpeed}
              {wx.windGust && <span className="text-amber-600 dark:text-amber-400">G{wx.windGust}</span>}
              <span className="ml-1 text-base font-medium text-muted-foreground">kt</span>
            </p>
            {c && (
              <p className="text-sm text-muted-foreground">
                Runway {runway}: about{" "}
                <b className="text-foreground">{Math.abs(c.head)} kt {c.head < 0 ? "tailwind" : "headwind"}</b>,{" "}
                <b className="text-foreground">{Math.abs(c.cross)} kt crosswind</b>
                {c.cross !== 0 && ` from the ${c.cross > 0 ? "right" : "left"}`}
              </p>
            )}
            <dl className="grid grid-cols-3 gap-2 text-sm">
              {[
                ["Temp / dew", wx.temperature === null ? null : `${wx.temperature}° / ${wx.dewpoint}°`],
                ["Visibility", wx.visibility === "9999" ? "10 km+" : wx.visibility && /^\d+$/.test(wx.visibility) ? `${Number(wx.visibility)} m` : wx.visibility],
                ["Cloud", wx.cloud.join(" ") || null],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-muted/60 px-3 py-2">
                  <dt className="text-xs text-muted-foreground">{k}</dt>
                  <dd className="font-mono font-medium">{v ?? "—"}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          {observation ? "Couldn't read the wind from this observation:" : "No observation published right now."}
        </p>
      )}
      {observation && <p className="mt-4 break-words rounded-xl bg-muted/60 px-3 py-2 font-mono text-sm">{observation}</p>}
    </Card>
  );
}

function Station({ now }: { now: number }) {
  // The station images are rewritten upstream about once a minute.
  const img = (id: string) => `https://egcbatis.co.uk/data/graphs/${id}.jpg?t=${Math.floor(now / 60000)}`;
  return (
    <Card>
      <Label>Live weather station · updates every minute, even when closed</Label>
      <div className="mt-3 flex flex-wrap items-start gap-2">
        {["vws1324", "vws1376"].map((id) => (
          <img key={id} src={img(id)} width={300} height={230} loading="lazy" alt="Weather station wind graph" className="h-auto max-w-full rounded-lg" />
        ))}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-1">
          {["vws1004", "vws1003", "vws1005", "vws1011"].map((id) => (
            <img key={id} src={img(id)} width={178} height={54} loading="lazy" alt="Weather station reading" className="h-auto max-w-full rounded-lg" />
          ))}
        </div>
      </div>
    </Card>
  );
}

function Board({ atis, now }: { atis: Atis; now: number }) {
  const tone = statusTone(atis.status);
  return (
    <>
      <section className={cn("flex items-center justify-between gap-4 rounded-3xl border p-5 sm:p-7", TONE[tone])}>
        <div className="min-w-0">
          <Label>Airfield status</Label>
          <div className="mt-1 flex items-center gap-3">
            <span className={cn("h-3.5 w-3.5 shrink-0 rounded-full", DOT[tone], tone === "good" && "animate-pulse")} />
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl" data-testid="text-status">{atis.status ?? "Unknown"}</h2>
          </div>
          <p className="mt-2 text-sm text-foreground/70">
            {[
              atis.closes && `Closes ${atis.closes}${/^\d{4}$/.test(atis.closes) ? "z" : ""}`,
              atis.nextStatusUpdate && `Next status update: ${atis.nextStatusUpdate}`,
            ].filter(Boolean).join(" · ") || "All times UTC"}
          </p>
        </div>
        <div className="text-center">
          <Label>Info</Label>
          <div className="mt-1 grid h-16 w-16 place-items-center rounded-2xl border bg-background/70 font-mono text-4xl font-bold text-foreground sm:h-20 sm:w-20 sm:text-5xl">
            {atis.infoLetter ?? "–"}
          </div>
          <p className="mt-1 h-5 font-mono text-sm text-foreground/70">{atis.infoTime && `${atis.infoTime}z`}</p>
        </div>
      </section>

      {!atis.parsed && (
        <Card className={TONE.warn}>
          <p className="flex items-center gap-2 font-semibold"><AlertTriangle className="h-4 w-4" /> The official page changed and couldn't be read properly</p>
          <pre className="mt-2 whitespace-pre-wrap font-sans text-sm text-foreground">{atis.raw}</pre>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Runway in use" value={atis.runway} sub={atis.circuit && `${atis.circuit} circuit`} />
        <Stat label="Manchester QNH" value={atis.qnh} unit="hPa" />
        <Stat label="Barton QFE" value={atis.qfe} unit="hPa" />
        <Stat label="Airfield closes" value={atis.closes} unit={atis.closes && /^\d{4}$/.test(atis.closes) ? "z" : undefined} sub={atis.sunset && `Sunset ${atis.sunset}${/^\d{4}$/.test(atis.sunset) ? "z" : ""}`} />
      </div>

      {atis.warnings && (
        <Card className={TONE.warn}>
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em]"><AlertTriangle className="h-4 w-4" /> Met warnings</p>
          <p className="mt-2 whitespace-pre-line font-medium text-foreground">{atis.warnings}</p>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Wind atis={atis} />
        <Card>
          <Label>Runway surfaces</Label>
          <ul className="mt-3 space-y-2">
            {atis.runways.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3">
                <span className="font-mono font-semibold">{r.id}</span>
                <span className={cn("rounded-full border px-3 py-0.5 text-sm font-medium", TONE[surfaceTone(r.state)])}>{r.state ?? "—"}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t pt-3">
            <Label>Touch and go's</Label>
            <p className="mt-1 font-medium">{atis.touchAndGo ?? "—"}</p>
          </div>
        </Card>
      </div>

      {atis.briefing && (
        <Card>
          <Label>Briefing</Label>
          <p className="mt-2 whitespace-pre-line leading-relaxed">{atis.briefing}</p>
        </Card>
      )}

      {atis.notice && <p className="rounded-2xl border border-dashed px-5 py-3 text-sm text-muted-foreground">{atis.notice}</p>}

      <Station now={now} />
    </>
  );
}

export default function Dashboard() {
  const now = useNow();
  const { data, isError } = useQuery<Atis>({
    queryKey: ["/api/atis"],
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    staleTime: 0,
    retry: 1,
  });
  const fetched = data ? Date.parse(data.fetchedAt) : null;
  const age = fetched === null ? null : Math.max(0, Math.round((now - fetched) / 1000));
  const stale = isError || (age !== null && age > STALE_AFTER_S);

  return (
    <div className="min-h-screen bg-background bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.13),transparent_55%)]">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-2">
            <Logo className="h-8 w-8" />
            <div className="leading-tight">
              <h1 className="font-bold tracking-tight">Windsock</h1>
              <p className="text-[11px] text-muted-foreground">Barton ATIS<span className="hidden sm:inline">, the friendly way</span> · EGCB</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <time className="hidden font-mono text-sm tabular-nums sm:block">{utc(now)}</time>
            <span
              role="status"
              className={cn("flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium tabular-nums", TONE[stale ? "warn" : age === null ? "idle" : "good"])}
              data-testid="text-freshness"
            >
              <span className={cn("h-2 w-2 rounded-full", DOT[stale ? "warn" : age === null ? "idle" : "good"])} />
              {age === null ? (isError ? "Offline" : "Connecting…") : stale ? `Stale · ${utc(fetched!)}` : `Live · ${age}s ago`}
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-4 px-4 py-5">
        {stale && (
          <div className={cn("flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm font-medium", TONE.warn)} role="alert">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Can't reach the Barton ATIS right now.{" "}
              {fetched ? `What you see below was read at ${utc(fetched)} and may be out of date. ` : ""}
              <a className="underline" href={OFFICIAL} target="_blank" rel="noreferrer">Check the official ATIS</a>.
            </p>
          </div>
        )}

        {data ? <Board atis={data} now={now} /> : !isError && (
          <>
            <Skeleton className="h-36 rounded-3xl" />
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
            </div>
          </>
        )}

        <nav className="flex flex-wrap gap-2" aria-label="Barton links">
          {LINKS.map(([label, href]) => (
            <a key={label} href={href} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-full border bg-card px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-muted">
              {label} <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            </a>
          ))}
        </nav>

        <footer className="pb-6 pt-2 text-xs leading-relaxed text-muted-foreground">
          Unofficial and not affiliated with City Airport Ltd. Read from{" "}
          <a className="underline" href={OFFICIAL} target="_blank" rel="noreferrer">egcbatis.co.uk</a> every 30 seconds
          {data?.sourceUpdated && ` (source last updated ${data.sourceUpdated}z)`}. Always confirm with the official ATIS and Barton Information before you fly.
        </footer>
      </main>
    </div>
  );
}
