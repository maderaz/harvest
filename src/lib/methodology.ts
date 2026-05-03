import { SITE_URL } from "./constants";

export const METHODOLOGY_VERSION = {
  version: "1.0",
  date: "2026-05-03",
};

export interface MethodologyChange {
  version: string;
  date: string;
  summary: string;
}

export const METHODOLOGY_CHANGELOG: MethodologyChange[] = [
  {
    version: "1.0",
    date: "2026-05-03",
    summary: "Initial methodology published. Covers APY calculation, TVL, ranking, consistency scoring, inclusion criteria, data sources, limitations, and disclosure.",
  },
];

export const METHODOLOGY_URL = `${SITE_URL}/methodology`;
