import Link from "next/link";
import { YieldVault } from "@/lib/types";
import { formatAPY, formatTVL } from "@/lib/format";
import { AssetBadge } from "./asset-badge";

function VaultRow({ vault, index }: { vault: YieldVault; index: number }) {
  return (
    <tr className="border-b border-gray-100 transition-colors hover:bg-gray-50">
      <td className="px-4 py-4 text-sm text-gray-400">{index + 1}</td>
      <td className="px-4 py-4">
        <AssetBadge asset={vault.asset} />
      </td>
      <td className="px-4 py-4">
        <Link href={`/${vault.slug}`} className="group flex flex-col">
          <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
            {vault.productName}{" "}
            <span className="text-gray-400">&bull;</span>{" "}
            <span className="text-gray-500">{vault.protocol.name}</span>
          </span>
          <span className="text-xs text-gray-400">{vault.category}</span>
        </Link>
      </td>
      <td className="px-4 py-4 text-right">
        <span className="text-sm font-semibold text-green-600">
          {formatAPY(vault.apy24h)}
        </span>
      </td>
      <td className="px-4 py-4 text-right text-sm text-gray-700">
        {formatAPY(vault.apy30d)}
      </td>
      <td className="px-4 py-4 text-right text-sm text-gray-700">
        {formatTVL(vault.tvl)}
      </td>
    </tr>
  );
}

function VaultCard({ vault, index }: { vault: YieldVault; index: number }) {
  return (
    <Link
      href={`/${vault.slug}`}
      className="flex flex-col gap-3 border-b border-gray-100 px-4 py-4 transition-colors active:bg-gray-50"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 w-5">{index + 1}</span>
          <AssetBadge asset={vault.asset} />
        </div>
        <span className="text-sm font-semibold text-green-600">
          {formatAPY(vault.apy24h)}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {vault.productName}
          </p>
          <p className="text-xs text-gray-400 truncate">
            {vault.protocol.name} &bull; {vault.category}
          </p>
        </div>
        <div className="text-right shrink-0 ml-3">
          <p className="text-sm text-gray-700">{formatTVL(vault.tvl)}</p>
          <p className="text-xs text-gray-400">30D: {formatAPY(vault.apy30d)}</p>
        </div>
      </div>
    </Link>
  );
}

export function VaultTable({ vaults }: { vaults: YieldVault[] }) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              <th className="px-4 py-3 w-12">#</th>
              <th className="px-4 py-3">Asset</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3 text-right">24H APY %</th>
              <th className="px-4 py-3 text-right">30D APY</th>
              <th className="px-4 py-3 text-right">TVL</th>
            </tr>
          </thead>
          <tbody>
            {vaults.map((vault, i) => (
              <VaultRow key={vault.id} vault={vault} index={i} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="sm:hidden">
        {vaults.map((vault, i) => (
          <VaultCard key={vault.id} vault={vault} index={i} />
        ))}
      </div>
    </>
  );
}
