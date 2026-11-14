// The engine's ways in, one panel each: what it is for, the steps to connect, then the details folded away.
// Addresses are the site's configured public address (`base`); what visitors copy carries the site's tag
// (CopyTag) when it has one.
import { Fragment, useState } from "react";
import { Link } from "react-router";
import { PUBLIC_INTERFACE_VERSION } from "@aihot/contracts/http-policy";
import { MCP_TOOL_NAMES as T, MCP_TOOLS } from "@aihot/contracts/mcp";
import { feedCategoryLabel, PUBLIC_API_CATEGORY_KEYS } from "@aihot/contracts/taxonomy";
import { ACCESS, AGENT, EDITION_WHEN, POLICY, REPORTS, SITE, subjectAfter, withSubject } from "@aihot/site";
import { CodeBlock, CopyButton } from "./CodeBlock";
import { PillTabs } from "../../components/ui/Tabs";
import type { AgentPanelProps } from "../../modules";
import { AGENT_PARTS, GUIDE_CLIENTS, TAG } from "./module-parts";
import { Address, Ask, Block, Bullets, Details, Mono, PanelHead, Step, Steps, Table, Tips } from "./parts";

const V = PUBLIC_INTERFACE_VERSION;

/** Every MCP tool: the engine's and the modules'. */
export const mcpToolCount = () => MCP_TOOLS.length + AGENT_PARTS.reduce((n, a) => n + (a.tools?.length ?? 0), 0);
const link = "text-accent hover:underline";

/** An address on this site as the copy buttons copy it, with the tag. */
function addressOf({ base, tag }: AgentPanelProps, path: string): string {
  return TAG && tag ? `${base}${path}?${TAG.query}=${tag}` : `${base}${path}`;
}

const MCP_CLIENTS = [
  { key: "claude", label: "Claude Code" },
  { key: "codex", label: "Codex" },
  { key: "json", label: "JSON 설정" },
  { key: "other", label: "기타 클라이언트" },
] as const;

