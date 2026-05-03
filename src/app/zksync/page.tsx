import type { Metadata } from "next";
import { getLiveVaults, getAllSparklines } from "@/lib/data";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { networkHubTitle, networkHubDescription } from "@/lib/seo";
import { NetworkHub } from "@/components/network-hub";

const NETWORK_SLUG = "zksync";
const NETWORK_DISPLAY = "zkSync";
const CHAIN = "zkSync";

export async function generateMetadata(): Promise<Metadata> {
  const vaults = await getLiveVaults();
  const count = vaults.filter((v) => v.chain === CHAIN).length;
  const title = networkHubTitle(NETWORK_DISPLAY);
  const description = networkHubDescription(NETWORK_DISPLAY, count);
  const url = `${SITE_URL}/${NETWORK_SLUG}`;
  return {
    title,
    description,
    openGraph: { title, description, url, siteName: SITE_NAME, type: "website" },
    alternates: { canonical: url },
  };
}

export default async function zkSyncNetworkPage() {
  const allVaults = await getLiveVaults();
  const sparklines = await getAllSparklines();
  const vaults = allVaults.filter((v) => v.chain === CHAIN);
  return (
    <NetworkHub
      networkSlug={NETWORK_SLUG}
      networkDisplay={NETWORK_DISPLAY}
      vaults={vaults}
      sparklines={sparklines}
      allVaults={allVaults}
    />
  );
}
