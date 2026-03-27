export type GameId = "lotto-texas" | "powerball" | "mega-millions";

export interface GameConfig {
  id: GameId;
  name: string;
  mainPool: { count: number; min: number; max: number };
  bonusPool?: { count: number; min: number; max: number; label: string };
  drawDays: string[];
  csvUrl: string;
  parseRow: (row: string[]) => DrawResult | null;
}

export interface DrawResult {
  date: Date;
  mainNumbers: number[];
  bonusNumber?: number;
}

export interface FrequencyEntry {
  number: number;
  count: number;
  percentage: number;
}

export interface FrequencyMap {
  [number: number]: { count: number; percentage: number };
}

export interface HotColdResult {
  hot: Array<{ number: number; count: number; deviation: number }>;
  cold: Array<{ number: number; count: number; deviation: number }>;
}

export interface GapEntry {
  number: number;
  drawsSinceLastSeen: number;
  averageGap: number;
  overdueRatio: number;
}

export interface GapResult {
  overdue: GapEntry[];
}

export interface PairPattern {
  pair: [number, number];
  occurrences: number;
  lastSeen: Date;
}

export interface PositionalPattern {
  position: number;
  mostFrequent: Array<{ number: number; count: number }>;
}

export interface AnalysisResult {
  game: GameId;
  totalDraws: number;
  dateRange: { from: Date; to: Date };
  frequency: FrequencyMap;
  hotCold: HotColdResult;
  gaps: GapResult;
  patterns: { pairs: PairPattern[]; positional: PositionalPattern[] };
}

export interface PredictionSet {
  mainNumbers: number[];
  bonusNumber?: number;
  strategy: string;
  reasoning: string;
}

export interface PredictionResult {
  game: GameId;
  analysisDate: Date;
  basedOnDraws: number;
  sets: PredictionSet[];
  disclaimer: string;
}

export const DISCLAIMER =
  "⚠️ DISCLAIMER: Lottery drawings are random events. These predictions are based on historical pattern analysis and are for ENTERTAINMENT PURPOSES ONLY. Past results do not influence future drawings. Please play responsibly.";
