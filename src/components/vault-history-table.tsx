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
  if (value === 0) return "\u2014";
  return `${value.toFixed(2)}%`;
}

function formatDollar(value: number): string {
  if (value === 0) return "\u2014";
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

function compute30dSummary(values: number[]) {
  if (values.length === 0) return null;
  const sum = values.reduce((s, v) => s + v, 0);
  const avg = sum / values.length;
  const sorted = [...values].sort((a, b) => a - b);
  const high = sorted[sorted.length - 1];
  const low = sorted[0];
  return { avg, high, low };
}

export function VaultHistoryTable({ history }: VaultHistoryTableProps) {
  const [tab, setTab] = useState<TabMode>("apy");
  const [page, setPage] = useState(0);

  const apyData = useMemo(() => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const thirtyDaysAgo = nowSeconds - 30 * 24 * 60 * 60;
    return [...history.apyHistory]
      .filter((p) => p.timestamp >= thirtyDaysAgo && p.apy >= 0)
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [history.apyHistory]);

  const tvlData = useMemo(() => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const thirtyDaysAgo = nowSeconds - 30 * 24 * 60 * 60;
    return [...history.tvlHistory]
      .filter((p) => p.timestamp >= thirtyDaysAgo && p.value > 0)
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [history.tvlHistory]);

  const currentData = tab === "apy" ? apyData : tvlData;
  const totalPages = Math.max(1, Math.ceil(currentData.length / ROWS_PER_PAGE));
  const safePage = Math.min(page, totalPages - 1);
  const pageItems = currentData.slice(
    safePage * ROWS_PER_PAGE,
    (safePage + 1) * ROWS_PER_PAGE,
  );

  const summary =
    tab === "apy"
      ? compute30dSummary(apyData.map((p) => p.apy))
      : compute30dSummary(tvlData.map((p) => p.value));

  const formatFn = tab === "apy" ? formatPercent : formatDollar;

  if (apyData.length === 0 && tvlData.length === 0) return null;

  return (
    <section className="mb-10">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Historical Data
      </h2>
      <div className="rounded-lg border border-gray-200 bg-white">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => {
              setTab("apy");
              setPage(0);
            }}
            className={`px-4 py-2.5 text-[13px] font-medium transition-colors ${
              tab === "apy"
                ? "border-b-2 border-gray-900 text-gray-900"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            APY
          </button>
          <button
            onClick={() => {
              setTab("tvl");
              setPage(0);
            }}
            className={`px-4 py-2.5 text-[13px] font-medium transition-colors ${
              tab === "tvl"
                ? "border-b-2 border-gray-900 text-gray-900"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            TVL
          </button>
        </div>

        {/* 30-Day Summary Banner */}
        {summary && (
          <div className="flex flex-wrap gap-x-6 gap-y-1 border-b border-gray-100 bg-gray-50 px-4 py-2.5">
            <span className="text-[12px] text-gray-500">
              30D Avg:{" "}
              <span className="font-medium text-gray-700">
                {formatFn(summary.avg)}
              </span>
            </span>
            <span className="text-[12px] text-gray-500">
              High:{" "}
              <span className="font-medium text-gray-700">
                {formatFn(summary.high)}
              </span>
            </span>
            <span className="text-[12px] text-gray-500">
              Low:{" "}
              <span className="font-medium text-gray-700">
                {formatFn(summary.low)}
              </span>
            </span>
          </div>
        )}

        {/* Table */}
        {pageItems.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-2 text-left text-[12px] font-medium text-gray-400">
                  Date
                </th>
                <th className="px-4 py-2 text-right text-[12px] font-medium text-gray-400">
                  {tab === "apy" ? "APY" : "TVL"}
                </th>
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
                  <tr
                    key={ts}
                    className={
                      i < pageItems.length - 1
                        ? "border-b border-gray-50"
                        : ""
                    }
                  >
                    <td className="px-4 py-2 text-[13px] text-gray-600">
                      {formatDate(ts)}
                    </td>
                    <td className="px-4 py-2 text-right text-[13px] font-medium text-gray-900">
                      {formatFn(value)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="px-4 py-8 text-center text-[13px] text-gray-400">
            No data available for the past 30 days.
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-2.5">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
              className="text-[13px] font-medium text-gray-600 disabled:text-gray-300"
            >
              Prev
            </button>
            <span className="text-[12px] text-gray-400">
              Page {safePage + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={safePage >= totalPages - 1}
              className="text-[13px] font-medium text-gray-600 disabled:text-gray-300"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
