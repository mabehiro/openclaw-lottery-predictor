import { describe, it, expect } from "vitest";
import { analyzeHotCold } from "../lib/hot-cold-analysis.js";
import { LOTTO_DRAWS, MOCK_LOTTO_CONFIG } from "./test-fixtures.js";

describe("analyzeHotCold", () => {
  it("identifies hot numbers (>1 stddev above mean)", () => {
    const result = analyzeHotCold(LOTTO_DRAWS, MOCK_LOTTO_CONFIG);

    const hotNumbers = result.hot.map((h) => h.number);
    // Numbers 7 (8x) and 42 (7x) should be hot given mean ~2.2
    expect(hotNumbers).toContain(7);
    expect(hotNumbers).toContain(42);
  });

  it("hot numbers have positive deviation", () => {
    const result = analyzeHotCold(LOTTO_DRAWS, MOCK_LOTTO_CONFIG);
    for (const h of result.hot) {
      expect(h.deviation).toBeGreaterThan(1);
    }
  });

  it("cold numbers have negative deviation", () => {
    const result = analyzeHotCold(LOTTO_DRAWS, MOCK_LOTTO_CONFIG);
    for (const c of result.cold) {
      expect(c.deviation).toBeLessThan(-1);
    }
  });

  it("returns empty lists when all numbers have equal frequency", () => {
    // Create draws where every number appears exactly once
    const uniformDraws = [
      {
        date: new Date("2024-01-01"),
        mainNumbers: [1, 2, 3, 4, 5, 6],
      },
    ];
    const config = { ...MOCK_LOTTO_CONFIG, mainPool: { count: 6, min: 1, max: 6 } };
    const result = analyzeHotCold(uniformDraws, config);
    expect(result.hot).toHaveLength(0);
    expect(result.cold).toHaveLength(0);
  });
});
