# Live Check Report: `v2026.08.9`

Status: `BLOCKED`<br>
Date: `2026-08-17`<br>
Checker: `OpenCode`<br>
Release owner: `workspace owner`

## Source Identity

| Item | Exact value |
| --- | --- |
| Custom Cabinet commit | `0f9794d48e43e428b6f3d4634b84d82fda0eb0ba` |
| Custom Cabinet version/tag | `1.65.0`; Release source is the exact commit above |
| Upstream Cabinet tag/SHA | `v1.65.0` / `b866bebeeb6032db4baa3869a4917316fe8e0453` |
| Upstream Bot tag/SHA | `v4.0.0` / `f553d1896dcd347fd74012f6394fd2277161bdd1` |
| Installer tag/SHA | `v2026.08.9` / `a5af6c72069a98b42e97cfb17ebcf1d59443324f` |
| Release Bundle | `v2026.08.9` |
| Manifest identity | `4280aa43110999270786107d8444ac4dedf9c4bf48d914304734df10c8e69323` |
| Cabinet artifact SHA-256 | `553d94f4e3080341d9f14d920a3db2fb78944c2db74873b92dc125a5b3aa0263` |
| Manifest SHA-256 | `b7b6ec11c48c3f2ac6280b3241ad59c5811ae8a9695083199e212521e7b88401` |
| Rollback Release Bundle | `v2026.08.8`; Cabinet `47b6dcbb93ef9462f4dd6f995a36111195b7e018`; artifact `81d52ffd8de2e7d19e1f3c96b6b97f8af77a52d655abbb898e2acfc0df1e1fdb` |

Release URL: <https://github.com/alexforworkgpt-source/installer/releases/tag/v2026.08.9>

## Environment

| Item | Value |
| --- | --- |
| Integration URL | `https://web.demolanding.click` |
| Environment type | Disposable integration VPS; not recorded as production |
| Verification time | `2026-08-17T15:54:04Z` |
| Browser build | Playwright Chromium `151.0.7922.34` |
| Telegram clients | Not available |
| Enabled themes | Dark and light checked in the local fixture audit; not authenticated on the VPS |
| Checked locales | English, Russian and forced Persian RTL in the local fixture audit; not authenticated on the VPS |
| Operator palette | Local blue `#3b82f6` fixture only; production palette coverage not claimed |

## Change Scope

- Revised Devices presentation inside the canonical responsive overlay.
- Denser Dashboard subscription, card and statistic surfaces.
- Localized `Choose tariff` action in English, Russian, Persian and Chinese.
- Subscription management action moved into the subscription summary.
- Installer runtime verification now retries only external transport status
  `000`; unsafe Hook responses, exposed runtime ports and Telegram webhook
  mismatches remain fail-fast.

## Automated Gate

| Command or gate | Result | Notes |
| --- | --- | --- |
| `npm ci` | NOT RECORDED | The retained evidence does not separately establish this invocation; no result is claimed |
| `npm test` | PASS | 20 files, 135 tests |
| `npm run type-check` | PASS | Exit 0 |
| `npm run build` | PASS | Production build completed; Browserslist warning remains |
| `npm run check` | PASS | Exit 0; existing warnings remain |
| `npm run test:e2e -- --workers=4` | PASS | 57 tests |
| `git diff --check` | PASS | Custom Cabinet and Installer |
| Installer unit tests | PASS | 92 passed, 5 skipped |
| Installer release-contract shell gate | PASS | All workflow harnesses completed |
| Ubuntu 24.04 lifecycle | PASS | Exact Installer SHA; fresh/repeat install, update, injected rollback, recovery, isolation and uninstall |
| Deterministic artifact | PASS | Workflow built twice and compared byte-for-byte |
| Public asset verification | PASS | Six assets, both checksum files, manifest, provenance and archive identity verified |

## Test Accounts and Data

No email, account ID, token, cookie or other personal data is recorded. Local
fixture coverage is not treated as authenticated integration evidence.

