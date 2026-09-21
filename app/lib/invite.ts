/** Build a shareable invite URL for the hosted app (static-friendly). */
export function inviteShareUrl(
  fromName: string,
  asName: string,
  inviteId?: string | null
): string {
  if (typeof window === "undefined") return "";
  const base = `${window.location.origin}${window.location.pathname.replace(/\/$/, "")}/`;
  const u = new URL(base);
  u.searchParams.set("invite", "1");
  u.searchParams.set("from", fromName);
  if (asName) u.searchParams.set("as", asName);
  if (inviteId) u.searchParams.set("code", inviteId);
  return u.toString();
}

export function parseInviteFromLocation(): {
  from: string;
  as: string;
  code: string | null;
} | null {
  if (typeof window === "undefined") return null;
  const u = new URL(window.location.href);
  if (u.searchParams.get("invite") !== "1") return null;
  const from = (u.searchParams.get("from") || "").trim();
  const as = (u.searchParams.get("as") || "").trim();
  const code = (u.searchParams.get("code") || "").trim() || null;
  if (!from) return null;
  return { from, as, code };
}

export function clearInviteQuery(): void {
  if (typeof window === "undefined") return;
  const u = new URL(window.location.href);
  if (!u.searchParams.has("invite")) return;
  u.searchParams.delete("invite");
  u.searchParams.delete("from");
  u.searchParams.delete("as");
  u.searchParams.delete("code");
  window.history.replaceState({}, "", u.pathname + u.hash);
}
