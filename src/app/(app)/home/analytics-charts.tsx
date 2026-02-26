"use client";

export type InventoryStat = {
  id: string;
  name: string;
  isDefault: boolean;
  assetCount: number;
};

const SLICE_COLORS = [
  "#7C3AED",
  "#10B981",
  "#F59E0B",
  "#3B82F6",
  "#EF4444",
  "#A855F7",
  "#06B6D4",
  "#84CC16",
];

function buildPieSlices(data: InventoryStat[]) {
  const total = data.reduce((s, d) => s + d.assetCount, 0);
  if (total === 0) return [];

  const cx = 50;
  const cy = 50;
  const r = 38;
  let startAngle = -Math.PI / 2;

  return data.map((d, i) => {
    const frac = d.assetCount / total;
    const angle = frac * 2 * Math.PI;
    const endAngle = startAngle + angle;

    let path: string;
    if (data.length === 1) {
      // Full circle — arc to same point doesn't render, use two half-arcs
      path = `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.001} ${cy - r} Z`;
    } else {
      const x1 = cx + r * Math.cos(startAngle);
      const y1 = cy + r * Math.sin(startAngle);
      const x2 = cx + r * Math.cos(endAngle);
      const y2 = cy + r * Math.sin(endAngle);
      const largeArc = angle > Math.PI ? 1 : 0;
      path = `M ${cx} ${cy} L ${x1.toFixed(3)} ${y1.toFixed(3)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(3)} ${y2.toFixed(3)} Z`;
    }

    const slice = {
      ...d,
      path,
      color: SLICE_COLORS[i % SLICE_COLORS.length],
      percent: Math.round(frac * 100),
    };

    startAngle = endAngle;
    return slice;
  });
}

export function InventoryPieChart({ data }: { data: InventoryStat[] }) {
  const total = data.reduce((s, d) => s + d.assetCount, 0);
  const slices = buildPieSlices(data);

  if (total === 0) {
    return (
      <div className="flex h-48 items-center justify-center">
        <p className="text-sm text-muted-foreground">No items yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
      {/* Pie */}
      <svg
        viewBox="0 0 100 100"
        className="w-36 h-36 shrink-0"
        aria-label="Items per inventory pie chart"
      >
        {slices.map((slice, i) => (
          <path
            key={i}
            d={slice.path}
            fill={slice.color}
            stroke="var(--card)"
            strokeWidth="1.5"
          />
        ))}
      </svg>

      {/* Legend */}
      <div className="flex flex-col gap-2">
        {slices.map((slice, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: slice.color }}
            />
            <span className="text-sm text-muted-foreground">
              {slice.name}
              {slice.isDefault ? (
                <span className="ml-1 text-xs opacity-60">(default)</span>
              ) : null}
            </span>
            <span className="ml-auto pl-4 text-sm font-semibold tabular-nums">
              {slice.assetCount}
            </span>
            <span className="text-xs text-muted-foreground tabular-nums w-9 text-right">
              {slice.percent}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
