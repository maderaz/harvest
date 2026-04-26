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

  return (
    <>
      <StructuredData vault={vault} />
      <BreadcrumbSchema vault={vault} />
      <FaqSchema items={faqItems} />

      <main className="pp-page">
        {/* Breadcrumbs */}
        <nav className="pp-crumbs">
          <Link href="/">Home</Link>
          <span className="sep">/</span>
          <Link href={`/?asset=${vault.asset}`}>{vault.asset} Vaults</Link>
          <span className="sep">/</span>
          <span>{vault.chain}</span>
          <span className="sep">/</span>
          <span className="current">{vault.productName}</span>
        </nav>

        {/* Header */}
        <div className="pp-header">
          <div>
            <div className="pp-tag-row">
              <span className="tag">
                <span className="dot" />
                Active
              </span>
              <span className="tag">{vault.chain}</span>
              <span className="tag">{vault.vaultType}</span>
            </div>
            <div className="pp-title">
              <AssetBadge asset={vault.asset} iconOnly />
              <div>
                <h1>{vault.productName}</h1>
                <div className="by">
                  by <b>{vault.protocol.name}</b>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="pp-kpis">
          <div className="pp-kpi">
            <div className="k-label">24H APY</div>
            <div className="k-val hot">{formatAPY(vault.apy24h)}</div>
          </div>
          <div className="pp-kpi">
            <div className="k-label">30D APY</div>
            <div className="k-val">{formatAPY(vault.apy30d)}</div>
          </div>
          <div className="pp-kpi">
            <div className="k-label">TVL</div>
            <div className="k-val">{formatTVL(vault.tvl)}</div>
          </div>
          <div className="pp-kpi">
            <div className="k-label">Chain</div>
            <div className="k-val">{vault.chain}</div>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="pp-grid">
          {/* Main column */}
          <div>
            {/* About */}
            <div className="pp-section" id="about">
              <h2>About {vault.productName}</h2>
              <p>
                {vault.productName} is a {vault.vaultType.toLowerCase()} vault on{" "}
                {vault.chain} that accepts {vault.asset} deposits.{" "}
                {vault.vaultType === "Autocompounder"
                  ? `It automatically reinvests earned ${vault.asset} yields, compounding returns over time without manual harvesting or restaking.`
                  : `It automatically allocates ${vault.asset} deposits across optimized yield strategies, rebalancing to capture the best available rates.`}
              </p>
              {vault.tvl > 0 && vault.apy24h > 0 && (
                <p>
                  The vault currently holds <strong>{formatTVL(vault.tvl)}</strong> in deposits
                  and is generating <strong>{formatAPY(vault.apy24h)}</strong> APY over the last 24 hours.
                  {vault.apy30d > 0 &&
                    <> The 30-day average sits at <strong>{formatAPY(vault.apy30d)}</strong>.</>}
                </p>
              )}
            </div>

            {/* Charts - each standalone with Chart/Data tabs */}
            {hasCharts && (
              <div className="pp-section" id="performance">
                <h2>Performance History</h2>
                {apyChartData.length >= 2 && (
                  <ChartCard
                    title="APY History"
                    data={apyChartData}
                    format="percent"
                  />
                )}
                {tvlChartData.length >= 2 && (
                  <div style={{ marginTop: 14 }}>
                    <ChartCard
                      title="TVL History"
                      data={tvlChartData}
                      format="dollar"
                    />
                  </div>
                )}
                {sharePriceChartData.length >= 2 && (
                  <div style={{ marginTop: 14 }}>
                    <ChartCard
                      title="Share Price History"
                      data={sharePriceChartData}
                      format="number"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Performance Commentary */}
            <VaultCommentary
              vault={vault}
              allVaults={allVaults}
              history={history}
            />

            {/* Consistency Score */}
            <ConsistencyScore history={history} spotAPY={vault.apy24h} />

            {/* Statistics Block */}
            <VaultStatistics history={history} currentTvl={vault.tvl} />

            {/* Yield Breakdown */}
            {vault.apyBreakdown.length > 0 && (
              <YieldBreakdown
                apyBreakdown={vault.apyBreakdown}
                boostedApy={vault.boostedApy}
              />
            )}

            {/* Earnings Calculator */}
            <EarningsCalculator apy={vault.apy24h} asset={vault.asset} />

            {/* History Table */}
            <VaultHistoryTable history={history} />

            {/* Contract Details */}
            <div className="pp-section" id="details">
              <h2>Contract Details</h2>
              <div
                style={{
                  border: "1px solid var(--line)",
                  borderRadius: "var(--radius)",
                  background: "var(--panel)",
                  overflow: "hidden",
                }}
              >
                <div className="detail-row" style={{ padding: "10px 16px" }}>
                  <span className="dr-label">Chain</span>
                  <span className="dr-val">{vault.chain}</span>
                </div>
                <div className="detail-row" style={{ padding: "10px 16px" }}>
                  <span className="dr-label">Contract</span>
                  <span className="dr-val" style={{ fontSize: 12 }}>{vault.contractAddress}</span>
                </div>
                <div className="detail-row" style={{ padding: "10px 16px" }}>
                  <span className="dr-label">Type</span>
                  <span className="dr-val">{vault.vaultType}</span>
                </div>
                <div className="detail-row" style={{ padding: "10px 16px" }}>
                  <span className="dr-label">Asset</span>
                  <span className="dr-val">{vault.asset}</span>
                </div>
              </div>
            </div>

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
            <TableOfContents items={tocItems} />
          </div>
        </div>
      </main>
    </>
  );
}
