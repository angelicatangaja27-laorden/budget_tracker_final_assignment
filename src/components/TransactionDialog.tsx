import { useEffect, useRef } from "react";
import TransactionForm from "@/components/TransactionForm";
import { budgetActions } from "@/lib/store";
import type { Category, Transaction, TransactionInput } from "@/types/budget";

type TransactionDialogProps = {
  open: boolean;
  transaction: Transaction | null;
  categories: Category[];
  defaultDate: string;
  onClose: () => void;
};

export default function TransactionDialog({
  open,
  transaction,
  categories,
  defaultDate,
  onClose,
}: TransactionDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function handleSubmit(input: TransactionInput) {
    if (transaction) budgetActions.updateTransaction(transaction.id, input);
    else budgetActions.addTransaction(input);
    onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      className="dialog"
      aria-labelledby="transaction-dialog-title"
      onClose={onClose}
    >
      {open && (
        <TransactionForm
          key={transaction?.id ?? "new"}
          transaction={transaction}
          categories={categories}
          defaultDate={defaultDate}
          onSubmit={handleSubmit}
          onCancel={onClose}
        />
      )}
    </dialog>
  );
}
