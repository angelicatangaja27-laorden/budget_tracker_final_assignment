import type { DateRange, Period, PeriodMode } from "@/types/budget";

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

const fullDateFormat = new Intl.DateTimeFormat("en-PH", {
  month: "short",
  day: "numeric",
  year: "numeric",
});
const shortDateFormat = new Intl.DateTimeFormat("en-PH", {
  month: "short",
  day: "numeric",
});
const monthYearFormat = new Intl.DateTimeFormat("en-PH", {
  month: "long",
  year: "numeric",
});
const shortMonthYearFormat = new Intl.DateTimeFormat("en-PH", {
  month: "short",
  year: "numeric",
});
const shortMonthFormat = new Intl.DateTimeFormat("en-PH", { month: "short" });

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function parseISODate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function isValidISODate(value: string): boolean {
  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function addDays(iso: string, days: number): string {
  const date = parseISODate(iso);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

export function addMonths(iso: string, months: number): string {
  const date = parseISODate(iso);
  const day = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + months);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(day, lastDay));
  return toISODate(date);
}

export function startOfWeek(iso: string): string {
  const daysSinceMonday = (parseISODate(iso).getDay() + 6) % 7;
  return addDays(iso, -daysSinceMonday);
}

export function startOfMonth(iso: string): string {
  return `${iso.slice(0, 7)}-01`;
}

export function endOfMonth(iso: string): string {
  const date = parseISODate(iso);
  return toISODate(new Date(date.getFullYear(), date.getMonth() + 1, 0));
}

export function earlierDate(a: string, b: string): string {
  return a < b ? a : b;
}

export function daysInRange(range: DateRange): number {
  const difference =
    parseISODate(range.end).getTime() - parseISODate(range.start).getTime();
  return Math.round(difference / DAY_IN_MS) + 1;
}

export function isInRange(date: string, range: DateRange): boolean {
  return date >= range.start && date <= range.end;
}

export function createPeriod(mode: PeriodMode, today: string): Period {
  return {
    mode,
    anchor: today,
    customStart: startOfMonth(today),
    customEnd: today,
  };
}

export function getPeriodRange(period: Period): DateRange | null {
  switch (period.mode) {
    case "all":
      return null;
    case "day":
      return { start: period.anchor, end: period.anchor };
    case "week": {
      const start = startOfWeek(period.anchor);
      return { start, end: addDays(start, 6) };
    }
    case "month":
      return { start: startOfMonth(period.anchor), end: endOfMonth(period.anchor) };
    case "custom": {
      const [start, end] = [period.customStart, period.customEnd].sort();
      return { start, end };
    }
  }
}

export function shiftPeriod(period: Period, step: number): Period {
  switch (period.mode) {
    case "day":
      return { ...period, anchor: addDays(period.anchor, step) };
    case "week":
      return { ...period, anchor: addDays(period.anchor, step * 7) };
    case "month":
      return { ...period, anchor: addMonths(period.anchor, step) };
    default:
      return period;
  }
}

export function formatDate(iso: string): string {
  return fullDateFormat.format(parseISODate(iso));
}

export function formatShortDate(iso: string): string {
  return shortDateFormat.format(parseISODate(iso));
}

export function formatMonth(iso: string): string {
  return monthYearFormat.format(parseISODate(iso));
}

export function formatShortMonth(iso: string, includeYear: boolean): string {
  const format = includeYear ? shortMonthYearFormat : shortMonthFormat;
  return format.format(parseISODate(iso));
}

export function formatDateRange(range: DateRange): string {
  return fullDateFormat.formatRange(parseISODate(range.start), parseISODate(range.end));
}

export function formatShortDateRange(range: DateRange): string {
  return shortDateFormat.formatRange(parseISODate(range.start), parseISODate(range.end));
}

export function formatPeriodLabel(period: Period): string {
  const range = getPeriodRange(period);
  if (!range) return "All time";
  if (period.mode === "month") return formatMonth(range.start);
  return formatDateRange(range);
}
