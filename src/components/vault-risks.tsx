import Link from "next/link";
import { YieldVault } from "@/lib/types";

const ASSET_DEPEG_LABEL: Record<string, string> = {
  USDC: "USDC depeg",
  USDT: "USDT depeg",
  EURC: "EURC depeg",
  ETH: "underlying token depeg (LSTs and wrapped ETH derivatives)",
  BTC: "underlying token depeg or custodial event (WBTC, cbBTC, tBTC and other wrapped variants)",
};

export function VaultRisks({ vault }: { vault: YieldVault }) {
  const depegLabel = ASSET_DEPEG_LABEL[vault.asset] || "underlying token depeg";

  return (
    <section className="pp-section pp-risks" id="risks">
      <h2>Risks</h2>
      <div className="pp-risks-prose">
        <p>
          Standard DeFi risks apply: smart-contract bugs or exploits in the
          vault and the underlying protocol, liquidity-crunch risk where
          withdrawals are temporarily unavailable due to high underlying
          utilization, {depegLabel}, oracle failures or manipulation, and
          changes to the strategy or fee structure governed by Harvest
          Finance.
        </p>
        <p className="pp-risks-disclaimer">
          DeFi yields are not insured deposits. Past performance does not
          guarantee future returns.{" "}
          <Link href="/risk-framework">
            Understand the risk categories
          </Link>{" "}
          before depositing.
        </p>
      </div>
    </section>
  );
}
