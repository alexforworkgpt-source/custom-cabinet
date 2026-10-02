# Upstream Provenance

Custom Cabinet starts from Upstream Cabinet:
<https://github.com/BEDOLAGA-DEV/bedolaga-cabinet.git>.

- Upstream tag: `v1.79.0`
- Upstream Git SHA: `821c7b71823573a756de00418acb25118ede1c9c`
- Previous verified upstream tag/SHA: `v1.74.0` /
  `57810c7da24b5c142371ed83a6ad5e43a591d454`
- Original integration baseline: `v1.66.0` /
  `2192484b011068d8cb75c61a6aeaada1d06115aa`
- Integration verification: all 78 commits / 340 changed paths in
  `v1.74.0..v1.79.0` were classified. The receiving checkpoint is
  `80caeac6b756f208543a6c3f891877a4547c7d73` on branch
  `sync/upstream-v1.79.0`. The adapted source-gated working tree passed 158
  test files / 936 tests, type-check, production build, the affected Biome
  scope, `git diff --check` and a focused Farsi RTL browser check. Exact
  Upstream Bot `v4.15.0` / `877690a7039d1326b2c00eda3e297879b80c0678`
  passed its recorded contract and migration proof. The Custom Cabinet
  candidate is not committed or tagged yet. Release preparation aligned package
  metadata to `1.79.0`; no immutable Custom Cabinet tag, Release Bundle or
  production compatibility is claimed.
  Simple/Lite Mode and BSCHEKER/reachability remain intentionally absent from
  the Custom Cabinet frontend.

The exact range, per-commit decisions and verification evidence are recorded in
[`UPSTREAM_V1.79.0_SYNC_REPORT.md`](UPSTREAM_V1.79.0_SYNC_REPORT.md).

Future upstream synchronization must select and record another exact Git SHA.
The original copyright notice and AGPL terms remain intact in `LICENSE`.
