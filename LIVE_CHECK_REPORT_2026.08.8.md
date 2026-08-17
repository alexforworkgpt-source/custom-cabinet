# Live Check Report: `v2026.08.8`

Status: `BLOCKED`<br>
Date: `2026-08-17`<br>
Checker: `OpenCode`<br>
Release owner: `workspace owner`

## Source Identity

| Item | Exact value |
| --- | --- |
| Custom Cabinet commit | `47b6dcbb93ef9462f4dd6f995a36111195b7e018` |
| Custom Cabinet version/tag | `1.65.0`; no immutable candidate tag |
| Upstream Cabinet tag/SHA | `v1.65.0` / `b866bebeeb6032db4baa3869a4917316fe8e0453` |
| Upstream Bot tag/SHA | `v4.0.0` / `f553d1896dcd347fd74012f6394fd2277161bdd1` |
| Release Bundle | Published `v2026.08.8`; Installer `451bf55963e853b6ee473add1452b7ec648c5c06`; manifest identity `b68c28d49364c2ba00013f95a409a523e9e235a63229a36b591e64be15ee9b72` |
| Staging artifact checksum | `81d52ffd8de2e7d19e1f3c96b6b97f8af77a52d655abbb898e2acfc0df1e1fdb` |
| Rollback Release Bundle | Staging baseline `2026.08.7`, Cabinet `307b2271fb77f8691db6ad017838f61fe4dc8929`, artifact `b6f95609f0adf7f3802f74a735745d5063c9fce53882cc06db6b5ae64a9223a8`; verified by rollback |

## Environment

| Item | Value |
| --- | --- |
| Staging URL | `https://web.demolanding.click` |
| Deploy time | Corrected candidate verified at `2026-08-17T03:33:00Z` |
| Browser builds | Playwright `1.62.1` local projects and clean headless Chromium staging probe |
| Telegram clients | Real clients not checked |
| Enabled themes | Light and dark covered by local automation |
| Checked locales | Local automated coverage only |
| Operator palette | Local mock Cabinet branding configuration |

## Change Scope

The released Custom Cabinet source contains the approved Dashboard and Subscription
redesign, URL-backed responsive subscription management, Profile logout
placement, static grid presentation, subscription cache invalidation fixes,
double-submit protection for classic renewal, and dependent-query error-state
handling.

The candidate does not migrate the deprecated `@telegram-apps/sdk-react` 3.x
API to `@tma.js/sdk-react`. That migration changes many APIs used by the Cabinet
and requires a separate implementation and real Telegram verification.

## Automated Gate

| Command | Result | Notes |
| --- | --- | --- |
| `npm ci` | PASS WITH NOTE | Repeated from exact commit and committed lockfile. npm reports 14 package-level findings in that lockfile; the separate refreshed working-tree lockfile is not part of the commit. |
| `npm run check` | PASS WITH WARNINGS | Exit code 0; Biome reported 265 warnings, 103 infos, and a deprecated config field. |
| `npm test` | PASS | 20 files, 135 tests passed. |
| `npm run type-check` | PASS | Completed with exit code 0. |
| `npm run build` | PASS WITH WARNING | Production build completed; Browserslist data is 7 months old. |
| Browser automation | PASS | `npm run test:e2e`: 52 tests passed across the configured viewport projects. |
| `git diff --check` | PASS | Exact commit worktree was clean with no whitespace errors. |
| `npm audit --omit=dev` | FAIL (reviewed) | npm propagates 2 Valibot advisories across 5 dependency nodes. Reachability review found no use of the vulnerable `emoji()` path and no `record()` plus `flatten()` path. |
| Corrected artifact determinism | PASS | Three pinned Docker builds produced SHA-256 `81d52ffd8de2e7d19e1f3c96b6b97f8af77a52d655abbb898e2acfc0df1e1fdb`. |
| Installer builder regression gate | PASS | 92 unit tests passed, 5 skipped; shell syntax, release-bundle shell harness and production-readiness harness passed. The fix is committed as `451bf55963e853b6ee473add1452b7ec648c5c06`. |
| Release publication | PASS WITH EXCEPTION | Public `v2026.08.8` contains the six required assets. Draft and public downloads matched byte-for-byte; checksums, provenance and manifest identity passed. The owner explicitly waived repeating the disposable Ubuntu 24.04 lifecycle for this local Release Bundle construction fix. |

