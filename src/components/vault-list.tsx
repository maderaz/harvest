"use client";

import { YieldVault } from "@/lib/types";
import { VaultTable } from "./vault-table";

export function VaultList({
  vaults,
  sparklines,
}: {
  vaults: YieldVault[];
  sparklines?: Record<string, number[]>;
}) {
  return <VaultTable vaults={vaults} sparklines={sparklines} />;
}
