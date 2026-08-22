# Live Check Report: `v2026.08.18`

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
| Installer tag/SHA | `v2026.08.18` / `8d5feb922958f6d3deed0f837060059d1919b356` |
| Release Bundle | `v2026.08.18` |
| Cabinet artifact SHA-256 | `e778f7f2106b0fc83e9a3cebc90f4ba616e1e5ebbe20713e6941d12c98863739` |
| Installer archive SHA-256 | `89f1add764f6b6519e2dd3aaa8179479e32dcdf405c446bc1cb37b44d2a6f75a` |
| Rollback Release Bundle | `v2026.08.17`; Installer `a5af6c72069a98b42e97cfb17ebcf1d59443324f` |

Custom Cabinet Release: <https://github.com/alexforworkgpt-source/custom-cabinet/releases/tag/cabinet-v2026.08.22.2>

Release Bundle: <https://github.com/alexforworkgpt-source/installer/releases/tag/v2026.08.18>

Workflow: <https://github.com/alexforworkgpt-source/installer/actions/runs/32590552077>

## Environment

| Item | Value |
| --- | --- |
| Integration URL | `https://web.demolanding.click` |
| Environment type | Disposable integration VPS; not production |
| Verification time | `2026-08-22T18:38:12Z` |
| Browser smoke | Chrome `151.0.7922.34`, desktop headless context |
| Telegram clients | Not available |
| Checked accounts | Clean unauthenticated guest only for this Installer-only Bundle |

## Change Scope

- Installer-only Release Bundle; Custom Cabinet, Upstream Bot, runtime image
  identities and Release Bundle contract are unchanged from `v2026.08.17`.
- The Installer now handles `/assets/*` without the SPA fallback, so a missing
  hashed asset returns `404` instead of cacheable HTML.
- The app shell and direct-route HTML fallback now use `no-store` caching.
- No Custom Cabinet runtime source or Telegram SDK dependency was changed.

## Automated Gate

| Command or gate | Result | Notes |
| --- | --- | --- |
| Old-template regression signal | PASS | The current production-readiness test rejects the `v2026.08.17` Caddy template and accepts the new template |
| Installer unit tests | PASS | 92 tests; 5 expected skips |
| Installer shell integration gate | PASS | Package-manager lock plus 18 integration harnesses passed |
| Full disposable Ubuntu 24.04 lifecycle | PASS | Fresh/repeat install, settings, Protected Update, injected verified rollback, Recovery, second project and uninstall passed on exact Installer SHA |
| Lifecycle final postflight | PASS | Project, Caddy snippet and private integration env absent; 0 containers and 0 volumes; management launcher preserved |
| Custom Cabinet source gate | REUSED | Exact Cabinet SHA and artifact are unchanged from the verified `v2026.08.17` report |
| Release workflow | PASS | Contract tests, deterministic double Cabinet build, manifest, provenance and draft verification passed |
| Public asset verification | PASS | Six assets downloaded without a token; both checksums, exact tag archive, safe archive structure and pinned identities verified |

The first lifecycle attempt encountered the previous disposable targeted
installation through its stale project locator and stopped before replacing its
PostgreSQL identity. The authorized cleanup removed that disposable stack. A
bounded rerun from a clean host passed the complete lifecycle and final
postflight on `8d5feb922958f6d3deed0f837060059d1919b356`.

## Deployment

| Item | Result |
| --- | --- |
| Installation method | Fresh first-install transaction from the public `v2026.08.18` Installer archive and `release.json` |
| Previous tested Release Bundle | `v2026.08.17` |
| Runtime-change outcome | `committed` |
| Installed Release Bundle | `2026.08.18` |
| Installed Cabinet tag/SHA | `cabinet-v2026.08.22.2` / `23c9889f6ab1ad514faf36ad9cbf66dc5407ad44` |
| Installed Cabinet artifact | `e778f7f2106b0fc83e9a3cebc90f4ba616e1e5ebbe20713e6941d12c98863739` |
| Installed Bot SHA | `f553d1896dcd347fd74012f6394fd2277161bdd1` |
| Runtime containers | 3 under the disposable integration Compose project |
| Installer doctor | PASS after install and during independent postflight |
| Unified health | PASS, HTTP `200` |
| Root and direct `/balance` route | PASS, HTTP `200`; body exactly matches published `index.html`; `Cache-Control: no-store, no-cache, must-revalidate, max-age=0` |
| Real Cabinet entry assets | PASS, 12 JS/CSS assets returned HTTP `200`, correct content types and immutable cache |
| Missing Cabinet asset | PASS, random `/assets/*.js` returned HTTP `404` and not HTML |
| Clean guest browser smoke | PASS; `/` and `/balance` redirected in-app to `/login`, with no console errors, failed requests or unexpected error responses |

