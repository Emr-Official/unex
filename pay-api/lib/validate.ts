/** Normalize UG / international MSISDN to digits ioTec accepts (0XXXXXXXXX or 256...). */
export function normalizePhone(raw: string): string | null {
  let s = String(raw || "").trim();
  s = s.replace(/[\s\-().]/g, "");
  if (s.startsWith("+")) s = s.slice(1);
  if (!/^\d+$/.test(s)) return null;
  // 2567XXXXXXXX → keep; 07XXXXXXXX → keep; 7XXXXXXXX → prefix 0
  if (s.startsWith("256") && s.length === 12) return s;
  if (s.startsWith("0") && s.length === 10) return s;
  if (s.length === 9 && /^[7]/.test(s)) return `0${s}`;
  // allow ioTec sandbox-style 011177777x
  if (s.length >= 9 && s.length <= 15) return s;
  return null;
}

export function isValidEmail(raw: string): boolean {
  const e = String(raw || "").trim();
  if (e.length < 5 || e.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

export function safeExternalId(raw?: string): string {
  const s = String(raw || "").trim().slice(0, 100);
  if (s && /^[A-Za-z0-9_\-:]+$/.test(s)) return s;
  return `unex-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
