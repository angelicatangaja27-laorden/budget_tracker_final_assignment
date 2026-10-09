import {
  Pie,
  PieChart,
  Sector,
  Tooltip,
  type PieSectorShapeProps,
  type TooltipContentProps,
} from "recharts";
import { ChartTooltip, TooltipRow } from "@/components/ChartTooltip";
import EmptyState from "@/components/EmptyState";
import type { CategoryTotal } from "@/lib/calculations";
import { formatPercent, formatPeso, formatPesoCompact } from "@/lib/format";

const SLICE_COLORS = [
  "var(--series-1)",
  "var(--series-2)",
  "var(--series-3)",
  "var(--series-4)",
  "var(--series-5)",
  "var(--series-6)",
];
const OTHER_COLOR = "var(--series-other)";
const MAX_SLICES = 6;
const HIGHLIGHT_COUNT = 3;

type Slice = {
  name: string;
  value: number;
  share: number;
  color: string;
};

type ExpenseBreakdownProps = {
  items: CategoryTotal[];
  totalCentavos: number;
};

function renderSlice(props: PieSectorShapeProps) {
  const slice = props.payload as Slice;
  return <Sector {...props} fill={slice.color} />;
}

function renderTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const slice = payload[0].payload as Slice;

  return (
    <ChartTooltip title={slice.name}>
      <TooltipRow
        color={slice.color}
        value={formatPeso(slice.value)}
        label={`${formatPercent(slice.share)} of expenses`}
      />
    </ChartTooltip>
  );
}

export default function ExpenseBreakdown({ items, totalCentavos }: ExpenseBreakdownProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        compact
        title="No expenses in this period"
        message="Expenses you add will be grouped by category here."
      />
    );
  }

  const isFolded = items.length > MAX_SLICES;
  const colorAt = (index: number) =>
    isFolded && index >= MAX_SLICES - 1 ? OTHER_COLOR : SLICE_COLORS[index];

  const slices: Slice[] = items
    .slice(0, isFolded ? MAX_SLICES - 1 : MAX_SLICES)
    .map((item, index) => ({
      name: item.category.name,
      value: item.totalCentavos,
      share: item.share,
      color: colorAt(index),
    }));

  if (isFolded) {
    const rest = items.slice(MAX_SLICES - 1);
    slices.push({
      name: `${rest.length} other categories`,
      value: rest.reduce((sum, item) => sum + item.totalCentavos, 0),
      share: rest.reduce((sum, item) => sum + item.share, 0),
      color: OTHER_COLOR,
    });
  }

  return (
    <div className="breakdown">
      <div className="donut">
        <PieChart responsive style={{ width: "100%", aspectRatio: 1 }}>
          <Pie
            data={slices}
            dataKey="value"
            nameKey="name"
            innerRadius="64%"
            outerRadius="100%"
            startAngle={90}
            endAngle={-270}
            stroke="var(--surface)"
            strokeWidth={2}
            shape={renderSlice}
          />
          <Tooltip content={renderTooltip} />
        </PieChart>
        <div className="donut-center">
          <span className="donut-total">{formatPesoCompact(totalCentavos)}</span>
          <span className="donut-caption">total spent</span>
        </div>
      </div>

      <ol className="breakdown-list" aria-label="Spending by category">
        {items.map((item, index) => (
          <li
            key={item.category.id}
            className={index < HIGHLIGHT_COUNT ? "breakdown-item top" : "breakdown-item"}
          >
            <span className="legend-swatch" style={{ background: colorAt(index) }} />
            <span className="breakdown-name">
              {item.category.name}
              {index === 0 && <span className="pill highlight">Highest</span>}
            </span>
            <span className="breakdown-amount">{formatPeso(item.totalCentavos)}</span>
            <span className="breakdown-share">{formatPercent(item.share)}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
