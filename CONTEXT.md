# Custom Cabinet Context

## Product

Custom Cabinet is an independently maintained frontend for a compatible
Upstream Bot. It works as a normal web application and as a Telegram Mini App.

The product has three interface modes:

1. Public authentication and transactional flows.
2. User Cabinet for subscriptions, connection, payments and account management.
3. Administrative console protected by roles and permissions.

## Current Source and Production Reference

The current production reference, deployed and verified on `2026-09-21`, is
Custom Cabinet `cabinet-v2026.09.21.1` at
`aec198424aa0b489db6d07d1af92bd704aa7c518`, package `v1.74.0`, through Release
Bundle `v2026.09.21.1`, identity
`991c6ec42053876ae6079d82faee14dc7a6e65157fd9d3c8ada3875795b768af`. It
integrates Upstream Cabinet `v1.74.0` at
`57810c7da24b5c142371ed83a6ad5e43a591d454` and runs with Upstream Bot
`v4.10.0` at `9fcebfd7bc075dcca1bb9d1514740039208b906a`.

The protected transition from Release Bundle `v2026.09.14` completed with
`outcome=committed`. A full migration package was checksum-verified on the VPS,
copied off-host and verified again before the update. Database revision `0119`,
the existing PostgreSQL/Redis volumes and immutable runtime images were
preserved. Independent verification passed for exact identities, clean runtime
repositories, three healthy services without restart/OOM, Installer Status and
Diagnostics, firewall, Caddy, public health and Telegram webhook.

The owner-authenticated read-only production browser smoke passed for Dashboard,
Balance, Connection, Profile, Support, tariffs without purchase, Instructions
and selected admin pages. Responsive checks at 390 and 320 pixels also passed
for the changed Dashboard/Instructions/Support scope, including all six lazy
instruction images. No payment, ticket, synchronization, settings save or other
production mutation was performed. Full authenticated Telegram staging, real
Android/iOS Telegram and physical screen-reader checks remain `BLOCKED` and were
explicitly accepted by the owner for this rollout. See
[`LIVE_CHECK_REPORT_2026.09.21.md`](LIVE_CHECK_REPORT_2026.09.21.md).

Release Bundle `v2026.09.07` is an immutable, superseded publication and was
not deployed. A migration-export race was found after publication; the fix was
published and deployed only as `v2026.09.07.1`. Never replace assets under the
older tag.

Release Bundle `v2026.09.21` is also immutable and superseded. Targeted
fresh-install smoke found a nonexistent PostgreSQL digest before production.
Its assets remain unchanged; only corrected Bundle `v2026.09.21.1` may be used.

## Historical Release Reference

The following references are retained as historical evidence and must not be
used as the current production baseline.

- Previous published candidate: Custom Cabinet `cabinet-v2026.09.05.1`, commit
  `5cf81e74dcacad02336e57af6f71d490688cdf88`, through Release Bundle
  `v2026.09.05`. Publication and independent public-asset verification passed.
  The translation-loading limitation was accepted by the owner; a separate
  disposable-VPS installation was skipped by owner decision.
- Previous production management Installer: `v2026.08.25`, commit
  `27e73f662297bbfe459af86cbe00b2a132d8ac0e`.
- Previous fully verified production Release Bundle: `v2026.08.24`, policy
  `rollback-compatible`.
- Custom Cabinet in that historical Bundle: `cabinet-v2026.08.24.4`, commit
  `3250e3a7f31fc2dc6f2c7779a42d86cf99a03210`.
- Production baseline, transition, Status, Diagnostics, health, exact runtime
  identities and authorized browser smoke passed. The later Installer update
  was management-only and did not change the runtime Bundle.
- Real Telegram Android/iOS, physical screen-reader, authenticated staging,
  initial Remnawave synchronization and Remnawave `3.3.0+` GeoCheck remain
  `BLOCKED`, not `PASS`.

See [`COMPATIBILITY.md`](COMPATIBILITY.md) for exact source, image and Release
Bundle identities. Historical live-check reports retain the result known at
their verification date and must not be reinterpreted as current production
state.

## Actors

**Guest**

An unauthenticated visitor using Login, registration, legal, callback or public
purchase flows.

**User**

An authenticated customer who needs to understand subscription state, connect a
device, pay, renew and get support with minimal cognitive load.

**Administrator**

An authenticated operator with one or more administrative permissions.

**Installer**

The supported installation and update path for a committed Custom Cabinet and a
compatible Release Bundle.

**Upstream Cabinet**

The external source Cabinet from which selected changes are intentionally
integrated.

**Upstream Bot**

The compatible external Bot providing Cabinet APIs and Telegram behavior.

**Release Bundle**

An immutable, verified combination of Installer, Upstream Bot, Custom Cabinet
and runtime images.

## Primary User Jobs

- Understand whether the service is active.
- Connect the current device.
- Buy or renew a subscription.
- Check traffic and device usage.
- Top up balance and understand payment result.
- Manage account identity and notifications.
- Reach support when a critical flow fails.

## Product Direction

The user Cabinet prioritizes clarity over feature visibility. Critical status
and primary actions stay visible. Secondary settings and multi-step operations
use progressive disclosure through accessible dialogs or sheets.

The interface must remain compatible with Upstream Cabinet behavior, Upstream
Bot contracts, Telegram navigation and Installer-based deployment.

## Canonical Rules

- Do not use public upstream branding as Custom Cabinet branding.
- Preserve exact technical attribution, source URLs, Git SHAs and licenses.
- Keep presentation separate from authentication, payment, subscription and
  platform behavior.
- Preserve callback routes and deep links when simplifying visible navigation.
- Test user-facing changes through whole browser scenarios and the live-check
  process after installation through Installer.

## Excluded Frontend Capability

BSCHEKER is intentionally unsupported in Custom Cabinet. No route, navigation
item, permission, setting, API client or request, polling, locale, fixture or
feature-specific asset may expose it. This is an executable product boundary,
not a temporary feature flag; `src/noBscheker.guard.test.ts` enforces it during
the normal unit-test gate.

The official Upstream Bot `v4.7.1` still contains its BSCHEKER backend and
migrations. Custom Cabinet's frontend exclusion does not authorize a backend
fork or a claim that the upstream capability is absent. General platform and
accessibility fixes may be adapted from adjacent upstream commits only after
they are separated from reachability contracts. See
[`docs/adr/0001-no-bscheker-frontend.md`](docs/adr/0001-no-bscheker-frontend.md).
