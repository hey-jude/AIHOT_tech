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
  /** 사이트명: 내비게이션, 페이지 제목, 공유 이미지, RSS, MCP, 관리자에서 모두 사용합니다. */
  name: "AIHOT Tech Korea",
  /**
   * 업종명: 기본 문구에 붙습니다. 예를 들어 “AI 일간”, “AI 동향”처럼 표시됩니다.
   * “법률”, “HR”, “금” 등으로 바꾸면 페이지에 “법률 일간”, “법률 동향”으로 표시됩니다.
   */
  subject: "AI",
  /** 홈의 전체 제목(브라우저 탭, 검색 결과). */
  homeTitle: "AIHOT Tech Korea — AI 업계 동향과 주요 뉴스",
  /** 주제 목록 페이지(/topics)의 제목. */
  topicsTitle: "AI 주제별 최신 동향: 기업·모델·기술·콘텐츠",
  /** 피드백 양식 입력란의 예시. */
  feedbackExample: "예: 특정 키워드를 검색할 때 이런 문제가 있었어요…",
  /** 피드백 페이지 제목 아래에 표시할 한 줄. */
  feedbackLead: "오류, 필요한 기능, 불편한 점을 알려주세요.",
  /** 피드백 양식 이메일 입력란의 안내 문구. */
  feedbackEmailHint: "답변을 받을 이메일 주소를 남겨 주세요",
  /** 한 줄 소개: 검색 엔진, 공유 카드, RSS, llms.txt에서 사용합니다. */
  description: `AI 업계의 여러 정보원에서 주목할 소식을 골라 같은 사건을 다룬 보도를 묶고, ${EDITION_WHEN.daily}에 일간 리포트를 발행합니다.`,
  /** llms.txt에서 한 줄 소개 아래에 표시할 상세 설명(선택 사항). */
  llmsIntro: null as string | null,
  /** 공유 이미지와 포스터 아래에 표시할 짧은 문구. */
  tagline: "주목할 AI 동향",
  /** 검색 엔진에 전달할 키워드(홈 구조화 데이터). */
  keywords: ["AI 소식", "AI 뉴스", "AI 일간 리포트", "AI 업계 동향"] as string[],
  /**
   * 검색 엔진 웹마스터 도구의 사이트 인증(선택 사항): meta 이름 → 도구에서 받은 인증 코드를 홈의 head에 넣습니다.
   * 예: "baidu-site-verification": "codeva-…", "msvalidate.01": "…". 인증 후에도 도구가 정기적으로 확인하므로 그대로 두세요.
   */
  siteVerification: {} as Record<string, string>,
  /** 사이트가 색인되기 시작한 연도(구조화 데이터의 기간, 선택 사항). */
  since: null as string | null,
  /** 인터페이스 언어(HTML lang, og:locale). */
  locale: "ko-KR",
  /** 기본 도메인. SITE_URL이 설정되지 않았을 때만 사용합니다. */
  defaultUrl: "http://localhost:3000",
  /** 기본 아이콘(favicon.ico, icon.png, icon-192.png, apple-icon.png, logo.svg) 외에 사이트 루트에 둘 아이콘의 site/brand/ 내 파일명(선택 사항). manifest.webmanifest나 외부 사이트에서 참조할 때 사용합니다. */
  rootIcons: [] as string[],
  /**
   * MCP 도구 이름의 접두사(소문자·숫자·밑줄)입니다. 사용자가 연동한 뒤에는 변경하지 마세요.
   */
  mcpPrefix: "aihottechkorea",
  /**
   * 공개 인터페이스(MCP, OpenAPI, llms.txt)의 버전입니다. 숫자는 올리기만 합니다.
   * 인터페이스의 기존 필드나 의미를 바꾸면 주 버전을 올리고 배포 안내에 변경 사항을 명시하세요.
   */
  interfaceVersion: "4.0.0",
  /** 외부 연락처 이메일(선택 사항): llms.txt와 Agent 사용 안내에 표시합니다. */
  contactEmail: null as string | null,
  /** 어바웃 페이지 하단에 표시할 짧은 문구(선택 사항). */
  footerNote: "AIHOT Tech Korea",
  /** 중국 본토 사이트의 ICP 비안호(선택 사항). 입력하면 사이드바와 마이 페이지 하단에 표시하고 공업정보화부 비안 시스템으로 연결합니다. */
  icp: null as string | null,
  /** 중국 본토 사이트의 공안 비안 정보(선택 사항). 입력하면 사이드바와 마이 페이지 하단에 표시합니다. */
  psb: null as string | null,
  /** 소스 코드의 GitHub 저장소 주소(선택 사항). 입력하면 사이드바와 마이 페이지 하단에 “GitHub 오픈소스”를 표시합니다. */
  github: null as string | null,
  /** 푸터의 “X 제공”(선택 사항). 입력하면 사이드바와 마이 페이지 하단에 표시하고 해당 URL로 연결합니다. 기본값은 상위 AIHOT으로 연결하며, 표시하지 않으려면 null로 설정하세요. */
  poweredBy: null as { name: string; url: string } | null,
  /** 구조화 데이터에 넣을 사이트 운영자(검색 엔진용). */
  organization: {
    name: "AIHOT Tech Korea",
    /** 창립자(선택 사항). */
    founder: null as Founder | null,
  },
  /** 출처를 수집할 때 보고할 이름과 버전(User-Agent에 사용). 다른 사이트의 이름을 도용하지 마세요. */
  crawlerName: "AIHOTTechKoreaBot/1.0",
} as const;

