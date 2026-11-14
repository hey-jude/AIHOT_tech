// In-doubt work. A stopped process leaves "pending" receipts and deliveries: they become
// "unknown" and are never re-sent on their own. An unknown receipt is released once automatically after
// half an hour without checking the provider's bill, so a lost answer costs at most one repeat; one that
// turns unknown again waits for an authorized manual release with the actual billing state and a note. A released
// receipt lets its request call again, and an article that stopped on it goes back to processing.
// A primary already handed to a backup is retained for billing; only the backup may need recovery.
import { audit, Conflict } from "../audit.ts";
import { sql } from "../db.ts";
import { resumeAfterRelease } from "../jobs/content.ts";
import { sweepUngrouped } from "../jobs/events.ts";
import { retryReleasedReceiptJobs } from "../jobs/queue.ts";
import { closeInterruptedRuns } from "../jobs/runs.ts";
import { markStaleDeliveries } from "../notify/deliver.ts";
import { awaitingRelease, markStalePendingReceipts, releaseUnknownReceipt } from "../providers/receipts.ts";

const AUTO_RELEASE_AFTER_MS = 30 * 60_000;
export const AUTO_RELEASE_NOTE = "자동 허용: 결과가 30분 넘게 불명확하며 결제 여부는 확인되지 않음";

async function release(id: number, error: string, actor: string, note: string, billed: boolean | null) {
  return sql.begin(async (tx) => {
    const receipt = await releaseUnknownReceipt(tx, id, error);
    if (!receipt) return null;
    const requeued = await resumeAfterRelease(receipt, tx);
    await audit(actor, "receipt.release", `receipt:${id}`, note, { status: "unknown" }, { status: "failed", billed, requeued }, { db: tx });
    return { id, status: "failed", subject: receipt.subject, purpose: receipt.purpose, requeued };
  });
}

/** Record verified billing, or explicitly unknown billing for an authorized manual recovery. */
export async function releaseReceipt(id: number, input: { billed: boolean | null; note: string }, actor: string) {
  if (!input.note?.trim()) throw new Error("note is required");
  if (input.billed !== null && typeof input.billed !== "boolean") throw new Error("billed must be true, false or null");
  const [row] = await sql<{ status: string }[]>`SELECT status FROM receipts WHERE id = ${id}`;
  if (!row) return null;
  if (row.status !== "unknown") throw new Conflict("결과가 확인되지 않은 요청만 수동으로 확인할 수 있습니다.");
  const error = input.billed === null ? `수동 허용: 결제 여부를 알 수 없어 권한에 따라 복구합니다. ${input.note}`
    : `수동 확인: ${input.billed ? "공급업체가 청구했지만 결과를 받지 못함" : "공급업체가 청구하지 않음"}. ${input.note}`;
  return release(id, error, actor, input.note, input.billed);
}

/**
 * Unknown receipts older than half an hour, released without checking the provider's bill. A request
 * released this way once and unknown again stays for the admin (the alerts' follow-ups list it).
 * Primaries continued by a backup are not awaiting release: that would revive their old request.
 */
export async function autoReleaseUnknownReceipts(now = Date.now()) {
  const rows = await sql<{ id: number }[]>`
    SELECT r.id FROM receipts r
    WHERE ${awaitingRelease(sql`r`)} AND r.updated_at < ${new Date(now - AUTO_RELEASE_AFTER_MS)}
      AND NOT EXISTS (SELECT 1 FROM receipt_attempts a WHERE a.receipt_id = r.id AND a.error LIKE ${AUTO_RELEASE_NOTE + "%"})
    ORDER BY r.id LIMIT 200`;
  let released = 0;
  let requeued = 0;
  for (const r of rows) {
    const done = await release(r.id, AUTO_RELEASE_NOTE, "ops.recover", "결과 불명확으로 한 번 자동 허용", null);
    if (done) released += 1;
    if (done?.requeued) requeued += 1;
  }
  return { released, requeued };
}

/** ops.recover, every 10 minutes. */
export async function recoverStaleWork() {
  return { runs: await closeInterruptedRuns(), receipts: await markStalePendingReceipts(), released: await autoReleaseUnknownReceipts(), jobs: await retryReleasedReceiptJobs(), grouping: await sweepUngrouped(), deliveries: await markStaleDeliveries() };
}
