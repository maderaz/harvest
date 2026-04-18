import { YieldVault } from "./types";
import { fetchHarvestVaults } from "./harvest-api";
import {
  fetchFullVaultHistory,
  chainNameToKey,
  type FullVaultHistory,
} from "./history-api";
import { writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";

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

const HISTORY_CACHE_FILE = join(process.cwd(), ".history-cache.json");

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function prefetchAllHistory(vaults: YieldVault[]): Promise<Record<string, FullVaultHistory>> {
  const map: Record<string, FullVaultHistory> = {};
  const empty: FullVaultHistory = { tvlHistory: [], sharePriceHistory: [], apyHistory: [] };

  log(`[prefetch] fetching history for ${vaults.length} vaults`);

  let consecutiveFails = 0;

  for (let i = 0; i < vaults.length; i++) {
    const v = vaults[i];
    const chainKey = chainNameToKey(v.chain);
    if (!chainKey || !v.contractAddress) {
      map[v.contractAddress] = empty;
      continue;
    }

    try {
      const history = await fetchFullVaultHistory(v.contractAddress, chainKey);
      const hasData = history.tvlHistory.length > 0 || history.apyHistory.length > 0;
      map[v.contractAddress] = history;
      if (hasData) {
        consecutiveFails = 0;
      } else {
        consecutiveFails++;
      }
    } catch {
      map[v.contractAddress] = empty;
      consecutiveFails++;
    }

    if (consecutiveFails >= 5) {
      log(`[prefetch] API appears down (5 consecutive fails). Skipping remaining ${vaults.length - i - 1} vaults.`);
      for (let j = i + 1; j < vaults.length; j++) {
        map[vaults[j].contractAddress] = empty;
      }
      break;
    }

    await sleep(100);
  }

  let withData = 0;
  for (const h of Object.values(map)) {
    if (h.tvlHistory.length > 0 || h.apyHistory.length > 0) withData++;
  }
  log(`[prefetch] done. ${withData}/${Object.keys(map).length} vaults have chart data`);

  return map;
}

let _vaultCache: YieldVault[] | null = null;

export async function getVaults(): Promise<YieldVault[]> {
  if (_vaultCache) return _vaultCache;
  const live = await fetchHarvestVaults();
  _vaultCache = live.length > 0 ? live : [FALLBACK_VAULT];
  return _vaultCache;
}

let _historyFetching = false;

export async function ensureHistoryCache(): Promise<void> {
  if (existsSync(HISTORY_CACHE_FILE)) return;
  if (_historyFetching) {
    // Another call is already fetching, wait for file to appear
    for (let i = 0; i < 300; i++) {
      await sleep(1000);
      if (existsSync(HISTORY_CACHE_FILE)) return;
    }
    return;
  }
  _historyFetching = true;

  const vaults = await getVaults();
  const history = await prefetchAllHistory(vaults);
  try {
    writeFileSync(HISTORY_CACHE_FILE, JSON.stringify(history));
    log(`[prefetch] wrote cache to ${HISTORY_CACHE_FILE}`);
  } catch (err) {
    log(`[prefetch] failed to write cache: ${err}`);
    // Write empty cache so other workers don't retry
    try { writeFileSync(HISTORY_CACHE_FILE, "{}"); } catch {}
  }
}

export async function getVaultHistory(contractAddress: string): Promise<FullVaultHistory> {
  const empty: FullVaultHistory = { tvlHistory: [], sharePriceHistory: [], apyHistory: [] };

  await ensureHistoryCache();

  try {
    if (!existsSync(HISTORY_CACHE_FILE)) return empty;
    const raw = readFileSync(HISTORY_CACHE_FILE, "utf-8");
    const map = JSON.parse(raw) as Record<string, FullVaultHistory>;
    return map[contractAddress] ?? empty;
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