/** 이용 규칙 및 개인정보 처리방침 페이지(본문은 pages/에 있습니다). */
export const POLICY = {
  terms: {
    /** 페이지 이름: 내비게이션, 푸터, 페이지 제목에 사용합니다. */
    name: "이용 규칙",
    description: "본 사이트 웹페이지·RSS·공개 API·MCP의 이용 규칙.",
    /** llms.txt에 이 페이지를 한 줄로 설명할 문구(선택 사항). */
    covers: null as string | null,
    /** Agent 연동 페이지의 RSS, API 항목에 각각 표시할 이용 규칙 안내(선택 사항). */
    notes: null as null | { rss: string; api: string },
    /**
     * 사전 허가가 필요한 이용 목적을 설명하는 문구(선택 사항): llms는 llms.txt의 “사용 안내”에서 저작권 설명 뒤에,
     * agent는 Agent 사용 안내의 “이용 규칙” 절 첫머리에 표시합니다.
     */
    license: null as null | { llms: string; agent: string },
    /**
     * 공개 API, RSS, OpenAPI 파일에 이용 규칙을 선언하는 응답 헤더(선택 사항): 입력한 내용을 그대로 첨부하고 이 페이지를 가리키는
     * Link 헤더(rel="terms-of-service")를 추가합니다. 브라우저의 호출자도 확인할 수 있습니다.
     */
    headers: null as null | Record<string, string>,
  },
  privacy: {
    description: "본 사이트의 브라우저 로컬 데이터·피드백 자료·접속 로그 처리 방식.",
    /** llms.txt에 이 페이지를 한 줄로 설명할 문구(선택 사항). */
    covers: null as string | null,
  },
  /**
   * X 게시물의 글과 이미지를 전문으로 간주할지 여부: 전문으로 간주하면 사이트 내 전문 표시가 허용된 경우에만 표시합니다(출처에서 전문을 허용하고 본문도 가져온 경우).
   * 전문으로 간주하지 않으면 제목, 요약과 마찬가지로 항상 표시합니다.
   */
  xPostIsFullText: true,
} as const;

