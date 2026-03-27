import { describe, it, expect } from "vitest";
import { analyzePairs, analyzePositional } from "../lib/pattern-analysis.js";
import { LOTTO_DRAWS, MOCK_LOTTO_CONFIG } from "./test-fixtures.js";

describe("analyzePairs", () => {
  it("detects frequently co-occurring pairs", () => {
    const pairs = analyzePairs(LOTTO_DRAWS, MOCK_LOTTO_CONFIG, 3);
    // Pair (7, 42) appears in 4 draws
    const pair7_42 = pairs.find(
      (p) => p.pair[0] === 7 && p.pair[1] === 42
    );
    expect(pair7_42).toBeDefined();
    expect(pair7_42!.occurrences).toBe(6);
  });

  it("sorts pairs by occurrences descending", () => {
    const pairs = analyzePairs(LOTTO_DRAWS, MOCK_LOTTO_CONFIG, 2);
    for (let i = 1; i < pairs.length; i++) {
      expect(pairs[i - 1].occurrences).toBeGreaterThanOrEqual(
        pairs[i].occurrences
      );
    }
  });

  it("filters by minimum occurrences", () => {
    const pairs = analyzePairs(LOTTO_DRAWS, MOCK_LOTTO_CONFIG, 5);
    for (const p of pairs) {
      expect(p.occurrences).toBeGreaterThanOrEqual(5);
    }
  });

  it("pairs have correct last seen dates", () => {
    const pairs = analyzePairs(LOTTO_DRAWS, MOCK_LOTTO_CONFIG, 3);
    for (const p of pairs) {
      expect(p.lastSeen).toBeInstanceOf(Date);
    }
  });
});

describe("analyzePositional", () => {
  it("returns patterns for each position", () => {
    const patterns = analyzePositional(LOTTO_DRAWS, MOCK_LOTTO_CONFIG);
    expect(patterns).toHaveLength(6); // 6 positions for Lotto Texas
  });

  it("positions are 1-indexed", () => {
    const patterns = analyzePositional(LOTTO_DRAWS, MOCK_LOTTO_CONFIG);
    expect(patterns[0].position).toBe(1);
    expect(patterns[5].position).toBe(6);
  });

  it("returns top N most frequent per position", () => {
    const patterns = analyzePositional(LOTTO_DRAWS, MOCK_LOTTO_CONFIG, 3);
    for (const pos of patterns) {
      expect(pos.mostFrequent.length).toBeLessThanOrEqual(3);
      // Sorted by count descending
      for (let i = 1; i < pos.mostFrequent.length; i++) {
        expect(pos.mostFrequent[i - 1].count).toBeGreaterThanOrEqual(
          pos.mostFrequent[i].count
        );
      }
    }
  });
});
