import type { DrawResult, GameConfig, FrequencyMap } from "./types.js";

export function analyzeFrequency(
  draws: DrawResult[],
  config: GameConfig,
  windowSize?: number
): FrequencyMap {
  const targetDraws = windowSize ? draws.slice(-windowSize) : draws;
  const totalDraws = targetDraws.length;
  const counts: Record<number, number> = {};

  for (let n = config.mainPool.min; n <= config.mainPool.max; n++) {
    counts[n] = 0;
  }

  for (const draw of targetDraws) {
    for (const num of draw.mainNumbers) {
      counts[num] = (counts[num] ?? 0) + 1;
    }
  }

  const frequency: FrequencyMap = {};
  for (const [numStr, count] of Object.entries(counts)) {
    const num = parseInt(numStr);
    frequency[num] = {
      count,
      percentage: totalDraws > 0 ? (count / totalDraws) * 100 : 0,
    };
  }

  return frequency;
}

export function analyzeBonusFrequency(
  draws: DrawResult[],
  config: GameConfig,
  windowSize?: number
): FrequencyMap {
  if (!config.bonusPool) return {};

  const targetDraws = windowSize ? draws.slice(-windowSize) : draws;
  const totalDraws = targetDraws.length;
  const counts: Record<number, number> = {};

  for (let n = config.bonusPool.min; n <= config.bonusPool.max; n++) {
    counts[n] = 0;
  }

  for (const draw of targetDraws) {
    if (draw.bonusNumber != null) {
      counts[draw.bonusNumber] = (counts[draw.bonusNumber] ?? 0) + 1;
    }
  }

  const frequency: FrequencyMap = {};
  for (const [numStr, count] of Object.entries(counts)) {
    const num = parseInt(numStr);
    frequency[num] = {
      count,
      percentage: totalDraws > 0 ? (count / totalDraws) * 100 : 0,
    };
  }

  return frequency;
}
