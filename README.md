# Custom Cabinet

Custom Cabinet is an independently maintained frontend for a compatible
Upstream Bot. The initial source is pinned to Upstream Cabinet `v1.65.0` at Git
SHA `b866bebeeb6032db4baa3869a4917316fe8e0453`.

This preparation pass establishes neutral repository metadata and ownership. UI
and visual product customization intentionally belong to the next workstream.

## Development

Requirements: Node.js 20+ and npm.

```bash
npm ci
npm run dev
```

Verification:

```bash
npm test
npm run type-check
npm run build
```

## Release Boundary

Custom Cabinet does not publish production assets from an uncommitted local
folder. Installer builds a pinned Cabinet source commit in GitHub Actions and
delivers `cabinet-dist.tar.gz` through a verified Release Bundle.

Upstream publication workflows were removed from this repository. Automation
for future Custom Cabinet releases is a separate workstream.

## Provenance

The exact source is documented in [`UPSTREAM.md`](UPSTREAM.md). Upstream
copyright and AGPL terms remain unchanged in [`LICENSE`](LICENSE).

## Maintenance

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
