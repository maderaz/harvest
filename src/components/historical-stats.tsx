import { formatAPY, formatTVL } from "@/lib/format";
import type { FullVaultHistory } from "@/lib/history-api";

function median(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const avg = values.reduce((s, v) => s + v, 0) / values.length;
  return Math.sqrt(values.reduce((s, v) => s + (v - avg) ** 2, 0) / values.length);
}

function formatDate(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function HistoricalStats({ history }: { history: FullVaultHistory }) {
  const now = Math.floor(Date.now() / 1000);
  const thirtyDaysAgo = now - 30 * 86400;

  const apy30d = history.apyHistory.filter((p) => p.apy >= 0 && p.timestamp >= thirtyDaysAgo);
  const allApy = history.apyHistory.filter((p) => p.apy >= 0);
  const tvl30d = history.tvlHistory.filter((p) => p.timestamp >= thirtyDaysAgo);

  if (allApy.length < 3 && tvl30d.length < 3) return null;

  const apyValues = apy30d.map((p) => p.apy);
  const allApyValues = allApy.map((p) => p.apy);

  const apyStats = apyValues.length >= 2 ? {
    low: Math.min(...apyValues),
    high: Math.max(...apyValues),
    avg: apyValues.reduce((s, v) => s + v, 0) / apyValues.length,
    lifetimeAvg: allApyValues.reduce((s, v) => s + v, 0) / allApyValues.length,
    med: median(apyValues),
    bestDay: apy30d.reduce((best, p) => p.apy > best.apy ? p : best, apy30d[0]),
    worstDay: apy30d.reduce((worst, p) => p.apy < worst.apy ? p : worst, apy30d[0]),
    vol: stdDev(apyValues),
    dataPoints: allApy.length,
    range: Math.max(...apyValues) - Math.min(...apyValues),
  } : null;

  const tvlValues = tvl30d.map((p) => p.value);
  const tvlStats = tvlValues.length >= 2 ? {
    low: Math.min(...tvlValues),
    high: Math.max(...tvlValues),
    avg: tvlValues.reduce((s, v) => s + v, 0) / tvlValues.length,
    med: median(tvlValues),
    current: tvl30d[tvl30d.length - 1]?.value || 0,
  } : null;

  return (
    <section className="pp-section" id="history">
      <h2>Historical statistics</h2>
      <div className="hist-grid">
        {apyStats && (
          <div className="hist-block">
            <h3>Historical APY statistics</h3>
            <table className="hist-table">
              <tbody>
                <tr><th>30D Low</th><td>{formatAPY(apyStats.low)}</td></tr>
                <tr><th>30D High</th><td>{formatAPY(apyStats.high)}</td></tr>
                <tr><th>30D Average</th><td>{formatAPY(apyStats.avg)}</td></tr>
                <tr><th>Lifetime avg ({apyStats.dataPoints}d)</th><td>{formatAPY(apyStats.lifetimeAvg)}</td></tr>
                <tr><th>Median APY</th><td>{formatAPY(apyStats.med)}</td></tr>
                <tr><th>Best day</th><td>{formatAPY(apyStats.bestDay.apy)} · {formatDate(apyStats.bestDay.timestamp)}</td></tr>
                <tr><th>Worst day</th><td>{formatAPY(apyStats.worstDay.apy)} · {formatDate(apyStats.worstDay.timestamp)}</td></tr>
                <tr><th>Volatility</th><td>{apyStats.vol.toFixed(2)} {apyStats.vol > 5 ? "High" : apyStats.vol > 2 ? "Medium" : "Low"}</td></tr>
                <tr><th>APY range</th><td>{apyStats.range.toFixed(2)}pp</td></tr>
                <tr><th>Data points</th><td>{apyStats.dataPoints} days</td></tr>
              </tbody>
            </table>
          </div>
        )}
        {tvlStats && (
          <div className="hist-block">
            <h3>Historical TVL statistics</h3>
            <table className="hist-table">
              <tbody>
                <tr><th>30D Low</th><td>{formatTVL(tvlStats.low)}</td></tr>
                <tr><th>30D High</th><td>{formatTVL(tvlStats.high)}</td></tr>
                <tr><th>30D Average</th><td>{formatTVL(tvlStats.avg)}</td></tr>
                <tr><th>Median TVL</th><td>{formatTVL(tvlStats.med)}</td></tr>
                <tr><th>Current TVL</th><td>{formatTVL(tvlStats.current)}</td></tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
