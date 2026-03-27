import type { DrawResult, GameConfig, PairPattern, PositionalPattern } from "./types.js";

export function analyzePairs(
  draws: DrawResult[],
  _config: GameConfig,
  minOccurrences: number = 3
): PairPattern[] {
  const pairCounts: Map<string, { count: number; lastSeen: Date }> = new Map();

  for (const draw of draws) {
    const nums = draw.mainNumbers;
    for (let i = 0; i < nums.length; i++) {
      for (let j = i + 1; j < nums.length; j++) {
        const key = `${nums[i]}-${nums[j]}`;
        const existing = pairCounts.get(key);
        if (existing) {
          existing.count++;
          existing.lastSeen = draw.date;
        } else {
          pairCounts.set(key, { count: 1, lastSeen: draw.date });
        }
      }
    }
  }

  const patterns: PairPattern[] = [];
  for (const [key, data] of pairCounts) {
    if (data.count >= minOccurrences) {
      const [a, b] = key.split("-").map(Number);
      patterns.push({
        pair: [a, b],
        occurrences: data.count,
        lastSeen: data.lastSeen,
      });
    }
  }

  return patterns.sort((a, b) => b.occurrences - a.occurrences);
}

export function analyzePositional(
  draws: DrawResult[],
  config: GameConfig,
  topN: number = 5
): PositionalPattern[] {
  const positionCounts: Array<Map<number, number>> = [];
  for (let i = 0; i < config.mainPool.count; i++) {
    positionCounts.push(new Map());
  }

  for (const draw of draws) {
    const sorted = [...draw.mainNumbers].sort((a, b) => a - b);
    for (let i = 0; i < sorted.length && i < config.mainPool.count; i++) {
      const num = sorted[i];
      positionCounts[i].set(num, (positionCounts[i].get(num) ?? 0) + 1);
    }
  }

  return positionCounts.map((countMap, position) => {
    const entries = Array.from(countMap.entries())
      .map(([number, count]) => ({ number, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, topN);

    return { position: position + 1, mostFrequent: entries };
  });
}
