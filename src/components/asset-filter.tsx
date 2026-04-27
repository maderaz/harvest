"use client";

import { Asset } from "@/lib/types";
import { ASSET_COLORS } from "@/lib/constants";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const ASSETS: Array<{ key: Asset | "All"; label: string }> = [
  { key: "All", label: "All" },
  { key: "USDC", label: "USDC" },
  { key: "USDT", label: "USDT" },
  { key: "ETH", label: "ETH" },
  { key: "BTC", label: "BTC" },
  { key: "EURC", label: "EURC" },
];

export function AssetFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("asset") || "All";

  const setFilter = useCallback(
    (asset: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (asset === "All") {
        params.delete("asset");
      } else {
        params.set("asset", asset);
      }
      const query = params.toString();
      router.push(query ? `/?${query}` : "/", { scroll: false });
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      {ASSETS.map(({ key, label }) => {
        const isActive = active === key;
        const colorDot =
          key !== "All" ? ASSET_COLORS[key as Asset] : undefined;
        return (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            {colorDot && (
              <span
                className={`inline-block h-2.5 w-2.5 rounded-full ${colorDot}`}
              />
            )}
            {label}
          </button>
        );
      })}
    </div>
  );
}
