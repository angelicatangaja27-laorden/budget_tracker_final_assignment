import {
  addDays,
  addMonths,
  daysInRange,
  earlierDate,
  endOfMonth,
  formatShortDate,
  formatShortDateRange,
  formatShortMonth,
  startOfMonth,
} from "@/lib/dates";
import type { Category, DateRange, Transaction, TransactionType } from "@/types/budget";

export type TransactionFilters = {
  range?: DateRange | null;
  type?: TransactionType | "all";
  categoryId?: string;
  search?: string;
};

export type Totals = {
  incomeCentavos: number;
  expenseCentavos: number;
  balanceCentavos: number;
};

export type CategoryTotal = {
  category: Category;
  totalCentavos: number;
  count: number;
  share: number;
};

export type MonthSummary = Totals & {
  month: string;
};

export type SeriesGranularity = "day" | "week" | "month" | "year";

export type SeriesPoint = {
  label: string;
  range: DateRange;
  incomeCentavos: number;
  expenseCentavos: number;
};

export type IncomeExpenseSeries = {
  granularity: SeriesGranularity;
  points: SeriesPoint[];
};

export function filterTransactions(
  transactions: Transaction[],
  filters: TransactionFilters,
): Transaction[] {
  const search = filters.search?.trim().toLowerCase() ?? "";

  return transactions.filter((transaction) => {
    const { range, type, categoryId } = filters;
    if (range && (transaction.date < range.start || transaction.date > range.end)) return false;
    if (type && type !== "all" && transaction.type !== type) return false;
    if (categoryId && categoryId !== "all" && transaction.categoryId !== categoryId) return false;
    if (search && !`${transaction.name} ${transaction.notes}`.toLowerCase().includes(search)) {
      return false;
    }
    return true;
  });
}

export function sortNewestFirst(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort(
    (a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt,
  );
}

export function getTotals(transactions: Transaction[]): Totals {
  let incomeCentavos = 0;
  let expenseCentavos = 0;

  for (const transaction of transactions) {
    if (transaction.type === "income") incomeCentavos += transaction.amountCentavos;
    else expenseCentavos += transaction.amountCentavos;
  }

  return {
    incomeCentavos,
    expenseCentavos,
    balanceCentavos: incomeCentavos - expenseCentavos,
  };
}

export function getCategoryTotals(
  transactions: Transaction[],
  categories: Category[],
  type: TransactionType,
): CategoryTotal[] {
  const sums = new Map<string, { total: number; count: number }>();
  let grandTotal = 0;

  for (const transaction of transactions) {
    if (transaction.type !== type) continue;
    const sum = sums.get(transaction.categoryId) ?? { total: 0, count: 0 };
    sum.total += transaction.amountCentavos;
    sum.count += 1;
    sums.set(transaction.categoryId, sum);
    grandTotal += transaction.amountCentavos;
  }

  return categories
    .filter((category) => category.type === type)
    .map((category) => {
      const sum = sums.get(category.id) ?? { total: 0, count: 0 };
      return {
        category,
        totalCentavos: sum.total,
        count: sum.count,
        share: grandTotal > 0 ? sum.total / grandTotal : 0,
      };
    })
    .sort(
      (a, b) =>
        b.totalCentavos - a.totalCentavos || a.category.name.localeCompare(b.category.name),
    );
}

export function getExpenseBreakdown(
  transactions: Transaction[],
  categories: Category[],
): CategoryTotal[] {
  return getCategoryTotals(transactions, categories, "expense").filter(
    (item) => item.totalCentavos > 0,
  );
}

export function getMonthlySummary(
  transactions: Transaction[],
  lastMonthDate: string,
  monthCount: number,
): MonthSummary[] {
  const summary: MonthSummary[] = [];

  for (let monthsAgo = 0; monthsAgo < monthCount; monthsAgo++) {
    const start = startOfMonth(addMonths(lastMonthDate, -monthsAgo));
    const range = { start, end: endOfMonth(start) };
    summary.push({ month: start, ...getTotals(filterTransactions(transactions, { range })) });
  }

  return summary;
}

function getDataRange(transactions: Transaction[]): DateRange | null {
  if (transactions.length === 0) return null;

  let start = transactions[0].date;
  let end = transactions[0].date;
  for (const transaction of transactions) {
    if (transaction.date < start) start = transaction.date;
    if (transaction.date > end) end = transaction.date;
  }
  return { start, end };
}

function splitRange(range: DateRange): { granularity: SeriesGranularity; buckets: DateRange[] } {
  const days = daysInRange(range);
  const buckets: DateRange[] = [];

  if (days <= 14) {
    for (let day = range.start; day <= range.end; day = addDays(day, 1)) {
      buckets.push({ start: day, end: day });
    }
    return { granularity: "day", buckets };
  }

  if (days <= 92) {
    for (let start = range.start; start <= range.end; start = addDays(start, 7)) {
      buckets.push({ start, end: earlierDate(addDays(start, 6), range.end) });
    }
    return { granularity: "week", buckets };
  }

  if (days <= 731) {
    for (let start = range.start; start <= range.end; start = startOfMonth(addMonths(start, 1))) {
      buckets.push({ start, end: earlierDate(endOfMonth(start), range.end) });
    }
    return { granularity: "month", buckets };
  }

  for (let start = range.start; start <= range.end; start = `${Number(start.slice(0, 4)) + 1}-01-01`) {
    buckets.push({ start, end: earlierDate(`${start.slice(0, 4)}-12-31`, range.end) });
  }
  return { granularity: "year", buckets };
}

function bucketLabel(bucket: DateRange, granularity: SeriesGranularity, spansYears: boolean): string {
  switch (granularity) {
    case "day":
      return formatShortDate(bucket.start);
    case "week":
      return formatShortDateRange(bucket);
    case "month":
      return formatShortMonth(bucket.start, spansYears);
    case "year":
      return bucket.start.slice(0, 4);
  }
}

export function getIncomeExpenseSeries(
  transactions: Transaction[],
  range: DateRange | null,
): IncomeExpenseSeries {
  const fullRange = range ?? getDataRange(transactions);
  if (!fullRange) return { granularity: "day", points: [] };

  const { granularity, buckets } = splitRange(fullRange);
  const spansYears = fullRange.start.slice(0, 4) !== fullRange.end.slice(0, 4);

  const points = buckets.map((bucket) => {
    const totals = getTotals(filterTransactions(transactions, { range: bucket }));
    return {
      label: bucketLabel(bucket, granularity, spansYears),
      range: bucket,
      incomeCentavos: totals.incomeCentavos,
      expenseCentavos: totals.expenseCentavos,
    };
  });

  return { granularity, points };
}
