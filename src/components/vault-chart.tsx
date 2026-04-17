"use client";

import { useId, useMemo, useRef, useState } from "react";

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

const CHART_HEIGHT = 200;
const PADDING_TOP = 20;
const PADDING_BOTTOM = 30;
const PADDING_LEFT = 60;
const PADDING_RIGHT = 20;

export function VaultChart({ title, data, format }: VaultChartProps) {
  const gradientId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
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

    // Add some padding to y range
    const valRange = maxVal - minVal || 1;
    const yMin = minVal - valRange * 0.05;
    const yMax = maxVal + valRange * 0.05;
    const tsRange = maxTs - minTs || 1;

    return { values, timestamps, yMin, yMax, minTs, tsRange };
  }, [data]);

  if (!chartData || data.length < 2) return null;

  const { yMin, yMax, minTs, tsRange } = chartData;
  const drawHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

  function xPos(ts: number): number {
    return PADDING_LEFT + ((ts - minTs) / tsRange) * (800 - PADDING_LEFT - PADDING_RIGHT);
  }

  function yPos(val: number): number {
    return PADDING_TOP + (1 - (val - yMin) / (yMax - yMin)) * drawHeight;
  }

  // Build SVG path
  const lineParts: string[] = [];
  const areaParts: string[] = [];

  data.forEach((d, i) => {
    const x = xPos(d.timestamp);
    const y = yPos(d.value);
    if (i === 0) {
      lineParts.push(`M ${x} ${y}`);
      areaParts.push(`M ${x} ${CHART_HEIGHT - PADDING_BOTTOM}`);
      areaParts.push(`L ${x} ${y}`);
    } else {
      lineParts.push(`L ${x} ${y}`);
      areaParts.push(`L ${x} ${y}`);
    }
  });

  // Close area path
  const lastX = xPos(data[data.length - 1].timestamp);
  areaParts.push(`L ${lastX} ${CHART_HEIGHT - PADDING_BOTTOM}`);
  areaParts.push("Z");

  const linePath = lineParts.join(" ");
  const areaPath = areaParts.join(" ");

  // Y axis labels (5 ticks)
  const yTicks = Array.from({ length: 5 }, (_, i) => {
    const val = yMin + ((yMax - yMin) * (4 - i)) / 4;
    return { val, y: yPos(val) };
  });

  // X axis labels (up to 6 dates)
  const xTickCount = Math.min(6, data.length);
  const xTicks = Array.from({ length: xTickCount }, (_, i) => {
    const idx = Math.round((i * (data.length - 1)) / (xTickCount - 1));
    const d = data[idx];
    return { label: formatDate(d.timestamp), x: xPos(d.timestamp) };
  });

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 800;

    // Find closest data point
    let closest = data[0];
    let closestDist = Infinity;
    for (const d of data) {
      const dist = Math.abs(xPos(d.timestamp) - mouseX);
      if (dist < closestDist) {
        closestDist = dist;
        closest = d;
      }
    }

    setTooltip({
      x: xPos(closest.timestamp),
      y: yPos(closest.value),
      value: closest.value,
      timestamp: closest.timestamp,
    });
  }

  function handleMouseLeave() {
    setTooltip(null);
  }

  return (
    <div ref={containerRef} className="rounded-lg border border-gray-200 bg-white p-5">
      <h3 className="mb-3 text-base font-semibold text-gray-900">{title}</h3>
      <svg
        viewBox={`0 0 800 ${CHART_HEIGHT}`}
        className="w-full"
        preserveAspectRatio="xMidYMid meet"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Grid lines */}
        {yTicks.map((tick, i) => (
          <line
            key={i}
            x1={PADDING_LEFT}
            y1={tick.y}
            x2={800 - PADDING_RIGHT}
            y2={tick.y}
            stroke="#f0f0f0"
            strokeWidth="1"
          />
        ))}

        {/* Area fill */}
        <path d={areaPath} fill={`url(#${gradientId})`} opacity="0.3" />

        {/* Line */}
        <path d={linePath} fill="none" stroke="#2563eb" strokeWidth="2" />

        {/* Gradient definition */}
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Y axis labels */}
        {yTicks.map((tick, i) => (
          <text
            key={i}
            x={PADDING_LEFT - 8}
            y={tick.y + 4}
            textAnchor="end"
            fontSize="11"
            fill="#9ca3af"
          >
            {formatValue(tick.val, format)}
          </text>
        ))}

        {/* X axis labels */}
        {xTicks.map((tick, i) => (
          <text
            key={i}
            x={tick.x}
            y={CHART_HEIGHT - 8}
            textAnchor="middle"
            fontSize="11"
            fill="#9ca3af"
          >
            {tick.label}
          </text>
        ))}

        {/* Tooltip */}
        {tooltip && (
          <>
            <line
              x1={tooltip.x}
              y1={PADDING_TOP}
              x2={tooltip.x}
              y2={CHART_HEIGHT - PADDING_BOTTOM}
              stroke="#2563eb"
              strokeWidth="1"
              strokeDasharray="4 2"
              opacity="0.5"
            />
            <circle cx={tooltip.x} cy={tooltip.y} r="4" fill="#2563eb" />
            <rect
              x={tooltip.x - 60}
              y={tooltip.y - 36}
              width="120"
              height="28"
              rx="4"
              fill="white"
              stroke="#e5e7eb"
              strokeWidth="1"
            />
            <text
              x={tooltip.x}
              y={tooltip.y - 22}
              textAnchor="middle"
              fontSize="11"
              fontWeight="600"
              fill="#111827"
            >
              {formatValue(tooltip.value, format)}
            </text>
            <text
              x={tooltip.x}
              y={tooltip.y - 11}
              textAnchor="middle"
              fontSize="10"
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
