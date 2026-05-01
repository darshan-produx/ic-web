import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
export function utcToLocal(date: Date) {
  if (!date) return;
  return new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);
}

export function localToUtc(date: Date) {
  if (!date) return;
  return new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
}

export const toStartUTC = (selectedDate: Date | null | undefined) => {
  if (selectedDate) {
    const picked = dayjs(selectedDate);
    const utcMidnight = dayjs
      .utc(`${picked.format('YYYY-MM-DD')}T00:00:00.000Z`)
      .toDate();
    return utcMidnight;
  }
};
export const toEndUTC = (selectedDate: Date | null | undefined) => {
  if (selectedDate) {
    const picked = dayjs(selectedDate);
    const utcMidnight = dayjs
      .utc(`${picked.format('YYYY-MM-DD')}T23:59:59.999Z`)
      .toDate();
    return utcMidnight;
  }
};

function toValidDate(
  d: Date | string | number | null | undefined
): Date | null {
  if (d === null || d === undefined) return null;
  // If already a Date instance, use it; else try to coerce.
  const dt = d instanceof Date ? d : new Date(d);
  // If invalid date, return null
  if (isNaN(dt.getTime())) return null;
  return dt;
}
export function toUTCDateOnly(
  d: Date | string | number | null | undefined
): Date | null {
  const dt = toValidDate(d);
  if (!dt) return null;

  // Use UTC getters to extract date components in UTC (prevents double-shift)
  const yyyy = dt.getUTCFullYear();
  const mm = dt.getUTCMonth(); // 0-indexed
  const dd = dt.getUTCDate();

  // Construct a Date at 00:00:00.000 UTC for that UTC date
  return new Date(yyyy, mm, dd, 0, 0, 0, 0);
}
export function toUTCEndOfDay(
  d: Date | string | number | null | undefined
): Date | null {
  const dt = toValidDate(d);
  if (!dt) return null;

  const yyyy = dt.getUTCFullYear();
  const mm = dt.getUTCMonth();
  const dd = dt.getUTCDate();

  return new Date(yyyy, mm, dd, 23, 59, 59, 999);
}

export function normalizeDate(date?: Date | string | null) {
  if (!date) return null;
  const newDate = new Date(date);
  return new Date(
    newDate.getFullYear(),
    newDate.getMonth(),
    newDate.getDate()
  );
}

export function moveTodayToMonday(): Date {
  const today = new Date();
  if (today.getDay() === 0) {
    return new Date(today.setDate(today.getDate() + 1));
  } else if (today.getDay() === 6) {
    return new Date(today.setDate(today.getDate() + 2));
  } else {
    return today;
  }
}