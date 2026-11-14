import { SITE } from "@aihot/site";
import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import { CATEGORY_KEYS, CATEGORY_LABELS } from "@aihot/contracts/taxonomy";
import type { Route } from "./+types/content-item";
import type { AdminContentChain, AdminPresentationRefresh } from "@aihot/contracts/admin";
import { adminGet } from "../../lib/admin.server";
import { useAdminAction } from "../../features/admin/action";
import { bj, money } from "../../features/admin/format";
import { KIND_LABEL, MODE_LABEL, VISIBILITY_LABEL } from "../../features/admin/labels";
import { AdminPage, Badge, Button, Card, Empty, Field, Input, Json, KV, ReasonDialog, Select, Textarea } from "../../features/admin/ui";


export async function loader({ request, params }: Route.LoaderArgs) {
  return adminGet<AdminContentChain>(request, `/api/admin/content/${encodeURIComponent(params.id)}`);
}

export const meta: Route.MetaFunction = ({ loaderData }) => [{ title: `${loaderData?.publication?.title ?? loaderData?.article.title ?? "콘텐츠"} · ${SITE.name} 관리자` }];

function Step({ title, meta, children, tone = "accent", last }: { title: ReactNode; meta?: ReactNode; children: ReactNode; tone?: "accent" | "muted" | "bad"; last?: boolean }) {
  const dot = tone === "bad" ? "bg-hot" : tone === "muted" ? "bg-ink-4" : "bg-accent";
  return (
    <li className="relative pl-7">
      {!last && <span className="absolute left-[7px] top-4 h-full w-px bg-line-strong" aria-hidden />}
      <span className={`absolute left-[3px] top-[7px] size-[9px] rounded-full ring-4 ring-bg ${dot}`} aria-hidden />
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <h3 className="text-[13.5px] font-semibold text-ink">{title}</h3>
        {meta && <div className="text-[12px] text-ink-4">{meta}</div>}
      </div>
      <div className="mt-2 pb-6 text-[13px] text-ink-2">{children}</div>
    </li>
  );
}

type Dialog = null | "visibility" | "seo" | "override" | "analyze" | "extract" | "presentation" | "group" | "detach" | "merge";

