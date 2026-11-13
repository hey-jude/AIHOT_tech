import { seoulDate, seoulTime, seoulWeekday, monthDay as engineMonthDay } from "@aihot/contracts/time";

/**
 * "9월 28일" of a calendar date (YYYY-MM-DD). A day of another year than `now` (Seoul) carries its year, so an
 * archived item is not read as this year's: "2019년 2월 19일". The engine's monthDay does this only when given today.
 */
export function monthDay(date: string, now: number = Date.now()): string {
  return engineMonthDay(date, seoulDate(now));
}

/** A list cut into runs of the same Seoul day, in the list's own order. */
export function bySeoulDay<T>(list: readonly T[], at: (entry: T) => string): Array<{ day: string; entries: T[] }> {
  const days: Array<{ day: string; entries: T[] }> = [];
  for (const entry of list) {
    const day = seoulDate(at(entry));
    const last = days.at(-1);
    if (last?.day === day) last.entries.push(entry);
    else days.push({ day, entries: [entry] });
  }
  return days;
}

/** The Korean weekday name of a calendar date (YYYY-MM-DD). */
export function weekdayShort(date: string): string {
  return seoulWeekday(date)
    .replace("\u661f\u671f", "")
    .replace("\u4e00", "월")
    .replace("\u4e8c", "화")
    .replace("\u4e09", "수")
    .replace("\u56db", "목")
    .replace("\u4e94", "금")
    .replace("\u516d", "토")
    .replace("\u65e5", "일");
}

export function relativeTime(iso: string, now = Date.now()): string {
  return timeAgo(iso, now) ?? seoulDate(iso);
}

/** A relative time under a month, else null: beside a full time, the date it would fall back to says nothing new. */
export function timeAgo(iso: string, now = Date.now()): string | null {
  const t = Date.parse(iso);
  const s = Math.max(0, Math.round((now - t) / 1000));
  if (s < 60) return "방금";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}분 전`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.round(h / 24);
  return d < 30 ? `${d}일 전` : null;
}

export function fullDateTime(iso: string): string {
  return `${seoulDate(iso)} ${seoulTime(iso)}`;
}

/** "9월 24일 10:51" (Seoul), for lists that span days. */
export function monthDayTime(iso: string): string {
  return `${monthDay(seoulDate(iso))} ${seoulTime(iso)}`;
}

export function sourceInitial(name: string): string {
  const s = name.replace(/^[^\p{L}\p{N}]+/u, "");
  return (s[0] ?? "A").toUpperCase();
}
