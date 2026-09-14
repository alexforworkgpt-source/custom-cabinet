# Upstream Provenance

Custom Cabinet starts from Upstream Cabinet:
<https://github.com/BEDOLAGA-DEV/bedolaga-cabinet.git>.

- Upstream tag: `v1.74.0`
- Upstream Git SHA: `57810c7da24b5c142371ed83a6ad5e43a591d454`
- Previous verified upstream tag/SHA: `v1.71.1` /
  `5ade78f506fd0e102d70e2d59af4aa97ef9c164b`
- Original integration baseline: `v1.66.0` /
  `2192484b011068d8cb75c61a6aeaada1d06115aa`
- Integration verification: all 44 commits / 129 changed paths in
  `v1.71.1..v1.74.0` were classified. The receiving checkpoint is
  `bff2f9434d38fe1d69050d25fb53337fb7c204eb`; the adapted Custom Cabinet
  application source remains local on `sync/upstream-v1.74.0-contract` until
  separately authorized for commit or push. It is verified against Upstream
  Bot `v4.10.0` / `9fcebfd7bc075dcca1bb9d1514740039208b906a`.
  BSCHEKER/reachability/GEO remains backend-only and is intentionally absent
  from Custom Cabinet. This is a source-integration identity, not a Release
  Bundle or production claim.

The exact range, per-commit decisions and verification evidence are recorded in
[`UPSTREAM_V1.74.0_SYNC_REPORT.md`](UPSTREAM_V1.74.0_SYNC_REPORT.md).

Future upstream synchronization must select and record another exact Git SHA.
The original copyright notice and AGPL terms remain intact in `LICENSE`.
