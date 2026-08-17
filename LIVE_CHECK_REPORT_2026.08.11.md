# Live Check Report: `v2026.08.11`

Status: `BLOCKED`<br>
Date: `2026-08-18`<br>
Checker: `OpenCode`<br>
Release owner: `workspace owner`

## Source Identity

| Item | Exact value |
| --- | --- |
| Custom Cabinet commit | `e2bd33df4602537c92eb02475673f3bad66afec2` |
| Custom Cabinet version/tag | `1.65.0`; Release source is the exact commit above |
| Upstream Cabinet tag/SHA | `v1.65.0` / `b866bebeeb6032db4baa3869a4917316fe8e0453` |
| Upstream Bot tag/SHA | `v4.0.0` / `f553d1896dcd347fd74012f6394fd2277161bdd1` |
| Installer tag/SHA | `v2026.08.11` / `a5af6c72069a98b42e97cfb17ebcf1d59443324f` |
| Release Bundle | `v2026.08.11` |
| Cabinet artifact SHA-256 | `6603a92028d22485a3f0a7a7b15887a9f5560a1ae127c666f26ea3d6e69e8dac` |
| Installer archive SHA-256 | `ffa07675af7731d07bb1c8020dfc40d19c79150b35428dcc5268bb4cf00813d2` |
| Rollback Release Bundle | `v2026.08.10`; Cabinet `b5b34848b752b0ec66a9ca68b121d4b58264a0c5` |

Release URL: <https://github.com/alexforworkgpt-source/installer/releases/tag/v2026.08.11>

## Environment

| Item | Value |
| --- | --- |
| Integration URL | `https://web.demolanding.click` |
| Environment type | Disposable integration VPS; not recorded as production |
| Postflight verification time | `2026-08-17T22:13:47Z` |
| Browser automation | Playwright Chromium projects at 320, 375, 768, 1024 and 1280 px |
| Deployed browser smoke | Playwright Chromium `151.0.7922.34` |
| Telegram clients | Not available |
| Enabled themes | Dark and light covered by existing local fixtures |
| Checked locales | English and Russian in changed critical flows |

## Change Scope

- Clarified Connection hierarchy, selected-device presentation and mobile header alignment.
- Made the payment-method chooser compact while preserving amount validation on the next step.
- Opened the classic period constructor directly from Tariffs without changing Cabinet tariff mode.

## Automated Gate

| Command or gate | Result | Notes |
| --- | --- | --- |
| `npm run check` | PASS | Exit 0; 274 existing warnings and 102 infos remain |
| `npm test` | PASS | 20 files, 137 tests |
| `npm run type-check` | PASS | Exit 0 |
| `npm run build` | PASS | Production build completed; Browserslist warning remains |
| `npm run test:e2e -- --workers=4` | PASS | 62 passed, 1 expected skip across all configured projects |
| `git diff --check` | PASS | Intended source and test commit |
| Secret/public-branding diff scan | PASS | No secret-shaped additions or accidental upstream branding changes |
| Release workflow | PASS | <https://github.com/alexforworkgpt-source/installer/actions/runs/32069487311> |
| Deterministic artifact | PASS | Workflow built Cabinet twice and compared the results |
| Public asset verification | PASS | Six assets downloaded without a token; checksums, manifest, provenance and archive identity verified |

## Deployment

| Item | Result |
| --- | --- |
| Baseline | Release `2026.08.10`; exact Bot, Cabinet and artifact identities; health and Installer doctor PASS |
| Update method | Protected Update from immutable `v2026.08.11/release.json` |
| Protected Update outcome | `committed` |
| Installed Release Bundle | `2026.08.11` |
| Installed Cabinet SHA | `e2bd33df4602537c92eb02475673f3bad66afec2` |
| Installed Cabinet artifact | `6603a92028d22485a3f0a7a7b15887a9f5560a1ae127c666f26ea3d6e69e8dac` |
| Installed Bot SHA | `f553d1896dcd347fd74012f6394fd2277161bdd1` |
| Runtime-change receipt | `outcome=committed` |
| Installer doctor | PASS after update and in a separate postflight SSH session |
| Unified health | PASS, HTTP `200` |
| Branding API | PASS, HTTP `200` |
| Root and direct `/balance` route | PASS, HTTP `200`; guest redirected to `/login` |
| Clean guest Chromium smoke | PASS; visible Login, no console errors, failed same-origin requests or unexpected 4xx/5xx responses |

## Functional Results

| Area | Result | Checked scenarios | Limitations |
| --- | --- | --- | --- |
| Dashboard/Connection | PASS locally | Device choice, CTA hierarchy, Back, reload fallback, Russian 320 px header and overflow | Real app schemes and Telegram clients not checked |
| Subscription/purchase | PASS locally | Classic Tariffs entry at 320 and 1280 px, period selection, preview and mocked purchase | No authenticated staging account |
| Balance/payments | PASS locally | Six-method layout, amount validation, cancellation, handoff and result return | No sandbox or real provider mutation |
| Other Cabinet flows | PASS locally | Full existing Playwright suite | Live WebSocket and authenticated integration matrix not checked |
| Runtime smoke | PASS | Exact Bundle identities, health, doctor, root, direct protected route, branding and guest Login | Authenticated integration state matrix not checked |

## Release Publication

- Release is public, not draft and not prerelease.
- Existing Release tags and assets were not modified.
- Installer tag `v2026.08.11` dereferences to `a5af6c72069a98b42e97cfb17ebcf1d59443324f`.
- Manifest records Cabinet `e2bd33df4602537c92eb02475673f3bad66afec2` and the expected immutable Bot and image identities.
- Both published `.sha256` files pass verification.
- The Installer archive matches `git archive v2026.08.11` and excludes `server.env`, `env.txt`, `.playwright-mcp`, `__pycache__` and `*.pyc`.

## Residual Risks

- Authenticated integration state matrix and production smoke were not run.
- Real Telegram Android, iOS and Desktop clients were unavailable.
- No real payment or destructive action was initiated.
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

No production deployment or production mutation was initiated.

## Rollback

Rollback required: `No`<br>
Rollback Release Bundle: `v2026.08.10`<br>
Rollback result: `NOT NEEDED`<br>
Post-rollback health/Login: `not applicable`; post-update health/Login `PASS`

## Final Sign-off

- [x] Exact source versions recorded.
- [x] Automated gate passed.
- [x] Public Release assets independently verified.
- [ ] Required authenticated staging flows completed.
- [ ] Real Telegram checks completed.
- [x] Rollback source recorded.
- [x] Report contains no secrets or personal data.
- [x] Production smoke marked `NOT STARTED`.

Final result: `BLOCKED`
