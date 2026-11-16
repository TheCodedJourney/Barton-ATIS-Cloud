import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseAtis, parseObservation } from "../api/atis";

const fixture = (name: string) =>
  parseAtis(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "latin1"));

test("open airfield (archived 2022 layout)", () => {
  const a = fixture("open.html");
  assert.equal(a.parsed, true);
  assert.equal(a.status, "Airfield Open");
  assert.equal(a.infoLetter, "C");
  assert.equal(a.infoTime, "1005");
  assert.equal(a.runway, "26R");
  assert.equal(a.circuit, "RH");
  assert.equal(a.qnh, 1021);
  assert.equal(a.qfe, 1019);
  assert.equal(a.closes, "1705");
  assert.equal(a.touchAndGo, "One take-off/landing per detail");
  assert.equal(a.nextStatusUpdate, "Next Day");
  assert.equal(a.sourceUpdated, "10:04:15 08/02/22");
  assert.deepEqual(a.runways, [
    { id: "08L/26R", state: "Soft / Wet" },
    { id: "08R/26L", state: "Soft / Wet" },
    { id: "02/20", state: "Not available" },
    { id: "14/32", state: "Not available" },
  ]);
  assert.match(a.briefing!, /^\*\*Pilot Report/);
  assert.match(a.briefing!, /\n/);
  assert.equal(a.observation, "EGCB 081005Z 23017KT 9999 SCT020 BKN030 12/09 Q1021");
  assert.deepEqual(a.wx, {
    windDir: 230, windSpeed: 17, windGust: null, visibility: "9999",
    temperature: 12, dewpoint: 9, cloud: ["SCT020", "BKN030"],
  });
  assert.match(a.warnings!, /^SW WINDS/);
  assert.match(a.notice!, /^All flights must be booked out/);
});

test("closed airfield (current layout, empty fields)", () => {
  const a = fixture("closed.html");
  assert.equal(a.parsed, true);
  assert.equal(a.status, "Airfield Closed");
  for (const k of ["infoLetter", "infoTime", "runway", "circuit", "qnh", "qfe", "closes",
    "touchAndGo", "nextStatusUpdate", "briefing", "observation", "wx", "warnings"] as const) {
    assert.equal(a[k], null, k);
  }
  assert.deepEqual(a.runways.map((r) => r.id), ["08L/26R", "08R/26L", "02/20", "13/31"]);
  assert.ok(a.runways.every((r) => r.state === null));
  assert.match(a.notice!, /0161 789 1362\.$/);
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
