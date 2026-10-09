import type { Category, TransactionType } from "@/types/budget";

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "food", name: "Food and Groceries", type: "expense", isCustom: false },
  { id: "transportation", name: "Transportation", type: "expense", isCustom: false },
  { id: "bills", name: "Bills and Utilities", type: "expense", isCustom: false },
  { id: "housing", name: "Housing and Rent", type: "expense", isCustom: false },
  { id: "shopping", name: "Shopping", type: "expense", isCustom: false },
  { id: "healthcare", name: "Healthcare", type: "expense", isCustom: false },
  { id: "entertainment", name: "Entertainment", type: "expense", isCustom: false },
  { id: "education", name: "Education", type: "expense", isCustom: false },
  { id: "savings", name: "Savings and Investments", type: "expense", isCustom: false },
  { id: "other-expense", name: "Other Expenses", type: "expense", isCustom: false },
  { id: "salary", name: "Salary", type: "income", isCustom: false },
  { id: "business", name: "Business", type: "income", isCustom: false },
  { id: "freelance", name: "Freelance", type: "income", isCustom: false },
  { id: "allowance", name: "Allowance", type: "income", isCustom: false },
  { id: "gifts", name: "Gifts", type: "income", isCustom: false },
  { id: "other-income", name: "Other Income", type: "income", isCustom: false },
];

export const FALLBACK_CATEGORY_ID: Record<TransactionType, string> = {
  expense: "other-expense",
  income: "other-income",
};

export function categoriesOfType(categories: Category[], type: TransactionType): Category[] {
  return categories.filter((category) => category.type === type);
}