/** 내비게이션(데스크톱 사이드바, 모바일 하단 바, 마이 페이지). */
export const NAV = {
  /**
   * 내비게이션에서 숨길 기능 페이지. 현재 핫 이슈("/hot")와 주제("/topics")만 지원합니다. 페이지는 계속 열 수 있지만, 해당 페이지로 돌아가는 뒤로 가기 버튼과 링크는 주요 뉴스 페이지로 연결됩니다.
   * "/hot"을 지정하면 홈에서도 현재 핫 이슈를 제외합니다.
   */
  hidden: [] as Array<"/hot" | "/topics">,
};

/** 항목 카드와 상세 페이지에 표시할 문구와 설정. */
export const ITEM_COPY = {
  /** 모델이 작성한 추천 이유의 이름: 카드, 상세 페이지, Markdown 내보내기, Agent 답변, 그룹 알림에서 사용합니다. */
  reasonLabel: "추천 이유",
  /** 웹페이지와 공유 이미지에서 독자에게 AI 점수를 표시할지 여부. 표시만 제어하며 공개 API와 MCP 데이터에는 계속 score가 포함되고 관리자 화면에도 표시됩니다. */
  showScore: true,
};

/** 어바웃 페이지의 QR 코드 카드. */
interface ContactCard {
  kind: string;
  title: string;
  note: string;
  /** 외부에 링크된 사이트 루트 파일명(선택 사항), 예: qr-wechat.jpg. 이 주소는 항상 현재 QR 코드로 연결됩니다. */
  alias?: string;
}

/** 어바웃 페이지 문구. 숫자(출처 수, 수집 수, 주요 뉴스 수, 일간 리포트 발행 수)는 사이트 실시간 통계로 표시되므로 여기에 입력하지 않습니다. */
export const ABOUT = {
  kicker: `${SITE.name} 소개`,
  /** 페이지 설명(검색 결과, 공유 카드). */
  description: `${SITE.name} 소개: ${SITE.description}`,
  /** 큰 제목: 첫째 줄은 기본 색상, 둘째 줄은 강조 색상으로 표시합니다. */
  headline: ["AI 업계의 새로운 소식은 매일 쏟아집니다.", "주목할 소식만 골라 전합니다."] as [string, string],
  /** 제목 아래에 표시할 문단. {sources}는 실시간 출처 수로 바뀝니다(양쪽에 공백이 자동으로 들어가므로 {sources} 앞뒤에 공백을 넣지 마세요). 통계를 가져오지 못하면 sourcesFallback으로 대체합니다. */
  lead: `${SITE.name}에서는 {sources}개의 정보원에서 소식을 수집하고 분류·평가해 주요 뉴스로 선정한 뒤 ${EDITION_WHEN.daily}에 일간 리포트로 전합니다. 무료이며 가입이 필요 없습니다.`,
  sourcesFallback: "십수",
  /** 출처 흐름 애니메이션 아래에 표시할 네 단계. */
  steps: {
    collect: "공식 블로그, 언론사와 개인의 피드를 살펴봅니다. 새 글이 자주 올라오는 정보원은 더 자주 확인하며, 가장 빠르면 15분마다 확인합니다.",
    store: "수집한 내용을 저장하고 같은 사건을 다룬 보도를 묶습니다. 핫 뉴스 순위도 이 자료를 바탕으로 계산합니다.",
    select: `업계와 관련이 있는지, 새로운 정보가 담겨 있는지 살펴본 뒤 한국어 제목·요약과 ${ITEM_COPY.reasonLabel}를 작성합니다. 홍보성 글과 중복 전재는 제외합니다.`,
    publish: `${EDITION_WHEN.daily} 일간, ${EDITION_WHEN.weekly} 주간, ${EDITION_WHEN.monthly} 월간 리포트를 발행합니다.`,
  },
  /**
   * 작성자 영역(선택 사항). null이면 표시하지 않습니다.
   * avatarSourceId: X 계정 출처의 id를 지정하면 해당 계정의 프로필 사진을 사용합니다(선택 사항).
   * QR 코드는 관리자 “설정”에서 업로드하거나 site/brand/contact/에 넣으세요. QR 코드가 없으면 해당 카드를 표시하지 않습니다.
   */
  maker: null as null | {
    name: string;
    avatarSourceId?: string | null;
    greeting: string[];
    wechat?: ContactCard;
    feishu?: ContactCard;
  },
  /** 페이지 하단의 저작권 및 삭제 안내. 문구 중간에 피드백 페이지 링크가 연결됩니다. */
  copyright: [`${SITE.name}에서는 요약과 원문 링크를 제공합니다. 원문의 권리는 각 출처에 있습니다. 출처 관계자가 수정·삭제 또는 표시 방식 변경을 요청하려면`, "피드백 페이지로 연락해 주세요."] as [string, string],
  /** 페이지 하단 “이용 규칙” 링크의 앵커 id(선택 사항). 외부 문서에 이 앵커가 고정되어 있다면 입력하고 이후 변경하지 마세요. */
  termsAnchor: null as string | null,
} as const;

