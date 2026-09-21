# Live Check Report: `v2026.09.21.1`

Status: `BLOCKED`<br>
Date: `2026-09-21`<br>
Checker: `OpenCode with owner authorization`<br>
Release owner: `owner`

## Source Identity

| Item | Exact value |
| --- | --- |
| Custom Cabinet commit | `aec198424aa0b489db6d07d1af92bd704aa7c518` |
| Custom Cabinet version/tag | `1.74.0` / `cabinet-v2026.09.21.1` |
| Upstream Cabinet tag/SHA | `v1.74.0` / `57810c7da24b5c142371ed83a6ad5e43a591d454` |
| Upstream Bot tag/SHA | `v4.10.0` / `9fcebfd7bc075dcca1bb9d1514740039208b906a` |
| Installer tag/SHA | `v2026.09.21.1` / `b54219d34a582e393f397a4441c6aacc52f274a8` |
| Release Bundle | `v2026.09.21.1`; identity `991c6ec42053876ae6079d82faee14dc7a6e65157fd9d3c8ada3875795b768af` |
| Cabinet artifact SHA-256 | `945ac5eef1c416c088ac16a4eae0ed10f098ffa55f3392ab45e7c7e830deda75` |
| Installer archive SHA-256 | `8f1b597dbca7b858632761d4083b4d7368cae88c4be6d618fd5e960139c41039` |
| Rollback Release Bundle | `v2026.09.14`; identity `e9e3710d066644674ab12c83b650ae926985f7efd46b192a610e6452503b823e` |
| Rollback policy | `rollback-compatible` |

## Change Scope

This release improves Dashboard loading states and the instruction experience,
including step navigation, images and Support entry points. It also fixes the
deferred-scroll behavior when an instruction scenario is opened from a route
transition and stabilizes the matching browser regressions.

Compared with the production Cabinet commit, 22 source and test files changed.
The Upstream Cabinet baseline, Upstream Bot, Installer commit, runtime image
digests and Release Bundle contract remain unchanged.

## Automated and Release Gate

| Check | Result | Notes |
| --- | --- | --- |
| Biome and type-check | PASS | Changed source and test files pass; GitHub lint and CodeQL checks are green |
| Unit/component/API tests | PASS | `793/793` |
| Production build | PASS | Exact release source built successfully |
| Browser automation | PASS | `554 passed`, `24` configured skips; targeted regressions and repeated alignment checks also passed |
| Release Bundle workflow | PASS | Contract tests, exact tag identity, two deterministic Cabinet builds, manifest/provenance and published-draft verification passed |
| Public assets | PASS | All six assets downloaded independently; checksums, source identities, archive safety and byte-identical Installer archive passed |
| Targeted Ubuntu 24.04 fresh install | PASS | `outcome=committed`; exact Bundle, Bot, Cabinet and artifact identities; three containers; doctor and final cleanup passed |
| HTTP/runtime smoke | PASS | Cabinet, direct instruction route and branding returned `200`; unified health `ok`; webhook root `404`; app shell `no-store` |

The first publication, `v2026.09.21`, contained a mistyped, nonexistent
PostgreSQL digest. Fresh-install smoke failed before runtime startup and cleanup
removed the disposable stack. Its assets were not changed; the Release is
marked superseded. The corrected combination was published only as the new
immutable tag `v2026.09.21.1` and passed the complete targeted smoke above.

## Functional and Platform Results

| Area | Result | Coverage or limitation |
| --- | --- | --- |
| Disposable runtime smoke | PASS | Exact published Bundle on Ubuntu 24.04 |
| Dashboard and loading states | PASS | Automated desktop and responsive browser matrix |
| Instructions and Support entry | PASS | Automated navigation, delayed render, alignment and direct-route coverage |
| Authenticated staging product flows | BLOCKED | No separate staging Telegram bot/client and account matrix is available |
| Real Telegram Android/iOS | BLOCKED | Physical-device matrix was not run |
| Physical screen reader | BLOCKED | No physical assistive-technology session was run |
| Production smoke | PASS | Protected Update committed; technical verifier and owner-authenticated read-only browser smoke passed |

## Residual Risks

- Full authenticated staging flows remain `BLOCKED`; targeted infrastructure
  smoke does not replace Telegram Login, subscription, payment, Connection,
  Support and Admin product verification.
- Real Telegram Android/iOS and physical screen-reader checks were not run.
- The publication workflow validates digest syntax but does not currently prove
  that every runtime digest resolves in its registry. Targeted installation
  caught this for the superseded Bundle before production.
- The owner explicitly accepted the remaining `BLOCKED` staging and physical-
  device gates before authorizing the production update.

## Staging Decision

Result: `BLOCKED`

Reason:

```text
The exact published Bundle passed public-asset verification and a targeted
fresh installation, but a full authenticated Telegram staging environment is
not available. Missing product and physical-device gates are not treated as
passes.
```

## Production Smoke

Status: `PASS`

The owner explicitly authorized the update to `v2026.09.21.1` and accepted the
remaining `BLOCKED` staging/physical-device gates. Before mutation, production
matched Release Bundle `v2026.09.14`; a complete migration package was verified
on the VPS, copied to trusted off-host storage and verified again by SHA-256.

Protected Update completed with `outcome=committed`. Independent verification
confirmed the exact Release Bundle, Bot, Custom Cabinet, Cabinet artifact and
runtime-image identities, clean repositories, database revision `0119`, the
same PostgreSQL/Redis volumes, absent operation markers, three healthy services
without restart/OOM, Status, Diagnostics, firewall, Caddy, public health,
app-shell `no-store` and Telegram webhook.

The owner-authenticated read-only browser smoke opened Dashboard, Balance,
Connection, Profile, Support, tariffs without purchase, Instructions, admin
overview, Grace Access, Referral Levels and System Errors. Every route returned
`200`; no console/page errors, failed requests or `5xx` responses occurred.
Dashboard, Instructions, an instruction article and Support also passed at 390
and 320 pixels without page overflow; all six lazy instruction images loaded
after scrolling. No payment, ticket, synchronization, settings save or other
production mutation was performed.

An observation more than 13 minutes after the final Bot start found no Bot,
PostgreSQL, Redis or Caddy error/warning/traceback, no restart/OOM and no new
System Errors. The complete technical verifier passed again after browser smoke.

## Rollback

Rollback required: `No`<br>
Rollback Release Bundle: `v2026.09.14`<br>
Rollback result: `NOT NEEDED`<br>
Rollback readiness: previous Release Bundle `v2026.09.14`, the
`rollback-compatible` policy and the new off-host migration package were
verified before deployment. Rollback was not needed.

## Final Sign-off

- [x] Exact source versions recorded.
- [x] Automated and publication gates passed.
- [x] Targeted fresh installation and cleanup passed.
- [ ] Required authenticated staging flows completed.
- [ ] Telegram real-device checks completed.
- [x] Residual risks explicitly recorded.
- [x] Rollback source recorded.
- [x] Report contains no secrets, hostnames or personal data.
- [x] Production smoke completed without write actions.

Final result: `BLOCKED` for the remaining staging/physical-device matrix;
production rollout and read-only smoke: `PASS`.
