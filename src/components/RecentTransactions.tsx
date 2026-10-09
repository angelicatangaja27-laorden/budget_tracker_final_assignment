import { formatDate } from "@/lib/dates";
import { formatSignedPeso } from "@/lib/format";
import type { Category, Transaction } from "@/types/budget";

type RecentTransactionsProps = {
  transactions: Transaction[];
  categories: Category[];
};

export default function RecentTransactions({ transactions, categories }: RecentTransactionsProps) {
  const categoryNames = new Map(categories.map((category) => [category.id, category.name]));

  return (
    <ul className="recent-list">
      {transactions.map((transaction) => (
        <li key={transaction.id} className="recent-item">
          <div>
            <p className="tx-name">{transaction.name}</p>
            <p className="tx-meta">
              {categoryNames.get(transaction.categoryId) ?? "Uncategorized"} ·{" "}
              {formatDate(transaction.date)}
            </p>
          </div>
          <p className={`amount ${transaction.type}`}>
            {formatSignedPeso(transaction.amountCentavos, transaction.type)}
          </p>
        </li>
      ))}
    </ul>
  );
}
