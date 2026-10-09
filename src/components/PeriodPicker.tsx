import { formatPeriodLabel, getPeriodRange, isInRange, shiftPeriod } from "@/lib/dates";
import type { Period, PeriodMode } from "@/types/budget";

const MODE_LABELS: Record<PeriodMode, string> = {
  all: "All time",
  day: "Day",
  week: "Week",
  month: "Month",
  custom: "Custom",
};

const STEP_NAMES: Partial<Record<PeriodMode, string>> = {
  day: "day",
  week: "week",
  month: "month",
};

type PeriodPickerProps = {
  period: Period;
  today: string;
  onChange: (period: Period) => void;
  includeAllTime?: boolean;
};

export default function PeriodPicker({
  period,
  today,
  onChange,
  includeAllTime = false,
}: PeriodPickerProps) {
  const modes: PeriodMode[] = includeAllTime
    ? ["all", "day", "week", "month", "custom"]
    : ["day", "week", "month", "custom"];
  const range = getPeriodRange(period);
  const stepName = STEP_NAMES[period.mode];
  const showToday = stepName !== undefined && range !== null && !isInRange(today, range);

  function changeCustomDate(field: "customStart" | "customEnd", value: string) {
    if (value) onChange({ ...period, [field]: value });
  }

  return (
    <div className="period-picker">
      <div className="segmented" role="group" aria-label="Time period">
        {modes.map((mode) => (
          <button
            key={mode}
            type="button"
            className="segmented-option"
            aria-pressed={period.mode === mode}
            onClick={() => onChange({ ...period, mode })}
          >
            {MODE_LABELS[mode]}
          </button>
        ))}
      </div>

      {stepName && (
        <div className="period-stepper">
          <button
            type="button"
            className="icon-button"
            aria-label={`Previous ${stepName}`}
            onClick={() => onChange(shiftPeriod(period, -1))}
          >
            ‹
          </button>
          <span className="period-label" aria-live="polite">
            {formatPeriodLabel(period)}
          </span>
          <button
            type="button"
            className="icon-button"
            aria-label={`Next ${stepName}`}
            onClick={() => onChange(shiftPeriod(period, 1))}
          >
            ›
          </button>
          {showToday && (
            <button
              type="button"
              className="button ghost small"
              onClick={() => onChange({ ...period, anchor: today })}
            >
              Today
            </button>
          )}
        </div>
      )}

      {period.mode === "custom" && (
        <div className="custom-range">
          <label className="inline-field">
            <span>From</span>
            <input
              type="date"
              value={period.customStart}
              onChange={(event) => changeCustomDate("customStart", event.target.value)}
            />
          </label>
          <label className="inline-field">
            <span>To</span>
            <input
              type="date"
              value={period.customEnd}
              onChange={(event) => changeCustomDate("customEnd", event.target.value)}
            />
          </label>
        </div>
      )}
    </div>
  );
}
