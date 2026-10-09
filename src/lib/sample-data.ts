import { DEFAULT_CATEGORIES } from "@/lib/categories";
import { addMonths, endOfMonth, parseISODate, startOfMonth } from "@/lib/dates";
import type { BudgetData, Transaction, TransactionType } from "@/types/budget";

type SampleEntry = {
  day: number;
  name: string;
  pesos: number;
  type: TransactionType;
  categoryId: string;
  notes?: string;
  monthsAgo?: number[];
};

const MONTHS_OF_HISTORY = 6;
const MONTHLY_VARIATION = [1, 0.96, 1.07, 0.93, 1.04, 0.98];

const SAMPLE_ENTRIES: SampleEntry[] = [
  { day: 2, name: "Weekly groceries", pesos: 2350, type: "expense", categoryId: "food", notes: "Rice, eggs and vegetables" },
  { day: 3, name: "Freelance logo design", pesos: 6500, type: "income", categoryId: "freelance", notes: "Client project", monthsAgo: [0, 2, 4] },
  { day: 3, name: "Jeepney and MRT fare", pesos: 620, type: "expense", categoryId: "transportation", notes: "Weekly commute" },
  { day: 5, name: "Apartment rent", pesos: 12000, type: "expense", categoryId: "housing" },
  { day: 7, name: "Electricity bill", pesos: 2850, type: "expense", categoryId: "bills" },
  { day: 8, name: "Water bill", pesos: 480, type: "expense", categoryId: "bills" },
  { day: 9, name: "Weekend groceries", pesos: 1870, type: "expense", categoryId: "food" },
  { day: 10, name: "Salary (1st cutoff)", pesos: 22500, type: "income", categoryId: "salary" },
  { day: 10, name: "Fiber internet", pesos: 1699, type: "expense", categoryId: "bills" },
  { day: 13, name: "Movie night", pesos: 780, type: "expense", categoryId: "entertainment" },
  { day: 16, name: "Grab rides", pesos: 960, type: "expense", categoryId: "transportation" },
  { day: 17, name: "Pharmacy", pesos: 640, type: "expense", categoryId: "healthcare", notes: "Vitamins and medicine" },
  { day: 18, name: "Online course", pesos: 1200, type: "expense", categoryId: "education", notes: "Excel for beginners", monthsAgo: [1, 3] },
  { day: 20, name: "MP2 savings", pesos: 5000, type: "expense", categoryId: "savings", notes: "Monthly Pag-IBIG MP2 contribution" },
  { day: 21, name: "Groceries", pesos: 2140, type: "expense", categoryId: "food" },
  { day: 23, name: "Running shoes", pesos: 2499, type: "expense", categoryId: "shopping", monthsAgo: [2] },
  { day: 24, name: "Birthday gift from Tita", pesos: 2000, type: "income", categoryId: "gifts", monthsAgo: [3] },
  { day: 25, name: "Salary (2nd cutoff)", pesos: 22500, type: "income", categoryId: "salary" },
  { day: 26, name: "Lunch with friends", pesos: 1150, type: "expense", categoryId: "food" },
  { day: 27, name: "Streaming subscriptions", pesos: 549, type: "expense", categoryId: "entertainment" },
  { day: 28, name: "LPG refill", pesos: 1050, type: "expense", categoryId: "bills", monthsAgo: [0, 2, 4] },
];

export function createSampleTransactions(today: string): Transaction[] {
  const transactions: Transaction[] = [];

  for (let monthsAgo = MONTHS_OF_HISTORY - 1; monthsAgo >= 0; monthsAgo--) {
    const monthStart = startOfMonth(addMonths(today, -monthsAgo));
    const lastDay = Number(endOfMonth(monthStart).slice(8));
    const variation = MONTHLY_VARIATION[monthsAgo];

    SAMPLE_ENTRIES.forEach((entry, index) => {
      if (entry.monthsAgo && !entry.monthsAgo.includes(monthsAgo)) return;

      const day = String(Math.min(entry.day, lastDay)).padStart(2, "0");
      const date = `${monthStart.slice(0, 8)}${day}`;
      if (date > today) return;

      const pesos =
        entry.type === "expense" ? Math.round(entry.pesos * variation) : entry.pesos;

      transactions.push({
        id: `sample-${monthStart.slice(0, 7)}-${index}`,
        name: entry.name,
        amountCentavos: pesos * 100,
        date,
        type: entry.type,
        categoryId: entry.categoryId,
        notes: entry.notes ?? "",
        createdAt: parseISODate(date).getTime() + index,
      });
    });
  }

  return transactions;
}

export function createSampleData(today: string): BudgetData {
  return {
    categories: [...DEFAULT_CATEGORIES],
    transactions: createSampleTransactions(today),
  };
}
