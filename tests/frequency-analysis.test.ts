import { describe, it, expect } from "vitest";
import { analyzeFrequency, analyzeBonusFrequency } from "../lib/frequency-analysis.js";
import { LOTTO_DRAWS, POWERBALL_DRAWS, MOCK_LOTTO_CONFIG, MOCK_POWERBALL_CONFIG } from "./test-fixtures.js";

describe("analyzeFrequency", () => {
  it("counts main number appearances correctly", () => {
    const freq = analyzeFrequency(LOTTO_DRAWS, MOCK_LOTTO_CONFIG);

    // Number 7 appears in 8 draws
    expect(freq[7].count).toBe(8);
    // Number 42 appears in 7 draws
    expect(freq[42].count).toBe(7);
    // Number 50 appears in 1 draw
    expect(freq[50].count).toBe(1);
    // Number 54 never appears
    expect(freq[54].count).toBe(0);
  });

  it("calculates percentages correctly", () => {
    const freq = analyzeFrequency(LOTTO_DRAWS, MOCK_LOTTO_CONFIG);
    // 8 out of 20 draws = 40%
    expect(freq[7].percentage).toBeCloseTo(40, 0);
  });

  it("respects window size", () => {
    const freq = analyzeFrequency(LOTTO_DRAWS, MOCK_LOTTO_CONFIG, 5);
    // Only looking at last 5 draws — number 7 appears once (draw index 14: [1,7,23,32,42,45])
    // Last 5: indices 15-19
    // 15: [4,9,17,28,36,44] - no 7
    // 16: [6,13,20,27,35,47] - no 7
    // 17: [3,10,22,31,39,51] - no 7
    // 18: [2,11,15,24,33,46] - no 7
    // 19: [8,14,21,29,40,48] - no 7
    expect(freq[7].count).toBe(0);
  });

  it("includes all numbers in the pool range", () => {
    const freq = analyzeFrequency(LOTTO_DRAWS, MOCK_LOTTO_CONFIG);
    for (let n = 1; n <= 54; n++) {
      expect(freq[n]).toBeDefined();
      expect(freq[n].count).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("analyzeBonusFrequency", () => {
  it("counts bonus number appearances", () => {
    const freq = analyzeBonusFrequency(POWERBALL_DRAWS, MOCK_POWERBALL_CONFIG);
    // Powerball 7 appears 4 times
    expect(freq[7].count).toBe(4);
    // Powerball 15 appears 1 time
    expect(freq[15].count).toBe(1);
  });

  it("returns empty for games without bonus pool", () => {
    const freq = analyzeBonusFrequency(LOTTO_DRAWS, MOCK_LOTTO_CONFIG);
    expect(Object.keys(freq)).toHaveLength(0);
  });
});
