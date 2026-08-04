/**
 * Date utility helpers for local timezone handling, formatting, and day offsets.
 */

export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayString(): string {
  return getLocalDateString(new Date());
}

export function offsetDateString(dateStr: string, daysOffset: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + daysOffset);
  return getLocalDateString(date);
}

export function formatDateDisplay(dateStr: string) {
  const todayStr = getTodayString();
  const yesterdayStr = offsetDateString(todayStr, -1);
  const tomorrowStr = offsetDateString(todayStr, 1);

  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);

  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }); // e.g. "Thursday, 30 July"

  if (dateStr === todayStr) {
    return { title: formattedDate, subtitle: 'Today', isToday: true };
  } else if (dateStr === yesterdayStr) {
    return { title: formattedDate, subtitle: 'Yesterday', isToday: false };
  } else if (dateStr === tomorrowStr) {
    return { title: formattedDate, subtitle: 'Tomorrow', isToday: false };
  } else {
    return { title: formattedDate, subtitle: 'Previous day', isToday: false };
  }
}

export function formatFullDateLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}
