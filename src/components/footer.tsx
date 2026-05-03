import Link from "next/link";
import { getLiveVaults } from "@/lib/data";
import { NETWORKS } from "@/lib/networks";

const ASSET_HUBS = [
  { label: "USDC Yield", href: "/usdc" },
  { label: "USDT Yield", href: "/usdt" },
  { label: "Ethereum Yield", href: "/eth" },
  { label: "Bitcoin Yield", href: "/btc" },
];

const RESOURCES = [
  { label: "API", href: "#" },
  { label: "Methodology", href: "/methodology" },
  { label: "Risk framework", href: "/risk-framework" },
  { label: "Docs", href: "#" },
  { label: "Status", href: "#" },
  { label: "Terms", href: "#" },
];

export async function Footer() {
  // Order network hubs by total indexed TVL on each network, descending.
  // Networks with zero indexed TVL still render (so the footer doesn't go
  // dark when a network is being warmed up); they just sort to the end.
  const vaults = await getLiveVaults();
  const tvlByChain = new Map<string, number>();
  for (const v of vaults) {
    tvlByChain.set(v.chain, (tvlByChain.get(v.chain) ?? 0) + v.tvl);
  }
  const networkHubs = [...NETWORKS]
    .sort(
      (a, b) => (tvlByChain.get(b.chain) ?? 0) - (tvlByChain.get(a.chain) ?? 0),
    )
    .map((n) => ({ label: n.display, href: `/${n.slug}` }));

  return (
    <footer className="foot">
      <div className="foot-inner">
        <div className="foot-brand">
          <span className="brand-name">Harvest</span>
          <span className="mono dim"> · Independent onchain yield index. Updated daily.</span>
        </div>

        <div className="foot-grid">
          <div className="foot-col">
            <div className="foot-col-label mono dim">Assets</div>
            {ASSET_HUBS.map((l) => (
              <Link key={l.href} href={l.href} className="foot-link">
                {l.label}
              </Link>
            ))}
          </div>
          <div className="foot-col">
            <div className="foot-col-label mono dim">Networks</div>
            {networkHubs.map((l) => (
              <Link key={l.href} href={l.href} className="foot-link">
                {l.label}
              </Link>
            ))}
          </div>
          <div className="foot-col">
            <div className="foot-col-label mono dim">Resources</div>
            {RESOURCES.map((l) => (
              <a key={l.label} href={l.href} className="foot-link">
                {l.label}
              </a>
            ))}
          </div>
        </div>

        <div className="mono dim foot-copy">&copy; 2026 · Data refreshed hourly</div>
      </div>
    </footer>
  );
}
