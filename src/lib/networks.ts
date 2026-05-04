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

export function getNetworkByChain(chain: string) {
  return NETWORKS.find((n) => n.chain === chain) ?? null;
}

export function chainToSlug(chain: string): NetworkSlug | string {
  return (
    NETWORKS.find((n) => n.chain === chain)?.slug ??
    chain.toLowerCase().replace(/[^a-z0-9]+/g, "-")
  );
}

// Neutral, factual one-paragraph framings used in the editorial intro on each
// network hub page. Kept short (~50 words) so the strategy table stays the
// dominant content.
export const NETWORK_BLURBS: Record<string, string> = {
  Ethereum:
    "Ethereum is the original general-purpose smart-contract network and hosts the largest pool of liquidity and lending markets in DeFi. The strategies indexed here run on Ethereum mainnet rather than on rollups or sidechains.",
  Base:
    "Base is an Ethereum L2 rollup launched by Coinbase in 2023 and built on the OP Stack. It has become a common deployment target for stablecoin and ETH yield strategies because of its low fees and Coinbase-routed onramps.",
  Arbitrum:
    "Arbitrum is an Ethereum optimistic rollup operated by Offchain Labs. It is one of the longest-running L2s by total value locked and is widely used for stablecoin and ETH-denominated DeFi positions.",
  Polygon:
    "Polygon (PoS) is an EVM-compatible network bridged to Ethereum. Yield strategies on Polygon typically use the same protocol stack as on mainnet, with lower transaction fees but separate liquidity.",
  HyperEVM:
    "HyperEVM is the EVM execution environment on Hyperliquid. Strategies indexed here are deployed against HyperEVM contracts and exposed to its specific liquidity and bridging characteristics.",
  zkSync:
    "zkSync Era is a zk-rollup that settles to Ethereum. The strategies tracked here use zkSync-native lending and AMM venues; bridging in and out of zkSync uses validity proofs rather than the long withdrawal windows seen on optimistic rollups.",
};