export default function ContentItem({ loaderData }: Route.ComponentProps) {
  const c = loaderData;
  const a = c.article;
  const p = c.publication;
  const { run, pending } = useAdminAction();
  const [dialog, setDialog] = useState<Dialog>(null);
  const [presentation, setPresentation] = useState<AdminPresentationRefresh | null>(null);
  const [visibility, setVisibility] = useState<string>(p?.visibility ?? "public");
  const [fields, setFields] = useState({ title: "", summary: "", reason: "", category: "", tags: "", scoreMode: "", score: "", selected: "", silent: "" });
  const [mergeInto, setMergeInto] = useState("");
  const version = c.override?.version ?? 0;
  const base = `/api/admin/content/${encodeURIComponent(a.id)}`;
  const story = c.membership[0];
  const title = p?.title ?? a.title;

  const openOverride = () => {
    const f = (c.override?.fields ?? {}) as Record<string, unknown>;
    setFields({
      title: String(f.title ?? ""),
      summary: String(f.summary ?? ""),
      reason: String(f.reason ?? ""),
      category: String(f.category ?? ""),
      tags: Array.isArray(f.tags) ? (f.tags as string[]).join(", ") : "",
      scoreMode: f.score === null ? "none" : typeof f.score === "number" ? "value" : "",
      score: typeof f.score === "number" ? String(f.score) : "",
      selected: f.selected === undefined ? "" : String(f.selected),
      silent: f.silent === undefined ? "" : String(f.silent),
    });
    setDialog("override");
  };

  return (
    <AdminPage
      title={<span className="line-clamp-2">{title}</span>}
      subtitle={
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-mono text-[12px]">{a.id}</span>
          <span>·</span>
          <Link className="hover:text-accent" to={`/admin/sources/${encodeURIComponent(a.source_id)}`}>{a.source_name}</Link>
          <span>·</span>
          <a className="max-w-[420px] truncate hover:text-accent" href={a.url} target="_blank" rel="noreferrer">{a.url}</a>
          {p?.visibility !== "withdrawn" && p && (
            <>
              <span>·</span>
              <a className="text-accent" href={`/items/${a.id}`} target="_blank" rel="noreferrer">공개 페이지</a>
            </>
          )}
        </span>
      }
      actions={
        <>
          <Button onClick={() => setDialog("visibility")}>공개 범위</Button>
          {p && <Button onClick={() => setDialog("seo")}>{p.indexable ? "검색 제외" : "검색 허용"}</Button>}
          <Button onClick={openOverride}>직접 수정</Button>
          <Button onClick={() => { setPresentation(null); setDialog("presentation"); }}>본문 표시 업데이트</Button>
          <Button onClick={() => setDialog("analyze")}>다시 평가</Button>
        </>
      }
    >
      <div className="mb-5 flex flex-wrap gap-1.5">
        {p ? <Badge tone={p.visibility === "public" ? "ok" : "warn"}>{VISIBILITY_LABEL[p.visibility] ?? p.visibility}</Badge> : <Badge>미공개</Badge>}
        {p?.selected && <Badge tone="accent">주요 뉴스</Badge>}
        {p?.eligible === false && <Badge>공개 대상 아님</Badge>}
        {a.backfill && <Badge tone="warn">과거 데이터 수집</Badge>}
        <Badge>처리 상태 {a.processing_state}</Badge>
        {c.override && <Badge tone="info" title={c.override.reason ?? undefined}>직접 설정 v{c.override.version}</Badge>}
      </div>
      {a.processing_error && <div className="mb-5 rounded-card bg-hot-soft px-4 py-3 text-[13px] text-hot ring-1 ring-hot/20">{a.processing_error}</div>}

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <Card title="처리 흐름">
          <ol className="pt-1">
            <Step title="출처" meta={`${KIND_LABEL[a.source_kind] ?? a.source_kind} · ${String(a.tier).replace("_", ".")} · ${MODE_LABEL[a.participation_mode] ?? a.participation_mode}`}>
              <Link className="text-ink hover:text-accent" to={`/admin/sources/${encodeURIComponent(a.source_id)}`}>{a.source_name}</Link>
              <span className="text-ink-4"> · 사이트 본문 {a.site_fulltext ? "허용" : "허용 안 함"} · 외부 본문 {a.syndicate_fulltext ? "허용" : "허용 안 함"}</span>
            </Step>
            <Step title="발견" meta={`${c.discoveries.length}회`}>
              <ul className="space-y-1">
                {c.discoveries.map((d, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="num text-ink-4">{bj(d.discovered_at, true)}</span>
                    <span>{d.via}</span>
                    {d.source_id !== a.source_id && <span className="text-ink-3">경유 {d.source_id}</span>}
                  </li>
                ))}
              </ul>
              <div className="mt-1.5 text-[12px] text-ink-4">
                원문 시간 {a.published_at ? bj(a.published_at, true) : "알 수 없음"}{a.published_at_claim && !a.published_at ? `（주장 시각 ${a.published_at_claim}, 미반영）` : ""} · 타임라인 {bj(a.timeline_at, true)}
              </div>
            </Step>
            <Step title="본문 및 수정 이력" meta={`${a.revision}판 · 본문 ${a.body_status} · ${a.body_chars ?? 0}자`}>
              {c.revisions.length ? (
                <ul className="space-y-1">
                  {c.revisions.map((r) => (
                    <li key={r.revision} className="flex gap-2">
                      <span className="num text-ink-4">v{r.revision}</span>
                      <span className="min-w-0 flex-1 truncate">{r.title}</span>
                      <span className="num shrink-0 text-ink-4">{bj(r.created_at)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-ink-4">초기 버전만 있음</span>
              )}
              <div className="mt-2 flex gap-2">
                <Button size="sm" onClick={() => setDialog("extract")}>본문 다시 추출</Button>
              </div>
            </Step>
            <Step title="모델 판단" meta={`${c.analyses.length}회`} tone={c.analyses.length ? "accent" : "muted"}>
              {c.analyses.length ? (
                <div className="space-y-3">
                  {c.analyses.map((an) => (
                    <div key={an.id} className="rounded-control bg-bg-sunk/60 p-3 ring-1 ring-line">
                      <div className="flex flex-wrap items-center gap-1.5 text-[12px]">
                        <Badge tone={an.relevance === "pass" ? "ok" : "muted"}>{an.relevance}</Badge>
                        {an.selected && <Badge tone="accent">주요 뉴스 반영</Badge>}
                        <Badge tone="info">점수 {an.score}</Badge>
                        {an.category && <Badge>{CATEGORY_LABELS[an.category as keyof typeof CATEGORY_LABELS] ?? an.category}</Badge>}
                        <span className="text-ink-4">{an.model} · {an.prompt_version} · 입력 v{an.input_revision} · {an.origin} · {bj(an.created_at)}</span>
                      </div>
                      {an.title_zh && <div className="mt-2 font-medium text-ink">{an.title_zh}</div>}
                      {an.reason_zh && <div className="mt-1 text-[12.5px] leading-relaxed text-ink-3">{an.reason_zh}</div>}
                      {an.receipts.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5 text-[11.5px]">
                          {an.receipts.map((r) => (
                            <span key={r.id} className="num rounded-mark bg-surface px-1.5 py-0.5 text-ink-3 ring-1 ring-line">
                              요청 기록 #{r.id} · {r.status} · {r.model ?? r.service}{r.cost !== null ? ` · ${money(r.cost)}` : ""}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-ink-4">{a.participation_mode === "editorial" ? "아직 판단 전 (대기열 처리 중이거나 실패)" : "분위기 출처는 편집 판단을 하지 않음"}</span>
              )}
            </Step>
            <Step title="공개" tone={p ? (p.visibility === "withdrawn" ? "bad" : "accent") : "muted"} meta={p ? `업데이트 ${bj(p.updated_at, true)}` : undefined}>
              {p ? (
                <KV
                  items={[
                    ["범위", VISIBILITY_LABEL[p.visibility] ?? p.visibility],
                    ["주요 뉴스", p.selected ? `예 · 공개 시점 ${p.visible_after ? bj(p.visible_after, true) : "즉시"}` : "아니요"],
                    ["카테고리", p.category ? CATEGORY_LABELS[p.category as keyof typeof CATEGORY_LABELS] ?? p.category : null],
                    ["태그", (p.tags as string[] | null)?.join("、")],
                    ["요약", p.summary],
                    ["추천 이유", p.reason],
                    [
                      "본문 표시",
                      `${p.body_mode}${p.syndicate ? " · 외부에 전문 제공 가능" : ""}${
                        p.indexable ? (p.seo_indexed_at ? " · 검색 등록 가능 (수동 설정)" : " · 검색 등록 가능 (주요 뉴스 자동)") : p.seo_excluded_at ? " · 검색 미등록 (수동 제외)" : " · 검색 미등록"
                      }`,
                    ],
                  ]}
                />
              ) : (
                <span className="text-ink-4">공개 항목 없음 (관련성 기준 미달 또는 처리 중)</span>
              )}
              {c.override && (
                <div className="mt-3 rounded-control bg-accent-softer p-3 ring-1 ring-accent/15">
                  <div className="text-[12px] text-ink-3">수동 설정 v{c.override.version} · {c.override.updated_by} · {bj(c.override.updated_at, true)}{c.override.reason ? ` · ${c.override.reason}` : ""}</div>
                  <Json value={{ visibility: c.override.visibility, ...c.override.fields }} label="덮어쓴 필드" collapsed={false} />
                </div>
              )}
            </Step>
            <Step title="주요 뉴스 동기화 기록" meta={`${c.ledger.length}건`} tone={c.ledger.length ? "accent" : "muted"}>
              {c.ledger.length ? (
                <ul className="space-y-1">
                  {c.ledger.map((l) => (
                    <li key={l.seq} className="flex gap-2">
                      <span className="num text-ink-4">#{l.seq}</span>
                      <Badge tone={l.op === "remove" ? "warn" : "ok"}>{l.op}</Badge>
                      <span className="num text-ink-4">공개 {bj(l.visible_at)} · 기록 {bj(l.changed_at)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-ink-4">주요 뉴스 동기화 기록 없음</span>
              )}
            </Step>
            <Step title="이벤트 그룹화" tone={story ? "accent" : "muted"} meta={a.grouped_at ? `그룹화 ${bj(a.grouped_at, true)}` : "그룹화 안 됨"}>
              {c.membership.map((m) => (
                <div key={m.fact_id} className="mb-2">
                  <div>
                    사실 <span className="font-mono text-[12px]">#{m.fact_id}</span> {m.fact_title} <Badge>{m.role}</Badge> {m.manual && <Badge tone="info">수동</Badge>}
                  </div>
                  {m.story_public_id && (
                    <div className="mt-0.5">
                      이벤트 <a className="text-accent" href={`/story/${m.story_public_id}`} target="_blank" rel="noreferrer">{m.story_title}</a> <span className="font-mono text-[12px] text-ink-4">#{m.story_id}</span>
                    </div>
                  )}
                </div>
              ))}
              {c.decisions.length > 0 && (
                <ul className="mt-2 space-y-1 text-[12.5px]">
                  {c.decisions.map((d, i) => (
                    <li key={i} className="flex flex-wrap gap-2">
                      <span className="num text-ink-4">{bj(d.created_at)}</span>
                      <Badge>{d.verdict}</Badge>
                      {d.fact_id && <span>사실 #{d.fact_id}</span>}
                      {d.receipt_id && <span className="text-ink-4">요청 기록 #{d.receipt_id}</span>}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => setDialog("group")}>다시 그룹화</Button>
                {c.membership.length > 0 && <Button size="sm" onClick={() => setDialog("detach")}>이벤트에서 제외</Button>}
                {story?.story_id && <Button size="sm" onClick={() => setDialog("merge")}>이 이벤트를 병합…</Button>}
              </div>
            </Step>
            <Step title="전달" last meta={`${c.deliveries.length}건`} tone={c.deliveries.some((d) => d.status === "unknown") ? "bad" : c.deliveries.length ? "accent" : "muted"}>
              {c.deliveries.length ? (
                <ul className="space-y-1">
                  {c.deliveries.map((d, i) => (
                    <li key={i} className="flex flex-wrap gap-2">
                      <span>{d.target_key}</span>
                      <Badge tone={d.status === "sent" ? "ok" : d.status === "unknown" ? "bad" : "muted"}>{d.status}</Badge>
                      <span className="num text-ink-4">{bj(d.created_at)}{d.sent_at ? ` → ${bj(d.sent_at)}` : ""}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-ink-4">전달 기록 없음</span>
              )}
            </Step>
          </ol>
        </Card>

        <div className="space-y-5">
          <Card title="원본 정보">
            <KV
              items={[
                ["원본 제목", a.title],
                ["작성자", a.author],
                ["언어", a.language],
                ["식별 키", <span className="break-all font-mono text-[11.5px]">{a.identity_key}</span>],
              ]}
            />
          </Card>
          <Card title="수정 기록">
            {c.history.length ? (
              <ul className="space-y-3 text-[12.5px]">
                {c.history.map((h, i) => (
                  <li key={i}>
                    <div className="text-ink-2"><span className="font-medium">{h.action}</span> · {h.actor} · {bj(h.created_at)}</div>
                    {h.reason && <div className="text-ink-3">{h.reason}</div>}
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>수동 작업 없음</Empty>
            )}
          </Card>
        </div>
      </div>

      <ReasonDialog
        open={dialog === "seo"}
        title={p?.indexable ? "검색 등록 취소" : "검색 등록 설정"}
        description={
          p?.indexable
            ? "상세 페이지를 noindex로 되돌리고 사이트맵에서 제외합니다. 주요 뉴스 항목도 다시 설정하기 전까지 자동 등록되지 않습니다."
            : "상세 페이지는 기본적으로 noindex이며 주요 뉴스 항목은 자동 등록됩니다. 설정하면 (공개 상태일 때만) index로 바뀌어 사이트맵에 추가되고 다음 IndexNow 제출에 포함됩니다. 독립적인 가치가 있고 요약과 본문이 충분한 콘텐츠에 적합합니다."
        }
        confirmLabel={p?.indexable ? "검색 등록 취소" : "검색 등록 설정"}
        busy={pending === "seo"}
        onClose={() => setDialog(null)}
        onSubmit={async (reason) => (await run("POST", `${base}/seo`, { indexed: !p?.indexable, reason }, { label: "seo", success: p?.indexable ? "검색 등록을 취소했습니다" : "검색 등록을 설정했습니다" })) !== null}
      />

      <ReasonDialog
        open={dialog === "visibility"}
        title="공개 범위"
        description="변경 사항은 웹페이지, API, RSS, MCP, 동기화 기록과 검색 색인에 함께 적용되고 캐시가 갱신됩니다. 출처에서 게시 중단을 요청하면 먼저 신원과 범위를 확인하세요."
        danger={visibility === "withdrawn"}
        confirmLabel="적용"
        busy={pending === "visibility"}
        onClose={() => setDialog(null)}
        onSubmit={async (reason) => (await run("POST", `${base}/visibility`, { visibility, reason, version }, { label: "visibility", success: "공개 범위를 업데이트했습니다" })) !== null}
      >
        <div className="grid gap-2 sm:grid-cols-3">
          {([
            ["public", "공개", "정상적으로 표시"],
            ["summary-only", "요약만", "본문은 숨기고 제목과 요약만 표시"],
            ["withdrawn", "게시 중단", "모든 공개 경로에서 제거, 링크는 404"],
          ] as const).map(([v, label, hint]) => (
            <label key={v} className={`cursor-pointer rounded-card p-3 ring-1 transition-colors ${visibility === v ? "bg-accent-soft ring-accent" : "ring-line-strong hover:bg-bg-sunk"}`}>
              <input type="radio" name="visibility" className="sr-only" checked={visibility === v} onChange={() => setVisibility(v)} />
              <div className="text-[13.5px] font-medium text-ink">{label}</div>
              <div className="mt-0.5 text-[12px] text-ink-3">{hint}</div>
            </label>
          ))}
        </div>
      </ReasonDialog>

      <ReasonDialog
        open={dialog === "override"}
        title="수동 수정"
        description="수동 입력은 모델 결과보다 우선하며 이후 재처리에도 유지됩니다. 빈 필드는 수정하지 않고, 이미 수정된 값을 비우면 해당 수정이 삭제됩니다."
        confirmLabel="수정 저장"
        busy={pending === "override"}
        onClose={() => setDialog(null)}
        onSubmit={async (reason) => {
          const next: Record<string, unknown> = {};
          const clear: string[] = [];
          for (const k of ["title", "summary", "reason"] as const) {
            if (fields[k].trim()) next[k] = fields[k].trim();
            else if (c.override?.fields[k] !== undefined) clear.push(k);
          }
          if (fields.category) next.category = fields.category;
          else if (c.override?.fields.category !== undefined) clear.push("category");
          if (fields.tags.trim()) next.tags = fields.tags.split(/[,，]/).map((t) => t.trim()).filter(Boolean);
          else if (c.override?.fields.tags !== undefined) clear.push("tags");
          if (fields.scoreMode === "none") next.score = null;
          else if (fields.scoreMode === "value") next.score = Number(fields.score);
          else if (c.override?.fields.score !== undefined) clear.push("score");
          for (const k of ["selected", "silent"] as const) {
            if (fields[k] === "true" || fields[k] === "false") next[k] = fields[k] === "true";
            else if (c.override?.fields[k] !== undefined) clear.push(k);
          }
          return (await run("POST", `${base}/override`, { fields: next, clear, reason, version }, { label: "override", success: "수정을 저장하고 다시 게시했습니다" })) !== null;
        }}
      >
        <Field label="제목"><Input value={fields.title} placeholder={p?.title ?? ""} onChange={(e) => setFields({ ...fields, title: e.target.value })} /></Field>
        <Field label="요약"><Textarea rows={3} value={fields.summary} placeholder={p?.summary ?? ""} onChange={(e) => setFields({ ...fields, summary: e.target.value })} /></Field>
        <Field label="추천 이유"><Textarea rows={2} value={fields.reason} placeholder={p?.reason ?? ""} onChange={(e) => setFields({ ...fields, reason: e.target.value })} /></Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="카테고리">
            <Select value={fields.category} onChange={(e) => setFields({ ...fields, category: e.target.value })}>
              <option value="">수정 안 함</option>
              {CATEGORY_KEYS.map((k) => <option key={k} value={k}>{CATEGORY_LABELS[k]}</option>)}
            </Select>
          </Field>
          <Field label="태그 (쉼표로 구분)"><Input value={fields.tags} onChange={(e) => setFields({ ...fields, tags: e.target.value })} /></Field>
          <Field label="점수">
            <Select value={fields.scoreMode} onChange={(e) => setFields({ ...fields, scoreMode: e.target.value })}>
              <option value="">모델 기준</option>
              <option value="none">점수 취소</option>
              <option value="value">수동 점수</option>
            </Select>
          </Field>
          {fields.scoreMode === "value" && <Field label="점수 (0–100)"><Input type="number" min={0} max={100} step="any" required value={fields.score} onChange={(e) => setFields({ ...fields, score: e.target.value })} /></Field>}
          <Field label="주요 뉴스">
            <Select value={fields.selected} onChange={(e) => setFields({ ...fields, selected: e.target.value })}>
              <option value="">모델 기준</option>
              <option value="true">주요 뉴스 반영 강제</option>
              <option value="false">주요 뉴스 제외 강제</option>
            </Select>
          </Field>
          <Field label="전달">
            <Select value={fields.silent} onChange={(e) => setFields({ ...fields, silent: e.target.value })}>
              <option value="">기본</option>
              <option value="true">알림 없이 처리 (주요 뉴스로 선정되어도 전달 안 함)</option>
              <option value="false">알림 없이 처리 취소</option>
            </Select>
          </Field>
        </div>
      </ReasonDialog>

      <ReasonDialog
        open={dialog === "analyze"}
        title="현재 버전 다시 평가"
        description="새 모델 호출을 실행합니다 (비용이 발생하며 호출 내역이 저장됩니다). 같은 요청을 반복해도 중복 과금되지 않습니다."
        requireReason={false}
        confirmLabel="다시 평가"
        busy={pending === "analyze"}
        onClose={() => setDialog(null)}
        onSubmit={async () => (await run("POST", `${base}/rerun`, { step: "analyze" }, { label: "analyze", success: "평가 대기열에 추가했습니다" })) !== null}
      />
      <ReasonDialog
        open={dialog === "presentation"}
        title="본문 표시 새로고침"
        description="원본 웹페이지의 이미지, 링크, 서식 변경을 먼저 확인합니다. 텍스트가 같으면 기존 요약, 번역, 주요 뉴스 선정 여부와 이벤트 소속을 유지합니다."
        requireReason={false}
        confirmLabel={presentation?.ready && presentation.changed ? "표시 업데이트 적용" : "변경 미리보기"}
        busy={pending === "presentation"}
        onClose={() => setDialog(null)}
        onSubmit={async () => {
          const apply = presentation?.ready && presentation.changed;
          const result = await run<AdminPresentationRefresh>("POST", `${base}/rerun`,
            { step: "presentation", ...(apply ? { version: presentation.version } : { preview: true }) },
            { label: "presentation", revalidate: !!apply, ...(apply ? { success: "본문 표시를 업데이트했습니다" } : {}) });
          if (!result) { setPresentation(null); return false; }
          setPresentation(result);
          return result.applied;
        }}
      >
        {presentation && <div className="space-y-2 text-[13px] text-ink-2">
          <p>이미지 {presentation.images.before} → {presentation.images.after}, 링크 {presentation.links.before} → {presentation.links.after}.</p>
          <p>{presentation.reason ?? (presentation.changed ? "이번 표시 업데이트를 적용할 수 있습니다." : "현재 본문 표시는 업데이트할 필요가 없습니다.")}</p>
          {presentation.translation === "reused" && <p>번역문은 기존 텍스트를 유지하고 이미지와 링크만 동기화합니다.</p>}
        </div>}
      </ReasonDialog>
      <ReasonDialog
        open={dialog === "extract"}
        title="본문 다시 추출"
        requireReason={false}
        confirmLabel="다시 추출"
        busy={pending === "extract"}
        onClose={() => setDialog(null)}
        onSubmit={async () => (await run("POST", `${base}/rerun`, { step: "extract" }, { label: "extract", success: "추출 대기열에 추가했습니다" })) !== null}
      />
      <ReasonDialog
        open={dialog === "group"}
        title="다시 그룹화"
        description="수동으로 그룹화한 항목은 변경되지 않습니다."
        requireReason={false}
        confirmLabel="다시 그룹화"
        busy={pending === "group"}
        onClose={() => setDialog(null)}
        onSubmit={async () => (await run("POST", `${base}/rerun`, { step: "group" }, { label: "group", success: "그룹화 대기열에 추가했습니다" })) !== null}
      />
      <ReasonDialog
        open={dialog === "detach"}
        title="이벤트에서 제외"
        description="이 콘텐츠는 독립 항목으로 표시되고 이벤트 페이지가 업데이트됩니다."
        danger
        confirmLabel="제외"
        busy={pending === "detach"}
        onClose={() => setDialog(null)}
        onSubmit={async (reason) => (await run("POST", `${base}/detach`, { reason }, { label: "detach", success: "이벤트에서 제외했습니다" })) !== null}
      />
      <ReasonDialog
        open={dialog === "merge"}
        title="이벤트 병합"
        description={`이벤트 #${story?.story_id} (${story?.story_title ?? ""})을 다른 이벤트에 병합합니다. 이전 링크는 새 이벤트로 연결됩니다.`}
        danger
        confirmLabel="병합"
        busy={pending === "merge"}
        onClose={() => setDialog(null)}
        onSubmit={async (reason) => {
          if (!/^\d+$/.test(mergeInto.trim())) return false;
          return (await run("POST", "/api/admin/stories/merge", { from: story!.story_id, into: Number(mergeInto), reason }, { label: "merge", success: "이벤트를 병합했습니다" })) !== null;
        }}
      >
        <Field label="병합할 대상 이벤트 번호" hint="대상 이벤트에 속한 콘텐츠의 진단 페이지에서 번호를 확인할 수 있습니다">
          <Input inputMode="numeric" value={mergeInto} onChange={(e) => setMergeInto(e.target.value)} placeholder="예: 1234" />
        </Field>
      </ReasonDialog>
    </AdminPage>
  );
}
