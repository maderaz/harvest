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

  return (
    <div style={{ position: "relative" }}>
      {/* Chart/Data toggle floated top-right, overlaying the chart header */}
      <div style={{
        position: "absolute",
        top: 12,
        right: 12,
        zIndex: 5,
        display: "flex",
        gap: 2,
        background: "var(--bg-2, #f4f4f2)",
        border: "1px solid var(--line, #ebebe7)",
        borderRadius: 6,
        padding: 2,
      }}>
        <button
          onClick={() => setView("chart")}
          style={{
            padding: "3px 10px",
            fontSize: 11,
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            fontFamily: "var(--mono)",
            background: view === "chart" ? "var(--panel, #fff)" : "transparent",
            color: view === "chart" ? "var(--ink, #0a0a0a)" : "var(--ink-3, #6b6b66)",
            boxShadow: view === "chart" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
          }}
        >
          Chart
        </button>
        <button
          onClick={() => { setView("data"); setPage(0); }}
          style={{
            padding: "3px 10px",
            fontSize: 11,
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            fontFamily: "var(--mono)",
            background: view === "data" ? "var(--panel, #fff)" : "transparent",
            color: view === "data" ? "var(--ink, #0a0a0a)" : "var(--ink-3, #6b6b66)",
            boxShadow: view === "data" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
          }}
        >
          Data
        </button>
      </div>

      {view === "chart" ? (
        <VaultChart title={title} data={data} format={format} color={color} />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-5" style={{ minHeight: 320 }}>
          <p style={{
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--ink-3)",
            marginBottom: 12,
          }}>
            {title}
          </p>
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
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 12,
              fontSize: 12,
            }}>
              <span className="mono dim">Page {safePage + 1} / {totalPages}</span>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  disabled={safePage === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  style={{
                    padding: "4px 10px",
                    border: "1px solid var(--line)",
                    borderRadius: 6,
                    background: "var(--panel)",
                    fontSize: 12,
                    cursor: safePage === 0 ? "default" : "pointer",
                    opacity: safePage === 0 ? 0.4 : 1,
                  }}
                >
                  ‹ Prev
                </button>
                <button
                  disabled={safePage >= totalPages - 1}
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  style={{
                    padding: "4px 10px",
                    border: "1px solid var(--line)",
                    borderRadius: 6,
                    background: "var(--panel)",
                    fontSize: 12,
                    cursor: safePage >= totalPages - 1 ? "default" : "pointer",
                    opacity: safePage >= totalPages - 1 ? 0.4 : 1,
                  }}
                >
                  Next ›
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
