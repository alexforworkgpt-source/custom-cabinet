# Live Check Report: `v2026.08.8`

Status: `BLOCKED`<br>
Date: `2026-08-17`<br>
Checker: `OpenCode`<br>
Release owner: `workspace owner`

## Source Identity

| Item | Exact value |
| --- | --- |
| Custom Cabinet commit | Base `307b2271fb77f8691db6ad017838f61fe4dc8929`; release changes are not committed |
| Custom Cabinet version/tag | `1.65.0`; no immutable candidate tag |
| Upstream Cabinet tag/SHA | `v1.65.0` / `b866bebeeb6032db4baa3869a4917316fe8e0453` |
| Upstream Bot tag/SHA | Tag not recorded; selected SHA `f553d1896dcd347fd74012f6394fd2277161bdd1` requires compatibility confirmation |
| Release Bundle candidate | `v2026.08.8` proposed; not built or published |
| Staging artifact checksum | Not available; no committed artifact was deployed |
| Rollback Release Bundle | `v2026.08.7` is published; rollback eligibility requires release-owner confirmation |

## Environment

| Item | Value |
| --- | --- |
| Staging URL | Not deployed for this candidate |
| Deploy time | Not applicable |
| Browser builds | Playwright `1.62.1` local Chromium projects |
| Telegram clients | Real clients not checked |
| Enabled themes | Light and dark covered by local automation |
| Checked locales | Local automated coverage only |
| Operator palette | Local mock Cabinet branding configuration |

## Change Scope

The candidate contains the approved Custom Cabinet Dashboard and Subscription
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
| `npm ci` | PASS WITH NOTE | Clean install completed in the release-preparation worktree; the committed candidate must be repeated from its pinned lockfile. npm reports package-level findings in the deprecated Telegram SDK dependency chain. |
| `npm run check` | PASS WITH WARNINGS | Exit code 0; Biome reported 265 warnings, 103 infos, and a deprecated config field. |
| `npm test` | PASS | 20 files, 135 tests passed. |
| `npm run type-check` | PASS | Completed with exit code 0. |
| `npm run build` | PASS WITH WARNING | Production build completed; Browserslist data is 7 months old. |
| Browser automation | PASS | `npm run test:e2e`: 52 tests passed across the configured viewport projects. |
| `git diff --check` | PASS | No whitespace errors. |
| `npm audit --omit=dev` | FAIL (reviewed) | npm propagates 2 Valibot advisories across 5 dependency nodes. Reachability review found no use of the vulnerable `emoji()` path and no `record()` plus `flatten()` path. |

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
| Staging accounts | Required states | BLOCKED: not provided for this candidate |

## Functional Results

| Area | Result | Checked scenarios | Defects/limitations |
| --- | --- | --- | --- |
| Runtime smoke | PASS locally | Build and mocked browser runtime | Staging runtime not checked |
| Web authentication | BLOCKED | Test-only browser session | Real staging authentication not checked |
| Telegram authentication | BLOCKED | Telegram navigation mock coverage | Real init data, reopen, Back and Close not checked |
| Dashboard | PASS locally | Trial, active, limited, expired, multi-subscription, errors | Staging data not checked |
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
| Desktop Chromium | PASS locally | Playwright Chromium | Production browser smoke not started |
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

## Defects

No unresolved functional defect was found by the completed local automated gate.

## Residual Risks

- Maintainer: track the deprecated Telegram SDK migration separately; npm will
  continue reporting the reviewed package-level findings until that migration.
- Release owner: provide the required staging account matrix, sandbox payment
  provider, and Android/iOS Telegram checks; otherwise Release remains blocked.
- Release owner: confirm the exact Upstream Bot tag for
  `f553d1896dcd347fd74012f6394fd2277161bdd1` and the rollback Bundle.
- Implementer: commit the exact reviewed Custom Cabinet source before producing
  an artifact or Release Bundle.
- Checker: repeat the applicable gate from the immutable committed source and
  test the same artifact in staging.

## Staging Decision

Result: `BLOCKED`

Reason:

```text
The local automated gate passes, but the source is not an immutable commit. The
selected Upstream Bot tag is not recorded, and mandatory staging, real Telegram,
and sandbox payment checks are unavailable. No Release Bundle may be published
from this state.
```

Release owner approval for `PASS WITH RISKS`:

```text
Not provided.
```

## Production Smoke

Status: `NOT STARTED`

No production change or real payment was initiated.

## Rollback

Rollback required: `No`<br>
Rollback Release Bundle: `v2026.08.7` pending owner confirmation<br>
Rollback result: `NOT NEEDED`<br>
Post-rollback health/Login: `Not applicable`

## Final Sign-off

- [ ] Exact candidate commit recorded.
- [x] Local automated gate passed.
- [x] Runtime dependency audit findings reviewed for reachable affected paths.
- [ ] Required staging flows completed.
- [ ] Telegram real-device checks completed; otherwise Release remains blocked.
- [ ] Release blockers resolved.
- [ ] Residual risks explicitly accepted.
- [ ] Rollback source verified.
- [x] Report contains no secrets or personal data.
- [x] Production smoke marked `NOT STARTED`.

Final result: `BLOCKED`
