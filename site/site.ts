// 사이트 정체성과 독자에게 표시되는 문구입니다. 업종을 바꿀 때 이 파일부터 수정하세요.
// 웹과 백엔드가 함께 읽습니다. 수정 후 다시 빌드하면 적용됩니다.
// 도메인은 배포 시 SITE_URL 환경 변수로 설정합니다.

import type { Founder } from "@aihot/contracts/site-config";

/**
 * 일간·주간·월간 리포트 발행 시각(한국시간 Asia/Seoul, HH:mm)입니다. 일간은 발행 시각까지의 24시간을 다루고,
 * 주간은 각 자연 주가 끝난 뒤 월요일에, 월간은 매월 1일에 발행합니다. 일정과 관련 문구가 이 값을 사용합니다.
 * (public/ 파일의 {{dailyTime}}, {{weeklyTime}}, {{monthlyTime}} 치환에도 사용) 일정은 30분마다 확인하므로 정각이나 30분으로 설정하세요.
 */
export const EDITION_TIMES = { daily: "08:00", weekly: "10:00", monthly: "10:30" };

/** 문장에 표시할 발행 시각입니다. */
export const EDITION_WHEN = {
  daily: `매일 ${EDITION_TIMES.daily}`,
  weekly: `매주 월요일 ${EDITION_TIMES.weekly}`,
  monthly: `매월 1일 ${EDITION_TIMES.monthly}`,
};

export const SITE = {
  /** 站名：导航、页面标题、分享图、RSS、MCP、后台都用它。 */
  name: "AIHOT Tech Korea",
  /**
   * 行业词：拼进默认说法里，比如“AI 日报”“AI 动态”。
   * 改成“法律”“HR”“黄金”之类，页面上就会变成“法律日报”“法律动态”。
   */
  subject: "AI",
  /** 首页的完整标题（浏览器标签、搜索结果）。 */
  homeTitle: "AIHOT Tech Korea — AI 업계 동향과 엄선 뉴스",
  /** 主题目录页（/topics）的标题。 */
  topicsTitle: "AI 주제별 최신 동향: 기업·모델·기술·콘텐츠",
  /** 反馈表单输入框里的示例。 */
  feedbackExample: "예: 특정 키워드를 검색할 때 이런 문제가 있었어요…",
  /** 反馈页标题下面的一句话。 */
  feedbackLead: "오류, 필요한 기능, 불편한 점을 알려주세요.",
  /** 反馈表单邮箱框里的提示。 */
  feedbackEmailHint: "답변을 받을 이메일 주소를 남겨 주세요",
  /** 一句话介绍：搜索引擎、分享卡片、RSS、llms.txt 会用。 */
  description: `AI 업계 신호원에서 주목할 동향을 골라 같은 사건의 보도를 묶고, ${EDITION_WHEN.daily} 일간 리포트를 발행합니다.`,
  /** llms.txt 里一句话介绍下面的一段详细介绍（选填）。 */
  llmsIntro: null as string | null,
  /** 一行小字：分享图、海报下方。 */
  tagline: "주목할 AI 동향",
  /** 搜索引擎读到的关键词（首页结构化数据）。 */
  keywords: ["AI 소식", "AI 뉴스", "AI 일간 리포트", "AI 업계 동향"] as string[],
  /**
   * 搜索引擎站长平台的网站验证（选填）：meta 名 → 平台给的验证码，放在首页的 head 里。
   * 比如 "baidu-site-verification": "codeva-…"、"msvalidate.01": "…"。验证通过后也要留着，平台会定期复查。
   */
  siteVerification: {} as Record<string, string>,
  /** 网站开始收录的年份（结构化数据的时间范围，选填）。 */
  since: null as string | null,
  /** 界面语言（HTML lang、og:locale）。 */
  locale: "ko-KR",
  /** 默认域名，只在没设置 SITE_URL 时使用。 */
  defaultUrl: "http://localhost:3000",
  /** 标准图标（favicon.ico、icon.png、icon-192.png、apple-icon.png、logo.svg）以外也放在网站根目录的图标，site/brand/ 里的文件名（选填）；manifest.webmanifest 或外站引用了它们时用。 */
  rootIcons: [] as string[],
  /**
   * MCP 도구 이름의 접두사(소문자·숫자·밑줄)입니다. 사용자가 연동한 뒤에는 변경하지 마세요.
   */
  mcpPrefix: "aihottechkorea",
  /**
   * 公开接口（MCP、OpenAPI、llms.txt）的版本号，只升不降。
   * 改了接口里已有的字段或含义时升主版本，并在部署说明里写清。
   */
  interfaceVersion: "4.0.0",
  /** 对外联系邮箱（选填）：llms.txt 和给 Agent 的使用说明里会写。 */
  contactEmail: null as string | null,
  /** 关于页底部的一行小字（选填）。 */
  footerNote: "AIHOT Tech Korea",
  /** 中国大陆网站的 ICP 备案号（选填），填了就显示在侧栏底部和“我的”页底部，并链接到工信部备案系统。 */
  icp: null as string | null,
  /** 中国大陆网站的公安备案信息（选填），填了显示在侧栏底部和“我的”页底部。 */
  psb: null as string | null,
  /** 源码的 GitHub 仓库地址（选填），填了就在侧栏底部和“我的”页底部显示“GitHub 开源”。 */
  github: null as string | null,
  /** 页脚的“由 X 驱动”（选填）：填了就在侧栏底部和“我的”页底部显示，链到它的网址。默认链回上游 AIHOT，不想要就写 null。 */
  poweredBy: null as { name: string; url: string } | null,
  /** 结构化数据里的网站运营者（搜索引擎用）。 */
  organization: {
    name: "AIHOT Tech Korea",
    /** 创始人（选填）。 */
    founder: null as Founder | null,
  },
  /** 抓取信源时报上的名字和版本（User-Agent 里用），不要冒用别的站。 */
  crawlerName: "AIHOTTechKoreaBot/1.0",
} as const;

