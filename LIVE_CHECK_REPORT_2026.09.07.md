# Live Check Report: `v2026.09.07.1`

Status: `PASS WITH RISKS`<br>
Date: `2026-09-07`<br>
Checker: `Codex with owner authorization`<br>
Release owner: `owner`

## Source Identity

| Item | Exact value |
| --- | --- |
| Custom Cabinet commit | `27f94c818435044ef7b58fcd0ed7de119331cfb8` |
| Custom Cabinet version/tag | `1.69.1` / `cabinet-v2026.09.07.1` |
| Integrated application source | `bb6f56f050267d6d6aaa38793d2b288f4f186565` |
| Upstream Cabinet tag/SHA | `v1.69.1` / `3da34239d1c1c7b87a0184e74d49bde43ea88b89` |
| Upstream Bot tag/SHA | `v4.5.0` / `07f3c6081233f5517200e62ad7be70aaa58ef27c` |
| Installer tag/SHA | `v2026.09.07.1` / `b54219d34a582e393f397a4441c6aacc52f274a8` |
| Release Bundle | `v2026.09.07.1`; identity `7f234e7672be8fe68be2102ab0655e6a3735c07b2169a14c76c30491e7f99629` |
| Cabinet artifact SHA-256 | `3a459ffe8dd65c2622f6f1994f140aba69c8033b7ce0d147c69ab0039d6ff456` |
| Installer archive SHA-256 | `8f1b597dbca7b858632761d4083b4d7368cae88c4be6d618fd5e960139c41039` |
| Rollback policy | `rollback-compatible` |

## Change Scope

This release integrates Upstream Cabinet `v1.69.1`, selects the required
Upstream Bot `v4.5.0`, updates the Cabinet build baseline to Node 24 and applies
database migrations `0107` through `0114`. It includes the new Grace Access,
Referral Levels and System Errors administrative routes while preserving the
Custom Cabinet navigation, branding, error states and security adaptations.

## Release and Lifecycle Gate

| Check | Result | Notes |
| --- | --- | --- |
| Custom Cabinet source, unit, type and build gates | PASS | Exact release source verified before publication |
| Target browser regressions | PASS | Delayed locale, Telegram navigation, contact prefill and branding cases covered |
| Installer full lifecycle | PASS | Disposable Ubuntu 24.04; install, update, injected rollback, recovery and uninstall cleanup |
| Public Release Bundle assets | PASS | Six assets independently downloaded and verified |
| Deterministic Cabinet artifact | PASS | Published artifact matches the verified checksum |
| Migration package | PASS | Created before production update, copied off-host and checksum-verified; contents remain private |

The initially published `v2026.09.07` Bundle was not deployed. A race in
migration export was found after publication, corrected in Installer, retested
through the full lifecycle and published under the new immutable tag
`v2026.09.07.1`.

## Production Transition

The pre-update runtime was Release `2026.08.24`. Diagnostics had one accepted
failure, `Cabinet runtime contract`, because an earlier manual update from
`main` did not carry an immutable Cabinet/Bundle identity. The owner explicitly
accepted this known baseline before continuing.

The management Installer was updated first. Before/after checks confirmed that
container IDs, image IDs, volumes, runtime Git SHAs, database revision, runtime
configuration, reverse proxy and public health were unchanged. Protected Update
then completed with `outcome=committed`, no unfinished-operation marker and
database revision `0114`.

| Production check | Result |
| --- | --- |
| Exact Installer, Bot, Cabinet and Bundle identities | PASS |
| Exact Cabinet artifact and runtime image identities | PASS |
| Runtime repositories clean | PASS |
| Three services running and healthy | PASS |
| Installer Status and Diagnostics | PASS |
| Database migration `0106` to `0114` | PASS |
| Reverse proxy, public Cabinet and unified health | PASS |
| Telegram API and webhook contract | PASS |
| Final verifier after browser smoke | PASS |

## Authenticated Production Smoke

Login through the Upstream Bot succeeded. Dashboard, tariff/subscription
purchase, Support and Profile loaded successfully. The Admin console reported
Bot `4.5.0` and Cabinet `v1.69.1`; Grace Access, Referral Levels and System
Errors loaded successfully.

The smoke was deliberately read-only: no payment was initiated, no form was
saved, no ticket was created and no synchronization or Remnawave mutation was
performed. The Remnawave API was configured read-only.

## Observed Startup Errors

System Errors contained two entries at the rollout timestamp: a queue timeout
and a Telegram notification error. Follow-up diagnosis found all services
healthy, no restarts or OOM events, successful Redis and PostgreSQL probes, and
no recurrence or traceback during the final 15-minute observation window.
These are recorded as transient startup events rather than an active failure.

## Residual Risks

- Real Telegram Android and iOS device matrices were not completed.
- A physical screen-reader matrix was not completed.
- Payment, form-save, ticket creation and synchronization paths were not
  mutated in production by design.
- The two rollout-time System Errors remain historical records and should be
  compared against future recurrence, not deleted as part of this release.

## Rollback

Rollback required: `No`<br>
Rollback result: `NOT NEEDED`<br>
Rollback readiness: release policy, pre-update migration package and injected
disposable-host rollback/recovery proof were verified.

## Final Sign-off

- [x] Exact source versions recorded.
- [x] Automated and release gates passed.
- [x] Production migration and postflight passed.
- [x] Residual risks explicitly recorded.
- [x] Rollback source and recovery behavior verified.
- [x] Report contains no secrets, hostnames or personal data.
- [x] Production smoke completed.

Final result: `PASS WITH RISKS`
