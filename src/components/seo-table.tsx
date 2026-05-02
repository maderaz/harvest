"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface VaultSeoRow {
  slug: string;
  title: string;
  description: string;
  chain: string;
  apy: string;
  tvl: string;
  indexed: boolean;
}

type SortKey = "slug" | "title" | "description" | "chain" | "apy" | "tvl" | "indexed";
type SortDir = "asc" | "desc";

function CharCount({ count, limit }: { count: number; limit: number }) {
  const over = count > limit;
  return (
    <span
      className={`ml-1 text-xs tabular-nums ${over ? "font-semibold text-red-600" : "text-gray-400"}`}
    >
      ({count})
    </span>
  );
}

function SortHeader({
  label,
  sortKey,
  currentKey,
  currentDir,
  onClick,
  className,
}: {
  label: string;
  sortKey: SortKey;
  currentKey: SortKey;
  currentDir: SortDir;
  onClick: (key: SortKey) => void;
  className?: string;
}) {
  const active = currentKey === sortKey;
  return (
    <th
      className={`cursor-pointer select-none px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-900 ${className ?? ""}`}
      onClick={() => onClick(sortKey)}
    >
      {label}
      {active && (
        <span className="ml-1">{currentDir === "asc" ? "\u2191" : "\u2193"}</span>
      )}
    </th>
  );
}

export function SeoTable({
  rows,
  vaultCount,
  lastUpdated,
}: {
  rows: VaultSeoRow[];
  vaultCount: number;
  lastUpdated: string;
}) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("slug");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter(
      (r) =>
        r.slug.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.chain.toLowerCase().includes(q),
    );
  }, [rows, search]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      if (sortKey === "indexed") {
        const an = a.indexed ? 1 : 0;
        const bn = b.indexed ? 1 : 0;
        return sortDir === "asc" ? an - bn : bn - an;
      }
      let av = a[sortKey] as string;
      let bv = b[sortKey] as string;
      // For apy and tvl, sort numerically by stripping non-numeric chars
      if (sortKey === "apy" || sortKey === "tvl") {
        const an = parseFloat(av.replace(/[^0-9.\-]/g, "")) || 0;
        const bn = parseFloat(bv.replace(/[^0-9.\-]/g, "")) || 0;
        return sortDir === "asc" ? an - bn : bn - an;
      }
      av = av.toLowerCase();
      bv = bv.toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [filtered, sortKey, sortDir]);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">SEO Admin Panel</h1>
        <p className="mt-1 text-sm text-gray-500">
          {vaultCount} vaults &middot; Last updated: {lastUpdated}
        </p>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Filter by slug, title, or chain..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
        />
      </div>

      {/* Results count */}
      <p className="mb-2 text-xs text-gray-400">
        Showing {sorted.length} of {rows.length} vaults
      </p>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                #
              </th>
              <SortHeader
                label="Slug"
                sortKey="slug"
                currentKey={sortKey}
                currentDir={sortDir}
                onClick={handleSort}
              />
              <SortHeader
                label="Meta Title"
                sortKey="title"
                currentKey={sortKey}
                currentDir={sortDir}
                onClick={handleSort}
              />
              <SortHeader
                label="Meta Description"
                sortKey="description"
                currentKey={sortKey}
                currentDir={sortDir}
                onClick={handleSort}
                className="hidden lg:table-cell"
              />
              <SortHeader
                label="Chain"
                sortKey="chain"
                currentKey={sortKey}
                currentDir={sortDir}
                onClick={handleSort}
                className="hidden md:table-cell"
              />
              <SortHeader
                label="APY"
                sortKey="apy"
                currentKey={sortKey}
                currentDir={sortDir}
                onClick={handleSort}
                className="hidden md:table-cell"
              />
              <SortHeader
                label="TVL"
                sortKey="tvl"
                currentKey={sortKey}
                currentDir={sortDir}
                onClick={handleSort}
                className="hidden md:table-cell"
              />
              <SortHeader
                label="Index"
                sortKey="indexed"
                currentKey={sortKey}
                currentDir={sortDir}
                onClick={handleSort}
              />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.map((row, i) => {
              const titleLen = row.title.length;
              const descLen = row.description.length;
              const truncatedDesc =
                row.description.length > 160
                  ? row.description.slice(0, 160) + "..."
                  : row.description;
              return (
                <tr key={row.slug} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-3 py-2 text-gray-400">
                    {i + 1}
                  </td>
                  <td className="px-3 py-2">
                    <Link
                      href={`/${row.slug}`}
                      className="text-blue-600 hover:underline break-all"
                    >
                      {row.slug}
                    </Link>
                  </td>
                  <td className="px-3 py-2">
                    <span className="break-words">
                      <span className="hidden sm:inline">{row.title}</span>
                      <span className="sm:hidden">
                        {row.title.length > 40
                          ? row.title.slice(0, 40) + "..."
                          : row.title}
                      </span>
                    </span>
                    <CharCount count={titleLen} limit={60} />
                  </td>
                  <td className="hidden px-3 py-2 lg:table-cell">
                    <span className="break-words text-gray-600">
                      {truncatedDesc}
                    </span>
                    <CharCount count={descLen} limit={160} />
                  </td>
                  <td className="hidden whitespace-nowrap px-3 py-2 md:table-cell">
                    {row.chain}
                  </td>
                  <td className="hidden whitespace-nowrap px-3 py-2 text-green-600 md:table-cell">
                    {row.apy}
                  </td>
                  <td className="hidden whitespace-nowrap px-3 py-2 md:table-cell">
                    {row.tvl}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        row.indexed
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {row.indexed ? "index" : "noindex"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
