"use client";

import { useMemo, useState } from "react";
import { ChainIcon } from "./token-icons";
import { formatAPY, formatTVL } from "@/lib/format";
import { SITE_URL } from "@/lib/constants";

export interface AdminRow {
  slug: string;
  productName: string;
  chain: string;
  asset: string;
  apy24h: number;
  tvl: number;
  indexed: boolean;
  groupKey: string;
  groupSize: number;
}

type Filter = "all" | "indexed" | "noindex";

interface Props {
  rows: AdminRow[];
}

export function AdminProductsTable({ rows }: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter === "indexed" && !r.indexed) return false;
      if (filter === "noindex" && r.indexed) return false;
      if (q) {
        const hay = `${r.productName} ${r.slug} ${r.chain} ${r.asset}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, filter, search]);

  const counts = useMemo(() => ({
    all: rows.length,
    indexed: rows.filter((r) => r.indexed).length,
    noindex: rows.filter((r) => !r.indexed).length,
  }), [rows]);

  return (
    <div className="adm-wrap">
      <div className="adm-toolbar">
        <select
          className="adm-select"
          value={filter}
          onChange={(e) => setFilter(e.target.value as Filter)}
        >
          <option value="all">All ({counts.all})</option>
          <option value="indexed">Indexed ({counts.indexed})</option>
          <option value="noindex">Noindex ({counts.noindex})</option>
        </select>
        <input
          className="adm-input"
          placeholder="Search name, slug, chain, asset..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="adm-count">{filtered.length} shown</span>
      </div>

      <table className="adm-table">
        <thead>
          <tr>
            <th>Product name</th>
            <th>Network</th>
            <th>Asset</th>
            <th>24H APY</th>
            <th>TVL</th>
            <th>Index</th>
            <th>URL</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((r) => (
            <tr key={r.slug} className={!r.indexed ? "adm-row-no" : ""}>
              <td>
                <div className="adm-name">{r.productName}</div>
                {r.groupSize > 1 && (
                  <div className="adm-group">duplicate group: {r.groupKey} ({r.groupSize})</div>
                )}
              </td>
              <td>
                <span className="adm-chain">
                  <ChainIcon chain={r.chain} size={16} />
                  <span>{r.chain}</span>
                </span>
              </td>
              <td>{r.asset}</td>
              <td className="mono">{formatAPY(r.apy24h)}</td>
              <td className="mono">{formatTVL(r.tvl)}</td>
              <td>
                <span className={`adm-badge ${r.indexed ? "ok" : "no"}`}>
                  {r.indexed ? "index" : "noindex"}
                </span>
              </td>
              <td className="mono adm-url">
                <a href={`/${r.slug}`} target="_blank" rel="noopener noreferrer">
                  {SITE_URL.replace(/^https?:\/\//, "")}/{r.slug}
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
