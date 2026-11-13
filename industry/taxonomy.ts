// 이 업계의 분류 체계: 카테고리, 태그 어휘표, 회사(주체) 명부, 그리고 혼동 방지를 위한 신원 색인.
// 모델은 여기의 어휘표로 태그를 달고, 주제 페이지(topics.json)는 태그로 묶고, 필터 바는 카테고리로 묶습니다.
// 업계를 바꿀 때: 카테고리의 key는 주소에 나타나므로(/all?category=…) 상용 후에는 바꾸지 마십시오. 태그와 명부는 수시로 추가·삭제 가능합니다.

/**
 * 웹의 카테고리 (필터, 카드 배지, RSS 분류 피드). key는 주소와 인터페이스의 신원이므로 상용 후에는 바꾸지 마십시오.
 * section은 일간 리포트의 섹션 제목입니다 (여러 카테고리가 한 섹션을 같이 쓸 수 있으며, 여기 순서대로 배치됩니다).
 * guide는 구조화 추출 모델에게 이 카테고리가 무엇을 수집하는지, 인접 카테고리와의 경계가 어디인지 알려줍니다 (전체 분류 원칙은 prompts/structure.md에 있습니다).
 * commentary는 논평류(튜토리얼, 의견)를 표시합니다: 일간에 이미 실린 사건의 논평류 후속 기사는 한 줄 속보 취급을 합니다 (그 사건을 다룬 출처가 충분히 많을 때는 예외).
 * 어느 카테고리에도 분류되지 않은 자료는, 일간에서 key가 industry인 첫 번째 카테고리가 속한 섹션에 들어갑니다 (없으면 마지막 섹션).
 * tagColor는 Feishu 푸시 카드에서 제목 뒤에 붙는 소형 라벨의 색상입니다 (Feishu text_tag의 색상 이름).
 * feedLabel은 분류 RSS 제목에 쓰는 이름입니다 (없으면 label 사용). 공개 인터페이스·RSS·MCP에서 한 카테고리를 다른 카테고리로 합쳐 발행하려면 사이트 설정에 지정하십시오 (site/site.ts의 PUBLIC_CATEGORIES).
 */
export const CATEGORIES = [
  { key: "ai-models", tagColor: "indigo", label: "모델", feedLabel: "AI 모델", section: "모델 출시/업데이트", guide: "모델 자체의 출시, 버전, 가중치 공개, 능력 또는 가격 변동, 그리고 기존 리더보드상의 모델 성적. 기존 벤치마크의 평가 점수를 발표하는 것은 새 벤치마크 출시도 아니고, 튜토리얼도 아니다." },
  { key: "ai-products", tagColor: "turquoise", label: "제품", feedLabel: "AI 제품", section: "제품 출시/업데이트", guide: "사용 가능한 AI 제품, 기능, 애플리케이션, 도구, API, 플랫폼, 엔지니어링 컴포넌트의 출시 업데이트. 모델 제조사가 출시한 추론 프레임워크·연산자 라이브러리·하드웨어 적응 컴포넌트도 제품이며, 제조사명 때문에 모델로 분류해서는 안 된다." },
  { key: "industry", tagColor: "orange", label: "산업", feedLabel: "산업 동향", section: "산업 동향", guide: "이미 발생한 회사 경영, 투자·인수·합병, 인사, 협력, 소송, 정책, 실제 안전 사고와 조사 진행. 뉴스의 당사자가 본인을 보조하며 태도를 드러내도 의견으로 바뀌지 않는다." },
  { key: "paper", tagColor: "violet", label: "논문", feedLabel: "논문", section: "논문 연구", guide: "새로운 연구 방법, 실험 설계와 발견이 핵심인 논문·기술 보고서·새 벤치마크·연구 데이터셋. 체계적 레드팀 실험은 연구에 속하며, 기존 리더보드 성적은 모델로, 실제 사고의 뉴스 조사는 산업으로 분류한다." },
  { key: "tip", tagColor: "green", label: "튜토리얼", section: "실용·오피니언", guide: "독자가 따라갈 수 있는 방법, 프롬프트, 도구 사용법, 엔지니어링 실천 회고와 기술 해설. 핵심은 재사용 가능한 방법이다. 단순한 도구 출시는 제품으로, 방법 없는 태도·예측뿐이면 의견으로 분류한다.", commentary: true },
  { key: "opinion", tagColor: "purple", label: "의견", section: "실용·오피니언", guide: "핵심이 작성자의 해석·판단·주장·예측·논평 또는 인터뷰 의견인 글. 시장을 논했다고 자동으로 산업으로 분류하지 않고, 작성자가 유명인이라고 자동으로 의견으로 분류하지 않는다.", commentary: true },
] as const satisfies ReadonlyArray<{ key: string; tagColor: string; label: string; feedLabel?: string; section: string; guide: string; commentary?: true }>;

