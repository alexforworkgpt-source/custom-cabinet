# Live Check Report: `v2026.09.05`

Status: `BLOCKED`<br>
Date: `2026-09-05`<br>
Checker: `Codex`<br>
Release owner: `workspace owner`

## Source Identity

| Item | Exact value |
| --- | --- |
| Custom Cabinet tag/SHA | `cabinet-v2026.09.05.1` / `5cf81e74dcacad02336e57af6f71d490688cdf88` |
| Functional application source | `13ec9332f49a276f6afdce8b698b78eb0902293c` |
| Upstream Cabinet baseline | `v1.66.0` / `2192484b011068d8cb75c61a6aeaada1d06115aa` |
| Upstream Bot tag/SHA | `v4.1.0` / `49b05d5ab79dd9bb92f0404bb0066cda8a175649` |
| Installer tag/SHA | `v2026.09.05` / `27e73f662297bbfe459af86cbe00b2a132d8ac0e` |
| Cabinet artifact SHA-256 | `88ea6ea8d0ed5e2a71f6965374ce27faa5d07efbd6983cb1e42efc72ab08862b` |
| Release manifest SHA-256 | `1c4d09322d8abc5cb6017c1d1eb6c44ec8089126dd48e960f90462e31003d413` |
| Installer archive SHA-256 | `f5c7ddd0218aa8f47ea08ea7ada9baff9745333fde31ee25dd687c0c00720b1b` |

Custom Cabinet release:
<https://github.com/alexforworkgpt-source/custom-cabinet/releases/tag/cabinet-v2026.09.05.1>

Release Bundle:
<https://github.com/alexforworkgpt-source/installer/releases/tag/v2026.09.05>

## Change Scope

- Improved subscription-management navigation and automatically opened the
  additional-options section from device-purchase actions.
- Added an animated additional-options section, hid unused location management
  and shortened the device-reduction explanation.
- Improved mobile profile administration styling and device-counter clarity.
- Added quick subscription QR access while retaining the VPN-settings QR flow.
- Added the instructions entry to Support and restored the New Ticket header
  placement.
- Removed the extra traffic-card divider and included the documentation-only
  release acceptance record.

## Automated and Publication Gates

| Gate | Result | Evidence |
| --- | --- | --- |
| Unit tests | PASS | 39 files, 286 tests |
| Biome | PASS | 600 files checked |
| TypeScript | PASS | project type check |
| Production build | PASS | production bundle completed |
| Instruction PNG validation | PASS | 69 PNG files decoded with CRC validation and matched the built copies |
| Release-delta safety scan | PASS | no secret-pattern, private-path or public-branding findings in the checked delta |
| Custom Cabinet GitHub Actions | PASS | CI, Security Audit and CodeQL for exact release SHA |
| Browser matrix | FAIL — ACCEPTED RISK | Two full runs each returned 382 passed, 6 configured skips and 2 failures; raw translation keys remained in Telegram Login and Dashboard recommendations under asynchronous locale loading |
| Release Bundle workflow | PASS | Contract tests, two deterministic builds, manifest validation, draft re-download comparison and public promotion passed |
| Public assets | PASS | Six assets downloaded without authentication; checksum sidecars, manifest, provenance, archive safety and byte-identical Installer archive passed |

The full disposable Ubuntu 24.04 lifecycle proof for Installer commit
`27e73f662297bbfe459af86cbe00b2a132d8ac0e` was reused. The Installer commit,
Upstream Bot SHA, PostgreSQL/Redis images, Node/Nginx images, Release Bundle
contract and target OS are unchanged from that exact proof.

## Known Accepted Limitation

The UI can retain raw translation keys instead of user-facing labels in
Telegram Login and Dashboard recommendations while locale resources load
asynchronously. Isolated reruns passed, but the defect recurred in a second full
matrix, so it is not treated as fixed. On `2026-09-05`, the owner explicitly
accepted this limitation for the release and deferred the controlled
loading-order regression test and fix to a later task.

This owner decision permits publication but does not convert the browser gate
to `PASS`.

## Targeted Disposable-VPS Smoke

Status: `SKIPPED BY OWNER`

The owner declined a separate disposable-VPS installation because Custom
Cabinet had already been updated from `main`. The earlier owner-reported update
identified source `2346ea323030e2330fff90dcf01756db68cdbbcf`; it is not the
exact release commit `5cf81e74dcacad02336e57af6f71d490688cdf88` and does not
prove the complete `v2026.09.05` Bundle identity. No test-VPS command was run
for this release.

## Residual Gates

- The browser matrix has two accepted but unresolved translation-loading
  failures.
- Exact installation of `v2026.09.05` was not checked on a disposable VPS.
- Authenticated staging state matrix was not run.
- Real Telegram Android/iOS and physical screen-reader checks were not run.
- Initial Remnawave synchronization and live Remnawave `3.3.0+` GeoCheck were
  not run.
- No payment or account mutation was performed as part of release verification.

## Production Smoke

Status: `NOT PERFORMED FOR THE EXACT RELEASE`

The owner previously updated Custom Cabinet directly from `main` and confirmed
that the relevant buttons work. No production VPS command, exact runtime
identity inspection or deployment was performed while publishing this release.
The prior `main` update must not be interpreted as an installation of Release
Bundle `v2026.09.05`.

## Final Sign-off

- [x] Exact source versions recorded.
- [x] Automated checks and immutable publication completed.
- [x] Public assets independently verified.
- [x] Known translation limitation accepted and recorded.
- [x] Disposable-VPS smoke explicitly recorded as skipped by the owner.
- [ ] Browser, authenticated staging and physical-device gates fully passed.
- [x] Report contains no secrets or personal data.
- [x] No production action was performed during release publication.

Final result: immutable release publication and public-asset verification are
`PASS WITH ACCEPTED RISK`; full product live sign-off remains `BLOCKED`.
