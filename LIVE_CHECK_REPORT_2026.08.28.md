# Live Check Report: `v2026.08.28`

Status: `BLOCKED`<br>
Date: `2026-08-28`<br>
Checker: `Codex`<br>
Release owner: `workspace owner`

## Source Identity

| Item | Exact value |
| --- | --- |
| Custom Cabinet tag/SHA | `cabinet-v2026.08.28.1` / `2a49b1350ab98e177c0d62d26462381aeca97648` |
| Upstream Cabinet baseline | `v1.66.0` / `2192484b011068d8cb75c61a6aeaada1d06115aa` |
| Upstream Bot tag/SHA | `v4.1.0` / `49b05d5ab79dd9bb92f0404bb0066cda8a175649` |
| Installer tag/SHA | `v2026.08.28` / `27e73f662297bbfe459af86cbe00b2a132d8ac0e` |
| Cabinet artifact SHA-256 | `a81eb93700c734959711db3857d89326d8c3057911f248e34f5bdb6a974cc283` |
| Release manifest SHA-256 | `18b0fcd2955a635bc384655a91612a2c9717fc2fc3e167e2366fd976a1714fd6` |
| Installer archive SHA-256 | `f5c7ddd0218aa8f47ea08ea7ada9baff9745333fde31ee25dd687c0c00720b1b` |

Custom Cabinet release:
<https://github.com/alexforworkgpt-source/custom-cabinet/releases/tag/cabinet-v2026.08.28.1>

Release Bundle:
<https://github.com/alexforworkgpt-source/installer/releases/tag/v2026.08.28>

## Change Scope

- Added a static background grid for dark and light themes.
- Aligned the base opacity of the referral and subscription-management surfaces
  with the dashboard surface hierarchy.
- Highlighted the administrator entry in the Profile management section.
- Removed the repeated word “theme” from the Profile theme selector and added
  short labels for all supported locales.

## Automated and Publication Gates

| Gate | Result | Evidence |
| --- | --- | --- |
| Biome lint and format | PASS | 586 lint files and 585 format files checked |
| Unit tests | PASS | 37 files, 281 tests |
| TypeScript | PASS | `npm run type-check` |
| Production build | PASS | `npm run build` |
| Browser automation | NOT REPEATED | Incremental UI changes were reviewed through the active local Mock API; the full Playwright matrix was not rerun |
| Custom Cabinet GitHub Actions | PASS | CI, CodeQL and npm audit for exact release SHA |
| Release Bundle workflow | PASS | Contract tests, two byte-identical Cabinet builds, manifest validation, draft re-download and public promotion |
| Public assets | PASS | Six assets downloaded through public URLs; both checksum files, manifest, provenance and Installer archive identity passed |

The full disposable Ubuntu 24.04 lifecycle proof for Installer commit
`27e73f662297bbfe459af86cbe00b2a132d8ac0e` was reused. The Installer commit,
Upstream Bot SHA, PostgreSQL/Redis images, Node/Nginx images, Release Bundle
contract and target OS are unchanged from the exact proof.

## Targeted Disposable-VPS Smoke

| Check | Result |
| --- | --- |
| Fresh installation outcome | `committed` |
| Installed Release Bundle | `2026.08.28` |
| Exact Bot and Cabinet repository HEAD | PASS |
| Installer doctor | PASS |
| Running services | 3 containers |
| Cabinet root | HTTP `200` |
| Cabinet branding | HTTP `200` |
| Unified health | `ok` |
| Webhook default route | HTTP `404` |
| Cleanup | PASS; project, Caddy snippet, temporary env, containers and volumes absent |

The remote smoke command completed all assertions with exit code zero. Rendering
its full Unicode log then hit the local Windows CP1251 console limitation; an
independent final postflight completed successfully and confirmed cleanup.

## Residual Gates

- The full Playwright matrix was not repeated for this incremental visual release.
- Authenticated staging state matrix was not run.
- Real Telegram Android/iOS and physical screen-reader checks were not run.
- Initial Remnawave synchronization and live Remnawave `3.3.0+` GeoCheck were
  not run.
- No payment, account mutation or production action was performed.

## Production Smoke

Status: `NOT STARTED`

The production management Installer remains `v2026.08.25`; the production
runtime remains Release Bundle `v2026.08.24` with Custom Cabinet
`cabinet-v2026.08.24.4`. Publication and disposable-VPS proof do not authorize
or imply a production deployment.

## Final Sign-off

- [x] Exact source versions recorded.
- [x] Automated and publication gates passed.
- [x] Fresh targeted disposable-VPS installation passed and was cleaned up.
- [ ] Full browser, authenticated staging and physical-device scenarios completed.
- [x] Report contains no secrets or personal data.
- [x] Production smoke marked `NOT STARTED`.

Final result: `BLOCKED` for full product live sign-off; release publication and
targeted infrastructure smoke are `PASS`.
