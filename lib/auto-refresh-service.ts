import { refreshAllData } from "./data-store.js";

let intervalId: ReturnType<typeof setInterval> | null = null;
let startupTimeout: ReturnType<typeof setTimeout> | null = null;

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
const STARTUP_DELAY_MS = 30_000;

export function startAutoRefresh(
  intervalMs: number = SIX_HOURS_MS,
  onRefresh?: (results: Record<string, number>) => void,
  onError?: (error: Error) => void
): void {
  if (intervalId) return;

  async function doRefresh() {
    try {
      const results = await refreshAllData();
      onRefresh?.(results);
    } catch (err) {
      onError?.(err instanceof Error ? err : new Error(String(err)));
    }
  }

  // Delay first refresh to avoid blocking plugin registration
  startupTimeout = setTimeout(doRefresh, STARTUP_DELAY_MS);

  // Then repeat on interval
  intervalId = setInterval(doRefresh, intervalMs);
}

export function stopAutoRefresh(): void {
  if (startupTimeout) {
    clearTimeout(startupTimeout);
    startupTimeout = null;
  }
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