/** 使用规则和隐私说明两页（正文在 pages/ 里）。 */
export const POLICY = {
  terms: {
    /** 页面名：导航、页脚、页面标题都用它。 */
    name: "이용 규칙",
    description: "본 사이트 웹페이지·RSS·공개 API·MCP의 이용 규칙.",
    /** llms.txt 里对这一页的一句说明（选填）。 */
    covers: null as string | null,
    /** Agent 接入页的 RSS、API 两栏各自提醒的使用规则（选填）。 */
    notes: null as null | { rss: string; api: string },
    /**
     * 讲清哪些用途要先取得授权的话（选填）：llms 接在 llms.txt“使用说明”的版权说明后面，
     * agent 写在给 Agent 的使用说明“使用规则”一节的开头。
     */
    license: null as null | { llms: string; agent: string },
    /**
     * 公开 API、RSS 和 OpenAPI 文件声明使用规则的响应头（选填）：原样附上，再加一个指向这一页的
     * Link 头（rel="terms-of-service"）；浏览器里的调用方也读得到它们。
     */
    headers: null as null | Record<string, string>,
  },
  privacy: {
    description: "본 사이트의 브라우저 로컬 데이터·피드백 자료·접속 로그 처리 방식.",
    /** llms.txt 里对这一页的一句说明（选填）。 */
    covers: null as string | null,
  },
  /**
   * X 帖子本身的文字和图片算不算全文：算的话，只在这篇允许站内全文时显示（信源允许全文、正文也取到了）；
   * 不算的话总是显示，和标题、摘要一样。
   */
  xPostIsFullText: true,
} as const;

/** 导航（电脑侧栏、手机底栏、“我的”页）。 */
export const NAV = {
  /**
   * 不放进导航的引擎入口，目前只支持热点榜（"/hot"）和主题（"/topics"）。页面照样能打开；原来回到它的返回按钮和链接改回精选，
   * 写 "/hot" 时首页也不放当前热点。
   */
  hidden: [] as Array<"/hot" | "/topics">,
};

