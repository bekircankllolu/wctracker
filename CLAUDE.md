# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

WC Tracker — a live, no-login family bathroom-occupancy PWA. One person taps
"Tuvalete girdim" and every other family member's phone updates instantly to
show who's inside and for how long, via Supabase Realtime. Turkish-language UI.

## Commands

```bash
npm install
cp .env.example .env.local   # fill in VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
npm run dev                  # vite dev server
npm run build                # tsc -b && vite build — this is the only type-check/lint gate
npm run preview              # serve the production build locally
```

There is no lint script and **no committed test suite**. `npm run build` (which
runs `tsc -b` under `strict`, `noUnusedLocals`, `noUnusedParameters`) is the
closest thing to a correctness gate — always run it before considering a
change done. Manual/visual verification has historically been done with
ad-hoc Playwright scripts written to a scratch directory (not checked into the
repo), driving a `vite preview` server with Supabase's REST/broadcast layer
mocked via `page.route`. Playwright's browser lives at
`/opt/pw-browsers/chromium` and the npm package at
`/opt/node22/lib/node_modules/playwright` in the sandboxed dev environment —
`require()` it by absolute path since it isn't a project dependency.

**Mocking gotcha:** when stubbing Supabase REST calls, register one
`page.route` per table (`**/rest/v1/wc_state**`, `**/rest/v1/members**`,
`**/rest/v1/visits**`, `**/rest/v1/messages**`, `**/rest/v1/queue**`,
`**/rest/v1/push_subscriptions**`). A catch-all `**/rest/v1/**` route shadows
the specific ones and silently returns the wrong shape (e.g. `[]` for a
`.single()` call), which reads as a real app bug until you notice the mock is
at fault.

## Architecture

**No router.** `App.tsx` is a single component that switches between three
"tabs" (`durum` / `sohbet` / `takvim`) held in local state, plus a handful of
full-screen modal "sheets" (Menu, IdentityPicker, RosterEditor, MemberDetail)
toggled by boolean state. All business logic lives in `src/lib/*` hooks, one
per concern, wired together in `App.tsx`; components under `src/components`
are close to presentational.

