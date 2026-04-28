import { format, parseISO } from "date-fns";

/**
 * Format cents to EUR display string.
 * 55000 → "€550" or "€550.50"
 */
export function formatEur(cents: number): string {
  const euros = cents / 100;
  if (euros % 1 === 0) {
    return `€${euros.toLocaleString("en-IE")}`;
  }
  return `€${euros.toLocaleString("en-IE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format date to display string.
 * "Apr 15, 2026"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MMM d, yyyy");
}

/**
 * Format date range.
 * Same month: "Apr 15-18, 2026"
 * Different months: "Apr 15 - May 2, 2026"
 */
export function formatDateRange(start: Date | string, end: Date | string): string {
  const s = typeof start === "string" ? parseISO(start) : start;
  const e = typeof end === "string" ? parseISO(end) : end;

  if (format(s, "MMM yyyy") === format(e, "MMM yyyy")) {
    return `${format(s, "MMM d")}-${format(e, "d, yyyy")}`;
  }
  return `${format(s, "MMM d")} - ${format(e, "MMM d, yyyy")}`;
}