/**
 * 이 업계에서 가장 주목받는 출시류 (AI 업계는 새 모델): 일간 리포트 헤드의 “N개 신규 모델”, 분류를 바꾼 뒤 이미 나간 리포트를 수정하는 기준도 이것 기준입니다.
 * category는 카테고리, tag는 태그이며, 둘 다 맞을 때만 집계됩니다. unit은 숫자 뒤에 붙습니다.
 * 그런 출시류가 없는 업계라면 null로 설정하면 헤드에 이 숫자가 표시되지 않습니다.
 */
export const RELEASE: { category: string; tag: string; unit: string } | null = { category: "ai-models", tag: "모델 출시", unit: "개의 신규 모델" };

/** 주간·월간 총괄이 보도 안에서 굳이 출처를 찾지 않고 바로 써도 되는 업계 일반어 (소문자). 사이트명은 자동으로 포함됩니다. */
export const PLAIN_TERMS: readonly string[] = ["ai", "api", "llm", "gpu", "agi", "ceo", "ipo"];

/**
 * 내용 이해 단계에서 각 자료에 매기는 “콘텐츠 유형” (prompts/content-understanding.md에 쓰여 있으며, 유형을 바꾸면 그 프롬프트도 동기화해야 합니다).
 * 평가 프롬프트(prompts/selection-score.md)가 유형별로 5차원에 다른 가중치를 부여합니다.
 */
export const ITEM_TYPES = ["model_release", "product_launch", "tool_or_prompt", "research_paper", "industry_event", "opinion_analysis", "tutorial_explainer"] as const;

// ── 태그 어휘표 ────────────────────────────────────────────────────────────────────────────

/** 각 자료의 첫 번째 태그는 반드시 이 “분류 태그” 중 하나여야 합니다. */
export const CATEGORY_TAGS = [
  "제품 업데이트", "모델 출시", "논문/연구", "오픈소스/저장소", "튜토리얼/실전", "현상/트렌드", "오피니언", "벤치마크/평가", "안전/정렬", "산업 동향", "정책/규제",
  "비AI/범용 도구", "기타",
] as const;

/** 선택 가능한 주제 태그. */
export const TOPIC_TAGS = [
  "Agent", "코딩", "추론", "멀티모달", "음성", "비디오", "이미지 생성", "RAG", "온디바이스", "데이터/학습", "검색", "배포/엔지니어링", "오픈소스 생태계", "피지컬 AI", "MCP/도구 호출",
] as const;

/** 선택 가능한 엔티티 태그 (회사, 기관, 플랫폼). */
export const ENTITY_TAGS = ["OpenAI", "Anthropic", "DeepSeek", "DeepMind", "Google", "Meta", "Microsoft", "xAI", "Hugging Face", "GitHub", "arXiv"] as const;