| Alias | State | Result/limitation |
| --- | --- | --- |
| `guest` | Not authenticated | PASS for clean Chromium Login redirect and same-origin smoke on the integration VPS |
| `new-user` | No subscription | Local fixture coverage only; authenticated integration scenario BLOCKED |
| `trial-user` | Trial | Local E2E fixture coverage only; authenticated integration scenario BLOCKED |
| `active-user` | Active subscription | Local route fixture coverage only; authenticated integration scenario BLOCKED |
| `expired-user` | Expired/limited | Local E2E fixture coverage only; authenticated integration scenario BLOCKED |
| `multi-user` | Multiple subscriptions | Local E2E fixture coverage only; authenticated integration scenario BLOCKED |
| `full-admin` | Full permissions | BLOCKED; no isolated account or approved scope |
| `restricted-admin` | Restricted permissions | BLOCKED; no isolated account or approved role fixture |

## Deployment

| Item | Result |
| --- | --- |
| Environment | Disposable integration VPS |
| Cabinet URL | `https://web.demolanding.click` |
| Verification time | `2026-08-17T15:54:04Z` |
| Installed Release Bundle | `2026.08.9` |
| Installed Cabinet SHA | `0f9794d48e43e428b6f3d4634b84d82fda0eb0ba` |
| Installed artifact | `553d94f4e3080341d9f14d920a3db2fb78944c2db74873b92dc125a5b3aa0263` |
| Installer doctor | PASS |
| Root document | PASS, HTTP `200` |
| Direct `/balance` route | PASS, HTTP `200`; guest redirected to `/login` |
| Unified health | PASS, HTTP `200` |
| Branding API | PASS, HTTP `200` |
| Chromium guest smoke | PASS; Chromium `151.0.7922.34`, no console errors or failed same-origin responses |

## Release Publication

- Workflow: <https://github.com/alexforworkgpt-source/installer/actions/runs/32043125106>
- Release is public, not draft and not prerelease.
- Existing Release assets were not replaced.
- Installer tag dereferences to
  `a5af6c72069a98b42e97cfb17ebcf1d59443324f`.
- Public Installer archive matches `git archive v2026.08.9`.
- No `server.env`, `env.txt`, `.playwright-mcp`, `__pycache__` or `*.pyc`
  entries were found in the Installer archive.

## Functional Results

The detailed route and fixture evidence is in
[`LIVE_CHECK_REPORT_2026-08-17_LOCAL_UI_UX.md`](LIVE_CHECK_REPORT_2026-08-17_LOCAL_UI_UX.md).
The table below does not promote that local evidence to authenticated VPS
coverage.

| Area | Result | Checked scenarios | Defects/limitations |
| --- | --- | --- | --- |
| Runtime smoke | BLOCKED | Integration health, root, protected direct route, branding and clean guest Login smoke passed | Authenticated load, enabled-language/theme matrix and WebSocket behavior were not checked |
| Web authentication | BLOCKED | Clean guest redirect plus local Login/reset/error fixtures | No isolated account; valid/invalid Login, registration, verification, OAuth, return route and session recovery not checked live |
| Telegram authentication | BLOCKED | Local non-Telegram fallback only | No test bot, signed init data or real Telegram client |
| Dashboard | BLOCKED | Local fixture states and complete local route audit | No authenticated VPS state matrix; deferred `LC-001`, `LC-002` and `LC-011` remain |
| Subscription/purchase | BLOCKED | Local read-only fixtures | No authenticated VPS flow or sandbox payment; deferred `LC-008`, `LC-009` and `LC-011` remain |
| Balance/payments | BLOCKED | Local read-only balance/top-up/result fixtures | No authenticated VPS account or sandbox provider; deferred `LC-003` and `LC-010` remain |
| Connection | BLOCKED | Local overlay and platform-selection fixtures | Real app schemes, QR state and Telegram external navigation were not checked |
| Profile/accounts | BLOCKED | Local read-only fixtures | Linking, OTP, merge, notification persistence and session cleanup were not checked live; deferred `LC-010` and `LC-016` remain |
| Support/notifications | BLOCKED | Local empty-ticket fixture | Ticket mutations, attachment handling and WebSocket notifications/reconnect were not checked; deferred `LC-005` and `LC-017` remain |
| Optional features | BLOCKED | Local safe fixtures for enabled routes | Mutations and external returns were not submitted; deferred `LC-004`, `LC-006`, `LC-007` and `LC-012`-`LC-019` remain |
| Admin | BLOCKED | No live admin scenario | Full/restricted role accounts and approved safe objects were not provided |

