"use client";

/* eslint-disable @next/next/no-img-element */
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { YieldVault } from "@/lib/types";
import { formatAPY, formatTVL } from "@/lib/format";

import usdcIcon from "@/assets/icons/USDC.png";
import usdtIcon from "@/assets/icons/USDT.png";
import ethIcon from "@/assets/icons/ETH.png";
import wbtcIcon from "@/assets/icons/WBTC.png";
import cbbtcIcon from "@/assets/icons/cbBTC.png";
import eurcIcon from "@/assets/icons/EURC.png";

const ASSET_ICONS: Record<string, { src: string }> = {
  USDC: usdcIcon, USDT: usdtIcon, ETH: ethIcon, WETH: ethIcon,
  WBTC: wbtcIcon, wBTC: wbtcIcon, cbBTC: cbbtcIcon, EURC: eurcIcon,
};

function AssetDot({ asset, size = 22 }: { asset: string; size?: number }) {
  const icon = ASSET_ICONS[asset];
  if (icon) {
    return <img src={icon.src} alt={asset} width={size} height={size} style={{ width: size, height: size, borderRadius: "50%" }} />;
  }
  return (
    <span className="asset-dot" style={{ background: "#999", width: size, height: size, fontSize: size * 0.5 }}>
      {asset[0] || "?"}
    </span>
  );
}

/* ——— Spark chart ——— */

function seedSpark(seed: number, up: boolean): number[] {
  const out: number[] = [];
  let v = 50;
  for (let i = 0; i < 24; i++) {
    const n = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453;
    const r = n - Math.floor(n);
    v += (r - 0.5) * 8 + (up ? 0.4 : -0.4);
    out.push(v);
  }
  return out;
}

function Spark({
  points,
  up = true,
  w = 68,
  h = 22,
}: {
  points: number[];
  up?: boolean;
  w?: number;
  h?: number;
}) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - ((p - min) / range) * (h - 2) - 1;
    return [x, y] as [number, number];
  });
  const d = coords
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");
  const last = coords[coords.length - 1];
  const color = up ? "var(--up)" : "var(--down)";
  return (
    <svg width={w} height={h} className="spark">
      <path d={`${d} L${w},${h} L0,${h} Z`} fill={color} opacity="0.08" />
      <path d={d} fill="none" stroke={color} strokeWidth="1.25" />
      <circle cx={last[0]} cy={last[1]} r="1.8" fill={color} />
    </svg>
  );
}

/* ——— Sort types ——— */

type SortKey = "apy24h" | "apy30d" | "tvl" | "productName" | "chain";
type SortDir = "asc" | "desc";

/* ——— FilterBar ——— */

