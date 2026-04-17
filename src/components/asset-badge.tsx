import { Asset } from "@/lib/types";
import { ASSET_COLORS } from "@/lib/constants";
import { UsdcIcon } from "./icons/usdc-icon";

const ASSET_ICONS: Record<Asset, string> = {
  USDC: "",
  USDT: "₮",
  ETH: "Ξ",
  WBTC: "₿",
  cbBTC: "₿",
  EURC: "€",
};

function AssetIcon({ asset }: { asset: Asset }) {
  if (asset === "USDC") return <UsdcIcon size={24} />;

  return (
    <span
      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${ASSET_COLORS[asset]}`}
    >
      {ASSET_ICONS[asset]}
    </span>
  );
}

export function AssetBadge({ asset, iconOnly }: { asset: Asset; iconOnly?: boolean }) {
  if (iconOnly) return <AssetIcon asset={asset} />;

  return (
    <span className="inline-flex items-center gap-1.5">
      <AssetIcon asset={asset} />
      <span className="text-sm font-medium text-gray-700">{asset}</span>
    </span>
  );
}
