import { format, toZonedTime, fromZonedTime } from 'date-fns-tz';
import { startOfMonth as dateFnsStartOfMonth } from 'date-fns';

const VANCOUVER_TIMEZONE = 'America/Vancouver';

/**
 * Get current date/time in Vancouver timezone
 */
export function getNowInVancouver(): Date {
  return toZonedTime(new Date(), VANCOUVER_TIMEZONE);
}

/**
 * Convert a UTC date to Vancouver timezone
 */
export function toVancouverTime(date: Date): Date {
  return toZonedTime(date, VANCOUVER_TIMEZONE);
}

/**
 * Convert a Vancouver time to UTC (for database storage)
 */
export function fromVancouverTime(date: Date): Date {
  return fromZonedTime(date, VANCOUVER_TIMEZONE);
}

/**
 * Format date in Vancouver timezone
 */
export function formatInVancouver(date: Date, formatStr: string): string {
  const zonedDate = toZonedTime(date, VANCOUVER_TIMEZONE);
  return format(zonedDate, formatStr, { timeZone: VANCOUVER_TIMEZONE });
}

/**
 * Get start of month in Vancouver timezone
 */
export function getVancouverStartOfMonth(date: Date = new Date()): Date {
  const vancouverNow = toZonedTime(date, VANCOUVER_TIMEZONE);
  const year = vancouverNow.getFullYear();
  const month = vancouverNow.getMonth();
  return toZonedTime(new Date(year, month, 1, 0, 0, 0, 0), VANCOUVER_TIMEZONE);
}

/**
 * Get today in Vancouver (start of day)
 */
export function getVancouverToday(): Date {
  const vancouverNow = toZonedTime(new Date(), VANCOUVER_TIMEZONE);
  return toZonedTime(
    new Date(vancouverNow.getFullYear(), vancouverNow.getMonth(), vancouverNow.getDate(), 0, 0, 0, 0),
    VANCOUVER_TIMEZONE
  );
}

export const TIMEZONE = VANCOUVER_TIMEZONE;
