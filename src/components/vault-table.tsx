import Link from "next/link";
import { YieldVault } from "@/lib/types";
import { formatAPY, formatTVL } from "@/lib/format";
import { AssetBadge } from "./asset-badge";

export function VaultTable({ vaults }: { vaults: YieldVault[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            <th className="px-2 py-3 w-8 sm:px-4 sm:w-12">#</th>
            <th className="hidden sm:table-cell px-4 py-3">Asset</th>
            <th className="px-2 py-3 sm:px-4">Product</th>
            <th className="px-2 py-3 sm:px-4 text-right">24H APY</th>
            <th className="hidden sm:table-cell px-4 py-3 text-right">30D APY</th>
            <th className="px-2 py-3 sm:px-4 text-right">TVL</th>
          </tr>
        </thead>
        <tbody>
          {vaults.map((vault, index) => (
            <tr
              key={vault.id}
              className="border-b border-gray-100 transition-colors hover:bg-gray-50"
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
