# Live Check Report: `v2026.08.10`

Status: `BLOCKED`<br>
Date: `2026-08-17`<br>
Checker: `OpenCode`<br>
Release owner: `workspace owner`

## Source Identity

| Item | Exact value |
| --- | --- |
| Custom Cabinet commit | `b5b34848b752b0ec66a9ca68b121d4b58264a0c5` |
| Custom Cabinet version/tag | `1.65.0`; Release source is the exact commit above |
| Upstream Cabinet tag/SHA | `v1.65.0` / `b866bebeeb6032db4baa3869a4917316fe8e0453` |
| Upstream Bot tag/SHA | `v4.0.0` / `f553d1896dcd347fd74012f6394fd2277161bdd1` |
| Installer tag/SHA | `v2026.08.10` / `a5af6c72069a98b42e97cfb17ebcf1d59443324f` |
| Release Bundle | `v2026.08.10` |
| Manifest identity | `e23e2e83f050ac0f2e5483854c3f9a7efc1703952ca1585b7a5bfd8f0278afca` |
| Cabinet artifact SHA-256 | `a2988f4fc2460c831a3bd131df54764513a741d0134ecf669bb6b02febac7061` |
| Manifest SHA-256 | `3801430e3dcb20af12fdd9ccfb3dbf1a063fb4de6d1057223f55ab282a12a766` |
| Rollback Release Bundle | `v2026.08.9`; Cabinet `0f9794d48e43e428b6f3d4634b84d82fda0eb0ba` |

Release URL: <https://github.com/alexforworkgpt-source/installer/releases/tag/v2026.08.10>

## Environment

| Item | Value |
| --- | --- |
| Integration URL | `https://web.demolanding.click` |
| Environment type | Disposable integration VPS; not recorded as production |
| Deploy verification time | `2026-08-17T18:42:36Z` |
| Browser build | Playwright Chromium `151.0.7922.34` |
| Telegram clients | Not available |
| Enabled themes | Dark/light covered by local E2E fixtures |
| Checked locales | English, Russian, Persian RTL and Chinese in local E2E |
| Operator palette | Local fixture plus deployed runtime branding API |

## Change Scope

- Moved Devices from Dashboard statistics into subscription management.
- Added Tariffs to desktop and mobile user navigation.
- Removed tariff-selection actions from existing subscription cards while preserving the no-subscription purchase action.
- Compact Profile theme and language controls, including 320 px and Persian RTL handling.
- Restored the animated-background editor under Admin Branding and protected it from saving fallback defaults after load failures.
- Preserved direct routes and browser/Telegram Back behavior for subscription and Devices overlays.

## Automated Gate

| Command or gate | Result | Notes |
| --- | --- | --- |
| Clean dependency install | PASS | Release workflow built the exact Cabinet SHA in pinned clean builder images |
| `npm run check` | PASS | Exit 0; 274 existing warnings and 102 infos remain |
| `npm test` | PASS | 20 files, 137 tests |
| `npm run type-check` | PASS | Exit 0 |
| `npm run build` | PASS | Production build completed; Browserslist warning remains |
| `npm run test:e2e -- --workers=4` | PASS | 60 tests across 320/375/768/1024/1280 projects |
| `git diff --check` | PASS | Intended source/test commit and report |
| Secret/public-branding diff scan | PASS | No secret-shaped additions or accidental upstream branding additions |
| Installer release-contract gate | PASS | Publication workflow completed all contract tests |
| Deterministic artifact | PASS | Workflow built twice and compared byte-for-byte |
| Public asset verification | PASS | Six assets, both checksums, manifest, provenance and archive contents verified without GitHub credentials |

## Test Accounts and Data

No email, account ID, token, cookie or personal data is recorded.

| Alias | State | Result/limitation |
| --- | --- | --- |
| `guest` | Not authenticated | Clean Chromium Login redirect and public API smoke passed |
| `new-user` | No subscription | Local E2E fixture only |
| `trial-user` | Trial | Local E2E fixture only |
| `active-user` | Active subscription | Local E2E fixture only |
| `expired-user` | Expired/limited | Local E2E fixture only |
| `multi-user` | Multiple subscriptions | Local E2E fixture only |
| `full-admin` | Full permissions | Local read/error fixture only; live account unavailable |
| `restricted-admin` | Restricted permissions | Local fixture only |

## Deployment

| Item | Result |
| --- | --- |
| Baseline | Release `2026.08.9`, exact Bot/Cabinet SHA, health and Installer doctor PASS |
| Update method | Protected Update from immutable `v2026.08.10/release.json` |
| Protected Update outcome | `committed` |
| Installed Release Bundle | `2026.08.10` |
| Installed Cabinet SHA | `b5b34848b752b0ec66a9ca68b121d4b58264a0c5` |
| Installed artifact | `a2988f4fc2460c831a3bd131df54764513a741d0134ecf669bb6b02febac7061` |
| Installed Bot SHA | `f553d1896dcd347fd74012f6394fd2277161bdd1` |
| PostgreSQL/Redis identities | Match Release manifest exactly |
| Installer doctor | PASS after transient external DNS/API retries |
| Unified health | PASS, HTTP `200` |
| Branding API | PASS, HTTP `200` |
| Root and direct `/balance` route | PASS, HTTP `200`; guest redirected to `/login` |
| Chromium guest smoke | PASS; no console errors or failed same-origin responses |

