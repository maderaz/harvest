import { getVaults } from "@/lib/data";
import { formatAPY, formatTVL } from "@/lib/format";
import { SITE_NAME } from "@/lib/constants";
import { SeoTable } from "@/components/seo-table";
import { existsSync, statSync } from "fs";
import { join } from "path";

export default async function AdminPage() {
  const vaults = await getVaults();

  // Generate the same title/description that [slug]/page.tsx uses
  const rows = vaults.map((vault) => ({
    slug: vault.slug,
    title: `${vault.productName} by ${vault.protocol.name}: ${formatAPY(vault.apy24h)} APY | ${SITE_NAME}`,
    description: `${vault.productName} on ${vault.protocol.name} offers ${formatAPY(vault.apy24h)} APY (24h) with ${formatTVL(vault.tvl)} TVL. ${vault.description}`,
    chain: vault.chain,
    apy: formatAPY(vault.apy24h),
    tvl: formatTVL(vault.tvl),
  }));

  // Get last modified time of vaults data file
  let lastUpdated = new Date().toISOString();
  const vaultsFile = join(process.cwd(), "data", "vaults.json");
  if (existsSync(vaultsFile)) {
    const stat = statSync(vaultsFile);
    lastUpdated = stat.mtime.toISOString();
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <SeoTable
        rows={rows}
        vaultCount={vaults.length}
        lastUpdated={new Date(lastUpdated).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      />
    </main>
  );
}
