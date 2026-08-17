# Live Check Report: `local UI/UX audit 2026-08-17`

Status: `BLOCKED`<br>
Date: `2026-08-17`<br>
Checker: `OpenCode`<br>
Release owner: `not provided`

This report records a local design live-check. It is not a staging or production
approval. No real payment, account mutation, Telegram action, external app link,
email action or backend write was performed.

## Source Identity

| Item | Exact value |
| --- | --- |
| Custom Cabinet commit | `b23d9289067d71c5eaeb379b2a0f1aad382ad619` plus uncommitted worktree changes |
| Custom Cabinet version/tag | `1.65.0`, no release candidate |
| Upstream Cabinet tag/SHA | `v1.65.0` / `b866bebeeb6032db4baa3869a4917316fe8e0453` |
| Upstream Bot tag/SHA | Not recorded; compatibility verification blocked |
| Release Bundle candidate | `not scheduled` |
| Staging artifact checksum | Not available |
| Rollback Release Bundle | Not recorded |

The worktree is not a valid Release candidate: it contains uncommitted source
changes, including an independently modified `AGENTS.md`. Staging and Release
approval are blocked until source ownership and exact versions are fixed.

## Environment

| Item | Value |
| --- | --- |
| Local URL | `http://127.0.0.1:5173` |
| Audit time | `2026-08-17T11:21:11+03:00` |
| Browser build | Playwright Chromium `151.0.7922.34` |
| Telegram clients | Not available |
| Enabled themes | Dark and light |
| Checked locales | English; Russian and forced Persian RTL on critical routes |
| Operator palette | Local blue `#3b82f6` fixture |
| API mode | Fully local Playwright interception; all external and write requests blocked |

Local evidence is outside the repository:

```text
C:\Users\DMITRY\AppData\Local\Temp\opencode\custom-cabinet-full-ui-audit\
```

The evidence directory contains `live-ui-audit.json` and 178 local screenshots.
Screenshots are not part of the repository or a Release Bundle.

## Change Scope

The checked worktree includes the current Dashboard restructuring, denser shared
Card/Bento/StatCard surfaces, Devices overlay redesign and related responsive
tests. The audit additionally reviews every non-admin route declaration in
`src/App.tsx` for hierarchy, responsive layout, touch targets, accessible names,
form labels, loading/error states, theme behavior and localization.

## Automated Gate

| Command | Result | Notes |
| --- | --- | --- |
| `npm ci` | NOT RUN | Existing `node_modules` used; no dependency or lockfile operation requested |
| `npm run check` | PASS | Exit 0; 274 warnings (including ignored audit-harness warnings) and 102 infos remain |
| `npm test` | PASS | 135 tests passed |
| `npm run type-check` | PASS | `tsc --noEmit` |
| `npm run build` | PASS | Vite production build completed |
| Browser automation | PASS | `npm run test:e2e -- --workers=4`: 57 passed |
| Route UI matrix | PASS | 49 route declarations and 178 screenshots completed; UI findings are recorded below |
| `git diff --check` | PASS | No whitespace errors |

## Test Accounts and Data

| Alias | State | Result/limitation |
| --- | --- | --- |
| `guest` | Not authenticated | Public visual/error states checked with local fixtures |
| `new-user` | No subscription | Covered by existing browser fixtures; no real registration |
| `trial-user` | Trial | Covered by existing E2E state test |
| `active-user` | Active subscription | Main route matrix state |
| `expired-user` | Expired/limited | Covered by existing E2E state tests |
| `multi-user` | Multiple subscriptions | Covered by existing E2E selector test |
| `full-admin` | Full permissions | BLOCKED; no admin account/staging scope |
| `restricted-admin` | Restricted permissions | BLOCKED; no role fixture/staging scope |

## Local Route Results

Every non-admin route declaration was opened at `1280x800` dark and `320x568`
light. Critical routes were additionally checked at exact `375x812`,
`768x1024`, `1024x768` and `1440x900` viewports in both themes. Critical routes
also received Russian and Persian RTL mobile captures. All contexts emulated
`prefers-reduced-motion: reduce`.

