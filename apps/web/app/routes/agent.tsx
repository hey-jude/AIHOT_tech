import { useEffect, useState } from "react";
import { IntentLink } from "../components/ui/IntentLink";
import { useLoaderData, useNavigate, useSearchParams } from "react-router";
import type { Route } from "./+types/agent";
import { PUBLIC_INTERFACE_VERSION } from "@aihot/contracts/http-policy";
import { SEO_TITLES, SITE } from "@aihot/site";
import { apiGet, cachedPage } from "../lib/api.server";
import { pageReuse } from "../lib/page-reuse";
import { listPath, pageMeta, siteUrl } from "../lib/seo";
import { IconArrowUpRight, IconChevronRight, IconCode, IconPlug, IconRss } from "../components/icons";
import { Kicker } from "../components/ui/Kicker";
import { AsideCard, ReadingLayout } from "../components/ui/Page";
import { AGENT_PARTS, GUIDE_CLIENTS, TAG } from "../features/agent/module-parts";
import { ApiPanel, McpPanel, mcpToolCount, RssPanel } from "../features/agent/panels";
import type { AgentTrack } from "../modules";
import { PhoneBar } from "../components/shell/PhoneBar";
import type { Screen } from "../components/shell/screens";

export const handle: Screen = { tab: "me", name: "Agent 접속" };

export { pageHeaders as headers } from "../lib/api.server";

const V = PUBLIC_INTERFACE_VERSION;

/** The ways in, the modules' first. The chooser's cards are the tabs: `?tab=` (the first is the default and not written). */
const TRACKS: AgentTrack[] = [
  ...AGENT_PARTS.flatMap((p) => p.tracks ?? []),
  { key: "mcp", name: "MCP", short: "MCP", pitch: `주소 하나를 입력해 도구 ${mcpToolCount()}개 추가`, fit: "Claude 데스크톱, Cursor 등 원격 MCP 클라이언트", icon: IconPlug, Panel: McpPanel },
  { key: "rss", name: "RSS", short: "RSS", pitch: "주소를 복사해 리더에서 구독", fit: "Reeder, Folo, Inoreader, n8n", icon: IconRss, Panel: RssPanel },
  { key: "api", name: "REST API", short: "API", pitch: "익명 GET으로 직접 데이터 조회", fit: "스크립트, 봇, 미니 앱, 대시보드", icon: IconCode, Panel: ApiPanel, anchors: ["agent-api-recovery"] },
];
const FIRST = TRACKS[0]!.key;
const tabKey = (key: string | null) => key && TRACKS.some(t => t.key === key) ? key : FIRST;
const hrefOf = (key: string) => (key === FIRST ? "/agent" : `/agent?tab=${key}`);
/** The number of ways, written as Korean words. */
const WAYS = ["영", "한", "두", "세", "네", "다섯", "여섯"][TRACKS.length];

/** The modules' sections at the end of a panel. */
const BLOCKS = AGENT_PARTS.flatMap((p) => p.blocks ?? []);
/** Which tab each section that can be linked to is on: the tracks' own, then the modules'. */
const ANCHORS = new Map([
  ...TRACKS.flatMap((t) => (t.anchors ?? []).map((id) => [id, t.key] as const)),
  ...BLOCKS.map((b) => [b.anchor, b.track] as const),
]);
const anchorHref = (id: string) => `${hrefOf(ANCHORS.get(id)!)}#${id}`;

/** Machine-readable entry points, with what each one is for. */
const RESOURCES: Array<[label: string, href: string, note: string]> = [
  ["llms.txt", "/llms.txt", "대규모 언어 모델을 위한 사이트 안내"],
  ["Agent 사용 안내", "/api/v1/agent", `Agent가 읽고 바로 조회할 수 있습니다${GUIDE_CLIENTS ? ` · ${GUIDE_CLIENTS}에서도 사용` : ""}`],
  ["OpenAPI 3.1", "/openapi-v1.json", `REST API 전체 명세 · ${V}`],
  ...AGENT_PARTS.flatMap((p) => p.resources ?? []),
];

const BANNERS = AGENT_PARTS.flatMap((p) => (p.Banner ? [p.Banner] : []));
/** The tag's value: a hook, called on every render. */
const useTag = TAG?.useValue ?? (() => null);

