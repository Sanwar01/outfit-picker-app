/** UTC period helpers for usage meters. */

export function utcMonthKey(date = new Date()): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function utcDayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

/** Start of next UTC month (ISO). */
export function nextUtcMonthStartIso(date = new Date()): string {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth();
  return new Date(Date.UTC(y, m + 1, 1, 0, 0, 0, 0)).toISOString();
}

/** Start of next UTC day (ISO). */
export function nextUtcDayStartIso(date = new Date()): string {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth();
  const d = date.getUTCDate();
  return new Date(Date.UTC(y, m, d + 1, 0, 0, 0, 0)).toISOString();
}