| Route declaration | Local result | UI/UX result or limitation |
| --- | --- | --- |
| `/login` | FAIL | Several primary/mobile controls are 30-40 px high; legal links are small and faint |
| `/auth/telegram/callback` | FAIL | Error state exposes raw key `auth.telegramRequired`; success requires Telegram signature |
| `/auth/telegram` | BLOCKED | Safe redirect to Login checked; real Mini App init data unavailable |
| `/tg` | BLOCKED | Safe redirect to Login checked; real Mini App init data unavailable |
| `/connect` | BLOCKED | Missing-link recovery checked; real app scheme not opened |
| `/add` | BLOCKED | Missing-link recovery checked; real app scheme not opened |
| `/auth/oauth/callback` | BLOCKED | Error and return-to-login state checked; provider exchange unavailable |
| `/verify-email` | FAIL | Error state exposes raw key `common.error`; valid token unavailable |
| `/reset-password` | PASS | Form fits desktop/mobile; real reset mutation not submitted |
| `/offer` | PASS | Short safe document renders in both themes; long production content not verified |
| `/privacy` | PASS | Short safe document renders in both themes; long production content not verified |
| `/recurrent-payments` | FAIL | Mobile heading competes with absolutely positioned language selector |
| `/merge/:mergeToken` | FAIL | Cancel target is too small for a destructive/sensitive decision |
| `/buy/success/:token` | PASS WITH RISKS | Safe status state renders; webhook/polling lifecycle not verified |
| `/buy/gift/:token` | PASS WITH RISKS | Claim view renders; real claim and alternate states blocked |
| `/coupon/:token` | FAIL | Guest instruction has no Login CTA and fixture has no bot link: dead end |
| `/buy/:slug` | FAIL | Sticky mobile Pay layer covers content and does not account for safe-area inset |
| `/auto-login` | FAIL | Invalid-token state has no semantic heading; success token unavailable |
| `/` | FAIL | At 320 px traffic is clipped; three stats truncate; bottom nav covers useful first-screen data |
| `/subscriptions` | FAIL | Same unified Dashboard mobile defects as `/` |
| `/subscriptions/:subscriptionId` | FAIL | Heading hierarchy, small back/switch targets and low-contrast support text |
| `/subscriptions/:subscriptionId/renew` | FAIL | Unnamed 40 px back control; choice affordance and error-state clarity are weak |
| `/subscription/:subscriptionId` | PASS | Redirect to canonical `/subscriptions/:subscriptionId` confirmed |
| `/subscription` | PASS | Redirect to canonical `/subscriptions` confirmed |
| `/subscription/purchase` | FAIL | Unnamed 40 px back control and repeated heading/CTA; expanded wizard needs separate interaction audit |
| `/balance` | FAIL | Promo input lacks a programmatic label; request failures can appear as real zero/empty values |
| `/balance/saved-cards` | FAIL | Empty state is clear, but back control has no accessible name and is 40 px |
| `/balance/top-up` | FAIL | Payment-method API error has no explicit recovery; one 1024 capture showed unstable dimming |
| `/balance/top-up/result` | PASS WITH RISKS | Success state clear; local Chromium logs expected `navigator.vibrate` warning |
| `/balance/top-up/result/:method` | PASS WITH RISKS | Same as query-method result route |
| `/balance/top-up/:methodId` | PASS WITH RISKS | Amount flow is clear; no real provider navigation performed |
| `/referral` | FAIL | Mobile money values truncate; URL field unlabeled; API errors are masked as zeros/empty lists |
| `/referral/partner/apply` | FAIL | Long form lacks semantic grouping and mobile navigation covers content during scroll |
| `/referral/withdrawal/request` | PASS WITH RISKS | Visual form is clear; financial mutation not submitted |
| `/support` | FAIL | Two competing empty states; query/mutation errors are not surfaced reliably |
| `/profile` | FAIL | Several controls lack associated labels; mobile email breaks awkwardly; Share loses its name |
| `/profile/accounts` | PASS WITH RISKS | Read-only account list clear; linking/unlinking blocked |
| `/auth/link/telegram/callback` | BLOCKED | Failure redirect checked; signed callback and CSRF flow unavailable |
| `/contests` | FAIL | Route card fits, but custom fixed game dialog lacks canonical portal/focus/accessibility contract |
| `/polls` | FAIL | Route card fits, but custom fixed dialog is at risk from `main` containment and small close target |
| `/info` | FAIL | Mobile horizontal tabs hide later sections without a clear scroll affordance |
| `/wheel` | FAIL | Floating nav covers the primary Spin action in the initial 320 px viewport |
| `/gift` | FAIL | Floating nav covers balance context; toast shares nav z-index; tabs are only 40 px high |
| `/gift/result` | PASS WITH RISKS | Safe result state clear; real payment status/polling blocked |
| `/connection/qr` | BLOCKED | Direct route correctly redirects without required `location.state`; QR state not rendered |
| `/connection` | PASS WITH RISKS | Web layout and RTL mirror correctly; external app/deep-link behavior blocked |
| `/news/:slug` | FAIL | Read-time metadata omits its value and Back behavior is unsafe for direct deep links |
| `/info/:slug` | PASS WITH RISKS | Content fits; direct-link Back behavior remains history-dependent |
| `*` | PASS WITH RISKS | Redirect to Dashboard works, but no explicit 404 state is presented |

