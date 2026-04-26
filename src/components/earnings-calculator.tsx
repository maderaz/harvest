"use client";

import { useState } from "react";

interface EarningsCalculatorProps {
  apy: number;
  asset: string;
}

const PERIODS = [
  { label: "1 Month", key: "1M", months: 1 },
  { label: "6 Months", key: "6M", months: 6 },
  { label: "1 Year", key: "1Y", months: 12 },
  { label: "2 Years", key: "2Y", months: 24 },
] as const;

function formatDollar(value: number): string {
  return "$" + value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function EarningsCalculator({ apy, asset }: EarningsCalculatorProps) {
  const [principal, setPrincipal] = useState("1000");
  const [selectedPeriod, setSelectedPeriod] = useState(12);

  const principalNum = parseFloat(principal) || 0;
  const rate = apy / 100;
  const years = selectedPeriod / 12;

  const totalValue = principalNum * Math.pow(1 + rate, years);
  const earnings = totalValue - principalNum;

  return (
    <div className="pp-section" id="calculator">
      <h2>Earnings Calculator</h2>
      <div className="calc-card">
        <div className="calc-label">Deposit Amount ({asset})</div>
        <div className="calc-input">
          <span>$</span>
          <input
            type="text"
            inputMode="decimal"
            value={principal}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9.]/g, "");
              setPrincipal(val);
            }}
          />
        </div>
        <div className="calc-label">Period</div>
        <div className="calc-period">
          {PERIODS.map((p) => (
            <button
              key={p.months}
              className={selectedPeriod === p.months ? "active" : ""}
              onClick={() => setSelectedPeriod(p.months)}
            >
              {p.label}
            </button>
          ))}
        </div>
        {principalNum > 0 && apy > 0 && (
          <div className="calc-result">
            <div className="cr-block">
              <div className="cr-label">Initial</div>
              <div className="cr-val">{formatDollar(principalNum)}</div>
            </div>
            <div className="cr-block">
              <div className="cr-label">Earnings</div>
              <div className="cr-val up">+{formatDollar(earnings)}</div>
            </div>
            <div
              className="cr-block"
              style={{ gridColumn: "1 / -1", borderTop: "1px dashed var(--line)", paddingTop: 8 }}
            >
              <div className="cr-label">Total Value</div>
              <div className="cr-val total">{formatDollar(totalValue)}</div>
            </div>
          </div>
        )}
        <div className="calc-disclaimer mono">
          Estimates assume constant {apy.toFixed(2)}% APY. Actual returns will vary with market conditions.
        </div>
      </div>
    </div>
  );
}
