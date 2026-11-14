// Model per capability: the code default (the site's choice in site/models.ts, else `default`, the deployment's
// own model), an environment override, and an admin switch kept in settings (every switch is audited).
// Read at call time and cached for a minute, so a switch applies to the next call without a restart; a
// changed model only affects work done from then on (history is not re-judged).
import { READER_WORDING } from "@aihot/industry/wording";
import { DEFAULTS } from "@aihot/site/models";
import { sql } from "../db.ts";
import { serverModules } from "../modules.ts";
import { MODELS } from "../providers/llm.ts";

export interface Capability {
  /** The step's name on the admin page, with an explanation in full-width brackets if it needs one; alerts use the name alone. */
  label: string;
  env: string;
  default: string;
  /** Receipt purposes this capability produces (for the admin statistics). */
  purposes: string[];
  /** The step needs a model that reads images. */
  vision?: boolean;
  /** The step has nothing to do on this site, so a service's outage does not stop it. */
  idle?: () => boolean;
}

export const CAPABILITIES = {
  prefilter: { label: "주요 뉴스 사전 필터(업계 관련 여부, 넓은 범위로 탐색)", env: "PREFILTER_MODEL", default: DEFAULTS.prefilter ?? "default", purposes: ["prefilter_article"] },
  score: { label: "주요 뉴스 선정 점수(출처 등급과 카테고리 기준에 따른 독립 평가 2회)", env: "SCORE_MODEL", default: DEFAULTS.score ?? "default", purposes: ["score_article"] },
  understand: { label: "콘텐츠 이해(선정 및 선정에 가까운 기사의 제목·요약·추천 사유, 이미지 지원 시 대표 이미지 확인)", env: "UNDERSTAND_MODEL", default: DEFAULTS.understand ?? "default", purposes: ["understand_article"] },
  summarize: { label: "제목·요약(그 외 기사의 한국어 제목과 요약)", env: "SUMMARIZE_MODEL", default: DEFAULTS.summarize ?? "default", purposes: ["summarize_article"] },
  wording: { label: "표현 교정(사이트에서 사용하지 않는 단어가 제목·요약·사유에 있을 때 해당 단어만 수정)", env: "WORDING_MODEL", default: DEFAULTS.wording ?? "default", purposes: ["mend_wording"], idle: () => !READER_WORDING.length },
  structure: { label: "구조 추출(카테고리, 태그, 기업 주체, 사건 사실; 독자용 문구는 작성하지 않음)", env: "STRUCTURE_MODEL", default: DEFAULTS.structure ?? "default", purposes: ["structure_article"] },
  group: { label: "사건 그룹화(새 보도와 후보 사실의 관계: 같은 사건, 같은 사건의 동향, 무관; 한 보도가 연결한 두 사건이 같은 사건인지 판단)", env: "GROUP_MODEL", default: DEFAULTS.group ?? "default", purposes: ["group_article", "group_signal", "group_story", "group_card"] },
  groupReview: { label: "그룹화 재검토(유사도가 낮은 병합 및 사건 병합을 저장 전에 다시 검토; 가능하면 다른 모델 사용)", env: "GROUP_REVIEW_MODEL", default: DEFAULTS.groupReview ?? "default", purposes: ["group_review", "group_story_review", "group_card_review"] },
  digest: { label: "사건 요약", env: "DIGEST_MODEL", default: DEFAULTS.digest ?? "default", purposes: ["story_digest"] },
  // Dailies are computed by rule; report_lead and report_daily remain for their older receipts.
  report: { label: "주간·월간 브리핑 개요와 주제(일간은 규칙으로 생성하며 모델을 사용하지 않음)", env: "REPORT_MODEL", default: DEFAULTS.report ?? "default", purposes: ["report_weekly", "report_monthly", "report_lead", "report_daily"] },
  translate: { label: "주요 뉴스 전문 번역(인용 게시물 포함)", env: "TRANSLATE_MODEL", default: DEFAULTS.translate ?? "default", purposes: ["translate_body", "translate_quoted"] },
  feedback: { label: "피드백 선별(독자 피드백에 내용이 있는지 판단하고, 내용이 없으면 전달하지 않음)", env: "FEEDBACK_MODEL", default: DEFAULTS.feedback ?? "default", purposes: ["judge_feedback"] },
} satisfies Record<string, Capability>;

