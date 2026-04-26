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
      if (value >= 1_000_000_000)
        return `$${(value / 1_000_000_000).toFixed(2)}B`;
      if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
      if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
      return `$${value.toFixed(2)}`;
    case "percent":
      return `${value.toFixed(2)}%`;
    case "number":
      if (value >= 1_000_000) return (value / 1_000_000).toFixed(6);
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
    (safePage + 1) * ROWS_PER_PAGE
  );

  if (data.length < 2) return null;

  return (
    <div className="charts-card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
          borderBottom: "1px solid var(--line)",
          background: "var(--bg-2)",
        }}
      >
        <span
          style={{
            fontSize: "11px",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--ink-3)",
            fontWeight: 500,
          }}
        >
          {title}
        </span>
        <div className="chart-data-tabs">
          <button
            className={view === "chart" ? "active" : ""}
            onClick={() => setView("chart")}
          >
            Chart
          </button>
          <button
            className={view === "data" ? "active" : ""}
            onClick={() => {
              setView("data");
              setPage(0);
            }}
          >
            Data
          </button>
        </div>
      </div>

      {view === "chart" ? (
        <div style={{ padding: "4px" }}>
          <VaultChart title={title} data={data} format={format} color={color} />
        </div>
      ) : (
        <div style={{ minHeight: "320px", display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1 }}>
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
          </div>
          {totalPages > 1 && (
            <div className="chart-datatable-foot">
              <span className="mono dim">
                Page {safePage + 1} of {totalPages}
              </span>
              <div className="pager">
                <button
                  disabled={safePage === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  Prev
                </button>
                <button
                  disabled={safePage >= totalPages - 1}
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
