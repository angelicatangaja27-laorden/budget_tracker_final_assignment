import { useId, useState, type SubmitEvent } from "react";
import { budgetActions } from "@/lib/store";
import { LIMITS, validateCategory, type CategoryFormValues } from "@/lib/validation";
import type { Category } from "@/types/budget";

type CategoryFormProps = {
  categories: Category[];
};

export default function CategoryForm({ categories }: CategoryFormProps) {
  const formId = useId();
  const [values, setValues] = useState<CategoryFormValues>({ name: "", type: "expense" });
  const [error, setError] = useState<string | undefined>();
  const [status, setStatus] = useState("");
  const errorId = `${formId}-error`;

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validateCategory(values, categories);

    if (!result.ok) {
      setError(result.errors.name);
      setStatus("");
      return;
    }

    budgetActions.addCategory(result.value.name, result.value.type);
    setValues({ ...values, name: "" });
    setError(undefined);
    setStatus(`Added "${result.value.name}" to your ${result.value.type} categories.`);
  }

  return (
    <section className="card" aria-labelledby={`${formId}-title`}>
      <h2 id={`${formId}-title`}>Add a custom category</h2>
      <form className="category-form" onSubmit={handleSubmit} noValidate>
        <div className="field grow">
          <label className="field-label" htmlFor={`${formId}-name`}>
            Category name
          </label>
          <input
            id={`${formId}-name`}
            type="text"
            value={values.name}
            onChange={(event) => {
              setValues({ ...values, name: event.target.value });
              setError(undefined);
            }}
            maxLength={LIMITS.categoryNameLength}
            placeholder="e.g. Pet care"
            autoComplete="off"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
          />
        </div>
        <div className="field">
          <label className="field-label" htmlFor={`${formId}-type`}>
            Type
          </label>
          <select
            id={`${formId}-type`}
            value={values.type}
            onChange={(event) =>
              setValues({ ...values, type: event.target.value === "income" ? "income" : "expense" })
            }
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
        <button type="submit" className="button primary">
          Add category
        </button>
      </form>
      {error && (
        <p id={errorId} className="field-error form-message">
          {error}
        </p>
      )}
      <p className="form-status" role="status">
        {status}
      </p>
    </section>
  );
}
