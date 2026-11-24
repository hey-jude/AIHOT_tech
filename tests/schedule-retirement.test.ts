// Retirement failures: old schedules keep producing work, already-unscheduled queues keep old jobs,
// cleanup removes a live/business queue or its durable run history, or retired failures stay in the
// admin's current schedules. Use pg-boss and PostgreSQL.
import "./setup.ts";
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { closeDb, sql } from "@aihot/backend/db";
import { getBoss, stopBoss } from "@aihot/backend/jobs/queue";
import { installModules } from "@aihot/backend/modules";
import { runsOverview } from "@aihot/backend/admin/runs";
import { registerSchedules } from "../apps/worker/src/schedules.ts";
import { PgBoss } from "pg-boss";
import { config } from "@aihot/backend/config";

after(async () => { await stopBoss(); await closeDb(); });

test("retired schedules leave the current overview and execution queues while live jobs and history remain", async () => {
  const boss = await getBoss();
  const retired = ["cron.retired.scheduled", "cron.retired.unscheduled", "cron.paused", "cron.renamed.old"];
  for (const name of [...retired, "cron.kept", "cron.renamed.new", "business.kept"]) {
    await boss.createQueue(name);
    await boss.send(name, { fixture: true }, { startAfter: "2099-01-01" });
  }
  for (const name of [retired[0]!, "cron.paused", "cron.renamed.old"]) await boss.schedule(name, "0 0 1 1 *");
  for (const name of retired) {
    await sql`INSERT INTO job_runs (job, status, finished_at) VALUES (${name.slice("cron.".length)}, 'failed', now())`;
  }
  await sql`INSERT INTO job_runs (job, started_at, finished_at, status) VALUES
    ('kept', now() - interval '2 days', now() - interval '2 days', 'failed'),
    ('renamed.new', now() - interval '1 hour', now() - interval '1 hour', 'failed'),
    ('renamed.new', now(), now(), 'ok')`;
  installModules([{ name: "test", schedules: [
    { name: "kept", cron: "0 0 1 1 *", run: async () => ({}) },
    { name: "renamed.new", cron: "0 0 1 1 *", run: async () => ({}) },
    { name: "paused", cron: "0 0 1 1 *", when: () => false, run: async () => ({}) },
  ] }]);

  await registerSchedules(boss);
  // Multiple schedule keys must still yield one latest result per task.
  await boss.schedule("cron.kept", "0 0 1 1 *", {}, { key: "extra" });
  const schedules = await boss.getSchedules();
  for (const name of retired) {
    assert.ok(!schedules.some((s) => s.name === name));
    assert.equal(await boss.getQueue(name), null, `${name} leaves no execution queue`);
    assert.equal((await sql`SELECT id FROM pgboss.job WHERE name = ${name}`).length, 0);
  }
  for (const name of ["cron.kept", "cron.renamed.new"]) assert.ok(schedules.some((s) => s.name === name));
  for (const name of ["cron.kept", "cron.renamed.new", "business.kept"]) {
    assert.ok(await boss.getQueue(name));
    assert.equal((await sql`SELECT id FROM pgboss.job WHERE name = ${name}`).length, 1);
  }
  // An engine timer may also finish during this test; its result must not affect the fixture checks.
  await sql`INSERT INTO job_runs (job, status, finished_at) VALUES ('hot.rank', 'failed', now())`;
  const overview = await runsOverview();
  const fixtureNames = new Set([...retired, "cron.kept", "cron.renamed.new"].map((name) => name.slice("cron.".length)));
  const jobs = overview.jobs.filter((j) => fixtureNames.has(j.job));
  assert.deepEqual(jobs.map((j) => j.job), ["kept", "renamed.new"]);
  assert.deepEqual(jobs.filter((j) => j.status === "failed").map((j) => j.job), ["kept"]);
  assert.deepEqual(jobs.map((j) => [j.failed_24h, j.runs_24h]), [[0, 0], [1, 2]]);
  for (const name of retired) {
    const job = name.slice("cron.".length);
    assert.equal((await sql`SELECT id FROM job_runs WHERE job = ${job}`).length, 1);
    assert.ok(overview.timeline.some((r) => r.job === job && r.status === "failed"));
  }
});