export function McpPanel(props: AgentPanelProps) {
  const url = addressOf(props, "/api/mcp");
  const name = SITE.mcpPrefix;
  const [client, setClient] = useState<string>("claude");
  return (
    <>
      <PanelHead label={`MCP · ${V}`} title={`주소를 입력하면 Agent에서 도구 ${mcpToolCount()}개를 더 사용할 수 있어요`}>
        표준 Streamable HTTP 방식으로 익명 읽기 전용이며, 토큰이나 로그인 상태가 필요하지 않습니다. Claude 데스크톱, Cursor, Cherry Studio처럼 원격 MCP를 지원하는 클라이언트에 적합합니다.
      </PanelHead>
      <Steps>
        <Step n={1} title="서비스 주소 복사">
          <Address url={url} />
          {TAG && <p className="mt-2 text-[13px] text-ink-3">{TAG.mcp}</p>}
        </Step>
        <Step n={2} title="클라이언트에 추가">
          <PillTabs className="mt-3" size="xs" layoutId="agent-mcp-client" label="클라이언트" active={client} onSelect={setClient} items={MCP_CLIENTS.map((c) => ({ key: c.key, label: c.label }))} />
          {client === "claude" && <CodeBlock className="mb-0 mt-3" lang="bash" code={`claude mcp add --transport http ${name} '${url}'`} />}
          {client === "codex" && <CodeBlock className="mb-0 mt-3" lang="bash" code={`codex mcp add ${name} --url '${url}'`} />}
          {client === "json" && <CodeBlock className="mb-0 mt-3" title="Cursor, Cherry Studio 등 JSON 설정을 사용하는 클라이언트" lang="json" code={JSON.stringify({ mcpServers: { [name]: { type: "http", url } } }, null, 2)} />}
          {client === "other" && <p className="mt-3">{`클라이언트의 MCP 또는 커넥터 설정에서 새 항목을 만드세요. 이름에는 ${name}, 주소에는 위 URL을 입력하고 인증은 ‘없음’을 선택하세요. API Key는 입력하지 마세요. 로컬 명령만 지원하는 클라이언트라면 내장된 원격 MCP 프록시를 먼저 사용하세요.`}</p>}
        </Step>
        <Step n={3} title="Agent에게 한 번 요청">
          <Ask text={`${T.latest}를 호출해서 지난 24시간 동안 가장 중요한${subjectAfter(" 5건의", "소식")}을 알려 주고, ${SITE.name} 링크도 함께 보여 줘.`} />
          <p className="mt-2 text-[13px] text-ink-3">{`클라이언트에 ${T.latest} 호출이 표시되고, 답변에 시간 범위와 한국어 요약, ${new URL(props.base).host} 링크가 있으면 연결된 것입니다.`}</p>
        </Step>
      </Steps>

      <Block title={`도구 ${mcpToolCount()}개`}>
        <Table
          head={["도구", "기능", "이렇게 질문해 보세요"]}
          minWidth={600}
          rows={[
            [<Mono>{T.latest}</Mono>, "지난 24시간 또는 최근 7일의 주요 뉴스와 전체 소식", `${subjectAfter("오늘의", "뉴스")}는 뭐야?`],
            [<Mono>{T.search}</Mono>, AGENT.search.scope, AGENT.search.ask],
            [<Mono>{T.hot}</Mono>, "현재 인기 주제 상위 10개", "지금 가장 화제가 되는 건 뭐야?"],
            [<Mono>{T.story}</Mono>, "핫이슈 사건의 타임라인과 계속 업데이트되는 개요", "이 일의 맥락은 뭐야?"],
            [<Mono>{T.daily}</Mono>, subjectAfter("최신 또는 지정한 날짜의", "일간"), "오늘 일간을 보여 줘."],
            [<Mono>{T.weekly}</Mono>, subjectAfter("최신 또는 지정한 주의", "주간"), `${subjectAfter("이번 주", "분야")}에 어떤 큰일이 있었어?`],
            [<Mono>{T.monthly}</Mono>, subjectAfter("최신 또는 지정한 달의", "월간"), `${subjectAfter("지난달", "분야")}에는 무슨 일이 있었어?`],
            ...AGENT_PARTS.flatMap((a) => a.tools ?? []).map((t) => [<Mono>{t.name}</Mono>, t.does, t.ask]),
          ]}
        />
      </Block>

      <Details
        items={[
          {
            title: "제한 및 안전",
            body: (
              <Bullets items={[
                "일반 조회는 최대 30건, 핫이슈는 최대 10개, 사건 타임라인은 최대 50건입니다. 범위를 넘으면 명확한 오류를 반환하며 임의로 범위를 늘리지 않습니다.",
                `${T.story}의 public_id는 핫이슈 도구가 반환한 사건 링크에서만 가져올 수 있습니다. ID를 추측하지 마세요.`,
                "제목과 요약은 외부 정보원에서 가져온 자료일 뿐입니다. 도구가 이 안전 경계를 표시합니다. 중요한 수치, 정책, 직접 인용은 원문에서 확인하세요.",
              ]} />
            ),
          },
          {
            title: "연결되지 않을 때",
            body: (
              <Bullets items={[
                "주소가 완전한지, 클라이언트가 원격 Streamable HTTP를 지원하는지 확인하세요. 새 도구가 보이지 않으면 도구 목록을 새로 고치거나 다시 연결하세요.",
                ...AGENT_PARTS.flatMap((a) => a.mcpTroubles ?? []),
                "서비스에는 로그인이 필요하지 않습니다. 클라이언트에서 OAuth 또는 API Key를 요구하면 ‘없음’을 선택하세요.",
                "429 응답을 받으면 안내에 따라 잠시 기다리세요. 동시에 재시도하지 마세요.",
                <>계속 연결되지 않으면 클라이언트 이름, 버전, 오류 내용을 <Link viewTransition to="/feedback" className={link}>피드백 페이지</Link>에 남겨 주세요.</>,
              ]} />
            ),
          },
        ]}
      />
    </>
  );
}

