import {
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import { ChartTooltip, TooltipRow } from "@/components/ChartTooltip";
import EmptyState from "@/components/EmptyState";
import type { IncomeExpenseSeries, SeriesGranularity, SeriesPoint } from "@/lib/calculations";
import { formatDateRange } from "@/lib/dates";
import { formatPeso, formatPesoCompact } from "@/lib/format";

const INCOME_COLOR = "var(--series-1)";
const EXPENSE_COLOR = "var(--series-2)";
const AXIS_TICK = { fill: "var(--text-muted)", fontSize: 12 };

const GRANULARITY_LABELS: Record<SeriesGranularity, string> = {
  day: "By day",
  week: "By week",
  month: "By month",
  year: "By year",
};

type IncomeExpenseChartProps = {
  series: IncomeExpenseSeries;
};

function renderTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload as SeriesPoint;

  return (
    <ChartTooltip title={formatDateRange(point.range)}>
      <TooltipRow color={INCOME_COLOR} value={formatPeso(point.incomeCentavos)} label="Income" />
      <TooltipRow color={EXPENSE_COLOR} value={formatPeso(point.expenseCentavos)} label="Expenses" />
      <TooltipRow value={formatPeso(point.incomeCentavos - point.expenseCentavos)} label="Net" />
    </ChartTooltip>
  );
}

export default function IncomeExpenseChart({ series }: IncomeExpenseChartProps) {
  const hasData = series.points.some(
    (point) => point.incomeCentavos > 0 || point.expenseCentavos > 0,
  );

  if (!hasData) {
    return (
      <EmptyState
        compact
        title="Nothing to compare yet"
        message="Income and expenses for this period will appear here."
      />
    );
  }

  return (
    <>
      <div className="chart-legend">
        <span className="legend-item">
          <span className="legend-swatch" style={{ background: INCOME_COLOR }} />
          Income
        </span>
        <span className="legend-item">
          <span className="legend-swatch" style={{ background: EXPENSE_COLOR }} />
          Expenses
        </span>
        <span className="legend-note">{GRANULARITY_LABELS[series.granularity]}</span>
      </div>

      <BarChart
        responsive
        style={{ width: "100%", height: 260 }}
        data={series.points}
        barGap={2}
        barCategoryGap="20%"
        margin={{ top: 8, right: 4, bottom: 0, left: 0 }}
      >
        <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={{ stroke: "var(--chart-axis)" }}
          tick={AXIS_TICK}
          minTickGap={12}
        />
        <YAxis
          tickFormatter={formatPesoCompact}
          tickLine={false}
          axisLine={false}
          tick={AXIS_TICK}
          width={60}
        />
        <Tooltip content={renderTooltip} cursor={{ fill: "var(--hover-wash)" }} />
        <Bar
          dataKey="incomeCentavos"
          name="Income"
          fill={INCOME_COLOR}
          radius={[4, 4, 0, 0]}
          maxBarSize={24}
        />
        <Bar
          dataKey="expenseCentavos"
          name="Expenses"
          fill={EXPENSE_COLOR}
          radius={[4, 4, 0, 0]}
          maxBarSize={24}
        />
      </BarChart>

      <details className="table-toggle">
        <summary>View as table</summary>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Period</th>
                <th scope="col" className="numeric">
                  Income
                </th>
                <th scope="col" className="numeric">
                  Expenses
                </th>
                <th scope="col" className="numeric">
                  Net
                </th>
              </tr>
            </thead>
            <tbody>
              {series.points.map((point) => {
                const net = point.incomeCentavos - point.expenseCentavos;
                return (
                  <tr key={point.range.start}>
                    <th scope="row">{formatDateRange(point.range)}</th>
                    <td className="numeric">{formatPeso(point.incomeCentavos)}</td>
                    <td className="numeric">{formatPeso(point.expenseCentavos)}</td>
                    <td className={net < 0 ? "numeric negative" : "numeric"}>{formatPeso(net)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </details>
    </>
  );
}
