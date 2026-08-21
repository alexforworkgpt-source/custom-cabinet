# Full User UI/UX Audit: `2026-08-18`

Status: `FAIL`<br>
Date: `2026-08-18`<br>
Checker: `OpenCode`<br>
Release owner: `workspace owner`

## Scope

This report covers every user-facing route declaration in the Custom Cabinet.
Admin routes are excluded because the isolated fixture does not provide the
required admin permissions and response schemas. This is a local UI/UX audit,
not staging or production approval.

The comparison point is the current `main` commit plus the intended local UI
changes. The published Release Bundle remains unchanged.

## Source Identity

| Item | Exact value |
| --- | --- |
| Current Custom Cabinet HEAD | `793880e6a106cdc23dff5a2478f61954647dd29a` |
| Current comparison | HEAD plus uncommitted desktop-header and overlay-title changes in five source/test files |
| Product commit in latest Release Bundle | `618e79823a06334d8ab8676cfa477d2b44f12c4e` |
| Latest published Release Bundle | `v2026.08.12` |
| Release URL | <https://github.com/alexforworkgpt-source/installer/releases/tag/v2026.08.12> |
| Upstream Cabinet baseline | `v1.65.0` / `b866bebeeb6032db4baa3869a4917316fe8e0453` |
| Compatible Upstream Bot | `v4.0.0` / `f553d1896dcd347fd74012f6394fd2277161bdd1` |

Owner-controlled changes in `AGENTS.md` and
`LIVE_CHECK_REPORT_2026.08.9.md` were not modified or included in the audit
change.

## Method

- Enumerated all 49 user route declarations from `src/App.tsx`.
- Captured 98 base cases: every route at desktop `1280x800` dark English and
  mobile `320x568` light English.
- Captured 80 additional critical cases across `375`, `768`, `1024` and `1440`
  widths, dark/light themes and Russian/Persian locales.
- Produced 178 local screenshots and one machine-readable audit matrix.
- Inspected public/auth, core Cabinet, account/support and optional/content
  routes as separate review groups.
- Blocked every external request and fulfilled every Cabinet API request from
  local data. No real payment, account mutation, Telegram action or app scheme
  was initiated.
- Kept screenshots and generated audit data outside the repository as local
  working evidence. Case IDs below identify those artifacts without publishing
  them.

`PASS` means the tested local state rendered without a confirmed route-specific
finding. It does not verify a real backend mutation, provider return, Telegram
client or signed callback. `BLOCKED` is never treated as `PASS`.

## Automated Result

| Check | Result | Evidence |
| --- | --- | --- |
| Route declarations | PASS | `49` enumerated |
| Cases/screenshots | PASS | `178` cases and `178` screenshots |
| ErrorBoundary or page crash | PASS | `0` cases |
| Horizontal document overflow | PASS | `0` cases |
| Unexpected API mock | PASS | `0` cases |
| Remaining loading indicator | PASS | `0` cases |
| Failed network request | PASS | `0` cases; external traffic was intentionally fulfilled locally |
| Console messages | PASS WITH NOTE | `6` cases: two expected local `401` messages for invalid auto-login and four Chromium vibration-policy messages on successful top-up result pages |
| Unlabelled icon-only candidate | FAIL | `9` cases on renew, saved cards and mobile Profile |
| Visible form control without programmatic label | FAIL | `26` cases on Balance, Referral and Profile |
| Interactive target below `44x44` | REVIEW REQUIRED | `120` cases; scanner output includes repeated component instances and inline links, but confirms the `40x40` back-button defect and several small controls |

The automated checks establish render stability only. They cannot close error
handling, overlap, contrast, focus-management or information-architecture
findings.

## Route Matrix

The base evidence naming convention is
`all-routes__<route>__<width>x<height>__<theme>__<locale>`.

