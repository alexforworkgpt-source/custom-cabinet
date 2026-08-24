# Compatibility Matrix

This document records verified source compatibility for each Custom Cabinet
baseline and Release Bundle. Tags and commit SHAs are immutable technical
identifiers, not public branding.

## Current Source Baseline

| Component | Version or reference | Exact source |
| --- | --- | --- |
| Custom Cabinet | `1.66.0`; published as `cabinet-v2026.08.24.4` / Release Bundle `v2026.08.22` | Integrated and refined source `3250e3a7f31fc2dc6f2c7779a42d86cf99a03210`; immutable release tag points to the same commit |
| Upstream Cabinet baseline | `v1.66.0` | `2192484b011068d8cb75c61a6aeaada1d06115aa` |
| Upstream Cabinet source | Repository | <https://github.com/BEDOLAGA-DEV/bedolaga-cabinet.git> |
| Upstream Bot | `v4.1.0` | `49b05d5ab79dd9bb92f0404bb0066cda8a175649` |
| Node.js development baseline | 20+ | Declared in `README.md` |

The current upstream source identity is also recorded in
[`UPSTREAM.md`](UPSTREAM.md). If this table and `UPSTREAM.md` disagree, stop and
resolve the provenance mismatch before synchronization or release.

## Current Release Verification

The published Custom Cabinet is compatible with the exact Upstream Bot identity
below. Publication and the disposable VPS update were requested by the owner;
the outstanding physical/manual gates remain untested, and production deployment
was not performed.

| Item | Exact value or result |
| --- | --- |
| Installer | `8d5feb922958f6d3deed0f837060059d1919b356` |
| Upstream Bot | `v4.1.0` / `49b05d5ab79dd9bb92f0404bb0066cda8a175649` |
| Runtime-tested Custom Cabinet commit | `3250e3a7f31fc2dc6f2c7779a42d86cf99a03210` |
| Candidate Cabinet artifact SHA-256 | `a8214dcbc09acda7f0598132c43794ed235c333440530173e8569614519100a8`; publication workflow repeated the build and verified byte identity |
| Database migration | `0104 → 0106`; injected failure restored the verified pre-update dump and `v4.0.0`, then the clean retry committed `v4.1.0` |
| Runtime result | Targeted Protected Update from `v2026.08.21` to `v2026.08.22` committed on the disposable Ubuntu 24.04 VPS; exact Bot/Cabinet HEAD, three containers, Cabinet HTTP `200` and webhook default `404` passed; the exact Installer lifecycle proof was reused because the protected identities and contract were unchanged |
| Verification date | `2026-08-24` |
| Release status | `PUBLISHED AND INSTALLED ON DISPOSABLE VPS`: Custom Cabinet `cabinet-v2026.08.24.4` and Release Bundle `v2026.08.22` were published and installed on `2026-08-24`; Biome, unit tests, type-check, production build, targeted mobile/desktop browser checks, deterministic publication and public asset verification passed; the unchanged Installer lifecycle proof was reused and Installer doctor was not rerun; real Telegram Android/iOS, physical screen-reader, initial Remnawave synchronization and live Remnawave `3.3.0+` GeoCheck remain outstanding; no unidentified production VPS was accessed |

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
