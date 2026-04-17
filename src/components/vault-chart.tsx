"use client";

import { useId, useMemo, useState, useCallback } from "react";

interface DataPoint {
  timestamp: number;
  value: number;
}

type ValueFormat = "dollar" | "percent" | "number";

interface VaultChartProps {
  title: string;
  data: DataPoint[];
  format: ValueFormat;
}

function formatValue(value: number, format: ValueFormat): string {
  switch (format) {
    case "dollar":
      if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
      if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
      if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
      return `$${value.toFixed(0)}`;
    case "percent":
      return `${value.toFixed(2)}%`;
    case "number":
      if (value >= 1_000_000) return (value / 1_000_000).toFixed(4);
      if (value >= 1_000) return value.toFixed(2);
      return value.toFixed(6);
  }
}

function formatDate(ts: number): string {
  const d = new Date(ts * 1000);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDateFull(ts: number): string {
  const d = new Date(ts * 1000);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const W = 600;
const H = 180;
const PT = 16;
const PB = 24;
const PL = 48;
const PR = 12;

export function VaultChart({ title, data, format }: VaultChartProps) {
  const gradientId = useId();
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    value: number;
    timestamp: number;
  } | null>(null);

  const chartData = useMemo(() => {
    if (data.length === 0) return null;

    const values = data.map((d) => d.value);
    const timestamps = data.map((d) => d.timestamp);

    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const minTs = Math.min(...timestamps);
    const maxTs = Math.max(...timestamps);

    const valRange = maxVal - minVal || 1;
    const yMin = minVal - valRange * 0.05;
    const yMax = maxVal + valRange * 0.05;
    const tsRange = maxTs - minTs || 1;

    return { yMin, yMax, minTs, tsRange };
  }, [data]);

  const xPos = useCallback(
    (ts: number) => {
      if (!chartData) return 0;
      return PL + ((ts - chartData.minTs) / chartData.tsRange) * (W - PL - PR);
    },
    [chartData],
  );

  const yPos = useCallback(
    (val: number) => {
      if (!chartData) return 0;
      const drawH = H - PT - PB;
      return PT + (1 - (val - chartData.yMin) / (chartData.yMax - chartData.yMin)) * drawH;
    },
    [chartData],
  );

  if (!chartData || data.length < 2) return null;

  const { yMin, yMax } = chartData;

  const lineParts: string[] = [];
  const areaParts: string[] = [];

  data.forEach((d, i) => {
    const x = xPos(d.timestamp);
    const y = yPos(d.value);
    if (i === 0) {
      lineParts.push(`M ${x} ${y}`);
      areaParts.push(`M ${x} ${H - PB}`);
      areaParts.push(`L ${x} ${y}`);
    } else {
      lineParts.push(`L ${x} ${y}`);
      areaParts.push(`L ${x} ${y}`);
    }
  });

  const lastX = xPos(data[data.length - 1].timestamp);
  areaParts.push(`L ${lastX} ${H - PB}`);
  areaParts.push("Z");

  const linePath = lineParts.join(" ");
  const areaPath = areaParts.join(" ");

  const yTicks = Array.from({ length: 4 }, (_, i) => {
    const val = yMin + ((yMax - yMin) * (3 - i)) / 3;
    return { val, y: yPos(val) };
  });

  const xTickCount = Math.min(4, data.length);
  const xTicks = Array.from({ length: xTickCount }, (_, i) => {
    const idx = Math.round((i * (data.length - 1)) / (xTickCount - 1));
    const d = data[idx];
    return { label: formatDate(d.timestamp), x: xPos(d.timestamp) };
  });

  function findClosest(svgX: number) {
    let closest = data[0];
    let closestDist = Infinity;
    for (const d of data) {
      const dist = Math.abs(xPos(d.timestamp) - svgX);
      if (dist < closestDist) {
        closestDist = dist;
        closest = d;
      }
    }
    return closest;
  }

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * W;
    const closest = findClosest(svgX);
    setTooltip({
      x: xPos(closest.timestamp),
      y: yPos(closest.value),
      value: closest.value,
      timestamp: closest.timestamp,
    });
  }

  function handleTouchMove(e: React.TouchEvent<SVGSVGElement>) {
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const svgX = ((touch.clientX - rect.left) / rect.width) * W;
    const closest = findClosest(svgX);
    setTooltip({
      x: xPos(closest.timestamp),
      y: yPos(closest.value),
      value: closest.value,
      timestamp: closest.timestamp,
    });
  }

  function handleLeave() {
    setTooltip(null);
  }

  const tooltipW = 110;
  const tooltipX = tooltip
    ? Math.max(PL, Math.min(tooltip.x - tooltipW / 2, W - PR - tooltipW))
    : 0;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-5">
      <h3 className="mb-2 text-sm font-semibold text-gray-900 sm:text-base sm:mb-3">
        {title}
      </h3>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full touch-none"
        preserveAspectRatio="xMidYMid meet"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleLeave}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleLeave}
      >
        {yTicks.map((tick, i) => (
          <line
            key={i}
            x1={PL}
            y1={tick.y}
            x2={W - PR}
            y2={tick.y}
            stroke="#f0f0f0"
            strokeWidth="1"
          />
        ))}

        <path d={areaPath} fill={`url(#${gradientId})`} opacity="0.3" />
        <path d={linePath} fill="none" stroke="#2563eb" strokeWidth="2" />

        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
          </linearGradient>
        </defs>

        {yTicks.map((tick, i) => (
          <text
            key={i}
            x={PL - 6}
            y={tick.y + 3}
            textAnchor="end"
            fontSize="9"
            fill="#9ca3af"
          >
            {formatValue(tick.val, format)}
          </text>
        ))}

        {xTicks.map((tick, i) => (
          <text
            key={i}
            x={tick.x}
            y={H - 6}
            textAnchor="middle"
            fontSize="9"
            fill="#9ca3af"
          >
            {tick.label}
          </text>
        ))}

        {tooltip && (
          <>
            <line
              x1={tooltip.x}
              y1={PT}
              x2={tooltip.x}
              y2={H - PB}
              stroke="#2563eb"
              strokeWidth="1"
              strokeDasharray="4 2"
              opacity="0.5"
            />
            <circle cx={tooltip.x} cy={tooltip.y} r="4" fill="#2563eb" />
            <rect
              x={tooltipX}
              y={Math.max(2, tooltip.y - 34)}
              width={tooltipW}
              height="26"
              rx="4"
              fill="white"
              stroke="#e5e7eb"
              strokeWidth="1"
            />
            <text
              x={tooltipX + tooltipW / 2}
              y={Math.max(2, tooltip.y - 34) + 11}
              textAnchor="middle"
              fontSize="10"
              fontWeight="600"
              fill="#111827"
            >
              {formatValue(tooltip.value, format)}
            </text>
            <text
              x={tooltipX + tooltipW / 2}
              y={Math.max(2, tooltip.y - 34) + 22}
              textAnchor="middle"
              fontSize="9"
              fill="#6b7280"
            >
              {formatDateFull(tooltip.timestamp)}
            </text>
          </>
        )}
      </svg>
    </div>
  );
}
