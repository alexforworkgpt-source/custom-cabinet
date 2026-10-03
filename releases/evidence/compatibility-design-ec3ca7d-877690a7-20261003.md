# Custom Cabinet design review / Upstream Bot, 2026-10-03

Status: **PASS_SOURCE_CONTRACT_SCOPE**. This is bounded frontend evidence,
not full authenticated staging or real payment/renewal compatibility proof.
The owner authorized this release package and stable promotion after its gates;
production and latest changes are excluded.

| Identity | Value |
| --- | --- |
| Cabinet source | `ec3ca7dd0394b73b5630f82c978ed1d6fbe172d6` |
| Cabinet tree | `150fec3536a0a7dd6a9eb6ea16ccb29d9c772774` |
| Previous stable Cabinet | `cabinet-v2026.10.02.1` / `8fb8cbec19d651fcfaee3bce32621031b3e69965` |
| Previous stable Bundle | `bundle-v2026.10.02.1` |
| Upstream Cabinet | `v1.79.0` / `821c7b71823573a756de00418acb25118ede1c9c` |
| Upstream Bot | `v4.15.0` / `877690a7039d1326b2c00eda3e297879b80c0678` |
| Backend contract | `1` |

1. **Source review:** `src/api`, `src/types`, `src/config`, package/lock,
   `UPSTREAM.md` and `LICENSE` are byte-identical to the previous stable source.
   No backend source, API, business rule or migration is changed. The bounded
   [previous source-contract proof](https://github.com/alexforworkgpt-source/custom-cabinet/blob/3fed554a456bb7babcdec288d3c81f39de6fd816/releases/evidence/compatibility-evidence-8fb8cbe-877690a7-20261002.md)
   retains its 145 Bot tests and 578/579 method/path matches. They were not rerun
   for this frontend-only change, and are not new runtime PASS claims.
2. **Current frontend gates:** 1006 tests / 161 files PASS on Node 24.19.0
   before the final padding-only correction and Node 26.10.0 on the final source.
   Type-check/build PASS on Node 24.19.0. Publication guards: 15 PASS.
   Biome: zero errors, 40 existing warnings, five infos. The publication workflow
   independently reruns exact-source Node 24/26, build and CodeQL on Linux.
3. **Current mocked browser gate:** 117 PASS, zero failures, zero skips/retries;
   widths 320/375/768/1024/1280, RU/EN/FA and light/dark/operator themes.
   Executed specs: `classic-monthly-pricing`, `classic-renewal-consistency`,
   `classic-renewal-payment`, `classic-selection-theme`,
   `tariff-renewal-navigation`, `unified-payment-cta`. Tests exercise selected
   renewal period/subscription ID, direct payment and top-up return with fresh
   values; trial/daily/limited/explicit tariff selection rules remain covered by
   unit tests. APIs and Telegram are mocked; no real payment is made.
4. **Visual review:** the actual browser screenshot showed discount/title overlap
   at narrow widths in purchase and renewal. Two geometry assertions failed
   before correction and passed after reserving top padding only on discounted
   cards; the full 117-case run then passed. Existing Card/Button/icon/pricing
   patterns are reused. Trial continuation and management action retain the
   previous design; the approved trial traffic badge is independently changed.
5. **Public-source review:** 990 files scanned, no credential shapes or forbidden
   private/generated paths. Only the selected 20 design/route/test/documentation
   files were staged. Source copies are isolated; owner work is preserved.

Initial unsupported Node 24.11/parallel-load unit failures and transient local
preview launch failures are retained locally and are not counted as PASS.
System Chrome is used because the bundled Playwright browser revision is absent;
the temporary config changes only channel, paths and server cwd, not assertions,
retry policy or timeouts. Local artifacts are private and are not release assets.

Known accepted limits remain: Classic auto-purchase is OPEN; the unchanged unused
legacy email wrapper is OPEN; complete response-field parity, authenticated
staging, physical Telegram/accessibility, real payment/renewal/concurrency/panel
flows are BLOCKED within the prior coverage scope. No backend fix is proposed.
BSCHEKER and Simple/Lite Mode stay excluded. A new Bundle must independently pass
public-byte verification and a targeted disposable installation before stable;
this source report does not replace either mandatory gate.
