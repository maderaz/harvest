import { YieldVault } from "@/lib/types";
import { VaultList } from "./vault-list";
import { getSubAsset } from "@/lib/sub-asset";
import { formatAPY, formatTVL } from "@/lib/format";

interface Props {
  vaults: YieldVault[];
  sparklines?: Record<string, number[]>;
  subAssets: string[];
  assetLabel: string;
}

export function SubAssetSections({ vaults, sparklines, subAssets, assetLabel }: Props) {
  if (subAssets.length <= 1) {
    return (
      <>
        <div className="section-title-bar">
          <h2>Top {assetLabel} yields by APY</h2>
          <span className="mono dim">Ranked across the strategies we follow</span>
        </div>
        <VaultList vaults={vaults} sparklines={sparklines} />
      </>
    );
  }

  return (
    <>
      {subAssets.map((sub) => {
        const group = vaults.filter((v) => getSubAsset(v) === sub);
        if (group.length === 0) return null;
        const bestApy = group.reduce((b, v) => (v.apy24h > b ? v.apy24h : b), 0);
        const totalTvl = group.reduce((s, v) => s + v.tvl, 0);

        return (
          <section key={sub} id={sub.toLowerCase()} className="sub-asset-section">
            <div className="section-title-bar">
              <h2>{sub} Yield</h2>
              <span className="mono dim">
                {group.length} {group.length === 1 ? "strategy" : "strategies"} we track
                {bestApy > 0 ? ` · best ${formatAPY(bestApy)}` : ""}
                {totalTvl > 0 ? ` · ${formatTVL(totalTvl)} TVL` : ""}
              </span>
            </div>
            <VaultList vaults={group} sparklines={sparklines} />
          </section>
        );
      })}
    </>
  );
}
