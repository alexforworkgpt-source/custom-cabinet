# Custom Cabinet

Custom Cabinet is an independently maintained frontend for a compatible
Upstream Bot. The initial source is pinned to Upstream Cabinet `v1.65.0` at Git
SHA `b866bebeeb6032db4baa3869a4917316fe8e0453`.

This preparation pass establishes neutral repository metadata and ownership. UI
and visual product customization intentionally belong to the next workstream.

## Development

Requirements: Node.js 24.15+ and npm.

```bash
npm ci
npm run dev
```

Verification:

```bash
npm test
npm run build
```

`npm run build` includes the full TypeScript check for the app and Node config.
Run `npm run type-check` separately for a quick check without building, or when
using `npm run build:docker`, which skips TypeScript checks.

## Release Boundary

Custom Cabinet does not publish production assets from an uncommitted local
folder. Installer builds a pinned Cabinet source commit in GitHub Actions and
delivers `cabinet-dist.tar.gz` through a verified Release Bundle.

Upstream publication workflows were removed from this repository. The separate
Custom Cabinet publication workflow and reviewed source records are described
in [`RELEASE_PROCESS.md`](RELEASE_PROCESS.md). Cabinet Releases record source
versions; compiled production assets remain in Installer Release Bundle.

## Provenance

The exact source is documented in [`UPSTREAM.md`](UPSTREAM.md). Upstream
copyright and AGPL terms remain unchanged in [`LICENSE`](LICENSE).

Local partial runtime proof for the new Bot is recorded in
[the v5 compatibility evidence](docs/compatibility-evidence-v1801-bot-v5-local-20261013.md); full S9 remains unverified.

## Maintenance

- [Bedolaga adaptation PRD](docs/prd/bedolaga-v1.80.1-bot-v5.0.0.md),
  [ADR 0003](docs/adr/0003-adapt-upstream-v1.80.1-bot-v5.0.0.md) and
  [the v1.80.1 source/transfer report](UPSTREAM_V1.80.1_SYNC_REPORT.md) define
  selected changes, preserved Custom behavior, exclusions and actual gates.

- [`docs/known-issues/classic-auto-purchase.md`](docs/known-issues/classic-auto-purchase.md) records the open classic auto-purchase defect, reproduction, current frontend scope and revalidation conditions after an Upstream Bot fix.
- [`UPSTREAM_SYNC.md`](UPSTREAM_SYNC.md) defines the required Upstream Cabinet
  integration process.
- [`UPSTREAM_SYNC_REPORT_TEMPLATE.md`](UPSTREAM_SYNC_REPORT_TEMPLATE.md) is the
  required analysis and completion record for each synchronization.
- [`CUSTOMIZATION_MAP.md`](CUSTOMIZATION_MAP.md) records upstream-owned,
  custom-owned and hybrid areas.
- [`COMPATIBILITY.md`](COMPATIBILITY.md) records verified version combinations.
- [`REDESIGN_RULES.md`](REDESIGN_RULES.md) defines the Custom Cabinet redesign
  contract.
- [`INTERFACE_MAP.md`](INTERFACE_MAP.md) maps the current routes, navigation,
  interface states and access rules.
- [`DESIGN_UX_UI_AUDIT.md`](DESIGN_UX_UI_AUDIT.md) contains the current detailed
  UI/UX audit.
- [`LIVE_CHECK.md`](LIVE_CHECK.md) defines staging and production verification.
- [`LIVE_CHECK_REPORT_TEMPLATE.md`](LIVE_CHECK_REPORT_TEMPLATE.md) records each
  live check result and release decision.
