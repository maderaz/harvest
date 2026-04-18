import { formatAPY, formatTVL } from "@/lib/format";
import type { FullVaultHistory } from "@/lib/history-api";

interface VaultStatisticsProps {
  history: FullVaultHistory;
  currentTvl: number;
}

function computeApyStats(history: FullVaultHistory) {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const thirtyDaysAgo = nowSeconds - 30 * 24 * 60 * 60;
  const recent = history.apyHistory.filter(
    (p) => p.timestamp >= thirtyDaysAgo && p.apy >= 0,
  );
  if (recent.length < 2) return null;

  const values = recent.map((p) => p.apy);
  const sorted = [...values].sort((a, b) => a - b);
  const sum = values.reduce((s, v) => s + v, 0);
  const mean = sum / values.length;
  const median =
    sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];
  const high = sorted[sorted.length - 1];
  const low = sorted[0];
  const variance =
    values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const range = high - low;

  return { mean, median, high, low, stdDev, range, count: values.length };
}

function computeTvlStats(history: FullVaultHistory, currentTvl: number) {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const thirtyDaysAgo = nowSeconds - 30 * 24 * 60 * 60;
  const recent = history.tvlHistory.filter(
    (p) => p.timestamp >= thirtyDaysAgo && p.value > 0,
  );
  if (recent.length < 2) return null;

  const values = recent.map((p) => p.value);
  const sorted = [...values].sort((a, b) => a - b);
  const sum = values.reduce((s, v) => s + v, 0);
  const mean = sum / values.length;
  const high = sorted[sorted.length - 1];
  const low = sorted[0];

  // Largest single-day change (absolute)
  const chronological = [...recent].sort((a, b) => a.timestamp - b.timestamp);
  let largestDayChange = 0;
  for (let i = 1; i < chronological.length; i++) {
    const change = Math.abs(chronological[i].value - chronological[i - 1].value);
    if (change > largestDayChange) {
      largestDayChange = change;
    }
  }

  return { currentTvl, mean, high, low, largestDayChange, count: values.length };
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 py-2 last:border-b-0">
      <span className="text-[13px] text-gray-500">{label}</span>
      <span className="text-[13px] font-medium text-gray-900">{value}</span>
    </div>
  );
}

export function VaultStatistics({ history, currentTvl }: VaultStatisticsProps) {
  const apyStats = computeApyStats(history);
  const tvlStats = computeTvlStats(history, currentTvl);

  if (!apyStats && !tvlStats) return null;

  return (
    <section className="mb-10">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        30-Day Statistics
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {apyStats && (
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="mb-2 text-sm font-semibold text-gray-700">
              APY Stats (30D)
            </h3>
            <StatRow label="Average APY" value={formatAPY(apyStats.mean)} />
            <StatRow label="Median APY" value={formatAPY(apyStats.median)} />
            <StatRow label="High" value={formatAPY(apyStats.high)} />
            <StatRow label="Low" value={formatAPY(apyStats.low)} />
            <StatRow
              label="Std Deviation"
              value={`${apyStats.stdDev.toFixed(2)}%`}
            />
            <StatRow
              label="APY Range"
              value={`${apyStats.range.toFixed(2)}%`}
            />
          </div>
        )}
        {tvlStats && (
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="mb-2 text-sm font-semibold text-gray-700">
              TVL Stats
            </h3>
            <StatRow label="Current TVL" value={formatTVL(tvlStats.currentTvl)} />
            <StatRow label="30D Average" value={formatTVL(tvlStats.mean)} />
            <StatRow label="30D High" value={formatTVL(tvlStats.high)} />
            <StatRow label="30D Low" value={formatTVL(tvlStats.low)} />
            <StatRow
              label="Largest Daily Change"
              value={formatTVL(tvlStats.largestDayChange)}
            />
          </div>
        )}
      </div>
    </section>
  );
}
