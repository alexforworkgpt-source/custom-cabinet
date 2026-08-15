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

The private preparation remote runs CI and dependency security audit. CodeQL
upload requires a public repository or GitHub Advanced Security and is deferred
to the publication workstream instead of being kept as a permanently failing
workflow.

## Provenance

The exact source is documented in [`UPSTREAM.md`](UPSTREAM.md). Upstream
copyright and AGPL terms remain unchanged in [`LICENSE`](LICENSE).