test("sweep coalesces pending ticks while keeping one follow-up during an active run", async () => {
  const boss = await getBoss();
  const queue = "cron.content.sweep";
  await boss.offWork(queue);
  await boss.deleteQueue(queue);
  await boss.createQueue(queue, { policy: "singleton", retryLimit: 1 });
  const old = [];
  for (let i = 0; i < 6; i++) old.push(await boss.send(queue, {}, { startAfter: "2099-01-01" }));
  const [history] = await sql`INSERT INTO job_runs (job, status, finished_at) VALUES ('content.sweep', 'ok', now()) RETURNING id`;

  await registerSchedules(boss);
  await boss.offWork(queue);
  assert.equal((await boss.getQueue(queue))!.policy, "stately");
  assert.equal((await sql`SELECT id FROM pgboss.job WHERE name = ${queue} AND id = ANY(${old}::uuid[])`).length, 0);
  assert.equal((await sql`SELECT id FROM job_runs WHERE id = ${history!.id}`).length, 1, "run history survives queue replacement");
  assert.ok((await boss.findJobs(queue)).length <= 1, "old ticks collapse into at most one sweep");
  await boss.deleteQueuedJobs(queue);

  const first = await boss.send(queue, {});
  assert.ok(first);
  for (let i = 0; i < 6; i++) assert.equal(await boss.send(queue, {}), null);
  const [active] = await boss.fetch(queue);
  assert.equal(active!.id, first);
  const next = await boss.send(queue, {});
  assert.ok(next, "one follow-up can wait while the sweep is active");
  for (let i = 0; i < 6; i++) assert.equal(await boss.send(queue, {}), null);
  assert.equal((await boss.fetch(queue)).length, 0, "a second sweep cannot execute concurrently");

  const restarted = new PgBoss({ connectionString: config.databaseUrl, max: 1, schedule: false, supervise: false });
  try {
    await restarted.start();
    assert.equal((await restarted.getQueue(queue))!.policy, "stately");
    assert.equal(await restarted.send(queue, {}), null, "another client cannot add a duplicate tick");
  } finally { await restarted.stop(); }

  await boss.complete(queue, active!.id);
  const [followUp] = await boss.fetch(queue);
  assert.equal(followUp!.id, next);
  await boss.fail(queue, followUp!.id, { message: "fixture failure" });
  const [failed] = await boss.findJobs(queue, { id: followUp!.id });
  assert.equal(failed!.state, "failed", "periodic sweeps do not leave a separate retry slot");
  assert.ok(await boss.send(queue, {}), "a failed sweep does not prevent the next periodic tick");
  const [last] = await boss.fetch(queue);
  await boss.complete(queue, last!.id);
});

test("sweep policy transition refuses to remove an active legacy sweep", async () => {
  const boss = await getBoss();
  const queue = "cron.content.sweep";
  await boss.offWork(queue);
  await boss.deleteQueue(queue);
  await boss.createQueue(queue, { policy: "singleton", retryLimit: 1 });
  const id = await boss.send(queue, {});
  const [active] = await boss.fetch(queue);
  assert.equal(active!.id, id);
  await boss.send(queue, {}, { startAfter: "2099-01-01" });
  await assert.rejects(registerSchedules(boss), /active.*sweep|sweep.*active/i);
  assert.equal((await boss.getQueue(queue))!.policy, "singleton");
  assert.equal((await boss.findJobs(queue)).length, 2, "the active run and its pending tick remain intact");
  await sql`UPDATE pgboss.job SET started_on = now() - interval '2 hours' WHERE name = ${queue} AND id = ${active!.id}`;
  await sql`UPDATE pgboss.queue SET monitor_claim_on = now() - interval '2 hours', monitor_on = now() - interval '2 hours',
    maintain_on = now() - interval '2 hours' WHERE name = ${queue}`;
  await registerSchedules(boss);
  await boss.offWork(queue);
  assert.equal((await boss.getQueue(queue))!.policy, "stately", "an expired run left by a stopped worker can be recovered before transition");
  assert.equal((await boss.findJobs(queue, { id: active!.id })).length, 0);
});
