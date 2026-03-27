import type { DrawResult, GameConfig } from "../lib/types.js";

export const MOCK_LOTTO_CONFIG: GameConfig = {
  id: "lotto-texas",
  name: "Lotto Texas",
  mainPool: { count: 6, min: 1, max: 54 },
  drawDays: ["Monday", "Wednesday", "Saturday"],
  csvUrl: "https://example.com/lotto.csv",
  parseRow: () => null,
};

export const MOCK_POWERBALL_CONFIG: GameConfig = {
  id: "powerball",
  name: "Powerball",
  mainPool: { count: 5, min: 1, max: 69 },
  bonusPool: { count: 1, min: 1, max: 26, label: "Powerball" },
  drawDays: ["Monday", "Wednesday", "Saturday"],
  csvUrl: "https://example.com/powerball.csv",
  parseRow: () => null,
};

export function createDraws(data: Array<{ date: string; main: number[]; bonus?: number }>): DrawResult[] {
  return data.map((d) => ({
    date: new Date(d.date),
    mainNumbers: d.main.sort((a, b) => a - b),
    bonusNumber: d.bonus,
  }));
}

// 20 synthetic Lotto Texas draws with known patterns:
// - Number 7 appears 8 times (hot)
// - Number 42 appears 7 times (hot)
// - Number 50 appears 1 time (cold)
// - Number 54 appears 0 times (very cold)
// - Pair (7, 42) appears 4 times
export const LOTTO_DRAWS: DrawResult[] = createDraws([
  { date: "2024-01-01", main: [3, 7, 15, 22, 42, 48] },
  { date: "2024-01-04", main: [1, 7, 10, 25, 33, 42] },
  { date: "2024-01-08", main: [5, 12, 18, 30, 42, 51] },
  { date: "2024-01-11", main: [7, 14, 21, 28, 35, 42] },
  { date: "2024-01-15", main: [2, 9, 16, 23, 38, 45] },
  { date: "2024-01-18", main: [7, 11, 19, 27, 36, 44] },
  { date: "2024-01-22", main: [4, 8, 13, 26, 39, 50] },
  { date: "2024-01-25", main: [6, 7, 20, 31, 42, 47] },
  { date: "2024-01-29", main: [1, 10, 17, 24, 34, 46] },
  { date: "2024-02-01", main: [7, 15, 22, 29, 37, 43] },
  { date: "2024-02-05", main: [3, 11, 18, 26, 40, 49] },
  { date: "2024-02-08", main: [7, 14, 21, 33, 42, 48] },
  { date: "2024-02-12", main: [2, 8, 16, 25, 38, 52] },
  { date: "2024-02-15", main: [5, 12, 19, 30, 41, 53] },
  { date: "2024-02-19", main: [1, 7, 23, 32, 42, 45] },
  { date: "2024-02-22", main: [4, 9, 17, 28, 36, 44] },
  { date: "2024-02-26", main: [6, 13, 20, 27, 35, 47] },
  { date: "2024-02-29", main: [3, 10, 22, 31, 39, 51] },
  { date: "2024-03-04", main: [2, 11, 15, 24, 33, 46] },
  { date: "2024-03-07", main: [8, 14, 21, 29, 40, 48] },
]);

// 10 synthetic Powerball draws with bonus numbers
export const POWERBALL_DRAWS: DrawResult[] = createDraws([
  { date: "2024-01-01", main: [5, 12, 33, 45, 62], bonus: 7 },
  { date: "2024-01-04", main: [3, 18, 27, 45, 58], bonus: 15 },
  { date: "2024-01-08", main: [10, 22, 33, 50, 62], bonus: 7 },
  { date: "2024-01-11", main: [1, 15, 28, 41, 55], bonus: 22 },
  { date: "2024-01-15", main: [7, 19, 33, 48, 65], bonus: 7 },
  { date: "2024-01-18", main: [2, 14, 30, 45, 60], bonus: 10 },
  { date: "2024-01-22", main: [8, 21, 36, 52, 67], bonus: 3 },
  { date: "2024-01-25", main: [4, 16, 33, 44, 58], bonus: 18 },
  { date: "2024-01-29", main: [11, 25, 38, 49, 62], bonus: 7 },
  { date: "2024-02-01", main: [6, 13, 29, 42, 55], bonus: 12 },
]);
