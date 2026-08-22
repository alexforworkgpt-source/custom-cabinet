# Live Check Report: `v2026.08.17`

Status: `BLOCKED`<br>
Date: `2026-08-22`<br>
Checker: `OpenCode`<br>
Release owner: `workspace owner`

## Source Identity

| Item | Exact value |
| --- | --- |
| Custom Cabinet commit | `23c9889f6ab1ad514faf36ad9cbf66dc5407ad44` |
| Custom Cabinet version/tag | `1.65.0`; `cabinet-v2026.08.22.2` |
| Upstream Cabinet tag/SHA | `v1.65.0` / `b866bebeeb6032db4baa3869a4917316fe8e0453` |
| Upstream Bot tag/SHA | `v4.0.0` / `f553d1896dcd347fd74012f6394fd2277161bdd1` |
| Installer tag/SHA | `v2026.08.17` / `a5af6c72069a98b42e97cfb17ebcf1d59443324f` |
| Release Bundle | `v2026.08.17` |
| Cabinet artifact SHA-256 | `e778f7f2106b0fc83e9a3cebc90f4ba616e1e5ebbe20713e6941d12c98863739` |
| Installer archive SHA-256 | `ffa07675af7731d07bb1c8020dfc40d19c79150b35428dcc5268bb4cf00813d2` |
| Rollback Release Bundle | `v2026.08.16`; Cabinet `3d057140fdf26f55ca6a390cc9bca0261e0161ff` |

Custom Cabinet Release: <https://github.com/alexforworkgpt-source/custom-cabinet/releases/tag/cabinet-v2026.08.22.2>

Release Bundle: <https://github.com/alexforworkgpt-source/installer/releases/tag/v2026.08.17>

Workflow: <https://github.com/alexforworkgpt-source/installer/actions/runs/32587249925>

## Environment

| Item | Value |
| --- | --- |
| Integration URL | `https://web.demolanding.click` |
| Environment type | Disposable integration VPS; not production |
| Verification time | `2026-08-22T17:27:02Z` |
| Browser smoke | Chrome `151.0.0.0`, desktop and mobile `375 x 812` emulation |
| Telegram clients | Not available |
| Checked account | Clean unauthenticated guest only |

## Change Scope

- Added personalized Dashboard promo actions for account setup, referral and
  deposit flows.
- Applied backend promo discounts consistently in subscription UI.
- Extracted sanitized Telegram HTML rendering for broadcast previews.
- Completed the repository-wide Biome cleanup and small reliability fixes.

## Automated Gate

| Command or gate | Result | Notes |
| --- | --- | --- |
| `npm ci` | PASS WITH RISKS | Clean install; five known high-severity findings remain in the unchanged Telegram SDK/valibot chain |
| `npm run check` | PASS | 550 files; no diagnostics |
| Unit tests | PASS | 154 tests |
| `npm run type-check` | PASS | Exit 0 |
| `npm run build` | PASS | Production build completed |
| Playwright | PASS | 186 passed; 5 expected skips |
| Cabinet GitHub Actions | PASS | CI, Security Audit and CodeQL passed for the exact source commit |
| Release workflow | PASS | Contract tests, deterministic double build, manifest and draft verification passed |
| Public asset verification | PASS | Six assets downloaded without a token; both checksums, archive content and exact identities verified |

## Deployment