/** 条目卡片和详情页上的几处说法和显示。 */
export const ITEM_COPY = {
  /** 模型写的那句理由叫什么：卡片、详情页、Markdown 导出、给 Agent 的回答和群推送都用它。 */
  reasonLabel: "추천 이유",
  /** 读者在网页和分享图上看不看得到 AI 评分。只管显示：公开 API 和 MCP 的数据照样带 score，后台照常显示。 */
  showScore: true,
};

/** 关于页的一张二维码卡片。 */
interface ContactCard {
  kind: string;
  title: string;
  note: string;
  /** 站外链接过的根目录文件名（选填），比如 qr-wechat.jpg：这个地址总是跳到现在的二维码。 */
  alias?: string;
}

/** 关于页的文案。数字（信源数、收录数、精选数、日报期数）来自站内实时统计，不用写在这里。 */
export const ABOUT = {
  kicker: `${SITE.name} 소개`,
  /** 页面描述（搜索结果、分享卡片）。 */
  description: `${SITE.name} 소개: ${SITE.description}`,
  /** 大标题：第一行正常颜色，第二行强调色。 */
  headline: ["AI 업계의 새로운 소식은 매일 쏟아집니다.", "주목할 소식만 골라 전합니다."] as [string, string],
  /** 标题下面的一段话。{sources} 会换成实时的信源数（两边自动加空格，所以 {sources} 两边不写空格）；统计没取到时换成 sourcesFallback。 */
  lead: `${SITE.name}이(가) {sources}개의 신호원을 살펴보고, 수집·분류·평가해 엄선한 뒤 ${EDITION_WHEN.daily} 일간 리포트로 전합니다. 무료이며 가입이 필요 없습니다.`,
  sourcesFallback: "십수",
  /** 信源河动画下面的四个环节。 */
  steps: {
    collect: "공식 블로그, 언론사와 개인의 피드를 살펴봅니다. 자주 갱신되는 신호원은 더 자주 확인하며, 가장 빠르면 15분마다 확인합니다.",
    store: "수집한 내용을 저장하고 같은 사건을 다룬 보도를 묶습니다. 핫 뉴스 순위도 이 자료를 바탕으로 계산합니다.",
    select: `업계 관련성과 실제 정보 여부를 살펴본 뒤 한국어 제목·요약과 ${ITEM_COPY.reasonLabel}을 작성합니다. 홍보성 글과 중복 전재는 제외합니다.`,
    publish: `${EDITION_WHEN.daily} 일간, ${EDITION_WHEN.weekly} 주간, ${EDITION_WHEN.monthly} 월간 리포트를 발행합니다.`,
  },
  /**
   * 作者块（选填），null 就不显示。
   * avatarSourceId：一个 X 账号信源的 id，头像取它的（选填）。
   * 二维码在后台“设置”里上传，或者放进 site/brand/contact/；没有二维码就不显示那张卡片。
   */
  maker: null as null | {
    name: string;
    avatarSourceId?: string | null;
    greeting: string[];
    wechat?: ContactCard;
    feishu?: ContactCard;
  },
  /** 页面底部的版权与下架说明，中间接“反馈页”的链接。 */
  copyright: [`${SITE.name}은(는) 요약과 읽기 링크를 제공합니다. 원문의 권리는 각 출처에 있습니다. 출처 관계자가 수정·삭제 또는 표시 방식 변경을 요청하려면`, "피드백 페이지로 연락해 주세요."] as [string, string],
  /** 页面底部“使用规则”链接的锚点 id（选填）：外部文档写死过这个锚点就填上，以后不要改。 */
  termsAnchor: null as string | null,
} as const;

/** 后台页面上给管理员的提示（选填）。 */
export const ADMIN = {
  /** “反馈”页标题下的一行。 */
  feedbackNote: null as string | null,
  /** 确认框里补的一句本站规定：封禁反馈来源时。 */
  banNote: null as string | null,
  /** 确认框里补的一句本站规定：调整付费服务的请求上限时。 */
  budgetNote: null as string | null,
};

