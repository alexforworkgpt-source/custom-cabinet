# Live Check Report: `v2026.08.12`

Status: `BLOCKED`<br>
Date: `2026-08-18`<br>
Checker: `OpenCode`<br>
Release owner: `workspace owner`

## Source Identity

| Item | Exact value |
| --- | --- |
| Custom Cabinet commit | `618e79823a06334d8ab8676cfa477d2b44f12c4e` |
| Custom Cabinet version/tag | `1.65.0`; Release source is the exact commit above |
| Upstream Cabinet tag/SHA | `v1.65.0` / `b866bebeeb6032db4baa3869a4917316fe8e0453` |
| Upstream Bot tag/SHA | `v4.0.0` / `f553d1896dcd347fd74012f6394fd2277161bdd1` |
| Installer tag/SHA | `v2026.08.12` / `a5af6c72069a98b42e97cfb17ebcf1d59443324f` |
| Release Bundle | `v2026.08.12` |
| Cabinet artifact SHA-256 | `b1aa75bc16b352df42de0c13d01a7135cd05fb96041a832a3030c7d41fd4accf` |
| Installer archive SHA-256 | `ffa07675af7731d07bb1c8020dfc40d19c79150b35428dcc5268bb4cf00813d2` |
| Rollback Release Bundle | `v2026.08.11`; Cabinet `e2bd33df4602537c92eb02475673f3bad66afec2` |

Release URL: <https://github.com/alexforworkgpt-source/installer/releases/tag/v2026.08.12>

Workflow URL: <https://github.com/alexforworkgpt-source/installer/actions/runs/32082538046>

## Environment

| Item | Value |
| --- | --- |
| Local browser automation | Playwright Chromium projects at 320, 375, 768, 1024 and 1280 px; focused Telegram-style viewport at 420 px |
| Integration URL | `https://web.demolanding.click` |
| Environment type | Disposable integration VPS; not recorded as production |
| Postflight verification time | `2026-08-18T00:06:43Z` |
| Deployed browser smoke | Playwright Chromium `151.0.7922.34` |
| Telegram clients | Not available |
| Enabled themes | Dark and light covered by existing local fixtures |
| Checked locales | English and Russian in changed critical flows |

## Change Scope

- Moved configured Connection actions below their content sections.
- Made the subscription deep link advance directly to Connection success.
- Removed the redundant manual `Subscription added` action.
- Prevented a long Russian traffic value from losing its right-side spacing at
  420 px by allowing the left Dashboard header content to shrink.
- Added explicit locale selection to the Playwright test harness and a focused
  420 px traffic regression test.

## Automated Gate

| Command or gate | Result | Notes |
| --- | --- | --- |
| `npm run check` | PASS | Exit 0; 276 existing warnings and 102 infos remain |
| `npm test` | PASS | 20 files, 137 tests |
| `npm run type-check` | PASS | Exit 0 |
| `npm run build` | PASS | Production build completed; stale Browserslist data warning remains |
| `npm run test:e2e -- --workers=4` | PASS | 63 passed, 1 expected skip across all configured projects |
| Focused 420 px regression | PASS | Long `987.6 GB / 999.9 GB` equivalent remains inside the Russian Dashboard card |
| `git diff --check` | PASS | Intended source, test and report commit |
| Secret/public-branding diff scan | PASS | No secret-shaped additions or accidental upstream branding changes |
| Release workflow | PASS | Contract tests, deterministic Cabinet build, manifest and draft verification passed |
| Public asset verification | PASS | Six assets downloaded without a token; checksums, identities, archive structure and tag identity verified |

## Functional Results

