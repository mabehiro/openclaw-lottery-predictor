import { describe, it, expect } from "vitest";
import { generatePredictions } from "../lib/prediction-engine.js";
import { DISCLAIMER } from "../lib/types.js";
import {
  LOTTO_DRAWS,
  POWERBALL_DRAWS,
  MOCK_LOTTO_CONFIG,
  MOCK_POWERBALL_CONFIG,
} from "./test-fixtures.js";

describe("generatePredictions", () => {
  it("generates the requested number of sets", () => {
    const result = generatePredictions(LOTTO_DRAWS, MOCK_LOTTO_CONFIG, 5);
    expect(result.sets).toHaveLength(5);
  });

  it("each set has correct number of main numbers for Lotto Texas", () => {
    const result = generatePredictions(LOTTO_DRAWS, MOCK_LOTTO_CONFIG, 3);
    for (const set of result.sets) {
      expect(set.mainNumbers).toHaveLength(6);
    }
  });

  it("main numbers are within pool range", () => {
    const result = generatePredictions(LOTTO_DRAWS, MOCK_LOTTO_CONFIG, 3);
    for (const set of result.sets) {
      for (const num of set.mainNumbers) {
        expect(num).toBeGreaterThanOrEqual(1);
        expect(num).toBeLessThanOrEqual(54);
      }
    }
  });

  it("main numbers are sorted ascending", () => {
    const result = generatePredictions(LOTTO_DRAWS, MOCK_LOTTO_CONFIG, 3);
    for (const set of result.sets) {
      for (let i = 1; i < set.mainNumbers.length; i++) {
        expect(set.mainNumbers[i]).toBeGreaterThan(set.mainNumbers[i - 1]);
      }
    }
  });

  it("no duplicate numbers within a set", () => {
    const result = generatePredictions(LOTTO_DRAWS, MOCK_LOTTO_CONFIG, 5);
    for (const set of result.sets) {
      const unique = new Set(set.mainNumbers);
      expect(unique.size).toBe(set.mainNumbers.length);
    }
  });

  it("includes bonus number for Powerball", () => {
    const result = generatePredictions(POWERBALL_DRAWS, MOCK_POWERBALL_CONFIG, 3);
    for (const set of result.sets) {
      expect(set.mainNumbers).toHaveLength(5);
      expect(set.bonusNumber).toBeDefined();
      expect(set.bonusNumber!).toBeGreaterThanOrEqual(1);
      expect(set.bonusNumber!).toBeLessThanOrEqual(26);
    }
  });

  it("does not include bonus number for Lotto Texas", () => {
    const result = generatePredictions(LOTTO_DRAWS, MOCK_LOTTO_CONFIG, 3);
    for (const set of result.sets) {
      expect(set.bonusNumber).toBeUndefined();
    }
  });

  it("always includes the disclaimer", () => {
    const result = generatePredictions(LOTTO_DRAWS, MOCK_LOTTO_CONFIG);
    expect(result.disclaimer).toBe(DISCLAIMER);
  });

  it("each set has a strategy and reasoning", () => {
    const result = generatePredictions(LOTTO_DRAWS, MOCK_LOTTO_CONFIG, 3);
    for (const set of result.sets) {
      expect(set.strategy).toBeTruthy();
      expect(set.reasoning).toBeTruthy();
    }
  });

  it("respects a specific strategy when provided", () => {
    const result = generatePredictions(
      LOTTO_DRAWS,
      MOCK_LOTTO_CONFIG,
      3,
      "hot-streak"
    );
    for (const set of result.sets) {
      expect(set.strategy).toBe("hot-streak");
    }
  });

  it("records analysis metadata", () => {
    const result = generatePredictions(LOTTO_DRAWS, MOCK_LOTTO_CONFIG);
    expect(result.game).toBe("lotto-texas");
    expect(result.basedOnDraws).toBe(20);
    expect(result.analysisDate).toBeInstanceOf(Date);
  });
});
