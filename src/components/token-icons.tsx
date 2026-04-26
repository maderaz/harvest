import Image from "next/image";

import usdcIcon from "@/assets/icons/USDC.png";
import usdtIcon from "@/assets/icons/USDT.png";
import ethIcon from "@/assets/icons/ETH.png";
import wbtcIcon from "@/assets/icons/WBTC.png";
import cbbtcIcon from "@/assets/icons/cbBTC.png";
import eurcIcon from "@/assets/icons/EURC.png";

import baseIcon from "@/assets/icons/base.png";
import arbitrumIcon from "@/assets/icons/arbitrum.png";
import mainnetIcon from "@/assets/icons/mainnet.png";
import bnbIcon from "@/assets/icons/bnb.png";
import avaxIcon from "@/assets/icons/avax.png";
import sonicIcon from "@/assets/icons/sonic.png";

const ASSET_ICONS: Record<string, typeof usdcIcon> = {
  USDC: usdcIcon,
  USDT: usdtIcon,
  ETH: ethIcon,
  WETH: ethIcon,
  WBTC: wbtcIcon,
  wBTC: wbtcIcon,
  cbBTC: cbbtcIcon,
  EURC: eurcIcon,
};

const CHAIN_ICONS: Record<string, typeof baseIcon> = {
  Base: baseIcon,
  Ethereum: mainnetIcon,
  Arbitrum: arbitrumIcon,
  Polygon: bnbIcon,
  zkSync: mainnetIcon,
  HyperEVM: mainnetIcon,
  BNB: bnbIcon,
  Avalanche: avaxIcon,
  Sonic: sonicIcon,
};

export function AssetIcon({ asset, size = 22 }: { asset: string; size?: number }) {
  const icon = ASSET_ICONS[asset];
  if (icon) {
    return (
      <Image
        src={icon}
        alt={asset}
        width={size}
        height={size}
        className="rounded-full"
        style={{ width: size, height: size }}
      />
    );
  }
  const color = "#999";
  return (
    <span
      className="asset-dot"
      style={{ background: color, width: size, height: size, fontSize: size * 0.5 }}
    >
      {asset[0] || "?"}
    </span>
  );
}

export function ChainIcon({ chain, size = 18 }: { chain: string; size?: number }) {
  const icon = CHAIN_ICONS[chain];
  if (icon) {
    return (
      <Image
        src={icon}
        alt={chain}
        width={size}
        height={size}
        className="rounded-full"
        style={{ width: size, height: size }}
      />
    );
  }
  return null;
}
