// 이 사이트가 쓸 모델들. 프레임워크에 `default`가 하나 내장되어 있습니다: 환경 변수 LLM_BASE_URL / LLM_API_KEY / LLM_MODEL이 지정하는 모델.
// 여기에는 이름 있는 모델(각각 자기 주소와 키 환경 변수 사용)과 각 단계에서 기본으로 쓰는 모델을 나열합니다; 쓰지 않은 단계는 default를 씁니다.
// 배포 시에는 환경 변수(PREFILTER_MODEL, SCORE_MODEL…) 또는 백그라운드 “모델과 평가” 페이지에서 단계별로 바꿔 고를 수 있습니다.

import type { ModelPreset } from "@aihot/contracts/site-config";
export type { ModelPreset } from "@aihot/contracts/site-config";

/** 이름 있는 모델 예시 (각각 자기 키 설정 필요). 필요 없으면 지워도 됩니다. */
export const PRESETS: Record<string, ModelPreset> = {
  // GLM 5.3 Flash always reasons; the lowest effort keeps short structured tasks fast.
  "glm-5.3-flash": {
    service: "zhipu", model: "glm-5.3-flash", baseUrlEnv: "ZHIPU_BASE_URL", apiKeyEnv: "ZHIPU_API_KEY",
    extra: { thinking: { type: "enabled" }, reasoning_effort: "low" }, jsonMode: true, vision: true,
  },
  // The scorer's parameters for glm-5.3-flash: temperature 1 with high reasoning, up to 180 s per call.
  "glm-5.3-flash-selection": {
    service: "zhipu", model: "glm-5.3-flash", baseUrlEnv: "ZHIPU_BASE_URL", apiKeyEnv: "ZHIPU_API_KEY",
    extra: { thinking: { type: "enabled", clear_thinking: false }, reasoning_effort: "high", top_p: 0.95 }, jsonMode: true, vision: true,
    scoreCall: { temperature: 1, maxTokens: 65_536, timeoutMs: 180_000 },
  },
  // DeepSeek Flash reasons by default; structured tasks switch it off. deepseek-flash-think keeps it on,
  // with room in the output for the reasoning.
  "deepseek-flash": {
    service: "deepseek", model: "deepseek-flash", baseUrlEnv: "DEEPSEEK_BASE_URL", apiKeyEnv: "DEEPSEEK_API_KEY",
    extra: { thinking: { type: "disabled" } }, jsonMode: true,
  },
  "deepseek-flash-think": {
    service: "deepseek", model: "deepseek-flash", baseUrlEnv: "DEEPSEEK_BASE_URL", apiKeyEnv: "DEEPSEEK_API_KEY", reasoningTokens: 4000, jsonMode: true,
  },
  "qwen3.7-flash": {
    service: "dashscope", model: "qwen3.7-flash", baseUrlEnv: "DASHSCOPE_BASE_URL", apiKeyEnv: "DASHSCOPE_API_KEY",
    extra: { enable_thinking: false }, jsonMode: true,
  },
  "qwen3.8-flash": {
    service: "dashscope", model: "qwen3.8-flash", baseUrlEnv: "DASHSCOPE_BASE_URL", apiKeyEnv: "DASHSCOPE_API_KEY",
    extra: { enable_thinking: false }, jsonMode: true,
  },
  "mimo-v2.6-flash": {
    service: "mimo", model: "mimo-v2.6-flash", baseUrlEnv: "XIAOMI_MIMO_BASE_URL", apiKeyEnv: "XIAOMI_MIMO_API_KEY",
    extra: { thinking: { type: "disabled" } }, jsonMode: true,
  },
  "qwen3-vl-flash": {
    service: "dashscope", model: "qwen3-vl-flash", baseUrlEnv: "DASHSCOPE_BASE_URL", apiKeyEnv: "DASHSCOPE_API_KEY",
    extra: { enable_thinking: false }, jsonMode: false, vision: true,
  },
};

/**
 * 각 단계에서 기본으로 쓸 모델 (단계는 백그라운드 “모델과 평가” 페이지 참고). 값은 위의 이름 또는 default. 쓰지 않은 단계는 default를 씁니다.
 * 예: { score: "glm-5.3-flash-selection", groupReview: "mimo-v2.6-flash" }
 */
export const DEFAULTS: Record<string, string> = {};
