// 목록, 기사, JSON에 표시된 게시 시각을 실행 환경과 무관하게 동일하게 해석한다.
import { seoulDate, seoulTime } from "@aihot/contracts/time";
import type { SourceRow } from "./types.ts";

/** The offset a source's article pages print their dates in: its detail rules' own, else its listing's. */
export function articleUtcOffset(config: SourceRow["config"]): string | undefined {
  return config.detail?.publishedAtUtcOffset ?? config.publishedAtUtcOffset;
}

/**
 * A time followed by its zone: "10:00Z", "10:00:00+09:00", "10:00:00 +0000", "10:00 PM GMT", "10:00 EST".
 * CST는 시간대 표기가 아니다. Date.parse는 미국 중부 시간으로 해석하므로, 한국 웹페이지의 CST는 신호원 시간대(+09:00) 기준으로 읽는다.
 */
const EXPLICIT_ZONE = /\d{1,2}:\d{2}(?::\d{2}(?:\.\d+)?)?\s*(?:[AP]M\s*)?(?:Z|[+-]\d{2}:?\d{2}|GMT|UTC?|[EMP][SD]T|CDT)\b/i;

function calendarDay(y: string | number, mo: string | number, d: string | number): boolean {
  const date = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d)));
  return date.getUTCFullYear() === Number(y) && date.getUTCMonth() === Number(mo) - 1 && date.getUTCDate() === Number(d);
}

function atOffset(y: string | number, mo: string | number, d: string | number, h: string | number, mi: string | number, s: string | number, utcOffset: string): Date | null {
  if (!calendarDay(y, mo, d) || Number(h) > 23 || Number(mi) > 59 || Number(s) > 59) return null;
  const p = (n: string | number) => String(n).padStart(2, "0");
  const t = Date.parse(`${y}-${p(mo)}-${p(d)}T${p(h)}:${p(mi)}:${p(s)}${utcOffset}`);
  return Number.isFinite(t) ? new Date(t) : null;
}

/**
 * A published date as a source prints it. Date.parse is kept only where it reads the same
 * on every host: a time with its zone. A calendar day always belongs to the source, including ISO date-only text. Anything else it would read
 * in the server's local zone (UTC in Docker), so "2026-09-26 10:00" is read in the source's offset instead.
 */
export function parseLooseDate(value: string | null | undefined, utcOffset = "+09:00"): Date | null {
  if (!value) return null;
  // "Sep 26, 2026 at 10:30": "at" joins a date and its time like a space.
  const v = value.trim().replace(/(\d),?\s+at\s+(?=\d{1,2}:\d{2})/gi, "$1 ");
  if (!v) return null;
  const compact = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/.exec(v);
  if (compact) return atOffset(compact[1]!, compact[2]!, compact[3]!, compact[4]!, compact[5]!, compact[6]!, utcOffset);
  const yearFirst = /(\d{4})[-/.\u5e74](\d{1,2})[-/.\u6708](\d{1,2})\u65e5?(?:(?:T|\s*)(\d{1,2}):(\d{2})(?::(\d{2}))?)?/.exec(v);
  const monthFirst = /\b(\d{1,2})\/(\d{1,2})\/(\d{4})(?:(?:T|\s+)(\d{1,2}):(\d{2})(?::(\d{2}))?)?/.exec(v);
  const numeric = yearFirst ?? monthFirst?.map((part, i, match) => i === 1 ? match[3]! : i === 2 ? match[1]! : i === 3 ? match[2]! : part);
  if (numeric && !calendarDay(numeric[1]!, numeric[2]!, numeric[3]!)) return null;
  const english = /\b([a-z]{3,9})\.?\s+(\d{1,2})(?:st|nd|rd|th)?[,]?\s+(\d{4})\b/i.exec(v)
    ?? /\b(\d{1,2})\s+([a-z]{3,9})\.?[,]?\s+(\d{2}|\d{4})\b/i.exec(v)?.map((part, i, match) => i === 1 ? match[2]! : i === 2 ? match[1]! : part);
  if (english) {
    if (english[3]!.length === 2) english[3] = String(Number(english[3]) + (Number(english[3]) < 50 ? 2000 : 1900));
    const month = Date.parse(`${english[1]} 1, ${english[3]} 00:00:00 GMT`);
    if (!Number.isFinite(month) || !calendarDay(english[3]!, new Date(month).getUTCMonth() + 1, english[2]!)) return null;
  }
  if (!numeric && !english) return null;
  const text = v.replace(/(\d)(st|nd|rd|th)\b/gi, "$1");
  if (EXPLICIT_ZONE.test(v)) {
    const direct = Date.parse(text);
    if (Number.isFinite(direct)) return new Date(direct);
    if (!numeric) return null;
  }
  // Numeric year-first dates with an optional time are interpreted in the given offset.
  const m = numeric;
  if (m) {
    const [, y, mo, d, h = "00", mi = "00", s = "00"] = m;
    const meridiem = /\d:\d{2}(?::\d{2})?\s*([AP]M)\b/i.exec(v)?.[1]?.toUpperCase();
    if (meridiem && (Number(h) < 1 || Number(h) > 12)) return null;
    const hour = meridiem ? Number(h) % 12 + (meridiem === "PM" ? 12 : 0) : h;
    return atOffset(y!, mo!, d!, hour, mi, s, utcOffset);
  }
  // Parse English wall-clock fields in UTC so the host's daylight-saving rules cannot shift them.
  const en = Date.parse(`${text} GMT`);
  const englishDay = english && !/\d:\d/.test(text) ? Date.parse(`${english[1]} ${english[2]}, ${english[3]} GMT`) : NaN;
  if (!Number.isFinite(en) && !Number.isFinite(englishDay)) return null;
  const utc = new Date(Number.isFinite(en) ? en : englishDay);
  return atOffset(utc.getUTCFullYear(), utc.getUTCMonth() + 1, utc.getUTCDate(), utc.getUTCHours(), utc.getUTCMinutes(), utc.getUTCSeconds(), utcOffset);
}

