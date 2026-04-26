import { YieldVault } from "@/lib/types";
import { formatAPY, formatTVL } from "@/lib/format";
import type { FullVaultHistory } from "@/lib/history-api";

interface VaultCommentaryProps {
  vault: YieldVault;
  allVaults: YieldVault[];
  history: FullVaultHistory;
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const avg = values.reduce((s, v) => s + v, 0) / values.length;
  const sqDiffs = values.map((v) => (v - avg) ** 2);
  return Math.sqrt(sqDiffs.reduce((s, v) => s + v, 0) / values.length);
}

function getStabilityLabel(sd: number): string {
  if (sd < 0.5) return "very stable";
  if (sd < 1.5) return "stable";
  if (sd < 3) return "moderately volatile";
  return "volatile";
}

export function VaultCommentary({
  vault,
  allVaults,
  history,
}: VaultCommentaryProps) {
  const sameAssetVaults = allVaults.filter((v) => v.asset === vault.asset);
  const sameAssetChainVaults = sameAssetVaults.filter(
    (v) => v.chain === vault.chain,
  );

  const paragraphs: string[] = [];

  const nowSeconds = Math.floor(Date.now() / 1000);
  const oneDayAgo = nowSeconds - 24 * 60 * 60;
  const sevenDaysAgo = nowSeconds - 7 * 24 * 60 * 60;
  const thirtyDaysAgo = nowSeconds - 30 * 24 * 60 * 60;

  // APY Ranking
  if (vault.apy24h > 0 && sameAssetVaults.length > 1) {
    const sorted = [...sameAssetVaults]
      .filter((v) => v.apy24h > 0)
      .sort((a, b) => b.apy24h - a.apy24h);
    const rank = sorted.findIndex((v) => v.id === vault.id) + 1;
    if (rank > 0) {
      const outperformPct = (
        ((sorted.length - rank) / sorted.length) *
        100
      ).toFixed(0);
      paragraphs.push(
        `This vault's ${formatAPY(vault.apy24h)} APY ranks #${rank} out of ${sorted.length} ${vault.asset} vaults, outperforming ${outperformPct}% of ${vault.asset} vaults on Harvest.`,
      );
    }
  }

  // APY Stability Analysis
  if (history.apyHistory.length >= 5) {
    const validApy = history.apyHistory.filter((p) => p.apy >= 0);

    const recent24h = validApy.filter((p) => p.timestamp >= oneDayAgo);
    const recent7d = validApy.filter((p) => p.timestamp >= sevenDaysAgo);
    const recent30d = validApy.filter((p) => p.timestamp >= thirtyDaysAgo);

    if (recent30d.length >= 5) {
      const apyValues = recent30d.map((p) => p.apy);
      const avg = apyValues.reduce((s, v) => s + v, 0) / apyValues.length;
      const sd = stdDev(apyValues);
      const min = Math.min(...apyValues);
      const max = Math.max(...apyValues);
      const label = getStabilityLabel(sd);

      paragraphs.push(
        `Over the past 30 days, APY has been ${label}, averaging ${avg.toFixed(2)}% with a range of ${min.toFixed(2)}% to ${max.toFixed(2)}%.`,
      );

      if (vault.apy24h > 0 && avg > 0) {
        const deviationFromAvg = vault.apy24h - avg;
        const deviationPct = (deviationFromAvg / avg) * 100;

        if (Math.abs(deviationPct) > 30) {
          const direction = deviationPct > 0 ? "above" : "below";
          paragraphs.push(
            `Current 24h APY of ${formatAPY(vault.apy24h)} is ${Math.abs(deviationPct).toFixed(0)}% ${direction} the 30-day average, suggesting a potential short-term deviation.`,
          );
        }
      }
    }

    if (recent7d.length >= 3) {
      const sorted7d = [...recent7d].sort((a, b) => a.timestamp - b.timestamp);
      const firstHalf = sorted7d.slice(0, Math.floor(sorted7d.length / 2));
      const secondHalf = sorted7d.slice(Math.floor(sorted7d.length / 2));
      const firstAvg = firstHalf.reduce((s, p) => s + p.apy, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((s, p) => s + p.apy, 0) / secondHalf.length;
      const trendDiff = secondAvg - firstAvg;

      if (Math.abs(trendDiff) > 0.5) {
        const direction = trendDiff > 0 ? "trending upward" : "trending downward";
        paragraphs.push(
          `Over the past 7 days, APY has been ${direction}, moving from an average of ${firstAvg.toFixed(2)}% to ${secondAvg.toFixed(2)}%.`,
        );
      }
    }
  }

  // TVL Context
  if (vault.tvl > 0) {
    const tvlRank = [...sameAssetVaults]
      .filter((v) => v.tvl > 0)
      .sort((a, b) => b.tvl - a.tvl);
    const rank = tvlRank.findIndex((v) => v.id === vault.id) + 1;
    if (rank > 0 && rank <= 5) {
      paragraphs.push(
        `With ${formatTVL(vault.tvl)} TVL, this is the #${rank} most deposited ${vault.asset} vault on Harvest.`,
      );
    } else if (vault.tvl > 0) {
      paragraphs.push(
        `This vault holds ${formatTVL(vault.tvl)} in total value locked.`,
      );
    }
  }

  // TVL Trend
  if (history.tvlHistory.length >= 2) {
    const recent = [...history.tvlHistory]
      .filter((p) => p.timestamp >= thirtyDaysAgo)
      .sort((a, b) => a.timestamp - b.timestamp);
    if (recent.length >= 2) {
      const oldest = recent[0].value;
      const newest = recent[recent.length - 1].value;
      if (oldest > 0) {
        const changePct = ((newest - oldest) / oldest) * 100;
        const direction = changePct >= 0 ? "increased" : "decreased";
        paragraphs.push(
          `TVL has ${direction} ${Math.abs(changePct).toFixed(1)}% over the past 30 days, from ${formatTVL(oldest)} to ${formatTVL(newest)}.`,
        );
      }
    }
  }

  // Share Price
  if (history.sharePriceHistory.length >= 2) {
    const sorted = [...history.sharePriceHistory].sort(
      (a, b) => a.timestamp - b.timestamp,
    );
    const first = sorted[0].sharePrice;
    const last = sorted[sorted.length - 1].sharePrice;
    if (first > 0) {
      const growth = ((last - first) / first) * 100;
      paragraphs.push(
        `Share price stands at ${last.toFixed(4)}, representing a ${growth.toFixed(2)}% cumulative return since inception.`,
      );
    }
  }

  // Yield Sources
  if (vault.apyBreakdown.length > 0) {
    const sources = vault.apyBreakdown.filter((s) => s.apy > 0);
    if (sources.length === 1) {
      paragraphs.push(
        `Yield is generated from a single source: ${sources[0].apy.toFixed(2)}% ${sources[0].source === "Base Rate" ? "base rate" : `from ${sources[0].source}`}.`,
      );
    } else if (sources.length > 1) {
      const parts = sources.map((s) =>
        s.source === "Base Rate"
          ? `${s.apy.toFixed(2)}% base lending rate`
          : `${s.apy.toFixed(2)}% in ${s.source} rewards`,
      );
      paragraphs.push(
        `Yield is generated from ${sources.length} sources: ${parts.join(" and ")}.`,
      );
    }
  }

  // Comparison with highest-TVL vault on same chain
  if (sameAssetChainVaults.length > 1 && vault.apy24h > 0) {
    const others = sameAssetChainVaults.filter((v) => v.id !== vault.id && v.apy24h > 0);
    const mostPopular = others.sort((a, b) => b.tvl - a.tvl)[0];
    if (mostPopular) {
      const diff = vault.apy24h - mostPopular.apy24h;
      if (diff > 0) {
        paragraphs.push(
          `Compared to ${mostPopular.productName} (${formatTVL(mostPopular.tvl)} TVL, ${formatAPY(mostPopular.apy24h)}), this vault offers +${diff.toFixed(2)}% higher APY.`,
        );
      } else if (diff < -0.5) {
        paragraphs.push(
          `${mostPopular.productName}, the most deposited vault on ${vault.chain}, currently offers ${formatAPY(mostPopular.apy24h)} compared to this vault's ${formatAPY(vault.apy24h)}.`,
        );
      }
    }
  }

  // Chain context
  if (sameAssetChainVaults.length > 1) {
    paragraphs.push(
      `There are ${sameAssetChainVaults.length} ${vault.asset} vaults available on ${vault.chain} through Harvest.`,
    );
  }

  if (paragraphs.length === 0) return null;

  return (
    <div className="pp-section" id="overview">
      <h2>Performance Overview</h2>
      {paragraphs.map((text, i) => (
        <p key={i}>{text}</p>
      ))}
    </div>
  );
}
