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
  rightSlot?: React.ReactNode;
}

const WINDOWS = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
  { label: "All", days: 0 },
];

const W = 600;
const H = 180;
const PT = 10;
const PB = 26;
const PL = 54;
const PR = 14;
const DRAW_W = W - PL - PR;
const DRAW_H = H - PT - PB;

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
  return new Date(ts * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDateFull(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function monotoneSpline(pts: { x: number; y: number }[]): string {
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

  const t: number[] = [m[0]];
  for (let i = 1; i < n - 1; i++) {
    t.push(m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2);
  }
  t.push(m[n - 2]);

  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) {
      t[i] = 0;
      t[i + 1] = 0;
      continue;
    }
    const a = t[i] / m[i];
    const b = t[i + 1] / m[i];
    const s = a * a + b * b;
    if (s > 9) {
      const sc = 3 / Math.sqrt(s);
      t[i] = sc * a * m[i];
      t[i + 1] = sc * b * m[i];
    }
  }

  let path = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    path += ` C ${pts[i].x + h} ${pts[i].y + t[i] * h}, ${pts[i + 1].x - h} ${pts[i + 1].y - t[i + 1] * h}, ${pts[i + 1].x} ${pts[i + 1].y}`;
  }
  return path;
}

export function VaultChart({
  title,
  data,
  format,
  color = "#3b82f6",
  rightSlot,
}: VaultChartProps) {
  const gradId = useId();
  const [activeWindow, setActiveWindow] = useState("All");
  const [scrub, setScrub] = useState<{
    x: number;
    y: number;
    value: number;
    ts: number;
  } | null>(null);

  const filtered = useMemo(() => {
    const win = WINDOWS.find((w) => w.label === activeWindow);
    if (!win || win.days === 0 || data.length === 0) return data;
    const cutoff = Math.floor(Date.now() / 1000) - win.days * 86400;
    const f = data.filter((d) => d.timestamp >= cutoff);
    return f.length >= 2 ? f : data;
  }, [data, activeWindow]);

  const calc = useMemo(() => {
    if (filtered.length < 2) return null;
    const vals = filtered.map((d) => d.value);
    const lo = Math.min(...vals);
    const hi = Math.max(...vals);
    const range = hi - lo || 1;
    const pad = range * 0.08;
    return {
      yMin: lo - pad,
      yMax: hi + pad,
      minTs: filtered[0].timestamp,
      tsRange: filtered[filtered.length - 1].timestamp - filtered[0].timestamp || 1,
    };
  }, [filtered]);

  const toX = useCallback(
    (ts: number) => (calc ? PL + ((ts - calc.minTs) / calc.tsRange) * DRAW_W : 0),
    [calc],
  );

  const toY = useCallback(
    (val: number) =>
      calc ? PT + (1 - (val - calc.yMin) / (calc.yMax - calc.yMin)) * DRAW_H : 0,
    [calc],
  );

  if (!calc || filtered.length < 2) return null;

  const last = filtered[filtered.length - 1];
  const pts = filtered.map((d) => ({ x: toX(d.timestamp), y: toY(d.value) }));
  const linePath = monotoneSpline(pts);
  const areaPath = `${linePath} L ${pts[pts.length - 1].x} ${H - PB} L ${pts[0].x} ${H - PB} Z`;

  const yTicks = Array.from({ length: 4 }, (_, i) => {
    const val = calc.yMin + ((calc.yMax - calc.yMin) * (3 - i)) / 3;
    return { val, y: toY(val) };
  });

  const xTicks = Array.from({ length: 4 }, (_, i) => ({
    label: formatDate(calc.minTs + (i * calc.tsRange) / 3),
    x: PL + (i * DRAW_W) / 3,
  }));

  const dispVal = scrub ? scrub.value : last.value;
  const dispDate = scrub ? formatDateFull(scrub.ts) : formatDateFull(last.timestamp);

  function findClosest(svgX: number) {
    let best = filtered[0];
    let dist = Infinity;
    for (const d of filtered) {
      const dx = Math.abs(toX(d.timestamp) - svgX);
      if (dx < dist) {
        dist = dx;
        best = d;
      }
    }
    return best;
  }

  function handlePointer(clientX: number, rect: DOMRect) {
    const svgX = ((clientX - rect.left) / rect.width) * W;
    const c = findClosest(svgX);
    setScrub({ x: toX(c.timestamp), y: toY(c.value), value: c.value, ts: c.timestamp });
  }

  return (
    <div className="vc-wrap">
      <div className="vc-header">
        <div className="vc-header-left">
          <span className="vc-title">{title}</span>
          <span className="vc-value">{formatValue(dispVal, format)}</span>
          <span className="vc-date">{dispDate}</span>
        </div>
        <div className="vc-controls">
          <div className="vc-windows">
            {WINDOWS.map((w) => (
              <button
                key={w.label}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setActiveWindow(w.label);
                }}
                className={`vc-win-btn${activeWindow === w.label ? " active" : ""}`}
              >
                {w.label}
              </button>
            ))}
          </div>
          {rightSlot}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ display: "block", width: "100%", cursor: "crosshair", touchAction: "pan-y" }}
        onMouseMove={(e) => handlePointer(e.clientX, e.currentTarget.getBoundingClientRect())}
        onMouseLeave={() => setScrub(null)}
        onTouchMove={(e) =>
          handlePointer(e.touches[0].clientX, e.currentTarget.getBoundingClientRect())
        }
        onTouchEnd={() => setScrub(null)}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

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
            <text x={PL - 6} y={t.y + 4} textAnchor="end" fontSize="10" fill="#9ca3af">
              {formatAxisVal(t.val, format)}
            </text>
          </g>
        ))}

        <path d={areaPath} fill={`url(#${gradId})`} />
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {!scrub && (
          <>
            <circle cx={toX(last.timestamp)} cy={toY(last.value)} r="8" fill={color} opacity="0.15" />
            <circle cx={toX(last.timestamp)} cy={toY(last.value)} r="4" fill={color} />
          </>
        )}

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

        {xTicks.map((t, i) => (
          <text key={i} x={t.x} y={H - 6} textAnchor="middle" fontSize="10" fill="#9ca3af">
            {t.label}
          </text>
        ))}
      </svg>
    </div>
  );
}
