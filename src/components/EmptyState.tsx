import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  message: string;
  compact?: boolean;
  children?: ReactNode;
};

export default function EmptyState({ title, message, compact = false, children }: EmptyStateProps) {
  return (
    <div className={compact ? "empty-state compact" : "empty-state"}>
      <p className="empty-title">{title}</p>
      <p className="empty-message">{message}</p>
      {children && <div className="empty-actions">{children}</div>}
    </div>
  );
}
