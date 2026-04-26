import { Asset } from "@/lib/types";
import { AssetIcon } from "./token-icons";

export function AssetBadge({ asset, iconOnly }: { asset: Asset; iconOnly?: boolean }) {
  if (iconOnly) return <AssetIcon asset={asset} size={24} />;

  return (
    <span className="inline-flex items-center gap-1.5">
      <AssetIcon asset={asset} size={24} />
      <span className="text-sm font-medium" style={{ color: "var(--ink)" }}>{asset}</span>
    </span>
  );
}