## Functional Results

| Area | Result | Checked scenarios | Defects/limitations |
| --- | --- | --- | --- |
| Runtime smoke | PASS | Initial load, lazy routes, themes, local API interception | Staging assets/headers/health not checked |
| Web authentication | BLOCKED | Login/reset/error screens | No real login, registration, email or OAuth provider |
| Telegram authentication | BLOCKED | Non-Telegram fallback only | No test bot or real client |
| Dashboard | FAIL | Active/trial/expired/limited/multi states and route matrix | `LC-001`, `LC-002` |
| Subscription/purchase | FAIL | Management, renewal and purchase entry states | `LC-007`, `LC-009`, `LC-011` |
| Balance/payments | FAIL | Read-only balance/top-up/result states | `LC-003`, `LC-010`; no sandbox provider |
| Connection | PASS | Overlay, platform selection, Back model | Real app schemes and Telegram external navigation blocked |
| Profile/accounts | FAIL | Profile and linked-account read-only states | `LC-008`, `LC-009`, `LC-016` |
| Support/notifications | FAIL | Empty ticket view and direct route | `LC-005`; WebSocket and attachments blocked |
| Optional features | FAIL | Referral, gift, wheel, info, news, contests, polls | `LC-004`, `LC-006`, `LC-012`-`LC-018` |
| Admin | BLOCKED | Not included in non-admin route matrix | No full/restricted admin staging users |

## Platform and Visual Results

| Matrix | Result | Coverage | Defects/limitations |
| --- | --- | --- | --- |
| Responsive | FAIL | `320/375/768/1024/1280/1440` | Mobile clipping, truncation and primary-action overlap |
| Dark theme | FAIL | Every route at 1280; critical routes full matrix | Very faint 9-11 px secondary text remains |
| Light theme | FAIL | Every route at 320; critical routes full matrix | Mobile layout findings remain |
| Operator palette | PASS locally | Blue fixture | Arbitrary production palettes not sampled |
| Russian | FAIL | Critical mobile routes | Dashboard financial/device values truncate |
| English | FAIL | Full route matrix | Defects listed above |
| RTL | BLOCKED | Forced Persian on critical mobile routes | Mirroring works, but Persian was not available through the fixture language picker |
| Desktop Chromium | PASS | Chromium `151.0.7922.34` | UI findings remain |
| Desktop Firefox | BLOCKED | Browser binary unavailable | Playwright Firefox not installed |
| Android Telegram | BLOCKED | Not available | Viewport emulation is not a replacement |
| iOS Telegram | BLOCKED | Not available | Safe area, keyboard and native Back unverified |
| Mobile browser | FAIL | 320/375 Chromium emulation | `LC-001`, `LC-006`, `LC-007`, `LC-012` |

## Accessibility Results

