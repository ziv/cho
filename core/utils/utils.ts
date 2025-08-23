/**
 * Returns the current time as a formatted string "HH:MM:SS.mmm".
 * @param d - The date object to format. Defaults to the current date and time.
 * @returns The formatted time string.
 */
export function time(d = new Date()) {
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  const s = d.getSeconds().toString().padStart(2, "0");
  const ms = d.getMilliseconds().toString().padStart(3, "0");
  return `${h}:${m}:${s}.${ms}`;
}