/** 모델이 흔히 쓰는 근접어를 어휘표의 형태로 통일합니다. */
export const TAG_SYNONYMS: Readonly<Record<string, string>> = {
  "튜토리얼/활용": "튜토리얼/실전", "튜토리얼/활용법": "튜토리얼/실전", "가이드": "튜토리얼/실전", "활용법": "튜토리얼/실전", "팁": "튜토리얼/실전", "최선의 실천": "튜토리얼/실전", "실전": "튜토리얼/실전",
  "협력/생태계": "산업 동향", "투자/인수": "산업 동향", "회사 동향": "산업 동향",
  협력: "산업 동향", 생태계: "산업 동향", 투자: "산업 동향", 인수: "산업 동향", 합병: "산업 동향",
  정책: "정책/규제", 규제: "정책/규제", 법규: "정책/규제", 안전: "안전/정렬", 정렬: "안전/정렬",
  논문: "논문/연구", 연구: "논문/연구", paper: "논문/연구", papers: "논문/연구",
  "open-source": "오픈소스/저장소", 오픈소스: "오픈소스/저장소", 저장소: "오픈소스/저장소", repo: "오픈소스/저장소",
  튜토리얼: "튜토리얼/실전", 활용: "튜토리얼/실전", 방법: "튜토리얼/실전",
  제품: "제품 업데이트", 업데이트: "제품 업데이트", 출시: "모델 출시", 모델: "모델 출시", 트렌드: "현상/트렌드", 현상: "현상/트렌드", 의견: "오피니언",
  "비디오 생성": "비디오", 비ai: "비AI/범용 도구", "non-ai": "비AI/범용 도구", "범용 도구": "비AI/범용 도구", "개발 도구": "비AI/범용 도구",
  "보안 스캔": "비AI/범용 도구", devops: "비AI/범용 도구", 산업: "산업 동향", 동향: "산업 동향",
};

// ── 회사와 주체 ──────────────────────────────────────────────────────────────────────────

/**
 * 회사 주제: id → 표시명, 카드에 표시되는 태그 (null이면 entity:<id>로만 집계), 별칭.
 * aliases는 구조화 추출 모델에게 보여주는 것으로, orgNames는 이 회사가 소식을 낼 때 첫머리에 쓰는 조직명(회사·연구소·팀)이며,
 * 자기 주제 페이지에서 독자는 누구를 말하는지 알 수 있으므로 생략 가능합니다. otherNames는 회사의 다른 호칭(공식 계정명, 하위 브랜드)입니다.
 * 이 이름들은 모두 누가 말하는지 알아내는 데 쓰이며, 예를 들어 사실의 주체를 발표자에 대응시킵니다.
 */