**Backend is Supabase, entirely.** No custom server. Tables: `wc_state`
(single row, `id = 1`, the live occupancy status), `members`, `visits`
(completed-stay history the stats/calendar are computed from), `messages`
(mini chat), `queue` (who's waiting), `push_subscriptions`. One Edge Function,
`supabase/functions/notify`, sends Web Push via `npm:web-push` using a
hardcoded public VAPID key + a `VAPID_PRIVATE_KEY` **Supabase Edge Function
secret** (never committed — set it in the Supabase dashboard, not in code).

**Two independent identity concepts, both in `localStorage`, don't conflate
them:**
- `wc-identity` (`useIdentity`) — "who am I" for chat/poke/queue attribution;
  purely a UI preference, freely changeable.
- `wc-occupant-token` (inside `useWcState`) — proof that *this device* is the
  one currently occupying the toilet. Every write to `wc_state` while
  occupied is guarded with `.eq("occupant_token", tokenRef.current)`, so only
  the device that entered can update note/photo/smell or exit. This is the
  mechanism behind "🔒 Durumu yalnızca X (giren cihaz) değiştirebilir."

**Realtime delta pattern:** hooks that subscribe to `postgres_changes`
(`useMembers`, `useMessages`, `useQueue`, `useVisits`) apply the
INSERT/UPDATE/DELETE payload directly to local state instead of refetching
the whole list. Follow this pattern for new realtime-backed lists rather than
re-querying on every event.

**Render isolation:** anything that ticks every second (the occupancy timer,
the cooldown countdown) is isolated in a leaf component using
`useElapsed`/`useCountdown` from `src/lib/timers.ts`, so `App` itself never
re-renders on a 1s interval.

**Optimistic UI:** chat `send()` (`useMessages`) and queue `join()`
(`useQueue`) push a temp/optimistic entry immediately, then reconcile with
the server response or the realtime echo (matched by sender+body for chat).

**Cooldown / "havalandırma" mechanic:** `smell_level` is a 4-point scale
(0 Çok iyi / 1 İyi / 2 Kötü / 3 Çok kötü, see `ToiletMeters.tsx`'s `SMELL`
array). If someone exits while `smell_level >= 3`, `wc_state.cooldown_until`
is set (3 min × `smell_multiplier`) and the phase becomes `"cooldown"`
instead of `"free"`. Entering again during cooldown increments
`smell_multiplier` — this is the "koku çarpanı" shown in the UI. Phase is
always derived (`useWcState` computes `phase` from
`occupant`/`cooldown_until`), never stored directly.

**Icons:** in-app iconography is custom PNGs, not emoji — `AppIcon`
(`src/components/AppIcon.tsx`) renders `<img src="/icons/{name}.png">` from a
closed `AppIconName` union; the actual files live in `public/icons/`. Add a
new icon by dropping the PNG in `public/icons/` and extending the
`AppIconName` union, not by reaching for an emoji glyph.

**Design system ("Bento Pastel"):** tokens are CSS custom properties in
`src/index.css` (`:root` = light, `:root[data-theme="dark"]` = dark),
mirrored in `src/theme.ts` as a plain object (kept as a single source for a
possible future React Native reuse — not currently imported anywhere else in
this codebase). The one rule to preserve when touching styles: content sitting
directly on a pastel surface (`--peach`/`--mint`/`--lavender`/`--butter`/
`--danger`) always uses fixed `#111111` text/accents regardless of theme,
because those surfaces themselves don't change in dark mode; content on
neutral surfaces (`--bg`/`--tile`/`--card`) uses the theme-aware
`var(--ink)`/`var(--on-ink)` pair, which does flip. Theme choice
(`system`/`light`/`dark`) is applied via `<html data-theme>`, set both by an
inline script in `index.html` (pre-paint, avoids FOUC) and by `useTheme` at
runtime.

**PWA:** `public/manifest.webmanifest` + `public/sw.js` (network-first for
navigations, cache-first for static assets) + `src/main.tsx` registers the
service worker only when `import.meta.env.PROD`. Icons in `public/` are
generated from a source logo image at various sizes (192/512/512-maskable/
apple-touch/favicon) — regenerate all of them together if the logo changes,
don't hand-edit one size.

## Deployment

Vercel is connected via git integration — pushing/merging to `main` deploys
automatically, there's no `vercel.json` and no manual deploy step. Production
is `wctracker-pi.vercel.app`. To confirm a deploy actually picked up a change,
fetch the production URL and compare the hashed asset filename
(`/assets/index-*.js`) against the local `dist/` build output rather than
trusting time elapsed.

Supabase project: ref `gvguizpedddtivnqaaqt` (org `wctracker`, region
`eu-central-1`).

## Android publishing (TWA)

The PWA is published to the Play Store as a **Trusted Web Activity** — a
thin native wrapper around the deployed `wctracker-pi.vercel.app` site, not
a separate codebase. There is no local Android project checked in; the
manifest/service worker/icons already in `public/` are the only inputs it
needs.

- **Recommended tool:** [PWABuilder.com](https://www.pwabuilder.com) —
  point it at `https://wctracker-pi.vercel.app`, it validates the manifest,
  generates a signed Android App Bundle, and produces the
  `.well-known/assetlinks.json` content for you. No local Android
  SDK/Gradle setup needed. `@bubblewrap/cli` is the CLI equivalent if a
  local Android Studio project is ever wanted instead, but it requires a
  full Android SDK toolchain.
- **Package ID:** `tr.bekircankllolu.wctracker` — fixed forever once the
  first version is uploaded to Play Console, choose deliberately if
  changing it.
- **Signing key:** back up the keystore + password somewhere durable the
  moment it's generated (password manager, not just this repo's
  container) — losing it means never being able to ship an update to the
  same Play Store listing again. Prefer opting into **Play App Signing**
  during first upload so Google escrows the real signing key and only the
  upload key needs care.
- **`.well-known/assetlinks.json`** must be added to `public/` (served at
  `wctracker-pi.vercel.app/.well-known/assetlinks.json`) with the real
  SHA-256 cert fingerprint before the TWA will open without browser
  chrome — PWABuilder gives you this file directly.
- **Privacy policy** for the Play Console listing: `public/privacy.html`
  (`wctracker-pi.vercel.app/privacy.html`).
- **Play Console requirement:** new developer accounts must run a closed
  test with 20+ opted-in testers for 14 days before the production track
  unlocks — factor this into timeline even for a family-only app.

## Git workflow used in this repo's history

Every change so far has landed as: create a branch off `main`
(`claude/<short-slug>`), commit, push, open a PR, squash-merge, then reset
local `main` to `origin/main`. Keep following that pattern rather than
committing straight to `main`.
