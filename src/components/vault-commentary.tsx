import { YieldVault } from "@/lib/types";
import { formatAPY, formatTVL } from "@/lib/format";
import type { FullVaultHistory } from "@/lib/history-api";

interface VaultCommentaryProps {
  vault: YieldVault;
  allVaults: YieldVault[];
  history: FullVaultHistory;
}

function getTvlCategory(tvl: number): string {
  if (tvl >= 1_000_000) return "mega";
  if (tvl >= 100_000) return "large";
  if (tvl >= 10_000) return "mid";
  if (tvl >= 1_000) return "small";
  return "micro";
}

function getTvlLabel(category: string): string {
  switch (category) {
    case "mega":
      return "one of the largest";
    case "large":
      return "a large";
    case "mid":
      return "a mid-sized";
    case "small":
      return "a small";
    default:
      return "a micro";
  }
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

  // APY Ranking among same-asset vaults
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

  // TVL Context
  if (vault.tvl > 0) {
    const category = getTvlCategory(vault.tvl);
    const label = getTvlLabel(category);
    paragraphs.push(
      `With ${formatTVL(vault.tvl)} TVL, this is ${label} ${vault.asset} vault on Harvest.`,
    );
  }

  // 30D APY Performance
  if (history.apyHistory.length >= 2) {
    const apyValues = history.apyHistory
      .filter((p) => p.apy >= 0)
      .map((p) => p.apy);
    if (apyValues.length > 0) {
      const avg = apyValues.reduce((s, v) => s + v, 0) / apyValues.length;
      paragraphs.push(
        `APY has averaged ${avg.toFixed(2)}% over the available history period.`,
      );
    }
  }

  // TVL Trend (30D)
  if (history.tvlHistory.length >= 2) {
    const sorted = [...history.tvlHistory].sort(
      (a, b) => a.timestamp - b.timestamp,
    );
    const oldest = sorted[0].value;
    const newest = sorted[sorted.length - 1].value;
    if (oldest > 0) {
      const changePct = ((newest - oldest) / oldest) * 100;
      const direction = changePct >= 0 ? "grew" : "declined";
      paragraphs.push(
        `TVL ${direction} ${Math.abs(changePct).toFixed(1)}% over the tracked period, from ${formatTVL(oldest)} to ${formatTVL(newest)}.`,
      );
    }
  }

  // Share Price Growth
  if (history.sharePriceHistory.length >= 2) {
    const sorted = [...history.sharePriceHistory].sort(
      (a, b) => a.timestamp - b.timestamp,
    );
    const first = sorted[0].sharePrice;
    const last = sorted[sorted.length - 1].sharePrice;
    if (first > 0) {
      const growth = ((last - first) / first) * 100;
      paragraphs.push(
        `Share price has grown from ${first.toFixed(3)} to ${last.toFixed(3)} since inception, representing a ${growth.toFixed(2)}% cumulative return.`,
      );
    }
  }

  // Chain Context
  if (sameAssetChainVaults.length > 0) {
    paragraphs.push(
      `${vault.productName} is one of ${sameAssetChainVaults.length} ${vault.asset} vault${sameAssetChainVaults.length !== 1 ? "s" : ""} available on ${vault.chain}.`,
    );
  }

  // Comparison with most popular vault (highest TVL) on same asset + chain
  if (sameAssetChainVaults.length > 1) {
    const others = sameAssetChainVaults.filter((v) => v.id !== vault.id);
    const mostPopular = others.sort((a, b) => b.tvl - a.tvl)[0];
    if (mostPopular && mostPopular.apy24h > 0 && vault.apy24h > 0) {
      const diff = vault.apy24h - mostPopular.apy24h;
      const sign = diff >= 0 ? "+" : "";
      paragraphs.push(
        `Compared to ${mostPopular.productName} (${formatAPY(mostPopular.apy24h)}), this vault offers a ${sign}${diff.toFixed(2)}% APY difference.`,
      );
    }
  }

  if (paragraphs.length === 0) return null;

  return (
    <section className="mb-10">
      <h2 className="mb-3 text-lg font-semibold text-gray-900">
        Performance Overview
      </h2>
      <div className="space-y-3">
        {paragraphs.map((text, i) => (
          <p key={i} className="leading-relaxed text-gray-600">
            {text}
          </p>
        ))}
      </div>
    </section>
  );
}
