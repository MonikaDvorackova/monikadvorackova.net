export const TIME_PERIODS = ["morning", "day", "evening", "night"] as const;

export type TimePeriod = (typeof TIME_PERIODS)[number];

/** Period boundaries in local hours: [startInclusive, endExclusive). */
const PERIOD_RANGES: ReadonlyArray<{
  period: TimePeriod;
  startHour: number;
  endHour: number;
}> = [
  { period: "morning", startHour: 5, endHour: 9 },
  { period: "day", startHour: 9, endHour: 17 },
  { period: "evening", startHour: 17, endHour: 21 },
  // night wraps midnight: 21→24 and 0→5
  { period: "night", startHour: 21, endHour: 5 },
];

/** Local-hour boundaries where the period changes (ascending). */
const BOUNDARY_HOURS = [5, 9, 17, 21] as const;

export function isTimePeriod(value: unknown): value is TimePeriod {
  return (
    typeof value === "string" &&
    (TIME_PERIODS as readonly string[]).includes(value)
  );
}

/** Map a Date (or hour) to the ambient lighting period using local time. */
export function getTimePeriod(date: Date = new Date()): TimePeriod {
  const hour = date.getHours();
  if (hour >= 5 && hour < 9) return "morning";
  if (hour >= 9 && hour < 17) return "day";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

/**
 * Milliseconds until the next period boundary in local time.
 * Used to schedule a single wake-up instead of polling.
 */
export function getMsUntilNextPeriodBoundary(date: Date = new Date()): number {
  const now = date.getTime();
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  for (const hour of BOUNDARY_HOURS) {
    const boundary = new Date(startOfDay);
    boundary.setHours(hour, 0, 0, 0);
    if (boundary.getTime() > now) {
      return boundary.getTime() - now;
    }
  }

  const tomorrowMorning = new Date(startOfDay);
  tomorrowMorning.setDate(tomorrowMorning.getDate() + 1);
  tomorrowMorning.setHours(5, 0, 0, 0);
  return tomorrowMorning.getTime() - now;
}

/** Dev-only preview override from `?ambient=` / `?timePeriod=`. */
export function parseAmbientPreviewParam(
  searchParams: URLSearchParams | null | undefined
): TimePeriod | null {
  if (!searchParams) return null;
  const raw =
    searchParams.get("ambient") ?? searchParams.get("timePeriod") ?? "";
  return isTimePeriod(raw) ? raw : null;
}

export { PERIOD_RANGES };