const FEEDS = [
  { name: "주요 뉴스 요약", badge: "추천", path: "/feed.xml", desc: "최신 주요 뉴스 50건의 제목, 요약, 사이트 내 읽기 및 원문 링크입니다." },
  { name: "주요 뉴스 전문", path: "/feed/full.xml", desc: "같은 50건입니다. 재게시가 허용된 정보원은 전문을 싣고, 나머지는 요약만 제공합니다." },
  { name: "전체 소식", path: "/feed/all.xml", desc: "최근 7일간 공개된 소식을 원문 게시 시각의 역순으로 제공합니다." },
  { name: withSubject("일간"), path: "/feed/daily.xml", desc: `${EDITION_WHEN.daily}(한국시간, Asia/Seoul)에 발행: 주요 기사 소개와 전체 목차. 최근 30호를 보관합니다.` },
  { name: withSubject("주간"), path: "/feed/weekly.xml", desc: `${EDITION_WHEN.weekly}(한국시간, Asia/Seoul)에 발행: 개요와 분류별 ${REPORTS.entry.noun}. 최근 12호를 보관합니다.` },
  { name: withSubject("월간"), path: "/feed/monthly.xml", desc: `${EDITION_WHEN.monthly}(한국시간, Asia/Seoul)에 발행: 개요와 분류별 ${REPORTS.entry.noun}. 최근 12호를 보관합니다.` },
];

/** The category feeds, under the names the feeds themselves use. */
const FEED_CATEGORIES = PUBLIC_API_CATEGORY_KEYS.map((key) => [key, feedCategoryLabel(key)] as const);

export function RssPanel(props: AgentPanelProps) {
  const { base } = props;
  const lead = `${["주요 RSS 2.0 리더와 호환되며 n8n, Zapier 같은 자동화 도구에도 연결할 수 있습니다. 주소는 계속 동일합니다", ...AGENT_PARTS.flatMap((a) => a.rssLead ?? [])].join("; ")}.`;
  return (
    <>
      <PanelHead label="RSS" title="주소를 복사해 리더에서 구독">
        {lead}
      </PanelHead>
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {FEEDS.map((f) => (
          <div key={f.path} className="card flex flex-col p-4">
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-semibold text-ink">{f.name}</span>
              {f.badge && <span className="inline-flex h-[18px] items-center rounded-full bg-accent-soft px-2 text-[11px] font-medium text-accent">{f.badge}</span>}
            </div>
            <p className="mt-1 flex-1 text-[13px] leading-[1.7] text-ink-3">{f.desc}</p>
            <div className="mt-3 flex items-center gap-2 border-t border-line-soft pt-3">
              <code className="mono min-w-0 flex-1 truncate text-[12px] text-ink-4">{base}{f.path}</code>
              <CopyButton text={addressOf(props, f.path)} label="주소 복사" className="shrink-0" />
            </div>
          </div>
        ))}
      </div>
      {TAG && <p className="mt-3 text-[12.5px] text-ink-4">{TAG.rss}</p>}

      <Block title="분류별 구독">
        <Table
          head={["분류", "요약", "전문"]}
          minWidth={420}
          rows={FEED_CATEGORIES.map(([slug, label]) => [
            <span className="font-medium text-ink">{label}</span>,
            <span className="inline-flex items-center gap-2"><Mono>{`/feed/category/${slug}.xml`}</Mono><CopyButton text={addressOf(props, `/feed/category/${slug}.xml`)} className="!h-6 !px-1.5" /></span>,
            <span className="inline-flex items-center gap-2"><Mono>{`/feed/full/category/${slug}.xml`}</Mono><CopyButton text={addressOf(props, `/feed/full/category/${slug}.xml`)} className="!h-6 !px-1.5" /></span>,
          ])}
        />
      </Block>

      <Block title="새로 고침 주기">
        <p>리더는 이전 ETag를 함께 보내며, 내용이 바뀌지 않았다면 작은 304 응답만 받아 다시 내려받지 않습니다. 30분마다 새로 고치면 충분하며, 더 자주 확인해도 새 소식이 늘어나지는 않습니다.</p>
        <p className="mt-3 text-[13px] text-ink-3">{`항목 링크는 사이트 내 읽기 페이지로 연결되고, 요약에 원문 링크가 있습니다. 익명 구독이 모든 용도의 이용 허가를 뜻하지는 않습니다${POLICY.terms.notes ? `: ${POLICY.terms.notes.rss}` : ""}. 자세한 내용은 `}<Link viewTransition to="/terms" className={link}>{POLICY.terms.name}</Link>에서 확인하세요.</p>
      </Block>
    </>
  );
}

