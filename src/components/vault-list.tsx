"use client";

import { YieldVault } from "@/lib/types";
import { VaultTable } from "./vault-table";

export function VaultList({ vaults }: { vaults: YieldVault[] }) {
  return <VaultTable vaults={vaults} />;
}
