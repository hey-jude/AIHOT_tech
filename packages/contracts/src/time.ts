// 서울 (Asia/Seoul, 고정 UTC+9, DST 없음) 달력 도우미 — 웹과 백엔드 공용

const OFFSET_MS = 9 * 3600 * 1000;

/** 한국시간의 YYYY-MM-DD. */
export function seoulDate(instant: Date | string | number): string {
  const d = new Date(new Date(instant).getTime() + OFFSET_MS);
  return d.toISOString().slice(0, 10);
}

/** 한국시간의 HH:mm. */
export function seoulTime(instant: Date | string | number): string {
  const d = new Date(new Date(instant).getTime() + OFFSET_MS);
  return d.toISOString().slice(11, 16);
}

/** 한국시간 ISO 8601 밀리초 표기: "2026-09-26T08:07:13.000+09:00". */
export function seoulIso(instant: Date | string | number): string {
  return `${new Date(new Date(instant).getTime() + OFFSET_MS).toISOString().slice(0, 23)}+09:00`;
}

/**
 * 날짜의 "9월 28일" 표기. `today`와 다른 연도의 날짜에는 연도를 붙여 과거 기록임을 나타낸다: "2019년 2월 19일".
 */
export function monthDay(date: string, today?: string): string {
  const year = today && date.slice(0, 4) !== today.slice(0, 4) ? `${date.slice(0, 4)}년 ` : "";
  return `${year}${Number(date.slice(5, 7))}월 ${Number(date.slice(8, 10))}일`;
}

/** 한국시간 날짜를 "9월 29일"로 표기한다. */
export const seoulDay = (instant: Date | string | number) => monthDay(seoulDate(instant));

/** 한국시간을 "9월 29일 13:40"으로 표기한다. */
export const seoulStamp = (instant: Date | string | number) => `${seoulDay(instant)} ${seoulTime(instant)}`;

/** 스케줄러, 리포트 메타데이터, SQL `AT TIME ZONE` 등에 쓰는 시간대 이름. */
export const SEOUL_TIMEZONE = "Asia/Seoul" as const;

/** 해당 날짜 한국시간 자정의 UTC 시각. */
export function seoulMidnight(date: string): Date {
  return new Date(Date.parse(`${date}T00:00:00+09:00`));
}

/** 해당 날짜 한국시간 HH:mm의 UTC 시각. */
export function seoulAt(date: string, time: string): Date {
  return new Date(Date.parse(`${date}T${time}:00+09:00`));
}

export function addDays(date: string, days: number): string {
  const t = Date.parse(`${date}T00:00:00Z`) + days * 86400000;
  return new Date(t).toISOString().slice(0, 10);
}

const WEEKDAYS = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];

export function seoulWeekday(date: string): string {
  return WEEKDAYS[new Date(`${date}T00:00:00Z`).getUTCDay()]!;
}

/** 날짜의 ISO 주차 라벨(예: 2026-W38). */
export function isoWeekLabel(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  const day = (d.getUTCDay() + 6) % 7; // 월요일 = 0
  d.setUTCDate(d.getUTCDate() - day + 3); // 해당 주의 목요일
  const year = d.getUTCFullYear();
  const firstThursday = new Date(Date.UTC(year, 0, 4));
  const firstDay = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDay + 3);
  const week = 1 + Math.round((d.getTime() - firstThursday.getTime()) / (7 * 86400000));
  return `${year}-W${String(week).padStart(2, "0")}`;
}

/** ISO 주차 라벨의 월요일부터 일요일까지 날짜. */
export function isoWeekRange(label: string): { start: string; end: string } | null {
  const m = /^(\d{4})-W(\d{2})$/.exec(label);
  if (!m) return null;
  const year = Number(m[1]);
  const week = Number(m[2]);
  if (week < 1 || week > 53) return null;
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const mondayWeek1 = new Date(jan4);
  mondayWeek1.setUTCDate(jan4.getUTCDate() - ((jan4.getUTCDay() + 6) % 7));
  const start = new Date(mondayWeek1);
  start.setUTCDate(mondayWeek1.getUTCDate() + (week - 1) * 7);
  const startDate = start.toISOString().slice(0, 10);
  if (isoWeekLabel(startDate) !== label) return null;
  return { start: startDate, end: addDays(startDate, 6) };
}

/** 2026-09 같은 월 라벨의 첫날과 마지막 날(YYYY-MM-DD). 유효하지 않은 라벨은 null. */
export function monthRange(label: string): { start: string; end: string } | null {
  const m = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(label);
  if (!m) return null;
  const next = Number(m[2]) === 12 ? `${Number(m[1]) + 1}-01-01` : `${m[1]}-${String(Number(m[2]) + 1).padStart(2, "0")}-01`;
  return { start: `${label}-01`, end: addDays(next, -1) };
}

export function isValidDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const t = Date.parse(`${date}T00:00:00Z`);
  return Number.isFinite(t) && new Date(t).toISOString().slice(0, 10) === date;
}
