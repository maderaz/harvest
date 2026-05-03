// Helpers for human-readable contextualizations on product pages.
// Reference deposit: $1,000 for USD-denominated assets (USDC/USDT/EURC),
// 1 ETH for ETH, 1 BTC for BTC.

export function depositRef(asset: string): { amount: number; label: string } {
  if (asset === "ETH") return { amount: 1, label: "1 ETH" };
  if (asset === "BTC") return { amount: 1, label: "1 BTC" };
  return { amount: 1000, label: "$1,000" };
}

// Annual APY (%) → monthly earnings on given deposit amount
export function apyToMonthly(apy: number, depositAmount: number): number {
  return (apy / 100) * depositAmount / 12;
}

// Format an earnings value with "~" prefix and appropriate rounding.
// USD: <$10 → 2dp; $10-100 → $1; >$100 → $5 increments.
// ETH/BTC: 4 significant figures.
export function fmtEarnings(val: number, asset: string): string {
  if (asset === "ETH" || asset === "BTC") {
    return `~${parseFloat(val.toPrecision(4))} ${asset}`;
  }
  if (val < 10) return `~$${val.toFixed(2)}`;
  if (val <= 100) return `~$${Math.round(val)}`;
  return `~$${Math.round(val / 5) * 5}`;
}

// Signed format for deltas (WoW etc.) — sign is always explicit.
export function fmtEarningsSigned(val: number, asset: string): string {
  const sign = val >= 0 ? "+" : "-";
  const abs = fmtEarnings(Math.abs(val), asset);
  // Insert sign: "~$2.74" → "+~$2.74" or "-~$2.74"
  return `${sign}${abs}`;
}

// TVL percentile label from rank (1 = largest) and total count.
export function tvlPercentileLabel(tvlRank: number, total: number): string {
  const frac = tvlRank / total;
  if (tvlRank <= 5 || frac <= 0.1) return "top 10%";
  if (frac <= 0.25) return "top quarter";
  if (frac <= 0.75) return "middle";
  if (frac <= 0.9) return "bottom quarter";
  return "bottom 10%";
}

// Qualify relative APY position vs a benchmark.
// delta = (vaultApy - benchmark) / benchmark * 100
export function benchmarkQualifier(deltaPct: number): string {
  if (deltaPct < -30) return "well below";
  if (deltaPct < -10) return "below";
  if (deltaPct <= 10) return "near";
  if (deltaPct <= 30) return "above";
  return "well above";
}