## Platform and Visual Results

These results come from the local route-by-route audit and remain linked to its
screenshots and reproduction records. They are not physical-device results.

| Matrix | Result | Coverage | Defects/limitations |
| --- | --- | --- | --- |
| Responsive | FAIL | Local `320/375/768/1024/1280/1440` matrix | Mobile clipping, truncation and primary-action overlap remain |
| Dark theme | FAIL | Every local route at 1280; critical routes across the full matrix | Very faint small secondary text remains |
| Light theme | FAIL | Every local route at 320; critical routes across the full matrix | Mobile layout findings remain |
| Operator palette | PASS locally | Blue `#3b82f6` fixture | Arbitrary deployed palettes were not sampled |
| Russian | FAIL | Critical local mobile routes | Dashboard financial and device values truncate |
| English | FAIL | Full local route matrix | Deferred findings remain |
| RTL | BLOCKED | Forced Persian on critical local mobile routes | Mirroring was sampled, but the fixture picker did not expose Persian |
| Desktop Chromium | PASS | Local and guest integration smoke on Chromium `151.0.7922.34` | Authenticated integration matrix remains blocked |
| Desktop Firefox | BLOCKED | Browser binary unavailable | Independent browser-engine smoke not run |
| Desktop Telegram | BLOCKED | Client unavailable | Mini App, Back/Close and external navigation not checked |
| Android Telegram | BLOCKED | Client unavailable | Viewport emulation is not real-client evidence |
| iOS Telegram | BLOCKED | Client unavailable | Safe area, keyboard, fullscreen and native Back remain unverified |
| Mobile browser | FAIL | Local 320/375 Chromium emulation | Physical-device coverage unavailable; `LC-001`, `LC-006`, `LC-007` and `LC-012` remain |

## Accessibility Results

| Check | Result | Notes |
| --- | --- | --- |
| Keyboard critical flow | BLOCKED | Canonical overlay Escape/focus return has E2E evidence; full Login, purchase and admin keyboard flows were not completed |
| Visible focus/order | BLOCKED | No systematic focus-order pass across all routes |
| Accessible names | FAIL | Unnamed back, Share and support/game controls are recorded in the local audit |
| Forms/errors | FAIL | Unassociated fields and missing API/mutation error surfaces remain |
| Dialog/Sheet focus | FAIL | Canonical overlays passed locally; custom contest/poll dialogs do not meet the same contract |
| Navigation current state | PASS locally | Core navigation uses `aria-current` |
| Zoom 200% | BLOCKED | Reliable zoom verification was unavailable |
| Reduced motion | PASS locally | All 178 local audit contexts emulated reduced motion |
| Non-color status communication | BLOCKED | Main statuses include text, but every optional state was not opened |
| Screen reader smoke | NOT AVAILABLE | No screen-reader environment |

## Failure and Recovery Results

| Case | Result | Notes |
| --- | --- | --- |
| Backend unavailable | FAIL locally | Dashboard critical errors have E2E coverage, but several other pages mask failures as zero or empty data |
| Slow/offline network | BLOCKED | No complete live route matrix |
| 401/403 | BLOCKED | Safe invalid auto-login 401 was checked locally; refresh/relogin and permission-denial flows are incomplete |
| 422/429/500 | BLOCKED | No complete live validation, cooldown and generic-recovery matrix |
| WebSocket reconnect | BLOCKED | No authenticated integration session or suitable Upstream Bot test account |
| Stale chunk after deploy | BLOCKED | No retained direct browser evidence for a stale-session deployment transition |
| Double submit protection | BLOCKED | Selected code/E2E coverage exists, but required live mutation flows were not authorized |
| Interrupted external return | BLOCKED | No sandbox payment provider or approved external mutation |

## Defects

The release owner explicitly requested publication and deferred the findings in
[`LIVE_CHECK_REPORT_2026-08-17_LOCAL_UI_UX.md`](LIVE_CHECK_REPORT_2026-08-17_LOCAL_UI_UX.md).
Important residual findings include mobile Dashboard clipping/overlap, masked
API errors on several pages, raw callback translation keys, sticky mobile
controls and accessibility gaps in custom dialogs and icon-only controls.

