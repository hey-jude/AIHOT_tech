// The worker watchdog, run from the api process (the worker cannot report its own death). It keeps its
// state in settings and sends its own alerts.
import { sql } from "../db.ts";
import { wakeAgent, flushAgentEvents } from "../notify/agent.ts";
import { formatAlert, formatRecovery, sendAlert, type Finding } from "../notify/feishu.ts";

// The process manager restarts a crashed worker within seconds and a deploy restarts it on purpose;
// half an hour without a heartbeat means those did not help.
const WORKER_STALE_MS = 30 * 60_000;

const WORKER_DOWN: Finding = {
  key: "worker",
  level: "now",
  title: "백그라운드 처리 서비스 중단으로 사이트에 새 콘텐츠가 표시되지 않습니다",
  impact: "새 콘텐츠 수집·처리·전송과 일간 브리핑이 모두 중단되어 사이트에 기존 콘텐츠만 표시됩니다.",
  heals: "자동 재시작에 실패했습니다.",
  action: "이 알림을 AI에 전달해 원인을 확인하고 재시작하세요.",
};

/**
 * Runs in the api process: alerts once when the worker's heartbeat is older than half an hour, and once
 * when it recovers. The stored state moves only after the message went out, so a failed send is tried
 * again at the next check; the lock keeps two api processes (two overlap during a deploy) from both sending.
 */
export async function checkWorkerHeartbeat(): Promise<void> {
  const wentDown = await sql.begin(async (tx) => {
    await tx`SELECT pg_advisory_xact_lock(hashtext('watchdog.worker'))`;
    const [hb] = await tx<{ updated_at: Date }[]>`SELECT updated_at FROM settings WHERE key = 'heartbeat.worker'`;
    if (!hb) return null;
    const [prior] = await tx<{ value: { state: "up" | "down"; since: string } }[]>`SELECT value FROM settings WHERE key = 'watchdog.worker'`;
    const now = Date.now();
    const stale = now - hb.updated_at.getTime() > WORKER_STALE_MS;
    const state = stale ? "down" : "up";
    if (prior?.value.state === state) return stale ? { since: new Date(prior.value.since) } : null;
    // A first check that finds the worker running only records it.
    if (stale) {
      const woken = await wakeAgent({ ...WORKER_DOWN, since: hb.updated_at }, now);
      const shown = woken
        ? { ...WORKER_DOWN, action: "AI에 자동으로 점검 및 재시작을 요청했습니다. 30분 안에 복구 알림이 없으면 AI에 다시 문의하세요." }
        : WORKER_DOWN;
      const msg = formatAlert(shown, hb.updated_at, now);
      await sendAlert(msg.title, msg.lines);
    } else if (prior) {
      const msg = formatRecovery(WORKER_DOWN.title, new Date(prior.value.since), now);
      await sendAlert(msg.title, msg.lines);
    }
    // "since" of a down state is the last heartbeat, so the recovery can say how long it lasted.
    const since = stale ? hb.updated_at : new Date(now);
    await tx`INSERT INTO settings (key, value, updated_by) VALUES ('watchdog.worker', ${tx.json({ state, since: since.toISOString() })}, 'api')
             ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_by = EXCLUDED.updated_by, updated_at = now()`;
    return stale ? { since: hb.updated_at } : null;
  });
  // The hub deduplicates uncertain sends by their persisted occurrence ID.
  if (wentDown) await wakeAgent({ ...WORKER_DOWN, since: wentDown.since });
  await flushAgentEvents();
}

export function startWorkerWatchdog(): NodeJS.Timeout {
  const timer = setInterval(() => void checkWorkerHeartbeat().catch(() => {}), 5 * 60_000);
  timer.unref();
  return timer;
}
