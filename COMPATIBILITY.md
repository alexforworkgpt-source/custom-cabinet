# Compatibility Matrix

This document records verified source compatibility for each Custom Cabinet
baseline and Release Bundle. Tags and commit SHAs are immutable technical
identifiers, not public branding.

## Current Source Baseline

| Component | Version or reference | Exact source |
| --- | --- | --- |
| Custom Cabinet | `1.66.0`; source reference for the latest owner-reported production update from `main`, not a new Release Bundle | `2346ea323030e2330fff90dcf01756db68cdbbcf`; latest recorded released source `2a49b1350ab98e177c0d62d26462381aeca97648` through `cabinet-v2026.08.28.1` / `v2026.08.28` |
| Custom Cabinet release-preparation source | Development source; production deployment not confirmed | `13ec9332f49a276f6afdce8b698b78eb0902293c` |
| Upstream Cabinet baseline | `v1.66.0` | `2192484b011068d8cb75c61a6aeaada1d06115aa` |
| Upstream Cabinet source | Repository | <https://github.com/BEDOLAGA-DEV/bedolaga-cabinet.git> |
| Upstream Bot | Last verified Bundle baseline `v4.1.0`; production identity not rechecked in September | `49b05d5ab79dd9bb92f0404bb0066cda8a175649` |
| Node.js development baseline | 20+ | Declared in `README.md` |

The current upstream source identity is also recorded in
[`UPSTREAM.md`](UPSTREAM.md). If this table and `UPSTREAM.md` disagree, stop and
resolve the provenance mismatch before synchronization or release.

## Post-Bundle Custom Cabinet Update

The source reference for the latest production update on `2026-09-03` is
`2346ea323030e2330fff90dcf01756db68cdbbcf`. The owner supplied an Installer
update log showing a fast-forward from `7c88d7bc` to `2346ea32`, a completed
frontend build and a successful update, then confirmed the buttons work.
This is a source update directly from `main`, not a newly published or verified
Release Bundle. Existing immutable tags and Bundle records below are unchanged.

Later commits on `main` are development changes, not evidence of a subsequent
production update or a new verified Bundle combination. This includes the
support-header layout change in `13ec9332f49a276f6afdce8b698b78eb0902293c`.

The earlier authenticated production browser smoke on `2026-09-02`, for source
`7c88d7bc0839608e3a652a9ee0d338922c5b7713`, passed for
Dashboard, subscription management, devices, Connection, Balance, Profile and
Support. It checked the device counter, automatic expansion of additional
options, hidden location management, shortened copy, session persistence after
reload and narrow layout, with no observed console errors or warnings. The
owner separately confirmed the Admin button, not the complete administrative
console. No payment, settings mutation or device deletion was performed.

For `7c88d7b`, pre-publication source checks passed: Biome, 286 unit tests,
TypeScript, production build and Playwright (299 passed, 6 configured skips).
These are historical results, not a full browser-gate result for `13ec933`.
The source checks and the browser smoke do not establish an exact new Bot/Bundle
compatibility record. The owner-supplied update log was not followed by an
independent inspection of the VPS Git SHA, Installer, Upstream Bot, image digests,
database schema, Bundle metadata, server logs or complete network status.
VPS diagnostics were excluded by the owner; physical-device and
staging checks remain unverified.

Previous owner-confirmed working source:
`7c88d7bc0839608e3a652a9ee0d338922c5b7713`; the earlier confirmed source was
`4638234f8bb9de8816263fe69df8709f66041513`. These are not evidence of a prepared
rollback artifact on the VPS.

## Release Preparation Gate (2026-09-03)

Source under test: `13ec9332f49a276f6afdce8b698b78eb0902293c`. This preparation
changes documentation only; source code, tests and dependencies remain at that
commit. No new Release or Release Bundle has been published.

- PASS: 286 unit tests in 39 files, Biome (600 files), TypeScript and production
  build. All 69 instruction PNGs decoded with CRC checks; working-tree and built
  copies match the source commit.
- PASS: release-delta checks for secret patterns, private paths and public
  branding; no findings in the checked changes. These checks do not certify
  every possible secret format.