/** 관리자 페이지에서 관리자에게 표시할 안내(선택 사항). */
export const ADMIN = {
  /** “피드백” 페이지 제목 아래에 표시할 한 줄. */
  feedbackNote: null as string | null,
  /** 피드백 출처를 차단할 때 확인 창에 덧붙일 사이트 규칙 안내. */
  banNote: null as string | null,
  /** 유료 서비스 요청 한도를 조정할 때 확인 창에 덧붙일 사이트 규칙 안내. */
  budgetNote: null as string | null,
};

/** Agent 연동 페이지의 예시. */
export const AGENT = {
  /** MCP 도구 표의 “검색” 항목: 검색할 수 있는 내용과 질문 예시. */
  search: { scope: "회사·제품·인물·주제별 최근 7일 검색", ask: "이 회사가 최근에 발표한 소식은 무엇인가요?" },
};

/** 일간·주간·월간 리포트에 표시할 문구. */
export const REPORTS = {
  /** 제호 아래에 표시할 발행자 한 줄. */
  imprint: "AIHOT TECH KOREA",
  /** 제호 옆에 표시할 단어. */
  motto: SITE.subject as string,
  /** 각 리포트 페이지의 설명(검색 결과, 공유 카드). 마침표는 붙이지 않습니다. llms.txt에서 주간·월간 리포트를 소개할 때도 사용합니다. */
  descriptions: {
    daily: `${SITE.name} ${subjectAfter(`${EDITION_WHEN.daily} 발행`, "업계 주요 뉴스 일간 리포트")}`,
    weekly: subjectAfter("매주 발행하는", "업계 주간 종합 리포트"),
    monthly: subjectAfter("매월 발행하는", "업계 월간 결산"),
  },
  /**
   * 한 호의 항목을 세는 단위(“주요 소식 4건”): 대표 기사가 없을 때의 제목(“오늘의 AI 주요 소식 4건”), 제호와 지난 호 목록의 항목 수,
   * 주간·월간 리포트에 총평이 없을 때의 문구, 구독 안내의 “분야별 주요 소식”에 사용합니다.
   */
  entry: { measure: "건", noun: "주요 소식" },
  /** 제호에서 다른 숫자 뒤에 붙일 표현. 주요 뉴스 수와 일간 리포트 발행 수는 어바웃 페이지와 주제 페이지에서도 같은 표현을 사용합니다. */
  metricUnits: { sourcesCount: "개 정보원", firstPartyEvents: "건의 공식 발표", selectedCount: "건의 주요 뉴스", reportsCovered: "편의 일간 리포트" },
  /** 리포트 공유 이미지에서 전체 항목 수를 나타내는 표현. */
  shareUnit: "건의 주요 소식",
  /** 일간 리포트 대상 시간에 자료를 평가했지만 새로운 주요 소식이 없을 때 표시할 제목과 안내 문구. */
  quiet: { title: "오늘은 새로운 주요 소식이 없습니다", paragraph: `한국시간 {start}부터 {end}까지 새로운 주요 소식이 없었습니다.` },
};

