# Custom Cabinet Context

## Product

Custom Cabinet is an independently maintained frontend for a compatible
Upstream Bot. It works as a normal web application and as a Telegram Mini App.

The product has three interface modes:

1. Public authentication and transactional flows.
2. User Cabinet for subscriptions, connection, payments and account management.
3. Administrative console protected by roles and permissions.

## Current Source and Production Reference

The current production reference, verified on `2026-09-07`, is Custom Cabinet
`cabinet-v2026.09.07.1` at
`27f94c818435044ef7b58fcd0ed7de119331cfb8`, package `v1.69.1`, through Release
Bundle `v2026.09.07.1`. It integrates Upstream Cabinet `v1.69.1` at
`3da34239d1c1c7b87a0184e74d49bde43ea88b89` and runs with Upstream Bot
`v4.5.0` at `07f3c6081233f5517200e62ad7be70aaa58ef27c`.

The adaptive integration source is
`bb6f56f050267d6d6aaa38793d2b288f4f186565`; the final tagged commit adds a
formatting-only test change. Release publication, independent verification of
all six public assets, a full disposable Ubuntu 24.04 Installer lifecycle and
the production Protected Update passed. The database migrated from Alembic
`0106` to `0114`; production Status, Diagnostics, exact runtime identities,
three healthy services and final postflight passed.

Authenticated production browser smoke through the Upstream Bot covered
Dashboard, tariff/subscription purchase without payment, Support, Profile and
the administrative Grace Access, Referral Levels and System Errors routes. No
form was saved and no payment, ticket, synchronization or Remnawave mutation
was performed. The Remnawave API was read-only. Two persisted System Errors at
the rollout timestamp were diagnosed as transient startup events; no recurrence
or traceback was found in the final observation window. See
[`LIVE_CHECK_REPORT_2026.09.07.md`](LIVE_CHECK_REPORT_2026.09.07.md).

Release Bundle `v2026.09.07` is an immutable, superseded publication and was
not deployed. A migration-export race was found after publication; the fix was
published and deployed only as `v2026.09.07.1`. Never replace assets under the
older tag.

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
