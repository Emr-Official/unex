"use client";

import { useUnex } from "@/lib/store";

const SOFT_FOOTER_RE =
  /sent|delivered|pin|accepted|connected|invite link|request sent|cleared unread|premium unlocked/i;
const ERROR_RE =
  /fail|couldn|error|try again|incomplete|free plan|no unex|not ready|delayed|paused|coming soon|add your/i;

export function Toast() {
  const toast = useUnex((s) => s.toast);
  if (!toast) return null;
  const showSoftFooter = SOFT_FOOTER_RE.test(toast) && !ERROR_RE.test(toast);
  return (
    <div className="pointer-events-none absolute left-4 right-4 bottom-8 z-50 animate-[fadeUp_0.25s_ease]">
      <div className="rounded-[14px] border border-[rgba(196,181,253,0.35)] bg-[rgba(196,181,253,0.18)] px-4 py-3.5 text-center backdrop-blur-sm">
        <div className="text-[0.95rem] font-semibold text-[#f3f0f8]">{toast}</div>
        {showSoftFooter && (
          <p className="text-[0.8rem] text-[#9b93a8] mt-0.5">
            they&apos;ll see it when they&apos;re ready
          </p>
        )}
      </div>
    </div>
  );
}
