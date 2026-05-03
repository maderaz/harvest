import Link from "next/link";
import type { Metadata } from "next";
import { getLiveVaults, getAllSparklines } from "@/lib/data";
import { AssetIcon } from "@/components/token-icons";
import { formatAPY, formatTVL } from "@/lib/format";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import {
  assetHubTitle,
  assetHubH1,
  assetHubDescription,
  assetHubCrumbs,
} from "@/lib/seo";
import { breadcrumbSchema, itemListSchema } from "@/lib/jsonld";
import { getSubAsset } from "@/lib/sub-asset";
import { SubAssetSections } from "@/components/sub-asset-sections";

const ASSET = "ETH" as const;

export async function generateMetadata(): Promise<Metadata> {
  const vaults = await getLiveVaults();
  const assetVaults = vaults.filter((v) => v.asset === ASSET);
  const subAssets = [...new Set(assetVaults.map((v) => getSubAsset(v)))].sort();
  const title = assetHubTitle(ASSET);
  const description = assetHubDescription(ASSET, assetVaults.length, subAssets);
  const url = `${SITE_URL}/eth`;
  return {
    title,
    description,
    openGraph: { title, description, url, siteName: SITE_NAME, type: "website" },
    alternates: { canonical: url },
  };
}

export default async function EthPage() {
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
  const subAssets = [...new Set(vaults.map((v) => getSubAsset(v)))].sort();

  const crumbs = assetHubCrumbs(ASSET);
  const hubUrl = `${SITE_URL}/eth`;

  return (
    <main className="page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema(crumbs)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemListSchema(vaults, hubUrl)),
        }}
      />

      <nav className="pp-crumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span className="sep">›</span>
        <span className="current">Ethereum Yield</span>
      </nav>

      <section className="hero">
        <div>
          <h1>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
              <AssetIcon asset={ASSET} size={36} />
              {assetHubH1(ASSET)}
            </span>
            <br />
            <span className="dim">
              {vaults.length > 0
                ? `Compare ${vaults.length} Ethereum yield strategies we monitor across ${subAssets.join(", ")}, ranked by APY on ${chainCount} chain${chainCount !== 1 ? "s" : ""}.`
                : "Ethereum yield strategies are populating, check back shortly."}
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
            <div className="stat-label">Total ETH TVL</div>
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

      <SubAssetSections
        vaults={vaults}
        sparklines={sparklines}
        subAssets={subAssets}
        assetLabel="Ethereum"
      />
    </main>
  );
}
