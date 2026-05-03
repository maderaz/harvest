import { SITE_URL } from "./constants";

export const RISK_FRAMEWORK_VERSION = {
  version: "1.0",
  date: "2026-05-03",
};

export interface RiskFrameworkChange {
  version: string;
  date: string;
  summary: string;
}

export const RISK_FRAMEWORK_CHANGELOG: RiskFrameworkChange[] = [
  {
    version: "1.0",
    date: "2026-05-03",
    summary: "Initial risk framework published. Covers smart contract, oracle, liquidity, depeg, governance, bridge, operator, and economic risk. Educational framework only; no per-strategy ratings.",
  },
];

export const RISK_FRAMEWORK_URL = `${SITE_URL}/risk-framework`;
