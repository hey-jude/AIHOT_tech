import { SITE, SOURCE_DEFAULTS } from "@aihot/site";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import type { Route } from "./+types/source-new";
import type { AdminSourceCreated, AdminSourcePreview } from "@aihot/contracts/admin";
import { useAdminAction } from "../../features/admin/action";
import { bj } from "../../features/admin/format";
import { KIND_LABEL, MODE_LABEL, SELECTION_CLASS_LABEL, TIER_LABEL } from "../../features/admin/labels";
import { AdminPage, Button, Card, Empty, Field, Input, Select, Textarea } from "../../features/admin/ui";

export const meta: Route.MetaFunction = () => [{ title: `출처 추가 · ${SITE.name} 관리자` }];

const TEMPLATES: Record<string, Record<string, unknown>> = {
  rss: { feedUrl: "https://example.com/feed.xml" },
  web_list: { url: "https://example.com/blog", baseUrl: "https://example.com", itemSelector: "article", linkSelector: "a", titleSelector: "h2", allowUrlPrefixes: ["https://example.com/blog/"] },
  json_list: { url: "https://example.com/api/posts", mode: "json_api", method: "GET", itemsPath: "data.items", titlePaths: ["title"], urlTemplate: "{raw:url}", summaryPaths: ["summary"] },
  x_search: { query: "from:handle -filter:replies", searchType: "Latest" },
  mp_account: { ghid: "gh_", nickname: "" },
  external: {},
};