- GitHub CI, Security Audit and CodeQL passed for the exact source commit.
- Browser gate is not passed: the initial full matrix returned 382 passed,
  6 configured skips and 2 failures. Twelve isolated repeats passed unchanged,
  but the second full matrix without a concurrent build also returned
  382 passed, 6 configured skips and 2 failures: untranslated-key rendering in
  Telegram login and Dashboard recommendations on mobile-320.

The UI can retain translation keys instead of labels while locale resources
load asynchronously. The symptom is confirmed; a controlled loading-order
regression test and a fix are still needed. Passing isolated reruns does not
establish that this defect is fixed. On `2026-09-05`, the owner explicitly
accepted this known limitation for the current release and deferred its fix to
a later task. This decision authorizes continuing publication but does not turn
the browser failures into `PASS`. Release publication and disposable-VPS Bundle
verification have not started, and the historical manual gates below remain
`BLOCKED`.

## Historical Release Verification (through 2026-08-28)

Production had separate management and runtime reference points at the recorded
verification date. The management Installer was `v2026.08.25`, while the running
Release Bundle was `v2026.08.24`. That management-only update did not run
Protected Update and did not change the runtime identities below. The newer
`v2026.08.28` Bundle was published and passed a fresh targeted installation on
the disposable integration VPS, but it was not deployed to production at that
date. These identities are a historical baseline, not the complete current
runtime after the source update above. Physical-device and staging product
gates remain `BLOCKED`; they are not implied by publication or infrastructure
smoke results.

| Item | Exact value or result |
| --- | --- |
| Management Installer | `v2026.08.25` / `27e73f662297bbfe459af86cbe00b2a132d8ac0e`; management-only production update `PASS` |
| Runtime Release Bundle | `v2026.08.24`, policy `rollback-compatible`; Installer tag commit `462f3fb315f063a90522cd6e3ffc718434e516f9` |
| Latest published candidate | Release Bundle `v2026.08.28`; Custom Cabinet `cabinet-v2026.08.28.1` / `2a49b1350ab98e177c0d62d26462381aeca97648`; production deployment `NOT STARTED` |
| Upstream Bot | `v4.1.0` / `49b05d5ab79dd9bb92f0404bb0066cda8a175649` |
| Production Custom Cabinet | `cabinet-v2026.08.24.4` / `3250e3a7f31fc2dc6f2c7779a42d86cf99a03210` |
| Cabinet artifact SHA-256 | `a8214dcbc09acda7f0598132c43794ed235c333440530173e8569614519100a8`; deterministic publication and public re-download passed |
| Candidate Cabinet artifact SHA-256 | `a81eb93700c734959711db3857d89326d8c3057911f248e34f5bdb6a974cc283`; deterministic publication, public re-download and fresh disposable-VPS installation passed |
| Runtime images | PostgreSQL `postgres@sha256:4006528dcbdd9be8c1aaa50389caea4e93c46d6f54c3533bcd3253725e526e23`; Redis `redis@sha256:e7723ff73d963f5cc6d9c4643ea3d989527a402a319239054e9472a7fb9219a2` |
| Database schema | Revision `0106`; production migration and rollback-compatible transition `PASS` |
| Production technical verification | `PASS`: baseline, Status, Diagnostics, three healthy services, exact Git/image/volume identities, public Cabinet, Remnawave, Telegram webhook and authorized browser smoke |
| Management-only verification | `PASS`: Status and Diagnostics before/after, launcher execution and unchanged container IDs, image IDs, volumes, Git SHAs, schema and runtime configuration hashes |
| Local and publication gates | `PASS`: Biome, unit tests, type-check, production build, targeted browser checks, deterministic assets, checksums, manifest, provenance and public asset verification |
| Physical-device and staging product gates | `BLOCKED`: real Telegram Android/iOS, physical screen reader, authenticated staging matrix, initial Remnawave synchronization and live Remnawave `3.3.0+` GeoCheck are not technical passes |
| Verification dates | Runtime transition `2026-08-24`; management-only Installer update `2026-08-25`; latest candidate `2026-08-28` |

## Release Bundle Record

The following rows passed the Release Bundle contract and deterministic artifact
gate. The Installer identity passed the full disposable Ubuntu lifecycle;
Cabinet-only bundles may reuse that exact proof when all protected identities and
contracts remain unchanged, followed by a targeted smoke installation. Product
live sign-off remains `BLOCKED` as recorded in the linked reports.

