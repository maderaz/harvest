import { formatTVL } from "@/lib/format";
import type { FullVaultHistory } from "@/lib/history-api";

interface VaultLongTermProps {
  history: FullVaultHistory;
}

function ArrowUp({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M8 13V3M8 3L4 7M8 3L12 7"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M8 3V13M8 13L4 9M8 13L12 9"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M3 8H13M13 8L9 4M13 8L9 12"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type Direction = "up" | "down" | "sideways";

function DirectionIcon({ direction }: { direction: Direction }) {
  if (direction === "up")
    return (
      <ArrowUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-500" />
    );
  if (direction === "down")
    return (
      <ArrowDown className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
    );
  return (
    <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
  );
}

function BulletRow({
  direction,
  children,
}: {
  direction: Direction;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: any;
}) {
  return (
    <li className="flex items-start gap-2.5">
      <DirectionIcon direction={direction} />
      <span className="text-[13.5px] leading-snug text-gray-600">
        {children}
      </span>
    </li>
  );
}

function computeSharePriceStats(history: FullVaultHistory) {
  if (history.sharePriceHistory.length < 2) return null;

  const sorted = [...history.sharePriceHistory].sort(
    (a, b) => a.timestamp - b.timestamp,
  );
  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  const days = (last.timestamp - first.timestamp) / 86400;
  if (days < 1) return null;

  const totalReturn = (last.sharePrice - first.sharePrice) / first.sharePrice;
  const annualizedRate = (Math.pow(1 + totalReturn, 365 / days) - 1) * 100;

  return {
    days: Math.round(days),
    startPrice: first.sharePrice,
    endPrice: last.sharePrice,
    totalReturnPct: totalReturn * 100,
    annualizedRate,
  };
}

function computeTvlDrawdown(history: FullVaultHistory) {
  if (history.tvlHistory.length < 2) return null;

  const sorted = [...history.tvlHistory]
    .filter((p) => p.value > 0)
    .sort((a, b) => a.timestamp - b.timestamp);
  if (sorted.length < 2) return null;

  let peak = 0;
  let peakIdx = 0;
  let trough = Infinity;
  let troughIdx = 0;
  let maxDrawdownPct = 0;
  let drawdownPeakValue = 0;
  let drawdownTroughValue = 0;
  let drawdownDays = 0;

  for (let i = 0; i < sorted.length; i++) {
    const v = sorted[i].value;
    if (v > peak) {
      peak = v;
      peakIdx = i;
    }
    const dd = (peak - v) / peak;
    if (dd > maxDrawdownPct) {
      maxDrawdownPct = dd;
      drawdownPeakValue = peak;
      drawdownTroughValue = v;
      troughIdx = i;
      drawdownDays = Math.round(
        (sorted[i].timestamp - sorted[peakIdx].timestamp) / 86400,
      );
    }
  }

  if (maxDrawdownPct === 0) return null;

  const current = sorted[sorted.length - 1].value;
  const recoveryFromTrough =
    drawdownTroughValue > 0
      ? ((current - drawdownTroughValue) / (drawdownPeakValue - drawdownTroughValue)) *
        100
      : 0;

  const isRecovered = current >= drawdownPeakValue * 0.95;

  return {
    maxDrawdownPct: maxDrawdownPct * 100,
    peakValue: drawdownPeakValue,
    troughValue: drawdownTroughValue,
    currentValue: current,
    drawdownDays,
    recoveryPct: Math.min(100, Math.max(0, recoveryFromTrough)),
    isRecovered,
  };
}

function computeMonthlyApy(history: FullVaultHistory) {
  if (history.apyHistory.length < 5) return null;

  const byMonth = new Map<string, number[]>();
  for (const p of history.apyHistory) {
    const d = new Date(p.timestamp * 1000);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    const arr = byMonth.get(key) ?? [];
    arr.push(p.apy);
    byMonth.set(key, arr);
  }

  if (byMonth.size < 2) return null;

  const monthlyAvgs: { label: string; avg: number }[] = [];
  for (const [key, vals] of byMonth.entries()) {
    if (vals.length < 2) continue;
    const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
    const [year, month] = key.split("-");
    const label = new Date(
      parseInt(year),
      parseInt(month) - 1,
      1,
    ).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    monthlyAvgs.push({ label, avg });
  }

  if (monthlyAvgs.length < 2) return null;

  const best = monthlyAvgs.reduce((a, b) => (a.avg >= b.avg ? a : b));
  const worst = monthlyAvgs.reduce((a, b) => (a.avg <= b.avg ? a : b));

  return { best, worst };
}

export function VaultLongTerm({ history }: VaultLongTermProps) {
  const sharePrice = computeSharePriceStats(history);
  const tvlDrawdown = computeTvlDrawdown(history);
  const monthlyApy = computeMonthlyApy(history);

  if (!sharePrice && !tvlDrawdown && !monthlyApy) return null;

  return (
    <section className="mb-10">
      <h2 className="mb-3 text-lg font-semibold text-gray-900">
        Long-term performance
      </h2>
      <ul className="space-y-2.5">
        {sharePrice && (
          <BulletRow
            direction={
              sharePrice.annualizedRate > 2
                ? "up"
                : sharePrice.annualizedRate < -2
                  ? "down"
                  : "sideways"
            }
          >
            Share price has compounded at{" "}
            <strong className="font-semibold text-gray-800">
              {sharePrice.annualizedRate.toFixed(2)}% annualized
            </strong>{" "}
            over {sharePrice.days} days, growing from{" "}
            {sharePrice.startPrice.toFixed(4)} to{" "}
            <strong className="font-semibold text-gray-800">
              {sharePrice.endPrice.toFixed(4)}
            </strong>
            .
          </BulletRow>
        )}

        {tvlDrawdown && (
          <BulletRow
            direction={
              tvlDrawdown.isRecovered
                ? "sideways"
                : tvlDrawdown.recoveryPct > 30
                  ? "up"
                  : "down"
            }
          >
            TVL experienced a{" "}
            <strong className="font-semibold text-gray-800">
              {tvlDrawdown.maxDrawdownPct.toFixed(0)}% drawdown
            </strong>{" "}
            from its {formatTVL(tvlDrawdown.peakValue)} peak, bottoming at{" "}
            {formatTVL(tvlDrawdown.troughValue)} over {tvlDrawdown.drawdownDays}{" "}
            days.
            {!tvlDrawdown.isRecovered && tvlDrawdown.recoveryPct > 0 && (
              <>
                {" "}
                It has since recovered{" "}
                <strong className="font-semibold text-gray-800">
                  {tvlDrawdown.recoveryPct.toFixed(0)}%
                </strong>{" "}
                to {formatTVL(tvlDrawdown.currentValue)}.
              </>
            )}
            {tvlDrawdown.isRecovered && (
              <> TVL has since fully recovered.</>
            )}
          </BulletRow>
        )}

        {monthlyApy && (
          <>
            <BulletRow direction="up">
              Best month was{" "}
              <strong className="font-semibold text-gray-800">
                {monthlyApy.best.label}
              </strong>{" "}
              at {monthlyApy.best.avg.toFixed(2)}% average APY.
            </BulletRow>
            <BulletRow direction="down">
              Weakest month was{" "}
              <strong className="font-semibold text-gray-800">
                {monthlyApy.worst.label}
              </strong>{" "}
              at {monthlyApy.worst.avg.toFixed(2)}% average APY.
            </BulletRow>
          </>
        )}
      </ul>
    </section>
  );
}
