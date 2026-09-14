# ADR 0001: BSCHEKER is excluded from Custom Cabinet

Status: Accepted<br>
Date: 2026-09-09

## Context

The official Upstream Bot `v4.7.1` at
`cd903b7cfd3bac6e08e571904662c88e8c151d1d` contains the BSCHEKER backend and
its database migrations. Upstream Cabinet added the corresponding frontend in
the range from `v1.69.1` (`3da34239d1c1c7b87a0184e74d49bde43ea88b89`)
to `v1.71.1` (`5ade78f506fd0e102d70e2d59af4aa97ef9c164b`).

Custom Cabinet does not offer this paid external reachability service. Removing
it from the official Upstream Bot would require a separate backend fork and is
not part of the Cabinet integration.

## Decision

Custom Cabinet must not contain BSCHEKER routes, navigation, permissions,
settings, transport types, API clients or requests, polling, history, server
cards, launch or charge-confirmation flows, operator icon assets, locales or
test fixtures.

The repository test suite enforces this boundary through
`src/noBscheker.guard.test.ts`. The guard scans the frontend source, browser
fixtures, public assets and public build configuration for BSCHEK markers,
reachability contracts and the upstream-only operator asset bundle.

General safe-area, virtual-keyboard, navigation and accessibility fixes from
nearby upstream commits may be adapted only after their dependency on the
reachability feature has been removed. Those fixes must be verified on existing
Custom Cabinet screens and components.

## Consequences

- Upstream Bot `v4.7.1` remains an unmodified official source, including its
  BSCHEKER backend and migrations.
- Custom Cabinet neither exposes nor calls that backend capability.
- A future upstream synchronization cannot reintroduce the frontend as an
  incidental merge; changing this boundary requires a new owner-approved ADR.
- Upstream documentation remains factual and is not rewritten to claim that
  BSCHEKER is absent from Upstream Bot or Upstream Cabinet.
