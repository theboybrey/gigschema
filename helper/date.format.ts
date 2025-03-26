import { format } from "date-fns";
import dayjs from "dayjs";

/**
 * Function to format a date with suffix (st, nd, rd, th) and full weekday and month abbreviation.
 * @param date The date to format (string or Date).
 * @param withTime If true, also include time in the format.
 * @returns Formatted date string.
 */
export function formatDate(date: string | Date, withTime = false): string {
  const formatString = withTime ? "EEEE do MMM yyyy" : "EEEE do MMM yyyy";

  try {
    const formattedDate = format(new Date(date), formatString);
    return addDaySuffix(formattedDate);
  } catch (error) {
    console.error("Invalid date value:", date);
    return "";
  }
}

/**
 * Adds the appropriate day suffix (st, nd, rd, th) to the day of the month.
 * @param date The formatted date string (e.g. "Monday 24th Dec 2025").
 * @returns Date with the correct suffix.
 */
function addDaySuffix(date: string): string {
  const dayMatch = date.match(/(\d{1,2})(?=\s)/);

  if (dayMatch) {
    const day = parseInt(dayMatch[1], 10);
    const suffix = getDaySuffix(day);
    return date.replace(dayMatch[0], `${day}${suffix}`);
  }

  return date;
}

/**
 * Gets the appropriate suffix for the given day.
 * @param day The day of the month.
 * @returns The correct suffix ("st", "nd", "rd", "th").
 */
function getDaySuffix(day: number): string {
  if (day >= 11 && day <= 13) {
    return "th";
  }
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

/**
 * Function to format time.
 * @param date The date to format.
 * @returns Formatted time string.
 */
export function formatTime(date: string): string {
  return format(new Date(date), "h:mm a");
}

/**
 * Function to get the current date and time in the format:
 * `Monday 24th Dec 2025`
 * @returns Formatted date and time string.
 */
export function getCurrentDateTime() {
  const now = new Date();

  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const year = now.getFullYear();

  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12;
  const formattedHours = String(hours).padStart(2, "0");

  const dayOfWeek = format(now, "EEEE");
  const formattedDate = addDaySuffix(
    `${dayOfWeek} ${day} ${format(now, "MMM")} ${year}`
  );

  return formattedDate;
}

/**
 * Function to calculate the age based on the given date.
 * @param date The date of birth.
 * @returns The age.
 */
export function calculateAge(date: string | Date): number {
  const birth = dayjs(date);
  const today = dayjs();
  let age = today.year() - birth.year();

  if (
    today.month() < birth.month() ||
    (today.month() === birth.month() && today.date() < birth.date())
  ) {
    age--;
  }

  return age;
}
