const CHAIN_SLUGS: Record<string, string> = {
  Ethereum: "ethereum",
  Polygon: "polygon",
  Arbitrum: "arbitrum",
  Base: "base",
  zkSync: "zksync",
  HyperEVM: "hyperevm",
};

export function harvestAppUrl(chain: string, contractAddress: string): string {
  const slug = CHAIN_SLUGS[chain] ?? chain.toLowerCase().replace(/\s+/g, "");
  return `https://app.harvest.finance/${slug}/${contractAddress}`;
}
