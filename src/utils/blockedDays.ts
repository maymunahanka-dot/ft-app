export type BlockedDays = {
  blockWeekends: boolean;
  dates: string[];
};

export const toDateKey = (value: string | Date) => {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    const match = String(value).match(/^(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : "";
  }
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

export const isWeekendKey = (key: string) => {
  const [year, month, day] = key.split("-").map(Number);
  if (!year || !month || !day) return false;
  const weekday = new Date(year, month - 1, day).getDay();
  return weekday === 0 || weekday === 6;
};

export const blockedMessage = (date: string, blocked?: BlockedDays | null) => {
  if (!date || !blocked) return "";
  const key = toDateKey(date);
  if (!key) return "";
  if (blocked.dates?.includes(key)) return "That day is blocked. Choose another date.";
  if (blocked.blockWeekends && isWeekendKey(key)) return "Weekends are blocked. Choose a weekday.";
  return "";
};
