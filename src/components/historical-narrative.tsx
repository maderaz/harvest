import { formatTVL } from "@/lib/format";
import type { FullVaultHistory } from "@/lib/history-api";

interface Props {
  history: FullVaultHistory;
}

// Flowing prose for the long-term performance story, distinct from the
// numbered Performance Overview bullets which surface short-term critical
// signals. Each paragraph only renders when the underlying data is rich
// enough for the narrative to be meaningful.
export function HistoricalNarrative({ history }: Props) {
  const items: Array<{
    text: string;
    trajectory: "up" | "down" | "sideways";
  }> = [];

  // Share-price CAGR (annualized compounding rate)
  if (history.sharePriceHistory.length >= 2) {
    const sorted = [...history.sharePriceHistory].sort(
      (a, b) => a.timestamp - b.timestamp,
    );
    const first = sorted[0].sharePrice;
    const last = sorted[sorted.length - 1].sharePrice;
    const daySpan =
      (sorted[sorted.length - 1].timestamp - sorted[0].timestamp) / 86400;
    if (first > 0 && daySpan >= 30) {
      const totalReturn = (last - first) / first;
      const cagr = (Math.pow(1 + totalReturn, 365 / daySpan) - 1) * 100;
      items.push({
        text: `Share price has compounded at an annualized rate of ${cagr.toFixed(2)}% over ${Math.round(daySpan)} days, growing from ${first.toFixed(4)} to ${last.toFixed(4)}.`,
        trajectory: cagr >= 0 ? "up" : "down",
      });
    }
  }

  // TVL drawdown story: peak to trough, optional recovery
  if (history.tvlHistory.length >= 10) {
    const sorted = [...history.tvlHistory].sort(
      (a, b) => a.timestamp - b.timestamp,
    );
    let peakVal = 0;
    let peakTs = 0;
    let troughVal = Infinity;
    let troughTs = 0;
    let maxDrawdownPct = 0;

    for (const p of sorted) {
      if (p.value > peakVal) {
        peakVal = p.value;
        peakTs = p.timestamp;
        troughVal = p.value;
        troughTs = p.timestamp;
      }
      if (peakVal > 0 && p.value < troughVal) {
        troughVal = p.value;
        troughTs = p.timestamp;
        const dd = ((peakVal - troughVal) / peakVal) * 100;
        if (dd > maxDrawdownPct) maxDrawdownPct = dd;
      }
    }

    if (maxDrawdownPct >= 15 && peakVal > 0) {
      const daysDown = Math.round((troughTs - peakTs) / 86400);
      const currentTvl = sorted[sorted.length - 1].value;
      const recoveryPct =
        troughVal > 0 ? ((currentTvl - troughVal) / troughVal) * 100 : 0;
      const atPeak = currentTvl >= peakVal * 0.9;

      if (atPeak) {
        items.push({
          text: `TVL fell ${maxDrawdownPct.toFixed(0)}% from its ${formatTVL(peakVal)} peak over ${daysDown} days before recovering to its current ${formatTVL(currentTvl)}.`,
          trajectory: "sideways",
        });
      } else if (recoveryPct > 10) {
        items.push({
          text: `TVL experienced a ${maxDrawdownPct.toFixed(0)}% drawdown from its ${formatTVL(peakVal)} peak, bottoming at ${formatTVL(troughVal)} over ${daysDown} days. It has since recovered ${recoveryPct.toFixed(0)}% to ${formatTVL(currentTvl)}.`,
          trajectory: recoveryPct > maxDrawdownPct * 0.5 ? "sideways" : "down",
        });
      } else {
        items.push({
          text: `TVL drew down ${maxDrawdownPct.toFixed(0)}% from a peak of ${formatTVL(peakVal)} to ${formatTVL(troughVal)} over ${daysDown} days and currently stands at ${formatTVL(currentTvl)}.`,
          trajectory: "down",
        });
      }
    }
  }

  // Best / worst month by average APY
  if (history.apyHistory.length >= 60) {
    const validApy = history.apyHistory.filter((p) => p.apy >= 0);
    const monthMap = new Map<string, number[]>();
    for (const p of validApy) {
      const d = new Date(p.timestamp * 1000);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const arr = monthMap.get(key) || [];
      arr.push(p.apy);
      monthMap.set(key, arr);
    }
    const months = [...monthMap.entries()]
      .filter(([, vals]) => vals.length >= 5)
      .map(([key, vals]) => ({
        key,
        avg: vals.reduce((s, v) => s + v, 0) / vals.length,
      }));

    if (months.length >= 3) {
      const best = months.reduce((a, b) => (b.avg > a.avg ? b : a));
      const worst = months.reduce((a, b) => (b.avg < a.avg ? b : a));
      const fmtMonth = (k: string) => {
        const [y, m] = k.split("-");
        return new Date(Number(y), Number(m) - 1).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });
      };
      if (best.key !== worst.key) {
        items.push({
          text: `Best performing month was ${fmtMonth(best.key)} at ${best.avg.toFixed(2)}% average APY; weakest was ${fmtMonth(worst.key)} at ${worst.avg.toFixed(2)}%.`,
          trajectory: best.avg >= worst.avg ? "up" : "sideways",
        });
      }
    }
  }

  if (items.length === 0) return null;

  const trajectoryIcon: Record<"up" | "down" | "sideways", string> = {
    up: "↗",
    down: "↘",
    sideways: "→",
  };

  return (
    <section className="pp-section" id="long-term">
      <h2>Long-term performance</h2>
      <ul className="about-prose about-prose-list">
        {items.map((item, i) => (
          <li key={i} className="about-prose-item">
            <span
              className={`about-prose-icon about-prose-icon--${item.trajectory}`}
              aria-hidden="true"
            >
              {trajectoryIcon[item.trajectory]}
            </span>
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
