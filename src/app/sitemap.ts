import type { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/data";
import { getCanonicalSlugs } from "@/lib/canonical-vaults";
import { SITE_URL } from "@/lib/constants";
import { NETWORKS } from "@/lib/networks";

export const dynamic = "force-static";

const ASSET_HUBS = ["usdc", "usdt", "btc", "eth"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getAllSlugs();
  const canonical = await getCanonicalSlugs();

  const vaultPages = slugs
    .filter((s) => canonical.has(s))
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
    ...assetHubPages,
    ...networkHubPages,
    ...vaultPages,
  ];
}
