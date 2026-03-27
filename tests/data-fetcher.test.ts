import { describe, it, expect } from "vitest";
import { parseCsvRows, parseDrawResults } from "../lib/data-fetcher.js";
import { GAME_CONFIGS } from "../lib/game-configs.js";

const SAMPLE_LOTTO_CSV = `Game Name,Month,Day,Year,Num1,Num2,Num3,Num4,Num5,Num6
Lotto Texas,1,6,2024,3,7,15,22,42,48
Lotto Texas,1,10,2024,1,10,25,33,42,51
Lotto Texas,12,31,2023,5,14,21,28,35,47`;

const SAMPLE_POWERBALL_CSV = `Game Name,Month,Day,Year,Num1,Num2,Num3,Num4,Num5,PB
Powerball,1,6,2024,5,12,33,45,62,7
Powerball,1,10,2024,3,18,27,45,58,15`;

const SAMPLE_MEGA_CSV = `Game Name,Month,Day,Year,Num1,Num2,Num3,Num4,Num5,MB
Mega Millions,1,5,2024,10,22,33,50,62,7
Mega Millions,1,9,2024,1,15,28,41,55,22`;

describe("parseCsvRows", () => {
  it("splits CSV into rows and columns", () => {
    const rows = parseCsvRows(SAMPLE_LOTTO_CSV);
    expect(rows.length).toBe(4); // header + 3 data rows
    expect(rows[1][0]).toBe("Lotto Texas");
  });

  it("handles empty lines", () => {
    const rows = parseCsvRows("a,b\n\nc,d\n\n");
    expect(rows).toHaveLength(2);
  });
});

describe("parseDrawResults — Lotto Texas", () => {
  it("parses Lotto Texas CSV rows correctly", () => {
    const rows = parseCsvRows(SAMPLE_LOTTO_CSV);
    const draws = parseDrawResults(rows, GAME_CONFIGS["lotto-texas"].parseRow);

    expect(draws).toHaveLength(3);
    // Should be sorted by date ascending
    expect(draws[0].date.getFullYear()).toBe(2023);
    expect(draws[1].date.getMonth()).toBe(0); // January
    expect(draws[1].date.getDate()).toBe(6);
  });

  it("parses main numbers correctly", () => {
    const rows = parseCsvRows(SAMPLE_LOTTO_CSV);
    const draws = parseDrawResults(rows, GAME_CONFIGS["lotto-texas"].parseRow);

    // First draw (after sort): Dec 31 2023
    expect(draws[0].mainNumbers).toEqual([5, 14, 21, 28, 35, 47]);
    expect(draws[0].bonusNumber).toBeUndefined();
  });

  it("skips header row", () => {
    const rows = parseCsvRows(SAMPLE_LOTTO_CSV);
    const draws = parseDrawResults(rows, GAME_CONFIGS["lotto-texas"].parseRow);
    // Header says "Game Name" not "Lotto Texas", so it's skipped
    expect(draws).toHaveLength(3);
  });
});

describe("parseDrawResults — Powerball", () => {
  it("parses Powerball with bonus number", () => {
    const rows = parseCsvRows(SAMPLE_POWERBALL_CSV);
    const draws = parseDrawResults(rows, GAME_CONFIGS["powerball"].parseRow);

    expect(draws).toHaveLength(2);
    expect(draws[0].mainNumbers).toHaveLength(5);
    expect(draws[0].bonusNumber).toBe(7);
    expect(draws[1].bonusNumber).toBe(15);
  });
});

describe("parseDrawResults — Mega Millions", () => {
  it("parses Mega Millions with Mega Ball", () => {
    const rows = parseCsvRows(SAMPLE_MEGA_CSV);
    const draws = parseDrawResults(rows, GAME_CONFIGS["mega-millions"].parseRow);

    expect(draws).toHaveLength(2);
    expect(draws[0].mainNumbers).toHaveLength(5);
    expect(draws[0].bonusNumber).toBe(7);
  });
});

describe("malformed data handling", () => {
  it("skips rows with wrong game name", () => {
    const rows = parseCsvRows("Other Game,1,1,2024,1,2,3,4,5,6");
    const draws = parseDrawResults(rows, GAME_CONFIGS["lotto-texas"].parseRow);
    expect(draws).toHaveLength(0);
  });

  it("skips rows with too few columns", () => {
    const rows = parseCsvRows("Lotto Texas,1,1,2024,1,2");
    const draws = parseDrawResults(rows, GAME_CONFIGS["lotto-texas"].parseRow);
    expect(draws).toHaveLength(0);
  });

  it("skips rows with non-numeric values", () => {
    const rows = parseCsvRows("Lotto Texas,1,1,2024,a,b,c,d,e,f");
    const draws = parseDrawResults(rows, GAME_CONFIGS["lotto-texas"].parseRow);
    expect(draws).toHaveLength(0);
  });
});
