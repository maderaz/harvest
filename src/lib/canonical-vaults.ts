import type { YieldVault } from "./types";
import { getVaults } from "./data";

function baseSlug(slug: string): string {
  return slug.replace(/-\d+$/, "");
}

let _canonical: Set<string> | null = null;

async function buildCanonicalSet(): Promise<Set<string>> {
  const vaults = await getVaults();
  const groups = new Map<string, YieldVault[]>();
  for (const v of vaults) {
    const key = baseSlug(v.slug);
    const arr = groups.get(key) ?? [];
    arr.push(v);
    groups.set(key, arr);
  }
  const canonical = new Set<string>();
  for (const arr of groups.values()) {
    if (arr.length === 1) {
      canonical.add(arr[0].slug);
      continue;
    }
    // Pick strongest: highest TVL wins; APY breaks ties.
    const best = [...arr].sort((a, b) => {
      if (b.tvl !== a.tvl) return b.tvl - a.tvl;
      return b.apy24h - a.apy24h;
    })[0];
    canonical.add(best.slug);
  }
  return canonical;
}

export async function getCanonicalSlugs(): Promise<Set<string>> {
  if (!_canonical) _canonical = await buildCanonicalSet();
  return _canonical;
}

export async function isCanonicalSlug(slug: string): Promise<boolean> {
  const set = await getCanonicalSlugs();
  return set.has(slug);
}

export function getDuplicateGroupKey(slug: string): string {
  return baseSlug(slug);
}
