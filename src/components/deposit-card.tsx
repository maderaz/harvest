import { formatAPY } from "@/lib/format";

interface DepositCardProps {
  apy24h: number;
  apy30d: number;
  asset: string;
}

export function DepositCard({ apy24h, apy30d, asset }: DepositCardProps) {
  return (
    <div className="deposit-card">
      <div className="dep-apy-row">
        <div>
          <div className="dep-tag">CURRENT APY &middot; 24H</div>
          <div className="dep-apy">{formatAPY(apy24h)}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="dep-tag">30D AVG</div>
          <div className="mono" style={{ fontSize: 18, fontWeight: 600 }}>{formatAPY(apy30d)}</div>
        </div>
      </div>
      <div className="dep-bal">
        <span>Current yield rates</span>
        <span className="mono">{asset}</span>
      </div>
      <div className="dep-projection">
        <div>
          <div className="dp-l">Est. monthly (per $1K)</div>
          <div className="dp-v">
            +${((1000 * (apy24h / 100)) / 12).toFixed(2)}
          </div>
        </div>
        <div>
          <div className="dp-l">Est. yearly (per $1K)</div>
          <div className="dp-v">
            +${(1000 * (apy24h / 100)).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