/** A source's claim keeps its precision, apart from the instant used for ordering and windows. */
export interface PublicationDate {
  publishedAt: Date | null;
  /** YYYY-MM-DD for a calendar day; ISO timestamp for a real time; null for unknown. */
  publicationTime: string | null;
}

export function readPublicationDate(value: string | null | undefined, utcOffset = "+09:00"): PublicationDate {
  const publishedAt = parseLooseDate(value, utcOffset);
  if (!publishedAt) return { publishedAt: null, publicationTime: null };
  const timed = /\d{1,2}:\d{2}/.test(value!) || /^\d{14}$/.test(value!.trim());
  if (timed) return { publishedAt, publicationTime: publishedAt.toISOString() };
  return { publishedAt, publicationTime: dayAt(publishedAt, utcOffset) };
}

/** Legacy timestamps have lost their source precision; midnight never tells us which it was. */
export function describePublicationTime(at: Date | null, source: string | null | undefined): string {
  if (!at) return "알 수 없음";
  if (!source) return `${seoulDate(at)} ${seoulTime(at)}(과거 기록, 원래 시각의 정밀도 알 수 없음)`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(source)) return `${source}(원문에 날짜만 있고 시각은 없음)`;
  return `${seoulDate(at)} ${seoulTime(at)}(한국시간(Asia/Seoul))`;
}

const RELATIVE_UNITS: Record<string, number> = { "\u79d2": 1e3, "\u5206\u949f": 60e3, "\u5206": 60e3, "\u5c0f\u65f6": 3600e3, "\u5929": 86400e3, second: 1e3, minute: 60e3, min: 60e3, m: 60e3, hour: 3600e3, hr: 3600e3, h: 3600e3, day: 86400e3, d: 86400e3 };
const DAYS_BACK: Record<string, number> = { "\u4eca\u5929": 0, "\u6628\u5929": 1, "\u524d\u5929": 2, yesterday: 1 };

/** The calendar day `at` falls on in the given offset, as YYYY-MM-DD. */
function dayAt(at: Date, utcOffset: string): string {
  const offsetMs = Date.UTC(2000, 0, 1) - atOffset(2000, 1, 1, 0, 0, 0, utcOffset)!.getTime();
  return new Date(at.getTime() + offsetMs).toISOString().slice(0, 10);
}

/**
 * A page's own element printing an age instead of a date, counted back from `now`. Relative Chinese date formats
 * "16h ago"), counted back from `now`, the moment it was read. Only the whole text of a date rule's element is read
 * are read only as the complete date element after a byline; a sentence that merely mentions a relative date is not.
 * listing pages print the age for an article's first days and the date only after, so every new article came in
 * undated and missed that day's news. Hours and minutes keep a time, however many; days keep the calendar day in the
 * The date is interpreted in the source's offset.
 */
export function readRelativeDate(value: string | null | undefined, now: Date, utcOffset = "+09:00"): PublicationDate {
  const v = collapse(value).replace(/^[^·]+·\s*/, "");
  const none = { publishedAt: null, publicationTime: null };
  if (!v) return none;
  const dayTime = /^(\u4eca\u5929|\u6628\u5929|\u524d\u5929)\s*(\d{1,2}):(\d{2})$/.exec(v);
  if (dayTime) {
    const day = dayAt(new Date(now.getTime() - DAYS_BACK[dayTime[1]!]! * 86400e3), utcOffset);
    const at = atOffset(day.slice(0, 4), day.slice(5, 7), day.slice(8, 10), dayTime[2]!, dayTime[3]!, 0, utcOffset);
    return at ? { publishedAt: at, publicationTime: at.toISOString() } : none;
  }
  let ms: number | null = null;
  let unitMs = 0;
  if (/^(\u521a\u521a|just now)$/i.test(v)) ms = 0;
  else if (/^(\u6628\u5929|\u524d\u5929|yesterday)$/i.test(v)) [ms, unitMs] = [DAYS_BACK[v.toLowerCase()]! * 86400e3, 86400e3];
  else {
    const m = /^(\d{1,3})\s*(\u79d2|\u5206\u949f|\u5206|\u5c0f\u65f6|\u5929)\u524d$/.exec(v) ?? /^(\d{1,3})\s*(?:(second|minute|min|hour|hr|day)s?|(m|h|d))\s+ago$/i.exec(v);
    const name = (m?.[2] ?? m?.[3])?.toLowerCase();
    if (m && name) [ms, unitMs] = [Number(m[1]) * RELATIVE_UNITS[name]!, RELATIVE_UNITS[name]!];
  }
  if (ms === null) return none;
  const at = new Date(now.getTime() - ms);
  // The text's own unit sets the precision: sub-day relative times keep their time, even when over a day old.
  if (unitMs < 86400e3) return { publishedAt: at, publicationTime: at.toISOString() };
  const day = dayAt(at, utcOffset);
  return { publishedAt: atOffset(day.slice(0, 4), day.slice(5, 7), day.slice(8, 10), 0, 0, 0, utcOffset), publicationTime: day };
}

const collapse = (v: string | null | undefined) => (v ?? "").replace(/\s+/g, " ").trim();