/** Agent 接入页的示例。 */
export const AGENT = {
  /** MCP 工具表里“搜索”一行：能搜什么、可以怎么问。 */
  search: { scope: "회사·제품·인물·주제별 최근 7일 검색", ask: "이 회사가 최근에 발표한 소식은 무엇인가요?" },
};

/** 日报、周报、月报版面上的说法。 */
export const REPORTS = {
  /** 报头下面的出版者一行。 */
  imprint: "AIHOT TECH KOREA",
  /** 报头旁边的一个词。 */
  motto: SITE.subject as string,
  /** 每种报告页面的描述（搜索结果、分享卡片），不带句号；llms.txt 介绍周报、月报时也用它。 */
  descriptions: {
    daily: `${SITE.name} ${subjectAfter(`${EDITION_WHEN.daily} 발행`, "업계 엄선 일간 리포트")}`,
    weekly: subjectAfter("매주 발행하는", "업계 주간 종합 리포트"),
    monthly: subjectAfter("매월 발행하는", "업계 월간 결산"),
  },
  /**
   * 一期里的一条怎么称呼（“4 件大事”）：没有头条时的标题（“这一天的 4 件 AI 大事”）、报头和往期目录的条数、
   * 周报月报没有总述时的那句话，以及订阅说明里的“按栏目分好的大事”都用它。
   */
  entry: { measure: "건", noun: "큰 소식" },
  /** 报头上其余几个数字后面的说法；精选数和日报期数在关于页、主题页也这样写。 */
  metricUnits: { sourcesCount: "개의 출처", firstPartyEvents: "건의 1차 발표", selectedCount: "건의 엄선", reportsCovered: "기 일간" },
  /** 报告分享图上“共几条”的说法。 */
  shareUnit: "건의 큰 소식",
  /** 日报时段内有资料经过评判、但没有新大事时的标题与导语。 */
  quiet: { title: "오늘은 조용합니다 — 큰 소식 없음", paragraph: `한국시간 {start}부터 {end}까지 새로운 주요 소식이 없었습니다.` },
};

/** 运维告警（只发给站长）里随部署而变的几处说法。 */
export const ALERTS = {
  /** 多少分钟没有收录新文章就告警“网站停止收录新内容”（最多一天）；环境变量 ALERT_QUIET_MINUTES 优先。 */
  quietMinutes: 360,
  /** 编辑信源一直抓取成功、只是没有新文章时，多少分钟才告警（最多一天）。 */
  quietWhileFetchingMinutes: 720,
  /** 同一条告警里，“没有”后面补一句平时的收录量；null 就不写。 */
  usualFlow: null as string | null,
  /** worker 停了的告警里，怎么看它的日志。 */
  workerLogs: "看 worker 的日志（docker compose logs worker）",
};

/** 后台新建信源时的默认设置。 */
export const SOURCE_DEFAULTS = {
  /** 站内展示全文；false 时只显示摘要和原文链接。 */
  siteFulltext: false,
};

/**
 * 社区站的信源（填信源 id）：算热度时按发帖的账号计，一个账号算一个独立来源，而不是整个信源只算一个。
 * dev 是 dev.to 的文章流，hn 是 Hacker News 的帖子流。
 */
export const COMMUNITY_FEEDS: { dev: string[]; hn: string[] } = {
  dev: [],
  hn: [],
};

