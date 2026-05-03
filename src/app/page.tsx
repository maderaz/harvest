import Link from "next/link";
import { getLiveVaults, getAllSparklines } from "@/lib/data";
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from "@/lib/constants";
import { VaultList } from "@/components/vault-list";
import { formatAPY, formatTVL } from "@/lib/format";
import { TickerStrip } from "@/components/ticker-strip";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Best DeFi Yields: Compare Top APY Rankings | Harvest",
  description: "Track and compare yield sources across DeFi. Find the best APY for USDC, ETH, Bitcoin and USDT across the strategies we index on Ethereum, Base, Arbitrum and more. Updated daily.",
  openGraph: {
    title: "Best DeFi Yields: Compare Top APY Rankings | Harvest",
    description: "Track and compare yield sources across DeFi. Best APY for USDC, ETH, Bitcoin and USDT. Updated daily.",
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME}: Compare DeFi Yield Sources`,
    description: SITE_DESCRIPTION,
  },
  alternates: {
    canonical: SITE_URL,
  },
};

/* === Stat computation helpers === */

function computeStats(vaults: { apy24h: number; tvl: number; chain: string; asset: string; category: string }[]) {
  const totalTVL = vaults.reduce((sum, v) => sum + v.tvl, 0);
  const avgAPY =
    vaults.length > 0
      ? vaults.reduce((sum, v) => sum + v.apy24h, 0) / vaults.length
      : 0;
  const vaultCount = vaults.length;
  const chainCount = new Set(vaults.map((v) => v.chain)).size;

  return { totalTVL, avgAPY, vaultCount, chainCount };
}

function platformFromCategory(category: string): string {
  if (!category) return "Other";
  return category.split(" - ")[0].trim() || "Other";
}

function computePlatforms(vaults: { category: string; apy24h: number; tvl: number }[]) {
  const map = new Map<string, { count: number; totalApy: number; totalTvl: number }>();
  for (const v of vaults) {
    const platform = platformFromCategory(v.category);
    const entry = map.get(platform) || { count: 0, totalApy: 0, totalTvl: 0 };
    entry.count++;
    entry.totalApy += v.apy24h;
    entry.totalTvl += v.tvl;
    map.set(platform, entry);
  }
  return Array.from(map.entries())
    .map(([name, { count, totalApy, totalTvl }]) => ({
      name,
      count,
      avgApy: count > 0 ? totalApy / count : 0,
      totalTvl,
    }))
    .sort((a, b) => b.totalTvl - a.totalTvl)
    .slice(0, 12);
}

function computeFeaturedAssets(vaults: { asset: string; apy24h: number; tvl: number }[]) {
  const map = new Map<string, { bestApy: number; totalTvl: number; count: number }>();
  for (const v of vaults) {
    const entry = map.get(v.asset) || { bestApy: 0, totalTvl: 0, count: 0 };
    if (v.apy24h > entry.bestApy) entry.bestApy = v.apy24h;
    entry.totalTvl += v.tvl;
    entry.count++;
    map.set(v.asset, entry);
  }
  return Array.from(map.entries())
    .map(([asset, data]) => ({
      asset,
      bestApy: data.bestApy,
      totalTvl: data.totalTvl,
      poolCount: data.count,
    }))
    .sort((a, b) => b.totalTvl - a.totalTvl)
    .slice(0, 4);
}

import { AssetIcon } from "@/components/token-icons";

const ASSET_PAGES: Record<string, string> = {
  USDC: "/usdc",
  USDT: "/usdt",
  ETH: "/eth",
  BTC: "/btc",
};

interface FaqItem {
  question: string;
  answer: string;
}

// Build a 7-question FAQ that targets broad search intent ("what is the
// best DeFi yield", "how is APY calculated", "how often is data updated",
// etc.). Answers cite live counts from the indexed dataset so the visible
// text on the page always matches the FAQPage schema we emit, which is a
// hard requirement for Google rich-result eligibility.
function buildHomepageFaq({
  vaultCount,
  chainCount,
  bestApyAcrossIndex,
  topAssetSummary,
}: {
  vaultCount: number;
  chainCount: number;
  bestApyAcrossIndex: number;
  topAssetSummary: string;
}): FaqItem[] {
  return [
    {
      question: "What is Harvest Finance?",
      answer: `Harvest is an onchain yield index that tracks ${vaultCount}+ DeFi yield strategies across ${chainCount} networks. We surface APY, TVL and performance history for each strategy so users can compare yield sources side by side. Harvest has been operating onchain since 2020.`,
    },
    {
      question: "What is the best DeFi yield right now?",
      answer: `The single highest 24-hour APY across the strategies we currently index is ${bestApyAcrossIndex.toFixed(2)}%. The top of the ranking changes as on-chain conditions shift; the table on this page is sorted by 24-hour APY by default and updates with every daily build. ${topAssetSummary}`,
    },
    {
      question: "How is APY calculated?",
      answer:
        "24-hour APY is the mean of APY records observed in the last 24 hours from our hosted indexer. 30-day APY is the simple arithmetic mean of daily APY observations over the last 30 days, filtering out negative values. APY is not time-weighted and does not account for compounding within the window. Reward tokens contribute at the rates published by the underlying protocol; we do not perform our own USD conversion of reward streams. Full details are on the methodology page.",
    },
    {
      question: "How often is the data updated?",
      answer:
        "Strategy data is refetched hourly from the underlying APIs and the site is rebuilt as a static export, so the version a visitor sees can lag the latest fetch by up to one hour. The freshness line in the footer reflects this. Real-time on-page values are not currently provided.",
    },
    {
      question: "Are these yields safe?",
      answer:
        "No DeFi yield strategy is risk-free. Smart-contract risk, oracle risk, liquidity risk, depeg risk and governance risk all apply, and risk profiles vary between protocols and between deployments of the same protocol on different networks. Per-strategy risk levels currently shown on the site are editorial classifications and are not yet derived from a quantitative model. The risk framework page covers the categories in more detail.",
    },
    {
      question: "What chains and assets does Harvest cover?",
      answer: `We currently index strategies on ${chainCount} networks, with the largest coverage on Ethereum, Base and Arbitrum. The asset families we track are USDC, USDT, ETH (including WETH and major staking derivatives) and Bitcoin (WBTC, cbBTC, tBTC). Coverage expands as new strategies are added to the index.`,
    },
    {
      question: "Is Harvest a DeFi protocol or an aggregator?",
      answer:
        "Harvest is both. The indexed strategies on this site are operated by Harvest Finance today, which we disclose openly on the methodology page. Listing and ranking are not influenced by operator status because, at present, all listed strategies share the same operator. Future expansion to third-party operators will preserve neutral ranking.",
    },
  ];
}

export default async function Home() {
  const vaults = await getLiveVaults();
  const sparklines = await getAllSparklines();
  const stats = computeStats(vaults);
  const platforms = computePlatforms(vaults);
  const featuredAssets = computeFeaturedAssets(vaults);

  const bestApyAcrossIndex = vaults.reduce(
    (b, v) => (v.apy24h > b ? v.apy24h : b),
    0,
  );
  const topAsset = featuredAssets[0];
  const topAssetSummary = topAsset
    ? `Among the asset families we track, ${topAsset.asset} currently has the deepest coverage at ${topAsset.poolCount} indexed strategies.`
    : "";

  const faqItems = buildHomepageFaq({
    vaultCount: stats.vaultCount,
    chainCount: stats.chainCount,
    bestApyAcrossIndex,
    topAssetSummary,
  });

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
    />
    <TickerStrip vaults={vaults} sparklines={sparklines} />
    <main className="page">
      {/* === Hero === */}
      <section className="hero">
        <div>
          <h1>
            Best DeFi Yields.
            <br />
            <span className="dim">
              Compare {stats.vaultCount} strategies ranked by APY across USDC, USDT, ETH and Bitcoin.
            </span>
          </h1>
          <div className="hero-actions">
            <span className="hero-meta mono">
              <span className="pulse" /> Live &middot; {stats.vaultCount} vaults
              tracked
            </span>
          </div>
        </div>
        <div className="hero-right">
          <div className="stat-tile">
            <div className="stat-label">Total TVL Tracked</div>
            <div className="stat-val mono">{formatTVL(stats.totalTVL)}</div>
          </div>
          <div className="stat-tile">
            <div className="stat-label">Active Vaults</div>
            <div className="stat-val mono">{stats.vaultCount}</div>
          </div>
          <div className="stat-tile">
            <div className="stat-label">Avg APY</div>
            <div className="stat-val mono">{formatAPY(stats.avgAPY)}</div>
          </div>
          <div className="stat-tile">
            <div className="stat-label">Chains Indexed</div>
            <div className="stat-val mono">{stats.chainCount}</div>
          </div>
        </div>
      </section>

      {/* === Ranking table === */}
      <div className="section-title-bar">
        <h2>Top yields by APY</h2>
        <span className="mono dim">
          Live &middot; ranked across {stats.chainCount} chain
          {stats.chainCount !== 1 ? "s" : ""}
        </span>
      </div>

        <VaultList vaults={vaults} sparklines={sparklines} />

      {/* === Featured assets === */}
      <div className="section-title-bar">
        <h2>Featured assets</h2>
        <span className="mono dim">Supply the majors</span>
      </div>
      <div className="card section">
        <div className="feat-grid">
          {featuredAssets.map((a) => {
            const inner = (
              <>
                <div className="feat-head">
                  <AssetIcon asset={a.asset} size={28} />
                  <div>
                    <div className="feat-name">{a.asset}</div>
                    <div className="feat-sub mono dim">{a.poolCount} pool{a.poolCount !== 1 ? "s" : ""}</div>
                  </div>
                </div>
                <div className="feat-body">
                  <div>
                    <div className="feat-label mono dim">Best APY</div>
                    <div className="feat-val mono">{formatAPY(a.bestApy)}</div>
                  </div>
                  <div>
                    <div className="feat-label mono dim">Total TVL</div>
                    <div className="feat-val mono">{formatTVL(a.totalTvl)}</div>
                  </div>
                </div>
              </>
            );
            const href = ASSET_PAGES[a.asset];
            return href ? (
              <Link key={a.asset} href={href} className="feat feat-link">
                {inner}
              </Link>
            ) : (
              <div key={a.asset} className="feat">{inner}</div>
            );
          })}
        </div>
      </div>

      {/* === Platform grid === */}
      <div className="section-title-bar">
        <h2>Browse by Platform</h2>
        <span className="mono dim">{platforms.length} platforms</span>
      </div>
      <div className="card section">
        <div className="cat-grid">
          {platforms.map((p) => (
            <div key={p.name} className="cat-tile">
              <div className="cat-top">
                <span className="cat-name">{p.name}</span>
                <span className="cat-count mono dim">{p.count}</span>
              </div>
              <div className="cat-apy mono">{formatAPY(p.avgApy)}</div>
              <div className="cat-foot dim mono">avg APY &middot; {formatTVL(p.totalTvl)} TVL</div>
            </div>
          ))}
        </div>
      </div>

      {/* === FAQ === */}
      <div className="section-title-bar" id="faq">
        <h2>Frequently Asked Questions</h2>
        <span className="mono dim">
          About yield, risk, and our methodology
        </span>
      </div>
      <div className="card section">
        <div className="faq">
          {faqItems.map((item, i) => (
            <details key={i} open={i === 0}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </main>
    </>
  );
}
