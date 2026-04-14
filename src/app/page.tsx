import { Suspense } from "react";
import { getVaults } from "@/lib/data";
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from "@/lib/constants";
import { VaultList } from "@/components/vault-list";
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

export default async function Home() {
  const vaults = await getVaults();

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Explore &amp; Compare over{" "}
          <span className="text-blue-600">{vaults.length}</span> Yield Sources
        </h1>
        <p className="mt-2 text-base text-gray-500">
          Credible, neutral data for onchain vaults. Find the best yield for
          your assets.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20 text-gray-400">
            Loading vaults...
          </div>
        }
      >
        <VaultList vaults={vaults} />
      </Suspense>
    </main>
  );
}
