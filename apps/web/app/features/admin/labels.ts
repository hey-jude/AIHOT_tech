// Shared admin vocabulary.
import { SELECTION } from "@aihot/industry/selection";

export const KIND_LABEL: Record<string, string> = { rss: "RSS", web_list: "웹 목록", json_list: "JSON", x_search: "X", mp_account: "위챗 공중계정", external: "외부 보고" };
export const MODE_LABEL: Record<string, string> = { editorial: "주요 뉴스", hot_signal: "화제 신호", isolated: "뉴스 제외" };
export const HEALTH_LABEL: Record<string, string> = { ok: "정상", degraded: "불안정", failing: "실패", paused: "일시정지", unknown: "미확인" };
export const VISIBILITY_LABEL: Record<string, string> = { public: "공개", "summary-only": "요약만", withdrawn: "게시 중단" };
export const FEEDBACK_STATUS: Record<string, string> = { new: "새 피드백", triaged: "처리 중", replied: "답변 완료", resolved: "해결됨", spam: "스팸" };
export const FEEDBACK_KIND: Record<string, string> = { bug: "버그", suggestion: "제안", question: "질문", other: "기타" };
export const TIER_LABEL: Record<string, string> = { T1: "T1", T1_5: "T1.5", T2: "T2", EXCLUDE_MP: "위챗 공중계정 제외" };
/** The industry pack's source classes, each with the threshold floor it sets. */
export const SELECTION_CLASS_LABEL: Record<string, string> = Object.fromEntries(
  Object.entries(SELECTION.classes).map(([k, c]) => [k, `${c.label}(기준 ${c.threshold} 이상)`]),
);
