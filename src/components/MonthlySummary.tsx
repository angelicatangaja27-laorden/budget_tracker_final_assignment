import type { MonthSummary } from "@/lib/calculations";
import { formatShortMonth } from "@/lib/dates";
import { formatPeso } from "@/lib/format";

type MonthlySummaryProps = {
  months: MonthSummary[];
  highlightMonth: string;
};

export default function MonthlySummary({ months, highlightMonth }: MonthlySummaryProps) {
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th scope="col">Month</th>
            <th scope="col" className="numeric">
              Income
            </th>
            <th scope="col" className="numeric">
              Expenses
            </th>
            <th scope="col" className="numeric">
              Balance
            </th>
          </tr>
        </thead>
        <tbody>
          {months.map((month) => (
            <tr key={month.month} className={month.month === highlightMonth ? "current" : undefined}>
              <th scope="row">{formatShortMonth(month.month, true)}</th>
              <td className="numeric">{formatPeso(month.incomeCentavos)}</td>
              <td className="numeric">{formatPeso(month.expenseCentavos)}</td>
              <td className={month.balanceCentavos < 0 ? "numeric negative" : "numeric"}>
                {formatPeso(month.balanceCentavos)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
