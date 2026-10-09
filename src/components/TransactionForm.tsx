import Link from "next/link";
import { useId, useState, type SubmitEvent } from "react";
import { categoriesOfType } from "@/lib/categories";
import { centavosToInput } from "@/lib/format";
import {
  LIMITS,
  validateTransaction,
  type FormErrors,
  type TransactionFormValues,
} from "@/lib/validation";
import type { Category, Transaction, TransactionInput, TransactionType } from "@/types/budget";

type TransactionFormProps = {
  transaction: Transaction | null;
  categories: Category[];
  defaultDate: string;
  onSubmit: (input: TransactionInput) => void;
  onCancel: () => void;
};

type FieldName = Exclude<keyof TransactionFormValues, "type">;

const FIELD_ORDER: FieldName[] = ["name", "amount", "date", "categoryId", "notes"];

const TYPE_OPTIONS: { value: TransactionType; label: string }[] = [
  { value: "expense", label: "Expense" },
  { value: "income", label: "Income" },
];

function firstCategoryId(categories: Category[], type: TransactionType): string {
  return categoriesOfType(categories, type)[0]?.id ?? "";
}

function getInitialValues(
  transaction: Transaction | null,
  categories: Category[],
  defaultDate: string,
): TransactionFormValues {
  if (transaction) {
    return {
      type: transaction.type,
      name: transaction.name,
      amount: centavosToInput(transaction.amountCentavos),
      date: transaction.date,
      categoryId: transaction.categoryId,
      notes: transaction.notes,
    };
  }

  return {
    type: "expense",
    name: "",
    amount: "",
    date: defaultDate,
    categoryId: firstCategoryId(categories, "expense"),
    notes: "",
  };
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="field-error">
      {message}
    </p>
  );
}

export default function TransactionForm({
  transaction,
  categories,
  defaultDate,
  onSubmit,
  onCancel,
}: TransactionFormProps) {
  const formId = useId();
  const [values, setValues] = useState(() =>
    getInitialValues(transaction, categories, defaultDate),
  );
  const [errors, setErrors] = useState<FormErrors<TransactionFormValues>>({});
  const typeCategories = categoriesOfType(categories, values.type);

  function fieldId(field: FieldName) {
    return `${formId}-${field}`;
  }

  function fieldProps(field: FieldName) {
    const hasError = Boolean(errors[field]);
    return {
      id: fieldId(field),
      name: field,
      "aria-invalid": hasError || undefined,
      "aria-describedby": hasError ? `${fieldId(field)}-error` : undefined,
    };
  }

  function updateField(field: FieldName, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function changeType(type: TransactionType) {
    setValues((current) => ({
      ...current,
      type,
      categoryId: firstCategoryId(categories, type),
    }));
    setErrors((current) => ({ ...current, categoryId: undefined }));
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validateTransaction(values, categories);

    if (!result.ok) {
      setErrors(result.errors);
      const firstInvalid = FIELD_ORDER.find((field) => result.errors[field]);
      const element = firstInvalid ? event.currentTarget.elements.namedItem(firstInvalid) : null;
      if (element instanceof HTMLElement) element.focus();
      return;
    }

    onSubmit(result.value);
  }

  return (
    <form className="transaction-form" onSubmit={handleSubmit} noValidate>
      <h2 id="transaction-dialog-title" className="dialog-title">
        {transaction ? "Edit transaction" : "Add transaction"}
      </h2>

      <fieldset className="field">
        <legend className="field-label">Type</legend>
        <div className="type-toggle">
          {TYPE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={values.type === option.value ? "type-option selected" : "type-option"}
            >
              <input
                type="radio"
                name="type"
                value={option.value}
                checked={values.type === option.value}
                onChange={() => changeType(option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="field">
        <label className="field-label" htmlFor={fieldId("name")}>
          Name
        </label>
        <input
          type="text"
          {...fieldProps("name")}
          value={values.name}
          onChange={(event) => updateField("name", event.target.value)}
          maxLength={LIMITS.nameLength}
          placeholder={values.type === "expense" ? "e.g. Groceries" : "e.g. Monthly salary"}
          autoComplete="off"
        />
        <FieldError id={`${fieldId("name")}-error`} message={errors.name} />
      </div>

      <div className="field-row">
        <div className="field">
          <label className="field-label" htmlFor={fieldId("amount")}>
            Amount (₱)
          </label>
          <div className="amount-input">
            <span aria-hidden="true">₱</span>
            <input
              type="text"
              inputMode="decimal"
              {...fieldProps("amount")}
              value={values.amount}
              onChange={(event) => updateField("amount", event.target.value)}
              placeholder="0.00"
              autoComplete="off"
            />
          </div>
          <FieldError id={`${fieldId("amount")}-error`} message={errors.amount} />
        </div>

        <div className="field">
          <label className="field-label" htmlFor={fieldId("date")}>
            Date
          </label>
          <input
            type="date"
            {...fieldProps("date")}
            value={values.date}
            onChange={(event) => updateField("date", event.target.value)}
          />
          <FieldError id={`${fieldId("date")}-error`} message={errors.date} />
        </div>
      </div>

      <div className="field">
        <label className="field-label" htmlFor={fieldId("categoryId")}>
          Category
        </label>
        <select
          {...fieldProps("categoryId")}
          value={values.categoryId}
          onChange={(event) => updateField("categoryId", event.target.value)}
        >
          {typeCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <FieldError id={`${fieldId("categoryId")}-error`} message={errors.categoryId} />
        <p className="field-hint">
          Need another category? <Link href="/categories">Create a custom one</Link>.
        </p>
      </div>

      <div className="field">
        <label className="field-label" htmlFor={fieldId("notes")}>
          Notes <span className="optional">(optional)</span>
        </label>
        <textarea
          {...fieldProps("notes")}
          rows={3}
          value={values.notes}
          onChange={(event) => updateField("notes", event.target.value)}
          maxLength={LIMITS.notesLength}
          placeholder="Anything you want to remember about this transaction"
        />
        <FieldError id={`${fieldId("notes")}-error`} message={errors.notes} />
        <p className="field-hint">
          {values.notes.length}/{LIMITS.notesLength}
        </p>
      </div>

      <div className="form-actions">
        <button type="button" className="button secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="button primary">
          {transaction ? "Save changes" : "Add transaction"}
        </button>
      </div>
    </form>
  );
}
