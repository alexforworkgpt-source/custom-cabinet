# Live Check Report: `bundle-v2026.10.03.1`

Status: **PASS WITH RISKS — bounded release-package check**<br>
Date: `2026-10-03`<br>
Checker: Codex<br>
Release owner: DMITRY

This report follows `LIVE_CHECK_REPORT_TEMPLATE.md`. The full authenticated
staging/device matrix remains **BLOCKED**, as recorded in the accepted
compatibility limitations. Mock checks and disposable installation do not close
those limitations. Detailed evidence: [release completion](design-release-20261003.1.md).

## Source Identity

| Item | Exact value |
| --- | --- |
| Custom Cabinet commit | `3b6255597f5ad5270136dd1f683fed980b925a66` |
| Custom Cabinet version/tag | `cabinet-v2026.10.03.1` |
| Upstream Cabinet tag/SHA | `v1.79.0` / `821c7b71823573a756de00418acb25118ede1c9c` |
| Upstream Bot tag/SHA | `v4.15.0` / `877690a7039d1326b2c00eda3e297879b80c0678` |
| Release Bundle | `bundle-v2026.10.03.1`, stable |
| Artifact SHA-256 | `e8a1569f8c23de862b87efc726f14a8247c26327f8bcf2ae4160979845b80a20` |
| Rollback Release Bundle | `bundle-v2026.10.02.1` |

## Environment

| Item | Value |
| --- | --- |
| Test installation | Disposable Ubuntu 24.04, isolated HTTPS; endpoint retained privately in test configuration |
| Installation date | 2026-10-03; temporary installation removed after successful checks |
| Browser | System Chrome through repository Playwright harness; exact browser build not recorded |
| Telegram clients | Not available; real-device checks BLOCKED |
| Themes / locales | Dark, light, operator palette; RU, EN, FA |

## Change Scope

Classic prices, purchase/renewal cards and layout, renewal routing, Dashboard
trial badge. Existing trial continuation card and management action retained.
API, types, config, dependencies, upstream attribution and Backend unchanged.
Review corrected discounted-card text overlap and active-subscription hint.

## Automated Gate

| Command / gate | Result | Notes |
| --- | --- | --- |
| `npm ci` | PASS | Clean exact-source Linux publication job |
| `npm run check` | PASS | No errors; existing warnings retained |
| `npm test` | PASS | 1006 frontend cases on each Node 24/26 |
| `npm run type-check` | PASS | Exact source |
| `npm run build` | PASS | Exact source; public artifact independently verified |
| Publication tests | PASS | 15 on each Node 24/26; Bundle: 141 contract cases |
| Scoped browser automation | PASS | 117 source cases and 117 public-artifact cases; six additional trial checks |
| Original broader browser suite | FAIL, pre-existing assertions | 72 PASS, two intentional skips, three FAIL; reproduced on exact previous stable |
| Current-contract comparison | PASS | Four cases in temporary copy; only decimal label/border expectations adjusted |
| CodeQL | PASS job; existing findings | 32 open alerts before and after; no new IDs |

## Test Accounts and Data

Guest/new/trial/active/expired/multi subscription states use synthetic fixtures,
not real account credentials. Full/restricted-admin live permissions checks
remain BLOCKED. No real payment or subscription mutation was performed.

## Functional Results

| Area | Result | Coverage / limitation |
| --- | --- | --- |
| Runtime smoke | PASS | Public Bundle fresh installation, three healthy containers, health/assets/branding and cleanup |
| Web authentication | BLOCKED live | Browser session injected only by existing mock harness |
| Telegram authentication | BLOCKED | No physical Telegram evidence |
| Dashboard | PASS mock / BLOCKED live | Trial badge, original continuation card and action |
| Subscription/purchase | PASS mock / BLOCKED live | Navigation, period amounts, payload, selection, inline CTA and layout |
| Balance/payments | PASS mock / BLOCKED live | Read-only fixture data and payment selection; provider lifecycle not checked |
| Connection | BLOCKED live | No physical application/deep-link proof |
| Profile/accounts | BLOCKED live | No authenticated staging account flow |
| Support/notifications | BLOCKED live | No real ticket, attachment or notification mutation |
| Optional features | NOT ENABLED for release proof | BSCHEKER and Simple/Lite Mode excluded |
| Admin | BLOCKED live | Broader fixture checks do not prove real permissions |

