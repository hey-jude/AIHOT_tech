import { useLoaderData } from "react-router";
import type { Route } from "./+types/hot";
import { IntentLink } from "../components/ui/IntentLink";
import type { HotEntryView, HotResponse } from "@aihot/contracts/site";
import { seoulDate } from "@aihot/contracts/time";
import { shortAddresses } from "@aihot/contracts/addresses";
import { SEO_TITLES, subjectAfter, withSubject } from "@aihot/site";
import { cachedPage, loadOr404 } from "../lib/api.server";
import { pageReuse } from "../lib/page-reuse";
import { archiveLd, pageMeta } from "../lib/seo";
import { monthDay, monthDayTime } from "../lib/format";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/Page";
import { IconChevronDown, IconInfo } from "../components/icons";
import { Sparkline } from "../features/hot/Sparkline";
import { Faces } from "../features/hot/Faces";
import { Delta } from "../features/hot/Delta";
import { PhoneBar } from "../components/shell/PhoneBar";
import { Picture } from "../components/ui/Picture";
import { navUp } from "../components/shell/nav";
import { scrollBehavior } from "../lib/motion";
import type { Screen } from "../components/shell/screens";

export const handle: Screen = { tab: navUp("/hot").tab, name: "핫 이슈" };
export { pageHeaders as headers } from "../lib/api.server";
export const { clientLoader, shouldRevalidate } = pageReuse<typeof loader>();

export async function loader({ request }: { request: Request }) {
  return cachedPage(120, { hot: await loadOr404<HotResponse>("/api/site/hot", { signal: request.signal }) });
}

export function meta({ loaderData }: Route.MetaArgs) {
  const hot = loaderData?.hot;
  const entries = hot?.entries ?? [];
  // A search result answers "what is hot today" with the three events the page leads with, dated by the ranking.
  const lead = hot?.computedAt && entries.length
    ? `${subjectAfter(monthDay(seoulDate(hot.computedAt)), "핫 이슈")} · ${entries.slice(0, 3).map((e) => e.story.title).join(" · ")}.`
    : "";
  return pageMeta({
    title: SEO_TITLES.hot,
    description: `${lead}지난 48시간 동안 가장 많이 언급된 사건 10개: 화제성, 추이, 보도 출처를 확인하세요.`,
    path: "/hot",
    image: "/og/pages/hot.png",
    jsonLd: entries.length ? archiveLd("/hot", SEO_TITLES.hot, entries.map((e) => ({ path: `/story/${e.story.publicId}`, name: e.story.title }))) : undefined,
  });
}

const BADGES: Record<HotEntryView["badges"][number], { label: string; tone: "hot" | "accent" | "amber"; hint: string }> = {
  surge: { label: "급상승", tone: "hot", hint: "언급량이 빠르게 증가" },
  new: { label: "신규", tone: "accent", hint: "첫 보도 후 6시간 이내" },
  rising: { label: "상승 중", tone: "amber", hint: "언급량이 계속 증가" },
};

const RANK_COLOR = ["text-rank-1", "text-rank-2", "text-rank-3"];
const rankColor = (rank: number) => RANK_COLOR[rank - 1] ?? "text-rank-rest";
const pad = (rank: number) => String(rank).padStart(2, "0");

/** "매체·계정 등 출처 4곳 · 참여자 7명". */
function Voices({ e }: { e: HotEntryView }) {
  const names = e.sourceNames.slice(0, 2);
  return (
    <span className="min-w-0 text-[12.5px] leading-snug text-ink-4">
      {/* Lines break between the phrases, never inside one. */}
      <span className="whitespace-nowrap">
        {names.length > 0 && <span className="text-ink-3">{names.join("、")}</span>}
        {e.sourceCount > names.length ? ` 등 출처 ${e.sourceCount}곳` : names.length ? " 보도" : `출처 ${e.sourceCount}곳`}
      </span>
      <span className="mx-1.5 text-line-strong">·</span>
      <span className="whitespace-nowrap">
        <span className="num">{e.participantCount}</span>명 참여
      </span>
    </span>
  );
}

