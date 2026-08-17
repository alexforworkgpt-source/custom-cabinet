# UI/UX LC Re-audit: `2026-08-18`

Status: `FAIL`<br>
Date: `2026-08-18`<br>
Checker: `OpenCode`<br>
Release owner: `workspace owner`

## Scope

This report re-evaluates only `LC-001` through `LC-019` from
[`LIVE_CHECK_REPORT_2026-08-17_LOCAL_UI_UX.md`](LIVE_CHECK_REPORT_2026-08-17_LOCAL_UI_UX.md).
The original report remains the canonical source for reproduction steps,
expected behavior and old screenshots. Those details are not duplicated here.

## Source Identity

| Item | Exact value |
| --- | --- |
| Original audit baseline | `b23d9289067d71c5eaeb379b2a0f1aad382ad619` plus its recorded dirty worktree |
| Current Custom Cabinet HEAD | `b6b97e2daffa0eb954bb5b58714597112dc6089c` |
| Current comparison | HEAD plus uncommitted Connection action-layout and Dashboard traffic-layout changes |
| Latest published Release Bundle | `v2026.08.11`; it does not contain the current uncommitted changes |
| Upstream Cabinet baseline | `v1.65.0` / `b866bebeeb6032db4baa3869a4917316fe8e0453` |
| Compatible Upstream Bot used by `v2026.08.11` | `v4.0.0` / `f553d1896dcd347fd74012f6394fd2277161bdd1` |

The worktree is not a Release candidate. Owner-controlled changes in `AGENTS.md`
and `LIVE_CHECK_REPORT_2026.08.9.md` were not inspected or modified by this
re-audit.

## Method

- Compared current implementations and tests with `b23d928`.
- Re-ran the full current Playwright suite: `63 passed`, `1 expected skip`.
- Re-ran the focused Connection flow at 320 and 1280 px.
- Reproduced and fixed the long Russian traffic-value overflow at 420 px.
- Reviewed exact error, accessibility and responsive branches for every LC.
- Used only local fixtures and blocked real external requests and backend writes.

Passing the general browser suite does not close an LC when its exact failure
state, geometry or accessible-name criterion is not asserted by that suite.

## Summary

| Status | Count |
| --- | ---: |
| Fixed | 1 |
| Partial | 2 |
| Open | 16 |
| Blocked | 0 |

## Current Statuses

| ID | Status | Current evidence |
| --- | --- | --- |
| `LC-001` | `PARTIAL` | The long top-right traffic value now remains inside the Dashboard card at 420 px, but `StatCard` still truncates financial values at mobile widths (`src/components/stats/StatCard.tsx`). |
| `LC-002` | `FIXED` | AppShell reserves mobile bottom space and the active Dashboard statistics end above MobileBottomNav. Focused 320 px geometry has a positive gap. |
| `LC-003` | `OPEN` | `/balance` still ignores query errors, so failed balance/history requests can render as real zero or empty history (`src/pages/Balance.tsx`). |
| `LC-004` | `OPEN` | Referral financial queries still omit explicit error/retry states and can collapse to zero, empty or hidden data (`src/pages/Referral.tsx`, `ReferralWithdrawalRequest.tsx`). |
| `LC-005` | `OPEN` | Support config/list/detail/create/reply failures still lack complete local error and retry feedback (`src/pages/Support.tsx`). |
| `LC-006` | `PARTIAL` | Polls has some dialog semantics, focus handling and Escape support; it still lacks the canonical portal/44 px close contract. Contests still lacks the canonical dialog contract (`src/pages/Polls.tsx`, `Contests.tsx`). |
| `LC-007` | `OPEN` | Callback translations exist, but async locale loading can still freeze raw keys in component state (`src/i18n.ts`, `TelegramCallback.tsx`, `VerifyEmail.tsx`). |
| `LC-008` | `OPEN` | QuickPurchase still uses `fixed bottom-0` with fixed spacing and no bottom safe-area compensation (`src/pages/QuickPurchase.tsx`). |
| `LC-009` | `OPEN` | `WebBackButton` remains 40x40 px and has no accessible name (`src/components/WebBackButton.tsx`). |
| `LC-010` | `OPEN` | The audited Profile, Referral and Balance fields still lack associated programmatic labels. Recent Profile button labels do not close these field defects. |
| `LC-011` | `OPEN` | Dashboard and Subscription still contain the audited 9-11 px, 20-30% opacity supporting text combinations. |
| `LC-012` | `OPEN` | Wheel and Gift received no targeted fix or regression test for primary-action/balance overlap with MobileBottomNav under full configurations. |
| `LC-013` | `OPEN` | Info tabs still hide the scrollbar without a gradient, arrow or other continuation cue (`src/pages/Info.tsx`). |
| `LC-014` | `OPEN` | A guest coupon without `bot_link` still shows instruction text without a Login/recovery CTA (`src/pages/CouponStatus.tsx`). |
| `LC-015` | `OPEN` | PublicLegal still absolutely positions the language switcher over the mobile title area (`src/pages/PublicLegal.tsx`). |
| `LC-016` | `OPEN` | Profile still keeps email, badge and related content in a competing row and uses `break-all` for the address (`src/pages/Profile.tsx`). |
| `LC-017` | `OPEN` | Support still renders both the no-tickets state and the select-ticket state for an empty list (`src/pages/Support.tsx`). |
| `LC-018` | `OPEN` | NewsArticle still renders category/read-time metadata without guarding missing values (`src/pages/NewsArticle.tsx`). |
| `LC-019` | `OPEN` | The catch-all route still silently redirects to Dashboard instead of presenting an explicit not-found state (`src/App.tsx`). |

## What Changed Since The Original Audit

1. `LC-002` is closed by the denser Dashboard, removal of the third statistic
   card and reserved AppShell space above MobileBottomNav.
2. `LC-001` improved, but remains partial because full financial values can still
   be truncated on narrow screens.
3. `LC-006` remains partial rather than fixed: Polls already contains some
   accessibility behavior, while the full canonical overlay contract is still
   missing and Contests remains open.
4. No implementation change after `b23d928` closes `LC-003`-`LC-005`,
   `LC-007`-`LC-019`.

## Recommended Order

1. Fix `LC-003`, `LC-004` and `LC-005`: false financial/empty states and silent
   support failures can mislead users about real data.
2. Fix `LC-008`: the unresolved mobile purchase CTA can block payment context.
3. Finish `LC-001`: preserve complete amounts and traffic values at 320/375 px.
4. Finish `LC-006` and `LC-007`: canonical dialogs and localized callback errors.
5. Address accessibility and readability in `LC-009`-`LC-011`.
6. Complete the remaining focused UX fixes `LC-012`-`LC-019`.

## Decision

Local UI acceptance remains `FAIL`: one defect is fixed, but high-severity data,
purchase and dialog defects remain open. This re-audit is not a staging or
production approval and does not change the `v2026.08.11` Release Bundle.

Рекомендуемый уровень рассуждения для следующей задачи: высокий — при исправлении
нужно разделить реальные ошибки данных, адаптивную геометрию и доступность на
независимые проверяемые изменения.
