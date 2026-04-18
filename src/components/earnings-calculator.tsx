"use client";

import { useState } from "react";

interface EarningsCalculatorProps {
  apy: number;
  asset: string;
}

const PERIODS = [
  { label: "1 Month", months: 1 },
  { label: "6 Months", months: 6 },
  { label: "1 Year", months: 12 },
  { label: "2 Years", months: 24 },
] as const;

function formatDollar(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${value.toFixed(2)}`;
}

export function EarningsCalculator({ apy, asset }: EarningsCalculatorProps) {
  const [principal, setPrincipal] = useState("1000");
  const [selectedPeriod, setSelectedPeriod] = useState(12);

  const principalNum = parseFloat(principal) || 0;
  const rate = apy / 100;
  const years = selectedPeriod / 12;

  // Compound interest: P * (1 + r)^t - P
  const totalValue = principalNum * Math.pow(1 + rate, years);
  const earnings = totalValue - principalNum;

  return (
    <section className="mb-10">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Earnings Calculator
      </h2>
      <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
        {/* Principal input */}
        <div className="mb-4">
          <label
            htmlFor="principal"
            className="mb-1 block text-[13px] text-gray-500"
          >
            Deposit Amount ({asset})
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
              $
            </span>
            <input
              id="principal"
              type="text"
              inputMode="decimal"
              value={principal}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9.]/g, "");
                setPrincipal(val);
              }}
              className="w-full rounded-md border border-gray-300 py-2 pl-7 pr-3 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
          </div>
        </div>

        {/* Period selector pills */}
        <div className="mb-5">
          <p className="mb-2 text-[13px] text-gray-500">Period</p>
          <div className="flex flex-wrap gap-2">
            {PERIODS.map((p) => (
              <button
                key={p.months}
                onClick={() => setSelectedPeriod(p.months)}
                className={`rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors ${
                  selectedPeriod === p.months
                    ? "bg-gray-900 text-white"
                    : "border border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results table */}
        {principalNum > 0 && apy > 0 && (
          <div className="rounded-md border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <span className="text-[13px] text-gray-500">Initial Deposit</span>
              <span className="text-[13px] font-medium text-gray-900">
                {formatDollar(principalNum)}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <span className="text-[13px] text-gray-500">
                Estimated Earnings
              </span>
              <span className="text-[13px] font-medium text-green-600">
                +{formatDollar(earnings)}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-[13px] text-gray-500">Total Value</span>
              <span className="text-[13px] font-semibold text-gray-900">
                {formatDollar(totalValue)}
              </span>
            </div>
          </div>
        )}

        <p className="mt-3 text-[11px] text-gray-400">
          Estimates assume constant APY of {apy.toFixed(2)}%. Actual returns
          will vary.
        </p>
      </div>
    </section>
  );
}
