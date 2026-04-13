"use client";

import { useSearchParams } from "next/navigation";
import { YieldVault } from "@/lib/types";
import { VaultTable } from "./vault-table";
import { AssetFilter } from "./asset-filter";

export function VaultList({ vaults }: { vaults: YieldVault[] }) {
  const searchParams = useSearchParams();
  const asset = searchParams.get("asset");
  const filtered = asset ? vaults.filter((v) => v.asset === asset) : vaults;

  return (
    <>
      <div className="mb-6">
        <AssetFilter />
      </div>
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <VaultTable vaults={filtered} />
      </div>
    </>
  );
}
