"use client";

import { BrandMark, Btn, Chip, Signal, Sub } from "../ui";
import { useUnex } from "@/lib/store";
import { ensureNotifyPermission } from "@/lib/notify";
import { LOCALES } from "@/lib/constants";
import { t } from "@/lib/i18n";

export function Splash() {
  const setScreen = useUnex((s) => s.setScreen);
  const locale = useUnex((s) => s.locale);
  const setLocale = useUnex((s) => s.setLocale);

  const go = async () => {
    await ensureNotifyPermission();
    setScreen("login");
  };

  return (
    <div className="flex flex-col flex-1 gap-3">
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 px-2">
        <BrandMark size="lg" />
        <Sub className="max-w-[220px]">{t(locale, "splash.tagline")}</Sub>
        <div className="flex flex-wrap gap-1.5 justify-center mt-1">
          <Chip pink>{t(locale, "splash.both")}</Chip>
          <Chip>{t(locale, "splash.buttons")}</Chip>
          <Chip>{t(locale, "splash.pings")}</Chip>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-[0.65rem] text-center text-[#6b6478] uppercase tracking-wide">
          {t(locale, "lang.picker")}
        </p>
        <div className="flex flex-wrap gap-1.5 justify-center">
          {LOCALES.map((L) => (
            <button
              key={L.code}
              type="button"
              onClick={() => setLocale(L.code)}
              className={`px-2.5 py-1 rounded-full text-[0.68rem] font-medium border ${
                locale === L.code
                  ? "bg-[rgba(196,181,253,0.2)] border-[rgba(196,181,253,0.5)] text-[#c4b5fd]"
                  : "bg-[#1e1b26] border-[rgba(196,181,253,0.14)] text-[#9b93a8]"
              }`}
            >
              {L.label}
              {!L.live ? " · soon" : ""}
            </button>
          ))}
        </div>
        <Btn onClick={go}>{t(locale, "splash.continue")}</Btn>
        <Btn variant="ghost" onClick={go}>
          {t(locale, "splash.invite")}
        </Btn>
        <Signal>taps pop up in real time when you allow alerts</Signal>
      </div>
    </div>
  );
}
