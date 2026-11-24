import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseAtis, parseObservation } from "../api/atis";

const fixture = (name: string) =>
  parseAtis(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8"));

test("open airfield (egcbatis.co.uk, 24 Nov 2026)", () => {
  const a = fixture("open.html");
  assert.equal(a.parsed, true);
  assert.equal(a.status, "Airfield Open");
  assert.equal(a.infoLetter, "J");
  assert.equal(a.infoTime, "1230");
  assert.equal(a.runway, "08L");
  assert.equal(a.circuit, "LH");
  assert.equal(a.qnh, 1014);
  assert.equal(a.qfe, 1012);
  assert.equal(a.closes, "1600");
  assert.equal(a.sunset, "1600");
  assert.equal(a.touchAndGo, "Permitted");
  assert.equal(a.nextStatusUpdate, "Next Day");
  assert.equal(a.sourceUpdated, "24/11/26 13:00:25");
  assert.deepEqual(a.runways, [
    { id: "08L/26R", state: "Firm / Wet" },
    { id: "08R/26L", state: "Firm / Wet" },
    { id: "02/20", state: "Soft / Wet" },
    { id: "13/31", state: "Firm / Wet" },
  ]);
  assert.match(a.briefing!, /^Taxiways\nTAXIWAY BRAVO CLOSED .* NOTAM L7392\/26 Refers\n/);
  assert.match(a.briefing!, /B2 & B3/);
  assert.equal(a.observation, "EGCB 241230Z 11007KT 8000 BKN025 07/05 Q1014");
  assert.deepEqual(a.wx, {
    windDir: 110, windSpeed: 7, windGust: null, visibility: "8000",
    temperature: 7, dewpoint: 5, cloud: ["BKN025"],
  });
  assert.match(a.warnings!, /^STRONG WINDS SE WINDS/);
  assert.equal(a.warnings!.split("\n").length, 4);
  assert.match(a.notice!, /^Please book out at least 15 minutes .* 0161 789 1362\.$/);
});

// shortcut: no real closed-state copy of the new site exists yet; replace with one when captured.
test("no information letter (closed-style info block)", () => {
  const html = readFileSync(new URL("./fixtures/open.html", import.meta.url), "utf8")
    .replace(/<span[^>]*>J<\/span>.*?<span[^>]*>12:30<\/span>/s, "")
    .replaceAll("Airfield Open", "Airfield Closed");
  const a = parseAtis(html);
  assert.equal(a.status, "Airfield Closed");
  assert.equal(a.infoLetter, null);
  assert.equal(a.infoTime, null);
});

test("unrecognised page is flagged, not guessed", () => {
  const a = parseAtis("<html><body><p>Delayed opening, call ops</p></body></html>");
  assert.equal(a.parsed, false);
  assert.equal(a.raw, "Delayed opening, call ops");
});

test("observation: gusts, variable wind, negative temps", () => {
  assert.deepEqual(parseObservation("EGCB 161420Z 27015G28KT CAVOK M01/M03 Q0998"), {
    windDir: 270, windSpeed: 15, windGust: 28, visibility: "CAVOK",
    temperature: -1, dewpoint: -3, cloud: [],
  });
  assert.equal(parseObservation("VRB03KT 8000 FEW012")!.windDir, null);
  assert.equal(parseObservation("calm and sunny"), null);
});