| Route declaration | Desktop | Mobile | Result | Evidence / reason |
| --- | --- | --- | --- | --- |
| `/login` | Rendered | Rendered | `PASS WITH RISK` | Main controls render, but several controls are 30-40 px high; `all-routes__login__320x568__light__en` |
| `/auth/telegram/callback` | Invalid callback rendered | Invalid callback rendered | `BLOCKED` | No signed Telegram payload; invalid state confirms `LC-007` |
| `/auth/telegram` | Local redirect state | Local redirect state | `BLOCKED` | Real Telegram hand-off blocked |
| `/tg` | Local redirect state | Local redirect state | `BLOCKED` | Real Telegram hand-off blocked |
| `/connect` | Local redirect state | Local redirect state | `BLOCKED` | Real client deep link blocked |
| `/add` | Local redirect state | Local redirect state | `BLOCKED` | Real client deep link blocked |
| `/auth/oauth/callback` | Invalid callback rendered | Invalid callback rendered | `BLOCKED` | No signed OAuth provider return |
| `/verify-email` | Invalid callback rendered | Invalid callback rendered | `BLOCKED` | No real verification token; error localization remains covered by `LC-007` |
| `/reset-password` | Rendered | Rendered | `PASS` | Local token form; no submission; `all-routes__reset-password__320x568__light__en` |
| `/offer` | Rendered | Rendered | `PASS` | Legal document and return action visible |
| `/privacy` | Rendered | Rendered | `PASS` | Legal document and return action visible |
| `/recurrent-payments` | Rendered | Collision at 320 px | `FAIL` | `LC-015`; `all-routes__recurrent-payments__320x568__light__en` |
| `/merge/:mergeToken` | Rendered | Rendered | `PASS` | Read-only merge summary; merge mutation not submitted |
| `/buy/success/:token` | Rendered | Rendered | `PASS` | Safe local purchase result; provider return not verified |
| `/buy/gift/:token` | Rendered | Rendered | `PASS` | Safe local gift result; external continuation blocked |
| `/coupon/:token` | Rendered | Rendered | `FAIL` | `LC-014`; guest state lacks a Login/recovery action when `bot_link` is absent |
| `/buy/:slug` | Rendered | Sticky action overlaps context | `FAIL` | `LC-008`; `all-routes__buy--_slug__320x568__light__en` |
| `/auto-login` | Expected invalid state | Expected invalid state | `BLOCKED` | No valid token; local `401` is expected and the error view has no heading |
| `/` | Rendered | Shell clearance fixed; narrow-value risks remain | `FAIL` | `LC-001`, fixed `LC-002`, `LC-011`; focused `320x568` geometry regression plus `all-routes__root__320x568__light__en` |
| `/subscriptions` | Rendered | Rendered with narrow-value risk | `FAIL` | `LC-001`, `LC-011` |
| `/subscriptions/:subscriptionId` | Rendered | Rendered | `FAIL` | `LC-011`; multiple 9-11 px low-opacity supporting labels |
| `/subscriptions/:subscriptionId/renew` | Rendered | Rendered | `FAIL` | `LC-009`; unlabelled `40x40` web back link in both base cases |
| `/subscription/:subscriptionId` | Redirected | Redirected | `BLOCKED` | Compatibility redirect only; destination is covered separately |
| `/subscription` | Redirected | Redirected | `BLOCKED` | Compatibility redirect only; destination is covered separately |
| `/subscription/purchase` | Rendered | Rendered | `FAIL` | `LC-009`; web back control does not meet the accessible-name/44 px contract |
| `/balance` | Rendered | Rendered | `FAIL` | `LC-003`, `LC-010`; failed queries can look like real zero/empty data |
| `/balance/saved-cards` | Rendered | Rendered | `FAIL` | `LC-009`; unlabelled `40x40` back button |
| `/balance/top-up` | Rendered | Rendered | `PASS` | Local payment-method selection only; no provider initiated |
| `/balance/top-up/result` | Rendered | Rendered | `PASS` | Success view; Chromium vibration-policy message is non-fatal |
| `/balance/top-up/result/:method` | Rendered | Rendered | `PASS` | Success view; Chromium vibration-policy message is non-fatal |
| `/balance/top-up/:methodId` | Rendered | Rendered | `PASS` | Amount form only; payment submission blocked |
| `/referral` | Rendered | Rendered | `FAIL` | `LC-004`, `LC-010`; financial errors and unlabelled link controls |
| `/referral/partner/apply` | Rendered | Rendered | `PASS` | Form layout verified; application mutation not submitted |
| `/referral/withdrawal/request` | Rendered | Rendered | `PASS WITH RISK` | Form labels render; balance error/retry dependency remains in `LC-004` |
| `/support` | Rendered | Duplicate empty states | `FAIL` | `LC-005`, `LC-017`; `all-routes__support__320x568__light__en` |
| `/profile` | Rendered | Email/control defects visible | `FAIL` | `LC-010`, `LC-016`; four unlabelled fields and icon-only Share on mobile |
| `/profile/accounts` | Rendered | Rendered | `PASS` | Read-only linked-account state; OTP/link mutations blocked |
| `/auth/link/telegram/callback` | Invalid callback rendered | Invalid callback rendered | `BLOCKED` | No signed Telegram link callback |
| `/contests` | Rendered | Rendered | `FAIL` | `LC-006`; custom modal lacks canonical dialog/focus/close contract |
| `/polls` | Rendered | Rendered | `FAIL` | Partial `LC-006`; semantics exist, but portal/focus trap/44 px close contract is incomplete |
| `/info` | Rendered | Tabs clip without continuation cue | `FAIL` | `LC-013`; `all-routes__info__320x568__light__en` |
| `/wheel` | Rendered | Primary context reaches fixed nav | `FAIL` | `LC-012`; `all-routes__wheel__320x568__light__en` |
| `/gift` | Rendered | Financial/action context reaches fixed nav | `FAIL` | `LC-012`; `all-routes__gift__320x568__light__en` |
| `/gift/result` | Rendered | Rendered | `PASS` | Safe local result; payment/provider return not verified |
| `/connection/qr` | Redirected | Redirected | `BLOCKED` | Redirect behavior only; no real QR/client hand-off |
| `/connection` | Rendered | Rendered | `PASS` | Local four-step flow and centred overlay title; real app schemes and Telegram clients blocked |
| `/news/:slug` | Rendered | Incomplete metadata visible | `FAIL` | `LC-018`; empty category and read-time values are not guarded |
| `/info/:slug` | Rendered | Rendered | `PASS` | Local article content and back navigation visible |
| `*` | Redirected silently | Redirected silently | `BLOCKED / FAIL` | Redirect itself rendered, but `LC-019` confirms missing explicit not-found state |