export type CapabilityKey = keyof typeof CAPABILITIES;

/** Every step: the engine's, then the installed modules' (their defaults also from site/models.ts). */
export function capabilities(): Record<string, Capability> {
  const all: Record<string, Capability> = { ...CAPABILITIES };
  for (const m of serverModules()) for (const [key, step] of Object.entries(m.models ?? {})) all[key] = { ...step, default: DEFAULTS[key] ?? "default" };
  return all;
}

/** Names of the active steps currently routed to a service, using the same choices as model calls. */
export async function stepsOnService(service: string, models?: ReadonlySet<string>): Promise<string[]> {
  const current = await modelSources();
  const steps = Object.entries(capabilities())
    .filter(([key, c]) => {
      if (c.idle?.()) return false;
      const primary = current[key]!.model;
      return [primary, fallbackModelFor(key, primary)].some(key => {
        const model = key && MODELS[key];
        return model && model.service === service && (!models || models.has(model.model));
      });
    })
    .map(([, c]) => c.label.split("（")[0]!);
  return [...new Set(steps)];
}

let cache: { at: number; switches: Record<string, string> } | null = null;

/** The name each admin switch holds, registered or not. */
async function switches(): Promise<Record<string, string>> {
  if (cache && Date.now() - cache.at < 60_000) return cache.switches;
  const rows = await sql<{ key: string; value: { model?: string } }[]>`SELECT key, value FROM settings WHERE key LIKE 'models.%'`;
  const map: Record<string, string> = {};
  for (const r of rows) if (r.value?.model) map[r.key.slice("models.".length)] = r.value.model;
  cache = { at: Date.now(), switches: map };
  return map;
}

export function invalidateModelCache() {
  cache = null;
}

/** Whether a registered model explicitly declares image input support. Unspecified means text-only. */
export function modelSupportsVision(model: string): boolean {
  return MODELS[model]?.vision === true;
}

/** Whether a step can use a registered model. A model that reads images writes text as well. */
export function capabilityAcceptsModel(capability: Capability, model: { vision?: boolean }): boolean {
  return !capability.vision || model.vision === true;
}

/** The model a capability uses now: admin switch, else environment, else the code default. */
export async function modelFor(capability: CapabilityKey | (string & {})): Promise<string> {
  const c = capabilities()[capability];
  if (!c) throw new Error(`unknown model step: ${capability}`);
  const held = (await switches())[capability];
  const chosen = held && MODELS[held] ? held : process.env[c.env] ?? c.default;
  return MODELS[chosen] ? chosen : c.default;
}

/** Where the current choice comes from, for the admin page; `invalid` is an unregistered name passed over to reach it. */
export async function modelSources(): Promise<Record<string, { model: string; source: "admin" | "env" | "default"; invalid?: string }>> {
  const held = await switches();
  const out: Record<string, { model: string; source: "admin" | "env" | "default"; invalid?: string }> = {};
  for (const [key, c] of Object.entries(capabilities())) {
    const pick = held[key];
    const env = process.env[c.env];
    if (pick && MODELS[pick]) {
      out[key] = { model: pick, source: "admin" };
      continue;
    }
    const invalid = pick ?? (env && !MODELS[env] ? env : undefined);
    out[key] = { ...(env && MODELS[env] ? { model: env, source: "env" as const } : { model: c.default, source: "default" as const }), ...(invalid ? { invalid } : {}) };
  }
  return out;
}

export function fallbackModelFor(capability: string, primary: string): string | undefined {
  return Object.values(MODELS).find(model => model.fallbackFor?.[capability] === primary && model.service !== MODELS[primary]!.service)?.key;
}

/** Preserve an explicit primary choice; only the site's evaluated pair may fail over. */
export async function modelRoute(capability: CapabilityKey | (string & {})): Promise<{ model: string; fallbackModel?: string }> {
  const model = await modelFor(capability);
  return { model, fallbackModel: fallbackModelFor(capability, model) };
}
