import type { LocaleCode } from "./types";

/** Tiny i18n scaffold — EN is live; other locales fall back to EN. */
const EN: Record<string, string> = {
  "splash.tagline": "soft reopen for two people after a mess — buttons only.",
  "splash.continue": "continue",
  "splash.invite": "i have an invite",
  "splash.both": "both say yes",
  "splash.buttons": "no free typing",
  "splash.pings": "live pings",
  "login.title": "name + WhatsApp number",
  "login.enter": "enter unex",
  "login.back": "back",
  "lang.picker": "language",
  "lang.soon": "coming soon — English for now",
};

const TABLES: Partial<Record<LocaleCode, Record<string, string>>> = {
  en: EN,
  es: {},
  fr: {},
  sw: {},
  pt: {},
};

export function t(locale: LocaleCode | string | undefined, key: string): string {
  const loc = (locale || "en") as LocaleCode;
  const table = TABLES[loc] || EN;
  return table[key] ?? EN[key] ?? key;
}
