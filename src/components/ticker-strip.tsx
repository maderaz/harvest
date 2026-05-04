import Link from "next/link";
import { YieldVault } from "@/lib/types";
import { formatAPY, formatTVL } from "@/lib/format";
import { AssetIcon } from "./token-icons";

export function TickerStrip({ vaults }: { vaults: YieldVault[] }) {
  const eligible = vaults
    .filter((v) => v.apy24h > 0 && v.apy24h <= 50 && v.tvl >= 10_000)
    .sort((a, b) => b.tvl - a.tvl);

  // Pick top vaults per asset to ensure diversity
  const seen = new Map<string, number>();
  const top: YieldVault[] = [];
  for (const v of eligible) {
    const count = seen.get(v.asset) || 0;
    if (count >= 4) continue;
    seen.set(v.asset, count + 1);
    top.push(v);
    if (top.length >= 14) break;
  }

  if (top.length === 0) return null;

  const items = [...top, ...top];

  return (
    <div className="ticker">
      <div className="ticker-track">
        {items.map((v, i) => (
          <Link key={i} href={`/${v.slug}`} className="ticker-item">
            <AssetIcon asset={v.asset} size={18} />
            <span className="t-name">{v.productName}</span>
            <span className="t-val">{formatAPY(v.apy24h)}</span>
            <span className="t-val" style={{ color: "var(--ink-4)" }}>
              {formatTVL(v.tvl)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
