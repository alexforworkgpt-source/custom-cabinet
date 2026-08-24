# Live Check Report: `v2026.08.19`

Status: `INSTALLED WITH OWNER MANUAL-GATE WAIVER`<br>
Date: `2026-08-24`<br>
Checker: `OpenCode`<br>
Release owner: `workspace owner`

## Source Identity

| Item | Exact value |
| --- | --- |
| Integrated Custom Cabinet source | `653e26238105c8394c6abc271b6da836de5fa974` |
| Custom Cabinet tag/SHA | `cabinet-v2026.08.24.1` / `0a0062b96f467aa04cc460db925f7d116d411e94` |
| Upstream Cabinet tag/SHA | `v1.66.0` / `2192484b011068d8cb75c61a6aeaada1d06115aa` |
| Upstream Bot tag/SHA | `v4.1.0` / `49b05d5ab79dd9bb92f0404bb0066cda8a175649` |
| Installer tag/SHA | `v2026.08.19` / `8d5feb922958f6d3deed0f837060059d1919b356` |
| Release Bundle | `v2026.08.19` |
| Cabinet artifact SHA-256 | `94f974dc4293cfdc99b73a4803a5c90b7351c60d9287e13d5230897aa82292a5` |
| Installer archive SHA-256 | `89f1add764f6b6519e2dd3aaa8179479e32dcdf405c446bc1cb37b44d2a6f75a` |
| Rollback Release Bundle | `v2026.08.18` |

Custom Cabinet Release: <https://github.com/alexforworkgpt-source/custom-cabinet/releases/tag/cabinet-v2026.08.24.1>

Release Bundle: <https://github.com/alexforworkgpt-source/installer/releases/tag/v2026.08.19>

Workflow: <https://github.com/alexforworkgpt-source/installer/actions/runs/32702349027>

## Environment

| Item | Value |
| --- | --- |
| Integration URL | `https://web.demolanding.click` |
| Environment type | Disposable integration VPS; not production |
| Verification time | `2026-08-24T08:02:39Z` |
| Project root | `/opt/bot-stack-integration` |
| Telegram clients | Real Android/iOS clients were not run |
| Remnawave | API and webhook reachable; live GeoCheck on panel/node `3.3.0+` was not run |

## Deployment

| Item | Result |
| --- | --- |
| Installation method | Fresh persistent installation from the public `v2026.08.19` Installer archive and `release.json` |
| Public Installer archive checksum | PASS |
| Runtime-change outcome | `committed` |
| Installed Release Bundle | `2026.08.19` |
| Installed Bot SHA | `49b05d5ab79dd9bb92f0404bb0066cda8a175649` |
| Installed Cabinet SHA | `0a0062b96f467aa04cc460db925f7d116d411e94` |
| Installed Cabinet artifact | `94f974dc4293cfdc99b73a4803a5c90b7351c60d9287e13d5230897aa82292a5` |
| Runtime containers | 3 under the disposable integration Compose project |
| Installer doctor | PASS |
| Cabinet | HTTP `200` |
| Webhook default route | HTTP `404`, expected default deny |
| Telegram webhook | PASS; points to this test VPS |
| Caddy | Active; configuration valid |
| Installer management launcher | Ready |
| Independent postflight | PASS after a separate SSH connection |

The published Installer archive stores `bot-menu.sh` with mode `664`, which is
compatible with the documented `sudo bash bot-menu.sh` command. A temporary
deployment harness incorrectly required an executable bit and stopped before
runtime mutation. The harness was corrected, the archive was downloaded again,
its checksum and extracted contents were reverified, and the fresh installation
then committed.

## Security Cleanup

- The current temporary integration environment was stored outside the
  Installer source and removed after installation.
- Two `.integration.env` duplicates left in historical management release
  directories by earlier lifecycle runs were inventoried and removed. The
  canonical disposable profile remains local in ignored `installer/server.env`.
- Independent postflight found zero `.integration*.env` files under the
  management Installer directory.
- No secret values were printed, committed or added to the Release Bundle.

## Residual Risks

- The owner explicitly waived physical screen-reader, real Telegram Android/iOS
  and live Remnawave `3.3.0+` GeoCheck checks for this Release. They are not
  technical passes.
- Installer doctor reports that initial Remnawave synchronization still needs
  to be started from the admin UI and its result confirmed.
- The existing remote lifecycle runner creates `.integration.env` inside its
  uploaded Installer source before installing the management copy. A future
  lifecycle run can repeat the historical duplicate unless that runner is fixed;
  the persistent deployment path used here stored its temporary env outside the
  Installer source.
- No real payment, email mutation, broadcast or destructive admin action was
  initiated.
- The five known high-severity dependency audit findings remain unresolved.

## Production Smoke

Status: `NOT STARTED`

Only the disposable integration VPS was changed. Production was not accessed or
modified.

## Final Sign-off

- [x] Public Release Bundle archive and checksum verified.
- [x] Exact Bot and Custom Cabinet identities installed.
- [x] Runtime change committed and Installer doctor passed.
- [x] Cabinet, webhook default deny, Caddy and management launcher verified.
- [x] Independent postflight passed with no integration environment copies.
- [ ] Initial Remnawave synchronization confirmed from the admin UI.
- [ ] Physical screen-reader and real Telegram clients completed.
- [x] Remaining manual gates explicitly recorded as owner-waived, not passed.
- [x] Production smoke marked `NOT STARTED`.

Final result: `INSTALLED WITH OWNER MANUAL-GATE WAIVER`

Рекомендуемый уровень рассуждения для следующей задачи: высокий — initial Remnawave synchronization and any authenticated smoke use live test data and must avoid payments or destructive admin mutations.
