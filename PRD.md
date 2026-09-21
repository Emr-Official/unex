# unex — Product Requirements (MVP)

**Working name:** unex  
**One-liner:** A button-only soft-reopen channel for two people after a mess — status, mood, and intentional pings. No free typing. No secret tracking.  
**Owner:** Vanta Odds  
**Date:** 2026-09-21  
**Status:** Approved direction — cook MVP

---

## 1. Problem
After a fight or breakup, people still care but hate messy texting. Free typing escalates. Blocking feels final; silence feels like stalking anxiety. unex gives a calm, gamey lane for mutual check-ins.

## 2. Non-goals (explicit)
- Contacting people who did not accept a pair
- Bypassing Instagram/WhatsApp/phone blocks
- Automatic / background location of another person
- “Find out if they’re dating” via scraping or third-party data
- Unlimited spam taps

## 3. Core principles
1. **Both must opt in** — invite → join app → accept pair.
2. **Buttons only** — no free-text chat in MVP.
3. **Mute/Archive is culture; Block is safety.**
4. **Location is manual send only**, expiring, dual consent for pings.
5. **Dignity** — soft copy; no humiliation mechanics.

---

## 4. Users
- **Primary:** Adults 18+ who share history (exes, almost-exes, on-pause couples) and both want a softer channel.
- **Not for:** unilateral pursuit after refusal; harassment; minors.

---

## 5. Pairing flow
1. User A creates account (phone OTP).
2. User A sends invite (SMS/link) with optional first name.
3. User B installs / opens link → creates account → **Accept** or **Decline**.
4. Decline = no channel; A sees “Invite declined.” No retry spam (cooldown 7 days).
5. Accept = pair active. Either can End pair (Block) later.

**Phone number alone never opens a channel.**

---

## 6. Heartbreak status (they set it)
Visible to the paired person only:

| Status | Meaning |
|--------|---------|
| Still sad | Hurting; soft taps preferred |
| Working on myself | Not ghosting; not ready |
| Open to talk | Soft reopen OK |
| Need space | Cool-down engaged |
| Moved on | Closure signal |
| Seeing someone / Not available | Clear boundary |
| Soft / hoping | Optional lighter status |

---

## 7. Mood (separate from status)
Pissed · Soft · Happy · Forgiving · Numb · Need space  

Mood can gate which buttons are enabled (e.g. “Chase me” disabled if Need space).

---

## 8. Soft taps (button deck)
Rate limit: e.g. **5 taps / 24h** free; Premium **15 / 24h** (client daily reset in web MVP).

Overnight deck extras (message taps, not pins): **That was on me · I need you · Come over · Want you tonight** — keep care deck.

**Check-in:** Hey · How are you now? · Thinking of you  
**Talk:** Can we talk? · Are you ready to talk? · One call? · Meet once?  
**Repair:** I’m sorry · I miss you · I was wrong  
**Boundary:** I’m not ready · Need space · Please don’t ask again  

No custom text in MVP.

---

## 9. Soft refuse ladder (product culture)

### 9.1 Need space
- Auto cool-down 48–72h: their taps hold in a queue.
- Sender sees: **“Delivered when they’re ready.”**

### 9.2 Mute
- No push notifications.
- Thread stays; optional badge off.

### 9.3 Archive
- Hidden from main list under “Archived.”
- Open when ready.

### 9.4 Clear unread
- Wipe queued taps **without opening**.
- Sender gets **one** batched signal: **“Cleared unread.”**
- Not one notification per tap.

### 9.5 End pair (Block) — safety, buried
- Permanent for this pair.
- Other person sees: **“Connection ended.”**
- Reopen only via new invite + accept.
- Plus **Report** for abuse.

**Marketing language:** Mute & Archive.  
**Store/legal:** Block + Report must exist.

---

## 10. Manual pings (phase 1.5 / 2)
Both must enable “Allow pings from this person.”

**Default = live location pin** (map/PNG pin UI). People have many hangouts — a single “our spot” does not scale.

| Action | Behavior |
|--------|----------|
| Come get me | **Live pin signal** (label + expiry; map/geolocation later), expires 15–30 min — primary. Distinct from the **Come over** message tap. |
| Chase me | Playful timed live pin; blocked if their mood is Need space |
| Shared places (later) | Optional **list of many** saved spots — never one forced spot |

No background “they’re nearby” radar. No automatic tracking. Pin is always an intentional tap.

