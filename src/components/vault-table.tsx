"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { YieldVault } from "@/lib/types";
import { formatAPY, formatTVL } from "@/lib/format";
import { AssetBadge } from "./asset-badge";

type SortKey = "apy24h" | "apy30d" | "tvl";
type SortDir = "asc" | "desc";

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span className={`inline-block ml-0.5 ${active ? "text-gray-900" : "text-gray-300"}`}>
      {active && dir === "asc" ? "▲" : "▼"}
    </span>
  );
}

export function VaultTable({ vaults }: { vaults: YieldVault[] }) {
  const router = useRouter();
  const [sortKey, setSortKey] = useState<SortKey>("apy24h");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sorted = useMemo(() => {
    const copy = [...vaults];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      return sortDir === "desc" ? bv - av : av - bv;
    });
    return copy;
  }, [vaults, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const thBase = "py-3 select-none cursor-pointer hover:text-gray-700 transition-colors";

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            <th className="px-2 py-3 w-8 sm:px-4 sm:w-12">#</th>
            <th className="hidden sm:table-cell px-4 py-3">Asset</th>
            <th className="px-2 py-3 sm:px-4">Product</th>
            <th
              className={`px-2 sm:px-4 text-right ${thBase}`}
              onClick={() => toggleSort("apy24h")}
            >
              24H APY <SortIcon active={sortKey === "apy24h"} dir={sortDir} />
            </th>
            <th
              className={`hidden sm:table-cell px-4 text-right ${thBase}`}
              onClick={() => toggleSort("apy30d")}
            >
              30D APY <SortIcon active={sortKey === "apy30d"} dir={sortDir} />
            </th>
            <th
              className={`px-2 sm:px-4 text-right ${thBase}`}
              onClick={() => toggleSort("tvl")}
            >
              TVL <SortIcon active={sortKey === "tvl"} dir={sortDir} />
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((vault, index) => (
            <tr
              key={vault.id}
              onClick={() => router.push(`/${vault.slug}`)}
              className="border-b border-gray-100 transition-colors hover:bg-gray-50 cursor-pointer"
            >
              <td className="px-2 py-3 text-xs text-gray-400 sm:px-4 sm:py-4 sm:text-sm">
                {index + 1}
              </td>
              <td className="hidden sm:table-cell px-4 py-4">
                <AssetBadge asset={vault.asset} />
              </td>
              <td className="px-2 py-3 sm:px-4 sm:py-4 max-w-[160px] sm:max-w-none">
                <Link
                  href={`/${vault.slug}`}
                  className="group flex items-center gap-2"
                >
                  <span className="shrink-0 sm:hidden">
                    <AssetBadge asset={vault.asset} iconOnly />
                  </span>
                  <span className="flex flex-col min-w-0">
                    <span className="text-xs font-medium text-gray-900 group-hover:text-blue-600 truncate sm:text-sm">
                      {vault.productName}
                      <span className="hidden sm:inline">
                        {" "}<span className="text-gray-400">&bull;</span>{" "}
                        <span className="text-gray-500">{vault.protocol.name}</span>
                      </span>
                    </span>
                    <span className="text-[10px] text-gray-400 truncate sm:text-xs">
                      {vault.category}
                    </span>
                  </span>
                </Link>
              </td>
              <td className="px-2 py-3 sm:px-4 sm:py-4 text-right">
                <span className="text-xs font-semibold text-green-600 sm:text-sm">
                  {formatAPY(vault.apy24h)}
                </span>
              </td>
              <td className="hidden sm:table-cell px-4 py-4 text-right text-sm text-gray-700">
                {formatAPY(vault.apy30d)}
              </td>
              <td className="px-2 py-3 sm:px-4 sm:py-4 text-right text-xs text-gray-700 sm:text-sm">
                {formatTVL(vault.tvl)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
