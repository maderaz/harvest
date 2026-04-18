import { formatAPY } from "@/lib/format";

interface ApySource {
  source: string;
  apy: number;
}

interface YieldBreakdownProps {
  apyBreakdown: ApySource[];
  boostedApy: number | null;
}

const BAR_COLORS = [
  "bg-green-500",
  "bg-blue-500",
  "bg-purple-500",
  "bg-amber-500",
  "bg-cyan-500",
  "bg-rose-500",
];

const BOOSTED_COLOR = "bg-yellow-400";

export function YieldBreakdown({ apyBreakdown, boostedApy }: YieldBreakdownProps) {
  if (apyBreakdown.length === 0) return null;

  const entries: ApySource[] = [...apyBreakdown];
  if (boostedApy && boostedApy > 0) {
    entries.push({ source: "Boosted", apy: boostedApy });
  }

  const totalApy = entries.reduce((sum, e) => sum + e.apy, 0);

  return (
    <section className="mb-8">
      <h2 className="mb-3 text-lg font-semibold text-gray-900">
        Yield Sources
      </h2>
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        {/* Proportional bar */}
        {totalApy > 0 && (
          <div className="mb-4 flex h-3 w-full overflow-hidden rounded-full bg-gray-100">
            {entries.map((entry, i) => {
              const widthPct = (entry.apy / totalApy) * 100;
              if (widthPct <= 0) return null;
              const color =
                entry.source === "Boosted"
                  ? BOOSTED_COLOR
                  : BAR_COLORS[i % BAR_COLORS.length];
              return (
                <div
                  key={i}
                  className={`${color} transition-all`}
                  style={{ width: `${widthPct}%` }}
                  title={`${entry.source}: ${formatAPY(entry.apy)}`}
                />
              );
            })}
          </div>
        )}

        {/* Source list */}
        <div className="space-y-2">
          {entries.map((entry, i) => {
            const color =
              entry.source === "Boosted"
                ? BOOSTED_COLOR
                : BAR_COLORS[i % BAR_COLORS.length];
            return (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block h-3 w-3 rounded-full ${color}`}
                  />
                  <span className="text-sm text-gray-700">{entry.source}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {formatAPY(entry.apy)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Total */}
        {entries.length > 1 && (
          <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
            <span className="text-sm font-semibold text-gray-900">Total</span>
            <span className="text-sm font-semibold text-green-600">
              {formatAPY(totalApy)}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
