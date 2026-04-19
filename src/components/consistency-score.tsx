import type { FullVaultHistory } from "@/lib/history-api";

interface ConsistencyScoreProps {
  history: FullVaultHistory;
  spotAPY: number;
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
    // 90-100 range, linearly interpolated
    score = Math.round(100 - (cv / 0.1) * 10);
    label = "Very Consistent";
  } else if (cv < 0.2) {
    // 70-89 range
    score = Math.round(89 - ((cv - 0.1) / 0.1) * 19);
    label = "Consistent";
  } else if (cv < 0.4) {
    // 40-69 range
    score = Math.round(69 - ((cv - 0.2) / 0.2) * 29);
    label = "Variable";
  } else {
    // 0-39 range
    const clampedCv = Math.min(cv, 1.0);
    score = Math.round(39 - ((clampedCv - 0.4) / 0.6) * 39);
    score = Math.max(0, score);
    label = "Highly Variable";
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  const staleDays = Math.floor((nowSeconds - latestTs) / DAY);
  const isStale = staleDays > STALE_THRESHOLD_DAYS;

  return {
    score,
    label,
    cv,
    mean,
    stdDev,
    dataPoints: values.length,
    latestTs,
    isStale,
    staleDays,
  };
}

function scoreColor(score: number): string {
  if (score >= 70) return "text-green-600";
  if (score >= 40) return "text-amber-600";
  return "text-red-600";
}

function scoreBorderColor(score: number): string {
  if (score >= 70) return "border-green-200";
  if (score >= 40) return "border-amber-200";
  return "border-red-200";
}

export function ConsistencyScore({
  history,
  spotAPY,
}: ConsistencyScoreProps) {
  const result = computeScore(history, spotAPY);

  if (!result) {
    return (
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          APY Consistency
        </h2>
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <p className="text-[13px] text-gray-400">
            Insufficient data to calculate a consistency score. At least 5 data
            points within the past 30 days are required.
          </p>
        </div>
      </section>
    );
  }

  const windowLabel = result.isStale
    ? `the 30 days ending ${new Date(result.latestTs * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
    : "the past 30 days";

  const explanation =
    result.score >= 70
      ? `Over ${windowLabel}, APY averaged ${result.mean.toFixed(2)}% across ${result.dataPoints} data points with a standard deviation of ${result.stdDev.toFixed(2)}%, indicating reliable yield generation.`
      : result.score >= 40
        ? `Over ${windowLabel}, APY averaged ${result.mean.toFixed(2)}% with a standard deviation of ${result.stdDev.toFixed(2)}% across ${result.dataPoints} data points, showing moderate fluctuation.`
        : `Over ${windowLabel}, APY averaged ${result.mean.toFixed(2)}% but showed ${result.stdDev.toFixed(2)}% standard deviation across ${result.dataPoints} data points, indicating significant rate volatility.`;

  return (
    <section className="mb-10">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        APY Consistency
      </h2>
      <div
        className={`rounded-lg border bg-white p-5 ${scoreBorderColor(result.score)}`}
      >
        <div className="flex items-baseline gap-3">
          <span
            className={`text-3xl font-bold ${scoreColor(result.score)}`}
          >
            {result.score}
          </span>
          <span
            className={`text-sm font-medium ${scoreColor(result.score)}`}
          >
            {result.label}
          </span>
        </div>
        <p className="mt-2 text-[13px] leading-relaxed text-gray-600">
          {explanation}
        </p>
      </div>
    </section>
  );
}
