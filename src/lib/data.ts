import { YieldVault } from "./types";
import { fetchHarvestVaults } from "./harvest-api";
import {
  fetchFullVaultHistory,
  chainNameToKey,
  type FullVaultHistory,
} from "./history-api";
import { writeFileSync } from "fs";

function log(msg: string) {
  try { writeFileSync("/dev/stderr", msg + "\n"); } catch { console.log(msg); }
}

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
};

let _cache: YieldVault[] | null = null;
let _historyCache: Map<string, FullVaultHistory> | null = null;

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function prefetchAllHistory(vaults: YieldVault[]): Promise<Map<string, FullVaultHistory>> {
  const map = new Map<string, FullVaultHistory>();
  const BATCH_SIZE = 3;

  log(`[prefetch] starting history fetch for ${vaults.length} vaults, batch=${BATCH_SIZE}`);

  for (let i = 0; i < vaults.length; i += BATCH_SIZE) {
    const batch = vaults.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map(async (v) => {
        const chainKey = chainNameToKey(v.chain);
        if (!chainKey || !v.contractAddress) {
          return { addr: v.contractAddress, history: { tvlHistory: [], sharePriceHistory: [], apyHistory: [] } as FullVaultHistory };
        }
        const history = await fetchFullVaultHistory(v.contractAddress, chainKey);
        return { addr: v.contractAddress, history };
      }),
    );
    for (const r of results) {
      map.set(r.addr, r.history);
    }
    if (i + BATCH_SIZE < vaults.length) {
      await sleep(200);
    }
  }

  let withData = 0;
  for (const [, h] of map) {
    if (h.tvlHistory.length > 0 || h.apyHistory.length > 0) withData++;
  }
  log(`[prefetch] done. ${withData}/${map.size} vaults have chart data`);

  return map;
}

export async function getVaults(): Promise<YieldVault[]> {
  if (_cache) return _cache;
  const live = await fetchHarvestVaults();
  _cache = live.length > 0 ? live : [FALLBACK_VAULT];
  return _cache;
}

export async function getHistoryMap(): Promise<Map<string, FullVaultHistory>> {
  if (_historyCache) return _historyCache;
  const vaults = await getVaults();
  _historyCache = await prefetchAllHistory(vaults);
  return _historyCache;
}

export async function getVaultHistory(contractAddress: string): Promise<FullVaultHistory> {
  const map = await getHistoryMap();
  return map.get(contractAddress) ?? { tvlHistory: [], sharePriceHistory: [], apyHistory: [] };
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
