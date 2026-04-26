import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getVaults, getVaultBySlug, getAllSlugs, getVaultHistory } from "@/lib/data";
import { formatAPY, formatTVL } from "@/lib/format";
import { AssetBadge } from "@/components/asset-badge";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { YieldVault } from "@/lib/types";
import type { FullVaultHistory } from "@/lib/history-api";
import { ChartCard } from "@/components/chart-card";
import { VaultCommentary } from "@/components/vault-commentary";
import { VaultFaq } from "@/components/vault-faq";
import { YieldBreakdown } from "@/components/yield-breakdown";
import { VaultStatistics } from "@/components/vault-statistics";
import { ConsistencyScore } from "@/components/consistency-score";
import { VaultHistoryTable } from "@/components/vault-history-table";
import { EarningsCalculator } from "@/components/earnings-calculator";
import { DepositCard } from "@/components/deposit-card";
import { TableOfContents } from "@/components/table-of-contents";
import { SidebarFacts } from "@/components/sidebar-facts";
import { CopyAddressButton } from "@/components/copy-address-button";
import { VaultHero } from "@/components/vault-hero";
import { MarketBenchmark, EcosystemContext } from "@/components/market-sections";
import { HistoricalStats } from "@/components/historical-stats";

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const vault = await getVaultBySlug(slug);
  if (!vault) return {};

  const title = `${vault.productName} by ${vault.protocol.name} — ${formatAPY(vault.apy24h)} APY | ${SITE_NAME}`;
  const description = `${vault.productName} on ${vault.protocol.name} offers ${formatAPY(vault.apy24h)} APY (24h) with ${formatTVL(vault.tvl)} TVL. ${vault.description}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${vault.slug}`,
      siteName: SITE_NAME,
      type: "article",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/${vault.slug}`,
    },
  };
}

function StructuredData({ vault }: { vault: YieldVault }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FinancialProduct",
    name: `${vault.productName} by ${vault.protocol.name}`,
    description: vault.description,
    provider: {
      "@type": "Organization",
      name: vault.protocol.name,
    },
    category: vault.category,
    url: `${SITE_URL}/${vault.slug}`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

function BreadcrumbSchema({ vault }: { vault: YieldVault }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: `${vault.asset} Vaults`,
        item: `${SITE_URL}/?asset=${vault.asset}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: vault.chain,
        item: `${SITE_URL}/?asset=${vault.asset}&chain=${vault.chain}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: vault.productName,
        item: `${SITE_URL}/${vault.slug}`,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface FaqItem {
  question: string;
  answer: string;
}

function FaqSchema({ items }: { items: FaqItem[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

function generateFaqItems(vault: YieldVault): FaqItem[] {
  const items: FaqItem[] = [];

  items.push({
    question: `What is the current APY for ${vault.productName}?`,
    answer:
      vault.apy24h > 0
        ? `${vault.productName} currently offers a 24-hour APY of ${formatAPY(vault.apy24h)} and a 30-day average APY of ${formatAPY(vault.apy30d)}. APY rates are variable and change based on market conditions.`
        : `${vault.productName} APY data is currently unavailable. APY rates are variable and change based on market conditions.`,
  });

  items.push({
    question: `What chain is ${vault.productName} on?`,
    answer: `${vault.productName} is deployed on ${vault.chain}. It is operated by ${vault.protocol.name} and accepts ${vault.asset} deposits.`,
  });

  items.push({
    question: `How does ${vault.productName} work?`,
    answer:
      vault.vaultType === "Autocompounder"
        ? `${vault.productName} is an Autocompounder vault. It automatically reinvests earned yields back into the vault, compounding returns over time without requiring manual action from depositors. ${vault.description}`
        : `${vault.productName} is an Autopilot vault. It automatically allocates deposits across optimized yield strategies managed by ${vault.protocol.name}. ${vault.description}`,
  });

  items.push({
    question: `What is the TVL of ${vault.productName}?`,
    answer:
      vault.tvl > 0
        ? `${vault.productName} currently has a total value locked (TVL) of ${formatTVL(vault.tvl)}. TVL represents the total amount of ${vault.asset} deposited in this vault.`
        : `${vault.productName} TVL data is currently unavailable. TVL represents the total amount of ${vault.asset} deposited in this vault.`,
  });

  items.push({
    question: `Is ${vault.productName} an Autocompounder or Autopilot?`,
    answer: `${vault.productName} is a${vault.vaultType === "Autocompounder" ? "n Autocompounder" : "n Autopilot"} vault. ${vault.vaultType === "Autocompounder" ? "Autocompounder vaults automatically reinvest yields, compounding returns over time." : "Autopilot vaults automatically allocate deposits across optimized yield strategies."}`,
  });

  items.push({
    question: `How stable is the APY for ${vault.productName}?`,
    answer:
      vault.apy24h > 0 && vault.apy30d > 0
        ? `${vault.productName} currently shows a 24-hour APY of ${formatAPY(vault.apy24h)} compared to a 30-day average of ${formatAPY(vault.apy30d)}. ${Math.abs(vault.apy24h - vault.apy30d) < 1 ? "The APY has been relatively consistent over this period." : "There is notable variation between the short-term and longer-term rate, which is common in DeFi yield sources."}`
        : `APY stability data for ${vault.productName} is currently limited. DeFi yields are variable and fluctuate based on supply, demand, and protocol incentives.`,
  });

  if (vault.apyBreakdown.length > 0) {
    const sources = vault.apyBreakdown.filter((s) => s.apy > 0);
    if (sources.length > 0) {
      const breakdown = sources
        .map((s) => `${s.apy.toFixed(2)}% from ${s.source}`)
        .join(", ");
      items.push({
        question: `Where does the yield come from for ${vault.productName}?`,
        answer: `The yield for ${vault.productName} is composed of: ${breakdown}. Yield sources may include base lending rates, protocol token rewards, and liquidity incentives.`,
      });
    }
  }

  return items;
}

const CHAIN_EXPLORERS: Record<string, string> = {
  Ethereum: "https://etherscan.io/address/",
  Polygon: "https://polygonscan.com/address/",
  Arbitrum: "https://arbiscan.io/address/",
  Base: "https://basescan.org/address/",
  zkSync: "https://explorer.zksync.io/address/",
  HyperEVM: "https://hyperscan.xyz/address/",
};

function getExplorerUrl(chain: string, address: string): string | null {
  const base = CHAIN_EXPLORERS[chain];
  if (!base) return null;
  return `${base}${address}`;
}

function truncateAddress(address: string): string {
  if (address.length <= 14) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function computeApyDelta(vault: YieldVault): { value: number; direction: "up" | "down" | "neutral" } {
  if (vault.apy24h <= 0 || vault.apy30d <= 0) return { value: 0, direction: "neutral" };
  const diff = vault.apy24h - vault.apy30d;
  if (Math.abs(diff) < 0.01) return { value: 0, direction: "neutral" };
  return { value: Math.abs(diff), direction: diff > 0 ? "up" : "down" };
}

function computeApyStdDev(history: FullVaultHistory): { stdDev: number; label: string } | null {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const thirtyDaysAgo = nowSeconds - 30 * 24 * 60 * 60;
  const recent = history.apyHistory.filter((p) => p.timestamp >= thirtyDaysAgo && p.apy >= 0);
  if (recent.length < 2) return null;
  const values = recent.map((p) => p.apy);
  const avg = values.reduce((s, v) => s + v, 0) / values.length;
  const variance = values.reduce((s, v) => s + (v - avg) ** 2, 0) / values.length;
  const sd = Math.sqrt(variance);
  let label = "volatile";
  if (sd < 0.5) label = "very stable";
  else if (sd < 1.5) label = "stable";
  else if (sd < 3) label = "moderately volatile";
  return { stdDev: sd, label };
}

function computePeakTvl(history: FullVaultHistory): number {
  if (history.tvlHistory.length === 0) return 0;
  return Math.max(...history.tvlHistory.map((p) => p.value));
}

function computeSharePriceGrowth(history: FullVaultHistory): number | null {
  if (history.sharePriceHistory.length < 2) return null;
  const sorted = [...history.sharePriceHistory].sort((a, b) => a.timestamp - b.timestamp);
  const first = sorted[0].sharePrice;
  const last = sorted[sorted.length - 1].sharePrice;
  if (first <= 0) return null;
  return ((last - first) / first) * 100;
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const vault = await getVaultBySlug(slug);
  if (!vault) notFound();

  const history = await getVaultHistory(vault.contractAddress);

  const tvlChartData = history.tvlHistory.map((p) => ({
    timestamp: p.timestamp,
    value: p.value,
  }));
  const apyChartData = history.apyHistory.map((p) => ({
    timestamp: p.timestamp,
    value: p.apy,
  }));
  const sharePriceChartData = history.sharePriceHistory.map((p) => ({
    timestamp: p.timestamp,
    value: p.sharePrice,
  }));

  const hasCharts =
    tvlChartData.length >= 2 ||
    apyChartData.length >= 2 ||
    sharePriceChartData.length >= 2;

  const allVaults = await getVaults();
  const relatedVaults = allVaults
    .filter((v) => v.asset === vault.asset && v.id !== vault.id)
    .slice(0, 4);

  const faqItems = generateFaqItems(vault);

  const tocItems = [
    { id: "about", label: "About this vault" },
    ...(hasCharts ? [{ id: "performance", label: "Performance history" }] : []),
    { id: "overview", label: "Performance overview" },
    { id: "consistency", label: "APY consistency" },
    { id: "statistics", label: "30-day statistics" },
    ...(vault.apyBreakdown.length > 0 ? [{ id: "sources", label: "Yield sources" }] : []),
    { id: "calculator", label: "Earnings calculator" },
    { id: "history", label: "Historical data" },
    { id: "details", label: "Contract details" },
    { id: "faq", label: "FAQ" },
    ...(relatedVaults.length > 0 ? [{ id: "more", label: `More ${vault.asset} vaults` }] : []),
  ];

  const apyDelta = computeApyDelta(vault);
  const apyStdDev = computeApyStdDev(history);
  const peakTvl = computePeakTvl(history);
  const sharePriceGrowth = computeSharePriceGrowth(history);
  const explorerUrl = getExplorerUrl(vault.chain, vault.contractAddress);

  return (
    <>
      <StructuredData vault={vault} />
      <BreadcrumbSchema vault={vault} />
      <FaqSchema items={faqItems} />

      <VaultHero vault={vault} history={history} allVaults={allVaults} />

      <main className="pp-page pp-page-after-hero">
        {/* About — TRULY full width, outside the 2-col grid */}
        <section className="pp-section pp-fullwidth-section" id="about">
          <h2>About {vault.productName}</h2>
          <div className="about-prose">
            <p>
              <strong>{vault.productName}</strong> is a {vault.vaultType.toLowerCase()} vault on{" "}
              <strong>{vault.chain}</strong> that accepts {vault.asset} deposits and routes them
              into the {vault.category} strategy.{" "}
                  {vault.vaultType === "Autocompounder"
                    ? `The vault automatically harvests rewards, swaps them back into ${vault.asset} and redeposits, compounding returns over time without manual harvesting or restaking.`
                    : `It automatically allocates ${vault.asset} deposits across optimized yield strategies, rebalancing to capture the best available rates.`}
                </p>
                {vault.tvl > 0 && vault.apy24h > 0 && (
                  <p>
                    The vault currently holds <strong>{formatTVL(vault.tvl)}</strong> in
                    deposits and is generating <strong>{formatAPY(vault.apy24h)} APY</strong> over
                    the last 24 hours. The 30-day average APY sits at{" "}
                    <strong>{formatAPY(vault.apy30d)}</strong>
                    {(() => {
                      if (history.sharePriceHistory.length >= 2) {
                        const sorted = [...history.sharePriceHistory].sort((a, b) => a.timestamp - b.timestamp);
                        const growth = sorted[0].sharePrice > 0
                          ? ((sorted[sorted.length - 1].sharePrice - sorted[0].sharePrice) / sorted[0].sharePrice) * 100
                          : 0;
                        if (growth > 0) return <>, and over its lifetime share price has grown <strong>{growth.toFixed(2)}%</strong> since inception</>;
                      }
                      return null;
                    })()}.
                  </p>
                )}
          </div>
        </section>

        {/* 2-column grid starts here */}
        <div className="pp-grid">
          <div className="pp-main">
            {/* APY chart - the headline metric, right after About */}
            {apyChartData.length >= 2 && (
              <section className="pp-section" id="performance">
                <ChartCard
                  title="APY History"
                  data={apyChartData}
                  format="percent"
                />
              </section>
            )}

            {/* Performance Commentary (numbered) */}
            <VaultCommentary
              vault={vault}
              allVaults={allVaults}
              history={history}
              numbered
            />

            {/* Consistency Score */}
            {/* Market Benchmarking */}
            <MarketBenchmark vault={vault} allVaults={allVaults} />

            {/* Ecosystem Context */}
            <EcosystemContext vault={vault} allVaults={allVaults} />

            {/* TVL chart - shown after market positioning */}
            {tvlChartData.length >= 2 && (
              <section className="pp-section">
                <ChartCard
                  title="TVL History"
                  data={tvlChartData}
                  format="dollar"
                />
              </section>
            )}

            {/* Consistency Score */}
            <ConsistencyScore history={history} spotAPY={vault.apy24h} />

            {/* Share Price chart - shows compounding growth, after consistency */}
            {sharePriceChartData.length >= 2 && (
              <section className="pp-section">
                <ChartCard
                  title="Share Price History"
                  data={sharePriceChartData}
                  format="number"
                />
              </section>
            )}

            {/* Yield Breakdown */}
            {vault.apyBreakdown.length > 0 && (
              <YieldBreakdown
                apyBreakdown={vault.apyBreakdown}
                boostedApy={vault.boostedApy}
              />
            )}

            {/* Statistics Block */}
            <VaultStatistics history={history} currentTvl={vault.tvl} />

            {/* Earnings Calculator */}
            <EarningsCalculator apy={vault.apy24h} asset={vault.asset} />

            {/* History Table */}
            {/* Historical Stats */}
            <HistoricalStats history={history} />

            {/* Daily History Table */}
            <VaultHistoryTable history={history} />

            {/* Contract Details */}
            <section className="pp-section" id="details">
              <h2>Contract Details</h2>
              <div className="contract-details-grid">
                <div className="cd-row">
                  <span className="cd-label">Chain</span>
                  <span className="cd-val">{vault.chain}</span>
                </div>
                <div className="cd-row">
                  <span className="cd-label">Type</span>
                  <span className="cd-val">{vault.vaultType}</span>
                </div>
                <div className="cd-row">
                  <span className="cd-label">Asset</span>
                  <span className="cd-val">{vault.asset}</span>
                </div>
                <div className="cd-row">
                  <span className="cd-label">Strategy</span>
                  <span className="cd-val">{vault.category}</span>
                </div>
                <div className="cd-row cd-row-full">
                  <span className="cd-label">Contract Address</span>
                  <div className="cd-addr-wrap">
                    <span className="cd-addr mono">{vault.contractAddress}</span>
                    <CopyAddressButton address={vault.contractAddress} compact />
                    {explorerUrl && (
                      <a
                        href={explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cd-explorer"
                        aria-label="View on explorer"
                        title="View on block explorer"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* FAQ */}
            <VaultFaq
              productName={vault.productName}
              protocolName={vault.protocol.name}
              asset={vault.asset}
              chain={vault.chain}
              vaultType={vault.vaultType}
              apy24h={formatAPY(vault.apy24h)}
              tvl={formatTVL(vault.tvl)}
              riskLevel={vault.riskLevel}
              description={vault.description}
              faqItems={faqItems}
            />

            {/* Related Vaults */}
            {relatedVaults.length > 0 && (
              <div className="pp-section" id="more">
                <h2>More {vault.asset} Vaults</h2>
                <div className="more-vaults">
                  {relatedVaults.map((rv) => (
                    <Link key={rv.id} href={`/${rv.slug}`} className="mv-card">
                      <div className="mv-head">
                        <AssetBadge asset={rv.asset} iconOnly />
                        <div>
                          <div className="mv-name">{rv.productName}</div>
                          <div className="mv-by">{rv.protocol.name}</div>
                        </div>
                      </div>
                      <div className="mv-stats">
                        <div>
                          <div>APY</div>
                          <div className="mv-num up">{formatAPY(rv.apy24h)}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div>TVL</div>
                          <div className="mv-num">{formatTVL(rv.tvl)}</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="pp-sidebar">
            <DepositCard
              apy24h={vault.apy24h}
              apy30d={vault.apy30d}
              asset={vault.asset}
            />
            <SidebarFacts vault={vault} history={history} />
            <TableOfContents items={tocItems} />
          </div>
        </div>
      </main>
    </>
  );
}
