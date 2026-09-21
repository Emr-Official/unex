"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

export function BrandMark({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <span
      className={`font-bold tracking-tight bg-gradient-to-r from-[#c4b5fd] to-[#f9a8d4] bg-clip-text text-transparent ${
        size === "lg" ? "text-[2rem]" : "text-[1.35rem]"
      }`}
    >
      unex
    </span>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="text-[0.68rem] text-[#9b93a8] uppercase tracking-[0.04em]">
      {children}
    </div>
  );
}

export function Sub({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`text-[0.8rem] text-[#9b93a8] leading-relaxed ${className}`}>{children}</p>
  );
}

export function Card({
  children,
  soft,
  className = "",
}: {
  children: ReactNode;
  soft?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[18px] border px-3.5 py-3 ${
        soft
          ? "bg-gradient-to-br from-[rgba(196,181,253,0.12)] to-[rgba(249,168,212,0.08)] border-[rgba(196,181,253,0.25)]"
          : "bg-[#1e1b26] border-[rgba(196,181,253,0.14)]"
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="text-[0.68rem] font-semibold text-[#6b6478] uppercase tracking-[0.05em]">
      {children}
    </div>
  );
}

type BtnVariant = "primary" | "ghost" | "subtle" | "danger";

export function Btn({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant }) {
  const base =
    "inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 font-semibold text-[0.82rem] tracking-tight w-full transition active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none";
  const variants: Record<BtnVariant, string> = {
    primary: "bg-gradient-to-r from-[#a78bfa] to-[#f9a8d4] text-[#1a1020]",
    ghost: "bg-transparent text-[#c4b5fd] border border-[rgba(196,181,253,0.35)]",
    subtle: "bg-[#1e1b26] text-[#f3f0f8] border border-[rgba(196,181,253,0.14)]",
    danger:
      "bg-[rgba(251,113,133,0.15)] text-[#fb7185] border border-[rgba(251,113,133,0.35)]",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Chip({
  children,
  active,
  pink,
  onClick,
  disabled,
}: {
  children: ReactNode;
  active?: boolean;
  pink?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-[0.72rem] font-medium border whitespace-nowrap transition disabled:opacity-40 ${
        active
          ? "bg-[rgba(196,181,253,0.2)] border-[rgba(196,181,253,0.5)] text-[#c4b5fd]"
          : pink
            ? "bg-[rgba(249,168,212,0.15)] border-[rgba(249,168,212,0.4)] text-[#f9a8d4]"
            : "bg-[#1e1b26] border-[rgba(196,181,253,0.14)] text-[#f3f0f8]"
      }`}
    >
      {children}
    </button>
  );
}

export function Avatar({ name, sm }: { name: string; sm?: boolean }) {
  const letter = (name || "?").charAt(0).toUpperCase();
  return (
    <div
      className={`rounded-full bg-gradient-to-br from-[#c4b5fd] to-[#f9a8d4] flex items-center justify-center font-bold text-[#1a1020] shrink-0 ${
        sm ? "w-8 h-8 text-[0.7rem]" : "w-11 h-11 text-[0.9rem]"
      }`}
    >
      {letter}
    </div>
  );
}

export function Pill({
  children,
  tone = "ok",
}: {
  children: ReactNode;
  tone?: "ok" | "warn" | "muted" | "danger";
}) {
  const tones = {
    ok: "bg-[rgba(167,243,208,0.12)] text-[#a7f3d0] border-[rgba(167,243,208,0.25)]",
    warn: "bg-[rgba(249,168,212,0.12)] text-[#f9a8d4] border-[rgba(249,168,212,0.3)]",
    muted: "bg-[rgba(155,147,168,0.15)] text-[#9b93a8] border-[rgba(155,147,168,0.25)]",
    danger: "bg-[rgba(251,113,133,0.12)] text-[#fb7185] border-[rgba(251,113,133,0.3)]",
  };
  return (
    <span className={`text-[0.65rem] px-2 py-0.5 rounded-full border ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Toggle({
  on,
  onChange,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative w-10 h-6 rounded-xl shrink-0 transition ${
        on ? "bg-gradient-to-r from-[#a78bfa] to-[#f9a8d4]" : "bg-[rgba(196,181,253,0.35)]"
      }`}
    >
      <span
        className={`absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white transition-all ${
          on ? "left-[19px]" : "left-[3px]"
        }`}
      />
    </button>
  );
}

export function QuietLink({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-[0.72rem] text-[#6b6478] underline underline-offset-2"
    >
      {children}
    </button>
  );
}

export function Signal({ children }: { children: ReactNode }) {
  return (
    <p className="text-[0.72rem] text-[#9b93a8] italic text-center py-2">{children}</p>
  );
}