export const ENTITIES: Record<string, { name: string; displayTag: string | null; aliases: string[]; orgNames?: string[]; otherNames?: string[] }> = {
  "world-labs": { name: "World Labs", displayTag: null, aliases: ["World Labs"] },
  "thinking-machines": { name: "Thinking Machines Lab", displayTag: null, aliases: ["Thinking Machines"] },
  amd: { name: "AMD", displayTag: null, aliases: ["AMD", "Advanced Micro Devices"] },
  openai: { name: "OpenAI", displayTag: "OpenAI", aliases: ["OpenAI", "ChatGPT", "Sora", "Codex", "GPT"], orgNames: ["OpenAI"], otherNames: ["OpenAI Developers"] },
  anthropic: { name: "Anthropic", displayTag: "Anthropic", aliases: ["Anthropic", "Claude"], orgNames: ["Anthropic"], otherNames: ["Claude Code"] },
  google: { name: "Google", displayTag: "Google", aliases: ["Google", "DeepMind", "Gemini", "谷歌", "구글"], orgNames: ["Google DeepMind", "Google Research", "Google", "DeepMind", "谷歌", "구글"], otherNames: ["Google AI", "Google Labs", "Google Cloud"] },
  deepseek: { name: "DeepSeek", displayTag: "DeepSeek", aliases: ["DeepSeek", "深度求索", "딥시크"], orgNames: ["DeepSeek", "深度求索", "딥시크"] },
  qwen: { name: "Qwen", displayTag: null, aliases: ["Qwen", "通义", "阿里", "큐원", "알리바바"], orgNames: ["通义千问", "通义实验室", "阿里巴巴", "阿里云", "阿里", "Qwen Team", "Qwen", "Alibaba", "큐원", "알리바바"], otherNames: ["千问", "千问APP", "Alibaba Cloud"] },
  kimi: { name: "Kimi", displayTag: null, aliases: ["Kimi", "月之暗面", "Moonshot", "Kimi / 月之暗面", "키미", "문샷"], orgNames: ["Moonshot AI", "月之暗面", "Kimi", "키미"] },
  minimax: { name: "MiniMax", displayTag: null, aliases: ["MiniMax", "海螺"], orgNames: ["MiniMax", "稀宇科技"] },
  zhipu: { name: "GLM", displayTag: null, aliases: ["智谱", "GLM", "Z.ai", "즈푸AI"], orgNames: ["智谱AI", "智谱", "Zhipu AI", "Z.ai", "즈푸AI"], otherNames: ["Zhipu"] },
  xai: { name: "xAI", displayTag: "xAI", aliases: ["xAI", "Grok"], orgNames: ["SpaceX Super Intelligence", "SpaceXAI", "SpaceXSI", "xAI"], otherNames: ["Grok Bot"] },
  meta: { name: "Meta", displayTag: "Meta", aliases: ["Meta", "Llama", "메타"], orgNames: ["Meta Superintelligence Labs", "Meta AI", "Meta", "메타"], otherNames: ["AI at Meta", "Muse"] },
  microsoft: { name: "Microsoft", displayTag: "Microsoft", aliases: ["Microsoft", "微软", "Copilot", "마이크로소프트"], orgNames: ["Microsoft Research", "Microsoft AI", "Microsoft", "微软", "마이크로소프트"] },
  nvidia: { name: "NVIDIA", displayTag: null, aliases: ["NVIDIA", "英伟达", "엔비디아"], orgNames: ["NVIDIA", "英伟达", "엔비디아"] },
  "hugging-face": { name: "Hugging Face", displayTag: "Hugging Face", aliases: ["Hugging Face"], orgNames: ["Hugging Face", "HuggingFace"] },
  cursor: { name: "Cursor", displayTag: null, aliases: ["Cursor", "Anysphere"], orgNames: ["Cursor"] },
  openrouter: { name: "OpenRouter", displayTag: null, aliases: ["OpenRouter"], orgNames: ["OpenRouter"] },
};

/**
 * 신원 사전: 요약과 제목에 등장하는 회사는 원문에도 반드시 등장해야 하며, 그렇지 않으면 원제목으로 되돌리고 요약을 버립니다 (모델의 혼동 방지).
 * 이 업계에 그런 문제가 없다면 빈 배열로 두십시오.
 */
