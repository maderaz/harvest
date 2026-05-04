import type { MetadataRoute } from "next";
import { getVaults, isBrokenLowTvlVault } from "@/lib/data";
import { getCanonicalSlugs } from "@/lib/canonical-vaults";
import { SITE_URL } from "@/lib/constants";
import { NETWORKS } from "@/lib/networks";

export const dynamic = "force-static";

const ASSET_HUBS = ["usdc", "usdt", "btc", "eth"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const vaults = await getVaults();
  const canonical = await getCanonicalSlugs();
  const brokenSlugs = new Set(vaults.filter(isBrokenLowTvlVault).map((v) => v.slug));

  const vaultPages = vaults
    .map((v) => v.slug)
    .filter((s) => canonical.has(s) && !brokenSlugs.has(s))
    .map((slug) => ({
      url: `${SITE_URL}/${slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    }));

  const assetHubPages = ASSET_HUBS.map((hub) => ({
    url: `${SITE_URL}/${hub}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  const networkHubPages = NETWORKS.map((n) => ({
    url: `${SITE_URL}/${n.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/methodology`,
      lastModified: new Date("2026-05-03"),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/risk-framework`,
      lastModified: new Date("2026-05-03"),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date("2026-05-03"),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/security`,
      lastModified: new Date("2026-05-03"),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date("2026-05-03"),
      changeFrequency: "yearly" as const,
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date("2026-05-03"),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: new Date("2026-05-03"),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/disclosures`,
      lastModified: new Date("2026-05-03"),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
    ...assetHubPages,
    ...networkHubPages,
    ...vaultPages,
  ];
}