## Finding Status

| Status | Count |
| --- | ---: |
| Fixed | 1 |
| Partial | 2 |
| Open | 16 |
| Blocked | 0 |

| ID | Severity | Status | Current evidence and implementation reference |
| --- | --- | --- | --- |
| `LC-001` | High | `PARTIAL` | Long traffic improved, but narrow financial values can still truncate in `src/components/data-display/StatCard/StatCard.tsx:47-55`. |
| `LC-002` | High | `FIXED` | At `320x568`, the focused geometry regression failed with only `18 px` between the last Dashboard content and MobileBottomNav, then passed with `26 px` after `src/components/layout/AppShell/AppShell.tsx:307-309` reserved `7.5rem` plus the bottom safe-area. The test emulates a `34 px` safe-area in `tests/e2e/cabinet-flows.spec.ts:350-386`. |
| `LC-003` | High | `OPEN` | Balance queries do not consume query errors (`src/pages/Balance.tsx:29-35`, `77-95`), while absent balance renders as real zero (`src/pages/Balance.tsx:215-218`). |
| `LC-004` | High | `OPEN` | Referral financial queries omit explicit error/retry states (`src/pages/Referral.tsx:64-119`) and use zero fallbacks (`src/pages/Referral.tsx:260-270`). |
| `LC-005` | High | `OPEN` | Support config/list/detail queries expose loading/data only (`src/pages/Support.tsx:97-130`); create/reply mutations also lack complete visible failure handling. |
| `LC-006` | High | `PARTIAL` | Polls has basic dialog semantics (`src/pages/Polls.tsx:113-139`), but its close target and focus contract remain incomplete. Contests lacks dialog semantics and an accessible close (`src/pages/Contests.tsx:80-91`). |
| `LC-007` | High | `OPEN` | Callback errors are captured as already translated strings before async locale readiness (`src/pages/TelegramCallback.tsx:30-58`, `src/pages/VerifyEmail.tsx:26-59`), reproducing raw translation keys. |
| `LC-008` | High | `OPEN` | QuickPurchase mounts a fixed bottom CTA without safe-area compensation (`src/pages/QuickPurchase.tsx:552-560`). |
| `LC-009` | Medium | `OPEN` | Shared `WebBackButton` remains `40x40` and has no accessible name (`src/components/WebBackButton.tsx:20-30`); Saved Cards repeats the same contract. |
| `LC-010` | Medium | `OPEN` | Audit found 26 unlabeled-control cases on Balance, Referral and Profile. Examples: Balance promo input (`src/pages/Balance.tsx:223-238`), Referral read-only URLs (`src/pages/Referral.tsx:275-315`) and Profile notification controls (`src/pages/Profile.tsx:663-760`). |
| `LC-011` | Medium | `OPEN` | Subscription still uses many 9-11 px labels at 20-35% foreground opacity, including `src/pages/Subscription.tsx:855-917` and `1061-1091`. |
| `LC-012` | Medium | `OPEN` | Shared-shell recheck at `320x568` measured `109.2 px` clearance on Wheel and `26 px` on Gift after the `LC-002` change, but the original primary financial/action-context finding still lacks its own targeted regression evidence. |
| `LC-013` | Medium | `OPEN` | Info hides the horizontal tab scrollbar without a continuation affordance (`src/pages/Info.tsx:743-766`). |
| `LC-014` | Medium | `OPEN` | Coupon guest state renders instruction text instead of Login/recovery CTA when `bot_link` is absent (`src/pages/CouponStatus.tsx:150-171`). |
| `LC-015` | Medium | `OPEN` | Public legal pages place a fixed language selector over the title area (`src/pages/PublicLegal.tsx:59-66`). |
| `LC-016` | Medium | `OPEN` | Profile keeps email and status in one competing row and applies `break-all` (`src/pages/Profile.tsx:408-421`). |
| `LC-017` | Medium | `OPEN` | Empty Support renders both `noTickets` (`src/pages/Support.tsx:420-427`) and `selectTicket` (`src/pages/Support.tsx:703-721`). |
| `LC-018` | Low | `OPEN` | News renders category and read-time metadata without guarding empty values (`src/pages/NewsArticle.tsx:308-364`). |
| `LC-019` | Low | `OPEN` | Catch-all still silently redirects to Dashboard (`src/App.tsx:1424-1425`). |