function Badges({ e }: { e: HotEntryView }) {
  return e.badges.map((b) => (
    <Badge key={b} tone={BADGES[b].tone} title={BADGES[b].hint}>
      {BADGES[b].label}
    </Badge>
  ));
}

/** The whole card opens the event; the title carries the link and stretches over the card. */
function StoryLink({ e, className }: { e: HotEntryView; className: string }) {
  return (
    <IntentLink viewTransition to={`/story/${e.story.publicId}`} className={`transition-colors after:absolute after:inset-0 after:content-[''] ${className}`}>
      {e.story.title}
    </IntentLink>
  );
}

/**
 * The lead card's picture slot when the story has no picture of its own: its day of heat, drawn large
 * on a faint wash, with where it peaked. Without enough comparable hours the text takes the width.
 */
function HeatPanel({ e }: { e: HotEntryView }) {
  const seen = e.spark.filter((v): v is number => v !== null);
  const peak = Math.max(...seen);
  const peakAt = e.spark.findIndex((v) => v === peak);
  return (
    <div className="order-first flex aspect-[2/1] flex-col rounded-panel bg-accent-softer p-4 ring-1 ring-inset ring-line-soft xl:order-none xl:aspect-[16/10] dark:bg-accent-soft">
      <div className="flex items-baseline justify-between text-[11.5px] text-ink-4">
        <span className="font-semibold text-ink-3">24시간 화제성</span>
        <span>
          최고 <span className="mono text-ink-2">{Math.round(peak)}</span>
          {peakAt >= 0 && <span> · {peakAt === e.spark.length - 1 ? "현재" : `${e.spark.length - 1 - peakAt}시간 전`}</span>}
        </span>
      </div>
      <Sparkline values={e.spark} className="mt-3 min-h-0 w-full flex-1" />
      <div className="mt-2 flex justify-between text-[11px] text-ink-4">
        <span>24시간 전</span>
        <span>현재</span>
      </div>
    </div>
  );
}

