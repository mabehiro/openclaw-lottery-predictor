import type { GameConfig, DrawResult, GameId } from "./types.js";

function parseDateParts(month: string, day: string, year: string): Date {
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

export const GAME_CONFIGS: Record<GameId, GameConfig> = {
  "lotto-texas": {
    id: "lotto-texas",
    name: "Lotto Texas",
    mainPool: { count: 6, min: 1, max: 54 },
    drawDays: ["Monday", "Wednesday", "Saturday"],
    csvUrl:
      "https://www.texaslottery.com/export/sites/lottery/Games/Lotto_Texas/Winning_Numbers/lottotexas.csv",
    parseRow(row: string[]): DrawResult | null {
      if (!row || row.length < 10 || !row[0] || row[0].trim() !== "Lotto Texas") return null;
      const nums = row.slice(4, 10).map(Number);
      if (nums.some(isNaN)) return null;
      return {
        date: parseDateParts((row[1] ?? "").trim(), (row[2] ?? "").trim(), (row[3] ?? "").trim()),
        mainNumbers: nums.sort((a, b) => a - b),
      };
    },
  },

  powerball: {
    id: "powerball",
    name: "Powerball",
    mainPool: { count: 5, min: 1, max: 69 },
    bonusPool: { count: 1, min: 1, max: 26, label: "Powerball" },
    drawDays: ["Monday", "Wednesday", "Saturday"],
    csvUrl:
      "https://www.texaslottery.com/export/sites/lottery/Games/Powerball/Winning_Numbers/powerball.csv",
    parseRow(row: string[]): DrawResult | null {
      if (!row || row.length < 10 || !row[0] || row[0].trim() !== "Powerball") return null;
      const mainNums = row.slice(4, 9).map(Number);
      const bonus = Number(row[9]);
      if (mainNums.some(isNaN) || isNaN(bonus)) return null;
      return {
        date: parseDateParts((row[1] ?? "").trim(), (row[2] ?? "").trim(), (row[3] ?? "").trim()),
        mainNumbers: mainNums.sort((a, b) => a - b),
        bonusNumber: bonus,
      };
    },
  },

  "mega-millions": {
    id: "mega-millions",
    name: "Mega Millions",
    mainPool: { count: 5, min: 1, max: 70 },
    bonusPool: { count: 1, min: 1, max: 25, label: "Mega Ball" },
    drawDays: ["Tuesday", "Friday"],
    csvUrl:
      "https://www.texaslottery.com/export/sites/lottery/Games/Mega_Millions/Winning_Numbers/megamillions.csv",
    parseRow(row: string[]): DrawResult | null {
      if (!row || row.length < 10 || !row[0] || row[0].trim() !== "Mega Millions") return null;
      const mainNums = row.slice(4, 9).map(Number);
      const bonus = Number(row[9]);
      if (mainNums.some(isNaN) || isNaN(bonus)) return null;
      return {
        date: parseDateParts((row[1] ?? "").trim(), (row[2] ?? "").trim(), (row[3] ?? "").trim()),
        mainNumbers: mainNums.sort((a, b) => a - b),
        bonusNumber: bonus,
      };
    },
  },
};

export const ALL_GAME_IDS: GameId[] = [
  "lotto-texas",
  "powerball",
  "mega-millions",
];

export function getGameConfig(gameId: string): GameConfig {
  const config = GAME_CONFIGS[gameId as GameId];
  if (!config) {
    throw new Error(
      `Unknown game: ${gameId}. Valid games: ${ALL_GAME_IDS.join(", ")}`
    );
  }
  return config;
}
