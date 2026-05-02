"use client";

import { useState } from "react";
import { VaultChart } from "./vault-chart";

interface DataPoint {
  timestamp: number;
  value: number;
}

interface Props {
  apyData: DataPoint[];
  tvlData: DataPoint[];
  sharePriceData: DataPoint[];
  currentApy: number;
  currentTvl: number;
  currentSharePrice: number | null;
  sharePriceGrowth: number | null;
}

type Metric = "apy" | "tvl" | "share";

function formatApy(v: number): string {
  return `${v.toFixed(2)}%`;
}

function formatTvl(v: number): string {
  if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(2)}B`;
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
  return `$${v.toFixed(2)}`;
}

function formatShare(v: number): string {
  if (v >= 1) return v.toFixed(4);
  return v.toFixed(6);
}

export function PerformanceHistory({
  apyData,
  tvlData,
  sharePriceData,
  currentApy,
  currentTvl,
  currentSharePrice,
  sharePriceGrowth,
}: Props) {
  const tiles: Array<{
    key: Metric;
    label: string;
    value: string;
    sub: string;
    color: string;
    enabled: boolean;
  }> = [
    {
      key: "apy",
      label: "APY History",
      value: currentApy > 0 ? formatApy(currentApy) : "-",
      sub: "current",
      color: "#16a34a",
      enabled: apyData.length >= 2,
    },
    {
      key: "tvl",
      label: "TVL History",
      value: currentTvl > 0 ? formatTvl(currentTvl) : "-",
      sub: "current",
      color: "#3b82f6",
      enabled: tvlData.length >= 2,
    },
    {
      key: "share",
      label: "Share Price",
      value: currentSharePrice ? formatShare(currentSharePrice) : "-",
      sub:
        sharePriceGrowth != null
          ? `${sharePriceGrowth >= 0 ? "+" : ""}${sharePriceGrowth.toFixed(2)}% all time`
          : "lifetime",
      color: "#a855f7",
      enabled: sharePriceData.length >= 2,
    },
  ];

  const firstEnabled = tiles.find((t) => t.enabled)?.key ?? "apy";
  const [active, setActive] = useState<Metric>(firstEnabled);

  const activeTile = tiles.find((t) => t.key === active) ?? tiles[0];
  const activeData =
    active === "apy" ? apyData : active === "tvl" ? tvlData : sharePriceData;
  const activeFormat: "percent" | "dollar" | "number" =
    active === "apy" ? "percent" : active === "tvl" ? "dollar" : "number";

  return (
    <div className="perf-card">
      <div className="perf-tiles">
        {tiles.map((t) => (
          <button
            key={t.key}
            type="button"
            disabled={!t.enabled}
            onClick={() => t.enabled && setActive(t.key)}
            className={`perf-tile${active === t.key ? " active" : ""}${!t.enabled ? " disabled" : ""}`}
            style={
              active === t.key
                ? ({ "--perf-tile-accent": t.color } as React.CSSProperties)
                : undefined
            }
          >
            <span className="perf-tile-label">{t.label}</span>
            <span className="perf-tile-value">{t.value}</span>
            <span className="perf-tile-sub">{t.sub}</span>
          </button>
        ))}
      </div>
      <VaultChart data={activeData} format={activeFormat} color={activeTile.color} />
    </div>
  );
}