## Dependency Audit Assessment

The Telegram dependency chain was already present in baseline commit `66336ab`;
it was not introduced by this redesign or by the compatible lockfile updates.

`npm audit` reports five affected package nodes, but they originate from two
Valibot advisories:

- `GHSA-vqpr-j7v3-hqw9`, published 2025-11-25, applies when an application uses
  Valibot `emoji()` validation on attacker-controlled input. Neither Custom
  Cabinet nor the Telegram package source calls `emoji()`.
- `GHSA-5qjj-4xww-7phc`, published 2026-07-08, applies when rejected
  attacker-controlled `record()` keys are passed to Valibot `flatten()`.
  Telegram source uses `record()` for cloud storage and theme parameters, but
  the package source does not call `flatten()`.

No affected call path was identified. The deprecated SDK should still be
migrated separately, but the package-level audit result is not classified as a
new release blocker for this redesign.

## Test Accounts and Data

Only isolated Playwright mock data was used. No credentials, personal data,
Telegram init data, or real payments were used.

| Alias | State | Result/limitation |
| --- | --- | --- |
| `trial-user` | Trial | PASS in local automation |
| `active-user` | Active subscription | PASS in local automation |
| `expired-user` | Expired subscription | PASS in local automation, including renewal selection and double-submit protection |
| `limited-user` | Traffic limited | PASS in local automation |
| `multi-user` | Multiple subscriptions | PASS in local automation |
| Guest staging session | No authorization | PASS: stable Login bootstrap, branding/config APIs and assets returned `200` with no browser errors or reload loop |
| Authenticated staging accounts | Required states | BLOCKED: credentials/test matrix were not provided for this candidate |

## Functional Results

| Area | Result | Checked scenarios | Defects/limitations |
| --- | --- | --- | --- |
| Runtime smoke | PASS staging | Protected Update, exact identities, health, root/static, direct route and clean-browser bootstrap | Authenticated flows remain incomplete |
| Web authentication | PARTIAL | Guest Login and public bootstrap in staging | Valid/invalid credential flows not checked |
| Telegram authentication | BLOCKED | Telegram navigation mock coverage | Real init data, reopen, Back and Close not checked |
| Dashboard | PASS locally | Trial, active, limited, expired, multi-subscription, errors | Authenticated staging data not checked |
| Subscription/purchase | PASS locally | Management overlay, renewal period, single POST on double click | Sandbox payment not performed |
| Balance/payments | PASS locally | Mock top-up flow and result return | No provider sandbox run |
| Connection | PASS locally | Responsive wizard, Back and route restoration | Real application schemes not checked |
| Profile/accounts | PASS locally | Grouping, language and logout | Staging account mutations not checked |
| Support/notifications | PASS locally | Deep-linked ticket update | Staging WebSocket flow not checked |
| Admin | PARTIAL | Capability-gated navigation in automation | Full and restricted staging roles not checked |

## Platform and Visual Results

| Matrix | Result | Coverage | Defects/limitations |
| --- | --- | --- | --- |
| Responsive | PASS locally | `320/375/768/1024/1280` configured projects | `1440` and physical devices not checked in this run |
| Dark theme | PASS locally | Automated Dashboard/navigation coverage | No staging operator check |
| Light theme | PASS locally | Automated Dashboard/navigation coverage | No staging operator check |
| Desktop Chromium | PASS staging guest | One document load; health and bootstrap APIs `200`; no console error, unexpected 4xx/5xx or redirect loop | Protected screens still require authenticated staging coverage |
| Desktop Firefox | BLOCKED | Not run | Environment not prepared |
| Android Telegram | BLOCKED | Not run | Physical client unavailable |
| iOS Telegram | BLOCKED | Not run | Physical client unavailable |

