import type { HotEntryView } from "@aihot/contracts/site";

/** Change against six hours before the ranking: up in the hot tone, down quiet, new stories marked new, none while sources are behind. */
export function Delta({ trend, pct, className = "" }: { trend: HotEntryView["trend"]; pct: number | null; className?: string }) {
  const base = `inline-flex h-[22px] shrink-0 items-center gap-0.5 rounded-full px-2 text-[11.5px] font-medium tabular-nums ${className}`;
  if (trend === "unknown") return <span className={`${base} bg-well text-ink-4`} title="일부 출처의 수집이 늦어 6시간 전과 비교할 수 없습니다">비교 불가</span>;
  if (trend === "new" || pct === null) return <span className={`${base} bg-accent-soft text-accent`}>신규 진입</span>;
  if (trend === "flat") return <span className={`${base} bg-well text-ink-4`} title="6시간 전 대비">보합</span>;
  const up = trend === "up";
  return (
    <span className={`${base} ${up ? "bg-hot-soft text-hot" : "bg-well text-ink-4"}`} title="6시간 전 대비">
      {up ? "↑" : "↓"} {Math.abs(Math.round(pct))}%
    </span>
  );
}
