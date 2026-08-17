# Live Check Report: `v2026.08.7`

Status: `BLOCKED`<br>
Date: `2026-08-17`<br>
Checker: `OpenCode with release owner`<br>
Release owner: `workspace owner`

## Source Identity

| Item | Exact value |
| --- | --- |
| Custom Cabinet commit | `307b2271fb77f8691db6ad017838f61fe4dc8929` |
| Custom Cabinet version/tag | Release Bundle candidate `2026.08.7` |
| Upstream Cabinet tag/SHA | `v1.65.0` / `b866bebeeb6032db4baa3869a4917316fe8e0453` |
| Upstream Bot tag/SHA | `f553d1896dcd347fd74012f6394fd2277161bdd1` |
| Release Bundle candidate | `v2026.08.7` |
| Staging artifact checksum | `sha256:b6f95609f0adf7f3802f74a735745d5063c9fce53882cc06db6b5ae64a9223a8` |
| Rollback Release Bundle | `v2026.08.6` |

## Environment

| Item | Value |
| --- | --- |
| Staging URL | `https://web.demolanding.click` |
| Deploy time | `2026-08-17T01:55:00+03:00` |
| Browser builds | Chromium `151.0.0.0` on Windows 10 |
| Telegram clients | Browser Telegram OIDC checked; real Mini App clients not checked |
| Enabled themes | Light and dark |
| Checked locales | Russian and English |
| Operator palette | Dynamic Cabinet branding API configuration |

## Change Scope

The candidate changes the shared user navigation and responsive shell, Dashboard,
devices and traffic actions, Profile preferences, themes, and the four-step
Connection flow. It also changes URL-backed dialog state, focus restoration,
platform/application selection, Remnawave app configuration rendering, and
localized Connection copy.

Known limitations are the unavailable real Telegram Mini App clients, incomplete
test-account matrix, and the absence of an authorized sandbox payment run.

## Automated Gate

| Command | Result | Notes |
| --- | --- | --- |
| `npm ci` | NOT RUN LOCALLY | GitHub Release workflow built the Cabinet artifact in a clean runner. |
| `npm run check` | PASS WITH WARNINGS | No new errors; existing repository warnings were recorded. |
| `npm test` | PASS | `134/134` tests passed. |
| `npm run type-check` | PASS | Completed with exit code 0. |
| `npm run build` | PASS | Production build completed with exit code 0. |
| Browser automation | PASS | Playwright `50/50` tests passed across five viewport profiles. |
| Installer release contract | PASS | GitHub Actions run `31977351680` completed successfully. |
| Installer local tests | PASS | `90` tests passed, `5` skipped; release shell gates passed. |
| Public Release asset audit | PASS | Both sidecar checksums matched, manifest validation passed, Installer archive matched `v2026.08.7`, and no private/generated artifacts were present. |

## Test Accounts and Data

No personal identifiers, credentials, cookies, or Telegram init data are recorded.

| Alias | State | Result/limitation |
| --- | --- | --- |
| `guest` | Not authenticated | Login page, branding, legal links, language menu, and public API loading checked. |
| `new-user` | No subscription | BLOCKED: no prepared account. |
| `trial-admin` | Trial subscription and admin access | Dashboard, Connection, Profile, Support, notifications, and admin read-only checks completed. |
| `active-user` | Active paid subscription | BLOCKED: no separate prepared account. |
| `expired-user` | Expired/limited | BLOCKED: no prepared account. |
| `multi-user` | Multiple subscriptions | BLOCKED: no prepared account. |
| `restricted-admin` | Restricted permissions | BLOCKED: no prepared account. |

## Functional Results

| Area | Result | Checked scenarios | Defects/limitations |
| --- | --- | --- | --- |
| Runtime smoke | PASS | HTTPS, assets, direct routes, health, API, console, and network | No unexpected console errors or API failures observed. |
| Web authentication | BLOCKED | Telegram browser OIDC login succeeded | Email/password, invalid input, reset, and other OAuth providers not enabled or not checked. |
| Telegram authentication | BLOCKED | Browser Telegram OIDC callback succeeded | Real Android/iOS/Desktop Mini App init data, Back, Close, and reopen not checked. |
| Dashboard | PASS | Available trial subscription, traffic, devices, purchase and balance entry points | Other subscription states unavailable. |
| Subscription/purchase | BLOCKED | Purchase options and pricing loaded read-only | No tariff submission or sandbox payment performed. |
| Balance/payments | BLOCKED | Balance and payment-method sheet loaded read-only | No payment initiated. |
| Connection | PASS | Four steps, app config, URL state, direct reload, close and focus return | External application install/deep-link execution not checked. |
| Profile/accounts | PASS | Account data, language persistence, light/dark themes, connected-account entry point | Connected-account mutation not performed. |
| Support/notifications | PASS | Empty tickets, support config, desktop bell, mobile admin-menu bell | No ticket created. |
| Optional features | NOT ENABLED | Promo/news/referral configuration loaded | Mutating optional flows not exercised. |
| Admin | PASS | Admin landing, permissions, menu, statistics and mobile shell read-only | No administrative mutation performed. |

## Platform and Visual Results

