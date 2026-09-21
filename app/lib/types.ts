export type Screen =
  | "splash"
  | "login"
  | "invite"
  | "waiting"
  | "home"
  | "tapConfirm"
  | "muteArchive"
  | "clearUnread"
  | "safety"
  | "myStatus"
  | "ended"
  | "premium"
  | "requests"
  | "messages";

export type HeartbreakStatus =
  | "Still sad"
  | "Working on myself"
  | "Open to talk"
  | "Need space"
  | "Moved on"
  | "Seeing someone / Not available"
  | "Soft / hoping";

export type Mood =
  | "Pissed"
  | "Soft"
  | "Happy"
  | "Forgiving"
  | "Numb"
  | "Need space";

export type PairState = "none" | "pending" | "paired" | "ended";

export type PairRole = "host" | "guest";

export type LocaleCode = "en" | "es" | "fr" | "sw" | "pt";

export interface TapMessage {
  id: string;
  label: string;
  direction: "sent" | "received";
  at: string;
  cleared?: boolean;
}


/** One saved connection (premium multi-pair scaffold; free uses 0–1). */
export interface ConnectionEntry {
  id: string;
  pairKey: string;
  partnerName: string;
  partnerPhone?: string;
  myRole: PairRole;
  pairDocId: string | null;
  lastSignal: string | null;
  unreadCount: number;
  partnerStatus: HeartbreakStatus;
  partnerMood: Mood;
  partnerLivePin: string | null;
  thread: ThreadItem[];
  unreadReceived: TapMessage[];
  sentTaps: TapMessage[];
  seenTapIds: string[];
  muted: boolean;
  archived: boolean;
  updatedAt: string;
}

/** Chronological thread item (taps + pin/system lines). */
export interface ThreadItem {
  id: string;
  kind: "tap" | "pin" | "system";
  label: string;
  direction: "sent" | "received" | "system";
  at: string;
}

export interface UnexState {
  screen: Screen;
  myName: string;
  partnerName: string;
  pairState: PairState;
  myStatus: HeartbreakStatus;
  myMood: Mood;
  partnerStatus: HeartbreakStatus;
  partnerMood: Mood;
  tapsLeft: number;
  /** YYYY-MM-DD of last tapsLeft reset */
  tapsDayKey: string;
  muted: boolean;
  archived: boolean;
  needSpaceHold: boolean;
  unreadReceived: TapMessage[];
  sentTaps: TapMessage[];
  /** Full chat history for Messages screen */
  thread: ThreadItem[];
  pendingTap: string | null;
  toast: string | null;
  lastSignal: string | null;
  /** Active live pin from partner (label), null if none/expired */
  partnerLivePin: string | null;
  reportSubmitted: boolean;
  /** Invite + pair channel id (same id). */
  inviteCode: string | null;
  myRole: PairRole | null;
  /** Remote pair document _id (optional cache). */
  pairDocId: string | null;
  seenTapIds: string[];
  isPremium: boolean;
  myPhone: string;
  /** UI language (EN live; others stub) */
  locale: LocaleCode;
  /** Premium multi-pair list (also holds the free single pair for switching later). */
  connections: ConnectionEntry[];
  activeConnectionId: string | null;
  /** Premium home: list of connections vs open pair detail. */
  homeView: "list" | "pair";
}

