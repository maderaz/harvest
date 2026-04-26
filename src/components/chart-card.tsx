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

  const totalPages = Math.max(1, Math.ceil(sortedData.length / ROWS_PER_PAGE));
  const safePage = Math.min(page, totalPages - 1);
  const pageItems = sortedData.slice(
    safePage * ROWS_PER_PAGE,
    (safePage + 1) * ROWS_PER_PAGE,
  );

  if (data.length < 2) return null;

  if (view === "chart") {
    return (
      <div style={{ position: "relative" }}>
        {/* Chart/Data toggle in same visual row as title */}
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 16,
            zIndex: 5,
          }}
        >
          <ViewToggle view={view} onChange={setView} />
        </div>
        <VaultChart title={title} data={data} format={format} color={color} />
      </div>
    );
  }

  return (
    <div className="chart-card-inner">
      <div className="chart-header">
        <div className="chart-header-left">
          <span className="chart-title">{title}</span>
          <span className="chart-value">Data table</span>
        </div>
        <ViewToggle view={view} onChange={setView} />
      </div>
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
              className="chart-window-btn"
              style={{
                background: "var(--panel)",
                border: "1px solid var(--line)",
                opacity: safePage === 0 ? 0.4 : 1,
              }}
            >
              ‹ Prev
            </button>
            <button
              disabled={safePage >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              className="chart-window-btn"
              style={{
                background: "var(--panel)",
                border: "1px solid var(--line)",
                opacity: safePage >= totalPages - 1 ? 0.4 : 1,
              }}
            >
              Next ›
            </button>
          </div>
        </div>
      )}
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
    <div className="chart-windows" style={{ marginLeft: 8 }}>
      <button
        onClick={() => onChange("chart")}
        className={`chart-window-btn${view === "chart" ? " active" : ""}`}
      >
        Chart
      </button>
      <button
        onClick={() => onChange("data")}
        className={`chart-window-btn${view === "data" ? " active" : ""}`}
      >
        Data
      </button>
    </div>
  );
}
