import { Asset } from "@/lib/types";
import { ASSET_COLORS } from "@/lib/constants";

const ASSET_ICONS: Record<Asset, string> = {
  USDC: "$",
  USDT: "₮",
  ETH: "Ξ",
  WBTC: "₿",
  cbBTC: "₿",
  EURC: "€",
};

export function AssetBadge({ asset }: { asset: Asset }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${ASSET_COLORS[asset]}`}
      >
        {ASSET_ICONS[asset]}
      </span>
      <span className="text-sm font-medium text-gray-700">{asset}</span>
    </span>
  );
}
