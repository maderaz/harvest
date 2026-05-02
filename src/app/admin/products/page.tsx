import { getVaults } from "@/lib/data";
import { getCanonicalSlugs, getDuplicateGroupKey } from "@/lib/canonical-vaults";
import { AdminProductsTable, type AdminRow } from "@/components/admin-products-table";

export default async function AdminProductsPage() {
  const vaults = await getVaults();
  const canonical = await getCanonicalSlugs();

  const groupSizes = new Map<string, number>();
  for (const v of vaults) {
    const k = getDuplicateGroupKey(v.slug);
    groupSizes.set(k, (groupSizes.get(k) ?? 0) + 1);
  }

  const rows: AdminRow[] = vaults
    .map((v) => {
      const groupKey = getDuplicateGroupKey(v.slug);
      return {
        slug: v.slug,
        productName: v.productName,
        chain: v.chain,
        asset: v.asset,
        apy24h: v.apy24h,
        tvl: v.tvl,
        indexed: canonical.has(v.slug),
        groupKey,
        groupSize: groupSizes.get(groupKey) ?? 1,
      };
    })
    .sort((a, b) => {
      if (a.groupKey !== b.groupKey) return a.groupKey.localeCompare(b.groupKey);
      return b.tvl - a.tvl;
    });

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="adm-header">
        <h1>Products</h1>
        <p className="adm-sub">
          Indexing strategy: when the API returns the same product under multiple slugs
          ({"{slug}-1, {slug}-2, ..."}), the highest-TVL entry stays indexed and the rest
          are marked noindex to protect crawl budget.
        </p>
      </div>
      <AdminProductsTable rows={rows} />
    </main>
  );
}
