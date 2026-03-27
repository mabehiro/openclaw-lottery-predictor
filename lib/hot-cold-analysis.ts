import type { DrawResult, GameConfig, HotColdResult } from "./types.js";
import { analyzeFrequency, analyzeBonusFrequency } from "./frequency-analysis.js";

function computeHotCold(
  frequencyMap: Record<number, { count: number; percentage: number }>,
  topN: number = 10
): HotColdResult {
  const entries = Object.entries(frequencyMap).map(([numStr, data]) => ({
    number: parseInt(numStr),
    count: data.count,
  }));

  if (entries.length === 0) return { hot: [], cold: [] };

  const mean = entries.reduce((sum, e) => sum + e.count, 0) / entries.length;
  const variance =
    entries.reduce((sum, e) => sum + Math.pow(e.count - mean, 2), 0) /
    entries.length;
  const stddev = Math.sqrt(variance);

  if (stddev === 0) return { hot: [], cold: [] };

  const withDeviation = entries.map((e) => ({
    ...e,
    deviation: (e.count - mean) / stddev,
  }));

  const hot = withDeviation
    .filter((e) => e.deviation > 1)
    .sort((a, b) => b.deviation - a.deviation)
    .slice(0, topN);

  const cold = withDeviation
    .filter((e) => e.deviation < -1)
    .sort((a, b) => a.deviation - b.deviation)
    .slice(0, topN);

  return { hot, cold };
}

export function analyzeHotCold(
  draws: DrawResult[],
  config: GameConfig,
  windowSize?: number
): HotColdResult {
  const freq = analyzeFrequency(draws, config, windowSize);
  return computeHotCold(freq);
}

export function analyzeBonusHotCold(
  draws: DrawResult[],
  config: GameConfig,
  windowSize?: number
): HotColdResult {
  if (!config.bonusPool) return { hot: [], cold: [] };
  const freq = analyzeBonusFrequency(draws, config, windowSize);
  return computeHotCold(freq);
}
