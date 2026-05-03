import Link from "next/link";
import { YieldVault } from "@/lib/types";
import { NETWORKS } from "@/lib/networks";

interface Props {
  asset: string;
  vaults: YieldVault[];
}

// Single-line cross-link section that sits between the strategy table and the
// FAQ on each asset hub. Lists every network where this asset has at least
// one indexed strategy. Networks ordered by indexed TVL within this asset.
export function BrowseByNetwork({ asset, vaults }: Props) {
  const tvlByChain = new Map<string, number>();
  for (const v of vaults) {
    tvlByChain.set(v.chain, (tvlByChain.get(v.chain) ?? 0) + v.tvl);
  }
  const present = NETWORKS.filter((n) => (tvlByChain.get(n.chain) ?? 0) > 0).sort(
    (a, b) => (tvlByChain.get(b.chain) ?? 0) - (tvlByChain.get(a.chain) ?? 0),
  );

  if (present.length === 0) return null;

  return (
    <div className="browse-by-network">
      <span className="bbn-label">Browse {asset} yields by network:</span>{" "}
      {present.map((n, i) => (
        <span key={n.slug}>
          {i > 0 && <span className="bbn-sep"> · </span>}
          <Link href={`/${n.slug}`}>{n.display}</Link>
        </span>
      ))}
    </div>
  );
}
