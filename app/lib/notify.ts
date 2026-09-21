/** Soft in-app + browser notifications for unex taps (no free-text bodies). */

export async function ensureNotifyPermission(): Promise<NotificationPermission | "unsupported"> {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

export function notifyTap(opts: {
  title?: string;
  body: string;
  tag?: string;
}): void {
  if (typeof window === "undefined") return;
  const title = opts.title ?? "unex";
  // Always fire a DOM event for in-app realtime toast listeners
  window.dispatchEvent(
    new CustomEvent("unex:notify", { detail: { title, body: opts.body, tag: opts.tag } })
  );
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  try {
    new Notification(title, {
      body: opts.body,
      tag: opts.tag ?? "unex-tap",
      silent: false,
    });
  } catch {
    // ignore — some browsers block without SW
  }
}