| Item | Result |
| --- | --- |
| Installation method | Protected Update from immutable `v2026.08.17/release.json` |
| Previous Release Bundle | `2026.08.16` |
| Runtime-change outcome | `committed` |
| Installed Release Bundle | `2026.08.17` |
| Installed Cabinet tag/SHA | `cabinet-v2026.08.22.2` / `23c9889f6ab1ad514faf36ad9cbf66dc5407ad44` |
| Installed Cabinet artifact | `e778f7f2106b0fc83e9a3cebc90f4ba616e1e5ebbe20713e6941d12c98863739` |
| Installed Bot SHA | `f553d1896dcd347fd74012f6394fd2277161bdd1` |
| Runtime containers | 3 under the existing disposable Compose project |
| Installer doctor | PASS before update, after update and during postflight |
| Unified health | PASS, HTTP `200` |
| Root and direct `/balance` route | PASS, HTTP `200`; response matches the published `index.html` |
| Real Cabinet assets | PASS, HTTP `200`, JavaScript/CSS content types |
| Clean guest browser smoke | PASS; redirected to `/login`, all 34 requests succeeded, no console warnings/errors |
| Mobile browser smoke | PASS; no page-level horizontal overflow at `375 x 812` |

## Functional Results

| Area | Result | Checked scenarios | Limitations |
| --- | --- | --- | --- |
| Runtime smoke | PASS | Exact identities, deploy receipt, doctor, HTTPS, health and artifact identity | Disposable VPS only |
| Web authentication | PASS guest | Root and direct route redirect to visible Login | Authenticated accounts not checked |
| Dashboard | PASS locally | Promo ordering, account-provider loading, rotation, pause, subscription states and responsive fixtures | No authenticated VPS state |
| Subscription discounts | PASS locally | Promo discount normalization and display fixtures | No live purchase or payment |
| Broadcast preview | PASS locally | Sanitized Telegram entities and line breaks | No live broadcast sent |
| Other Cabinet flows | PASS locally | Existing unit and Playwright suites | No destructive admin action |

## Defects

| ID | Severity | Route/platform | Reproduction | Expected | Actual | Release blocker |
| --- | --- | --- | --- | --- | --- | --- |
| `LC-2026-08-17-01` | Medium | Missing `/assets/*.js` on the disposable VPS | Request a non-existent hashed asset | HTTP `404` without HTML fallback | Installer SHA `a5af6c7` returns HTTP `200` with `text/html` and immutable caching | No for this Cabinet-only Bundle; behavior predates it and real release assets load correctly |

The missing-asset behavior comes from the immutable Installer SHA reused by this
Cabinet-only Bundle. A local Installer commit changes the Caddy template, but it
was not included because it has not passed the required full lifecycle gate.

## Residual Risks

- Authenticated integration states were not checked.
- Real Telegram Android, iOS and Desktop clients were unavailable.
- No real payment, email mutation, broadcast or destructive admin action was
  initiated.
- `npm audit` reports five high-severity findings in Telegram SDK/valibot; the
  available forced remediation requires a breaking dependency change.
- The verified Installer baseline has the missing-asset HTML fallback described
  in `LC-2026-08-17-01`.

## Staging Decision

Result: `BLOCKED`

Reason:

```text
The exact source, automated gates, public assets, Protected Update, runtime
health and clean guest browser smoke passed. Authenticated integration, real
Telegram clients and provider evidence are unavailable, so the complete staging
matrix remains BLOCKED.
```

## Production Smoke

Status: `NOT STARTED`

The disposable integration VPS was updated and verified. Production was not
accessed or modified.

## Rollback

Rollback required: `No`<br>
Rollback Release Bundle: `v2026.08.16`<br>
Rollback result: `NOT NEEDED`<br>
Post-update health/Login: `PASS`

## Final Sign-off

- [x] Exact source versions recorded.
- [x] Automated gate passed.
- [x] Public Release assets independently verified.
- [x] Disposable integration Protected Update and guest smoke passed.
- [ ] Required authenticated staging flows completed.
- [ ] Real Telegram checks completed.
- [x] Rollback source recorded.
- [x] Report contains no secrets or personal data.
- [x] Production smoke marked `NOT STARTED`.

Final result: `BLOCKED`

Рекомендуемый уровень рассуждения для следующей задачи: очень высокий — новый
Installer lifecycle gate и authenticated Telegram staging затрагивают recovery,
real-device behavior и hard-to-reverse release identities.
