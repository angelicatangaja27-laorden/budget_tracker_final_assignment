import { useSyncExternalStore } from "react";
import {
  addCategory,
  addTransaction,
  deleteCategory,
  deleteTransaction,
  parseBudgetData,
  updateTransaction,
} from "@/lib/budget";
import { todayISO } from "@/lib/dates";
import { createSampleData, createSampleTransactions } from "@/lib/sample-data";
import type { BudgetData, TransactionInput, TransactionType } from "@/types/budget";

const STORAGE_KEY = "budget-tracker-data";
const UNREADABLE_DATA_KEY = "budget-tracker-data-unreadable";

let cache: BudgetData | null = null;
const listeners = new Set<() => void>();

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    console.warn("Budget data could not be saved in this browser.", error);
  }
}

function parseSaved(text: string): BudgetData | null {
  try {
    return parseBudgetData(JSON.parse(text));
  } catch {
    return null;
  }
}

function load(): BudgetData {
  const saved = readStorage(STORAGE_KEY);

  if (saved !== null) {
    const parsed = parseSaved(saved);
    if (parsed) return parsed;
    writeStorage(UNREADABLE_DATA_KEY, saved);
  }

  const sample = createSampleData(todayISO());
  writeStorage(STORAGE_KEY, JSON.stringify(sample));
  return sample;
}

function getSnapshot(): BudgetData {
  cache ??= load();
  return cache;
}

function getServerSnapshot(): null {
  return null;
}

function notify(): void {
  for (const listener of listeners) listener();
}

function handleStorageEvent(event: StorageEvent): void {
  if (event.key !== STORAGE_KEY && event.key !== null) return;
  cache = null;
  notify();
}

function subscribe(listener: () => void): () => void {
  if (listeners.size === 0) window.addEventListener("storage", handleStorageEvent);
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", handleStorageEvent);
  };
}

function update(change: (data: BudgetData) => BudgetData): void {
  cache = change(getSnapshot());
  writeStorage(STORAGE_KEY, JSON.stringify(cache));
  notify();
}

function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function useBudgetData(): BudgetData | null {
  return useSyncExternalStore<BudgetData | null>(subscribe, getSnapshot, getServerSnapshot);
}

export const budgetActions = {
  addTransaction(input: TransactionInput) {
    update((data) => addTransaction(data, { ...input, id: createId(), createdAt: Date.now() }));
  },
  updateTransaction(id: string, input: TransactionInput) {
    update((data) => updateTransaction(data, id, input));
  },
  deleteTransaction(id: string) {
    update((data) => deleteTransaction(data, id));
  },
  clearTransactions() {
    update((data) => ({ ...data, transactions: [] }));
  },
  loadSampleData() {
    update((data) => ({ ...data, transactions: createSampleTransactions(todayISO()) }));
  },
  addCategory(name: string, type: TransactionType) {
    update((data) =>
      addCategory(data, { id: `custom-${createId()}`, name, type, isCustom: true }),
    );
  },
  deleteCategory(id: string) {
    update((data) => deleteCategory(data, id));
  },
};