export default function NewSource() {
  const navigate = useNavigate();
  const { run, pending } = useAdminAction();
  const [form, setForm] = useState({ id: "", name: "", kind: "rss", tier: "T2", selection_class: "", participation_mode: "editorial", interval_minutes: 30, first_party: false, site_fulltext: SOURCE_DEFAULTS.siteFulltext, syndicate_fulltext: false, tags: "" });
  const [config, setConfig] = useState(JSON.stringify(TEMPLATES.rss, null, 2));
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<AdminSourcePreview | null>(null);
  const [duplicate, setDuplicate] = useState<{ id: string; name: string } | null>(null);

  const parsed = () => {
    try {
      setError(null);
      return JSON.parse(config) as Record<string, unknown>;
    } catch (e) {
      setError(`설정 JSON이 올바르지 않습니다: ${(e as Error).message}`);
      return null;
    }
  };

  return (
    <AdminPage title="출처 추가" subtitle="중복 확인과 미리보기를 먼저 진행하세요. RSS/JSON 등 안정적인 프로토콜을 우선 사용하고, 최초 수집 성공 후 실제 항목이 있어야 연동이 완료됩니다. 공식 출처는 운영 주체 또는 공식 교차 링크로 확인해야 합니다.">
      <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <Card title="출처 정보">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="ID" hint="영문 소문자, 숫자, 하이픈만 사용할 수 있으며 생성 후 변경할 수 없습니다.">
              <Input value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value.toLowerCase() })} placeholder="openai-blog" />
            </Field>
            <Field label="이름">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="OpenAI 블로그" />
            </Field>
            <Field label="유형">
              <Select
                value={form.kind}
                onChange={(e) => {
                  setForm({ ...form, kind: e.target.value });
                  setConfig(JSON.stringify(TEMPLATES[e.target.value] ?? {}, null, 2));
                  setPreview(null);
                }}
              >
                {Object.entries(KIND_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </Select>
            </Field>
            <Field label="수집 주기(분)">
              <Input type="number" min={1} max={1440} value={form.interval_minutes} onChange={(e) => setForm({ ...form, interval_minutes: Number(e.target.value) })} />
            </Field>
            <Field label="참여 방식">
              <Select value={form.participation_mode} onChange={(e) => setForm({ ...form, participation_mode: e.target.value })}>
                {Object.entries(MODE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </Select>
            </Field>
            <Field label="등급" hint="T1만 공식 출처입니다.">
              <Select value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value })}>
                {Object.entries(TIER_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </Select>
            </Field>
            <Field label="분류" hint="주요 뉴스 선정 기준을 높입니다. 공식 출처 여부에는 영향을 주지 않습니다.">
              <Select value={form.selection_class} onChange={(e) => setForm({ ...form, selection_class: e.target.value })}>
                <option value="">없음(등급 기준)</option>
                {Object.entries(SELECTION_CLASS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </Select>
            </Field>
            <Field label="태그(쉼표로 구분)">
              <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
            </Field>
            <div className="flex flex-col justify-end gap-2 text-[13px] text-ink-2">
              {([
                ["site_fulltext", "사이트에 전체 내용 표시 가능"],
                ["syndicate_fulltext", "외부 API에 전체 내용 포함 가능"],
              ] as const).map(([k, label]) => (
                <label key={k} className="inline-flex items-center gap-2">
                  <input type="checkbox" className="size-4 accent-[var(--accent)]" checked={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.checked })} />
                  {label}
                </label>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <Field label="수집 설정(JSON)">
              <Textarea className="font-mono !text-[12px]" rows={10} value={config} onChange={(e) => setConfig(e.target.value)} spellCheck={false} />
            </Field>
            {error && <div className="mt-1 text-[12.5px] text-hot">{error}</div>}
          </div>
          {duplicate && (
            <div className="mt-4 rounded-card bg-amber/10 px-4 py-3 text-[13px] text-ink-2 ring-1 ring-amber/25">
              이미 모니터링 중인 주소입니다: <Link className="font-medium text-accent" to={`/admin/sources/${encodeURIComponent(duplicate.id)}`}>{duplicate.name}</Link>({duplicate.id}). 새 출처를 추가하지 않았습니다.
            </div>
          )}
          <div className="mt-5 flex justify-end gap-2">
            <Button
              busy={pending === "preview"}
              onClick={async () => {
                const c = parsed();
                if (!c) return;
                const r = await run<AdminSourcePreview>("POST", "/api/admin/sources/preview", { id: form.id || "draft", kind: form.kind, config: c }, { label: "preview", revalidate: false });
                if (r) setPreview(r);
              }}
            >
              수집 미리보기
            </Button>
            <Button
              tone="primary"
              busy={pending === "create"}
              disabled={!form.id || !form.name}
              onClick={async () => {
                const c = parsed();
                if (!c) return;
                const r = await run<AdminSourceCreated>(
                  "POST",
                  "/api/admin/sources",
                  { ...form, selection_class: form.selection_class || null, tags: form.tags.split(/[,，]/).map((t) => t.trim()).filter(Boolean), config: c },
                  { label: "create", revalidate: false },
                );
                if (!r) return;
                if (r.created) navigate(`/admin/sources/${encodeURIComponent(r.source.id)}`);
                else setDuplicate(r.duplicate);
              }}
            >
              추가
            </Button>
          </div>
        </Card>
        <Card title={preview ? `미리보기: ${preview.count}개(${preview.ms}ms)` : "미리보기"}>
          {!preview ? (
            <Empty>설정을 입력하고 “수집 미리보기”를 누르면 수집될 항목이 여기에 표시됩니다(저장되지 않음).</Empty>
          ) : preview.items.length ? (
            <ul className="space-y-3">
              {preview.items.map((i) => (
                <li key={i.url} className="text-[13px]">
                  <a href={i.url} target="_blank" rel="noreferrer" className="font-medium text-ink hover:text-accent">{i.title}</a>
                  <div className="text-[12px] text-ink-4">{i.publishedAt ? bj(i.publishedAt, true) : "게시 시각 없음"}</div>
                  {i.excerpt && <div className="mt-0.5 line-clamp-2 text-[12.5px] text-ink-3">{i.excerpt}</div>}
                </li>
              ))}
            </ul>
          ) : (
            <Empty>수집된 항목이 없습니다.</Empty>
          )}
        </Card>
      </div>
    </AdminPage>
  );
}
