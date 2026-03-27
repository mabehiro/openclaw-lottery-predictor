import type { DrawResult, GameConfig, GapResult, GapEntry } from "./types.js";

export function analyzeGaps(
  draws: DrawResult[],
  config: GameConfig
): GapResult {
  const totalDraws = draws.length;
  if (totalDraws === 0) return { overdue: [] };

  const lastSeen: Record<number, number> = {};
  const gaps: Record<number, number[]> = {};

  for (let n = config.mainPool.min; n <= config.mainPool.max; n++) {
    lastSeen[n] = -1;
    gaps[n] = [];
  }

  for (let i = 0; i < draws.length; i++) {
    for (const num of draws[i].mainNumbers) {
      if (lastSeen[num] >= 0) {
        gaps[num].push(i - lastSeen[num]);
      }
      lastSeen[num] = i;
    }
  }

  const entries: GapEntry[] = [];
  const lastDrawIndex = totalDraws - 1;

  for (let n = config.mainPool.min; n <= config.mainPool.max; n++) {
    const drawsSinceLastSeen =
      lastSeen[n] >= 0 ? lastDrawIndex - lastSeen[n] : totalDraws;

    const allGaps = gaps[n];
    const averageGap =
      allGaps.length > 0
        ? allGaps.reduce((sum, g) => sum + g, 0) / allGaps.length
        : totalDraws;

    const overdueRatio = averageGap > 0 ? drawsSinceLastSeen / averageGap : 0;

    entries.push({ number: n, drawsSinceLastSeen, averageGap, overdueRatio });
  }

  const overdue = entries
    .filter((e) => e.overdueRatio > 1.5)
    .sort((a, b) => b.overdueRatio - a.overdueRatio);

  return { overdue };
}

export function analyzeBonusGaps(
  draws: DrawResult[],
  config: GameConfig
): GapResult {
  if (!config.bonusPool) return { overdue: [] };

  const totalDraws = draws.length;
  if (totalDraws === 0) return { overdue: [] };

  const lastSeen: Record<number, number> = {};
  const gaps: Record<number, number[]> = {};

  for (let n = config.bonusPool.min; n <= config.bonusPool.max; n++) {
    lastSeen[n] = -1;
    gaps[n] = [];
  }

  for (let i = 0; i < draws.length; i++) {
    const bonus = draws[i].bonusNumber;
    if (bonus != null) {
      if (lastSeen[bonus] >= 0) {
        gaps[bonus].push(i - lastSeen[bonus]);
      }
      lastSeen[bonus] = i;
    }
  }

  const entries: GapEntry[] = [];
  const lastDrawIndex = totalDraws - 1;

  for (let n = config.bonusPool.min; n <= config.bonusPool.max; n++) {
    const drawsSinceLastSeen =
      lastSeen[n] >= 0 ? lastDrawIndex - lastSeen[n] : totalDraws;

    const allGaps = gaps[n];
    const averageGap =
      allGaps.length > 0
        ? allGaps.reduce((sum, g) => sum + g, 0) / allGaps.length
        : totalDraws;

    const overdueRatio = averageGap > 0 ? drawsSinceLastSeen / averageGap : 0;

    entries.push({ number: n, drawsSinceLastSeen, averageGap, overdueRatio });
  }

  const overdue = entries
    .filter((e) => e.overdueRatio > 1.5)
    .sort((a, b) => b.overdueRatio - a.overdueRatio);

  return { overdue };
}