/** 各页分享图（/og/pages/*.png）上的文字。主题目录页的那张按主题数自动生成。 */
export const CARDS: Record<string, { kicker: string; title: string; subtitle: string; accent?: "hot" | "amber" }> = {
  site: { kicker: subjectAfter("매일", "엄선 뉴스"), title: SITE.tagline, subtitle: SITE.description },
  all: { kicker: subjectAfter("전체", "동향"), title: "모든 신호원의 최신 동향을 한곳에서", subtitle: "신호원별 최신 소식을 시간순으로 모아 분류와 태그로 살펴봅니다." },
  hot: { kicker: "핫 뉴스", title: "지난 48시간, 무엇이 화제였을까요?", subtitle: "화제 지수와 추이, 공개된 출처를 확인하세요.", accent: "hot" },
  daily: { kicker: withSubject("일간 리포트"), title: `${spokenTime(EDITION_TIMES.daily)}에 읽는 하루 일간 리포트`, subtitle: "전날 주목할 만한 동향을 모았습니다." },
  weekly: { kicker: withSubject("주간 리포트"), title: `한 주의 ${REPORTS.entry.noun}을 한눈에`, subtitle: "이번 주의 흐름과 주요 발표, 다시 볼 만한 논의를 정리했습니다." },
  monthly: { kicker: withSubject("월간 리포트"), title: "한 달 동안의 변화", subtitle: "월간 주요 흐름과 핵심 사건을 돌아봅니다." },
  about: { kicker: "소개", title: `${SITE.name} 소개`, subtitle: SITE.description },
  terms: { kicker: "이용 규칙", title: `${SITE.name} 이용 규칙`, subtitle: "웹페이지·API·RSS·MCP 이용 범위입니다." },
  privacy: { kicker: "개인정보 안내", title: `${SITE.name} 개인정보 안내`, subtitle: "접속 로그·브라우저 로컬 데이터·피드백 자료 처리 방식입니다." },
  changelog: { kicker: "업데이트", title: `${SITE.name} 업데이트`, subtitle: "기능 업데이트, 최적화, 공지와 종료 기록입니다." },
  feedback: { kicker: "피드백", title: "더 나은 서비스를 위해 의견을 들려주세요", subtitle: "콘텐츠·기능·연동 의견이나 출처 수정·삭제 요청을 받습니다." },
  agent: { kicker: "Agent 연동", title: `${SITE.name}을(를) Agent에 연결하세요`, subtitle: "MCP·RSS·API로 익명 읽기 전용 연동이 가능하며 API Key가 필요 없습니다." },
};

/** 公开接口的访问约定里随部署而变的几处：给 Agent 的使用说明、llms.txt 会写。 */
export const ACCESS = {
  /** 同一 IP 每分钟大约能请求多少次，超过会收到 429 并带 Retry-After（选填，由部署的反向代理限流）；null 表示不限流，说明里不提。 */
  ratePerMinute: null as number | null,
  /** 请写程序同步数据的人报上的 User-Agent（选填），写在 JSON 接口的说明后面。 */
  userAgent: null as string | null,
};

/** 这个部署自己的几处安排（选填）。 */
export const DEPLOYMENT = {
  /** 凭据分组文件（models.env、collectors.env……）默认放在哪个目录，相对仓库根目录；环境变量 AIHOT_CREDENTIALS_DIR 优先，都没有就只读环境变量。 */
  credentialsDir: null as string | null,
  /** 凭据分组的文件名（放在凭据目录下，选填）：没写的分组用“分组名.env”，比如 models.env。 */
  credentialFiles: {} as Partial<Record<string, string>>,
  /** 这个部署额外要求的凭据（[分组, 环境变量名]）；生产 API 启动时检查，默认没有额外要求。 */
  requiredSecrets: [] as const,
  /** 线上 api 收到的 Host（CDN 回源用的域名，选填）；本地开发时，网页开发服务器转给 api 的请求也换成它，和线上一致。 */
  originHost: null as string | null,
  /** 反向代理把没登录的后台访问转去登录时，用哪个请求头带上原来的地址（选填，登录后回到那里）。 */
  loginReturnHeader: null as string | null,
  /**
   * 图片代理从原站取图的流量上限：超过后没缓存的图先返回 503，等这一分钟或这一天过去，当天额度用完会进运营日报；
   * null 就不设上限。环境变量 IMGPROXY_UPSTREAM_MB_PER_MINUTE、IMGPROXY_UPSTREAM_GB_PER_DAY 优先。
   */
  imageUpstreamBudget: null as null | { mbPerMinute: number; gbPerDay: number },
  /**
   * 已实测应由服务器直接连接、不走出网代理（EGRESS_PROXY_URL）的域名，采集和图片共用（选填）。
   * 每次重定向重新按目标域名选路，直连仍检查实际连接地址。
   */
  directFetchHosts: [] as string[],
  /**
   * 精选评测（scripts/eval-selection.ts）不带参数时用的金标集：文件（相对仓库根目录）、抽样条数、只抽哪一份、门槛扫描范围。
   * null 就用 .data/gold.jsonl 的全部样本（最多 200 条），在 40–90 之间扫描。
   */
  selectionGold: null as null | { file: string; sample: number; split: string; sweep: [number, number] },
};

