import { useState } from "react";
import { SITE } from "@aihot/site";
import { Link, useFetcher } from "react-router";
import { useEffect } from "react";
import type { Route } from "./+types/runs";
import type { AdminDeliveryIssue, AdminReceiptIssue, AdminRuns } from "@aihot/contracts/admin";
import { adminGet } from "../../lib/admin.server";
import { useAdminAction } from "../../features/admin/action";
import { ago, bj, duration, num } from "../../features/admin/format";
import { AdminPage, Badge, Button, Card, DataTable, Dot, Empty, Field, Json, ReasonDialog, Select, Stat, Time } from "../../features/admin/ui";


export async function loader({ request }: Route.LoaderArgs) {
  return adminGet<AdminRuns>(request, "/api/admin/runs");
}

export const meta: Route.MetaFunction = () => [{ title: `실행 · ${SITE.name} 관리자` }];

const STATE_LABEL: Record<string, string> = { created: "대기", retry: "재시도 대기", active: "실행 중" };

export default function RunsAdmin({ loaderData }: Route.ComponentProps) {
  const refresh = useFetcher<typeof loader>();
  const r = refresh.data ?? loaderData;
  const { run, pending } = useAdminAction();
  const [receipt, setReceipt] = useState<AdminReceiptIssue | null>(null);
  const [billed, setBilled] = useState("false");
  const [delivery, setDelivery] = useState<AdminDeliveryIssue | null>(null);
  const [outcome, setOutcome] = useState<"sent" | "drop" | "resend">("sent");
  // Failure group to put back into processing ("" = every failure of the last 30 days).
  const [requeue, setRequeue] = useState<string | null>(null);

  // Live view: refresh every 20 s while visible.
  useEffect(() => {
    const t = setInterval(() => document.visibilityState === "visible" && refresh.state === "idle" && refresh.load("/admin/runs"), 20_000);
    return () => clearInterval(t);
  }, [refresh]);

  const backlog = new Map<string, Record<string, { n: number; oldest: string }>>();
  for (const q of r.queues) backlog.set(q.name, { ...(backlog.get(q.name) ?? {}), [q.state]: { n: q.n, oldest: q.oldest } });
  const queued = r.queues.filter((q) => q.state !== "active").reduce((a, q) => a + q.n, 0);
  const worker = r.processes.find((p) => p.role === "worker");
  const failing = r.jobs.filter((j) => j.status === "failed");

  return (
    <AdminPage title="실행" subtitle={<>작업, 대기열, 출처 지연, 직접 확인이 필요한 영수증과 전송 현황. 20초마다 자동 새로고침 · 최근 확인 {bj(r.checkedAt)}</>}>
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat
          label="worker"
          value={<span className="inline-flex items-center gap-2 text-[18px]"><Dot tone={worker?.alive ? "ok" : "bad"} />{worker ? (worker.alive ? "실행 중" : "하트비트 끊김") : "하트비트 없음"}</span>}
          hint={worker ? `${worker.host} · 하트비트 ${ago(worker.at)}` : "worker 하트비트 미보고"}
        />
        <Stat label="대기열 적체" value={num(queued)} tone={queued > 500 ? "warn" : undefined} hint="대기 및 재시도 대기" />
        <Stat label="실패한 예약 작업" value={num(failing.length)} tone={failing.length ? "bad" : "ok"} hint="최근 실행 실패" />
        <Stat label="결과 미확인 영수증" value={num(r.receipts.issues.filter((x) => x.status === "unknown").length)} tone={r.receipts.issues.some((x) => x.status === "unknown") ? "bad" : "ok"} hint={`7일간 유료 요청 ${num(Object.values(r.receipts.counts).reduce((a, b) => a + b, 0))}회`} />
        <Stat label="전송 확인 필요" value={num(r.deliveries.filter((d) => d.status === "unknown").length)} tone={r.deliveries.some((d) => d.status === "unknown") ? "bad" : "ok"} />
      </div>

      {r.grouping.waiting > 0 && (
        <Card className="mb-5" title="중복 확인 대기 중인 엄선 후보" right={<span>{num(r.grouping.waiting)}건 대기 · {num(r.grouping.needsAttention)}건 10분 초과</span>} pad={false} scrollable>
          <p className="px-4 py-3 text-[13px] text-ink-3">엄선 기준을 충족한 뉴스입니다. 중복 여부를 확인한 뒤 엄선에 반영됩니다. 오래 기다린 30건까지 표시합니다.</p>
          <DataTable dense rows={r.grouping.items} rowKey={(item) => item.articleId} columns={[
            { key: "title", label: "뉴스", render: (item) => <Link className="text-accent" to={`/admin/content/${item.articleId}`}>{item.title}</Link> },
            { key: "since", label: "대기 시작", render: (item) => <Time at={item.since} /> },
            { key: "recovery", label: "다음 단계", render: (item) => <Badge tone={item.recovery === "manual" ? "bad" : "warn"}>{item.recovery === "manual" ? "처리 후 복구" : item.recovery === "receipt" ? "유료 결과 확인 후 자동 복구" : "자동 처리 중"}</Badge> },
            { key: "error", label: "원인", render: (item) => <span className="line-clamp-2 text-[12px] text-ink-3">{item.receiptId ? `영수증 #${item.receiptId} · ` : ""}{item.error ?? "신원 확인 대기"}</span> },
          ]} />
        </Card>
      )}

      <div className="grid gap-5 xl:grid-cols-2">
        <Card title="대기열" pad={false} scrollable>
          <DataTable
            dense
            rows={[...backlog.entries()]}
            rowKey={([name]) => name}
            empty="대기열이 비어 있습니다"
            columns={[
              { key: "n", label: "대기열", render: ([name]) => <span className="font-mono text-[12.5px]">{name}</span> },
              ...(["created", "retry", "active"] as const).map((st) => ({
                key: st,
                label: STATE_LABEL[st],
                align: "right" as const,
                render: ([, v]: [string, Record<string, { n: number; oldest: string }>]) => (v[st] ? <span title={`가장 오래됨 ${bj(v[st]!.oldest, true)}`}>{num(v[st]!.n)}</span> : <span className="text-ink-4">0</span>),
              })),
              { key: "old", label: "가장 오래 대기", render: ([, v]) => <Time at={v.created?.oldest ?? v.retry?.oldest ?? null} /> },
            ]}
          />
        </Card>
        <Card title="예약 작업" pad={false} scrollable>
          <DataTable
            dense
            rows={r.jobs}
            rowKey={(j) => j.job}
            columns={[
              { key: "j", label: "작업", render: (j) => <span className="font-mono text-[12.5px]">{j.job}</span> },
              { key: "s", label: "최근 상태", render: (j) => <Badge tone={j.status === "ok" ? "ok" : j.status === "failed" ? "bad" : "muted"} title={j.error ?? undefined}>{j.status ?? "실행 중"}</Badge> },
              { key: "at", label: "시간", render: (j) => <Time at={j.started_at} /> },
              { key: "d", label: "소요 시간", align: "right", render: (j) => duration(j.started_at, j.finished_at) },
              { key: "f", label: "24시간 실패", align: "right", render: (j) => (j.failed_24h ? <span className="text-hot">{j.failed_24h}/{j.runs_24h}</span> : `0/${j.runs_24h}`) },
            ]}
          />
        </Card>
      </div>

      {r.failedJobs.length > 0 && (
        <Card className="mt-5" title="24시간 내 실패한 대기열 작업" pad={false} scrollable>
          <DataTable
            dense
            rows={r.failedJobs}
            rowKey={(j) => j.name}
            columns={[
              { key: "n", label: "대기열", render: (j) => <span className="font-mono text-[12.5px]">{j.name}</span> },
              { key: "c", label: "실패", align: "right", render: (j) => num(j.failed) },
              { key: "l", label: "최근", render: (j) => <Time at={j.last} /> },
              { key: "o", label: "최근 오류", render: (j) => <span className="line-clamp-2 font-mono text-[11.5px] text-ink-3">{j.last_output}</span> },
            ]}
          />
        </Card>
      )}

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Card title="확인이 필요한 유료 영수증" right={<span>{Object.entries(r.receipts.counts).map(([k, v]) => `${k} ${v}`).join(" · ")}</span>} pad={false} scrollable>
          <DataTable
            dense
            rows={r.receipts.issues}
            rowKey={(x) => x.id}
            empty="처리할 영수증 없음"
            columns={[
              { key: "id", label: "영수증", render: (x) => <span className="num">#{x.id}</span> },
              { key: "s", label: "상태", render: (x) => <Badge tone={x.status === "unknown" ? "bad" : "warn"}>{x.status}</Badge> },
              { key: "w", label: "서비스", render: (x) => <span className="whitespace-nowrap">{x.service}{x.model ? ` · ${x.model}` : ""}</span> },
              { key: "p", label: "용도", render: (x) => (x.subject && /^[\w-]{10,}$/.test(x.subject) && x.purpose.includes("analy") ? <Link className="text-accent" to={`/admin/content/${x.subject}`}>{x.purpose}</Link> : x.purpose) },
              { key: "e", label: "오류", render: (x) => <span className="line-clamp-2 text-[12px] text-ink-3" title={x.error ?? ""}>{x.error}</span> },
              { key: "a", label: "", render: (x) => (x.status === "unknown" ? <Button size="sm" onClick={() => setReceipt(x)}>확인</Button> : null) },
            ]}
          />
        </Card>
        <Card title="확인이 필요한 전송" pad={false} scrollable>
          <DataTable
            dense
            rows={r.deliveries}
            rowKey={(d) => d.id}
            empty="확인할 전송 없음"
            columns={[
              { key: "t", label: "대상", render: (d) => d.target_key },
              { key: "s", label: "상태", render: (d) => <Badge tone={d.status === "unknown" ? "bad" : "warn"}>{d.status}</Badge> },
              { key: "sub", label: "내용", render: (d) => (d.subject_kind === "selected" ? <Link className="text-accent" to={`/admin/content/${d.subject_id}`}>{d.subject_id}</Link> : `${d.subject_kind} ${d.subject_id}`) },
              { key: "at", label: "시간", render: (d) => <Time at={d.updated_at} /> },
              { key: "a", label: "", render: (d) => <Button size="sm" onClick={() => setDelivery(d)}>처리</Button> },
            ]}
          />
        </Card>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Card title="지연 또는 실패한 출처" right={<Link className="text-accent" to="/admin/sources?health=failing">실패한 출처 전체</Link>} pad={false} scrollable>
          <DataTable
            dense
            rows={r.lagging}
            rowKey={(s) => s.id}
            empty="출처가 모두 제시간에 수집됨"
            columns={[
              { key: "n", label: "출처", render: (s) => <Link className="text-ink hover:text-accent" to={`/admin/sources/${encodeURIComponent(s.id)}`}>{s.name}</Link> },
              { key: "h", label: "상태", render: (s) => <Badge tone={s.health === "failing" ? "bad" : s.health === "degraded" ? "warn" : "muted"}>{s.health}</Badge> },
              { key: "ok", label: "최근 성공", render: (s) => <Time at={s.last_ok_at} /> },
              { key: "nx", label: "다음 수집", render: (s) => <Time at={s.next_fetch_at} /> },
              { key: "e", label: "오류", render: (s) => <span className="line-clamp-1 text-[12px] text-ink-3" title={s.last_error ?? ""}>{s.last_error}</span> },
            ]}
          />
        </Card>
        <Card
          title="처리 실패 (30일, 오류별 분류)"
          right={
            <span className="flex items-center gap-3">
              {r.retrying.count > 0 && <span>재시도 대기 {num(r.retrying.count)}건 · 다음 실행 <Time at={r.retrying.next} /></span>}
              {r.errors.length > 0 && <Button size="sm" onClick={() => setRequeue("")}>전체 다시 처리</Button>}
            </span>
          }
          pad={false} scrollable
        >
          <DataTable
            dense
            rows={r.errors}
            rowKey={(e) => e.error}
            empty="처리 실패 없음"
            columns={[
              { key: "e", label: "오류", render: (e) => <span className="font-mono text-[11.5px] text-ink-2">{e.error}</span> },
              { key: "n", label: "건수", align: "right", render: (e) => num(e.n) },
              { key: "x", label: "예시", render: (e) => <Link className="text-accent" to={`/admin/content/${e.example}`}>보기</Link> },
              { key: "l", label: "최근", render: (e) => <Time at={e.last} /> },
              { key: "a", label: "", align: "right", render: (e) => <Button size="sm" onClick={() => setRequeue(e.error)}>다시 처리</Button> },
            ]}
          />
        </Card>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Card title="작업 타임라인" pad={false} scrollable>
          <DataTable
            dense
            rows={r.timeline}
            rowKey={(t) => t.id}
            columns={[
              { key: "at", label: "시작", render: (t) => <span className="num whitespace-nowrap">{bj(t.started_at)}</span> },
              { key: "j", label: "작업", render: (t) => <span className="font-mono text-[12px]">{t.job}</span> },
              { key: "s", label: "결과", render: (t) => <Badge tone={t.status === "ok" ? "ok" : t.status === "failed" ? "bad" : "muted"} title={t.error ?? undefined}>{t.status ?? "실행 중"}</Badge> },
              { key: "d", label: "소요 시간", align: "right", render: (t) => duration(t.started_at, t.finished_at) },
            ]}
          />
        </Card>
        <Card title="외부 보고" pad={false} scrollable>
          {r.ingest.length ? (
            <DataTable
              dense
              rows={r.ingest}
              rowKey={(e) => `${e.client}-${e.created_at}`}
              columns={[
                { key: "at", label: "시간", render: (e) => <Time at={e.created_at} /> },
                { key: "c", label: "클라이언트", render: (e) => e.client },
                { key: "k", label: "유형", render: (e) => e.kind },
                { key: "s", label: "결과", render: (e) => <Badge tone={e.status === "ok" ? "ok" : e.status === "error" ? "bad" : "muted"} title={e.error ?? undefined}>{e.status}</Badge> },
                { key: "x", label: "요약", render: (e) => <Json value={e.summary} label="요약" /> },
              ]}
            />
          ) : (
            <Empty>외부 보고 없음 (수집 스크립트)</Empty>
          )}
        </Card>
      </div>

      {r.processes.length > 0 && (
        <Card className="mt-5" title="프로세스">
          <ul className="grid gap-2 text-[13px] sm:grid-cols-2 lg:grid-cols-3">
            {r.processes.map((p) => (
              <li key={p.role} className="flex items-center gap-2">
                <Dot tone={p.alive ? "ok" : "bad"} />
                <span className="font-medium">{p.role}</span>
                <span className="text-ink-3">{p.host} · pid {p.pid} · {p.release} · 시작 {bj(p.startedAt)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <ReasonDialog
        open={!!receipt}
        title={`영수증 확인 #${receipt?.id ?? ""}`}
        description="자동 복구 후에도 결과가 확인되지 않은 요청은 직접 승인해야 합니다. 과금 여부를 확인하세요. 확인할 수 없지만 복구 승인을 받은 경우에는 과금 여부 미확인을 선택하고 승인 근거를 적으세요. 승인하면 다시 호출되어 중복 과금될 수 있습니다."
        confirmLabel="기록 후 승인"
        busy={pending === "release"}
        onClose={() => setReceipt(null)}
        onSubmit={async (note) => (await run("POST", `/api/admin/receipts/${receipt!.id}/release`, { billed: billed === "unknown" ? null : billed === "true", note }, { label: "release", success: "승인했습니다" })) !== null}
      >
        <Field label="공급자 과금 여부">
          <Select value={billed} onChange={(e) => setBilled(e.target.value)}>
            <option value="false">미과금 (요청이 수락되지 않음)</option>
            <option value="true">과금됨 (결과를 받지 못함)</option>
            <option value="unknown">과금 여부 미확인 (복구 승인됨)</option>
          </Select>
        </Field>
      </ReasonDialog>
      <ReasonDialog
        open={requeue !== null}
        title={requeue ? "이 유형의 실패 다시 처리" : "실패 항목 전체 다시 처리"}
        description="이 기사들은 처리 대기열에 다시 들어갑니다 (본문, 판정, 게시). 모델 호출에 다시 과금되며, 공급자가 거부한 콘텐츠는 다시 실패할 수 있습니다."
        confirmLabel="다시 처리"
        busy={pending === "requeue"}
        onClose={() => setRequeue(null)}
        onSubmit={async (reason) => (await run("POST", "/api/admin/processing/requeue", { group: requeue || null, reason }, { label: "requeue", success: "대기열에 다시 추가했습니다" })) !== null}
      />
      <ReasonDialog
        open={!!delivery}
        title="전송 처리"
        description="먼저 해당 Feishu 그룹에서 수신 여부를 확인하세요. 받지 못한 경우에만 다시 전송하세요. 개발 환경에서는 실제로 전송되지 않습니다."
        confirmLabel="확인"
        danger={outcome === "resend"}
        busy={pending === "delivery"}
        onClose={() => setDelivery(null)}
        onSubmit={async (note) => (await run("POST", `/api/admin/deliveries/${delivery!.id}/resolve`, { outcome, note }, { label: "delivery", success: "처리했습니다" })) !== null}
      >
        <Field label="결과">
          <Select value={outcome} onChange={(e) => setOutcome(e.target.value as typeof outcome)}>
            <option value="sent">그룹에서 수신 확인, 전송 완료로 표시</option>
            <option value="drop">다시 보내지 않음</option>
            <option value="resend">그룹에서 미수신, 다시 전송</option>
          </Select>
        </Field>
      </ReasonDialog>
    </AdminPage>
  );
}