## Platform and Visual Results

| Matrix | Result | Coverage / limitation |
| --- | --- | --- |
| Responsive | PARTIAL | 320/375/768/1024/1280 PASS in scoped browser checks; full 1440 matrix not rerun |
| Dark / light / operator palette | PASS scoped | Classic and renewal components, selected cards and CTA |
| Russian / English / RTL | PASS scoped | RU/EN/FA fixture cases |
| Desktop Chromium | PASS scoped | Actual downloaded public artifact |
| Desktop Firefox | BLOCKED | Independent engine not checked |
| Android / iOS Telegram | BLOCKED | Physical clients not checked |
| Mobile browser | BLOCKED physical | Viewport emulation passed; physical browser not checked |

## Accessibility Results

Full keyboard/focus, screen-reader, 200% zoom and reduced-motion matrix remains
BLOCKED. Existing component semantics were retained; this is not evidence that
the full accessibility gate passed.

## Failure and Recovery Results

Double-submit protection: PASS in bounded mock purchase checks. Full unavailable
backend, offline/slow network, 401/403/422/429/500, WebSocket recovery, stale chunk
and interrupted external return matrix: BLOCKED live. No production failure or
recovery was induced.

## Defects

| ID | Severity | Scope | Finding | Resolution / blocker |
| --- | --- | --- | --- | --- |
| DESIGN-001 | Low | Classic/renewal, 320 px | Discount badge overlapped duration text | Corrected; geometry regression checks PASS |
| DESIGN-002 | Medium | Active tariff CTA | Expired hint appeared for active subscription | Corrected; failing unit cases then PASS |
| BASELINE-ASSERTIONS | Low | Original broader browser tests | Decimal price label and selected mobile border expectations are stale | Same three failures on previous stable; no new product regression identified |

## Residual Risks

The existing accepted limitations remain OPEN/BLOCKED: Classic auto-purchase,
unused legacy email wrapper, full response-field parity/authenticated staging,
physical Telegram/accessibility, real payment/renewal/concurrency/panel flows.
Their owner remains the Release owner. No Backend change is part of this release.
See exact bounded compatibility evidence linked in the completion report.

## Staging Decision

Bounded package result: **PASS WITH RISKS**. Full authenticated staging result:
**BLOCKED**. Owner authorization on 2026-10-03 covers the new release package,
test installation and stable promotion; existing accepted limitations were
retained in the reviewed promotion record. No absent live check is marked PASS.

## Production Smoke

Status: **NOT STARTED**. Production health, Telegram Login, Dashboard, existing
subscription, Connection, Balance, Admin and logs were not checked in this task.
The user explicitly excluded production changes.

## Rollback

Rollback required: No — production not changed.<br>
Rollback Release Bundle: `bundle-v2026.10.02.1`.<br>
Rollback result: NOT NEEDED. Previous immutable public release preserved;
production state and fresh off-host backup must be verified in the separately
authorized transition.

## Final Sign-off

- [x] Exact source versions and artifact recorded.
- [x] Source/publication/scoped browser gates passed.
- [ ] Full authenticated staging flows completed — BLOCKED.
- [ ] Physical Telegram and accessibility completed — BLOCKED.
- [x] Newly found source defects corrected and checked.
- [x] Existing accepted limitations retained in reviewed promotion evidence.
- [x] Previous immutable rollback release preserved.
- [x] Report contains no credentials or personal account data.
- [x] Production smoke explicitly NOT STARTED.

Final result: **PASS WITH RISKS for package; full live matrix BLOCKED**.