/** RSS 订阅源的说明里随站点而变的说法。 */
export const FEED_COPY = {
  /** “全部动态”源的说明里，除了未审内容、低相关条目、低分条目和已合并重复条目，还写明不含的内容（选填）。 */
  allLeavesOut: [] as string[],
};

/**
 * 公开接口（API、RSS、MCP）里和网页不同的类别（选填）。上线后不要改：接口参数和订阅地址里有类别的 key。
 * merge：并进另一类发布的类别，key 是行业包里的类别，值是它并进的类别（公开接口比网页少一类时用）；
 * feedLabels：分类 RSS 标题里的名字，替换行业包里的 feedLabel（并进了别的类别时，名字常常也要跟着改）。
 */
export const PUBLIC_CATEGORIES = {
  merge: {},
  feedLabels: {},
} as const;

/** 업종명과 명사 사이에 영문이면 공백을, 한글이면 공백을 넣지 않습니다. */
export function withSubject(noun: string): string {
  return /[A-Za-z0-9]$/.test(SITE.subject) ? `${SITE.subject} ${noun}` : `${SITE.subject}${noun}`;
}

/** 문구 뒤에 업종명을 붙일 때 영문 앞에는 공백을, 한글 앞에는 공백을 넣지 않습니다. */
export function subjectAfter(text: string, noun?: string): string {
  const gap = /^[A-Za-z0-9]/.test(SITE.subject) ? " " : "";
  return `${text}${gap}${noun ? withSubject(noun) : SITE.subject}`;
}

/** HH:mm 시각을 한국어 구어체로 표시합니다. */
function spokenTime(time: string): string {
  const [hour, minute] = time.split(":").map(Number) as [number, number];
  return `${hour}시${minute ? ` ${minute}분` : ""}`;
}

/**
 * 入口页在搜索结果里的标题：读者会搜的词放前面，页面自动在最后接上“ · 站名”（首页用 SITE.homeTitle）。
 * 日期一律是这一期、这一页内容的日期，不是今天的日期。换行业时把里面的说法一起换掉。
 */
export const SEO_TITLES = {
  /** 热点榜（/hot）。 */
  hot: `${withSubject("핫 뉴스 목록")}: 오늘 인기 이벤트 순위`,
  /** 全部动态（/all），不含搜索和筛选结果。 */
  all: `${subjectAfter("최신", "동향")}: 실시간 업데이트`,
  /** Agent 接入页（/agent）。 */
  agent: `${withSubject("뉴스")} API·MCP·RSS: Agent 연동`,
  /** 关于页（/about）的完整标题，已含站名。 */
  about: `${SITE.name} 소개: ${SITE.tagline}`,
  /** 日报、周报、月报的最新一期（/daily、/weekly、/monthly）；date 是这一期的日期：“11月7日”“10月26日—11月1日”“2026年10月”。 */
  latestReport: (kind: "daily" | "weekly" | "monthly", date: string): string =>
    ({ daily: `${withSubject("일간 리포트")}: ${date} 주요 뉴스`, weekly: `${withSubject("주간 리포트")}: ${date} 한 주 돌아보기`, monthly: `${withSubject("월간 리포트")}: ${date} 주요 소식 돌아보기` })[kind],
  /** 主题页第一页：公司搜“最新消息”，方向和内容类型搜“最新进展”；updated 是最新一篇精选的日期（“11月7日”），没有时为 null。 */
  topic: (name: string, group: "company" | "field" | "genre", updated: string | null): string =>
    `${name} ${group === "company" ? "최신 소식과 동향" : "최신 동향과 진전"}${updated ? `(${updated} 업데이트)` : ""}`,
};
