export type Asset = "USDC" | "USDT" | "ETH" | "WBTC" | "cbBTC" | "EURC";

export interface Protocol {
  name: string;
  slug: string;
}

export interface YieldVault {
  id: string;
  slug: string;
  asset: Asset;
  productName: string;
  protocol: Protocol;
  apy24h: number;
  apy30d: number;
  tvl: number;
  description: string;
  chain: string;
  contractAddress: string;
  riskLevel: "low" | "medium" | "high";
  category: string;
  launchDate: string;
}
