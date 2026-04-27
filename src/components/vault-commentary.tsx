import { YieldVault } from "@/lib/types";
import { formatAPY, formatTVL } from "@/lib/format";
import type { FullVaultHistory } from "@/lib/history-api";

interface VaultCommentaryProps {
  vault: YieldVault;
  allVaults: YieldVault[];
  history: FullVaultHistory;
  numbered?: boolean;
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
  numbered,
}: VaultCommentaryProps) {
  const sameAssetVaults = allVaults.filter((v) => v.asset === vault.asset);

  const paragraphs: string[] = [];

  const nowSeconds = Math.floor(Date.now() / 1000);
  const thirtyDaysAgo = nowSeconds - 30 * 24 * 60 * 60;

  // 1. APY Ranking — is this competitive?
  if (vault.apy24h > 0 && sameAssetVaults.length > 1) {
    const sorted = [...sameAssetVaults]
      .filter((v) => v.apy24h > 0)
      .sort((a, b) => b.apy24h - a.apy24h);
    const rank = sorted.findIndex((v) => v.id === vault.id) + 1;
    if (rank > 0) {
      const outperformPct = Math.round(
        ((sorted.length - rank) / sorted.length) * 100,
      );
      paragraphs.push(
        `This vault's ${formatAPY(vault.apy24h)} APY ranks #${rank} out of ${sorted.length} ${vault.asset} vaults, outperforming ${outperformPct}% of ${vault.asset} vaults listed.`,
      );
    }
  }

  // 2. APY Stability — is this APY reliable?
  if (history.apyHistory.length >= 5) {
    const validApy = history.apyHistory.filter((p) => p.apy >= 0);
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
    }
  }

  // 3. APY Percentile — is now a good time?
  if (vault.apy24h > 0 && history.apyHistory.length >= 30) {
    const allValid = history.apyHistory
      .filter((p) => p.apy >= 0)
      .map((p) => p.apy);
    if (allValid.length >= 30) {
      const below = allValid.filter((v) => v < vault.apy24h).length;
      const percentile = Math.round((below / allValid.length) * 100);
      const timeframe =
        allValid.length > 180 ? "its lifetime" : `its ${allValid.length}-day history`;
      if (percentile >= 75) {
        paragraphs.push(
          `Current APY of ${formatAPY(vault.apy24h)} sits at the ${percentile}th percentile of ${timeframe}, performing well above typical levels for this vault.`,
        );
      } else if (percentile <= 25) {
        paragraphs.push(
          `Current APY of ${formatAPY(vault.apy24h)} sits at the ${percentile}th percentile of ${timeframe}, below the vault's typical range.`,
        );
      } else {
        paragraphs.push(
          `Current APY of ${formatAPY(vault.apy24h)} sits at the ${percentile}th percentile of ${timeframe}.`,
        );
      }
    }
  }

  // 4. TVL Trend — is money flowing in or out?
  if (history.tvlHistory.length >= 2) {
    const recent = [...history.tvlHistory]
      .filter((p) => p.timestamp >= thirtyDaysAgo && p.value > 0)
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

  if (paragraphs.length === 0) return null;

  return (
    <div className="pp-section" id="overview">
      <h2>Performance Overview</h2>
      {numbered ? (
        <div className="pp-numbered-list">
          {paragraphs.map((text, i) => (
            <div key={i} className="pp-numbered-item">
              <span className="pp-num-badge">{String(i + 1).padStart(2, "0")}</span>
              <span className="pp-num-text">{text}</span>
            </div>
          ))}
        </div>
      ) : (
        paragraphs.map((text, i) => <p key={i}>{text}</p>)
      )}
    </div>
  );
}
