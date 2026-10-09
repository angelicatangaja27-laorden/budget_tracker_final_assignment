import type { ReactNode } from "react";

type ChartTooltipProps = {
  title: string;
  children: ReactNode;
};

type TooltipRowProps = {
  value: string;
  label: string;
  color?: string;
};

export function ChartTooltip({ title, children }: ChartTooltipProps) {
  return (
    <div className="chart-tooltip">
      <p className="tooltip-title">{title}</p>
      {children}
    </div>
  );
}

export function TooltipRow({ value, label, color }: TooltipRowProps) {
  return (
    <div className="tooltip-row">
      <span
        className="tooltip-key"
        style={{ background: color ?? "transparent" }}
        aria-hidden="true"
      />
      <span className="tooltip-value">{value}</span>
      <span className="tooltip-label">{label}</span>
    </div>
  );
}
