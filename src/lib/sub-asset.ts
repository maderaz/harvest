import { YieldVault } from "./types";

const UMBRELLA_ASSETS = new Set(["BTC", "ETH"]);

const FAMILY_NAMES: Record<string, string> = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
};

export function getSubAsset(vault: YieldVault): string {
  if (!UMBRELLA_ASSETS.has(vault.asset)) return vault.asset;
  return vault.productName.split(" ")[0];
}

export function getSubAssetFamilyName(asset: string): string {
  return FAMILY_NAMES[asset] ?? asset;
}

export function isUmbrellaAsset(asset: string): boolean {
  return UMBRELLA_ASSETS.has(asset);
}

export function assetHubPath(asset: string): string {
  return `/${asset.toLowerCase()}`;
}
