"use client";

import { useState } from "react";
import EmptyState from "@/components/EmptyState";
import LoadingState from "@/components/LoadingState";
import PageHeader from "@/components/PageHeader";
import PeriodPicker from "@/components/PeriodPicker";
import TransactionDialog from "@/components/TransactionDialog";
import TransactionTable from "@/components/TransactionTable";
import { filterTransactions, getTotals, sortNewestFirst } from "@/lib/calculations";
import { categoriesOfType } from "@/lib/categories";
import { createPeriod, getPeriodRange, todayISO } from "@/lib/dates";
import { formatPeso, formatSignedPeso } from "@/lib/format";
import { budgetActions, useBudgetData } from "@/lib/store";
import type { Period, Transaction, TransactionType } from "@/types/budget";

type TypeFilter = TransactionType | "all";

const TYPE_FILTERS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "income", label: "Income" },
  { value: "expense", label: "Expenses" },
];

export default function TransactionsView() {
  const data = useBudgetData();
  const [selectedPeriod, setSelectedPeriod] = useState<Period | null>(null);
  const [type, setType] = useState<TypeFilter>("all");
  const [categoryId, setCategoryId] = useState("all");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  function openNew() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(transaction: Transaction) {
    setEditing(transaction);
    setDialogOpen(true);
  }

  function confirmDelete(transaction: Transaction) {
    const amount = formatSignedPeso(transaction.amountCentavos, transaction.type);
    if (window.confirm(`Delete "${transaction.name}" (${amount})? This can't be undone.`)) {
      budgetActions.deleteTransaction(transaction.id);
    }
  }

  function confirmClearAll() {
    if (window.confirm("Delete all transactions? Your categories will be kept. This can't be undone.")) {
      budgetActions.clearTransactions();
    }
  }

  function changeType(next: TypeFilter) {
    setType(next);
    const selected = data?.categories.find((category) => category.id === categoryId);
    if (next !== "all" && selected && selected.type !== next) setCategoryId("all");
  }

  function clearFilters() {
    setSelectedPeriod(null);
    setType("all");
    setCategoryId("all");
    setSearch("");
  }

  const header = (
    <PageHeader
      title="Transactions"
      description="Add, edit and filter your income and expenses."
      actions={
        data && (
          <button type="button" className="button primary" onClick={openNew}>
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
  const period = selectedPeriod ?? createPeriod("all", today);
  const range = getPeriodRange(period);
  const filtered = sortNewestFirst(
    filterTransactions(data.transactions, { range, type, categoryId, search }),
  );
  const totals = getTotals(filtered);
  const filtersActive =
    period.mode !== "all" || type !== "all" || categoryId !== "all" || search.trim() !== "";
  const categoryGroups = (["expense", "income"] as const)
    .filter((groupType) => type === "all" || type === groupType)
    .map((groupType) => ({
      type: groupType,
      label: groupType === "expense" ? "Expense categories" : "Income categories",
      categories: categoriesOfType(data.categories, groupType),
    }));

  return (
    <>
      {header}

      {data.transactions.length === 0 ? (
        <EmptyState
          title="No transactions yet"
          message="Record your income and expenses here. You can also load sample data to try things out."
        >
          <button type="button" className="button primary" onClick={openNew}>
            Add transaction
          </button>
          <button type="button" className="button secondary" onClick={budgetActions.loadSampleData}>
            Load sample data
          </button>
        </EmptyState>
      ) : (
        <>
          <section className="card filter-panel" aria-label="Filters">
            <PeriodPicker period={period} today={today} onChange={setSelectedPeriod} includeAllTime />
            <div className="filter-controls">
              <div className="segmented" role="group" aria-label="Transaction type">
                {TYPE_FILTERS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className="segmented-option"
                    aria-pressed={type === option.value}
                    onClick={() => changeType(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <label className="inline-field">
                <span>Category</span>
                <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
                  <option value="all">All categories</option>
                  {categoryGroups.map((group) => (
                    <optgroup key={group.type} label={group.label}>
                      {group.categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </label>

              <label className="inline-field search-field">
                <span className="visually-hidden">Search transactions</span>
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by name or notes"
                />
              </label>

              {filtersActive && (
                <button type="button" className="button ghost small" onClick={clearFilters}>
                  Clear filters
                </button>
              )}
            </div>
          </section>

          <p className="results-summary" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? "transaction" : "transactions"} · Income{" "}
            {formatPeso(totals.incomeCentavos)} · Expenses {formatPeso(totals.expenseCentavos)} ·
            Balance {formatPeso(totals.balanceCentavos)}
          </p>

          {filtered.length > 0 ? (
            <div className="card table-card">
              <TransactionTable
                transactions={filtered}
                categories={data.categories}
                onEdit={openEdit}
                onDelete={confirmDelete}
              />
            </div>
          ) : (
            <EmptyState
              title="No matching transactions"
              message="Try a different period, type, category or search term."
            >
              <button type="button" className="button secondary" onClick={clearFilters}>
                Clear filters
              </button>
            </EmptyState>
          )}

          <div className="list-footer">
            <button type="button" className="button ghost small danger" onClick={confirmClearAll}>
              Delete all transactions
            </button>
          </div>
        </>
      )}

      <TransactionDialog
        open={dialogOpen}
        transaction={editing}
        categories={data.categories}
        defaultDate={today}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
}
