export const NETWORKS = [
  { slug: "ethereum", display: "Ethereum", chain: "Ethereum" },
  { slug: "base", display: "Base", chain: "Base" },
  { slug: "arbitrum", display: "Arbitrum", chain: "Arbitrum" },
  { slug: "polygon", display: "Polygon", chain: "Polygon" },
  { slug: "hyperevm", display: "HyperEVM", chain: "HyperEVM" },
  { slug: "zksync", display: "zkSync", chain: "zkSync" },
] as const;

export type NetworkSlug = (typeof NETWORKS)[number]["slug"];

export function getNetworkBySlug(slug: string) {
  return NETWORKS.find((n) => n.slug === slug) ?? null;
}

export function chainToSlug(chain: string): NetworkSlug | string {
  return (
    NETWORKS.find((n) => n.chain === chain)?.slug ??
    chain.toLowerCase().replace(/[^a-z0-9]+/g, "-")
  );
}
