import type { GameId, AnalysisResult } from "../lib/types.js";
import { getGameConfig } from "../lib/game-configs.js";
import { ensureData } from "../lib/data-store.js";
import { analyzeFrequency } from "../lib/frequency-analysis.js";
import { analyzeHotCold } from "../lib/hot-cold-analysis.js";
import { analyzeGaps } from "../lib/gap-analysis.js";
import { analyzePairs, analyzePositional } from "../lib/pattern-analysis.js";
import {
  formatAnalysis,
  formatFrequency,
  formatHotCold,
  formatGaps,
  formatPairs,
  formatPositional,
} from "../lib/formatter.js";

type AnalysisType = "all" | "frequency" | "hot-cold" | "gaps" | "patterns";

export function createAnalyzeTool() {
  return {
    name: "lottery_analyze",
    description:
      "Run detailed statistical analysis on a lottery game's historical data. Supports frequency analysis, hot/cold number identification, gap/overdue analysis, and pair pattern detection.",
    parameters: {
      type: "object",
      properties: {
        game: {
          type: "string",
          description: "The lottery game to analyze. One of: lotto-texas, powerball, mega-millions",
        },
        analysis_type: {
          type: "string",
          description: "Type of analysis to run. One of: all, frequency, hot-cold, gaps, patterns. Defaults to all.",
        },
        window_size: {
          type: "number",
          description: "Limit analysis to the last N draws. If omitted, uses all historical data.",
          minimum: 10,
        },
      },
      required: ["game"],
    },
    async execute({
      game,
      analysis_type = "all",
      window_size,
    }: {
      game: string;
      analysis_type?: string;
      window_size?: number;
    }) {
      const gameId = game as GameId;
      const analysisType = analysis_type as AnalysisType;
      const config = getGameConfig(gameId);
      const draws = await ensureData(gameId);

      if (draws.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: `No data available for ${config.name}. Please run lottery_update_data first.`,
            },
          ],
        };
      }

      const sorted = [...draws].sort(
        (a, b) => a.date.getTime() - b.date.getTime()
      );

      if (analysisType === "all") {
        const result: AnalysisResult = {
          game: gameId,
          totalDraws: sorted.length,
          dateRange: {
            from: sorted[0].date,
            to: sorted[sorted.length - 1].date,
          },
          frequency: analyzeFrequency(sorted, config, window_size),
          hotCold: analyzeHotCold(sorted, config, window_size),
          gaps: analyzeGaps(sorted, config),
          patterns: {
            pairs: analyzePairs(sorted, config),
            positional: analyzePositional(sorted, config),
          },
        };
        const text = formatAnalysis(result, config);
        return { content: [{ type: "text" as const, text }] };
      }

      let text = `## ${config.name} — ${analysisType} Analysis\n\n`;
      text += `**Draws analyzed:** ${window_size ? `last ${window_size}` : "all"} (${sorted.length} total)\n\n`;

      switch (analysisType) {
        case "frequency":
          text += formatFrequency(
            analyzeFrequency(sorted, config, window_size),
            "Main"
          );
          break;
        case "hot-cold":
          text += formatHotCold(
            analyzeHotCold(sorted, config, window_size),
            "Main"
          );
          break;
        case "gaps":
          text += formatGaps(analyzeGaps(sorted, config));
          break;
        case "patterns":
          text += formatPairs(analyzePairs(sorted, config));
          text += formatPositional(analyzePositional(sorted, config));
          break;
      }

      return { content: [{ type: "text" as const, text }] };
    },
  };
}