| Area | Result | Checked scenarios | Limitations |
| --- | --- | --- | --- |
| Dashboard | PASS locally | Active states, themes, responsive matrix and long Russian traffic at 420 px | No authenticated integration account |
| Connection | PASS locally | Install/add actions outside content, direct success, Back, reload fallback and legacy entry | Real app schemes and Telegram clients not checked |
| Subscription/purchase | PASS locally | Existing tariff, management and top-up browser tests | No sandbox provider mutation |
| Other Cabinet flows | PASS locally | Full existing Playwright suite | Known findings in `LIVE_CHECK_REPORT_2026-08-18_LC_REAUDIT.md` remain open |
| Runtime smoke | PASS | Exact Bundle identities, health, doctor, root, direct protected route, branding and guest Login | Authenticated integration state matrix not checked |

## Deployment

| Item | Result |
| --- | --- |
| Baseline | Release `2026.08.11`; exact Bot, Cabinet and artifact identities; health and Installer doctor PASS |
| Update method | Protected Update from immutable `v2026.08.12/release.json` |
| Protected Update outcome | `committed` |
| Installed Release Bundle | `2026.08.12` |
| Installed Cabinet SHA | `618e79823a06334d8ab8676cfa477d2b44f12c4e` |
| Installed Cabinet artifact | `b1aa75bc16b352df42de0c13d01a7135cd05fb96041a832a3030c7d41fd4accf` |
| Installed Bot SHA | `f553d1896dcd347fd74012f6394fd2277161bdd1` |
| Runtime-change receipt | `outcome=committed` |
| Installer doctor | PASS after update and in a separate postflight SSH session |
| Unified health | PASS, HTTP `200` |
| Branding API | PASS, HTTP `200` |
| Root and direct `/balance` route | PASS, HTTP `200`; guest redirected to `/login` |
| Clean guest Chromium smoke | PASS; visible Login, no console errors, failed same-origin requests or unexpected `4xx/5xx` responses |

## Release Publication

- Release is public, not draft and not prerelease.
- Existing Release tags and assets were not modified.
- Installer tag `v2026.08.12` dereferences to
  `a5af6c72069a98b42e97cfb17ebcf1d59443324f`.
- Manifest records Cabinet `618e79823a06334d8ab8676cfa477d2b44f12c4e`
  and Upstream Bot `f553d1896dcd347fd74012f6394fd2277161bdd1`.
- Both published `.sha256` files pass verification.
- Cabinet archive contains root `index.html` and no unsafe parent paths.
- Installer archive matches `git archive v2026.08.12` and excludes `server.env`,
  `env.txt`, `.playwright-mcp`, `__pycache__` and `*.pyc`.

## Residual Risks

- Authenticated integration state matrix and production smoke were not run.
- Real Telegram Android, iOS and Desktop clients were unavailable.
- No real payment or destructive action was initiated.
- Existing findings marked `OPEN` or `PARTIAL` in the LC re-audit are not closed
  by this focused Release.
- Existing Biome warnings and the stale `caniuse-lite` warning remain unchanged.

## Staging Decision

Result: `BLOCKED`

Reason:

```text
The exact source, automated gates, Release workflow, public assets, Protected
Update and deployed guest smoke passed. Authenticated integration, real Telegram
and sandbox-provider evidence is not available, so the overall result remains
BLOCKED.
```

## Production Smoke

Status: `NOT STARTED`

The disposable integration VPS was updated. Production was not deployed or
modified.

## Rollback

Rollback required: `No`<br>
Rollback Release Bundle: `v2026.08.11`<br>
Rollback result: `NOT NEEDED`<br>
Post-rollback health/Login: `not applicable`; post-update health/Login `PASS`

## Final Sign-off

- [x] Exact source versions recorded.
- [x] Automated gate passed.
- [x] Public Release assets independently verified.
- [x] Disposable integration update and guest smoke passed.
- [ ] Required authenticated staging flows completed.
- [ ] Real Telegram checks completed.
- [x] Rollback source recorded.
- [x] Report contains no secrets or personal data.
- [x] Production smoke marked `NOT STARTED`.

Final result: `BLOCKED`

Рекомендуемый уровень рассуждения для следующей задачи: высокий — staging и
Telegram-проверки требуют безопасно отделить read-only smoke от любых реальных
платёжных или пользовательских изменений.
