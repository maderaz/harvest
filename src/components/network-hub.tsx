import Link from "next/link";
import { YieldVault } from "@/lib/types";
import { VaultList } from "./vault-list";
import { formatAPY, formatTVL } from "@/lib/format";
import { networkHubH1 } from "@/lib/seo";
import { breadcrumbSchema, itemListSchema } from "@/lib/jsonld";
import { networkHubCrumbs } from "@/lib/seo";
import { SITE_URL } from "@/lib/constants";

interface Props {
  networkSlug: string;
  networkDisplay: string;
  vaults: YieldVault[];
  sparklines?: Record<string, number[]>;
}

export function NetworkHub({ networkSlug, networkDisplay, vaults, sparklines }: Props) {
  const totalTvl = vaults.reduce((s, v) => s + v.tvl, 0);
  const bestApy = vaults.reduce((b, v) => (v.apy24h > b ? v.apy24h : b), 0);
  const avgApy =
    vaults.length > 0
      ? vaults.reduce((s, v) => s + v.apy24h, 0) / vaults.length
      : 0;
  const assetCount = new Set(vaults.map((v) => v.asset)).size;

  const crumbs = networkHubCrumbs(networkDisplay);
  const hubUrl = `${SITE_URL}/${networkSlug}`;

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
        <span className="current">{networkDisplay} Yields</span>
      </nav>

      <section className="hero">
        <div>
          <h1>
            {networkHubH1(networkDisplay)}
            <br />
            <span className="dim">
              {vaults.length > 0
                ? `Compare ${vaults.length} yield strategies we follow on ${networkDisplay}, across ${assetCount} asset${assetCount !== 1 ? "s" : ""}.`
                : `${networkDisplay} yield strategies are populating, check back shortly.`}
            </span>
          </h1>
          <div className="hero-actions">
            <span className="hero-meta mono">
              <span className="pulse" /> Live · {vaults.length} strategies tracked
            </span>
          </div>
        </div>
        <div className="hero-right">
          <div className="stat-tile">
            <div className="stat-label">Total TVL</div>
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
            <div className="stat-label">Assets</div>
            <div className="stat-val mono">{assetCount}</div>
          </div>
        </div>
      </section>

      <div className="section-title-bar">
        <h2>Top {networkDisplay} yields by APY</h2>
        <span className="mono dim">
          Live · ranked across {vaults.length} strategies in our index
        </span>
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
          <p style={{ margin: 0 }}>No {networkDisplay} vaults indexed yet.</p>
          <p style={{ marginTop: 8, fontSize: 13 }}>
            Data refreshes hourly from the Harvest API.
          </p>
        </div>
      )}
    </main>
  );
}