---

## 11. Status / presence copy (locked)

| Situation | Sender sees |
|-----------|-------------|
| Muted | Not reading right now |
| Need space cool-down | Delivered when they’re ready |
| Cleared unread (batch) | Cleared unread |
| Archived (optional) | Quiet for now |
| End pair | Connection ended |
| Invite pending | Waiting for them |
| Invite declined | Invite declined |

---

## 12. Game layer (light)
- Optional mutual check-in streak (can disable)
- Unlock “One call?” after both moods ≠ Pissed for 24h
- Respect Need space → small positive cue (not XP grind)
- Weekly multiple-choice “honest question” card (optional)

---

## 13. Monetization
- **Free:** 1 pair, basic taps, status, mute/archive/clear  
- **Premium:** multiple connections, more taps/day, ping types, themes, longer cool-down controls, sealed journal (private notes only you see)  
- No ads that sell “win your ex back” creep energy

---

## 14. MVP scope (ship in ~4–6 weeks if focused)

### Must (v0.1)
- Auth (phone OTP)
- Invite / accept / decline
- Status + mood
- Button taps + rate limits
- Mute, Archive, Clear unread + copy above
- End pair (Block) + Report
- Push notifications

### Should (v0.2)
- Manual pings: **Come get me** live pin signal (map/geolocation next) — primary
- Optional multi-spot list later (never a single forced “our spot”)
- Premium paywall (simulated unlock OK for web MVP)

### Later
- Chase me
- Weekly cards
- Streaks
- Web companion

---

## 15. Tech sketch
- Mobile-first (Flutter or React Native)
- Backend: Supabase/Firebase (auth, Firestore/Postgres, FCM/APNs)
- Location: foreground only when sending a ping; expire server-side
- Moderation: report queue; rate limits; block list

---


## Real-time notifications (required)
- Partner taps, status changes, live pins, and invite accept/decline arrive as **push + in-app** within seconds.
- Soft copy only (button label), never free-text body spam.
- Mute / Need space: suppress or hold delivery per PRD soft-refuse rules — notify only with “delivered when they’re ready” when appropriate.
- MVP web: Notification API + service worker when available.
- Native later: FCM / APNs.
- No silent background location; location pings notify only when intentionally sent.


## Connections & premium
- **Free:** 1 active connection (pair) at a time — fits soft reopen.
- **Premium:** multiple concurrent connections + extras (themes, more taps/day, ping types).
- Payment can stay simulated in MVP until real billing (Stripe / App Store).

## 16. Success metrics
- Pair accept rate
- 7-day retention of accepted pairs
- % sessions that use Mute vs Block
- Report rate < threshold
- Premium conversion

---

## 17. Risks
- Misuse for harassment → mitigate with accept-only, rate limits, Block/Report
- Store rejection → clear safety center, no stalking claims in ASO
- Emotional harm → copy review; “Need space” defaults

---

## 18. Next build tasks
1. Wireframes (onboarding, home, tap deck, archive, safety)
2. Button + status final copy deck
3. Supabase schema: users, pairs, taps, statuses, mutes
4. Clickable prototype (Figma or Flutter shell)
5. Landing page one-pager for waitlist


### Care checkups
Did you eat anything today? · Did you sleep okay? · Are you safe? · Drink some water · How was your day?


## Connection when blocked elsewhere
- **Invite link** — share any way you still can; Accept only in unex.
- **Direct WhatsApp-number request** — only if they already have an unex account with a handle. Lands in their Requests inbox. Accept / Decline. No contacting people who never joined. No sending WhatsApp messages for you. No off-app bypass.


---

## Overnight polish (2026-09-21)
Web MVP demo notes (behavior shipped in `/workspace/unex/app`):
- **End pair** patches remote `{ ended: true }`; peer PairSync stops and local-ends.
- **Free 1-connection** hard-gated in `sendInvite` / `acceptInvite` / AcceptInvite UI (not only menus).
- **Accept** requires invite `code` + WhatsApp login (query preserved).
- Polls pause when `document.hidden`; paired poll ~10s.
- Need space gates on **partner** status/mood for send/pin copy.
- Toast footer only on soft success toasts.
- Language picker scaffold (EN live; ES/FR/SW/PT stub) persisted with `unex-v8`.
- Payment remains **simulated**. Real Stripe / Mobile Money / OTP / Supabase / maps / legal → NEEDS_VANTA.
