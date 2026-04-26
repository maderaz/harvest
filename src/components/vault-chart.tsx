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
  color?: string;
}

const WINDOWS = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
  { label: "All", days: 0 },
];

function formatValue(value: number, format: ValueFormat): string {
  switch (format) {
    case "dollar":
      if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
      if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
      if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
      return `$${value.toFixed(2)}`;
    case "percent":
      return `${value.toFixed(2)}%`;
    case "number":
      if (value >= 1_000_000) return (value / 1_000_000).toFixed(6);
      if (value >= 1) return value.toFixed(4);
      return value.toFixed(6);
  }
}

function formatAxisVal(value: number, format: ValueFormat): string {
  switch (format) {
    case "dollar":
      if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
      if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
      if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
      return `$${value.toFixed(0)}`;
    case "percent":
      return `${value.toFixed(1)}%`;
    case "number":
      if (value >= 1) return value.toFixed(2);
      return value.toFixed(4);
  }
}

function formatDate(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatDateFull(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const W = 600;
const H = 200;
const PT = 12;
const PB = 26;
const PL = 48;
const PR = 12;
const DRAW_W = W - PL - PR;
const DRAW_H = H - PT - PB;

function monotoneSplinePath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  if (pts.length === 2) return `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y}`;

  const n = pts.length;
  const dx: number[] = [];
  const dy: number[] = [];
  const m: number[] = [];

  for (let i = 0; i < n - 1; i++) {
    dx.push(pts[i + 1].x - pts[i].x);
    dy.push(pts[i + 1].y - pts[i].y);
    m.push(dx[i] === 0 ? 0 : dy[i] / dx[i]);
  }

  // Fritsch-Carlson tangents
  const tangents: number[] = [m[0]];
  for (let i = 1; i < n - 1; i++) {
    if (m[i - 1] * m[i] <= 0) {
      tangents.push(0);
    } else {
      tangents.push((m[i - 1] + m[i]) / 2);
    }
  }
  tangents.push(m[n - 2]);

  // Clamp tangents to preserve monotonicity
  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) {
      tangents[i] = 0;
      tangents[i + 1] = 0;
    } else {
      const a = tangents[i] / m[i];
      const b = tangents[i + 1] / m[i];
      const s = a * a + b * b;
      if (s > 9) {
        const t = 3 / Math.sqrt(s);
        tangents[i] = t * a * m[i];
        tangents[i + 1] = t * b * m[i];
      }
    }
  }

  let path = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < n - 1; i++) {
    const d = dx[i] / 3;
    const cp1x = pts[i].x + d;
    const cp1y = pts[i].y + tangents[i] * d;
    const cp2x = pts[i + 1].x - d;
    const cp2y = pts[i + 1].y - tangents[i + 1] * d;
    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pts[i + 1].x} ${pts[i + 1].y}`;
  }
  return path;
}

export function VaultChart({
  title,
  data,
  format,
  color = "#3b82f6",
}: VaultChartProps) {
  const gradientId = useId();
  const [activeWindow, setActiveWindow] = useState("All");
  const [scrub, setScrub] = useState<{
    x: number;
    y: number;
    value: number;
    timestamp: number;
  } | null>(null);

  const filteredData = useMemo(() => {
    const win = WINDOWS.find((w) => w.label === activeWindow);
    if (!win || win.days === 0 || data.length === 0) return data;
    const cutoff = Math.floor(Date.now() / 1000) - win.days * 86400;
    const filtered = data.filter((d) => d.timestamp >= cutoff);
    return filtered.length >= 2 ? filtered : data;
  }, [data, activeWindow]);

  const chartCalc = useMemo(() => {
    if (filteredData.length < 2) return null;
    const values = filteredData.map((d) => d.value);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal || 1;
    return {
      yMin: minVal - range * 0.04,
      yMax: maxVal + range * 0.04,
      minTs: filteredData[0].timestamp,
      tsRange: filteredData[filteredData.length - 1].timestamp - filteredData[0].timestamp || 1,
    };
  }, [filteredData]);

  const xPos = useCallback(
    (ts: number) =>
      chartCalc ? PL + ((ts - chartCalc.minTs) / chartCalc.tsRange) * DRAW_W : 0,
    [chartCalc],
  );

  const yPos = useCallback(
    (val: number) =>
      chartCalc
        ? PT + (1 - (val - chartCalc.yMin) / (chartCalc.yMax - chartCalc.yMin)) * DRAW_H
        : 0,
    [chartCalc],
  );

  if (!chartCalc || filteredData.length < 2) return null;

  const { yMin, yMax } = chartCalc;
  const lastPoint = filteredData[filteredData.length - 1];

  // Build monotone cubic spline path for smooth curves
  const points = filteredData.map((d) => ({ x: xPos(d.timestamp), y: yPos(d.value) }));
  const linePath = monotoneSplinePath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${H - PB} L ${points[0].x} ${H - PB} Z`;

  // Y grid (3 lines)
  const yTicks = Array.from({ length: 3 }, (_, i) => {
    const val = yMin + ((yMax - yMin) * (2 - i)) / 2;
    return { val, y: yPos(val) };
  });

  // X labels (4 evenly spaced)
  const xTickCount = Math.min(4, filteredData.length);
  const xTicks = Array.from({ length: xTickCount }, (_, i) => {
    const idx = Math.round((i * (filteredData.length - 1)) / (xTickCount - 1));
    const d = filteredData[idx];
    return { label: formatDate(d.timestamp), x: xPos(d.timestamp) };
  });

  function findClosest(svgX: number) {
    let closest = filteredData[0];
    let dist = Infinity;
    for (const d of filteredData) {
      const dx = Math.abs(xPos(d.timestamp) - svgX);
      if (dx < dist) {
        dist = dx;
        closest = d;
      }
    }
    return closest;
  }

  function handlePointer(clientX: number, rect: DOMRect) {
    const svgX = ((clientX - rect.left) / rect.width) * W;
    const c = findClosest(svgX);
    setScrub({ x: xPos(c.timestamp), y: yPos(c.value), value: c.value, timestamp: c.timestamp });
  }

  function onMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    handlePointer(e.clientX, e.currentTarget.getBoundingClientRect());
  }
  function onTouchMove(e: React.TouchEvent<SVGSVGElement>) {
    handlePointer(e.touches[0].clientX, e.currentTarget.getBoundingClientRect());
  }

  const displayVal = scrub ? scrub.value : lastPoint.value;
  const displayDate = scrub ? formatDateFull(scrub.timestamp) : formatDateFull(lastPoint.timestamp);

  // Badge position clamped to chart bounds
  const badgeW = 120;
  const badgeX = scrub
    ? Math.max(0, Math.min(scrub.x - badgeW / 2, W - badgeW))
    : 0;

  return (
    <div className="chart-card-inner">
      {/* Header — single line on desktop */}
      <div className="chart-header">
        <div className="chart-header-left">
          <span className="chart-title">{title}</span>
          <span className="chart-value">{formatValue(displayVal, format)}</span>
          <span className="chart-date">{displayDate}</span>
        </div>
        <div className="chart-windows">
          {WINDOWS.map((w) => (
            <button
              key={w.label}
              onPointerDown={(e) => {
                e.stopPropagation();
                setActiveWindow(w.label);
              }}
              className={`chart-window-btn${activeWindow === w.label ? " active" : ""}`}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full cursor-crosshair"
        style={{ touchAction: "pan-y" }}
        preserveAspectRatio="xMidYMid meet"
        onMouseMove={onMouseMove}
        onMouseLeave={() => setScrub(null)}
        onTouchMove={onTouchMove}
        onTouchEnd={() => setScrub(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {yTicks.map((t, i) => (
          <g key={i}>
            <line
              x1={PL}
              y1={t.y}
              x2={W - PR}
              y2={t.y}
              stroke="#eef0f3"
              strokeWidth="1"
            />
            <text x={PL - 6} y={t.y + 3} textAnchor="end" fontSize="10" fill="#9ca3af">
              {formatAxisVal(t.val, format)}
            </text>
          </g>
        ))}

        {/* Area + Line */}
        <path d={areaPath} fill={`url(#${gradientId})`} />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />

        {/* Live dot */}
        {!scrub && (
          <>
            <circle cx={xPos(lastPoint.timestamp)} cy={yPos(lastPoint.value)} r="4" fill={color} />
            <circle
              cx={xPos(lastPoint.timestamp)}
              cy={yPos(lastPoint.value)}
              r="8"
              fill={color}
              opacity="0.2"
            />
          </>
        )}

        {/* Scrub crosshair */}
        {scrub && (
          <>
            <line
              x1={scrub.x}
              y1={PT}
              x2={scrub.x}
              y2={H - PB}
              stroke="#d1d5db"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <circle cx={scrub.x} cy={scrub.y} r="5" fill={color} />
            <circle cx={scrub.x} cy={scrub.y} r="5" fill="none" stroke="white" strokeWidth="2" />
          </>
        )}

        {/* X axis labels */}
        {xTicks.map((t, i) => (
          <text
            key={i}
            x={t.x}
            y={H - 6}
            textAnchor="middle"
            fontSize="10"
            fill="#9ca3af"
          >
            {t.label}
          </text>
        ))}
      </svg>
    </div>
  );
}
