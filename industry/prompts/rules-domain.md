
【AI 분야 번역 규칙 — 본 플랫폼은 100% AI/ML/LLM 산업 콘텐츠입니다. 엄격히 준수할 것】

1. 모호성 기본값: 다음 단어는 한국어에서 비(非)AI 의미와 혼동될 수 있으므로, **일률적으로 AI 의미로 번역**합니다.
   - LLM = LLM(대규모 언어 모델) (“법학 석사”로 절대 번역하지 말 것)
   - Token / tokens = 모델 token (영문 유지; “대리명”·“권표시” 식으로 번역하지 말 것)
   - Transformer = Transformer 아키텍처 (영문 유지; “변환기”로 번역하지 말 것)
   - Diffusion = 디퓨전/확산 모델 (AI 생성 모델이며 물리적 확산이 아님)
   - Agent / Agentic = AI 에이전트 / 에이전트적인 (“대리인”·“중개인”로 번역하지 말 것)
   - Alignment = 정렬, 얼라인먼트 (AI 안전 맥락)
   - Inference = 추론 (모델 생성)
   - Reasoning = 추론 (주의: inference와 reasoning 모두 “추론”으로 번역; 필요할 때만 "Chain-of-Thought" 계열은 “연쇄 추론”으로 구분. reasoning model은 o1/o3/R1 같은 사고형 모델을 가리킴)
   - Embedding = 임베딩 (영문 유지 가능)
   - Distillation = 지식 증류
   - Hallucination = 모델 환각, 할루시네이션
   - Fine-tune / Fine-tuning = 파인튜닝, 미세 조정
   - Pretrain / Pretraining = 사전 학습
   - Context window = 컨텍스트 윈도우
   - Prompt = 프롬프트
   - Skill / Skills = 스킬 (Claude 같은 Agent 프레임워크의 능력 패키지; “특기”로 번역하지 말 것)

2. 다음 고유명사는 **일률적으로 영문 원문을 유지**하며, 번역하거나 한글 병주를 붙이지 않습니다.
   - AI 회사: OpenAI / Anthropic / Google DeepMind / xAI / Meta AI / Mistral / DeepSeek / Cohere / Hugging Face(HF) / Runway / ElevenLabs / Suno / Pika / Midjourney / Perplexity
   - 모델군(예시 + 일반 규칙): GPT / Claude / Gemini / Llama / Qwen / Grok / o 시리즈 / DeepSeek / Mistral / Mixtral / Phi / Sora / Veo / Imagen
     **규칙**: 모든 대형 모델군명, 제품 코드네임은 영문 유지
   - 모델 버전(예시 + 일반 규칙): GPT-5 / Claude 4.7 / Claude Sonnet 4.6 / Llama 4 / Gemini 3 / o3 / o4 / DeepSeek-V4 / Qwen3.7
     **규칙**: 버전 문자열은 한 글자도 바꾸지 말 것(4o / 4.7 / 405B / V4 / R1 같은 영숫자 접미사 포함). “405B”를 “4,050억”으로, “V4”를 “4세대”로 “번역적 확장”하지 말 것
   - 기술 약어(예시 + 일반 규칙): LLM / RAG / RLHF / DPO / LoRA / QLoRA / PEFT / MoE / CoT / ReAct / KV cache / SOTA / AGI / MCP / ADK / NPU / GPU / TPU
     **규칙**: 2–5개 알파벳의 대문자 약어는 기본적으로 AI/ML 의미로 영문 유지
   - 평가 벤치마크(예시 + 일반 규칙): MMLU / GPQA / HumanEval / SWE-bench / SWE-bench Verified / AIME / HLE / ARC-AGI / ARC-AGI 2 / MT-Bench / Chatbot Arena / Aider Polyglot / LiveCodeBench
     **규칙**: -bench / -eval로 끝나거나 전부 대문자인 평가명은 영문 유지
   - AI 도구/제품: Cursor / Copilot / Codex / Aider / Devin / Cline / Claude Code / Windsurf / Zed / v0 / Bolt / Lovable / Replit Agent
   - Agent 프레임워크: LangChain / LangGraph / LlamaIndex / CrewAI / AutoGen / Pydantic AI / Vercel AI SDK / DSPy
   - 추론/배포: Ollama / vLLM / SGLang / TensorRT / Triton / CUDA / ROCm
   - 일반 기술: API / SDK / CLI / IDE / SaaS / CDN / SSO / OAuth / JWT / WebSocket / SSE / gRPC

3. 중국 업체의 브랜드명은 **영문 표기를 유지**하십시오 (한국어 매체 관행):
   - Qwen / GLM / Kimi / DeepSeek / Step / Yi / MiniMax / LongCat / Skywork / MiniCPM — 모두 영문 그대로. Doubao / Hunyuan / Kling / Jimeng 역시 영문 유지.

4. 코드 / 명령어 / URL / 숫자 단위는 **한 글자도 바꾸지 말고** 유지합니다:
   - 백틱 코드 `code`는 번역하지 않음
   - 명령어(/code-review, pip install, npm run 등)는 번역하지 않음
   - URL은 원문 그대로
   - 숫자+단위: 8k context / 175B params / 3.5x speedup / $3 per M tokens / 99.9%
   - 금액, 파라미터 수, 비율, 구간은 반드시 원문의 아라비아 숫자와 단위를 유지할 것. $10B–$100B를 “수천억에서 수조 원 규모” 같은 한국어 수사로 바꾸지 말 것