export async function loader({ request }: Route.LoaderArgs) {
  // Only whether the api answers, within three seconds.
  const healthy = await apiGet("/api/health", { signal: AbortSignal.any([request.signal, AbortSignal.timeout(3000)]) }).then(() => true, () => false);
  return cachedPage(300, {
    healthy,
    // The examples show the configured public address, the same on the server and in the browser.
    base: siteUrl(),
  });
}

/** The tabs read one result, kept under the address without `tab`. */
export const { clientLoader, shouldRevalidate } = pageReuse<typeof loader>((url) => {
  const params = new URLSearchParams(url.search);
  params.delete("tab");
  return url.pathname + (params.size ? `?${params}` : "");
});

export function meta({ location }: Route.MetaArgs) {
  const tab = tabKey(new URLSearchParams(location.search).get('tab'));
  const path = listPath("/agent", { tab: tab !== FIRST ? tab : null });
  return pageMeta({
    title: SEO_TITLES.agent,
    description: `${SITE.name}을 Agent에 연결하세요. ${TRACKS.map((t) => t.name).join(", ")} 등 ${WAYS}가지 방식으로 익명 조회가 가능하며, API Key 없이 간편하게 설정할 수 있습니다.`,
    path,
    image: "/og/pages/agent.png",
  });
}

