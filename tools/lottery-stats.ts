import type { GameId } from "../lib/types.js";
import { getGameConfig } from "../lib/game-configs.js";
import { ensureData } from "../lib/data-store.js";
import { formatStats } from "../lib/formatter.js";

export function createStatsTool() {
  return {
    name: "lottery_stats",
    description:
      "Get a quick statistical overview of a lottery game including total draws, date range, most/least common numbers, and the latest draw results.",
    parameters: {
      type: "object",
      properties: {
        game: {
          type: "string",
          description: "The lottery game to get stats for. One of: lotto-texas, powerball, mega-millions",
        },
      },
      required: ["game"],
    },
    async execute({ game }: { game: string }) {
      const gameId = game as GameId;
      const config = getGameConfig(gameId);
      const draws = await ensureData(gameId);
      const text = formatStats(draws, config);
      return { content: [{ type: "text" as const, text }] };
    },
  };
}