## Failure and Recovery Results

| Case | Result | Notes |
| --- | --- | --- |
| Subscription API failure | PASS locally | Management overlay shows the load error and does not request purchase options. |
| Critical data errors | PASS locally | Balance and device failures are not rendered as zero values. |
| Double submit protection | PASS locally | Renewal double click produces one purchase POST. |
| Slow/offline network | BLOCKED | Staging injection not run. |
| WebSocket reconnect | BLOCKED | Staging injection not run. |
| Interrupted external return | BLOCKED | No sandbox provider session. |
| Rejected artifact rollback | PASS staging | Artifact `f70539ddb70cced3d158b51dbf247530c985096204a0dfa3775aeaacc8b667a0` produced a startup reload loop; staging returned to `2026.08.7`, exact previous Cabinet/artifact identities and unchanged database revision were verified before redeploy. |

## Defects

The first deterministic artifact was rejected. Git Bash/MSYS rewrote Docker build
argument `VITE_API_URL=/api` to `VITE_API_URL=C:/Program Files/Git/api`. All
Cabinet API requests then failed before receiving an HTTP response, the frontend
showed `ServiceUnavailableScreen`, and the successful health recovery probe
reloaded the page indefinitely.

The Installer builder now excludes only `VITE_API_URL` from MSYS argument
conversion and rejects packaged frontend files containing Git Bash installation
paths. The corrected artifact passed local and staging browser reproduction.
No unresolved defect was found in the completed unauthenticated staging smoke.

## Residual Risks

- Maintainer: track the deprecated Telegram SDK migration separately; npm will
  continue reporting the reviewed package-level findings until that migration.
- Release owner: provide the required staging account matrix, sandbox payment
  provider, and Android/iOS Telegram checks; until then full live sign-off remains
  `BLOCKED` even though the Release was published by owner exception.
- The release owner accepted publication without repeating the disposable Ubuntu
  24.04 lifecycle because the change is limited to local Release Bundle
  construction and validation. The public Release notes record this exception.
- Assets under `v2026.08.8` are immutable and must not be replaced.

## Staging Decision

Result: `BLOCKED` (`PASS` for the completed staging infrastructure/guest smoke)

Reason:

```text
The exact committed Custom Cabinet artifact is deployed and passes the completed
staging infrastructure and guest-browser smoke. Full sign-off remains blocked by
authenticated staging scenarios, real Telegram clients and sandbox payments. The
Installer builder fix is committed and its local gates passed. The release owner
separately authorized publication without repeating the disposable Ubuntu 24.04
lifecycle; `v2026.08.8` was published with that exception. Publication does not
change this live-check result to `PASS`.
```

Release owner publication exception:

```text
Publication without repeating the disposable Ubuntu 24.04 lifecycle was
explicitly authorized for the local Release Bundle construction fix. No broader
PASS WITH RISKS approval was provided for the missing live-check scenarios.
```

## Production Smoke

Status: `NOT STARTED`

No production change or real payment was initiated.

## Rollback

Rollback required: `Yes`, for the rejected first artifact<br>
Rollback Release Bundle: staging baseline `2026.08.7`<br>
Rollback result: `PASS`; exact previous Cabinet/artifact identities and unchanged database revision verified<br>
Post-rollback health/Login: `PASS`; clean Chromium loaded once without the blocking overlay<br>
Current rollback source after corrected deploy: verified `2026.08.7` snapshot and PostgreSQL dump

## Final Sign-off

- [x] Exact candidate commit recorded.
- [x] Local automated gate passed.
- [x] Runtime dependency audit findings reviewed for reachable affected paths.
- [ ] Required staging flows completed; infrastructure and guest smoke only.
- [ ] Telegram real-device checks completed; otherwise Release remains blocked.
- [ ] Release blockers resolved.
- [ ] All residual risks explicitly accepted; only the publication exception was accepted.
- [x] Rollback source verified.
- [x] Report contains no secrets or personal data.
- [x] Production smoke marked `NOT STARTED`.

Final result: `BLOCKED`
