# Live Check Report: `v2026.08.16`

Status: `BLOCKED`<br>
Date: `2026-08-22`<br>
Checker: `OpenCode`<br>
Release owner: `workspace owner`

## Source Identity

| Item | Exact value |
| --- | --- |
| Custom Cabinet commit | `3d057140fdf26f55ca6a390cc9bca0261e0161ff` |
| Custom Cabinet version/tag | `1.65.0`; `cabinet-v2026.08.22.1` |
| Upstream Cabinet tag/SHA | `v1.65.0` / `b866bebeeb6032db4baa3869a4917316fe8e0453` |
| Upstream Bot tag/SHA | `v4.0.0` / `f553d1896dcd347fd74012f6394fd2277161bdd1` |
| Installer tag/SHA | `v2026.08.16` / `a5af6c72069a98b42e97cfb17ebcf1d59443324f` |
| Release Bundle | `v2026.08.16` |
| Cabinet artifact SHA-256 | `6db87dfe85ea8d5c796aa1109a87877117c7355366393cb69e25bdc5cedadc89` |
| Installer archive SHA-256 | `ffa07675af7731d07bb1c8020dfc40d19c79150b35428dcc5268bb4cf00813d2` |
| Rollback Release Bundle | `v2026.08.15`; Cabinet `3f7bb3146977f1496f2f453c5ca1b362b3731c00` |

Release URL: <https://github.com/alexforworkgpt-source/installer/releases/tag/v2026.08.16>

Workflow URL: <https://github.com/alexforworkgpt-source/installer/actions/runs/32557619647>

## Environment

| Item | Value |
| --- | --- |
| Integration URL | `https://web.demolanding.click` |
| Environment type | Disposable integration VPS; not production |
| Verification time | `2026-08-22T06:56:48Z` |
| Deployed browser smoke | Playwright Chromium `151.0.7922.34` |
| Telegram clients | Not available |
| Checked account | Clean unauthenticated guest only |

## Change Scope

- Restored the visible traffic refresh countdown and explicit refresh label.
- Refined accent actions on Dashboard, Balance, news, contests and OAuth.
- Moved email management from Profile to Connected Accounts.
- Added automatic Connection progress after opening an installation link and a
  fallback confirmation action.
- Made primary Connection actions full-width and centered on desktop.

## Automated Gate

| Command or gate | Result | Notes |
| --- | --- | --- |
| `npm ci` | PASS | Clean dependency installation completed |
| `npm run check` | PASS | No errors; 262 existing warnings and 102 infos |
| Unit tests | PASS | 142 tests |
| `npm run type-check` | PASS | Exit 0 |
| `npm run build` | PASS | Production build completed |
| Playwright | PASS | 161 passed; 5 expected skips |
| Cabinet GitHub Actions | PASS | CI, Security Audit and CodeQL passed for the exact source commit |
| Release workflow | PASS | Contract tests, deterministic double build, manifest and draft verification passed |
| Public asset verification | PASS | Six assets downloaded without a token; both checksums and exact identities verified |

## Deployment

| Item | Result |
| --- | --- |
| Installation method | Fresh targeted installation from immutable `v2026.08.16/release.json` |
| Runtime-change outcome | `committed` |
| Installed Release Bundle | `2026.08.16` |
| Installed Cabinet SHA | `3d057140fdf26f55ca6a390cc9bca0261e0161ff` |
| Installed Cabinet artifact | `6db87dfe85ea8d5c796aa1109a87877117c7355366393cb69e25bdc5cedadc89` |
| Installed Bot SHA | `f553d1896dcd347fd74012f6394fd2277161bdd1` |
| Runtime containers | 3 under Compose project `bedolaga-bot-stack-4e143ee2` |
| Installer doctor | PASS |
| Unified health | PASS, HTTP `200` |
| Branding API | PASS, HTTP `200` |
| Root and direct `/balance` route | PASS, HTTP `200` |
| Clean guest Chromium smoke | PASS; redirected to `/login`, no console errors or failed same-origin responses |

The first temporary smoke harness incorrectly allowed Installer state discovery to
fall back from the requested test root to the existing disposable baseline root.
The Installer rejected the mismatched PostgreSQL identity before container deploy,
but the harness cleanup removed that baseline. The harness was corrected to pin
cleanup to the exact requested root, and the disposable baseline was fully restored
by the successful fresh `v2026.08.16` installation above. This was a test-harness
incident, not a defect in the published Bundle. Production was not accessed.

## Functional Results

| Area | Result | Checked scenarios | Limitations |
| --- | --- | --- | --- |
| Runtime smoke | PASS | Exact identities, deploy receipt, doctor, HTTPS, health and branding | Disposable VPS only |
| Web authentication | PASS guest | Root and direct route redirect to visible Login | Authenticated accounts not checked |
| Dashboard | PASS locally | Traffic countdown, refresh action and responsive fixtures | No authenticated VPS state |
| Connection | PASS locally | Link progress, fallback confirmation, Back and responsive button sizing | Real app schemes and Telegram clients not checked |
| Profile/accounts | PASS locally | Connected Accounts email placement and email management fixtures | No live email mutation |
| Other Cabinet flows | PASS locally | Existing unit and Playwright suites | No payment or destructive admin action |

## Release Publication

- Release is public, latest, not draft and not prerelease.
- Existing Release tags and assets were not modified.
- Installer tag `v2026.08.16` dereferences to
  `a5af6c72069a98b42e97cfb17ebcf1d59443324f`, the same Installer commit used by
  the previous verified Bundle.
- Upstream Bot SHA and all PostgreSQL, Redis, Node builder and Nginx digests are
  unchanged from `v2026.08.15`.
- Both published `.sha256` files pass verification.
- Installer archive excludes `server.env`, `env.txt`, `.playwright-mcp`,
  `__pycache__` and `*.pyc`.

## Residual Risks

- Authenticated integration states were not checked.
- Real Telegram Android, iOS and Desktop clients were unavailable.
- No real payment, email mutation or destructive admin action was initiated.
- `npm audit` reports five high-severity findings in Telegram SDK/valibot; the
  available forced remediation requires a breaking dependency change.
- Existing Biome warnings remain unchanged.

## Staging Decision

Result: `BLOCKED`

Reason:

```text
The exact source, automated gates, public assets, fresh disposable installation,
runtime health and clean guest browser smoke passed. Authenticated integration,
real Telegram clients and provider evidence are unavailable, so the complete
staging matrix remains BLOCKED.
```

## Production Smoke

Status: `NOT STARTED`

The disposable integration VPS was installed and verified. Production was not
deployed, accessed or modified.

## Rollback

Rollback required: `No`<br>
Rollback Release Bundle: `v2026.08.15`<br>
Rollback result: `NOT NEEDED`<br>
Post-update health/Login: `PASS`

## Final Sign-off

- [x] Exact source versions recorded.
- [x] Automated gate passed.
- [x] Public Release assets independently verified.
- [x] Disposable integration installation and guest smoke passed.
- [ ] Required authenticated staging flows completed.
- [ ] Real Telegram checks completed.
- [x] Rollback source recorded.
- [x] Report contains no secrets or personal data.
- [x] Production smoke marked `NOT STARTED`.

Final result: `BLOCKED`

Рекомендуемый уровень рассуждения для следующей задачи: высокий — authenticated
staging and real Telegram checks require isolated test accounts and explicit
read-only boundaries.