| Check | Result | Notes |
| --- | --- | --- |
| Keyboard critical flow | BLOCKED | Existing E2E covers Escape/focus return; full keyboard-only purchase/login not completed |
| Visible focus/order | BLOCKED | No systematic screen-reader/focus-order pass across all routes |
| Accessible names | FAIL | Unnamed back, Share and support/game controls |
| Forms/errors | FAIL | Unassociated fields and missing API/mutation error surfaces |
| Dialog/Sheet focus | PASS for canonical overlays | Subscription/Devices overlays pass Escape and focus return; custom contest/poll dialogs fail contract |
| Navigation current state | PASS | Core navigation uses `aria-current` |
| Zoom 200% | BLOCKED | Reliable browser zoom automation not available in this run |
| Reduced motion | PASS locally | All 178 contexts used reduced-motion emulation |
| Non-color status communication | BLOCKED | Main statuses include text; not every optional state opened |
| Screen reader smoke | NOT AVAILABLE | No screen reader environment |

## Failure and Recovery Results

| Case | Result | Notes |
| --- | --- | --- |
| Backend unavailable | FAIL | Dashboard critical data errors covered by E2E; other pages mask failures |
| Slow/offline network | BLOCKED | Not run across complete route matrix |
| 401/403 | BLOCKED | Safe invalid auto-login 401 checked; protected refresh/403 not complete |
| 422/429/500 | BLOCKED | No complete recovery matrix |
| WebSocket reconnect | BLOCKED | No Upstream Bot/staging WebSocket |
| Stale chunk after deploy | BLOCKED | No deploy artifact |
| Double submit protection | BLOCKED | Existing code/tests cover selected flows only |
| Interrupted external return | BLOCKED | No sandbox payment provider |

## Defects

| ID | Severity | Route/platform | Reproduction | Expected | Actual | Release blocker |
| --- | --- | --- | --- | --- | --- | --- |
| `LC-001` | High | `/`, `/subscriptions`, mobile | Open active Dashboard at 320 or Russian 375 | Traffic and key stats remain readable | Traffic and amounts are clipped/truncated; three fixed columns are too narrow | Yes for mobile approval |
| `LC-002` | High | Dashboard mobile | Open active Dashboard at 320 | Useful first-screen stats remain unobscured | Floating nav covers the stats row | Yes for mobile approval |
| `LC-003` | High | `/balance` | Fail balance/history requests | Explicit unavailable/error state with retry | Balance can look like real `0`; history can look genuinely empty | Yes |
| `LC-004` | High | `/referral` | Fail referral/withdrawal requests | Preserve last data or show error/retry | Financial data becomes zero/empty or disappears | Yes |
| `LC-005` | High | `/support` | Fail list/detail/create/reply request | Clear local error and retry/send failure | Empty state or no visible mutation failure | Yes |
| `LC-006` | High | `/contests`, `/polls` | Open custom fixed modal on keyboard/mobile | Canonical portal, dialog semantics, focus trap, Escape, 44 px close | Raw fixed modal inside contained `main`; missing/small controls | Yes |
| `LC-007` | High | Telegram/verify callbacks | Open callback without valid payload | Localized actionable error | Raw `auth.telegramRequired` / `common.error` keys | Yes |
| `LC-008` | High | `/buy/:slug`, mobile | Open at 320 with sticky CTA | CTA respects safe area and does not hide current section | Fixed CTA covers payment context and lacks safe-area padding | Yes for mobile purchase |
| `LC-009` | Medium | renew/purchase/saved cards | Focus icon-only Web back button | 44 px target with accessible name | `40x40`, no `aria-label` | No |
| `LC-010` | Medium | `/profile`, `/referral`, `/balance` | Inspect controls with screen reader | Every field has associated label | Several inputs/selects are visually but not programmatically labelled | No |
| `LC-011` | Medium | `/subscription*`, Dashboard dark | Read secondary data | Supporting text remains legible | 9-11 px text at roughly 20-30% opacity | No |
| `LC-012` | Medium | `/wheel`, `/gift`, mobile | Open at 320 | Primary action/financial context visible above nav | Nav covers Spin or balance context in initial viewport | No |
| `LC-013` | Medium | `/info`, mobile | Open with all tabs enabled | Hidden tabs have clear scroll/overflow affordance | Later tabs are clipped with no obvious cue | No |
| `LC-014` | Medium | `/coupon/:token`, guest | Open valid coupon without bot link | Direct Login/recovery CTA | Instruction text only; no action | No |
| `LC-015` | Medium | `/recurrent-payments`, 320 | Open English page | Heading and language selector do not collide | Long title occupies selector area | No |
| `LC-016` | Medium | `/profile`, mobile | View email row at 320/375 | Identity remains readable/copyable | Email breaks inside the domain beside badge/action | No |
| `LC-017` | Medium | `/support`, mobile empty | Open with zero tickets | One concise empty state and primary CTA | Two large competing empty panels | No |
| `LC-018` | Low | `/news/:slug` | Open article | Complete date/read-time metadata | Empty category chip and `min read` without a number | No |
| `LC-019` | Low | `*` | Open unknown URL | Explain not-found state or intentional redirect | Silent redirect to Dashboard | No |

