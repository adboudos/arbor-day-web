# PRD: Arbor Day Admin Page

**Status:** Draft (pending Quinn's review)
**Author:** Pax (product manager hat on)
**Date:** October 6, 2026
**Route:** `/admin` (unlinked, noindexed)

---

## 1. Problem

Planning for the 6th Annual Arbor Day bar party (Friday, April 30, 2027) lives across a shared spreadsheet, Gmail threads, and three people's heads. The venue hunt alone spans dozens of bars in various states: shortlisted, replied, awaiting a call Quinn has to make, form-submitted, dead, or dropped. Gimmick ideas (live band, seeds, and the new sticker concepts) have no single home either. The three hosts need one page that answers "where do we stand?" at a glance, readable on a phone at a bar.

## 2. Goals

- Give Quinn, Jason, and Alex a single, phone-friendly dashboard of the 2027 venue hunt: who is in play, what they quoted, what is still owed, and what is dead.
- Give the gimmick pipeline a home: past gimmicks, the house principles, and proposed ideas (first-time stickers, 5x repeat stickers) with their status.
- Keep it hosts-only: password gate, unlinked from site nav, noindexed.

## 3. Non-goals (v1)

- No editing UI. Updates happen by editing `src/data/admin.ts` and redeploying. (A Supabase-backed editable version is future work.)
- No real authentication. See section 7.
- No public visibility. The page must not appear in nav, sitemap, or search.

## 4. Users

Quinn, Jason Kaminski, Alex Boudos. All iPhone users. They will open this mid-conversation, probably at a bar, so it must be scannable in under 30 seconds.

## 5. Functional requirements

### 5.1 Access gate
- Visiting `/admin` shows only a password prompt (styled to match the site).
- Correct password (`Ravirogi`) unlocks the dashboard for the browser session (sessionStorage flag). Wrong password shows an error, no hints.
- The page sets `robots: noindex, nofollow` and is not linked from `SiteNav`, the home page, or the footer.

### 5.2 Venue hunt tracker
Sections, in order:
0. **Status summary:** one plain-English paragraph, e.g. "Venue not booked. Three contenders: Kirkwood, Ranalli's, Galway Arms. Seven calls still on Quinn's list. 207 days out." This is the 30-second read.
1. **Stat row:** contenders count, replies in, awaiting outreach, dead/dropped.
2. **Featured contenders:** Kirkwood, Ranalli's, Galway Arms. Each card shows location, the deal on the table, and caveats (e.g. Galway's 65-person cap vs ~100 turnout; Kirkwood's minimum/timing caveats).
3. **Replies log:** Lincoln Tap Room (packages A/B/C, B 3hr $30pp, fits the $40 cap; cut from featured), Galway Arms (Alec's terms), Will's Northwoods Inn (redirected to form, no quote).
4. **Full shortlist:** Brickhouse, Schubas, J. Parker, Clover, Big Star Wrigleyville, Joe's on Weed St, Old Pueblo Cantina, Lincoln Station, Kelly's Pub, Broken Barrel Bar, Wrigley View Rooftop, Wrigley Rooftops LLC, Gunny's Pub, Bookclub Chicago, Kingston Mines.
5. **Awaiting outreach:** phone-only list (Quinn must call, with numbers) and form-only list (submitted, awaiting reply).
6. **Dead and dropped:** Theatre on the Lake (booked), The Irish Oak (closed), plus the full dropped list in a collapsed section so it never resurfaces.
7. **Criteria recap:** $40pp wristband max, no host tab, guests pay their own way, unique bar-esque venues, all of Chicago fair game.

### 5.3 Gimmicks board
- **House principles:** Getting Drunk / Celebrating Trees / Dressing Formal.
- **Past gimmicks (done):** live band (2025), seed packets, party favors.
- **Proposed:** first-time attendee stickers, 5x repeat attendee stickers (loyalty tiers for the 6th annual; 5x means attended five previous parties, honor system), seed mailer via the site.
- Each gimmick shows a status badge: done, proposed, or idea.

### 5.4 Data
All content lives in `src/data/admin.ts` as typed arrays. No backend calls. Updating the page = editing the data file.

## 6. Design

- Follow current site conventions: Tailwind inline classes, theme tokens (`bg-forest`, `text-cream`, `text-amber`, `text-leaf`), shared kit in `src/components/ui.tsx` (PageShell, Section, Stat, Field, Button, ErrorNote).
- iPhone-first per the house layout rule: 390px viewport, 44px tap targets, no horizontal overflow.
- Status badges with distinct colors: contender (amber), replied (leaf), awaiting (cream outline), dead (muted/red-ish).
- No em dashes anywhere (house copy rule).

## 7. Security note

The password gate is client-side obfuscation, not real security. Anyone who views the page source can find the password and the data. The password also lives in git history via this PRD. That is acceptable here because the data is venue research and party planning, not secrets, and the goal is keeping casual visitors out, not attackers. If the page ever holds anything sensitive, replace the gate with Supabase Auth. The PRD calls this out so nobody mistakes the gate for real access control.

## 8. Open questions

1. Should Jason and Alex be able to update the tracker without a code change (Supabase-backed editing)? Defer to v2 unless Quinn says otherwise.
2. The sticker gimmicks need designs. Who owns that?
3. Should the war-room joke page stay out of the public nav? (Alex's nav currently links it.)

## 9. Success criteria

- All three hosts can open `/admin` on their phones, enter the password, and state the current top-3 venues and their caveats without scrolling confusion.
- Zero em dashes. No horizontal scroll at 390px. `tsc` and `eslint` clean.
- The page does not appear in nav, footer, or search results.

## 10. Future work

- Supabase-backed tracker with edit UI for the hosts.
- Real auth (Supabase Auth) if sensitive content ever lands here.
- RSVP/headcount integration (currently tracked in the spreadsheet).
