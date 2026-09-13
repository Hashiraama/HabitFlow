import { Habit } from '../types';

/**
 * Return today's local date as YYYY-MM-DD
 */
export function getTodayDateString(): string {
  const now = new Date();
  return formatDateString(now);
}

/**
 * Formats a Date object to YYYY-MM-DD in local time
 */
export function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses YYYY-MM-DD safely into a local Date object (at midnight local time)
 */
export function parseDateString(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

/**
 * Returns the number of days in a given month (1-indexed month: 1=Jan, 12=Dec)
 */
export function getDaysInMonth(year: number, month1Indexed: number): number {
  return new Date(year, month1Indexed, 0).getDate();
}

/**
 * Add days to a YYYY-MM-DD string
 */
export function addDays(dateStr: string, days: number): string {
  const d = parseDateString(dateStr);
  d.setDate(d.getDate() + days);
  return formatDateString(d);
}

/**
 * Compare two date strings ('YYYY-MM-DD')
 * returns <0 if a < b, 0 if a == b, >0 if a > b
 */
export function compareDates(a: string, b: string): number {
  return a.localeCompare(b);
}

/**
 * Check if dateStr is strictly in the future compared to today
 */
export function isFutureDate(dateStr: string, todayStr = getTodayDateString()): boolean {
  return dateStr > todayStr;
}

/**
 * Format date for friendly display (e.g. "Sunday, Sep 13, 2026")
 */
export function formatFriendlyDate(dateStr: string): string {
  const date = parseDateString(dateStr);
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Check if a habit is due on a specific calendar date (YYYY-MM-DD)
 */
export function isHabitDueOnDate(habit: Habit, dateStr: string): boolean {
  // If habit is paused on this date
  if (habit.status === 'paused' && habit.pauseConfig) {
    const { pausedAt, resumeDate } = habit.pauseConfig;
    if (dateStr >= pausedAt && dateStr < resumeDate) {
      return false;
    }
  }

  // Before habit was created
  const createdDate = habit.createdAt ? habit.createdAt.slice(0, 10) : dateStr;
  if (dateStr < createdDate) {
    return false;
  }

  // If frequency is specific dates
  if (habit.frequency === 'specific_dates') {
    return habit.specificDates ? habit.specificDates.includes(dateStr) : false;
  }

  // Daily
  if (habit.frequency === 'daily') {
    return true;
  }

  const d = parseDateString(dateStr);

  // Weekly (weeklyDays: 0=Sun, 1=Mon, ..., 6=Sat)
  if (habit.frequency === 'weekly') {
    const dayOfWeek = d.getDay();
    return habit.weeklyDays ? habit.weeklyDays.includes(dayOfWeek) : true;
  }

  // Monthly: dates 1-31.
  // Rule: If a selected date does not exist in a month (for example, 31), use that month's last day.
  if (habit.frequency === 'monthly') {
    if (!habit.monthlyDays || habit.monthlyDays.length === 0) return false;
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const daysInMonth = getDaysInMonth(year, month);
    const dayOfMonth = d.getDate();

    return habit.monthlyDays.some(targetDay => {
      if (targetDay > daysInMonth) {
        // Fallback to last day of this month
        return dayOfMonth === daysInMonth;
      }
      return dayOfMonth === targetDay;
    });
  }

  return false;
}

/**
 * Returns the maximum future date allowed to browse in the calendar
 * Rule: "Permit future-month browsing only as far as current active habit schedules extend. Future dates remain visually grey."
 */
export function getMaxFutureBrowseDate(habits: Habit[]): Date {
  const now = new Date();
  let maxDate = new Date(now.getFullYear(), now.getMonth() + 3, 1); // default 3 months for recurring active habits

  for (const h of habits) {
    if (h.frequency === 'specific_dates' && h.specificDates && h.specificDates.length > 0) {
      const sorted = [...h.specificDates].sort();
      const last = sorted[sorted.length - 1];
      const parsedLast = parseDateString(last);
      if (parsedLast > maxDate) {
        maxDate = new Date(parsedLast.getFullYear(), parsedLast.getMonth() + 1, 1);
      }
    }
  }

  return maxDate;
}
