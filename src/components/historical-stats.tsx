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

  // When TVL stats exist, render APY + TVL side by side. Otherwise split the
  // APY table into two columns so the section uses the full width.
  const apyRows = apyStats
    ? [
        { label: "30D Low", value: formatAPY(apyStats.low) },
        { label: "30D High", value: formatAPY(apyStats.high) },
        { label: "30D Average", value: formatAPY(apyStats.avg) },
        { label: `Lifetime avg (${apyStats.dataPoints}d)`, value: formatAPY(apyStats.lifetimeAvg) },
        { label: "Median APY", value: formatAPY(apyStats.med) },
        { label: "Best day", value: `${formatAPY(apyStats.bestDay.apy)} · ${formatDate(apyStats.bestDay.timestamp)}` },
        { label: "Worst day", value: `${formatAPY(apyStats.worstDay.apy)} · ${formatDate(apyStats.worstDay.timestamp)}` },
        { label: "Volatility", value: `${apyStats.vol.toFixed(2)} ${apyStats.vol > 5 ? "High" : apyStats.vol > 2 ? "Medium" : "Low"}` },
        { label: "APY range", value: `${apyStats.range.toFixed(2)}pp` },
      ]
    : [];

  const split = !tvlStats && apyRows.length >= 4;
  const apyHalf = split ? Math.ceil(apyRows.length / 2) : apyRows.length;

  // Narrative intro paragraph — trend direction over lifetime
  const narratives: string[] = [];

  if (apyStats && apyStats.dataPoints >= 30) {
    const sorted = [...allApy].sort((a, b) => a.timestamp - b.timestamp);
    const firstQuarter = sorted.slice(0, Math.ceil(sorted.length / 4));
    const lastQuarter = sorted.slice(-Math.ceil(sorted.length / 4));
    const earlyAvg = firstQuarter.reduce((s, p) => s + p.apy, 0) / firstQuarter.length;
    const lateAvg = lastQuarter.reduce((s, p) => s + p.apy, 0) / lastQuarter.length;
    const changePct = earlyAvg > 0 ? ((lateAvg - earlyAvg) / earlyAvg) * 100 : 0;
    if (Math.abs(changePct) > 10) {
      const dir = changePct > 0 ? "an upward" : "a downward";
      const verb = changePct > 0 ? "expanding" : "contracting";
      narratives.push(
        `Over the past ${apyStats.dataPoints} days, this vault's yield has shown ${dir} trend, with yields ${verb} from ${earlyAvg.toFixed(2)}% to ${lateAvg.toFixed(2)}%, a ${Math.abs(changePct).toFixed(1)}% ${changePct > 0 ? "increase" : "decrease"}.`,
      );
    }
  }

  if (tvlStats) {
    const sorted = [...history.tvlHistory]
      .filter((p) => p.value > 0)
      .sort((a, b) => a.timestamp - b.timestamp);
    if (sorted.length >= 10) {
      const first = sorted[0].value;
      const last = sorted[sorted.length - 1].value;
      const changePct = first > 0 ? ((last - first) / first) * 100 : 0;
      if (Math.abs(changePct) > 10) {
        const dir = changePct > 0 ? "growth" : "contraction";
        const verb = changePct > 0 ? "increasing" : "declining";
        narratives.push(
          `Total value locked has experienced ${dir}, ${verb} from ${formatTVL(first)} to ${formatTVL(last)}, a ${Math.abs(changePct).toFixed(1)}% ${changePct > 0 ? "increase" : "reduction"}.`,
        );
      }
    }
  }

  return (
    <section className="pp-section" id="history">
      <h2>Historical statistics</h2>
      {narratives.length > 0 && (
        <div className="about-prose" style={{ marginBottom: 16 }}>
          {narratives.map((text, i) => (
            <p key={i}>{text}</p>
          ))}
        </div>
      )}
      <div className="hist-grid">
        {apyStats && (
          <div className="hist-block">
            <h3>Historical APY statistics</h3>
            <table className="hist-table">
              <tbody>
                {apyRows.slice(0, apyHalf).map((r) => (
                  <tr key={r.label}><th>{r.label}</th><td>{r.value}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {apyStats && split && (
          <div className="hist-block">
            <h3>&nbsp;</h3>
            <table className="hist-table">
              <tbody>
                {apyRows.slice(apyHalf).map((r) => (
                  <tr key={r.label}><th>{r.label}</th><td>{r.value}</td></tr>
                ))}
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
