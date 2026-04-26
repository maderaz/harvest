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

export function VaultStatistics({ history, currentTvl }: VaultStatisticsProps) {
  const apyStats = computeApyStats(history);
  const tvlStats = computeTvlStats(history, currentTvl);

  if (!apyStats && !tvlStats) return null;

  return (
    <div className="pp-section" id="statistics">
      <h2>30-Day Statistics</h2>
      <div className="hist-grid">
        {apyStats && (
          <div className="hist-block">
            <h3>APY Statistics</h3>
            <table className="stat-table">
              <tbody>
                <tr>
                  <th>30D Average</th>
                  <td>{formatAPY(apyStats.mean)}</td>
                </tr>
                <tr>
                  <th>Median APY</th>
                  <td>{formatAPY(apyStats.median)}</td>
                </tr>
                <tr>
                  <th>30D High</th>
                  <td>{formatAPY(apyStats.high)}</td>
                </tr>
                <tr>
                  <th>30D Low</th>
                  <td>{formatAPY(apyStats.low)}</td>
                </tr>
                <tr>
                  <th>Std Deviation</th>
                  <td>{apyStats.stdDev.toFixed(2)}%</td>
                </tr>
                <tr>
                  <th>APY Range</th>
                  <td>{apyStats.range.toFixed(2)}pp</td>
                </tr>
                <tr>
                  <th>Data Points</th>
                  <td>{apyStats.count}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        {tvlStats && (
          <div className="hist-block">
            <h3>TVL Statistics</h3>
            <table className="stat-table">
              <tbody>
                <tr>
                  <th>Current TVL</th>
                  <td>{formatTVL(tvlStats.currentTvl)}</td>
                </tr>
                <tr>
                  <th>30D Average</th>
                  <td>{formatTVL(tvlStats.mean)}</td>
                </tr>
                <tr>
                  <th>30D High</th>
                  <td>{formatTVL(tvlStats.high)}</td>
                </tr>
                <tr>
                  <th>30D Low</th>
                  <td>{formatTVL(tvlStats.low)}</td>
                </tr>
                <tr>
                  <th>Largest Daily Change</th>
                  <td>{formatTVL(tvlStats.largestDayChange)}</td>
                </tr>
                <tr>
                  <th>Data Points</th>
                  <td>{tvlStats.count}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
