import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { createAnalyzeTool } from "./tools/analyze-lottery.js";
import { createPredictTool } from "./tools/predict-numbers.js";
import { createUpdateDataTool } from "./tools/update-data.js";
import { createStatsTool } from "./tools/lottery-stats.js";
import { startAutoRefresh, stopAutoRefresh } from "./lib/auto-refresh-service.js";
import { setDataDir } from "./lib/data-store.js";

export default definePluginEntry({
  id: "lottery-predictor",
  name: "Lottery Predictor",
  description:
    "Analyzes historical lottery data and generates number predictions for Lotto Texas, Powerball, and Mega Millions. For entertainment purposes only.",

  register(api) {
    try {
      // Register all 4 agent tools
      api.registerTool(createStatsTool());
      api.registerTool(createAnalyzeTool());
      api.registerTool(createPredictTool());
      api.registerTool(createUpdateDataTool());
    } catch (err) {
      console.error("[lottery-predictor] Tool registration failed:", err);
      if (err instanceof Error) console.error(err.stack);
      throw err;
    }

    // Auto-refresh: start after a delay to avoid blocking registration
    setTimeout(() => {
      startAutoRefresh(
        6 * 60 * 60 * 1000,
        (results) => {
          const summary = Object.entries(results)
            .map(([game, count]) => `${game}: ${count} draws`)
            .join(", ");
          console.log(`[lottery-predictor] Data refreshed: ${summary}`);
        },
        (error) => {
          console.error(`[lottery-predictor] Data refresh failed: ${error.message}`);
        }
      );
    }, 60_000);
  },
});
