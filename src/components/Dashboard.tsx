"use client";

import Link from "next/link";
import { useState } from "react";
import EmptyState from "@/components/EmptyState";
import ExpenseBreakdown from "@/components/ExpenseBreakdown";
import IncomeExpenseChart from "@/components/IncomeExpenseChart";
import LoadingState from "@/components/LoadingState";
import MonthlySummary from "@/components/MonthlySummary";
import PageHeader from "@/components/PageHeader";
import PeriodPicker from "@/components/PeriodPicker";
import RecentTransactions from "@/components/RecentTransactions";
import StatCard from "@/components/StatCard";
import TransactionDialog from "@/components/TransactionDialog";
import {
  filterTransactions,
  getExpenseBreakdown,
  getIncomeExpenseSeries,
  getMonthlySummary,
  getTotals,
  sortNewestFirst,
} from "@/lib/calculations";
import {
  createPeriod,
  formatPeriodLabel,
  getPeriodRange,
  startOfMonth,
  todayISO,
} from "@/lib/dates";
import { formatPercent, formatPeso } from "@/lib/format";
import { budgetActions, useBudgetData } from "@/lib/store";
import type { Period } from "@/types/budget";

const RECENT_COUNT = 6;
const SUMMARY_MONTHS = 6;

export default function Dashboard() {
  const data = useBudgetData();
  const [selectedPeriod, setSelectedPeriod] = useState<Period | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const header = (
    <PageHeader
      title="Dashboard"
      description="See how much you earn, how much you spend and how much is left."
      actions={
        data && (
          <button type="button" className="button primary" onClick={() => setDialogOpen(true)}>
            Add transaction
          </button>
        )
      }
    />
  );

  if (!data) {
    return (
      <>
        {header}
        <LoadingState />
      </>
    );
  }

  const today = todayISO();
  const period = selectedPeriod ?? createPeriod("month", today);
  const range = getPeriodRange(period);
  const periodLabel = formatPeriodLabel(period);

  const transactions = filterTransactions(data.transactions, { range });
  const totals = getTotals(transactions);
  const breakdown = getExpenseBreakdown(transactions, data.categories);
  const largest = breakdown[0];
  const series = getIncomeExpenseSeries(transactions, range);
  const recent = sortNewestFirst(transactions).slice(0, RECENT_COUNT);
  const summaryEnd = range?.end ?? today;
  const months = getMonthlySummary(data.transactions, summaryEnd, SUMMARY_MONTHS);
  const isOverspent = totals.balanceCentavos < 0;

  return (
    <>
      {header}

      {data.transactions.length === 0 ? (
        <EmptyState
          title="No transactions yet"
          message="Add your first income or expense, or load sample data to see how the dashboard works."
        >
          <button type="button" className="button primary" onClick={() => setDialogOpen(true)}>
            Add transaction
          </button>
          <button type="button" className="button secondary" onClick={budgetActions.loadSampleData}>
            Load sample data
          </button>
        </EmptyState>
      ) : (
        <>
          <div className="filter-row">
            <PeriodPicker period={period} today={today} onChange={setSelectedPeriod} />
          </div>

          <section className="stat-grid" aria-label={`Summary for ${periodLabel}`}>
            <StatCard
              label="Total income"
              value={formatPeso(totals.incomeCentavos)}
              detail={periodLabel}
            />
            <StatCard
              label="Total expenses"
              value={formatPeso(totals.expenseCentavos)}
              detail={periodLabel}
            />
            <StatCard
              label="Remaining balance"
              value={formatPeso(totals.balanceCentavos)}
              detail={isOverspent ? "You spent more than you earned" : "Income minus expenses"}
              tone={isOverspent ? "negative" : "default"}
            />
            <StatCard
              label="Largest expense category"
              value={largest ? largest.category.name : "None yet"}
              detail={
                largest
                  ? `${formatPeso(largest.totalCentavos)} · ${formatPercent(largest.share)} of expenses`
                  : "No expenses in this period"
              }
            />
          </section>

          <div className="dashboard-grid">
            <section className="card" aria-labelledby="breakdown-title">
              <div className="card-header">
                <h2 id="breakdown-title">Expense breakdown</h2>
                <span className="card-note">{periodLabel}</span>
              </div>
              <ExpenseBreakdown items={breakdown} totalCentavos={totals.expenseCentavos} />
            </section>

            <section className="card" aria-labelledby="comparison-title">
              <div className="card-header">
                <h2 id="comparison-title">Income vs. expenses</h2>
                <span className="card-note">{periodLabel}</span>
              </div>
              <IncomeExpenseChart series={series} />
            </section>

            <section className="card" aria-labelledby="recent-title">
              <div className="card-header">
                <h2 id="recent-title">Recent transactions</h2>
                <Link href="/transactions" className="text-link">
                  View all
                </Link>
              </div>
              {recent.length > 0 ? (
                <RecentTransactions transactions={recent} categories={data.categories} />
              ) : (
                <EmptyState
                  compact
                  title="No transactions in this period"
                  message="Pick another period or add a transaction."
                />
              )}
            </section>

            <section className="card" aria-labelledby="monthly-title">
              <div className="card-header">
                <h2 id="monthly-title">Monthly summary</h2>
                <span className="card-note">Last {SUMMARY_MONTHS} months</span>
              </div>
              <MonthlySummary months={months} highlightMonth={startOfMonth(summaryEnd)} />
            </section>
          </div>
        </>
      )}

      <TransactionDialog
        open={dialogOpen}
        transaction={null}
        categories={data.categories}
        defaultDate={today}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
}
