# Live Check Report: `v2026.08.20`

Status: `INSTALLED ON DISPOSABLE VPS; MANUAL GATES OUTSTANDING`<br>
Date: `2026-08-24`<br>
Checker: `Codex`<br>
Release owner: `workspace owner`

## Source Identity

| Item | Exact value |
| --- | --- |
| Custom Cabinet tag/SHA | `cabinet-v2026.08.24.2` / `4fc5eee26d6364459a96eee96f6eba23e703b7f0` |
| Upstream Cabinet tag/SHA | `v1.66.0` / `2192484b011068d8cb75c61a6aeaada1d06115aa` |
| Upstream Bot tag/SHA | `v4.1.0` / `49b05d5ab79dd9bb92f0404bb0066cda8a175649` |
| Installer tag/SHA | `v2026.08.20` / `8d5feb922958f6d3deed0f837060059d1919b356` |
| Release Bundle | `v2026.08.20` |
| Release Bundle identity | `0df30cc31dff253f0125077fff2eeb9b2c4a78cb48767a62d79db7fcd543ee9f` |
| Cabinet artifact SHA-256 | `ece03fbc7e5f7094378d68e248b9461c244a9052302c51f062220ef956539321` |
| Installer archive SHA-256 | `89f1add764f6b6519e2dd3aaa8179479e32dcdf405c446bc1cb37b44d2a6f75a` |
| Rollback Release Bundle | `v2026.08.19` |

Custom Cabinet Release: <https://github.com/alexforworkgpt-source/custom-cabinet/releases/tag/cabinet-v2026.08.24.2>

Release Bundle: <https://github.com/alexforworkgpt-source/installer/releases/tag/v2026.08.20>

Successful workflow: <https://github.com/alexforworkgpt-source/installer/actions/runs/32709927989>

## Local Gate

| Check | Result |
| --- | --- |
| Biome | PASS; 584 files checked |
| Unit tests | PASS; 281/281 |
| TypeScript | PASS |
| Production build | PASS |
| Playwright | PASS; 257 passed, 6 expected skips across mobile, tablet and desktop profiles |
| Added release diff secret-shape scan | PASS; 0 matches |
| Added release diff unexpected public-branding scan | PASS; 0 matches |

## Publication Verification

- The successful workflow verified the exact Installer tag/lifecycle SHA, release
  contracts, source revisions, two byte-identical Cabinet builds, manifest,
  provenance, draft assets and downloaded public assets before publication.
- An earlier dispatch used a shortened `owner/repo` Cabinet value. The strict
  URL check rejected it before build or Release creation; the successful retry
  used the required full public GitHub HTTPS URL.
- Six assets were downloaded independently from public URLs without a GitHub
  token. Both published checksum files passed.
- Manifest and provenance contain the exact Bot SHA, Cabinet repository/SHA,
  PostgreSQL, Redis, Node builder and Nginx runtime identities.
- The Installer archive contains no `server.env`, `env.txt`, `.playwright-mcp`,
  `__pycache__` or `*.pyc` entries.

## Environment

| Item | Value |
| --- | --- |
| Integration URL | `https://web.demolanding.click` |
| Environment type | Disposable integration VPS; not production |
| Verification time | `2026-08-24T09:22:04Z` |
| Project root | `/opt/bot-stack-integration` |
| Telegram clients | Real Android/iOS clients were not run |
| Remnawave | API and webhook passed Installer doctor; initial synchronization and live GeoCheck on panel/node `3.3.0+` were not run |

## Deployment

| Item | Result |
| --- | --- |
| Update method | Protected Update from public `v2026.08.20/release.json` |
| Previous Release Bundle | `2026.08.19` |
| Protected Update outcome | `committed` |
| Installed Release Bundle | `2026.08.20` |
| Installed Bot SHA | `49b05d5ab79dd9bb92f0404bb0066cda8a175649` |
| Installed Cabinet SHA | `4fc5eee26d6364459a96eee96f6eba23e703b7f0` |
| Installed Cabinet artifact | `ece03fbc7e5f7094378d68e248b9461c244a9052302c51f062220ef956539321` |
| Runtime containers | 3; Bot, PostgreSQL and Redis healthy |
| Installer doctor | PASS |
| Cabinet | HTTP `200` |
| Webhook default route | HTTP `404`, expected default deny |
| Telegram webhook | PASS; points to the integration VPS |
| Caddy | Active; configuration valid |
| Installer management launcher | Ready |
| Independent smoke | PASS after a separate SSH connection |

## Security Cleanup

- The canonical disposable profile remains local in ignored
  `installer/server.env`; no secret values were committed or published.
- Independent smoke found zero `.integration*.env` files under the management
  Installer directory.
- No payment, email mutation, broadcast or destructive admin action was run.

## Residual Risks

- Initial Remnawave synchronization still needs to be started from the admin UI
  and its result confirmed.
- Physical screen-reader, real Telegram Android/iOS and live Remnawave `3.3.0+`
  GeoCheck checks were not run; they are not technical passes.
- Authenticated production-like interaction with the changed Dashboard, Profile
  and Connection screens was covered by local Playwright mocks, not a real user
  account on the integration VPS.
- The five known high-severity dependency audit findings remain unresolved.

## Production Smoke

Status: `NOT STARTED`

Only the disposable integration VPS was changed. Production was not identified,
accessed or modified.

## Final Sign-off

- [x] Public Release Bundle assets and exact identities verified.
- [x] Targeted Protected Update committed.
- [x] Exact Bot and Custom Cabinet identities installed.
- [x] Installer doctor, Cabinet, Caddy, webhook default deny and container health passed.
- [x] Independent smoke found no integration environment copies.
- [ ] Initial Remnawave synchronization confirmed from the admin UI.
- [ ] Physical screen-reader and real Telegram clients completed.
- [ ] Live Remnawave `3.3.0+` GeoCheck completed.
- [x] Production smoke marked `NOT STARTED`.

Final result: `INSTALLED ON DISPOSABLE VPS; MANUAL GATES OUTSTANDING`

Рекомендуемый уровень рассуждения для следующей задачи: высокий — initial Remnawave synchronization and authenticated smoke use live test data and must avoid payments or destructive admin mutations.
