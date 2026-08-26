# Live Check Report: `v2026.08.26`

Status: `BLOCKED`<br>
Date: `2026-08-26`<br>
Checker: `Codex`<br>
Release owner: `workspace owner`

## Source Identity

| Item | Exact value |
| --- | --- |
| Custom Cabinet tag/SHA | `cabinet-v2026.08.26.1` / `e4002ebe225ea32a047d86ce311f26d4071a61bc` |
| Upstream Cabinet baseline | `v1.66.0` / `2192484b011068d8cb75c61a6aeaada1d06115aa` |
| Upstream Bot tag/SHA | `v4.1.0` / `49b05d5ab79dd9bb92f0404bb0066cda8a175649` |
| Installer tag/SHA | `v2026.08.26` / `27e73f662297bbfe459af86cbe00b2a132d8ac0e` |
| Cabinet artifact SHA-256 | `dc1a30208807ffb28943ec1551b69b704eafe38338fa7fc0d546c116c62851ae` |
| Release manifest SHA-256 | `ad27468a5bdaa29e645cd4a45ef85f76ab4a215da70521c99eba965c284c12ea` |
| Installer archive SHA-256 | `f5c7ddd0218aa8f47ea08ea7ada9baff9745333fde31ee25dd687c0c00720b1b` |

Custom Cabinet release:
<https://github.com/alexforworkgpt-source/custom-cabinet/releases/tag/cabinet-v2026.08.26.1>

Release Bundle:
<https://github.com/alexforworkgpt-source/installer/releases/tag/v2026.08.26>

## Change Scope

- Reorganized the active subscription summary and separated its VPN, link and
  subscription-management actions.
- Added the contrast subscription surface, tuned card opacity and simplified
  the Tariff and Remaining presentation.
- Improved VPN setup wording and configured-device count copy.
- Treated Google and Yandex authorization as an attached email for
  recommendations.
- Added the Telegram news and giveaways recommendation banner.

## Automated and Publication Gates

| Gate | Result | Evidence |
| --- | --- | --- |
| Biome | PASS | 586 files checked |
| Unit tests | PASS | 37 files, 281 tests |
| TypeScript | PASS | `npm run type-check` |
| Production build | PASS | `npm run build` |
| Browser automation | PASS | All 282 applicable Playwright scenarios passed; 6 project-configured skips |
| Full local Mock API | PASS | Admin/full local preview completed |
| Custom Cabinet GitHub Actions | PASS | CI, CodeQL and Security Audit for exact release SHA |
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
| Installed Release Bundle | `2026.08.26` |
| Exact Bot and Cabinet repository HEAD | PASS |
| Installer doctor | PASS |
| Running services | 3 containers |
| Cabinet root | HTTP `200` |
| Webhook default route | HTTP `404` |
| Remnawave API and webhook diagnostics | PASS; initial synchronization remains an operator action |
| Cleanup | PASS; project, Caddy snippet, temporary env, containers and volumes absent |

## Residual Gates

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
- [ ] Authenticated staging scenarios completed.
- [ ] Real Telegram and physical accessibility checks completed.
- [x] Report contains no secrets or personal data.
- [x] Production smoke marked `NOT STARTED`.

Final result: `BLOCKED` for full product live sign-off; release publication and
targeted infrastructure smoke are `PASS`.
