import { YieldVault } from "@/lib/types";
import { formatAPY, formatTVL } from "@/lib/format";
import { AssetIcon } from "./token-icons";

interface Props {
  vaults: YieldVault[];
  sparklines?: Record<string, number[]>;
}

// NASDAQ-style strip on the homepage. Surface only strategies that:
//   - have positive APY <= 50% (filter out outliers / errored points),
//   - hold at least $10k TVL,
//   - have shown an APY increase since the previous daily observation.
// We also enforce a per-asset cap so a single asset family can't dominate.
export function TickerStrip({ vaults, sparklines }: Props) {
  const apyIncreased = (v: YieldVault): boolean => {
    const series = sparklines?.[v.contractAddress];
    if (!series || series.length < 2) return false;
    return series[series.length - 1] > series[series.length - 2];
  };

  const eligible = vaults
    .filter(
      (v) =>
        v.apy24h > 0 &&
        v.apy24h <= 50 &&
        v.tvl >= 10_000 &&
        apyIncreased(v),
    )
    .sort((a, b) => b.tvl - a.tvl);

  const PER_ASSET_CAP = 3;
  const MAX_ITEMS = 14;
  const seen = new Map<string, number>();
  const top: YieldVault[] = [];
  for (const v of eligible) {
    const count = seen.get(v.asset) || 0;
    if (count >= PER_ASSET_CAP) continue;
    seen.set(v.asset, count + 1);
    top.push(v);
    if (top.length >= MAX_ITEMS) break;
  }

  if (top.length === 0) return null;

  const items = [...top, ...top];

  return (
    <div className="ticker">
      <div className="ticker-track">
        {items.map((v, i) => (
          <span key={i} className="ticker-item">
            <AssetIcon asset={v.asset} size={18} />
            <span className="t-name">{v.productName}</span>
            <span className="t-val">{formatAPY(v.apy24h)}</span>
            <span className="t-val" style={{ color: "var(--ink-4)" }}>
              {formatTVL(v.tvl)}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
