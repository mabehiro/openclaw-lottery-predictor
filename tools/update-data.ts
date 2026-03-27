import type { GameId } from "../lib/types.js";
import { ALL_GAME_IDS, getGameConfig } from "../lib/game-configs.js";
import { fetchAndParseLotteryData } from "../lib/data-fetcher.js";
import { saveRawCsv } from "../lib/data-store.js";

export function createUpdateDataTool() {
  return {
    name: "lottery_update_data",
    description:
      "Fetch the latest historical lottery data from the Texas Lottery website and save it locally. Run this to ensure predictions are based on the most recent draws.",
    parameters: {
      type: "object",
      properties: {
        game: {
          type: "string",
          description: "Which game to update. One of: lotto-texas, powerball, mega-millions, all. Defaults to all.",
        },
      },
    },
    async execute({ game = "all" }: { game?: string }) {
      const gameIds: GameId[] =
        game === "all" ? [...ALL_GAME_IDS] : [game as GameId];

      const results: string[] = [];
      const errors: string[] = [];

      for (const gameId of gameIds) {
        const config = getGameConfig(gameId);
        try {
          const { raw, draws } = await fetchAndParseLotteryData(gameId);
          await saveRawCsv(gameId, raw);

          const latest = draws.length > 0 ? draws[draws.length - 1] : null;
          const latestDate = latest
            ? latest.date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "N/A";

          results.push(
            `**${config.name}:** ${draws.length} draws loaded (latest: ${latestDate})`
          );
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          errors.push(`**${config.name}:** Failed — ${msg}`);
        }
      }

      let text = "## Data Update Results\n\n";
      if (results.length > 0) {
        text += results.join("\n") + "\n";
      }
      if (errors.length > 0) {
        text += "\n### Errors\n\n" + errors.join("\n") + "\n";
      }

      return { content: [{ type: "text" as const, text }] };
    },
  };
}
