export type Asset = "USDC" | "USDT" | "ETH" | "WBTC" | "cbBTC" | "EURC";

export type VaultType = "Autocompounder" | "Autopilot";

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
  vaultType: VaultType;
  apy24h: number;
  apy30d: number;
  tvl: number;
  description: string;
  chain: string;
  contractAddress: string;
  riskLevel: "low" | "medium" | "high";
  category: string;
  launchDate: string;
  apyBreakdown: { source: string; apy: number }[];
  boostedApy: number | null;
}

export interface VaultConfig {
  address: string;
  slug: string;
  asset: Asset;
  productName: string;
  vaultType: VaultType;
  chain: string;
  category: string;
  description: string;
  riskLevel: "low" | "medium" | "high";
  launchDate: string;
  fallbackApy: number;
  fallbackTvl: number;
}
