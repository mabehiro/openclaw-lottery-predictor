import type { DrawResult, GameConfig, GameId } from "./types.js";
import { getGameConfig } from "./game-configs.js";

export async function fetchCsvFromUrl(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  return response.text();
}

export function parseCsvRows(raw: string): string[][] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => line.split(","));
}

export function parseDrawResults(
  rows: string[][],
  parser: GameConfig["parseRow"]
): DrawResult[] {
  const results: DrawResult[] = [];
  for (const row of rows) {
    const parsed = parser(row);
    if (parsed) {
      results.push(parsed);
    }
  }
  return results.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export async function fetchAndParseLotteryData(
  gameId: GameId
): Promise<{ raw: string; draws: DrawResult[] }> {
  const config = getGameConfig(gameId);
  const raw = await fetchCsvFromUrl(config.csvUrl);
  const rows = parseCsvRows(raw);
  const draws = parseDrawResults(rows, config.parseRow);
  return { raw, draws };
}