| Matrix | Result | Coverage | Defects/limitations |
| --- | --- | --- | --- |
| Responsive | PARTIAL | Live `390x844` and `1740x1179`; automation used five profiles | No physical phone/tablet check. |
| Dark theme | PASS | Profile and admin shell | Runtime operator branding overrides some base palette values. |
| Light theme | PASS | Dashboard, Profile, Connection, Support and admin shell | None observed. |
| Operator palette | PASS | Runtime dynamic branding | Base fallback palette was not isolated from operator overrides. |
| Russian | PASS | Login, Dashboard, Connection, Support, Profile | None observed. |
| English | PASS WITH RISK | Dashboard, Connection, Profile and admin | `LC-001`: visible text updates fully after reload, not immediately. |
| RTL | BLOCKED | Not checked | Persian/RTL physical visual pass unavailable. |
| Desktop Chromium | PASS | Chromium `151.0.0.0` | None observed. |
| Desktop Firefox | BLOCKED | Not checked | Browser unavailable in this live session. |
| Android Telegram | BLOCKED | Not checked | Physical client unavailable. |
| iOS Telegram | BLOCKED | Not checked | Physical client unavailable. |
| Mobile browser | PASS | Chromium emulation `390x844` | Physical mobile browser unavailable. |

## Accessibility Results

| Check | Result | Notes |
| --- | --- | --- |
| Keyboard critical flow | PASS | Automated coverage completed; live dialog close restored focus to its trigger. |
| Visible focus/order | PASS | Dialog steps and returned trigger exposed active focus. |
| Accessible names | PASS | Navigation, dialogs, controls, progress and notifications had names in checked routes. |
| Forms/errors | BLOCKED | Mutating forms and validation failures were not submitted live. |
| Dialog/Sheet focus | PASS | Connection, devices and top-up sheets exposed dialog semantics and close controls. |
| Navigation current state | PASS | Desktop and mobile navigation showed the current destination. |
| Zoom 200% | BLOCKED | Not checked live. |
| Reduced motion | PASS | Covered by automated tests; not repeated on a physical device. |
| Non-color status communication | PASS | Subscription and runtime states included text labels. |
| Screen reader smoke | NOT AVAILABLE | No screen reader session was available. |

## Failure and Recovery Results

| Case | Result | Notes |
| --- | --- | --- |
| Backend unavailable | NOT RUN | No staging outage injected after deploy. |
| Slow/offline network | NOT RUN | Not injected in the authenticated live session. |
| 401/403 | PASS | Protected direct route redirected to Login before authentication. |
| 422/429/500 | NOT RUN | No failure injection performed. |
| WebSocket reconnect | NOT RUN | No disconnect injected. |
| Stale chunk after deploy | PASS | Fresh load and direct route reload loaded the published assets. |
| Double submit protection | BLOCKED | No live purchase/payment submission allowed. |
| Interrupted external return | BLOCKED | External payment and VPN application returns not executed. |

## Defects

| ID | Severity | Route/platform | Reproduction | Expected | Actual | Release blocker |
| --- | --- | --- | --- | --- | --- | --- |
| `LC-001` | Low | `/profile`, Chromium | Change Russian to English without reloading | Visible translated labels update immediately | Locale indicator and date update immediately; most labels update after reload | No |

## Residual Risks

- Release owner: provide or explicitly waive Android/iOS/Desktop Telegram Mini App checks.
- Release owner: provide isolated new, paid, expired, multi-subscription and restricted-admin accounts.
- Release owner: authorize a sandbox payment method before purchase/payment can pass.
- Release owner: decide whether delayed language re-render in `LC-001` is acceptable.
- Checker: run Firefox, RTL, 200% zoom, screen-reader and network-failure checks when environments are available.
- Operator: complete and confirm the outstanding initial Remnawave synchronization; API and webhook diagnostics already pass.

## Staging Decision

Result: `BLOCKED`

Reason:

```text
The published artifact, protected staging update, runtime diagnostics and checked
web flows pass. Full release approval remains blocked by mandatory real Telegram
Mini App coverage, missing account states, and the absent sandbox payment run.
```

Release owner approval for `PASS WITH RISKS`:

```text
Not provided.
```

## Production Smoke

Status: `NOT STARTED`

| Check | Result | Notes |
| --- | --- | --- |
| Health/assets | NOT STARTED | Production environment was not identified or changed. |
| Telegram Login | NOT STARTED | Staging browser OIDC only. |
| Dashboard | NOT STARTED | Staging only. |
| Existing subscription | NOT STARTED | Staging only. |
| Connection read-only | NOT STARTED | Staging only. |
| Balance read-only | NOT STARTED | Staging only. |
| Admin read-only | NOT STARTED | Staging only. |
| Logs/error rate | NOT STARTED | Staging only. |

## Rollback

Rollback required: `No`<br>
Rollback Release Bundle: `v2026.08.6`<br>
Rollback result: `NOT NEEDED`<br>
Post-rollback health/Login: `Not applicable; protected update committed successfully`

## Final Sign-off

- [x] Exact source versions recorded.
- [x] Automated gate passed.
- [ ] Required staging flows completed.
- [ ] Telegram real-device checks completed or release is blocked.
- [x] Release blockers explicitly recorded.
- [ ] Residual risks explicitly accepted.
- [x] Rollback source verified.
- [x] Report contains no secrets or personal data.
- [x] Production smoke marked `NOT STARTED` before production deploy.

Final result: `BLOCKED`