/** 운영 알림(사이트 관리자에게만 발송)에 배포별로 설정할 문구. */
export const ALERTS = {
  /** 새 글을 수집하지 않은 시간이 몇 분일 때 “사이트가 새 콘텐츠 수집을 중단했습니다” 알림을 보낼지 설정합니다(최대 하루). ALERT_QUIET_MINUTES 환경 변수가 우선합니다. */
  quietMinutes: 360,
  /** 출처 수집은 계속 성공하지만 새 글이 없을 때 알림을 보낼 시간(분, 최대 하루). */
  quietWhileFetchingMinutes: 720,
  /** 같은 알림에서 “없음” 뒤에 평소 수집량을 덧붙입니다. null이면 생략합니다. */
  usualFlow: null as string | null,
  /** worker 중단 알림에서 로그 확인 방법을 안내합니다. */
  workerLogs: "看 worker 的日志（docker compose logs worker）",
};

/** 관리자에서 새 출처를 추가할 때 적용할 기본 설정. */
export const SOURCE_DEFAULTS = {
  /** 사이트에 전문을 표시합니다. false이면 요약과 원문 링크만 표시합니다. */
  siteFulltext: false,
};

/**
 * 커뮤니티 사이트의 출처(id 입력): 인기도를 계산할 때 게시 계정별로 각각 독립된 출처로 집계하며, 출처 전체를 하나로 세지 않습니다.
 * dev는 dev.to 게시물 피드, hn은 Hacker News 게시물 피드입니다.
 */
export const COMMUNITY_FEEDS: { dev: string[]; hn: string[] } = {
  dev: [],
  hn: [],
};

/** 각 페이지 공유 이미지(/og/pages/*.png)에 표시할 문구. 주제 목록 페이지의 이미지는 주제 수에 따라 자동 생성됩니다. */
export const CARDS: Record<string, { kicker: string; title: string; subtitle: string; accent?: "hot" | "amber" }> = {
  site: { kicker: subjectAfter("매일", "주요 뉴스"), title: SITE.tagline, subtitle: SITE.description },
  all: { kicker: subjectAfter("전체", "동향"), title: "여러 정보원의 최신 소식을 한곳에서", subtitle: "정보원별 최신 소식을 시간순으로 모았습니다. 분류와 태그로 원하는 소식을 찾아보세요." },
  hot: { kicker: "핫 뉴스", title: "지난 48시간, 무엇이 화제였을까요?", subtitle: "화제 지수와 추이, 공개된 출처를 확인하세요.", accent: "hot" },
  daily: { kicker: withSubject("일간 리포트"), title: `${spokenTime(EDITION_TIMES.daily)}에 읽는 하루의 주요 소식`, subtitle: "지난 24시간 동안 주목할 만한 동향을 모았습니다." },
  weekly: { kicker: withSubject("주간 리포트"), title: `한 주의 ${REPORTS.entry.noun}을 한눈에`, subtitle: "이번 주의 흐름과 주요 발표, 다시 볼 만한 논의를 정리했습니다." },
  monthly: { kicker: withSubject("월간 리포트"), title: "한 달 동안의 변화", subtitle: "월간 주요 흐름과 핵심 사건을 돌아봅니다." },
  about: { kicker: "소개", title: `${SITE.name} 소개`, subtitle: SITE.description },
  terms: { kicker: "이용 규칙", title: `${SITE.name} 이용 규칙`, subtitle: "웹페이지·API·RSS·MCP 이용 범위입니다." },
  privacy: { kicker: "개인정보 안내", title: `${SITE.name} 개인정보 안내`, subtitle: "접속 로그·브라우저 로컬 데이터·피드백 자료 처리 방식입니다." },
  changelog: { kicker: "업데이트", title: `${SITE.name} 업데이트`, subtitle: "기능 업데이트, 최적화, 공지와 종료 기록입니다." },
  feedback: { kicker: "피드백", title: "더 나은 서비스를 위해 의견을 들려주세요", subtitle: "콘텐츠·기능·연동 의견이나 출처 수정·삭제 요청을 받습니다." },
  agent: { kicker: "Agent 연동", title: `Agent에서 ${SITE.name} 소식을 받아보세요`, subtitle: "MCP·RSS·API로 로그인 없이 조회할 수 있으며 API 키가 필요 없습니다." },
};