export default function AgentPage() {
  const { healthy, base } = useLoaderData<typeof loader>();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const tag = useTag();
  const tab = tabKey(params.get('tab'));
  // A section to scroll to once its panel is on the page.
  const [target, setTarget] = useState<string | null>(null);

  // Opened at a section's anchor: show its tab and scroll there.
  useEffect(() => {
    const hash = location.hash.slice(1);
    const key = ANCHORS.get(hash);
    if (key) {
      if (key !== tab) navigate(`${hrefOf(key)}#${hash}`, { replace: true, preventScrollReset: true });
      setTarget(hash);
    }
  }, []);
  useEffect(() => {
    if (!target || tab !== ANCHORS.get(target)) return;
    document.getElementById(target)?.scrollIntoView({ block: "start" });
    setTarget(null);
  }, [target, tab]);

  const select = (key: string) => {
    if (key === tab) return;
    navigate(hrefOf(key), { replace: true, preventScrollReset: true });
  };
  const open = (id: string) => {
    navigate(anchorHref(id), { replace: true, preventScrollReset: true });
    setTarget(id);
  };
  const track = TRACKS.find((t) => t.key === tab);

  const chip = "inline-flex h-7 items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 text-[12px] text-ink-3";
  const aside = (
    <>
      <AsideCard title="접속 방식" className="hidden side:block">
        <nav aria-label="접속 방식" className="-mx-2 -mb-1 space-y-0.5">
          {TRACKS.map((t) => {
            const on = t.key === tab;
            return (
              <a
                key={t.key}
                href={hrefOf(t.key)}
                onClick={(e) => {
                  e.preventDefault();
                  select(t.key);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                aria-current={on ? "true" : undefined}
                className={`flex items-center gap-2.5 rounded-control px-2 py-2 text-[13.5px] transition-colors ${on ? "bg-accent-soft font-medium text-accent" : "text-ink-2 hover:bg-bg-sunk hover:text-ink"}`}
              >
                <t.icon size={16} />
                <span className="min-w-0 flex-1">{t.name}</span>
                {on && <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />}
              </a>
            );
          })}
        </nav>
      </AsideCard>
      <AsideCard title="접속 자료">
        <nav aria-label="접속 자료" className="-mx-2 -mb-1">
          {RESOURCES.map(([l, h, note]) => (
            <a key={h} href={h} target={h.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="group flex items-start gap-2 rounded-control px-2 py-2 transition-colors hover:bg-bg-sunk">
              <span className="min-w-0 flex-1">
                <span className="block text-[13.5px] text-ink-2 group-hover:text-ink">{l}</span>
                <span className="mt-0.5 block text-[12px] text-ink-4">{note}</span>
              </span>
              <IconArrowUpRight size={13} className="mt-1 shrink-0 text-ink-4" />
            </a>
          ))}
        </nav>
      </AsideCard>
      <AsideCard title="연결이 안 되나요?">
        <p className="text-[13px] leading-[1.75] text-ink-3">플랫폼, 버전, 오류 내용을 피드백에 남겨 주세요. 토큰이나 로컬 파일은 보내지 마세요.</p>
        <IntentLink viewTransition to="/feedback" className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-accent hover:underline">
          피드백 남기기 <IconChevronRight size={14} />
        </IntentLink>
      </AsideCard>
    </>
  );

  return (
    <>
    <PhoneBar back={{ to: "/more", label: "마이" }} title="Agent 접속" />
    <ReadingLayout aside={aside}>
      <header className="lg:pt-5">
        <Kicker>AGENT 접속</Kicker>
        <h1 data-page-title="" className="mt-4 text-[28px] font-semibold leading-[1.3] text-ink sm:text-[32px]">{`${SITE.name}을 Agent에 연결하세요`}</h1>
        <p className="mt-3 max-w-[40em] text-[15px] leading-[1.8] text-ink-3">{`${TRACKS.map((t) => t.short).join(", ")} 등 ${WAYS}가지 방식으로 같은 데이터를 조회합니다. 엄선, 핫 이슈, 일간, 주간, 월간 중 사용하는 도구에 맞는 방식을 선택하세요. 모두 익명 읽기 전용이며 가입이나 API Key가 필요 없습니다.`}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className={`${chip} ${healthy ? "text-ok" : "text-hot"}`}>
            <span className={`size-1.5 rounded-full ${healthy ? "bg-ok" : "bg-hot"}`} aria-hidden="true" />
            {healthy ? "서비스 정상" : "서비스 오류"}
          </span>
          <span className={chip}>버전 <span className="mono text-ink-2">{V}</span></span>
          <span className={chip}>익명 읽기 전용 · Key 불필요</span>
        </div>
      </header>

      {BANNERS.map((Banner, i) => <Banner key={i} base={base} tag={tag} href={anchorHref} open={open} />)}

      <div role="tablist" aria-label="접속 방식" className="mt-8 grid grid-cols-2 gap-2.5 sm:gap-3 2xl:grid-cols-4">
        {TRACKS.map((t) => {
          const on = t.key === tab;
          return (
            <a
              key={t.key}
              href={hrefOf(t.key)}
              role="tab"
              id={`agent-tab-${t.key}`}
              aria-selected={on}
              aria-controls="agent-panel"
              onClick={(e) => {
                e.preventDefault();
                select(t.key);
              }}
              className={`group flex flex-col rounded-card border p-3.5 transition-[border-color,background-color,box-shadow] duration-200 sm:p-4 ${on ? "border-accent/50 bg-accent-softer shadow-[inset_0_0_0_1px_var(--accent)]" : "border-line bg-surface shadow-[var(--shadow-card)] hover:border-line-strong hover:shadow-[var(--shadow-card-hover)]"}`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className={`grid size-9 place-items-center rounded-control transition-colors ${on ? "bg-accent text-accent-contrast" : "bg-bg-sunk text-ink-3 group-hover:text-ink"}`}>
                  <t.icon size={18} />
                </span>
                {t.badge && <span className="inline-flex h-[18px] items-center rounded-full bg-accent-soft px-2 text-[11px] font-medium text-accent">{t.badge}</span>}
              </span>
              <span className="mt-3 text-[15.5px] font-semibold text-ink">{t.name}</span>
              <span className="mt-1 text-[13px] leading-snug text-ink-2">{t.pitch}</span>
              <span className="mt-2 hidden text-[12px] leading-snug text-ink-4 sm:block">{t.fit}</span>
            </a>
          );
        })}
      </div>
      {TAG && <TAG.Note />}

      <section id="agent-panel" role="tabpanel" aria-labelledby={`agent-tab-${tab}`} className="mt-9">
        {track && <track.Panel key={track.key} base={base} tag={tag} />}
        {BLOCKS.filter((b) => b.track === tab).map((b) => <b.Block key={b.anchor} base={base} tag={tag} />)}
      </section>
    </ReadingLayout>
    </>
  );
}
