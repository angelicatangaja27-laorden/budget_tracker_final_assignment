"use client";

import { useState } from "react";
import CategoryForm from "@/components/CategoryForm";
import CategoryTable from "@/components/CategoryTable";
import LoadingState from "@/components/LoadingState";
import PageHeader from "@/components/PageHeader";
import PeriodPicker from "@/components/PeriodPicker";
import { filterTransactions, getCategoryTotals } from "@/lib/calculations";
import { FALLBACK_CATEGORY_ID } from "@/lib/categories";
import { createPeriod, getPeriodRange, todayISO } from "@/lib/dates";
import { budgetActions, useBudgetData } from "@/lib/store";
import type { Category, Period } from "@/types/budget";

export default function CategoriesView() {
  const data = useBudgetData();
  const [selectedPeriod, setSelectedPeriod] = useState<Period | null>(null);

  const header = (
    <PageHeader
      title="Categories"
      description="Organize your transactions and see where most of your money goes."
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
  const transactions = filterTransactions(data.transactions, { range: getPeriodRange(period) });
  const expenseTotals = getCategoryTotals(transactions, data.categories, "expense");
  const incomeTotals = getCategoryTotals(transactions, data.categories, "income");

  function confirmDelete(category: Category) {
    const allTransactions = data?.transactions ?? [];
    const usedBy = allTransactions.filter((item) => item.categoryId === category.id).length;
    const fallback = data?.categories.find(
      (item) => item.id === FALLBACK_CATEGORY_ID[category.type],
    );
    const message =
      usedBy > 0
        ? `Delete "${category.name}"? Its ${usedBy} ${usedBy === 1 ? "transaction" : "transactions"} will move to "${fallback?.name}".`
        : `Delete "${category.name}"?`;

    if (window.confirm(message)) budgetActions.deleteCategory(category.id);
  }

  return (
    <>
      {header}
      <CategoryForm categories={data.categories} />

      <div className="filter-row section-gap">
        <PeriodPicker period={period} today={today} onChange={setSelectedPeriod} includeAllTime />
      </div>

      <div className="category-grid">
        <CategoryTable
          title="Expense categories"
          description="Sorted by spending. Your top 3 are highlighted."
          totals={expenseTotals}
          highlightTop
          onDelete={confirmDelete}
        />
        <CategoryTable
          title="Income categories"
          description="Sorted by amount received."
          totals={incomeTotals}
          onDelete={confirmDelete}
        />
      </div>
    </>
  );
}
