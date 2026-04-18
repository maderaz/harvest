import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getVaults, getVaultBySlug, getAllSlugs, getVaultHistory } from "@/lib/data";
import { formatAPY, formatTVL } from "@/lib/format";
import { AssetBadge } from "@/components/asset-badge";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { YieldVault } from "@/lib/types";
import type { FullVaultHistory } from "@/lib/history-api";
import { VaultChart } from "@/components/vault-chart";
import { VaultCommentary } from "@/components/vault-commentary";
import { VaultFaq } from "@/components/vault-faq";
import { YieldBreakdown } from "@/components/yield-breakdown";

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

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p
        className={`mt-1 text-2xl font-semibold ${highlight ? "text-green-600" : "text-gray-900"}`}
      >
        {value}
      </p>
    </div>
  );
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
    question: `What is the risk level of ${vault.productName}?`,
    answer: `${vault.productName} is classified as ${vault.riskLevel} risk. Risk levels are determined based on factors such as the underlying protocol, smart contract complexity, and asset volatility. Always do your own research before depositing.`,
  });

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

  return (
    <>
      <StructuredData vault={vault} />
      <BreadcrumbSchema vault={vault} />
      <FaqSchema items={faqItems} />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-700">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link
            href={`/?asset=${vault.asset}`}
            className="hover:text-gray-700"
          >
            {vault.asset} Vaults
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600">{vault.chain}</span>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{vault.productName}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <AssetBadge asset={vault.asset} />
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
              {vault.chain}
            </span>
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
              {vault.vaultType}
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {vault.productName}
          </h1>
          <p className="mt-1 text-base text-gray-500">
            by{" "}
            <span className="font-medium text-gray-700">
              {vault.protocol.name}
            </span>
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            label="24H APY"
            value={formatAPY(vault.apy24h)}
            highlight
          />
          <StatCard label="30D APY" value={formatAPY(vault.apy30d)} />
          <StatCard label="TVL" value={formatTVL(vault.tvl)} />
          <StatCard
            label="Risk Level"
            value={vault.riskLevel.charAt(0).toUpperCase() + vault.riskLevel.slice(1)}
          />
        </div>

        {/* Yield Breakdown */}
        {vault.apyBreakdown.length > 0 && (
          <YieldBreakdown
            apyBreakdown={vault.apyBreakdown}
            boostedApy={vault.boostedApy}
          />
        )}

        {/* History Charts */}
        {hasCharts && (
          <section className="mb-10">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Performance History
            </h2>
            <div className="grid gap-4">
              {tvlChartData.length >= 2 && (
                <VaultChart
                  title="TVL History"
                  data={tvlChartData}
                  format="dollar"
                />
              )}
              {apyChartData.length >= 2 && (
                <VaultChart
                  title="APY History"
                  data={apyChartData}
                  format="percent"
                />
              )}
              {sharePriceChartData.length >= 2 && (
                <VaultChart
                  title="Share Price History"
                  data={sharePriceChartData}
                  format="number"
                />
              )}
            </div>
          </section>
        )}

        {/* Performance Commentary */}
        <VaultCommentary
          vault={vault}
          allVaults={allVaults}
          history={history}
        />

        {/* Description */}
        <section className="mb-10">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">
            About {vault.productName}
          </h2>
          <p className="leading-relaxed text-gray-600">
            {vault.productName} is a {vault.vaultType.toLowerCase()} vault on{" "}
            {vault.chain} by {vault.protocol.name} that accepts {vault.asset}{" "}
            deposits.{" "}
            {vault.vaultType === "Autocompounder"
              ? `As an autocompounder, it automatically reinvests earned ${vault.asset} yields to compound returns over time without requiring manual harvesting or restaking.`
              : `As an autopilot vault, it automatically allocates ${vault.asset} deposits across optimized yield strategies managed by ${vault.protocol.name}.`}{" "}
            {vault.description}
          </p>
          {vault.tvl > 0 && vault.apy24h > 0 && (
            <p className="mt-2 leading-relaxed text-gray-600">
              The vault currently holds {formatTVL(vault.tvl)} in total value
              locked and is generating {formatAPY(vault.apy24h)} APY (24h).
              {vault.apy30d > 0 &&
                ` The 30-day average APY is ${formatAPY(vault.apy30d)}.`}{" "}
              The risk level is classified as {vault.riskLevel}. {vault.productName}{" "}
              is categorized under {vault.category} and deployed on the{" "}
              {vault.chain} network.
            </p>
          )}
          {(vault.tvl <= 0 || vault.apy24h <= 0) && (
            <p className="mt-2 leading-relaxed text-gray-600">
              {vault.productName} is categorized under {vault.category},{" "}
              deployed on the {vault.chain} network, and classified as{" "}
              {vault.riskLevel} risk.
            </p>
          )}
        </section>

        {/* Details */}
        <section className="mb-10">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Details</h2>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <dt className="text-sm font-medium text-gray-500">Chain</dt>
              <dd className="mt-1 text-sm text-gray-900">{vault.chain}</dd>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <dt className="text-sm font-medium text-gray-500">Contract</dt>
              <dd className="mt-1 text-sm font-mono text-gray-900">
                {vault.contractAddress}
              </dd>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <dt className="text-sm font-medium text-gray-500">Type</dt>
              <dd className="mt-1 text-sm text-gray-900">{vault.vaultType}</dd>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <dt className="text-sm font-medium text-gray-500">Asset</dt>
              <dd className="mt-1 text-sm text-gray-900">{vault.asset}</dd>
            </div>
          </dl>
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
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              More {vault.asset} Vaults
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {relatedVaults.map((rv) => (
                <Link
                  key={rv.id}
                  href={`/${rv.slug}`}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300 hover:bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {rv.productName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {rv.protocol.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">
                      {formatAPY(rv.apy24h)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatTVL(rv.tvl)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
