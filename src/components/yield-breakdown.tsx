import { formatAPY } from "@/lib/format";

interface ApySource {
  source: string;
  apy: number;
}

interface YieldBreakdownProps {
  apyBreakdown: ApySource[];
  boostedApy: number | null;
}

export function YieldBreakdown({ apyBreakdown, boostedApy }: YieldBreakdownProps) {
  if (apyBreakdown.length === 0) return null;

  const entries: ApySource[] = [...apyBreakdown];
  if (boostedApy && boostedApy > 0) {
    entries.push({ source: "Compounding boost", apy: boostedApy });
  }

  const sources = entries.filter((e) => e.apy > 0);
  if (sources.length === 0) return null;

  const maxApy = Math.max(...sources.map((s) => s.apy));
  const totalApy = sources.reduce((sum, e) => sum + e.apy, 0);

  return (
    <div className="pp-section" id="sources">
      <h2>Yield Sources</h2>
      <div className="ys-bars">
        {sources.map((s) => (
          <div key={s.source} className="ys-row">
            <div className="ys-name">{s.source}</div>
            <div className="ys-bar">
              <span style={{ width: `${(s.apy / maxApy) * 100}%` }} />
            </div>
            <div className="ys-val mono">{s.apy.toFixed(2)}%</div>
          </div>
        ))}
      </div>
      {sources.length > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "12px",
            marginTop: "4px",
            borderTop: "1px dashed var(--line)",
            fontSize: "14px",
          }}
        >
          <span style={{ fontWeight: 600 }}>Total APY</span>
          <span className="ys-val mono">{formatAPY(totalApy)}</span>
        </div>
      )}
    </div>
  );
}
