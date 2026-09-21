/** Ephemeral in-memory paid externalIds (Vercel instances are ephemeral — status poll is primary). */

const paid = new Map<string, { at: number; id?: string }>();
const MAX = 500;

export function markPaid(externalId: string, id?: string) {
  if (!externalId) return;
  if (paid.size >= MAX) {
    const first = paid.keys().next().value;
    if (first) paid.delete(first);
  }
  paid.set(externalId, { at: Date.now(), id });
}

export function isPaid(externalId: string): boolean {
  return paid.has(externalId);
}
