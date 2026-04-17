import { writeFileSync } from "fs";
import { YieldVault } from "./types";

const HARVEST_API = "https://api.harvest.finance/vaults?key=harvest-key";

function log(msg: string) {
  try {
    writeFileSync("/dev/stderr", msg + "\n");
  } catch {
    console.log(msg);
  }
}

interface HarvestVault {
  id?: string;
  vault?: string;
  vaultAddress?: string;
  address?: string;
  name?: string;
  displayName?: string;
  chain?: string;
  network?: string;
  underlying?: { symbol?: string };
  symbol?: string;
  token?: string;
  tvl?: number | string;
  apy?: number | string;
  apyAutoCompound?: number | string;
  boostedApy?: number | string;
  category?: string;
  type?: string;
  status?: string;
  active?: boolean;
  [key: string]: unknown;
}

function slugify(name: string, chain: string): string {
  return `${name}-${chain}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseNumber(val: unknown): number {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const n = parseFloat(val);
    return isNaN(n) ? 0 : n;
  }
  return 0;
}

export async function fetchHarvestVaults(): Promise<YieldVault[]> {
  try {
    log("[harvest-api] fetching vaults...");
    const res = await fetch(HARVEST_API);

    if (!res.ok) {
      log(`[harvest-api] failed: ${res.status}`);
      return [];
    }

    const raw = await res.json();
    log(`[harvest-api] response type: ${typeof raw}, isArray: ${Array.isArray(raw)}`);

    let vaultList: HarvestVault[] = [];

    if (Array.isArray(raw)) {
      vaultList = raw;
    } else if (typeof raw === "object" && raw !== null) {
      // API might return { eth: [...], base: [...] } or { data: [...] }
      const keys = Object.keys(raw);
      log(`[harvest-api] response keys: ${keys.join(", ")}`);

      if (raw.data && Array.isArray(raw.data)) {
        vaultList = raw.data;
      } else {
        // Try flattening all arrays from the response
        for (const key of keys) {
          if (Array.isArray(raw[key])) {
            for (const item of raw[key]) {
              if (typeof item === "object" && item !== null) {
                vaultList.push({ ...item, _sourceChain: key });
              }
            }
          }
        }
      }
    }

    log(`[harvest-api] total vaults found: ${vaultList.length}`);

    // Log first 5 vaults raw structure for debugging
    for (const v of vaultList.slice(0, 5)) {
      log(`[harvest-api] sample vault keys: ${Object.keys(v).join(", ")}`);
      log(`[harvest-api] sample vault: ${JSON.stringify(v).slice(0, 500)}`);
    }

    // Filter for USDC vaults
    const usdcVaults = vaultList.filter((v) => {
      const sym = (v.symbol || v.token || v.underlying?.symbol || v.name || "").toUpperCase();
      return sym.includes("USDC");
    });

    log(`[harvest-api] USDC vaults: ${usdcVaults.length}`);

    for (const v of usdcVaults.slice(0, 10)) {
      log(`[harvest-api] USDC vault: ${JSON.stringify(v).slice(0, 500)}`);
    }

    // Convert to our YieldVault type
    const results: YieldVault[] = [];
    for (const v of usdcVaults) {
      const addr = v.vaultAddress || v.vault || v.address || v.id || "";
      const name = v.displayName || v.name || `USDC Vault ${addr.slice(0, 8)}`;
      const chain = v.chain || v.network || (v as Record<string, unknown>)._sourceChain as string || "Ethereum";
      const apy = parseNumber(v.apy || v.apyAutoCompound || v.boostedApy);
      const tvl = parseNumber(v.tvl);
      const isActive = v.active !== false && v.status !== "inactive";

      if (!isActive) continue;

      results.push({
        id: addr || `vault-${results.length}`,
        slug: slugify(name, chain),
        asset: "USDC",
        productName: name,
        protocol: { name: "Harvest Finance", slug: "harvest-finance" },
        vaultType: (v.type || v.category || "").toLowerCase().includes("pilot") ? "Autopilot" : "Autocompounder",
        apy24h: apy,
        apy30d: apy,
        tvl,
        description: `${name} on ${chain} — automatically optimizes your USDC yield across top DeFi protocols via Harvest Finance.`,
        chain,
        contractAddress: addr,
        riskLevel: "low",
        category: v.category || v.type || "Yield Optimization",
        launchDate: "",
      });
    }

    log(`[harvest-api] final vault count: ${results.length}`);
    return results;
  } catch (err) {
    log(`[harvest-api] error: ${err}`);
    return [];
  }
}
