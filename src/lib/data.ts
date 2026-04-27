import { YieldVault } from "./types";
import { fetchHarvestVaults } from "./harvest-api";
import {
  fetchFullVaultHistory,
  chainNameToKey,
  type FullVaultHistory,
} from "./history-api";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const VAULTS_FILE = join(process.cwd(), "data", "vaults.json");
const HISTORY_FILE = join(process.cwd(), "data", "history.json");

const FALLBACK_VAULT: YieldVault = {
  id: "fallback",
  slug: "usdc-autocompounder-ethereum",
  asset: "USDC",
  productName: "USDC Autocompounder",
  protocol: { name: "Harvest Finance", slug: "harvest-finance" },
  vaultType: "Autocompounder",
  apy24h: 0,
  apy30d: 0,
  tvl: 0,
  description:
    "Harvest's USDC Autocompounder automatically compounds lending yields across top DeFi protocols.",
  chain: "Ethereum",
  contractAddress: "",
  riskLevel: "low",
  category: "Yield Optimization",
  launchDate: "",
  apyBreakdown: [],
  boostedApy: null,
};

let _vaultCache: YieldVault[] | null = null;
let _historyCache: Record<string, FullVaultHistory> | null = null;

function loadVaultsFromFile(): YieldVault[] | null {
  try {
    if (!existsSync(VAULTS_FILE)) return null;
    const raw = readFileSync(VAULTS_FILE, "utf-8");
    const vaults = JSON.parse(raw) as YieldVault[];
    return vaults.length > 0 ? vaults : null;
  } catch {
    return null;
  }
}

function loadHistoryFromFile(): Record<string, FullVaultHistory> | null {
  try {
    if (!existsSync(HISTORY_FILE)) return null;
    const raw = readFileSync(HISTORY_FILE, "utf-8");
    return JSON.parse(raw) as Record<string, FullVaultHistory>;
  } catch {
    return null;
  }
}

export async function getVaults(): Promise<YieldVault[]> {
  if (_vaultCache) return _vaultCache;

  // Try file-based cache first
  const fromFile = loadVaultsFromFile();
  if (fromFile) {
    _vaultCache = fromFile;
    return _vaultCache;
  }

  // Fallback to live API (local dev without data files)
  const live = await fetchHarvestVaults();
  _vaultCache = live.length > 0 ? live : [FALLBACK_VAULT];
  return _vaultCache;
}

export async function getVaultHistory(contractAddress: string): Promise<FullVaultHistory> {
  const empty: FullVaultHistory = { tvlHistory: [], sharePriceHistory: [], apyHistory: [] };

  // Try file-based cache first
  if (!_historyCache) {
    _historyCache = loadHistoryFromFile();
  }

  if (_historyCache) {
    return _historyCache[contractAddress] ?? empty;
  }

  // Fallback to live API (local dev without data files)
  const vault = (await getVaults()).find((v) => v.contractAddress === contractAddress);
  if (!vault) return empty;

  const chainKey = chainNameToKey(vault.chain);
  if (!chainKey) return empty;

  try {
    return await fetchFullVaultHistory(contractAddress, chainKey);
  } catch {
    return empty;
  }
}

export async function getVaultBySlug(
  slug: string,
): Promise<YieldVault | undefined> {
  const vaults = await getVaults();
  return vaults.find((v) => v.slug === slug);
}

export async function getAllSlugs(): Promise<string[]> {
  const vaults = await getVaults();
  return vaults.map((v) => v.slug);
}

export async function getAllSparklines(): Promise<Record<string, number[]>> {
  if (!_historyCache) {
    _historyCache = loadHistoryFromFile();
  }
  if (!_historyCache) return {};

  const now = Math.floor(Date.now() / 1000);
  const thirtyDaysAgo = now - 30 * 86400;
  const result: Record<string, number[]> = {};

  for (const [addr, h] of Object.entries(_historyCache)) {
    const recent = h.apyHistory
      .filter((p) => p.apy >= 0 && p.timestamp >= thirtyDaysAgo)
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((p) => p.apy);

    if (recent.length >= 2) {
      const step = Math.max(1, Math.floor(recent.length / 24));
      result[addr] = recent.filter((_, i) => i % step === 0 || i === recent.length - 1);
    }
  }

  return result;
}
