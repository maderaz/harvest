"use client";

import { useState, useMemo } from "react";
import type { FullVaultHistory } from "@/lib/history-api";

interface VaultHistoryTableProps {
  history: FullVaultHistory;
}

type TabMode = "apy" | "tvl";

const ROWS_PER_PAGE = 7;

function formatDate(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatPercent(value: number): string {
  if (value === 0) return "—";
  return `${value.toFixed(2)}%`;
}

function formatDollar(value: number): string {
  if (value === 0) return "—";
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

function computeSummary(values: number[]) {
  if (values.length === 0) return null;
  const sum = values.reduce((s, v) => s + v, 0);
  const avg = sum / values.length;
  const sorted = [...values].sort((a, b) => a - b);
  const high = sorted[sorted.length - 1];
  const low = sorted[0];
  return { avg, high, low, count: values.length };
}

export function VaultHistoryTable({ history }: VaultHistoryTableProps) {
  const [tab, setTab] = useState<TabMode>("apy");
  const [page, setPage] = useState(0);

  // Each series shows its own full history; the chart uses the same
  // unfiltered data, so the table now matches what's plotted above.
  const apyData = useMemo(
    () =>
      [...history.apyHistory]
        .filter((p) => p.apy >= 0)
        .sort((a, b) => b.timestamp - a.timestamp),
    [history.apyHistory],
  );
  const tvlData = useMemo(
    () =>
      [...history.tvlHistory]
        .filter((p) => p.value > 0)
        .sort((a, b) => b.timestamp - a.timestamp),
    [history.tvlHistory],
  );

  const currentData = tab === "apy" ? apyData : tvlData;
  const totalPages = Math.max(1, Math.ceil(currentData.length / ROWS_PER_PAGE));
  const safePage = Math.min(page, totalPages - 1);
  const pageItems = currentData.slice(
    safePage * ROWS_PER_PAGE,
    (safePage + 1) * ROWS_PER_PAGE,
  );

  const summary =
    tab === "apy"
      ? computeSummary(apyData.map((p) => p.apy))
      : computeSummary(tvlData.map((p) => p.value));

  const formatFn = tab === "apy" ? formatPercent : formatDollar;

  if (apyData.length === 0 && tvlData.length === 0) return null;

  return (
    <div className="pp-section" id="history">
      <h2>Historical Data</h2>
      <div
        style={{
          border: "1px solid var(--line)",
          borderRadius: "var(--radius)",
          overflow: "hidden",
          background: "var(--panel)",
        }}
      >
        {/* Tabs */}
        <div className="chart-data-tabs" style={{ margin: "12px 14px" }}>
          <button
            className={tab === "apy" ? "active" : ""}
            onClick={() => { setTab("apy"); setPage(0); }}
          >
            APY
          </button>
          <button
            className={tab === "tvl" ? "active" : ""}
            onClick={() => { setTab("tvl"); setPage(0); }}
          >
            TVL
          </button>
        </div>

        {/* Summary */}
        {summary && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "16px",
              padding: "8px 14px 10px",
              borderBottom: "1px solid var(--line)",
              background: "var(--bg-2)",
              fontSize: "12px",
              color: "var(--ink-3)",
            }}
          >
            <span>Lifetime Avg: <strong style={{ color: "var(--ink)" }}>{formatFn(summary.avg)}</strong></span>
            <span>High: <strong style={{ color: "var(--ink)" }}>{formatFn(summary.high)}</strong></span>
            <span>Low: <strong style={{ color: "var(--ink)" }}>{formatFn(summary.low)}</strong></span>
            <span>{summary.count} data points</span>
          </div>
        )}

        {/* Table */}
        {pageItems.length > 0 ? (
          <table className="chart-datatable">
            <thead>
              <tr>
                <th>Date</th>
                <th className="r">{tab === "apy" ? "APY" : "TVL"}</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((item, i) => {
                const ts = item.timestamp;
                const value =
                  tab === "apy"
                    ? (item as (typeof apyData)[0]).apy
                    : (item as (typeof tvlData)[0]).value;
                return (
                  <tr key={ts}>
                    <td>{formatDate(ts)}</td>
                    <td className="r">{formatFn(value)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: "32px 14px", textAlign: "center", color: "var(--ink-4)", fontSize: 13 }}>
            No {tab.toUpperCase()} history available for this vault.
          </div>
        )}

        {/* Pagination */}
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
    </div>
  );
}
