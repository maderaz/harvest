import { YieldVault } from "@/lib/types";
import { formatAPY, formatTVL } from "@/lib/format";
import { AssetIcon } from "./token-icons";

export function TickerStrip({ vaults }: { vaults: YieldVault[] }) {
  const top = vaults
    .filter((v) => v.apy24h > 0 && v.tvl > 100)
    .sort((a, b) => b.tvl - a.tvl)
    .slice(0, 12);

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