## Functional Results

| Area | Result | Checked scenarios | Defects/limitations |
| --- | --- | --- | --- |
| Runtime smoke | PASS | Health, doctor, root, protected direct route, branding and clean guest Login | Authenticated integration matrix not checked |
| Web authentication | BLOCKED | Guest redirect only | No isolated live account |
| Telegram authentication | BLOCKED | Local navigation fixtures | No real Telegram client or signed init data |
| Dashboard | PASS locally | Trial, active, limited, expired and multiple-subscription fixtures | No authenticated VPS state matrix |
| Subscription/purchase | PASS locally | Management, Devices, renewal and no-subscription tariff action | No sandbox payment submitted |
| Balance/payments | PASS locally | Read-only and mocked top-up state machine | No live provider mutation |
| Connection | PASS locally | Wizard Back, reload fallback and alternative app | Real app schemes and Telegram client not checked |
| Profile/accounts | PASS locally | Compact controls, four languages and RTL menu geometry | Live account mutations not checked |
| Support/notifications | PASS locally | Existing read-only E2E coverage | Live WebSocket reconnect not checked |
| Optional features | PASS locally | Safe fixture coverage | Live mutations not submitted |
| Admin | PASS locally | Branding background load failure cannot save defaults | Full live admin account unavailable |

## Platform and Accessibility Results

| Matrix/check | Result | Coverage/limitation |
| --- | --- | --- |
| Responsive | PASS locally | E2E projects at 320/375/768/1024/1280 |
| Dark/light themes | PASS locally | Dashboard responsive fixture |
| English/Russian | PASS locally | Critical user flows |
| Persian RTL | PASS locally | Profile language menu remains inside 320 px viewport |
| Chinese | PASS locally | Profile language selection |
| Keyboard and dialog focus | PASS locally | Devices and Profile critical-flow assertions |
| Accessible names/states | PASS locally | Profile controls and background-editor controls |
| Desktop Chromium | PASS | Local E2E and clean deployed guest smoke |
| Firefox/physical mobile | BLOCKED | Not available |
| Real Telegram clients | BLOCKED | Not available |
| Screen reader smoke | BLOCKED | Not available |

## Failure and Recovery Results

| Case | Result | Notes |
| --- | --- | --- |
| Background configuration GET `500` | PASS | Editor shows an alert and does not expose Save with fallback defaults |
| Critical Cabinet API errors | PASS locally | Existing E2E error-state coverage |
| Stale chunk after deploy | PASS | Clean Chromium loaded the new immutable artifact without failed responses |
| Protected Update rollback source | PASS | Previous immutable `v2026.08.9` identity recorded and protected by update transaction |
| Interrupted external return | BLOCKED | No approved live payment/provider mutation |

## Residual Risks

- Authenticated VPS state matrix was not run because isolated accounts were not provided.
- Real Telegram Android, iOS and Desktop clients were unavailable.
- No real payment, withdrawal, gift, merge or destructive admin action was initiated.
- Overall status remains `BLOCKED`; local fixtures and guest smoke are not promoted to real-client or authenticated evidence.

## Staging Decision

Result: `BLOCKED`

Reason:

```text
Release publication, Protected Update, exact runtime identities, health, doctor,
local browser automation and deployed guest smoke passed. Full authenticated and
real Telegram coverage remains unavailable.
```

## Production Smoke

Status: `PASS` on the disposable integration VPS; production deployment is not claimed.

| Check | Result | Notes |
| --- | --- | --- |
| Health/assets | PASS | Exact Release, Cabinet SHA and artifact verified |
| Guest Login | PASS | Clean redirect to `/login` |
| Root/direct route | PASS | HTTP `200`, no failed same-origin responses |
| Authenticated Dashboard/subscription/admin | BLOCKED | No isolated live account |
| Logs/error rate | PASS for smoke | Installer doctor and browser console/network checks passed |

## Rollback

Rollback required: `No`<br>
Rollback Release Bundle: `v2026.08.9`<br>
Rollback result: `NOT NEEDED`<br>
Post-update health/Login: `PASS`

## Final Sign-off

- [x] Exact source versions recorded.
- [x] Automated gate passed.
- [ ] Required authenticated staging flows completed.
- [ ] Real Telegram client checks completed.
- [x] Release blockers found by code review resolved.
- [x] Residual risks explicitly recorded.
- [x] Rollback source recorded.
- [x] Report contains no secrets or personal data.
- [x] Integration VPS smoke completed.

Final result: `BLOCKED`