## Additional Accessibility Signals

These signals are recorded separately from `LC-001`-`LC-019` because the raw
scanner counts repeated component instances and needs component-level
deduplication before becoming a release gate.

1. Confirmed icon-only failures are the shared Web back control, Saved Cards
   back control and the mobile Profile Share action. They appear in 9 matrix
   cases across three routes.
2. Confirmed form-label failures appear in Balance, Referral and Profile. The
   26 case count is repeated across viewports/themes, not 26 unique components.
3. The 120 target-size cases include inline legal links and repeated desktop
   navigation, but also real small controls: `40x40` back buttons, 38 px header
   controls, 40 px primary controls and a 20 px Support attachment remove
   button. These should be deduplicated by component before implementation.
4. A real screen reader pass, keyboard-only focus traversal and physical touch
   test were not available; automated accessible-name and geometry checks are
   not substitutes for those checks.

## Local Changes Verified

The audit includes, but does not release, these local changes:

- Desktop AppShell again exposes theme, language and Logout controls.
- Logout has an accessible name.
- Connection, My Devices, Balance and Top-up overlay titles are geometrically
  centred at `320` and `1280` widths with a 1 px tolerance.
- Dashboard content keeps at least `24 px` above MobileBottomNav at `320x568`,
  including an emulated `34 px` bottom safe-area; measured clearance is `26 px`.
- Existing mobile navigation behavior was intentionally preserved.

Verification already completed for this exact source/test diff:

| Gate | Result |
| --- | --- |
| `npm run check` | PASS; existing warnings only |
| `npm test` | PASS; `137` tests |
| `npm run type-check` | PASS |
| `npm run build` | PASS |
| Playwright | PASS; `68 passed`, `1 expected skip` |
| `git diff --check` | PASS |

## Limitations

- Admin UI is not covered by this user-route fixture.
- Real Telegram Android, iOS and Desktop clients were unavailable.
- Firefox, Safari, physical devices and a screen reader were unavailable.
- Signed callback success paths and authenticated integration state matrices
  were not run.
- Payment provider returns and all real writes were intentionally blocked.
- The integration VPS remains on Release Bundle `v2026.08.12`; production was
  not changed or smoke-tested.

## Decision

Local UI acceptance is `FAIL`. The full route matrix is render-stable, and the
current desktop-header/overlay-centering and `LC-002` diff passes its automated
gate, but 16 open and 2 partial LC findings remain. High-severity data masking,
mobile overlap, callback localization, purchase safe-area and modal-contract
defects must not be represented as resolved by the absence of crashes or
overflow.

Recommended implementation order:

1. Fix `LC-003`-`LC-005` so backend failures cannot look like real financial or
   empty states.
2. Fix `LC-008` separately with a geometry test at `320x568` plus a safe-area
   variant; `LC-002` is fixed by the focused Dashboard shell regression.
3. Finish `LC-001`, `LC-006` and `LC-007` for narrow values, canonical dialogs
   and locale-safe callback errors.
4. Fix `LC-009`-`LC-011`, then deduplicate the broader target-size scanner
   output by shared component.
5. Complete focused UX findings `LC-012`-`LC-019`.
6. Run a separate Admin audit with explicit admin fixtures, then authenticated
   integration and real-device checks without initiating real payments.

Рекомендуемый уровень рассуждения для следующей задачи: очень высокий — первые
исправления затрагивают отображение финансовых ошибок, адаптивную геометрию и
доступность, поэтому их нужно разделить на независимые проверяемые изменения.
