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

  return (
    <>
      <StructuredData vault={vault} />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-700">
            Home
          </Link>
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

        {/* Description */}
        <section className="mb-10">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">
            About this Vault
          </h2>
          <p className="leading-relaxed text-gray-600">{vault.description}</p>
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