Relevant source locations include:

- `src/components/dashboard/StatsGrid.tsx:34`
- `src/components/layout/AppShell/MobileBottomNav.tsx:37`
- `src/pages/Balance.tsx:30`
- `src/pages/Referral.tsx:64`
- `src/pages/Support.tsx:98`
- `src/pages/Contests.tsx:81`
- `src/pages/Polls.tsx:115`
- `src/pages/QuickPurchase.tsx:553`
- `src/components/WebBackButton.tsx:21`
- `src/pages/Info.tsx:351`
- `src/pages/CouponStatus.tsx:150`

## Residual Risks

- Upstream Bot exact tag/SHA is unknown, so API/runtime compatibility is not verified.
- The checked worktree is dirty and is not a reproducible Release candidate.
- No HTTPS staging URL, artifact checksum or rollback Release Bundle exists.
- Real Telegram iOS/Android, Mini App safe areas, native Back/Close and software
  keyboard behavior are unverified.
- OAuth, email, account merge, payment, gifts, referral withdrawal, contest and
  poll mutations were intentionally not submitted.
- Firefox, screen reader and reliable 200% browser zoom checks were unavailable.
- Long production legal/news/info content and external media were replaced by
  short safe fixtures.
- Admin routes require a separate full/restricted permission audit.

## Staging Decision

Result: `BLOCKED`

Reason:

```text
The local UI matrix completed, but high-severity mobile, error-state and
accessibility defects remain. Full staging approval is additionally blocked by
unknown Upstream Bot identity, an uncommitted worktree, missing staging/rollback
artifacts and unavailable real Telegram clients.
```

Release owner approval for `PASS WITH RISKS`: not applicable.

## Production Smoke

Status: `NOT STARTED`

| Check | Result | Notes |
| --- | --- | --- |
| Health/assets | BLOCKED | No production candidate |
| Telegram Login | BLOCKED | No test/production Telegram check authorized |
| Dashboard | BLOCKED | Local UI defects remain |
| Existing subscription | BLOCKED | No compatible live Upstream Bot identified |
| Connection read-only | BLOCKED | No real Mini App/app-scheme environment |
| Balance read-only | BLOCKED | No staging account |
| Admin read-only | BLOCKED | No admin staging account |
| Logs/error rate | BLOCKED | No staging/production observability access |

## Rollback

Rollback required: `No deploy performed`<br>
Rollback Release Bundle: `not recorded`<br>
Rollback result: `NOT NEEDED`<br>
Post-rollback health/Login: `not applicable`

## Final Sign-off

- [x] Current source and upstream baseline recorded.
- [x] Local automated gate completed.
- [x] Every non-admin route declaration opened through the safe local harness.
- [x] Local evidence contains no production credentials or personal data.
- [ ] Clean committed Release candidate recorded.
- [ ] Compatible Upstream Bot exact tag/SHA recorded.
- [ ] Required staging flows completed.
- [ ] Telegram real-device checks completed.
- [ ] Release blockers resolved.
- [ ] Rollback source verified.
- [ ] Production smoke completed.

Final result: `BLOCKED`
