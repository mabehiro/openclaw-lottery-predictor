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

export function formatFrequency(freq: FrequencyMap, label: string, top: number = 15): string {
  const entries = Object.entries(freq)
    .map(([numStr, data]) => ({ number: parseInt(numStr), ...data }))
    .sort((a, b) => b.count - a.count);

  const topEntries = topN(entries, top);
  const bottomEntries = topN(
    [...entries].sort((a, b) => a.count - b.count),
    10
  );

  let out = `### ${label} Frequency (Top ${top})\n\n`;
  out += "| Number | Count | % |\n|--------|-------|---|\n";
  for (const e of topEntries) {
    out += `| ${e.number} | ${e.count} | ${e.percentage.toFixed(1)}% |\n`;
  }

  out += `\n### Least Frequent ${label} Numbers\n\n`;
  out += "| Number | Count | % |\n|--------|-------|---|\n";
  for (const e of bottomEntries) {
    out += `| ${e.number} | ${e.count} | ${e.percentage.toFixed(1)}% |\n`;
  }

  return out;
}

export function formatHotCold(result: HotColdResult, label: string): string {
  let out = `### Hot ${label} Numbers (>1 std dev above mean)\n\n`;
  if (result.hot.length === 0) {
    out += "No significantly hot numbers in this period.\n\n";
  } else {
    out += "| Number | Count | Deviation |\n|--------|-------|-----------|\n";
    for (const e of result.hot) {
      out += `| ${e.number} | ${e.count} | +${e.deviation.toFixed(2)}σ |\n`;
    }
    out += "\n";
  }

  out += `### Cold ${label} Numbers (>1 std dev below mean)\n\n`;
  if (result.cold.length === 0) {
    out += "No significantly cold numbers in this period.\n\n";
  } else {
    out += "| Number | Count | Deviation |\n|--------|-------|-----------|\n";
    for (const e of result.cold) {
      out += `| ${e.number} | ${e.count} | ${e.deviation.toFixed(2)}σ |\n`;
    }
    out += "\n";
  }

  return out;
}

export function formatGaps(result: GapResult): string {
  let out = "### Overdue Numbers (>1.5x average gap)\n\n";
  if (result.overdue.length === 0) {
    out += "No significantly overdue numbers.\n\n";
  } else {
    out +=
      "| Number | Draws Since Last | Avg Gap | Overdue Ratio |\n|--------|-----------------|---------|---------------|\n";
    for (const e of topN(result.overdue, 15)) {
      out += `| ${e.number} | ${e.drawsSinceLastSeen} | ${e.averageGap.toFixed(1)} | ${e.overdueRatio.toFixed(2)}x |\n`;
    }
    out += "\n";
  }
  return out;
}

export function formatPairs(pairs: PairPattern[]): string {
  let out = "### Most Frequent Pairs\n\n";
  if (pairs.length === 0) {
    out += "No significant pair patterns found.\n\n";
  } else {
    out +=
      "| Pair | Occurrences | Last Seen |\n|------|-------------|-----------|\n";
    for (const p of topN(pairs, 15)) {
      out += `| ${p.pair[0]}-${p.pair[1]} | ${p.occurrences} | ${formatDate(p.lastSeen)} |\n`;
    }
    out += "\n";
  }
  return out;
}

export function formatPositional(patterns: PositionalPattern[]): string {
  let out = "### Positional Frequency (most common at each sorted position)\n\n";
  for (const pos of patterns) {
    out += `**Position ${pos.position}:** `;
    out += pos.mostFrequent
      .map((e) => `${e.number} (${e.count}x)`)
      .join(", ");
    out += "\n";
  }
  out += "\n";
  return out;
}

export function formatAnalysis(result: AnalysisResult, config: GameConfig): string {
  let out = `## ${config.name} — Full Analysis\n\n`;
  out += `**Total Draws:** ${result.totalDraws} | `;
  out += `**Date Range:** ${formatDate(result.dateRange.from)} – ${formatDate(result.dateRange.to)}\n\n`;
  out += "---\n\n";

  out += formatFrequency(result.frequency, "Main");
  out += formatHotCold(result.hotCold, "Main");
  out += formatGaps(result.gaps);
  out += formatPairs(result.patterns.pairs);
  out += formatPositional(result.patterns.positional);

  return out;
}

export function formatPredictions(result: PredictionResult, config: GameConfig): string {
  let out = `## ${config.name} — Predicted Numbers\n\n`;
  out += `**Based on:** ${result.basedOnDraws} historical draws | `;
  out += `**Generated:** ${formatDate(result.analysisDate)}\n\n`;

  for (let i = 0; i < result.sets.length; i++) {
    const set = result.sets[i];
    out += `### Set ${i + 1} — ${set.strategy}\n\n`;
    out += `**Numbers:** ${set.mainNumbers.join(" - ")}`;
    if (set.bonusNumber != null && config.bonusPool) {
      out += ` | **${config.bonusPool.label}:** ${set.bonusNumber}`;
    }
    out += "\n\n";
    out += `*${set.reasoning}*\n\n`;
  }

  out += "---\n\n";
  out += result.disclaimer + "\n";

  return out;
}

export function formatStats(draws: DrawResult[], config: GameConfig): string {
  if (draws.length === 0) {
    return `## ${config.name}\n\nNo data available. Run the data update tool first.\n`;
  }

  const sorted = [...draws].sort((a, b) => a.date.getTime() - b.date.getTime());
  const latest = sorted[sorted.length - 1];
  const oldest = sorted[0];

  // Count main number frequencies
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

  let out = `## ${config.name} — Quick Stats\n\n`;
  out += `| Stat | Value |\n|------|-------|\n`;
  out += `| Total Draws | ${draws.length} |\n`;
  out += `| Date Range | ${formatDate(oldest.date)} – ${formatDate(latest.date)} |\n`;
  out += `| Draw Days | ${config.drawDays.join(", ")} |\n`;
  out += `| Main Pool | ${config.mainPool.count} from ${config.mainPool.min}-${config.mainPool.max} |\n`;
  if (config.bonusPool) {
    out += `| ${config.bonusPool.label} | 1 from ${config.bonusPool.min}-${config.bonusPool.max} |\n`;
  }
  out += "\n";

  out += `### Latest Draw (${formatDate(latest.date)})\n\n`;
  out += `**Numbers:** ${latest.mainNumbers.join(" - ")}`;
  if (latest.bonusNumber != null && config.bonusPool) {
    out += ` | **${config.bonusPool.label}:** ${latest.bonusNumber}`;
  }
  out += "\n\n";

  out += `### Most Common Numbers\n${top5.map((n) => `- **${n.number}** (${n.count}x)`).join("\n")}\n\n`;
  out += `### Least Common Numbers\n${bottom5.map((n) => `- **${n.number}** (${n.count}x)`).join("\n")}\n`;

  return out;
}
