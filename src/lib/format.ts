import type { TransactionType } from "@/types/budget";

const AMOUNT_PATTERN = /^(\d+)(?:\.(\d{0,2}))?$/;

const pesoFormat = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
});
const compactPesoFormat = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  notation: "compact",
  maximumFractionDigits: 1,
});
const percentFormat = new Intl.NumberFormat("en-PH", {
  style: "percent",
  maximumFractionDigits: 1,
});

export function formatPeso(centavos: number): string {
  return pesoFormat.format(centavos / 100);
}

export function formatPesoCompact(centavos: number): string {
  return compactPesoFormat.format(centavos / 100);
}

export function formatSignedPeso(centavos: number, type: TransactionType): string {
  const sign = type === "income" ? "+" : "−";
  return `${sign}${formatPeso(centavos)}`;
}

export function formatPercent(share: number): string {
  return percentFormat.format(share);
}

export function parsePesoInput(text: string): number | null {
  const cleaned = text.replace(/[\s,₱]/g, "");
  const match = AMOUNT_PATTERN.exec(cleaned);
  if (!match) return null;

  const pesos = Number(match[1]);
  const centavos = Number((match[2] ?? "").padEnd(2, "0"));
  return pesos * 100 + centavos;
}

export function centavosToInput(centavos: number): string {
  return (centavos / 100).toFixed(2);
}
