// 사이트의 워드마크와 링 마크입니다. 페이지에서 Wordmark는 사이트명을 표시하며(size는 픽셀 단위 높이), RingMark는 회전하는 로딩 표시입니다.
// 여기서는 사이트명을 글자로 표시합니다. 자체 Logo가 있다면 Wordmark를 SVG로 교체하되 같은 매개변수를 유지하세요.
import { SITE } from "../site.ts";

export function Wordmark({ size = 24, className = "", title = SITE.name }: { size?: number; className?: string; title?: string }) {
  return (
    <span className={`inline-flex items-center font-black leading-none tracking-[-0.03em] ${className}`} style={{ fontSize: Math.round(size * 0.92) }} aria-label={title} role="img">
      <span aria-hidden="true" className="mr-[0.3em] inline-block size-[0.42em] rounded-full bg-accent" />
      <span aria-hidden="true">{SITE.name}</span>
    </span>
  );
}

/** 점이 있는 링으로, 회전하면 로딩 표시가 됩니다. */
export function RingMark({ className = "", spinning = false }: { className?: string; spinning?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <g style={spinning ? { transformOrigin: "12px 12px", animation: "spin-slow 1.1s linear infinite" } : undefined}>
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeDasharray="42 15" />
      </g>
      <circle cx="12" cy="12" r="2.6" fill="currentColor" />
    </svg>
  );
}
