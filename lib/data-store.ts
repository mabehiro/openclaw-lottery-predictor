import { readFile, writeFile, stat, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { DrawResult, GameId } from "./types.js";
import { getGameConfig } from "./game-configs.js";
import { fetchAndParseLotteryData, parseCsvRows, parseDrawResults } from "./data-fetcher.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_DATA_DIR = join(__dirname, "..", "data");

let customDataDir: string | undefined;

export function setDataDir(dir: string): void {
  customDataDir = dir;
}

export function getDataDir(): string {
  return customDataDir ?? DEFAULT_DATA_DIR;
}

function getCsvPath(gameId: GameId): string {
  return join(getDataDir(), `${gameId}.csv`);
}

export async function saveRawCsv(gameId: GameId, content: string): Promise<void> {
  const filePath = getCsvPath(gameId);
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, content, "utf-8");
}

export async function loadLocalDraws(gameId: GameId): Promise<DrawResult[] | null> {
  const filePath = getCsvPath(gameId);
  try {
    const content = await readFile(filePath, "utf-8");
    const rows = parseCsvRows(content);
    const config = getGameConfig(gameId);
    return parseDrawResults(rows, config.parseRow);
  } catch {
    return null;
  }
}

export async function getDataAge(gameId: GameId): Promise<{ lastModified: Date; isStale: boolean } | null> {
  const filePath = getCsvPath(gameId);
  try {
    const info = await stat(filePath);
    const lastModified = info.mtime;
    const ageMs = Date.now() - lastModified.getTime();
    const ONE_DAY = 24 * 60 * 60 * 1000;
    return { lastModified, isStale: ageMs > ONE_DAY };
  } catch {
    return null;
  }
}

export async function ensureData(gameId: GameId): Promise<DrawResult[]> {
  const age = await getDataAge(gameId);

  if (age && !age.isStale) {
    const local = await loadLocalDraws(gameId);
    if (local && local.length > 0) {
      return local;
    }
  }

  const { raw, draws } = await fetchAndParseLotteryData(gameId);
  await saveRawCsv(gameId, raw);
  return draws;
}

export async function refreshAllData(): Promise<Record<GameId, number>> {
  const results: Record<string, number> = {};
  const gameIds: GameId[] = ["lotto-texas", "powerball", "mega-millions"];

  for (const gameId of gameIds) {
    const { raw, draws } = await fetchAndParseLotteryData(gameId);
    await saveRawCsv(gameId, raw);
    results[gameId] = draws.length;
  }

  return results as Record<GameId, number>;
}
