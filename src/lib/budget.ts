import { DEFAULT_CATEGORIES, FALLBACK_CATEGORY_ID } from "@/lib/categories";
import { isValidISODate } from "@/lib/dates";
import type {
  BudgetData,
  Category,
  Transaction,
  TransactionInput,
  TransactionType,
} from "@/types/budget";

export function addTransaction(data: BudgetData, transaction: Transaction): BudgetData {
  return { ...data, transactions: [...data.transactions, transaction] };
}

export function updateTransaction(
  data: BudgetData,
  id: string,
  input: TransactionInput,
): BudgetData {
  return {
    ...data,
    transactions: data.transactions.map((transaction) =>
      transaction.id === id ? { ...transaction, ...input } : transaction,
    ),
  };
}

export function deleteTransaction(data: BudgetData, id: string): BudgetData {
  return {
    ...data,
    transactions: data.transactions.filter((transaction) => transaction.id !== id),
  };
}

export function addCategory(data: BudgetData, category: Category): BudgetData {
  return { ...data, categories: [...data.categories, category] };
}

export function deleteCategory(data: BudgetData, id: string): BudgetData {
  const category = data.categories.find((item) => item.id === id);
  if (!category || !category.isCustom) return data;

  const fallbackId = FALLBACK_CATEGORY_ID[category.type];
  return {
    categories: data.categories.filter((item) => item.id !== id),
    transactions: data.transactions.map((transaction) =>
      transaction.categoryId === id ? { ...transaction, categoryId: fallbackId } : transaction,
    ),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isTransactionType(value: unknown): value is TransactionType {
  return value === "income" || value === "expense";
}

function isCategory(value: unknown): value is Category {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    value.name.trim() !== "" &&
    isTransactionType(value.type) &&
    typeof value.isCustom === "boolean"
  );
}

function isTransaction(value: unknown): value is Transaction {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.amountCentavos === "number" &&
    Number.isSafeInteger(value.amountCentavos) &&
    value.amountCentavos > 0 &&
    typeof value.date === "string" &&
    isValidISODate(value.date) &&
    isTransactionType(value.type) &&
    typeof value.categoryId === "string" &&
    typeof value.notes === "string" &&
    typeof value.createdAt === "number"
  );
}

export function parseBudgetData(value: unknown): BudgetData | null {
  if (
    !isRecord(value) ||
    !Array.isArray(value.transactions) ||
    !Array.isArray(value.categories)
  ) {
    return null;
  }

  const defaultIds = new Set(DEFAULT_CATEGORIES.map((category) => category.id));
  const customCategories = value.categories
    .filter(isCategory)
    .filter((category) => category.isCustom && !defaultIds.has(category.id));
  const categories = [...DEFAULT_CATEGORIES, ...customCategories];

  const categoryTypes = new Map(categories.map((category) => [category.id, category.type]));
  const transactions = value.transactions
    .filter(isTransaction)
    .map((transaction) =>
      categoryTypes.get(transaction.categoryId) === transaction.type
        ? transaction
        : { ...transaction, categoryId: FALLBACK_CATEGORY_ID[transaction.type] },
    );

  return { categories, transactions };
}
