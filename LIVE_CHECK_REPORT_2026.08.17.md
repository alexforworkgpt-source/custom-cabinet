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
| Verification time | `2026-08-22T17:34:00Z` |
| Browser smoke | Chrome `151.0.0.0`, desktop and mobile `375 x 812` emulation |
| Telegram clients | Not available |
| Checked accounts | Clean unauthenticated guest; one authorized full-admin test account with a trial subscription |

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
| Authenticated browser smoke | PASS; Dashboard, subscription, Balance, Profile/accounts, Connection and read-only Admin loaded without console errors or unexpected failed requests |
| Mobile browser smoke | PASS; no page-level horizontal overflow at `375 x 812` |

## Functional Results

| Area | Result | Checked scenarios | Limitations |
| --- | --- | --- | --- |
| Runtime smoke | PASS | Exact identities, deploy receipt, doctor, HTTPS, health and artifact identity | Disposable VPS only |
| Web authentication | PASS | Guest redirect and an existing authorized session | Registration, logout and invalid credentials not checked |
| Dashboard | PASS | Real trial subscription, traffic, promo carousel rotation and responsive layout | Other live subscription states unavailable |
| Subscription management | PASS read-only | Management dialog and device summary | No renewal, device mutation or purchase |
| Subscription discounts | PASS locally | Promo discount normalization and display fixtures | No live active discount, purchase or payment |
| Balance | PASS read-only | Current balance, promo field and history entry point | No top-up or promocode activation |
| Connection | PASS read-only | Platform detection and application selection through the download step | No external download, app launch or deep link |
| Profile/accounts | PASS read-only | Profile summary and linked-provider state | No account or notification mutation |
| Broadcast preview | PASS | Staging Admin form rendered harmless Telegram HTML and link preview | No audience selected and no broadcast sent |
| Admin | PASS read-only | Admin dashboard and broadcast-create screen | Restricted role and mutations not checked |
| Other Cabinet flows | PASS locally | Existing unit and Playwright suites | No destructive action |

## Defects

| ID | Severity | Route/platform | Reproduction | Expected | Actual | Release blocker |
| --- | --- | --- | --- | --- | --- | --- |
| `LC-2026-08-17-01` | Medium | Missing `/assets/*.js` on the disposable VPS | Request a non-existent hashed asset | HTTP `404` without HTML fallback | Installer SHA `a5af6c7` returns HTTP `200` with `text/html` and immutable caching | No for this Cabinet-only Bundle; behavior predates it and real release assets load correctly |

The missing-asset behavior comes from the immutable Installer SHA reused by this
Cabinet-only Bundle. A local Installer commit changes the Caddy template, but it
was not included because it has not passed the required full lifecycle gate.

## Residual Risks

- Only one full-admin trial account was checked; new, paid, expiring, expired,
  multi-subscription and restricted-admin states were unavailable.
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
health, guest smoke and a non-destructive authenticated full-admin smoke passed.
The complete account-state matrix, restricted-admin role, real Telegram clients
and provider evidence are unavailable, so the complete staging matrix remains
BLOCKED.
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
- [x] Disposable integration Protected Update, guest smoke and targeted authenticated smoke passed.
- [ ] Required authenticated staging flows completed.
- [ ] Real Telegram checks completed.
- [x] Rollback source recorded.
- [x] Report contains no secrets or personal data.
- [x] Production smoke marked `NOT STARTED`.

Final result: `BLOCKED`

Рекомендуемый уровень рассуждения для следующей задачи: очень высокий — новый
Installer lifecycle gate и authenticated Telegram staging затрагивают recovery,
real-device behavior и hard-to-reverse release identities.