function FilterBar({
  assetFilter,
  setAssetFilter,
  chainFilter,
  setChainFilter,
  query,
  setQuery,
  assets,
  chains,
}: {
  assetFilter: string;
  setAssetFilter: (v: string) => void;
  chainFilter: string;
  setChainFilter: (v: string) => void;
  query: string;
  setQuery: (v: string) => void;
  assets: string[];
  chains: string[];
}) {
  return (
    <div className="filterbar">
      <div className="fb-left">
        <select
          className="pill"
          value={assetFilter}
          onChange={(e) => setAssetFilter(e.target.value)}
        >
          <option value="All">All assets</option>
          {assets.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <select
          className="pill"
          value={chainFilter}
          onChange={(e) => setChainFilter(e.target.value)}
        >
          <option value="All">All chains</option>
          {chains.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="fb-right">
        <label className="search-box small">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            placeholder="Filter pools..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
    </div>
  );
}

/* ——— VaultTable ——— */

export function VaultTable({ vaults }: { vaults: YieldVault[] }) {
  const router = useRouter();
  const [sortKey, setSortKey] = useState<SortKey>("apy24h");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [assetFilter, setAssetFilter] = useState("All");
  const [chainFilter, setChainFilter] = useState("All");
  const [query, setQuery] = useState("");

  const assets = useMemo(() => {
    const set = new Set(vaults.map((v) => v.asset));
    return Array.from(set).sort();
  }, [vaults]);

  const chains = useMemo(() => {
    const set = new Set(vaults.map((v) => v.chain));
    return Array.from(set).sort();
  }, [vaults]);

  const filtered = useMemo(() => {
    return vaults.filter((v) => {
      if (assetFilter !== "All" && v.asset !== assetFilter) return false;
      if (chainFilter !== "All" && v.chain !== chainFilter) return false;
      if (
        query &&
        !(v.productName + v.asset + v.category)
          .toLowerCase()
          .includes(query.toLowerCase())
      )
        return false;
      return true;
    });
  }, [vaults, assetFilter, chainFilter, query]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      let va: string | number;
      let vb: string | number;
      if (sortKey === "productName") {
        va = a.productName;
        vb = b.productName;
      } else if (sortKey === "chain") {
        va = a.chain;
        vb = b.chain;
      } else {
        va = a[sortKey];
        vb = b[sortKey];
      }
      if (typeof va === "string" && typeof vb === "string") {
        return sortDir === "asc"
          ? va.localeCompare(vb)
          : vb.localeCompare(va);
      }
      return sortDir === "desc"
        ? (vb as number) - (va as number)
        : (va as number) - (vb as number);
    });
    return copy;
  }, [filtered, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function Head({
    k,
    children,
    align = "right",
  }: {
    k: SortKey;
    children: React.ReactNode;
    align?: string;
  }) {
    return (
      <th
        className={`${align}${sortKey === k ? " sorted" : ""}`}
        onClick={() => toggleSort(k)}
      >
        {children}
        {sortKey === k && (
          <span className="caret">{sortDir === "desc" ? "▾" : "▴"}</span>
        )}
      </th>
    );
  }

  // Compute reward from apyBreakdown
  function getReward(vault: YieldVault): number {
    if (!vault.apyBreakdown || vault.apyBreakdown.length <= 1) return 0;
    // Sum all non-first sources (first is typically the base rate)
    return vault.apyBreakdown
      .slice(1)
      .reduce((sum, b) => sum + b.apy, 0);
  }

  return (
    <>
      <FilterBar
        assetFilter={assetFilter}
        setAssetFilter={setAssetFilter}
        chainFilter={chainFilter}
        setChainFilter={setChainFilter}
        query={query}
        setQuery={setQuery}
        assets={assets}
        chains={chains}
      />
      <div className="table-wrap">
        <table className="ranking">
          <thead>
            <tr>
              <th className="left">#</th>
              <Head k="productName" align="left">
                Protocol / Pool
              </Head>
              <Head k="chain" align="left">
                Chain
              </Head>
              <Head k="apy24h">APY</Head>
              <th className="right td-hide-mobile">Reward</th>
              <th className="right td-hide-mobile">7d avg</th>
              <Head k="apy30d">30d avg</Head>
              <Head k="tvl">TVL</Head>
              <th className="center td-hide-mobile">30d</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((vault, index) => {
              const up = vault.apy24h >= vault.apy30d;
              const reward = getReward(vault);
              return (
                <tr
                  key={vault.id}
                  className="row"
                  style={{ cursor: "pointer" }}
                  onClick={() => router.push(`/${vault.slug}`)}
                >
                  <td className="td rank mono">{index + 1}</td>
                  <td className="td">
                    <div className="proto">
                      <AssetDot asset={vault.asset} size={22} />
                      <div>
                        <div className="proto-name">{vault.productName}</div>
                        <div className="proto-sub mono">
                          {vault.asset} &middot; {vault.category}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="td">
                    <span className="chip">{vault.chain}</span>
                  </td>
                  <td className="td right mono big">
                    <span className={`apy${vault.apy24h >= 10 ? " hot" : ""}`}>
                      {formatAPY(vault.apy24h)}
                    </span>
                  </td>
                  <td className="td right mono td-hide-mobile">
                    {reward > 0 ? `+${reward.toFixed(1)}%` : "—"}
                  </td>
                  <td className="td right mono dim td-hide-mobile">
                    {formatAPY(vault.apy24h)}
                  </td>
                  <td className="td right mono dim">
                    {formatAPY(vault.apy30d)}
                  </td>
                  <td className="td right mono">{formatTVL(vault.tvl)}</td>
                  <td className="td center td-hide-mobile">
                    <Spark
                      points={seedSpark(index + 1, up)}
                      up={up}
                    />
                  </td>
                  <td className="td right">
                    <button
                      className="row-cta"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/${vault.slug}`);
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="table-foot">
          <span className="mono dim">
            Showing {sorted.length} of {vaults.length} vaults
          </span>
        </div>
      </div>
    </>
  );
}
