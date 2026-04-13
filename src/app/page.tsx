import { Suspense } from "react";
import { vaults } from "@/lib/data";
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from "@/lib/constants";
import { VaultTable } from "@/components/vault-table";
import { AssetFilter } from "@/components/asset-filter";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `${SITE_NAME} — Compare DeFi Yield Sources`,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: `${SITE_NAME} — Compare DeFi Yield Sources`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Compare DeFi Yield Sources`,
    description: SITE_DESCRIPTION,
  },
  alternates: {
    canonical: SITE_URL,
  },
};

function HomeContent({
  searchParams,
}: {
  searchParams: Promise<{ asset?: string }>;
}) {
  return (
    <HomeContentInner searchParamsPromise={searchParams} />
  );
}

async function HomeContentInner({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ asset?: string }>;
}) {
  const { asset } = await searchParamsPromise;
  const filtered = asset
    ? vaults.filter((v) => v.asset === asset)
    : vaults;

  return <VaultTable vaults={filtered} />;
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ asset?: string }>;
}) {
  const totalCount = vaults.length;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Explore &amp; Compare over{" "}
          <span className="text-blue-600">{totalCount}</span> Yield Sources
        </h1>
        <p className="mt-2 text-base text-gray-500">
          Credible, neutral data for onchain vaults. Find the best yield for
          your assets.
        </p>
      </div>

      <div className="mb-6">
        <Suspense fallback={null}>
          <AssetFilter />
        </Suspense>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20 text-gray-400">
              Loading vaults...
            </div>
          }
        >
          <HomeContent searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
