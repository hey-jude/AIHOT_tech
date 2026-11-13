import { decodeHTMLStrict } from "entities/decode";

export function collapseWhitespace(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

/** 선언된 언어를 우선하고, 그 외에는 한글이 포함되어 있는지 확인한다. */
export function isKoreanText(text: string, language?: string | null): boolean {
  const declared = language?.toLowerCase().split(/[-_]/)[0];
  if (declared === "ko") return true;
  if (declared && !["und", "unknown", "other", "zxx"].includes(declared)) return false;
  return /[\uAC00-\uD7AF]/u.test(text);
}

export function truncate(s: string, max: number, ellipsis = "…"): string {
  const chars = [...s];
  if (chars.length <= max) return s;
  return chars.slice(0, Math.max(0, max - ellipsis.length)).join("").trimEnd() + ellipsis;
}

/**
 * Removes element markup while keeping `>` inside quoted attribute values: a link
 * title such as `title="Platforms > Xbox"` must not end the tag there and leak the
 * rest of it into the text.
 * This follows the small part of the HTML tokenizer needed here: an equals sign
 * starts a quoted value only after an attribute name. Comments, doctypes and
 * `< a>` keep the old first-`>` behavior because they are not element tags here.
 */
export function stripTagMarkup(html: string, replacement = " "): string {
  let out = "";
  let at = 0;
  while (at < html.length) {
    const start = html.indexOf("<", at);
    if (start < 0) return out + html.slice(at);
    out += html.slice(at, start);

    const firstEnd = html.indexOf(">", start + 1);
    if (firstEnd < 0) return out + html.slice(start);
    let end = firstEnd;
    // Only element attributes need quote handling; other markup keeps its existing behavior.
    if (/^<\/?[a-z]/i.test(html.slice(start, start + 3))) {
      let quote = "";
      let tagName = true;
      let attributeName = false;
      let value: "none" | "start" | "unquoted" = "none";
      let i = start + 1;
      for (; i < html.length; i += 1) {
        const char = html[i]!;
        if (quote) {
          if (char === quote) quote = "";
        } else if (char === ">") {
          end = i;
          break;
        } else if (value === "unquoted") {
          if (/[\t\n\f\r ]/.test(char)) value = "none";
        } else if (value === "start") {
          if (/[\t\n\f\r ]/.test(char)) continue;
          value = "none";
          if (char === '"' || char === "'") quote = char;
          else value = "unquoted";
        } else if (tagName) {
          if (/[\t\n\f\r ]/.test(char)) tagName = false;
          else if (char === "/") continue;
          else if (char === "=") {
            tagName = false;
            attributeName = true;
          }
        } else if (char === "=") {
          if (attributeName) {
            attributeName = false;
            value = "start";
          } else {
            // A bare `=` is an attribute name in malformed HTML, not a value prefix.
            attributeName = true;
          }
        } else if (!/[\t\n\f\r ]/.test(char)) {
          attributeName = true;
        }
      }
      // An unfinished quoted tag consumes the rest of the document in the browser tokenizer.
      if (i === html.length) return out + replacement;
    }
    // Preserve the old result for the empty `<>` construct, which the old regex did not match.
    out += end === start + 1 ? "<>" : replacement;
    at = end + 1;
  }
  return out;
}

/**
 * Character references, numeric and named, as browsers read them in text; only those ending in a semicolon,
 * so an address keeps its "&copy=". Feeds escape text twice ("AI&amp;#8217;s", code shown as "&amp;lt;"),
 * and the text they mean is what readers expect, so "&amp;" goes first.
 */
export function decodeEntities(s: string): string {
  return decodeHTMLStrict(s.replace(/&amp;/g, "&"));
}

/** The text of HTML: without scripts and styles, every tag a word boundary, references decoded, whitespace collapsed. */
export function stripTags(html: string): string {
  return collapseWhitespace(decodeEntities(stripTagMarkup(html.replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, " "))));
}

export function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    // XML 1.0 forbids most control characters.
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
}

/** 한글과 한자 비율. 제목 번역 여부를 판단하는 데 사용한다. */
export function cjkRatio(s: string): number {
  const letters = s.match(/[\p{L}]/gu) ?? [];
  if (letters.length === 0) return 0;
  const cjk = s.match(/[\u3400-\u9fff\uf900-\ufaff\uAC00-\uD7AF]/g) ?? [];
  return cjk.length / letters.length;
}

export function guessLanguage(s: string): "ko" | "en" | "other" {
  const ratio = cjkRatio(s);
  if (ratio > 0.3) return "ko";
  if (/[a-z]/i.test(s)) return "en";
  return "other";
}