/** 공개 인터페이스 이용 안내에서 배포별로 달라지는 설정. Agent 사용 안내와 llms.txt에 표시합니다. */
export const ACCESS = {
  /** 같은 IP에서 분당 허용할 대략적인 요청 수. 초과하면 Retry-After와 함께 429를 반환합니다(선택 사항, 배포 환경의 리버스 프록시에서 제한). null이면 제한이 없으며 안내에도 언급하지 않습니다. */
  ratePerMinute: null as number | null,
  /** 데이터를 동기화하는 프로그램이 전달할 User-Agent(선택 사항). JSON 인터페이스 안내 뒤에 표시합니다. */
  userAgent: null as string | null,
};

/** 이 배포 환경에만 적용할 설정(선택 사항). */
export const DEPLOYMENT = {
  /** 자격 증명 그룹 파일(models.env, collectors.env 등)을 기본으로 둘 디렉터리(저장소 루트 기준). AIHOT_CREDENTIALS_DIR 환경 변수가 우선하며, 둘 다 없으면 환경 변수만 읽습니다. */
  credentialsDir: null as string | null,
  /** 자격 증명 디렉터리에 둘 그룹별 파일명(선택 사항). 지정하지 않은 그룹은 “그룹명.env”를 사용합니다. 예: models.env. */
  credentialFiles: {} as Partial<Record<string, string>>,
  /** 이 배포에 추가로 필요한 자격 증명([그룹, 환경 변수명]). 운영 API 시작 시 확인하며, 기본값은 추가 요구 사항이 없습니다. */
  requiredSecrets: [] as const,
  /** 운영 api가 수신할 Host(CDN 원본 서버용 도메인, 선택 사항). 로컬 개발 시 웹 개발 서버가 api로 전달하는 요청에도 적용해 운영 환경과 맞춥니다. */
  originHost: null as string | null,
  /** 리버스 프록시가 로그인하지 않은 관리자 요청을 로그인 페이지로 보낼 때 원래 주소를 전달할 요청 헤더(선택 사항). 로그인 후 해당 주소로 돌아갑니다. */
  loginReturnHeader: null as string | null,
  /**
   * 이미지 프록시가 원본 사이트에서 가져오는 트래픽 한도: 초과하면 캐시되지 않은 이미지는 우선 503을 반환합니다. 분 또는 일 한도가 지나거나 당일 할당량을 모두 사용하면 운영 일간 리포트에 기록됩니다.
   * null이면 한도를 설정하지 않습니다. IMGPROXY_UPSTREAM_MB_PER_MINUTE, IMGPROXY_UPSTREAM_GB_PER_DAY 환경 변수가 우선합니다.
   */
  imageUpstreamBudget: null as null | { mbPerMinute: number; gbPerDay: number },
  /**
   * 서버가 아웃바운드 프록시(EGRESS_PROXY_URL)를 거치지 않고 직접 연결해야 하는 것으로 확인된 도메인. 수집과 이미지 처리에 함께 사용합니다(선택 사항).
   * 리디렉션할 때마다 대상 도메인에 따라 경로를 다시 선택하며, 직접 연결도 실제 연결 주소를 확인합니다.
   */
  directFetchHosts: [] as string[],
  /**
   * 주요 뉴스 평가(scripts/eval-selection.ts)를 인자 없이 실행할 때 사용할 정답 데이터 세트: 파일(저장소 루트 기준), 샘플 수, 추출할 분할, 문턱 탐색 범위.
   * null이면 .data/gold.jsonl의 전체 샘플(최대 200개)을 사용하고 40–90 범위에서 탐색합니다.
   */
  selectionGold: null as null | { file: string; sample: number; split: string; sweep: [number, number] },
};