## Functional Results

| Area | Result | Checked scenarios | Limitations |
| --- | --- | --- | --- |
| Installer lifecycle | PASS | Complete destructive lifecycle and final cleanup on exact release SHA | Disposable VPS only |
| Release Bundle installation | PASS | Public Installer archive, manifest, exact identities, committed receipt, doctor and unified health | Fresh installation; no production rollout |
| App-shell caching | PASS | Root and direct route match the published artifact and use `no-store` | Chromium and direct HTTP probes only |
| Hashed asset caching | PASS | Published JS/CSS use immutable cache; a random missing JS returns `404` without HTML | Entry assets only |
| Guest browser runtime | PASS | Root and direct protected route load with clean console/network | Authenticated flows were not repeated for this Installer-only Bundle |
| Custom Cabinet product flows | REUSED / BLOCKED | Exact source and artifact are unchanged from `v2026.08.17` | Full account matrix, real Telegram and provider evidence remain unavailable |

## Defects

| ID | Result | Evidence |
| --- | --- | --- |
| `LC-2026-08-17-01` | RESOLVED on disposable integration VPS | Missing `/assets/*.js` now returns HTTP `404` without the SPA HTML fallback; root and direct-route HTML use `no-store` |

No new release-blocking Installer defect was found.

## Residual Risks

- This was an Installer-only Bundle, so authenticated Custom Cabinet product
  flows were not repeated after confirming the unchanged artifact identity.
- The complete new, paid, expiring, expired, multi-subscription and
  restricted-admin account matrix remains unavailable.
- Real Telegram Android, iOS and Desktop clients remain unavailable.
- No real payment, email mutation, broadcast or destructive admin action was
  initiated.
- The five known high-severity findings in the unchanged Telegram SDK/valibot
  dependency chain remain outside this explicitly authorized release scope.

## Staging Decision

Result: `BLOCKED`

Reason:

```text
The exact Installer lifecycle, Release Bundle publication, public assets,
fresh installation, runtime health, corrected cache behavior and clean guest
browser smoke passed. The unchanged Custom Cabinet still lacks the complete
account-state matrix, restricted-admin, real Telegram and provider evidence,
so full product staging sign-off remains BLOCKED.
```

## Production Smoke

Status: `NOT STARTED`

Only the disposable integration VPS was changed. Production was not accessed or
modified.

## Rollback

Rollback required: `No`<br>
Rollback Release Bundle: `v2026.08.17`<br>
Rollback evidence: public assets and the previous targeted installation were
verified in [`LIVE_CHECK_REPORT_2026.08.17.md`](LIVE_CHECK_REPORT_2026.08.17.md).<br>
Rollback result: `NOT NEEDED`<br>
Post-install health/Login: `PASS` for health and guest Login

## Final Sign-off

- [x] Exact source versions recorded.
- [x] Full Installer lifecycle and final postflight passed on the published SHA.
- [x] Public Release assets independently verified without a token.
- [x] Disposable fresh installation committed with exact identities.
- [x] Missing-asset, app-shell cache, health and guest browser smoke passed.
- [ ] Required authenticated staging flows completed for the full product matrix.
- [ ] Real Telegram checks completed.
- [x] Rollback source recorded.
- [x] Report contains no secrets or personal data.
- [x] Production smoke marked `NOT STARTED`.

Final result: `BLOCKED`

Рекомендуемый уровень рассуждения для следующей задачи: очень высокий — полный
Telegram и authenticated staging sign-off требует реальных клиентов, тестовых
ролей и provider evidence без риска production mutations.
