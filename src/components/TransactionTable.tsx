import { formatDate } from "@/lib/dates";
import { formatSignedPeso } from "@/lib/format";
import type { Category, Transaction } from "@/types/budget";

type TransactionTableProps = {
  transactions: Transaction[];
  categories: Category[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
};

export default function TransactionTable({
  transactions,
  categories,
  onEdit,
  onDelete,
}: TransactionTableProps) {
  const categoryNames = new Map(categories.map((category) => [category.id, category.name]));

  return (
    <table className="transaction-table">
      <thead>
        <tr>
          <th scope="col">Date</th>
          <th scope="col">Transaction</th>
          <th scope="col">Category</th>
          <th scope="col" className="numeric">
            Amount
          </th>
          <th scope="col">
            <span className="visually-hidden">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((transaction) => (
          <tr key={transaction.id}>
            <td className="cell-date">{formatDate(transaction.date)}</td>
            <td className="cell-name">
              <span className="tx-name">{transaction.name}</span>
              {transaction.notes && <span className="tx-notes">{transaction.notes}</span>}
            </td>
            <td className="cell-category">
              <span className={`type-pill ${transaction.type}`}>
                {transaction.type === "income" ? "Income" : "Expense"}
              </span>
              {categoryNames.get(transaction.categoryId) ?? "Uncategorized"}
            </td>
            <td className={`cell-amount numeric amount ${transaction.type}`}>
              {formatSignedPeso(transaction.amountCentavos, transaction.type)}
            </td>
            <td className="cell-actions">
              <button
                type="button"
                className="button ghost small"
                aria-label={`Edit ${transaction.name}`}
                onClick={() => onEdit(transaction)}
              >
                Edit
              </button>
              <button
                type="button"
                className="button ghost small danger"
                aria-label={`Delete ${transaction.name}`}
                onClick={() => onDelete(transaction)}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
