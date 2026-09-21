import type { HeartbreakStatus, Mood } from "./types";

export const STATUSES: HeartbreakStatus[] = [
  "Still sad",
  "Working on myself",
  "Open to talk",
  "Need space",
  "Moved on",
  "Seeing someone / Not available",
  "Soft / hoping",
];

export const MOODS: Mood[] = [
  "Pissed",
  "Soft",
  "Happy",
  "Forgiving",
  "Numb",
  "Need space",
];

export const TAP_DECK = [
  { label: "Hey", category: "check-in" },
  { label: "How are you now?", category: "check-in" },
  { label: "Thinking of you", category: "check-in" },
  // Care checkups — soft, short, GenZ-warm (not naggy)
  { label: "Did you eat anything today?", category: "care" },
  { label: "Did you sleep okay?", category: "care" },
  { label: "Are you safe?", category: "care" },
  { label: "Drink some water", category: "care" },
  { label: "How was your day?", category: "care" },
  { label: "Can we talk?", category: "talk" },
  { label: "Ready when you are", category: "talk" },
  { label: "I'm sorry", category: "repair" },
  { label: "I miss you", category: "repair" },
  { label: "Need space", category: "boundary" },
] as const;

export const DAILY_TAP_LIMIT = 5;

export const COPY = {
  muted: "Not reading right now",
  needSpace: "Delivered when they're ready",
  clearedUnread: "Cleared unread",
  archived: "Quiet for now",
  ended: "Connection ended",
  pending: "Waiting for them",
  declined: "Invite declined",
} as const;
