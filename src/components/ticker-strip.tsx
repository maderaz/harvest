import { YieldVault } from "@/lib/types";
import { formatAPY, formatTVL } from "@/lib/format";

const ASSET_COLORS: Record<string, string> = {
  USDC: "#2775CA",
  USDT: "#26A17B",
  ETH: "#627EEA",
  WBTC: "#F09242",
  cbBTC: "#0052FF",
  EURC: "#2775CA",
};

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
        {items.map((v, i) => {
          const color = ASSET_COLORS[v.asset] || "#999";
          return (
            <span key={i} className="ticker-item">
              <span
                className="asset-dot"
                style={{
                  background: color,
                  width: 14,
                  height: 14,
                  fontSize: 7,
                }}
              >
                {v.asset[0]}
              </span>
              <span className="t-name">{v.productName}</span>
              <span className="t-val">{formatAPY(v.apy24h)}</span>
              <span className="t-val" style={{ color: "var(--ink-4)" }}>
                {formatTVL(v.tvl)}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
