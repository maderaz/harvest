import { YieldVault, VaultConfig } from "./types";
import { fetchVaultData } from "./subgraph";

/**
 * Vault configurations — add new vaults here.
 * Live APY / TVL are fetched from the subgraph at build time;
 * fallback values are used when the subgraph is unreachable.
 */
const VAULT_CONFIGS: VaultConfig[] = [
  {
    address: "0xA0200EEeD8D90aa01dE741DAEfab5F86C09D5785",
    slug: "usdc-autocompounder-ethereum",
    asset: "USDC",
    productName: "USDC Autocompounder",
    vaultType: "Autocompounder",
    chain: "Ethereum",
    category: "Yield Optimization",
    description:
      "Harvest's USDC Autocompounder automatically compounds lending yields across top DeFi protocols. Smart contracts continuously harvest rewards and reinvest them, maximizing your USDC returns without manual intervention.",
    riskLevel: "low",
    launchDate: "2026-03-01",
    fallbackApy: 0,
    fallbackTvl: 0,
  },
];

const PROTOCOL = { name: "Harvest Finance", slug: "harvest-finance" };

async function buildVault(config: VaultConfig): Promise<YieldVault> {
  const live = await fetchVaultData(config.address);

  return {
    id: config.address,
    slug: config.slug,
    asset: config.asset,
    productName: config.productName,
    protocol: PROTOCOL,
    vaultType: config.vaultType,
    apy24h: live.apy ?? config.fallbackApy,
    apy30d: live.apy ?? config.fallbackApy, // subgraph gives latest; 30d needs historical calc
    tvl: live.tvl ?? config.fallbackTvl,
    description: config.description,
    chain: config.chain,
    contractAddress: config.address,
    riskLevel: config.riskLevel,
    category: config.category,
    launchDate: config.launchDate,
  };
}

let _cache: YieldVault[] | null = null;

export async function getVaults(): Promise<YieldVault[]> {
  if (_cache) return _cache;
  _cache = await Promise.all(VAULT_CONFIGS.map(buildVault));
  return _cache;
}

export async function getVaultBySlug(
  slug: string,
): Promise<YieldVault | undefined> {
  const vaults = await getVaults();
  return vaults.find((v) => v.slug === slug);
}

export async function getAllSlugs(): Promise<string[]> {
  return VAULT_CONFIGS.map((c) => c.slug);
}
