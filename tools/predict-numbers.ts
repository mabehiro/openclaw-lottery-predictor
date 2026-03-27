import type { GameId } from "../lib/types.js";
import { getGameConfig } from "../lib/game-configs.js";
import { ensureData } from "../lib/data-store.js";
import { generatePredictions, type Strategy } from "../lib/prediction-engine.js";
import { formatPredictions } from "../lib/formatter.js";

export function createPredictTool() {
  return {
    name: "lottery_predict",
    description:
      "Generate predicted lottery number sets based on historical pattern analysis. Uses weighted scoring across frequency, hot/cold trends, overdue analysis, and pair patterns. For entertainment purposes only.",
    parameters: {
      type: "object",
      properties: {
        game: {
          type: "string",
          description: "The lottery game to generate predictions for. One of: lotto-texas, powerball, mega-millions",
        },
        num_sets: {
          type: "number",
          description: "Number of prediction sets to generate (1-10). Defaults to 3.",
          minimum: 1,
          maximum: 10,
        },
        strategy: {
          type: "string",
          description: "Prediction strategy. One of: balanced, overdue-focus, hot-streak, random-weighted. If omitted, generates sets with different strategies.",
        },
      },
      required: ["game"],
    },
    async execute({
      game,
      num_sets = 3,
      strategy,
    }: {
      game: string;
      num_sets?: number;
      strategy?: string;
    }) {
      const gameId = game as GameId;
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

      const result = generatePredictions(sorted, config, num_sets, strategy as Strategy | undefined);
      const text = formatPredictions(result, config);
      return { content: [{ type: "text" as const, text }] };
    },
  };
}
