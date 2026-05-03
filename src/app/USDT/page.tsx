import Link from "next/link";
import type { Metadata } from "next";
import { getLiveVaults, getAllSparklines } from "@/lib/data";
import { VaultList } from "@/components/vault-list";
import { AssetIcon } from "@/components/token-icons";
import { formatAPY, formatTVL } from "@/lib/format";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

const ASSET = "USDT" as const;
const ASSET_LABEL = "USDT";
const META_TITLE = "Best USDT Yield: Top APY Ranking";
const ASSET_DESCRIPTION =
  "Find the highest USDT yields across DeFi. Compare USDT autocompounder and autopilot strategies ranked by 24-hour APY across multiple chains. Live data, updated hourly.";

export const metadata: Metadata = {
  title: META_TITLE,
  description: ASSET_DESCRIPTION,
  openGraph: {
    title: META_TITLE,
    description: ASSET_DESCRIPTION,
    url: `${SITE_URL}/${ASSET_LABEL}`,
    siteName: SITE_NAME,
    type: "website",
  },
  alternates: { canonical: `${SITE_URL}/${ASSET_LABEL}` },
};

export default async function UsdtAssetPage() {
  const allVaults = await getLiveVaults();
  const sparklines = await getAllSparklines();
  const vaults = allVaults.filter((v) => v.asset === ASSET);

  const totalTvl = vaults.reduce((s, v) => s + v.tvl, 0);
  const bestApy = vaults.reduce((b, v) => (v.apy24h > b ? v.apy24h : b), 0);
  const avgApy =
    vaults.length > 0
      ? vaults.reduce((s, v) => s + v.apy24h, 0) / vaults.length
      : 0;
  const chainCount = new Set(vaults.map((v) => v.chain)).size;

  return (
    <main className="page">
      <nav className="pp-crumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span className="sep">›</span>
        <span className="current">{ASSET_LABEL} Vaults</span>
      </nav>

      <section className="hero">
        <div>
          <h1>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
              <AssetIcon asset={ASSET_LABEL} size={36} />
              Best USDT Yields
            </span>
            <br />
            <span className="dim">
              {vaults.length > 0
                ? `Compare ${vaults.length} USDT strategies ranked by APY across ${chainCount} chain${chainCount !== 1 ? "s" : ""}.`
                : `USDT yield strategies are populating, check back shortly.`}
            </span>
          </h1>
          <div className="hero-actions">
            <span className="hero-meta mono">
              <span className="pulse" /> Live · {vaults.length} vaults tracked
            </span>
          </div>
        </div>
        <div className="hero-right">
          <div className="stat-tile">
            <div className="stat-label">Total {ASSET_LABEL} TVL</div>
            <div className="stat-val mono">{formatTVL(totalTvl)}</div>
          </div>
          <div className="stat-tile">
            <div className="stat-label">Best APY</div>
            <div className="stat-val mono">{bestApy > 0 ? formatAPY(bestApy) : "-"}</div>
          </div>
          <div className="stat-tile">
            <div className="stat-label">Avg APY</div>
            <div className="stat-val mono">{avgApy > 0 ? formatAPY(avgApy) : "-"}</div>
          </div>
          <div className="stat-tile">
            <div className="stat-label">Chains</div>
            <div className="stat-val mono">{chainCount}</div>
          </div>
        </div>
      </section>

      <div className="section-title-bar">
        <h2>Top USDT yields by APY</h2>
        <span className="mono dim">Live · ranked across {chainCount} chains</span>
      </div>

      {vaults.length > 0 ? (
        <VaultList vaults={vaults} sparklines={sparklines} />
      ) : (
        <div
          style={{
            padding: "60px 0",
            textAlign: "center",
            color: "var(--ink-3)",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius)",
            background: "var(--panel)",
          }}
        >
          <p style={{ margin: 0 }}>No {ASSET_LABEL} vaults indexed yet.</p>
          <p style={{ marginTop: 8, fontSize: 13 }}>
            Data refreshes hourly from the Harvest API.
          </p>
        </div>
      )}
    </main>
  );
}
