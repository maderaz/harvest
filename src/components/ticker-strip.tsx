import Link from "next/link";
import { YieldVault } from "@/lib/types";
import { formatAPY, formatTVL } from "@/lib/format";
import { AssetIcon } from "./token-icons";

interface Props {
  vaults: YieldVault[];
  sparklines?: Record<string, number[]>;
}

// NASDAQ-style strip on the homepage. Surface live, non-stale strategies
// (stale-APY filter is already applied upstream in getLiveVaults) sorted
// by TVL, capped per asset so one family can't dominate.
export function TickerStrip({ vaults }: Props) {
  const eligible = vaults
    .filter((v) => v.apy24h > 0 && v.apy24h <= 50 && v.tvl >= 10_000)
    .sort((a, b) => b.tvl - a.tvl);

  const PER_ASSET_CAP = 4;
  const MAX_ITEMS = 16;
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

  // Repeat enough copies so even on ultrawide screens the track is at
  // least 2x the viewport. We render an even number of copies so the
  // CSS -50% translate produces a seamless loop.
  const TARGET_TILES = 32;
  const repeats = Math.max(2, Math.ceil(TARGET_TILES / top.length));
  const evenRepeats = repeats % 2 === 0 ? repeats : repeats + 1;
  const items = Array.from({ length: evenRepeats }, () => top).flat();

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
