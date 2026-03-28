import type {
  AnalysisResult,
  DrawResult,
  FrequencyMap,
  GameConfig,
  HotColdResult,
  GapResult,
  PairPattern,
  PositionalPattern,
  PredictionResult,
} from "./types.js";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function topN<T>(arr: T[], n: number): T[] {
  return arr.slice(0, n);
}

export function formatFrequency(freq: FrequencyMap, label: string, top: number = 10): string {
  const entries = Object.entries(freq)
    .map(([numStr, data]) => ({ number: parseInt(numStr), ...data }))
    .sort((a, b) => b.count - a.count);

  const topEntries = topN(entries, top);
  const bottomEntries = topN(
    [...entries].sort((a, b) => a.count - b.count),
    5
  );

  let out = `${label} frequency top ${top}: ${topEntries.map((e) => `${e.number}(${e.count}, ${e.percentage.toFixed(1)}%)`).join(", ")}`;
  out += `\nLeast frequent: ${bottomEntries.map((e) => `${e.number}(${e.count}, ${e.percentage.toFixed(1)}%)`).join(", ")}`;

  return out;
}

export function formatHotCold(result: HotColdResult, label: string): string {
  let out = `Hot ${label}: `;
  out += result.hot.length === 0
    ? "none"
    : result.hot.map((e) => `${e.number}(${e.count}, +${e.deviation.toFixed(1)}σ)`).join(", ");
  out += `\nCold ${label}: `;
  out += result.cold.length === 0
    ? "none"
    : result.cold.map((e) => `${e.number}(${e.count}, ${e.deviation.toFixed(1)}σ)`).join(", ");

  return out;
}

export function formatGaps(result: GapResult): string {
  if (result.overdue.length === 0) return "Overdue: none";
  return `Overdue (>1.5x avg gap): ${topN(result.overdue, 10).map((e) => `${e.number}(${e.drawsSinceLastSeen} draws, ${e.overdueRatio.toFixed(1)}x)`).join(", ")}`;
}

export function formatPairs(pairs: PairPattern[]): string {
  if (pairs.length === 0) return "Top pairs: none";
  return `Top pairs: ${topN(pairs, 10).map((p) => `${p.pair[0]}-${p.pair[1]}(${p.occurrences}x)`).join(", ")}`;
}

export function formatPositional(patterns: PositionalPattern[]): string {
  return `Positional: ${patterns.map((pos) => `P${pos.position}:${pos.mostFrequent.slice(0, 3).map((e) => e.number).join("/")}`).join(", ")}`;
}

export function formatAnalysis(result: AnalysisResult, config: GameConfig): string {
  let out = `${config.name} analysis (${result.totalDraws} draws, ${formatDate(result.dateRange.from)} – ${formatDate(result.dateRange.to)})\n`;
  out += formatFrequency(result.frequency, "Main") + "\n";
  out += formatHotCold(result.hotCold, "Main") + "\n";
  out += formatGaps(result.gaps) + "\n";
  out += formatPairs(result.patterns.pairs) + "\n";
  out += formatPositional(result.patterns.positional);

  return out;
}

export function formatPredictions(result: PredictionResult, config: GameConfig): string {
  let out = `${config.name} Predictions (${result.basedOnDraws} draws analyzed)\n\n`;

  for (let i = 0; i < result.sets.length; i++) {
    const set = result.sets[i];
    out += `Set ${i + 1} [${set.strategy}]: ${set.mainNumbers.join(", ")}`;
    if (set.bonusNumber != null && config.bonusPool) {
      out += ` + ${config.bonusPool.label}: ${set.bonusNumber}`;
    }
    out += "\n";
  }

  out += "\nDisclaimer: Predictions are for entertainment only. Lottery draws are random.";

  return out;
}

export function formatStats(draws: DrawResult[], config: GameConfig): string {
  if (draws.length === 0) {
    return `${config.name}: No data available. Run lottery_update_data first.`;
  }

  const sorted = [...draws].sort((a, b) => a.date.getTime() - b.date.getTime());
  const latest = sorted[sorted.length - 1];
  const oldest = sorted[0];

  const counts: Record<number, number> = {};
  for (const draw of draws) {
    for (const num of draw.mainNumbers) {
      counts[num] = (counts[num] ?? 0) + 1;
    }
  }
  const sortedNums = Object.entries(counts)
    .map(([n, c]) => ({ number: parseInt(n), count: c }))
    .sort((a, b) => b.count - a.count);

  const top5 = sortedNums.slice(0, 5);
  const bottom5 = sortedNums.slice(-5).reverse();

  let out = `${config.name}: ${draws.length} draws, ${formatDate(oldest.date)} – ${formatDate(latest.date)}, draws ${config.drawDays.join("/")}`;
  out += `, pool: ${config.mainPool.count} from ${config.mainPool.min}-${config.mainPool.max}`;
  if (config.bonusPool) {
    out += ` + ${config.bonusPool.label} 1-${config.bonusPool.max}`;
  }
  out += `\nLatest (${formatDate(latest.date)}): ${latest.mainNumbers.join(", ")}`;
  if (latest.bonusNumber != null && config.bonusPool) {
    out += ` + ${config.bonusPool.label}: ${latest.bonusNumber}`;
  }
  out += `\nMost common: ${top5.map((n) => `${n.number}(${n.count}x)`).join(", ")}`;
  out += `\nLeast common: ${bottom5.map((n) => `${n.number}(${n.count}x)`).join(", ")}`;

  return out;
}
