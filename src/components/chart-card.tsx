"use client";

import { useState, useMemo } from "react";
import { VaultChart } from "./vault-chart";

interface DataPoint {
  timestamp: number;
  value: number;
}

type ValueFormat = "dollar" | "percent" | "number";

interface ChartCardProps {
  title: string;
  data: DataPoint[];
  format: ValueFormat;
  color?: string;
}

const ROWS_PER_PAGE = 8;

function formatDate(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatVal(value: number, format: ValueFormat): string {
  switch (format) {
    case "dollar":
      if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
      if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
      if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
      return `$${value.toFixed(2)}`;
    case "percent":
      return `${value.toFixed(2)}%`;
    case "number":
      if (value >= 1) return value.toFixed(4);
      return value.toFixed(6);
  }
}

export function ChartCard({ title, data, format, color }: ChartCardProps) {
  const [view, setView] = useState<"chart" | "data">("chart");
  const [page, setPage] = useState(0);

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => b.timestamp - a.timestamp);
  }, [data]);

  if (data.length < 2) return null;

  if (view === "chart") {
    return (
      <VaultChart
        title={title}
        data={data}
        format={format}
        color={color}
        rightSlot={<ViewToggle view={view} onChange={setView} />}
      />
    );
  }

  const totalPages = Math.max(1, Math.ceil(sortedData.length / ROWS_PER_PAGE));
  const safePage = Math.min(page, totalPages - 1);
  const pageItems = sortedData.slice(safePage * ROWS_PER_PAGE, (safePage + 1) * ROWS_PER_PAGE);

  return (
    <div className="vc-wrap">
      <div className="vc-header">
        <div className="vc-header-left">
          <span className="vc-title">{title}</span>
          <span className="vc-value">Data table</span>
        </div>
        <ViewToggle view={view} onChange={setView} />
      </div>
      <div style={{ padding: "0 16px 12px" }}>
        <table className="chart-datatable">
          <thead>
            <tr>
              <th>Date</th>
              <th className="r">Value</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((item) => (
              <tr key={item.timestamp}>
                <td>{formatDate(item.timestamp)}</td>
                <td className="r">{formatVal(item.value, format)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 10,
              fontSize: 12,
            }}
          >
            <span className="mono dim">
              Page {safePage + 1} / {totalPages}
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                disabled={safePage === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="vc-win-btn"
                style={{ opacity: safePage === 0 ? 0.4 : 1 }}
              >
                ‹ Prev
              </button>
              <button
                disabled={safePage >= totalPages - 1}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                className="vc-win-btn"
                style={{ opacity: safePage >= totalPages - 1 ? 0.4 : 1 }}
              >
                Next ›
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ViewToggle({
  view,
  onChange,
}: {
  view: "chart" | "data";
  onChange: (v: "chart" | "data") => void;
}) {
  return (
    <div className="vc-windows">
      <button
        onClick={() => onChange("chart")}
        className={`vc-win-btn${view === "chart" ? " active" : ""}`}
      >
        Chart
      </button>
      <button
        onClick={() => onChange("data")}
        className={`vc-win-btn${view === "data" ? " active" : ""}`}
      >
        Data
      </button>
    </div>
  );
}