The linked report is the canonical defect record for `LC-001` through `LC-019`.
It contains each severity, route/platform, reproduction, expected result, actual
result and release-blocker decision; those records are not duplicated here to
avoid two diverging copies.

## Residual Risks

| Risk or limitation | Decision owner | Status |
| --- | --- | --- |
| Authenticated VPS state matrix and WebSocket/error recovery | Release owner/test-environment owner | BLOCKED; isolated accounts were not provided |
| Real Telegram Android, iOS and Desktop checks | Release owner/test-account owner | BLOCKED; clients and suitable test accounts unavailable |
| Payment and external-return coverage | Release owner/provider owner | BLOCKED; no sandbox was established and no real payment was authorized |
| Admin RBAC matrix | Release owner/test-data owner | BLOCKED; full/restricted accounts and safe objects unavailable |
| Destructive account, financial or admin actions | Release owner | Not initiated by design; require separate scope and isolated data |
| Physical mobile, Firefox, zoom and screen-reader coverage | Release owner/device owner | BLOCKED or NOT AVAILABLE as detailed above |
| `LC-001`-`LC-019` UI, localization and accessibility findings | Release owner | Explicitly deferred for this Release; not resolved or reverified |
| Production observability and read-only authenticated smoke | Release owner/environment owner | BLOCKED; no production evidence is recorded in this report |

## Staging Decision

Result: `BLOCKED`

Reason:

```text
The exact Release Bundle passed build, publication, disposable-VPS lifecycle and
guest runtime checks, but authenticated staging, real Telegram, admin, WebSocket,
failure-recovery and sandbox-provider scenarios lack direct evidence. Deferred
UI and accessibility findings also remain unresolved.
```

Release owner approval for `PASS WITH RISKS`: not applicable. Publication and
integration deployment with the known UI findings were explicitly requested,
but incomplete live-check coverage was not accepted as `PASS WITH RISKS`.

## Production Smoke

Status: `NOT STARTED`

The disposable integration VPS evidence above is not labeled as production and
is not promoted to production evidence.

| Check | Result | Notes |
| --- | --- | --- |
| Health/assets | NOT RUN IN PRODUCTION | Passed only on the disposable integration VPS |
| Telegram Login | BLOCKED | No real Telegram client or test account |
| Dashboard | BLOCKED | No authenticated production account |
| Existing subscription | BLOCKED | No authenticated production account |
| Connection read-only | BLOCKED | No authenticated production account or real-client deep-link scope |
| Balance read-only | BLOCKED | No authenticated production account |
| Admin read-only | BLOCKED | No approved production admin account |
| Logs/error rate | BLOCKED | No sanitized production observability evidence retained |

## Rollback

Rollback required: `No` for the recorded integration deployment<br>
Rollback Release Bundle: `v2026.08.8`<br>
Rollback result: `NOT NEEDED` for the recorded integration deployment; `PASS`
for the separate injected Installer lifecycle rollback<br>
Post-rollback health/Login: `not applicable` to the live deployment; lifecycle
recovery and Installer doctor passed

The pre-deployment `v2026.08.8` baseline was verified by exact Cabinet and
artifact identity and passed Installer doctor before the lifecycle run. The
full lifecycle separately passed an injected Protected Update rollback and
verified recovery. `v2026.08.8` remains the immutable rollback Bundle; its
assets were not changed.

## Final Sign-off

- [x] Exact source and runtime identities recorded.
- [x] Local automated gates passed.
- [x] Exact Installer lifecycle passed.
- [x] Public Release assets independently verified.
- [x] VPS activation and guest smoke passed.
- [x] Rollback source recorded and lifecycle rollback verified.
- [x] Report contains no secrets or personal data.
- [x] Production smoke is explicitly recorded as `NOT STARTED`.
- [ ] Authenticated staging scenarios completed.
- [ ] Real Telegram client scenarios completed.
- [ ] Deferred UI/accessibility findings resolved.
- [ ] All residual risks accepted for a `PASS WITH RISKS` decision.

Final result: `BLOCKED`

Publication and deployment were explicitly requested with the known UI findings
deferred. This approval does not convert incomplete live-check coverage to
`PASS`.
