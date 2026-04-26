import { YieldVault } from "@/lib/types";
import type { FullVaultHistory } from "@/lib/history-api";

interface Props {
  vault: YieldVault;
  history: FullVaultHistory;
}

export function SidebarFacts({ vault, history }: Props) {
  const apyHist = history.apyHistory.filter((p) => p.apy >= 0);
  let trackedDays = 0;
  if (apyHist.length > 0) {
    const sorted = [...apyHist].sort((a, b) => a.timestamp - b.timestamp);
    trackedDays = Math.round(
      (sorted[sorted.length - 1].timestamp - sorted[0].timestamp) / 86400,
    );
  }

  return (
    <aside className="sidebar-facts">
      <div className="sf-title">Strategy details</div>
      <div className="sf-row">
        <span className="sf-label">Strategy</span>
        <span className="sf-val">{vault.category}</span>
      </div>
      <div className="sf-row">
        <span className="sf-label">Network</span>
        <span className="sf-val">{vault.chain}</span>
      </div>
      <div className="sf-row">
        <span className="sf-label">Type</span>
        <span className="sf-val">{vault.vaultType}</span>
      </div>
      <div className="sf-row">
        <span className="sf-label">Underlying</span>
        <span className="sf-val">{vault.asset}</span>
      </div>
      <div className="sf-row">
        <span className="sf-label">Operator</span>
        <span className="sf-val">{vault.protocol.name}</span>
      </div>
      {trackedDays > 0 && (
        <div className="sf-row">
          <span className="sf-label">Tracked for</span>
          <span className="sf-val">{trackedDays} days</span>
        </div>
      )}
    </aside>
  );
}
