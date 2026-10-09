import { isValidISODate } from "@/lib/dates";
import { parsePesoInput } from "@/lib/format";
import type { Category, TransactionInput, TransactionType } from "@/types/budget";

export const LIMITS = {
  nameLength: 60,
  notesLength: 200,
  categoryNameLength: 40,
  maxAmountCentavos: 100_000_000_000,
};

export type TransactionFormValues = {
  type: TransactionType;
  name: string;
  amount: string;
  date: string;
  categoryId: string;
  notes: string;
};

export type CategoryFormValues = {
  name: string;
  type: TransactionType;
};

export type FormErrors<Values> = Partial<Record<keyof Values, string>>;

export type ValidationResult<Values, Output> =
  | { ok: true; value: Output }
  | { ok: false; errors: FormErrors<Values> };

export function validateTransaction(
  values: TransactionFormValues,
  categories: Category[],
): ValidationResult<TransactionFormValues, TransactionInput> {
  const errors: FormErrors<TransactionFormValues> = {};
  const name = values.name.trim();
  const notes = values.notes.trim();
  const amountCentavos = parsePesoInput(values.amount);
  const category = categories.find(
    (item) => item.id === values.categoryId && item.type === values.type,
  );

  if (!name) {
    errors.name = "Enter a name for this transaction.";
  } else if (name.length > LIMITS.nameLength) {
    errors.name = `Use ${LIMITS.nameLength} characters or fewer.`;
  }

  if (!values.amount.trim()) {
    errors.amount = "Enter an amount.";
  } else if (amountCentavos === null) {
    errors.amount = "Enter a number like 250 or 1,299.50 (up to 2 decimal places).";
  } else if (amountCentavos === 0) {
    errors.amount = "Enter an amount greater than ₱0.";
  } else if (amountCentavos > LIMITS.maxAmountCentavos) {
    errors.amount = "Enter an amount up to ₱1,000,000,000.";
  }

  if (!values.date) {
    errors.date = "Choose a date.";
  } else if (!isValidISODate(values.date)) {
    errors.date = "Choose a valid date.";
  }

  if (!category) {
    errors.categoryId = "Choose a category.";
  }

  if (notes.length > LIMITS.notesLength) {
    errors.notes = `Use ${LIMITS.notesLength} characters or fewer.`;
  }

  if (amountCentavos === null || !category || Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      type: values.type,
      name,
      amountCentavos,
      date: values.date,
      categoryId: category.id,
      notes,
    },
  };
}

export function validateCategory(
  values: CategoryFormValues,
  categories: Category[],
): ValidationResult<CategoryFormValues, CategoryFormValues> {
  const name = values.name.trim().replace(/\s+/g, " ");
  const isDuplicate = categories.some(
    (category) =>
      category.type === values.type && category.name.toLowerCase() === name.toLowerCase(),
  );

  if (!name) {
    return { ok: false, errors: { name: "Enter a category name." } };
  }
  if (name.length > LIMITS.categoryNameLength) {
    return {
      ok: false,
      errors: { name: `Use ${LIMITS.categoryNameLength} characters or fewer.` },
    };
  }
  if (isDuplicate) {
    return {
      ok: false,
      errors: { name: `You already have an ${values.type} category called "${name}".` },
    };
  }

  return { ok: true, value: { name, type: values.type } };
}