/** No. 1: the event people are talking about most, with its picture, digest, latest turn and day of heat. */
function Lead({ e }: { e: HotEntryView }) {
  const panel = !e.cover && e.spark.filter((v) => v !== null).length >= 3;
  return (
    <article className="card card-hover group relative flex flex-col overflow-hidden p-5 sm:p-6">
      <div className="flex items-center gap-2.5">
        <span className={`mono text-[12px] font-bold tracking-[0.16em] ${rankColor(e.rank)}`}>NO.{pad(e.rank)}</span>
        <Badges e={e} />
        <Delta trend={e.trend} pct={e.trendPct} className="ml-auto" />
      </div>
      <div className={`mt-4 grid gap-5 ${e.cover || panel ? "xl:grid-cols-[minmax(0,1fr)_minmax(0,0.72fr)] xl:gap-7" : ""}`}>
        <div className="min-w-0">
          <h2 className="text-[21px] font-bold leading-[1.4] tracking-[-0.01em] text-ink sm:text-[23px] lg:text-[25px] lg:leading-[1.38]">
            <StoryLink e={e} className="group-hover:text-accent" />
          </h2>
          {e.summary && <p className="mt-3 line-clamp-3 text-[14px] leading-[1.75] text-ink-3">{shortAddresses(e.summary)}</p>}
        </div>
        {e.cover ? (
          <div className="order-first overflow-hidden well rounded-panel xl:order-none">
            <Picture src={e.cover.url} srcSet={e.cover.srcSet} sizes="(min-width: 1280px) calc(28vw - 96px), (min-width: 1024px) calc(58vw - 180px), (min-width: 640px) 568px, calc(100vw - 74px)" width={e.cover.width ?? undefined} height={e.cover.height ?? undefined} alt="" loading="eager" fetchPriority="high" decoding="async" className="aspect-[16/9] size-full object-cover transition-transform duration-500 group-hover:scale-[1.02] xl:aspect-[16/10]" />
          </div>
        ) : (
          panel && <HeatPanel e={e} />
        )}
      </div>
      {/* Side by side while the card is wide enough; on a narrow card the day of heat and the index
          move under the voices, to the right, instead of squeezing them into a column. */}
      <div className="mt-auto flex flex-wrap items-end gap-x-6 gap-y-4 pt-5">
        <div className="min-w-0 flex-[1_1_18rem] space-y-2.5">
          {e.latest && (
            <p className="line-clamp-2 text-[13px] leading-[1.7] text-ink-2">
              <span className="mr-2 text-[12px] font-semibold text-accent">최신 소식</span>
              {e.latest}
            </p>
          )}
          {/* The voices drop under the faces when the card is too narrow for both (small phones). */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <Faces participants={e.participants} total={e.participantCount} size={24} />
            <Voices e={e} />
          </div>
        </div>
        <div className="flex w-full shrink-0 items-end justify-between gap-5 sm:ml-auto sm:w-auto sm:justify-end">
          {!panel && <Sparkline values={e.spark} className="h-10 w-[140px]" />}
          <div className="text-right">
            <div className="mono text-[34px] font-semibold leading-none tracking-[-0.03em] text-ink">{Math.round(e.heat)}</div>
            <div className="mt-1 text-[11.5px] text-ink-4">화제성 지수</div>
          </div>
        </div>
      </div>
    </article>
  );
}

/** No. 2 and 3: the same card, smaller, without the picture. */
function Runner({ e }: { e: HotEntryView }) {
  return (
    <article className="card card-hover group relative flex flex-col px-5 py-4">
      <div className="flex items-center gap-2.5">
        <span className={`mono text-[12px] font-bold tracking-[0.16em] ${rankColor(e.rank)}`}>NO.{pad(e.rank)}</span>
        <Badges e={e} />
        <Delta trend={e.trend} pct={e.trendPct} className="ml-auto" />
      </div>
      <h2 className="mt-2.5 line-clamp-2 text-[16px] font-[650] leading-[1.5] text-ink">
        <StoryLink e={e} className="group-hover:text-accent" />
      </h2>
      {e.summary && <p className="mt-1.5 line-clamp-2 text-[13px] leading-[1.7] text-ink-3 lg:line-clamp-1">{shortAddresses(e.summary)}</p>}
      <div className="mt-auto flex flex-wrap items-end justify-between gap-x-4 gap-y-2 pt-3">
        <div className="flex min-w-0 flex-col gap-1.5">
          <Faces participants={e.participants} total={e.participantCount} size={20} />
          <span className="text-[12px] text-ink-4">
            <span className="whitespace-nowrap"><span className="num">{e.sourceCount}</span>곳 출처</span> ·{" "}
            <span className="whitespace-nowrap"><span className="num">{e.participantCount}</span>명 참여</span>
          </span>
        </div>
        <div className="ml-auto flex items-end gap-3">
          <Sparkline values={e.spark} className="h-7 w-[92px]" />
          <span className="mono text-[24px] font-semibold leading-none tracking-[-0.02em] text-ink">{Math.round(e.heat)}</span>
        </div>
      </div>
    </article>
  );
}

/** No. 4–10: a row each, with a line of the digest, faces, the day of heat and the index. */
function Row({ e }: { e: HotEntryView }) {
  return (
    <li className="group relative grid grid-cols-[30px_minmax(0,1fr)] items-start gap-x-3 px-4 py-3 transition-colors hover:bg-bg-sunk/70 sm:px-5 wide:grid-cols-[44px_minmax(0,1fr)_auto_104px_76px] wide:items-center wide:gap-x-6 wide:px-6 wide:py-3.5 dark:hover:bg-bg-muted/40">
      <span className={`mono text-[16px] font-semibold leading-[24px] wide:text-[17px] ${rankColor(e.rank)}`} aria-label={`화제성 순위 ${e.rank}위`}>
        {pad(e.rank)}
      </span>
      <div className="min-w-0">
        <h3 className="text-[15px] font-[650] leading-[1.55] text-ink">
          <StoryLink e={e} className="group-hover:text-accent" />
          {e.badges.length > 0 && (
            <span className="ml-2 inline-flex translate-y-[-2px] gap-1 align-middle">
              <Badges e={e} />
            </span>
          )}
        </h3>
        {e.summary && <p className="mt-0.5 line-clamp-2 text-[13px] leading-[1.65] text-ink-4 wide:line-clamp-1">{shortAddresses(e.summary)}</p>}
        <div className="mt-2 flex items-center gap-2.5 wide:hidden">
          <Faces participants={e.participants} total={e.participantCount} size={20} />
          <span className="text-[12px] text-ink-4">
            <span className="num">{e.sourceCount}</span>곳 출처
          </span>
          <span className="ml-auto flex items-center gap-2">
            <span className="mono text-[17px] font-semibold leading-none text-ink">{Math.round(e.heat)}</span>
            <Delta trend={e.trend} pct={e.trendPct} />
          </span>
        </div>
      </div>
      <div className="hidden items-center gap-2.5 wide:flex">
        <Faces participants={e.participants} total={e.participantCount} size={20} />
      </div>
      <Sparkline values={e.spark} className="hidden h-7 w-[104px] wide:block" />
      <div className="hidden flex-col items-end gap-1 wide:flex">
        <span className="mono text-[20px] font-semibold leading-none tracking-[-0.02em] text-ink">{Math.round(e.heat)}</span>
        <Delta trend={e.trend} pct={e.trendPct} />
      </div>
    </li>
  );
}

/** Opens the heat-score explanation at the foot of the page and brings it into view. */
function showMethod() {
  const method = document.getElementById("hot-method") as HTMLDetailsElement | null;
  if (!method) return;
  method.open = true;
  method.scrollIntoView({ behavior: scrollBehavior(), block: "center" });
}

export default function HotPage() {
  const { hot } = useLoaderData<typeof loader>();
  const [lead, ...rest] = hot.entries;
  const runners = rest.slice(0, 2);
  const others = rest.slice(2);
  return (
    <div className="pb-10">
      <PhoneBar
        title="핫 이슈"
        large
        sub={
          <>
            최근 {hot.windowHours}시간 동안 많이 언급된 사건 {hot.entries.length || 10}개
            {hot.computedAt && (
              <>
                {" · "}
                <span className="num">{monthDayTime(hot.computedAt)}</span> 업데이트
              </>
            )}
          </>
        }
        actions={
          <button type="button" onClick={showMethod} className="flex h-11 items-center gap-1 px-3 text-[14px] text-accent active:opacity-50">
            <IconInfo size={17} /> 산정 방식
          </button>
        }
      />
      <header className="hidden flex-wrap items-end justify-between gap-x-6 gap-y-2 pb-5 pt-1 lg:flex">
        <div>
          <div className="flex items-center gap-2 text-[12px] font-semibold tracking-[0.08em] text-hot">
            <span className="relative flex size-2" aria-hidden="true">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-hot opacity-30" />
              <span className="relative inline-flex size-2 rounded-full bg-hot" />
            </span>
            실시간 화제성
          </div>
          <h1 className="mt-1.5 text-[24px] font-bold leading-[1.3] tracking-[-0.01em] text-ink lg:text-[26px]">{withSubject("핫 이슈")}</h1>
          <p className="mt-1.5 text-[13.5px] text-ink-3">지난 {hot.windowHours}시간 동안 많이 언급된 사건 {hot.entries.length || 10}개</p>
        </div>
        {hot.computedAt && (
          <p className="text-[12px] text-ink-4">
            <span className="num">{monthDayTime(hot.computedAt)}</span> 업데이트 · 언급량순
          </p>
        )}
      </header>

      {!lead ? (
        <div className="card rounded-sheet">
          <EmptyState title="아직 핫 이슈가 없습니다">여러 출처에서 함께 다룬 사건이 아직 충분하지 않습니다.</EmptyState>
        </div>
      ) : (
        <>
          <section aria-label="화제성 상위 3개" className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:gap-4">
            <div className="grid grid-cols-1 lg:col-span-7 lg:row-span-2 xl:col-span-8">
              <Lead e={lead} />
            </div>
            {runners.map((e) => (
              <div key={e.story.publicId} className="grid grid-cols-1 lg:col-span-5 xl:col-span-4">
                <Runner e={e} />
              </div>
            ))}
          </section>

          {others.length > 0 && (
            <section aria-label="그 밖의 핫 이슈" className="mt-6 lg:mt-7">
              <div className="mb-3 flex items-baseline justify-between px-1">
                <h2 className="text-[15px] font-semibold text-ink">
                  더 보기 <span className="num font-normal text-ink-4">No.{pad(others[0]!.rank)}–{pad(others[others.length - 1]!.rank)}</span>
                </h2>
                <span className="hidden text-[12px] text-ink-4 wide:block">참여자 · 24시간 추이 · 화제성 지수</span>
              </div>
              <ol className="card divide-y divide-line-soft overflow-hidden">
                {others.map((e) => (
                  <Row key={e.story.publicId} e={e} />
                ))}
              </ol>
            </section>
          )}
        </>
      )}

      <details id="hot-method" className="disclosure group/method mt-8 scroll-mt-[calc(var(--bar-h)+16px)] text-[12px] text-ink-4">
        <summary className="flex items-center gap-1.5 py-1 transition-colors hover:text-ink-2">
          <IconInfo size={15} />
          화제성은 어떻게 계산하나요?
          <span className="ml-auto inline-flex items-center gap-0.5">
            <span className="group-open/method:hidden">산정 기준 보기</span>
            <span className="hidden group-open/method:inline">접기</span>
            <IconChevronDown size={13} className="transition-transform duration-200 group-open/method:rotate-180" />
          </span>
        </summary>
        <div className="max-w-[760px] space-y-2 pb-2 pl-[21px] pt-2 leading-[1.75] text-ink-3">
          <p>화제성은 같은 사건을 언급한 계정과 기관의 수를 바탕으로 합니다. 같은 곳의 반복 게시물은 한 번만 계산하고, 최근 언급일수록 비중이 높으며 24시간마다 절반으로 줄어듭니다. 언급량을 나타내며 보도의 품질을 뜻하지는 않습니다.</p>
          <p>순위에는 지난 48시간의 언급만 반영됩니다. 추이는 계속 확인해 온 같은 출처끼리 비교하므로 관측 가능한 범위만 보여 주며, 전체 인터넷의 참여자 수를 뜻하지 않습니다. 비교할 과거 데이터가 없으면 추이선을 표시하지 않습니다.</p>
          <p>
            출처 목록에는 공개 열람 가능한 보도만 표시합니다. 목록에 나오지 않는 계정과 기관도 논의에 참여할 수 있습니다. 같은 기관이 여러 플랫폼에 올린 게시물은 하나로 계산하므로 참여자 수가 출처 수보다 적을 수 있습니다. 사건을 선택하면 각 측의 보도와 관점을 볼 수 있습니다.
          </p>
          <dl className="flex flex-wrap gap-x-5 gap-y-1.5 pt-1">
            {Object.values(BADGES).map((b) => (
              <div key={b.label} className="flex items-center gap-1.5">
                <dt>
                  <Badge tone={b.tone}>{b.label}</Badge>
                </dt>
                <dd>{b.hint}</dd>
              </div>
            ))}
          </dl>
        </div>
      </details>
    </div>
  );
}