/** 사이트별 RSS 피드 안내 문구. */
export const FEED_COPY = {
  /** “전체 동향” 피드 안내에 미검토 콘텐츠, 관련성이 낮은 항목, 점수가 낮은 항목, 중복으로 병합된 항목 외에 포함하지 않는 내용을 덧붙입니다(선택 사항). */
  allLeavesOut: [] as string[],
};

/**
 * 공개 인터페이스(API, RSS, MCP)에서 웹페이지와 다르게 사용할 카테고리(선택 사항). 공개 후에는 변경하지 마세요. 인터페이스 매개변수와 구독 주소에 카테고리 key가 포함됩니다.
 * merge: 다른 카테고리에 합칠 카테고리. key는 업종 패키지의 카테고리, 값은 합쳐질 카테고리입니다(공개 인터페이스의 카테고리가 웹페이지보다 적을 때 사용).
 * feedLabels: 카테고리 RSS 제목에 표시할 이름으로, 업종 패키지의 feedLabel을 대체합니다(다른 카테고리에 합친 경우 이름도 함께 변경해야 할 수 있습니다).
 */
export const PUBLIC_CATEGORIES = {
  merge: {},
  feedLabels: {},
} as const;

/** 업종명과 명사 사이에 영문은 공백을 넣고, 한글은 붙여 씁니다. */
export function withSubject(noun: string): string {
  return /[A-Za-z0-9]$/.test(SITE.subject) ? `${SITE.subject} ${noun}` : `${SITE.subject}${noun}`;
}

/** 문구 뒤에 업종명을 붙일 때 영문 앞에는 공백을 넣고, 한글은 붙여 씁니다. */
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
 * 진입 페이지가 검색 결과에 표시될 제목: 독자가 검색할 단어를 앞에 두며, 페이지 끝에 “ · 사이트명”을 자동으로 붙입니다(홈은 SITE.homeTitle 사용).
 * 날짜는 항상 해당 호와 페이지 콘텐츠의 날짜이며 오늘 날짜가 아닙니다. 업종을 바꿀 때는 문구도 함께 바꾸세요.
 */
export const SEO_TITLES = {
  /** 핫 이슈(/hot). */
  hot: `${withSubject("핫 뉴스 목록")}: 오늘 인기 이벤트 순위`,
  /** 전체 동향(/all). 검색 및 필터 결과는 제외합니다. */
  all: `${subjectAfter("최신", "동향")}: 실시간 업데이트`,
  /** Agent 연동 페이지(/agent). */
  agent: `${withSubject("뉴스")} API·MCP·RSS: Agent 연동`,
  /** 어바웃 페이지(/about)의 전체 제목. 사이트명이 이미 포함되어 있습니다. */
  about: `${SITE.name} 소개: ${SITE.tagline}`,
  /** 최신 일간·주간·월간 리포트(/daily, /weekly, /monthly). date는 해당 호의 날짜입니다(예: “11월 7일”, “10월 26일—11월 1일”, “2026년 10월”). */
  latestReport: (kind: "daily" | "weekly" | "monthly", date: string): string =>
    ({ daily: `${withSubject("일간 리포트")}: ${date} 주요 뉴스`, weekly: `${withSubject("주간 리포트")}: ${date} 한 주 돌아보기`, monthly: `${withSubject("월간 리포트")}: ${date} 주요 소식 돌아보기` })[kind],
  /** 주제 페이지 첫 화면: 기업은 “최신 소식”, 분야와 콘텐츠 유형은 “최신 동향”을 검색합니다. updated는 가장 최근에 주요 뉴스로 선정한 항목의 날짜(“11월 7일”)이며, 없으면 null입니다. */
  topic: (name: string, group: "company" | "field" | "genre", updated: string | null): string =>
    `${name} ${group === "company" ? "최신 소식과 동향" : "최신 동향과 진전"}${updated ? `(${updated} 업데이트)` : ""}`,
};
