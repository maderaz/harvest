import { writeFileSync } from "fs";

const SUBGRAPH_URL =
  "https://gateway.thegraph.com/api/subgraphs/id/H5QTRq1z4NFaZdZVECpLjCAMxcEYiRR6kmu2RrogCSGC";

async function querySubgraph(query: string): Promise<Record<string, unknown> | null> {
  const apiKey = process.env.GRAPH_API_KEY;
  if (!apiKey) {
    console.warn("[subgraph] GRAPH_API_KEY not set, using fallback data");
    return null;
  }

  try {
    const res = await fetch(SUBGRAPH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ query }),
    });

    if (!res.ok) {
      console.error(`[subgraph] query failed: ${res.status}`);
      return null;
    }

    const json = await res.json();
    if (json.errors) {
      console.error("[subgraph] GraphQL errors:", json.errors);
      return null;
    }
    return json.data;
  } catch (err) {
    console.error("[subgraph] fetch error:", err);
    return null;
  }
}

export interface SubgraphVaultData {
  apy: number | null;
  tvl: number | null;
  sharePrice: string | null;
  timestamp: number | null;
}

function log(msg: string) {
  try {
    writeFileSync("/dev/stderr", msg + "\n");
  } catch {
    console.log(msg);
  }
}

export async function fetchVaultData(
  vaultAddress: string,
): Promise<SubgraphVaultData> {
  const addr = vaultAddress.toLowerCase();
  const query = `{
    apyAutoCompounds(
      where: { vault: "${addr}" }
      orderBy: timestamp
      orderDirection: desc
      first: 1
    ) {
      apy
      timestamp
    }
    tvls(
      where: { vault: "${addr}" }
      orderBy: timestamp
      orderDirection: desc
      first: 1
    ) {
      value
      timestamp
    }
    vaultHistories(
      where: { vault: "${addr}" }
      orderBy: timestamp
      orderDirection: desc
      first: 1
    ) {
      sharePrice
      timestamp
    }
  }`;

  const data = await querySubgraph(query);
  if (!data) {
    return { apy: null, tvl: null, sharePrice: null, timestamp: null };
  }

  const apyArr = data.apyAutoCompounds as { apy: string; timestamp: string }[] | undefined;
  const tvlArr = data.tvls as { value: string; timestamp: string }[] | undefined;
  const histArr = data.vaultHistories as { sharePrice: string; timestamp: string }[] | undefined;

  log(`[subgraph] vault=${addr}`);
  log(`[subgraph] raw apyAutoCompounds: ${JSON.stringify(apyArr)}`);
  log(`[subgraph] raw tvls: ${JSON.stringify(tvlArr)}`);
  log(`[subgraph] raw vaultHistories: ${JSON.stringify(histArr)}`);

  const rawApy = apyArr?.[0] ? parseFloat(apyArr[0].apy) : null;
  const apy = rawApy !== null && rawApy >= 0 ? rawApy : null;

  return {
    apy,
    tvl: tvlArr?.[0] ? parseFloat(tvlArr[0].value) : null,
    sharePrice: histArr?.[0]?.sharePrice ?? null,
    timestamp: histArr?.[0] ? parseInt(histArr[0].timestamp, 10) : null,
  };
}
