export type TransactionType = "income" | "expense";

export type Category = {
  id: string;
  name: string;
  type: TransactionType;
  isCustom: boolean;
};

export type Transaction = {
  id: string;
  name: string;
  amountCentavos: number;
  date: string;
  type: TransactionType;
  categoryId: string;
  notes: string;
  createdAt: number;
};

export type TransactionInput = Omit<Transaction, "id" | "createdAt">;

export type BudgetData = {
  transactions: Transaction[];
  categories: Category[];
};

export type DateRange = {
  start: string;
  end: string;
};

export type PeriodMode = "all" | "day" | "week" | "month" | "custom";

export type Period = {
  mode: PeriodMode;
  anchor: string;
  customStart: string;
  customEnd: string;
};
