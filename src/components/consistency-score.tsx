import { depositRef, apyToMonthly, fmtEarnings } from "@/lib/contextualize";
import type { FullVaultHistory } from "@/lib/history-api";

interface ConsistencyScoreProps {
  history: FullVaultHistory;
  spotAPY: number;
  asset: string;
}

const DAY = 24 * 60 * 60;
const STALE_THRESHOLD_DAYS = 7;

function computeScore(history: FullVaultHistory, spotAPY: number) {
  const valid = history.apyHistory.filter((p) => p.apy >= 0);
  if (valid.length === 0) return null;

  // Anchor the 30-day window to the latest available data point so we keep
  // producing a score even when the subgraph has stopped emitting APY rows.
  const latestTs = valid[valid.length - 1].timestamp;
  const windowStart = latestTs - 30 * DAY;
  const recent = valid.filter((p) => p.timestamp >= windowStart);

  if (recent.length < 5) return null;

  const values = recent.map((p) => p.apy);
  const mean = values.reduce((s, v) => s + v, 0) / values.length;

  if (mean <= 0) return null;

  const variance =
    values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const cv = stdDev / mean;

  let score: number;
  let label: string;

  if (cv < 0.1) {
    score = Math.round(100 - (cv / 0.1) * 10);
    label = "Very Consistent";
  } else if (cv < 0.2) {
    score = Math.round(89 - ((cv - 0.1) / 0.1) * 19);
    label = "Consistent";
  } else if (cv < 0.4) {
    score = Math.round(69 - ((cv - 0.2) / 0.2) * 29);
    label = "Variable";
  } else {
    const clampedCv = Math.min(cv, 1.0);
    score = Math.round(39 - ((clampedCv - 0.4) / 0.6) * 39);
    score = Math.max(0, score);
    label = "Highly Variable";
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  const staleDays = Math.floor((nowSeconds - latestTs) / DAY);
  const isStale = staleDays > STALE_THRESHOLD_DAYS;

  const minApy = Math.min(...values);
  const maxApy = Math.max(...values);

  return {
    score,
    label,
    cv,
    mean,
    stdDev,
    minApy,
    maxApy,
    dataPoints: values.length,
    latestTs,
    isStale,
    staleDays,
  };
}

export function ConsistencyScore({
  history,
  spotAPY,
  asset,
}: ConsistencyScoreProps) {
  const result = computeScore(history, spotAPY);

  if (!result) {
    return (
      <div className="pp-section" id="consistency">
        <h2>APY Consistency</h2>
        <div className="consistency">
          <div />
          <p style={{ margin: 0, fontSize: 14, color: "var(--ink-3)" }}>
            Insufficient data to calculate a consistency score. At least 5 data
            points within the past 30 days are required.
          </p>
        </div>
      </div>
    );
  }

  const windowLabel = result.isStale
    ? `the 30 days ending ${new Date(result.latestTs * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
    : "the past 30 days";

  const baseExplanation =
    result.score >= 70
      ? `Over ${windowLabel}, APY averaged ${result.mean.toFixed(2)}% across ${result.dataPoints} data points with a standard deviation of ${result.stdDev.toFixed(2)}%, indicating reliable, repeatable yield generation.`
      : result.score >= 40
        ? `Over ${windowLabel}, APY averaged ${result.mean.toFixed(2)}% with a standard deviation of ${result.stdDev.toFixed(2)}% across ${result.dataPoints} data points, showing moderate fluctuation.`
        : `Over ${windowLabel}, APY averaged ${result.mean.toFixed(2)}% but showed ${result.stdDev.toFixed(2)}% standard deviation across ${result.dataPoints} data points, indicating significant rate volatility.`;

  // Contextualization (#11)
  const ref = depositRef(asset);
  let ctx = "";
  if (result.cv < 0.1) {
    // Very Consistent: fixed wording
    ctx = ` In practice, monthly earnings on ${ref.label} have varied by less than ${asset === "ETH" || asset === "BTC" ? `0.001 ${asset}` : "$1"} over this window.`;
  } else {
    const lowMonthly = apyToMonthly(result.minApy, ref.amount);
    const highMonthly = apyToMonthly(result.maxApy, ref.amount);
    ctx = ` In practice, ${ref.label} deposited has earned anywhere from ${fmtEarnings(lowMonthly, asset)} to ${fmtEarnings(highMonthly, asset)} per month over this window.`;
  }

  const explanation = baseExplanation + ctx;

  const r = 38;
  const c = 2 * Math.PI * r;
  const dash = (result.score / 100) * c;
  const strokeColor = result.score >= 70 ? "var(--up)" : result.score >= 40 ? "#d97706" : "var(--down)";
  const labelColor = result.score >= 70 ? "var(--up)" : result.score >= 40 ? "#d97706" : "var(--down)";

  return (
    <div className="pp-section" id="consistency">
      <h2>APY Consistency</h2>
      <div className="consistency">
        <div className="consistency-score">
          <svg viewBox="0 0 96 96">
            <circle cx="48" cy="48" r={r} fill="none" stroke="var(--line)" strokeWidth="8" />
            <circle
              cx="48"
              cy="48"
              r={r}
              fill="none"
              stroke={strokeColor}
              strokeWidth="8"
              strokeDasharray={`${dash} ${c}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="num">{result.score}</div>
        </div>
        <div>
          <div className="consistency-label" style={{ color: labelColor }}>
            {result.label}
          </div>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "var(--ink-2)" }}>
            {explanation}
          </p>
        </div>
      </div>
    </div>
  );
}
