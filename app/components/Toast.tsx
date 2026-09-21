"use client";

import { useUnex } from "@/lib/store";

export function Toast() {
  const toast = useUnex((s) => s.toast);
  if (!toast) return null;
  return (
    <div className="pointer-events-none absolute left-4 right-4 bottom-8 z-50 animate-[fadeUp_0.25s_ease]">
      <div className="rounded-[14px] border border-[rgba(196,181,253,0.35)] bg-[rgba(196,181,253,0.18)] px-4 py-3.5 text-center backdrop-blur-sm">
        <div className="text-[0.95rem] font-semibold text-[#f3f0f8]">{toast}</div>
        <p className="text-[0.8rem] text-[#9b93a8] mt-0.5">
          they&apos;ll see it when they&apos;re ready
        </p>
      </div>
    </div>
  );
}