export const IDENTITY_LEXICON: ReadonlyArray<{ id: string; name: string; patterns: RegExp[] }> = [
  { id: "openai", name: "OpenAI", patterns: [/openai|chatgpt|\bgpt-?[o\d]|\bsora\b|\bcodex\b/i] },
  { id: "anthropic", name: "Anthropic", patterns: [/anthropic|\bclaude\b/i, /\b(?:opus|sonnet|haiku)\s*\d+(?:[.\-]\d+)*\b/i, /\bfable\s*\d+(?:[.\-]\d+)*\b|\bmythos\b/i] },
  { id: "google", name: "Google / Gemini", patterns: [/google|deepmind|\bgemini\b|notebooklm|\bveo\s?\d|\bAlphaFold\b|\bAMIE\b|구글/i] },
  { id: "deepseek", name: "DeepSeek", patterns: [/deepseek|深度求索|딥시크/i] },
  { id: "xai", name: "xAI / Grok", patterns: [/\bxai\b|\bgrok\b/i] },
  { id: "meta", name: "Meta / Llama", patterns: [/\bMeta\b|메타(?!데이터|인지|정보|분석|자아|절충)/, /\bmeta\s?ai\b|\bllama\b/i] },
  { id: "microsoft", name: "Microsoft / Copilot", patterns: [/microsoft|copilot|微软|마이크로소프트/i] },
  { id: "nvidia", name: "NVIDIA", patterns: [/nvidia|英伟达|엔비디아|\bnemotron\b|\bnemo\b|\bblackwell\b|\brubin(?:\s+ultra)?\b|\bcuda\b/i] },
  { id: "qwen", name: "Qwen", patterns: [/\bqwen|通义|千问|큐원/i] },
  { id: "hugging-face", name: "Hugging Face", patterns: [/hugging\s?face/i] },
  { id: "cursor", name: "Cursor", patterns: [/\bCursor\b/] },
  { id: "kimi", name: "Kimi", patterns: [/\bkimi\b|月之暗面|\bmoonshot\s?ai\b|키미/i] },
  { id: "openrouter", name: "OpenRouter", patterns: [/openrouter/i] },
  { id: "minimax", name: "MiniMax", patterns: [/minimax/i] },
  { id: "zhipu", name: "GLM", patterns: [/智谱|\bglm-?[4-9]/i] },
  { id: "hunyuan", name: "Tencent Hunyuan", patterns: [/混元|hunyuan/i] },
  { id: "doubao", name: "ByteDance Doubao", patterns: [/豆包|doubao|字节跳动|bytedance/i] },
  { id: "mistral", name: "Mistral", patterns: [/mistral/i] },
  { id: "perplexity", name: "Perplexity", patterns: [/\bPerplexity\b/] },
  { id: "runway", name: "Runway", patterns: [/\brunway\b/i] },
  { id: "suno", name: "Suno", patterns: [/\bsuno\b/i] },
  { id: "midjourney", name: "Midjourney", patterns: [/midjourney/i] },
  { id: "stability-ai", name: "Stability AI", patterns: [/stability\s?ai/i] },
  { id: "elevenlabs", name: "ElevenLabs", patterns: [/eleven\s?labs/i] },
  { id: "vllm", name: "vLLM", patterns: [/\bvllm\b/i] },
  { id: "ollama", name: "Ollama", patterns: [/\bollama\b/i] },
  { id: "windsurf", name: "Windsurf", patterns: [/windsurf/i] },
  { id: "devin", name: "Devin", patterns: [/\bdevin\b/i] },
  { id: "manus", name: "Manus", patterns: [/\bmanus\b/i] },
  { id: "apple", name: "Apple AI", patterns: [/\bapple\s?(intelligence|silicon|ai)\b|苹果(智能|\s?AI)|애플\s?(인텔리전스|AI|인텔리)/i] },
  { id: "amazon", name: "Amazon / AWS", patterns: [/amazon|\baws\b|亚马逊|아마존/i] },
  { id: "baidu", name: "Baidu ERNIE", patterns: [/百度|baidu|文心|\bernie\s?bot\b|바이두/i] },
];

/** 이 도메인의 글은 게시자가 해당 회사입니다 (GitHub, arXiv 같은 호스팅 플랫폼은 포함되지 않습니다). */
export const PUBLISHER_DOMAINS: ReadonlyArray<{ entityId: string; domains: readonly string[] }> = [
  { entityId: "openai", domains: ["openai.com"] },
  { entityId: "anthropic", domains: ["anthropic.com", "claude.com"] },
  { entityId: "google", domains: ["deepmind.google", "ai.google", "blog.google"] },
  { entityId: "deepseek", domains: ["deepseek.com"] },
  { entityId: "xai", domains: ["x.ai"] },
  { entityId: "meta", domains: ["ai.meta.com"] },
  { entityId: "microsoft", domains: ["microsoft.com"] },
  { entityId: "nvidia", domains: ["nvidia.com"] },
  { entityId: "qwen", domains: ["qwen.ai"] },
  { entityId: "cursor", domains: ["cursor.com"] },
  { entityId: "openrouter", domains: ["openrouter.ai"] },
];

/** 원문의 이런 표기도 해당 회사를 가리킨 것으로 간주합니다. */
export const IDENTITY_CONTEXT_ALIASES: ReadonlyArray<{ entityId: string; pattern: RegExp }> = [
  { entityId: "meta", pattern: /@AIatMeta\b/i },
  { entityId: "zhipu", pattern: /\bZhipu(?:\s+AI\b|['’]s\b)/i },
];