const RECIPES = [
  { key: "latest", label: "최신 소식 확인" },
  { key: "sync", label: "주요 뉴스 전체 동기화" },
];

export function ApiPanel(props: AgentPanelProps) {
  const { base, tag } = props;
  const userAgent = [ACCESS.userAgent, TAG && tag ? TAG.userAgent(tag) : null].filter(Boolean).join(" ");
  const curl = `curl --compressed${userAgent ? ` -A '${userAgent}'` : ""}`;
  let pace = `갱신 주기: 새 소식은 하루 종일 들어오고, 주요 뉴스 항목은 하루에 수회에서 수십 회 바뀝니다. 일간은 ${EDITION_WHEN.daily}, 주간은 ${EDITION_WHEN.weekly}, 월간은 ${EDITION_WHEN.monthly}(${`한국시간(Asia/Seoul)`})에 각각 발행됩니다.`;
  if (ACCESS.ratePerMinute) pace += `같은 IP에서 분당 약 ${ACCESS.ratePerMinute}회를 초과하면 429 응답을 받습니다. Retry-After 안내에 따라 기다리고 동시에 재시도하지 마세요.`;
  const [recipe, setRecipe] = useState<string>("latest");
  const recipes = AGENT_PARTS.flatMap((a) => a.recipes ?? []);
  const items = `${base}/api/v1/items?mode=selected&window=24h&limit=20`;
  return (
    <>
      <PanelHead label={`REST API · ${V}`} title="익명 GET으로 바로 사용">
        토큰이 필요 없으며 브라우저의 교차 출처 요청, curl, 각 언어의 기본 HTTP 클라이언트에서 바로 호출할 수 있습니다. 경로는 /api/v1이며 필드와 오류 코드는 <a href="/openapi-v1.json" className={link}>OpenAPI</a>를 참고하세요.
      </PanelHead>
      <CodeBlock className="mt-6" title="첫 요청" lang="bash" code={`${curl} '${items}'`} />

      <Block title="분류별 필터링">
        <p>소식 요청에 <Mono>category</Mono>를 추가하면 해당 분류만 가져옵니다. 지정하지 않으면 모든 분류가 포함됩니다. 반환 항목의 <Mono>category</Mono> 값도 아래 표의 값을 사용합니다.</p>
        <Table head={["분류", "요청 매개변수"]} rows={FEED_CATEGORIES.map(([key, name]) => [name, <Mono>{`category=${key}`}</Mono>])} />
      </Block>

      <Block title="효율적이고 빠르게 사용하기">
        <Tips
          items={[
            { title: "압축 사용", text: <>curl에는 <Mono>--compressed</Mono>를 추가하고, 다른 클라이언트에서는 gzip 또는 br을 켜세요. JSON은 압축하면 원래 크기의 1/4~1/8입니다.</> },
            { title: "ETag 사용", text: <>응답의 ETag를 저장하고 다음 요청에 <Mono>If-None-Match</Mono>를 보내세요. 내용이 바뀌지 않았다면 본문 없이 304를 반환합니다.</> },
            { title: "주기에 맞춰 가져오기", text: `소식과 핫이슈는 최소 1분 간격으로 요청하세요. 일간은 ${EDITION_WHEN.daily} 이후, 주간과 월간은 발행 이후 한 번 가져오면 됩니다. 이전 페이지는 이미 가진 항목이 나오면 멈추세요.` },
          ]}
        />
        <p className="mt-3 text-[13px] leading-[1.75] text-ink-3">{pace}</p>
      </Block>

      <Block title="엔드포인트 안내">
        <Table
          head={["경로", "용도", "요청 주기"]}
          minWidth={640}
          rows={[
            { group: "소식" },
            [<Mono>/api/v1/items</Mono>, "주요 뉴스 또는 최근 7일 전체 소식. 분류, 기간, 키워드로 필터링할 수 있습니다.", "최소 1분 간격"],
            { group: "핫이슈 및 사건" },
            [<Mono>/api/v1/hot-topics</Mono>, "현재 핫이슈 상위 10개", "최소 1분 간격"],
            [<Mono>{"/api/v1/stories/{publicId}"}</Mono>, "사건 보도 타임라인, AI 개요 및 관련 사건", "필요할 때"],
            { group: "일간" },
            [<Mono>/api/v1/dailies/latest</Mono>, "최신 일간", `${EDITION_WHEN.daily} 이후 한 번`],
            [<Mono>{"/api/v1/dailies/{date}"}</Mono>, "지정 날짜의 일간. 철회된 기사는 인용에서 제거됩니다.", "캐시 만료 후 사용 전에 ETag 확인"],
            [<Mono>/api/v1/dailies</Mono>, "일간 날짜 목록", "하루 한 번"],
            { group: "주간 및 월간" },
            [<Mono>/api/v1/weeklies/latest</Mono>, "최신 주간: 주요 기사, 개요, 한 주의 핵심을 분류별로 정리", `${EDITION_WHEN.weekly} 이후 한 번`],
            [<Mono>{"/api/v1/weeklies/{week}"}</Mono>, "지정한 주의 주간. 2026-W39 같은 ISO 주 사용. 철회된 기사는 인용에서 제거됩니다.", "캐시 만료 후 사용 전에 ETag 확인"],
            [<Mono>/api/v1/weeklies</Mono>, "주간 목록", "주 1회"],
            [<Mono>/api/v1/monthlies/latest</Mono>, "최신 월간", `${EDITION_WHEN.monthly} 이후 한 번`],
            [<Mono>{"/api/v1/monthlies/{month}"}</Mono>, "지정 월. 예: 2026-09", "캐시 만료 후 사용 전에 ETag 확인"],
            [<Mono>/api/v1/monthlies</Mono>, "월간 목록", "월 1회"],
            ...AGENT_PARTS.flatMap((a) => (a.api ? [{ group: a.api.group }, ...a.api.rows.map(([path, does, often]) => [<Mono>{path}</Mono>, does, often])] : [])),
            { group: "AI 도우미" },
            [<Mono>/api/v1/agent</Mono>, `Agent 사용 안내입니다. 여기에 적힌 주소는 정리된 한국어 Markdown을 반환합니다${GUIDE_CLIENTS ? `; ${GUIDE_CLIENTS}에서 사용합니다` : ""}`, "필요할 때"],
            { group: "주요 뉴스 전체 동기화" },
            [<Mono>/api/v1/selected/snapshot</Mono>, "현재 주요 뉴스 항목 전체를 페이지 단위로 가져옵니다.", "최초 한 번"],
            [<Mono>/api/v1/selected/changes</Mono>, "이후 추가, 수정 및 주요 뉴스 해제 항목", "몇 분 간격"],
          ]}
        />
      </Block>

      <Block title="자주 쓰는 방법">
        <PillTabs size="xs" layoutId="agent-api-recipe" label="사용법" active={recipe} onSelect={setRecipe} items={[...RECIPES, ...recipes].map((r) => ({ key: r.key, label: r.label }))} />
        {recipe === "latest" && (
          <>
            <CodeBlock className="mb-3 mt-3" lang="bash" code={`# 처음: 응답 헤더의 ETag 저장\n${curl} -i '${items}'\n# 이후 최소 1분 간격으로 ETag 전달; 304 응답은 변경 없음\n${curl} -i -H 'If-None-Match: <이전 ETag>' '${items}'`} />
            <p>이전 페이지를 더 가져오려면 <Mono>page.nextCursor</Mono>를 cursor로 전달하고, 이미 가진 항목이 나오면 멈추세요. 매번 7일치를 처음부터 다시 가져오지 마세요.</p>
          </>
        )}
        {recipe === "sync" && (
          <>
            <CodeBlock className="mb-3 mt-3" lang="bash" code={`# 처음: 페이지를 나눠 전체를 가져옵니다. 첫 페이지 응답의 cursor를 저장하세요(모든 페이지에서 동일)\n${curl} '${base}/api/v1/selected/snapshot?fields=minimal&limit=500'\n# hasMore가 true이면 nextPage를 전달해 끝까지 계속 가져옵니다\n${curl} '${base}/api/v1/selected/snapshot?fields=minimal&limit=500&page=<이전 페이지의 nextPage>'\n# 이후: cursor를 그대로 전달해 추가, 수정, 주요 뉴스 해제 항목만 가져옵니다\n${curl} '${base}/api/v1/selected/changes?cursor=<첫 페이지의 cursor>&limit=100'`} />
            <p>각 페이지를 로컬에 성공적으로 저장한 뒤 새 cursor를 저장하세요. cursor는 변경 기록의 기준점이며 만료되지 않습니다. 409 <Mono>snapshot_required</Mono>가 반환되면 전체 스냅샷을 다시 가져오세요. 데이터가 조용히 누락되지 않습니다.</p>
          </>
        )}
        {recipes.map((r) => recipe === r.key && <r.Body key={r.key} base={base} curl={curl} />)}
      </Block>

      <Block title="오류가 발생했을 때" id="agent-api-recovery">
        <dl className="grid grid-cols-[76px_minmax(0,1fr)] gap-x-3 gap-y-2.5">
          <dt className="mono text-[13px] text-ink">400</dt>
          <dd>매개변수가 잘못되었습니다. OpenAPI와 반환된 code를 참고해 수정하세요. 자동으로 더 넓은 범위의 조회로 바꾸지 마세요. cursor가 잘못되었거나 기간을 벗어나면 invalid_cursor가 반환되므로 첫 페이지부터 다시 시작하세요.</dd>
          <dt className="mono text-[13px] text-ink">409</dt>
          <dd>snapshot_required: 증분 동기화를 안전하게 이어갈 수 없습니다. 전체 스냅샷을 다시 가져오세요.</dd>
          <dt className="mono text-[13px] text-ink">429</dt>
          <dd>요청이 너무 잦습니다. Retry-After 안내에 따라 기다리고 동시에 재시도하지 마세요.</dd>
          <dt className="mono text-[13px] text-ink">5xx</dt>
          <dd>지수형 대기 간격으로 재시도하고, 우선 마지막으로 성공한 결과를 사용하세요. 공개 서비스는 SLA를 보장하지 않습니다.</dd>
          {AGENT_PARTS.flatMap((a) => a.apiErrors ?? []).map(([status, what]) => (
            <Fragment key={status}>
              <dt className="mono text-[13px] text-ink">{status}</dt>
              <dd>{what}</dd>
            </Fragment>
          ))}
        </dl>
        <p className="mt-4 text-[13px] text-ink-3">{`익명 호출이 모든 용도의 이용 허가를 뜻하지는 않습니다${POLICY.terms.notes ? `: ${POLICY.terms.notes.api}` : ""}. 자세한 내용은 `}<Link viewTransition to="/terms" className={link}>{POLICY.terms.name}</Link>에서 확인하세요.</p>
      </Block>

    </>
  );
}