| Release Bundle | Installer commit | Upstream Bot tag/SHA | Custom Cabinet tag/commit | Upstream Cabinet baseline SHA | Runtime images | Verification date | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `v2026.08.9` | `a5af6c72069a98b42e97cfb17ebcf1d59443324f` | `v4.0.0` / `f553d1896dcd347fd74012f6394fd2277161bdd1` | `0f9794d48e43e428b6f3d4634b84d82fda0eb0ba` | `b866bebeeb6032db4baa3869a4917316fe8e0453` | PostgreSQL `postgres@sha256:4006528dcbdd9be8c1aaa50389caea4e93c46d6f54c3533bcd3253725e526e23`; Redis `redis@sha256:e7723ff73d963f5cc6d9c4643ea3d989527a402a319239054e9472a7fb9219a2`; Node `node@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293`; Nginx `nginx@sha256:4a73073bd557c65b759505da037898b61f1be6cbcc3c2c3aeac22d2a470c1752` | 2026-08-17 | Published and deployed to disposable integration VPS; full product live sign-off is `BLOCKED`; see `LIVE_CHECK_REPORT_2026.08.9.md` |
| `v2026.08.15` | `a5af6c72069a98b42e97cfb17ebcf1d59443324f` | `v4.0.0` / `f553d1896dcd347fd74012f6394fd2277161bdd1` | `cabinet-v2026.08.21.2` / `3f7bb3146977f1496f2f453c5ca1b362b3731c00` | `b866bebeeb6032db4baa3869a4917316fe8e0453` | PostgreSQL `postgres@sha256:4006528dcbdd9be8c1aaa50389caea4e93c46d6f54c3533bcd3253725e526e23`; Redis `redis@sha256:e7723ff73d963f5cc6d9c4643ea3d989527a402a319239054e9472a7fb9219a2`; Node `node@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293`; Nginx `nginx@sha256:4a73073bd557c65b759505da037898b61f1be6cbcc3c2c3aeac22d2a470c1752` | 2026-08-22 | Published assets independently verified; exact Installer lifecycle proof reused because protected identities/contracts were unchanged; targeted Protected Update and postflight passed on the disposable integration VPS with `outcome=committed`; full product live sign-off remains `BLOCKED`; see `LIVE_CHECK_REPORT_2026-08-21_ALL_PAGES.md` |
| `v2026.08.16` | `a5af6c72069a98b42e97cfb17ebcf1d59443324f` | `v4.0.0` / `f553d1896dcd347fd74012f6394fd2277161bdd1` | `cabinet-v2026.08.22.1` / `3d057140fdf26f55ca6a390cc9bca0261e0161ff` | `b866bebeeb6032db4baa3869a4917316fe8e0453` | PostgreSQL `postgres@sha256:4006528dcbdd9be8c1aaa50389caea4e93c46d6f54c3533bcd3253725e526e23`; Redis `redis@sha256:e7723ff73d963f5cc6d9c4643ea3d989527a402a319239054e9472a7fb9219a2`; Node `node@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293`; Nginx `nginx@sha256:4a73073bd557c65b759505da037898b61f1be6cbcc3c2c3aeac22d2a470c1752` | 2026-08-22 | Published assets and exact identities verified; fresh targeted installation and guest smoke passed on the disposable integration VPS with `outcome=committed`; full product live sign-off remains `BLOCKED`; see `LIVE_CHECK_REPORT_2026.08.16.md` |
| `v2026.08.17` | `a5af6c72069a98b42e97cfb17ebcf1d59443324f` | `v4.0.0` / `f553d1896dcd347fd74012f6394fd2277161bdd1` | `cabinet-v2026.08.22.2` / `23c9889f6ab1ad514faf36ad9cbf66dc5407ad44` | `b866bebeeb6032db4baa3869a4917316fe8e0453` | PostgreSQL `postgres@sha256:4006528dcbdd9be8c1aaa50389caea4e93c46d6f54c3533bcd3253725e526e23`; Redis `redis@sha256:e7723ff73d963f5cc6d9c4643ea3d989527a402a319239054e9472a7fb9219a2`; Node `node@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293`; Nginx `nginx@sha256:4a73073bd557c65b759505da037898b61f1be6cbcc3c2c3aeac22d2a470c1752` | 2026-08-22 | Published assets and exact identities independently verified; protected identities and contracts are unchanged, so the exact Installer lifecycle proof was reused; targeted Protected Update, postflight and guest browser smoke passed on the disposable integration VPS with `outcome=committed`; full product live sign-off remains `BLOCKED`; see `LIVE_CHECK_REPORT_2026.08.17.md` |
| `v2026.08.18` | `8d5feb922958f6d3deed0f837060059d1919b356` | `v4.0.0` / `f553d1896dcd347fd74012f6394fd2277161bdd1` | `cabinet-v2026.08.22.2` / `23c9889f6ab1ad514faf36ad9cbf66dc5407ad44` | `b866bebeeb6032db4baa3869a4917316fe8e0453` | PostgreSQL `postgres@sha256:4006528dcbdd9be8c1aaa50389caea4e93c46d6f54c3533bcd3253725e526e23`; Redis `redis@sha256:e7723ff73d963f5cc6d9c4643ea3d989527a402a319239054e9472a7fb9219a2`; Node `node@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293`; Nginx `nginx@sha256:4a73073bd557c65b759505da037898b61f1be6cbcc3c2c3aeac22d2a470c1752` | 2026-08-22 | Installer-only Bundle; exact Installer SHA passed the full disposable Ubuntu 24.04 lifecycle and final postflight; public assets, fresh targeted installation, `outcome=committed`, doctor, health, app-shell `no-store`, missing-asset `404` and guest browser smoke passed on the disposable integration VPS; full product live sign-off remains `BLOCKED`; see `LIVE_CHECK_REPORT_2026.08.18.md` |
| `v2026.08.19` | `8d5feb922958f6d3deed0f837060059d1919b356` | `v4.1.0` / `49b05d5ab79dd9bb92f0404bb0066cda8a175649` | `cabinet-v2026.08.24.1` / `0a0062b96f467aa04cc460db925f7d116d411e94` | `2192484b011068d8cb75c61a6aeaada1d06115aa` | PostgreSQL `postgres@sha256:4006528dcbdd9be8c1aaa50389caea4e93c46d6f54c3533bcd3253725e526e23`; Redis `redis@sha256:e7723ff73d963f5cc6d9c4643ea3d989527a402a319239054e9472a7fb9219a2`; Node `node@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293`; Nginx `nginx@sha256:4a73073bd557c65b759505da037898b61f1be6cbcc3c2c3aeac22d2a470c1752` | 2026-08-24 | Published immutable assets independently downloaded and verified; Cabinet SHA-256 `94f974dc4293cfdc99b73a4803a5c90b7351c60d9287e13d5230897aa82292a5`, Installer archive SHA-256 `89f1add764f6b6519e2dd3aaa8179479e32dcdf405c446bc1cb37b44d2a6f75a`; fresh persistent installation, doctor and independent postflight passed on the disposable integration VPS with `outcome=committed`; owner waived the remaining manual gates, which are not technical passes; production deployment was not performed; see `LIVE_CHECK_REPORT_2026.08.19.md` |
| `v2026.08.20` | `8d5feb922958f6d3deed0f837060059d1919b356` | `v4.1.0` / `49b05d5ab79dd9bb92f0404bb0066cda8a175649` | `cabinet-v2026.08.24.2` / `4fc5eee26d6364459a96eee96f6eba23e703b7f0` | `2192484b011068d8cb75c61a6aeaada1d06115aa` | PostgreSQL `postgres@sha256:4006528dcbdd9be8c1aaa50389caea4e93c46d6f54c3533bcd3253725e526e23`; Redis `redis@sha256:e7723ff73d963f5cc6d9c4643ea3d989527a402a319239054e9472a7fb9219a2`; Node `node@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293`; Nginx `nginx@sha256:4a73073bd557c65b759505da037898b61f1be6cbcc3c2c3aeac22d2a470c1752` | 2026-08-24 | Exact Installer lifecycle proof reused because Installer, Bot, image digests, Release Bundle contract and target OS were unchanged; 6 public assets, checksums and provenance passed; targeted Protected Update and independent smoke passed on the disposable integration VPS with `outcome=committed`; manual gates remain outstanding and production was not accessed; see `LIVE_CHECK_REPORT_2026.08.20.md` |
| `v2026.08.21` | `8d5feb922958f6d3deed0f837060059d1919b356` | `v4.1.0` / `49b05d5ab79dd9bb92f0404bb0066cda8a175649` | `cabinet-v2026.08.24.3` / `251729c970c1ba9cc342e5b7e5938594a5b8c67c` | `2192484b011068d8cb75c61a6aeaada1d06115aa` | PostgreSQL `postgres@sha256:4006528dcbdd9be8c1aaa50389caea4e93c46d6f54c3533bcd3253725e526e23`; Redis `redis@sha256:e7723ff73d963f5cc6d9c4643ea3d989527a402a319239054e9472a7fb9219a2`; Node `node@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293`; Nginx `nginx@sha256:4a73073bd557c65b759505da037898b61f1be6cbcc3c2c3aeac22d2a470c1752` | 2026-08-24 | Published without rerunning the full local gate at the owner's request; the immediately preceding Biome, type, unit, build and targeted browser checks had passed; public checksums passed; targeted Protected Update committed on the disposable integration VPS and exact SHA, three containers, Cabinet `200` and webhook default `404` were confirmed; Installer doctor was not rerun and production was not accessed |
| `v2026.08.22` | `8d5feb922958f6d3deed0f837060059d1919b356` | `v4.1.0` / `49b05d5ab79dd9bb92f0404bb0066cda8a175649` | `cabinet-v2026.08.24.4` / `3250e3a7f31fc2dc6f2c7779a42d86cf99a03210` | `2192484b011068d8cb75c61a6aeaada1d06115aa` | PostgreSQL `postgres@sha256:4006528dcbdd9be8c1aaa50389caea4e93c46d6f54c3533bcd3253725e526e23`; Redis `redis@sha256:e7723ff73d963f5cc6d9c4643ea3d989527a402a319239054e9472a7fb9219a2`; Node `node@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293`; Nginx `nginx@sha256:4a73073bd557c65b759505da037898b61f1be6cbcc3c2c3aeac22d2a470c1752` | 2026-08-24 | Exact Installer lifecycle proof reused because Installer, Bot, image digests, Release Bundle contract and Ubuntu 24.04 were unchanged; Biome, unit, type, build and targeted browser gates passed; all six public assets, checksums, provenance and exact source identities passed; targeted Protected Update committed on the disposable integration VPS and exact SHA, artifact hash, three containers, Cabinet `200` and webhook default `404` were confirmed; production was not accessed |
| `v2026.08.24` | `462f3fb315f063a90522cd6e3ffc718434e516f9` | `v4.1.0` / `49b05d5ab79dd9bb92f0404bb0066cda8a175649` | `cabinet-v2026.08.24.4` / `3250e3a7f31fc2dc6f2c7779a42d86cf99a03210` | `2192484b011068d8cb75c61a6aeaada1d06115aa` | PostgreSQL `postgres@sha256:4006528dcbdd9be8c1aaa50389caea4e93c46d6f54c3533bcd3253725e526e23`; Redis `redis@sha256:e7723ff73d963f5cc6d9c4643ea3d989527a402a319239054e9472a7fb9219a2`; Node `node@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293`; Nginx `nginx@sha256:4a73073bd557c65b759505da037898b61f1be6cbcc3c2c3aeac22d2a470c1752` | 2026-08-24 | Immutable public assets, checksum, manifest, exact source identities, full disposable Ubuntu 24.04 lifecycle and final postflight passed. Production transition passed baseline, migration, Status, Diagnostics, exact runtime identity, health and authorized browser smoke. Physical-device and staging product gates remain `BLOCKED`. |
| `v2026.08.25` | `27e73f662297bbfe459af86cbe00b2a132d8ac0e` | `v4.1.0` / `49b05d5ab79dd9bb92f0404bb0066cda8a175649` | `cabinet-v2026.08.24.4` / `3250e3a7f31fc2dc6f2c7779a42d86cf99a03210` | `2192484b011068d8cb75c61a6aeaada1d06115aa` | PostgreSQL `postgres@sha256:4006528dcbdd9be8c1aaa50389caea4e93c46d6f54c3533bcd3253725e526e23`; Redis `redis@sha256:e7723ff73d963f5cc6d9c4643ea3d989527a402a319239054e9472a7fb9219a2`; Node `node@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293`; Nginx `nginx@sha256:4a73073bd557c65b759505da037898b61f1be6cbcc3c2c3aeac22d2a470c1752` | 2026-08-25 | Exact Installer commit passed local gates, a clean full disposable Ubuntu 24.04 lifecycle, final postflight, immutable publication and independent public asset verification. Production received only the management Installer and launcher; Protected Update was not run, so the running runtime Release Bundle remains `v2026.08.24`. Physical-device and staging product gates remain `BLOCKED`. |
| `v2026.08.26` | `27e73f662297bbfe459af86cbe00b2a132d8ac0e` | `v4.1.0` / `49b05d5ab79dd9bb92f0404bb0066cda8a175649` | `cabinet-v2026.08.26.1` / `e4002ebe225ea32a047d86ce311f26d4071a61bc` | `2192484b011068d8cb75c61a6aeaada1d06115aa` | PostgreSQL `postgres@sha256:4006528dcbdd9be8c1aaa50389caea4e93c46d6f54c3533bcd3253725e526e23`; Redis `redis@sha256:e7723ff73d963f5cc6d9c4643ea3d989527a402a319239054e9472a7fb9219a2`; Node `node@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293`; Nginx `nginx@sha256:4a73073bd557c65b759505da037898b61f1be6cbcc3c2c3aeac22d2a470c1752` | 2026-08-26 | Exact Installer lifecycle proof reused because the Installer commit, Bot SHA, image digests, Bundle contract and Ubuntu target are unchanged. Custom Cabinet gates, deterministic publication and independent public asset verification passed. A fresh targeted installation committed on the disposable integration VPS; doctor, exact source identities, three containers, Cabinet HTTP `200`, webhook default `404` and complete cleanup passed. Production was not accessed; see `LIVE_CHECK_REPORT_2026.08.26.md`. |
| `v2026.08.28` | `27e73f662297bbfe459af86cbe00b2a132d8ac0e` | `v4.1.0` / `49b05d5ab79dd9bb92f0404bb0066cda8a175649` | `cabinet-v2026.08.28.1` / `2a49b1350ab98e177c0d62d26462381aeca97648` | `2192484b011068d8cb75c61a6aeaada1d06115aa` | PostgreSQL `postgres@sha256:4006528dcbdd9be8c1aaa50389caea4e93c46d6f54c3533bcd3253725e526e23`; Redis `redis@sha256:e7723ff73d963f5cc6d9c4643ea3d989527a402a319239054e9472a7fb9219a2`; Node `node@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293`; Nginx `nginx@sha256:4a73073bd557c65b759505da037898b61f1be6cbcc3c2c3aeac22d2a470c1752` | 2026-08-28 | Exact Installer lifecycle proof reused because the Installer commit, Bot SHA, image digests, Bundle contract and Ubuntu target are unchanged. Custom Cabinet and GitHub gates, deterministic publication and independent public asset verification passed. A fresh targeted installation committed on the disposable integration VPS; doctor, exact source identities, three containers, Cabinet and branding HTTP `200`, unified health `ok`, webhook default `404` and complete cleanup passed. Production was not accessed; see `LIVE_CHECK_REPORT_2026.08.28.md`. |

Use this format for every released combination:

| Release Bundle | Installer commit | Upstream Bot tag/SHA | Custom Cabinet tag/commit | Upstream Cabinet baseline SHA | Runtime images | Verification date | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `vYYYY.MM.N` | exact SHA | exact tag and SHA | immutable tag and SHA | exact SHA | immutable digests | YYYY-MM-DD | known constraints |

## Update Rules

Do not infer compatibility from matching version numbers. Verify the API and
runtime behavior against the exact Upstream Bot source selected for the Release
Bundle.

When Upstream Cabinet changes an API contract, WebSocket event, permission,
payment flow, deep link or Telegram behavior, record the minimum compatible
Upstream Bot source.

Do not update this matrix at the start of an integration. Update it only after
the selected Custom Cabinet commit and Upstream Bot source pass the applicable
tests and browser/platform smoke checks.

Do not replace an existing Release Bundle row or asset. Publish a changed
combination under a new immutable tag.
