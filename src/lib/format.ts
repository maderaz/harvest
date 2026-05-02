export function formatTVL(value: number): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

export function formatAPY(value: number): string {
  if (value === 0) return "-";
  return `${value.toFixed(2)}%`;
}

const KNOWN_CHAINS = ["Ethereum", "Polygon", "Arbitrum", "Base", "zkSync", "HyperEVM"];

export function stripChainSuffix(category: string, chain?: string): string {
  if (!category) return category;
  const targets = chain ? [chain, ...KNOWN_CHAINS] : KNOWN_CHAINS;
  for (const c of targets) {
    const suffix = ` - ${c}`;
    if (category.endsWith(suffix)) return category.slice(0, -suffix.length);
  }
  return category;
}