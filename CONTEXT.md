# Custom Cabinet Context

## Product

Custom Cabinet is an independently maintained frontend for a compatible
Upstream Bot. It works as a normal web application and as a Telegram Mini App.

The product has three interface modes:

1. Public authentication and transactional flows.
2. User Cabinet for subscriptions, connection, payments and account management.
3. Administrative console protected by roles and permissions.

## Current Source and Production Reference

The source reference for the latest owner-reported production update on
`2026-09-03` is
`2346ea323030e2330fff90dcf01756db68cdbbcf` (`Add quick subscription QR and
support instructions entry`). This source retains the Upstream Cabinet
`v1.66.0` integration through `92906d0e9a128d0a6cdf0f056996e4db44d72d94`.

The release-preparation source is
`13ec9332f49a276f6afdce8b698b78eb0902293c` (`Restore support header layout
above instructions`). Its production deployment has not been confirmed. Later
commits on `main` do not imply another production deployment; inspect Git for
the current development source.

The full browser matrix reproduced untranslated labels in Telegram login and
Dashboard recommendations. On `2026-09-05`, the owner explicitly accepted this
known limitation for the current release and deferred the translation-loading
fix to a later task. See the dated preparation gate in `COMPATIBILITY.md`; do
not reinterpret the release decision as a browser-gate pass.

- The owner supplied an Installer update log showing a fast-forward from
  `7c88d7bc` to `2346ea32`, a completed frontend build and a successful Cabinet
  update. The owner then confirmed the buttons work. This is an update directly
  from `main`, without a new Release or Release Bundle, not an independent
  post-update inspection of the VPS Git SHA or runtime identities.
- The earlier authenticated browser smoke on `2026-09-02` covered the working
  source `7c88d7bc0839608e3a652a9ee0d338922c5b7713`: Dashboard, subscription
  management, devices, Connection, Balance, Profile and Support, session
  persistence after reload and narrow
  layout. No console errors or warnings were observed. Payments, settings
  changes and device deletion were not performed. The owner separately
  confirmed the Admin button, not the complete administrative console.
- The exact Git SHA on the VPS and current Installer, Upstream Bot, image,
  database and Bundle metadata identities were not inspected during this
  browser smoke. VPS diagnostics were excluded by the owner. Do not infer a
  fully verified Release Bundle combination from this UI check.
- Previous owner-confirmed working Custom Cabinet source:
  `7c88d7bc0839608e3a652a9ee0d338922c5b7713`; the earlier confirmed source was
  `4638234f8bb9de8816263fe69df8709f66041513`. These source references do not
  establish that a ready-to-apply rollback artifact exists on the VPS.

## Historical Release Reference

The following references retain the result recorded through `2026-08-28`;
they do not describe the September Custom Cabinet source update above.

- Latest recorded published candidate: Custom Cabinet `cabinet-v2026.08.28.1`, commit
  `2a49b1350ab98e177c0d62d26462381aeca97648`, through Release Bundle
  `v2026.08.28`. Public assets and a fresh disposable-VPS smoke passed; this
  candidate had not been deployed to production at that verification date.
- Last verified production management Installer: `v2026.08.25`, commit
  `27e73f662297bbfe459af86cbe00b2a132d8ac0e`.
- Last fully verified production Release Bundle baseline: `v2026.08.24`, policy
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
