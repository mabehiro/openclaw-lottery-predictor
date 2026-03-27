import { describe, it, expect } from "vitest";
import { analyzeGaps } from "../lib/gap-analysis.js";
import { LOTTO_DRAWS, MOCK_LOTTO_CONFIG } from "./test-fixtures.js";

describe("analyzeGaps", () => {
  it("identifies overdue numbers (>1.5x average gap)", () => {
    const result = analyzeGaps(LOTTO_DRAWS, MOCK_LOTTO_CONFIG);
    // All overdue entries should have overdueRatio > 1.5
    for (const entry of result.overdue) {
      expect(entry.overdueRatio).toBeGreaterThan(1.5);
    }
  });

  it("sorts overdue by ratio descending", () => {
    const result = analyzeGaps(LOTTO_DRAWS, MOCK_LOTTO_CONFIG);
    for (let i = 1; i < result.overdue.length; i++) {
      expect(result.overdue[i - 1].overdueRatio).toBeGreaterThanOrEqual(
        result.overdue[i].overdueRatio
      );
    }
  });

  it("numbers that never appeared are not in overdue list (ratio = 1.0)", () => {
    // Numbers that never appeared have averageGap = totalDraws and
    // drawsSinceLastSeen = totalDraws, so overdueRatio = 1.0 (not > 1.5)
    const result = analyzeGaps(LOTTO_DRAWS, MOCK_LOTTO_CONFIG);
    const entry54 = result.overdue.find((e) => e.number === 54);
    // overdueRatio = 20/20 = 1.0, which is below the 1.5 threshold
    expect(entry54).toBeUndefined();
  });

  it("recently seen numbers are not overdue", () => {
    const result = analyzeGaps(LOTTO_DRAWS, MOCK_LOTTO_CONFIG);
    const overdueNumbers = new Set(result.overdue.map((e) => e.number));
    // Number 48 appears in the last draw (index 19), should NOT be overdue
    expect(overdueNumbers.has(48)).toBe(false);
  });

  it("handles empty draws", () => {
    const result = analyzeGaps([], MOCK_LOTTO_CONFIG);
    expect(result.overdue).toHaveLength(0);
  });
});
