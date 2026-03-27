import type {
  DrawResult,
  GameConfig,
  PredictionResult,
  PredictionSet,
  DISCLAIMER as _D,
} from "./types.js";
import { DISCLAIMER } from "./types.js";
import { analyzeFrequency, analyzeBonusFrequency } from "./frequency-analysis.js";
import { analyzeGaps, analyzeBonusGaps } from "./gap-analysis.js";
import { analyzeHotCold, analyzeBonusHotCold } from "./hot-cold-analysis.js";
import { analyzePairs } from "./pattern-analysis.js";

export type Strategy = "balanced" | "overdue-focus" | "hot-streak" | "random-weighted";

interface Weights {
  frequency: number;
  hotCold: number;
  gap: number;
  pair: number;
}

const STRATEGY_WEIGHTS: Record<Strategy, Weights> = {
  balanced: { frequency: 0.25, hotCold: 0.2, gap: 0.3, pair: 0.25 },
  "overdue-focus": { frequency: 0.1, hotCold: 0.1, gap: 0.6, pair: 0.2 },
  "hot-streak": { frequency: 0.35, hotCold: 0.35, gap: 0.1, pair: 0.2 },
  "random-weighted": { frequency: 0.15, hotCold: 0.15, gap: 0.15, pair: 0.15 },
};

function scoreNumbers(
  draws: DrawResult[],
  config: GameConfig,
  weights: Weights,
  pool: { min: number; max: number; count: number },
  isBonus: boolean
): Array<{ number: number; score: number }> {
  const freq = isBonus
    ? analyzeBonusFrequency(draws, config)
    : analyzeFrequency(draws, config);

  const gapResult = isBonus
    ? analyzeBonusGaps(draws, config)
    : analyzeGaps(draws, config);

  const hotCold = isBonus
    ? analyzeBonusHotCold(draws, config)
    : analyzeHotCold(draws, config);

  // Normalize frequency scores to 0-1
  const freqValues = Object.values(freq).map((f) => f.count);
  const maxFreq = Math.max(...freqValues, 1);
  const minFreq = Math.min(...freqValues, 0);
  const freqRange = maxFreq - minFreq || 1;

  // Build hot/cold lookup
  const hotSet = new Set(hotCold.hot.map((h) => h.number));
  const coldSet = new Set(hotCold.cold.map((c) => c.number));

  // Build gap lookup
  const gapMap = new Map<number, number>();
  for (const entry of gapResult.overdue) {
    gapMap.set(entry.number, entry.overdueRatio);
  }

  // Build pair affinity map (how often each number appears in top pairs)
  const pairs = isBonus ? [] : analyzePairs(draws, config, 3);
  const pairAffinity = new Map<number, number>();
  for (const pair of pairs.slice(0, 50)) {
    for (const num of pair.pair) {
      pairAffinity.set(num, (pairAffinity.get(num) ?? 0) + pair.occurrences);
    }
  }
  const maxPairAffinity = Math.max(...Array.from(pairAffinity.values()), 1);

  const scored: Array<{ number: number; score: number }> = [];

  for (let n = pool.min; n <= pool.max; n++) {
    let score = 0;

    // Frequency component (0-1)
    const freqCount = freq[n]?.count ?? 0;
    const freqScore = (freqCount - minFreq) / freqRange;
    score += freqScore * weights.frequency;

    // Hot/cold component
    if (hotSet.has(n)) {
      score += 0.8 * weights.hotCold;
    } else if (coldSet.has(n)) {
      // Slight contrarian bonus for very cold numbers (reversion to mean)
      score += 0.4 * weights.hotCold;
    } else {
      score += 0.5 * weights.hotCold;
    }

    // Gap/overdue component
    const overdueRatio = gapMap.get(n) ?? 0;
    const gapScore = Math.min(overdueRatio / 3, 1); // Cap at 3x overdue = 1.0
    score += gapScore * weights.gap;

    // Pair affinity component
    const affinity = pairAffinity.get(n) ?? 0;
    score += (affinity / maxPairAffinity) * weights.pair;

    scored.push({ number: n, score });
  }

  return scored.sort((a, b) => b.score - a.score);
}

function pickTopNumbers(
  scored: Array<{ number: number; score: number }>,
  count: number
): number[] {
  return scored
    .slice(0, count)
    .map((s) => s.number)
    .sort((a, b) => a - b);
}

function addRandomVariation(
  scored: Array<{ number: number; score: number }>,
  count: number
): number[] {
  // Pick from top 2x candidates with weighted random selection
  const candidates = scored.slice(0, count * 3);
  const totalScore = candidates.reduce((sum, c) => sum + c.score, 0);
  const selected: Set<number> = new Set();

  while (selected.size < count && selected.size < candidates.length) {
    let rand = Math.random() * totalScore;
    for (const candidate of candidates) {
      rand -= candidate.score;
      if (rand <= 0 && !selected.has(candidate.number)) {
        selected.add(candidate.number);
        break;
      }
    }
    // Fallback: add next highest not yet selected
    if (selected.size < count) {
      for (const candidate of candidates) {
        if (!selected.has(candidate.number)) {
          selected.add(candidate.number);
          break;
        }
      }
    }
  }

  return Array.from(selected).sort((a, b) => a - b);
}

function describeStrategy(strategy: Strategy): string {
  switch (strategy) {
    case "balanced":
      return "Balanced blend of frequency, hot/cold trends, overdue analysis, and pair patterns";
    case "overdue-focus":
      return "Emphasizes numbers that are statistically overdue based on their historical gap patterns";
    case "hot-streak":
      return "Favors recently hot numbers and high-frequency picks";
    case "random-weighted":
      return "Weighted random selection from top-scoring candidates for variety";
  }
}

export function generatePredictions(
  draws: DrawResult[],
  config: GameConfig,
  numSets: number = 3,
  strategy?: Strategy
): PredictionResult {
  const strategies: Strategy[] = strategy
    ? Array(numSets).fill(strategy)
    : ["balanced", "overdue-focus", "hot-streak", ...Array(Math.max(0, numSets - 3)).fill("random-weighted")].slice(0, numSets);

  const sets: PredictionSet[] = strategies.map((strat) => {
    const weights = STRATEGY_WEIGHTS[strat];
    const mainScored = scoreNumbers(draws, config, weights, config.mainPool, false);

    const mainNumbers =
      strat === "random-weighted"
        ? addRandomVariation(mainScored, config.mainPool.count)
        : pickTopNumbers(mainScored, config.mainPool.count);

    let bonusNumber: number | undefined;
    if (config.bonusPool) {
      const bonusScored = scoreNumbers(draws, config, weights, config.bonusPool, true);
      bonusNumber =
        strat === "random-weighted"
          ? addRandomVariation(bonusScored, 1)[0]
          : bonusScored[0].number;
    }

    return {
      mainNumbers,
      bonusNumber,
      strategy: strat,
      reasoning: describeStrategy(strat),
    };
  });

  return {
    game: config.id,
    analysisDate: new Date(),
    basedOnDraws: draws.length,
    sets,
    disclaimer: DISCLAIMER,
  };
}
