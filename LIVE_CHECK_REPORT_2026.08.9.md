# Live Check Report: `v2026.08.9`

Status: `BLOCKED`<br>
Date: `2026-08-17`<br>
Checker: `OpenCode`<br>
Release owner: `workspace owner`

## Source Identity

| Item | Exact value |
| --- | --- |
| Custom Cabinet commit | `0f9794d48e43e428b6f3d4634b84d82fda0eb0ba` |
| Custom Cabinet version | `1.65.0` |
| Upstream Cabinet tag/SHA | `v1.65.0` / `b866bebeeb6032db4baa3869a4917316fe8e0453` |
| Upstream Bot tag/SHA | `v4.0.0` / `f553d1896dcd347fd74012f6394fd2277161bdd1` |
| Installer tag/SHA | `v2026.08.9` / `a5af6c72069a98b42e97cfb17ebcf1d59443324f` |
| Release Bundle | `v2026.08.9` |
| Manifest identity | `4280aa43110999270786107d8444ac4dedf9c4bf48d914304734df10c8e69323` |
| Cabinet artifact SHA-256 | `553d94f4e3080341d9f14d920a3db2fb78944c2db74873b92dc125a5b3aa0263` |
| Manifest SHA-256 | `b7b6ec11c48c3f2ac6280b3241ad59c5811ae8a9695083199e212521e7b88401` |
| Rollback Release Bundle | `v2026.08.8`; Cabinet `47b6dcbb93ef9462f4dd6f995a36111195b7e018`; artifact `81d52ffd8de2e7d19e1f3c96b6b97f8af77a52d655abbb898e2acfc0df1e1fdb` |

Release URL: <https://github.com/alexforworkgpt-source/installer/releases/tag/v2026.08.9>

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

## Deferred Findings

The release owner explicitly requested publication and deferred the findings in
[`LIVE_CHECK_REPORT_2026-08-17_LOCAL_UI_UX.md`](LIVE_CHECK_REPORT_2026-08-17_LOCAL_UI_UX.md).
Important residual findings include mobile Dashboard clipping/overlap, masked
API errors on several pages, raw callback translation keys, sticky mobile
controls and accessibility gaps in custom dialogs and icon-only controls.

## Blocked Scenarios

- Authenticated VPS state matrix was not provided.
- Real Telegram Android, iOS and Desktop clients were not checked.
- No real or sandbox payment was initiated.
- No destructive account, financial or admin action was initiated.
- Physical-device and screen-reader checks remain unavailable.

## Rollback

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
- [ ] Authenticated staging scenarios completed.
- [ ] Real Telegram client scenarios completed.
- [ ] Deferred UI/accessibility findings resolved.

Final result: `BLOCKED`

Publication and deployment were explicitly requested with the known UI findings
deferred. This approval does not convert incomplete live-check coverage to
`PASS`.
