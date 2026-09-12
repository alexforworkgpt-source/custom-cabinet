# Upstream Synchronization Report: v1.71.1

Status: integration candidate verified; Issues 01-10 complete, Issue 11 exact
commit record pending<br>
Date: 2026-09-12<br>
Receiving branch: `sync/upstream-v1.71.1-contract`

Do not mark this report completed or update `UPSTREAM.md` until the selected
range is integrated and the applicable source, browser, Bot and Installer gates
pass.

## Source Identity

| Item | Value |
| --- | --- |
| Upstream Cabinet repository | <https://github.com/BEDOLAGA-DEV/bedolaga-cabinet.git> |
| Previous release | <https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/releases/tag/v1.69.1> |
| Previous tag / SHA | `v1.69.1` / `3da34239d1c1c7b87a0184e74d49bde43ea88b89` |
| Target release | <https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/releases/tag/v1.71.1> |
| Target tag / SHA | `v1.71.1` / `5ade78f506fd0e102d70e2d59af4aa97ef9c164b` |
| Receiving Custom Cabinet base commit | `e0b623e1cbe83b1697c24325ccb98c27ba6cdd46` from current `origin/main` |
| Integrated Custom Cabinet candidate | Combined uncommitted Issues 01-11 working tree based on `e0b623e1cbe83b1697c24325ccb98c27ba6cdd46`; immutable commit SHA pending |
| Intended Upstream Bot release | <https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/releases/tag/v4.7.1> |
| Intended Upstream Bot tag / SHA | `v4.7.1` / `cd903b7cfd3bac6e08e571904662c88e8c151d1d` |
| Production reference point | Release Bundle `v2026.09.07.1` |

Both Cabinet tags resolve to the exact SHAs above. The target range is a direct
descendant of the previous tag.

## Range Summary

- Incoming commits: 80.
- Changed paths: 264.
- BSCHEKER/reachability commits: 51; 50 are entirely skipped and one
  (`e205dfa8`) has a separable global layout fix to adapt.
- Independent behavior commits: 20; each is assigned to an integration issue.
  The seven shared platform commits assigned to Issue 02, the email
  registration commit assigned to Issue 03, the four tariff-pricing commits
  assigned to Issue 04, the device-reason/mobile-term commit assigned to Issue
  06, the email retry-queue commits assigned to Issue 07, the env-locked
  settings commit assigned to Issue 08 and the referral-withdrawal commit
  assigned to Issue 09 are now adapted to Custom Cabinet. All selected Cabinet
  feature slices are ported, and Issue 10 has verified their contract against
  the exact official Upstream Bot `v4.7.1` source and isolated test runtime.
- Merge/release metadata commits: 9; recorded but not copied as application
  behavior.
- Dependency changes: none. `package.json` changes only the upstream package
  version from `1.69.1` to `1.71.1`; Custom Cabinet release metadata remains
  Custom-owned.
- Upstream Bot commit
  [`7448af74`](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/7448af743f6142e57f6f3ca2908a6ef163c42c03)
  acknowledges a quick-top-up tap before the provider call and is included in
  the exact `v4.7.1` pin. Issue 05 preserves that Bot behavior and verifies the
  equivalent pending/error contract in the web-facing Custom Cabinet flow.

Decision terms below describe the current integration state: `adapted` means
the behavior is implemented through the named Custom Cabinet seam; a future
issue name means the port remains pending; `intentionally skipped` means the
source change must not enter Custom Cabinet. No row is currently blocked by
missing identity or product decision.

## Commit Impact Matrix

Ownership: U = Upstream-owned behavior/contract, H = Hybrid behavior and
presentation, C = Custom-owned presentation/repository metadata.

| Upstream commit | Affected scenario / representative paths | Class / ownership | Decision and reason | Required verification |
| --- | --- | --- | --- | --- |
| [3cb9b0ac](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/3cb9b0aca8924d63b956f2dfe8d2fbb970d9ae3d) | reachability API/types and money formatting | Contract/Behavior / U | Intentionally skipped: BSCHEKER API is excluded | no-BSCHEKER guard; no client/request |
| [cc0b4123](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/cc0b4123c51c642bbb8280328a5ebfa3323b8547) | verdict labels, colors and SIM selection helpers | Behavior/Presentation / H | Intentionally skipped: feature-only domain helpers | guard; no reachability modules |
| [1ccce544](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/1ccce544392ed0fc9920231700bb742e0e77000f) | route, admin menu, permission, status and locales | Contract/Localization / U,H | Intentionally skipped: no frontend entry point is allowed | guard covers route/menu/permission/locale |
| [f67d51f0](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/f67d51f0184d6d455448a46d3c87c9da58b2a2cc) | SIM picker and charged launch panel | Behavior/Presentation / H | Intentionally skipped: BSCHEKER launch/charge flow | guard; no launch UI |
| [413d5318](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/413d531870e6319f53b26680b3648c66639474b8) | job polling and probe/VLESS/scan results | Contract/Behavior / U,H | Intentionally skipped: requests and polling are forbidden | guard covers polling/client markers |
| [9d770e4f](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/9d770e4f8eb69169cd9d21da2ec679a62124b206) | target selection and probe/VLESS/scan tabs | Behavior / H | Intentionally skipped: feature-only screens | guard; no feature components |
| [3d583876](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/3d583876c623b5e8e6a98184a6e835d5ecd18d6d) | host-by-SIM summary and job history | Behavior / H | Intentionally skipped: feature history is excluded | guard; no history fixtures |
| [12531f90](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/12531f90580c68353e417d57a0de41ef89ff5b21) | node and user-subscription reachability badges | Behavior/Presentation / H | Intentionally skipped: no BSCHEKER surface on existing pages | guard; admin Remnawave/user smoke |
| [a9b6a0a3](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/a9b6a0a3fd4af0d8753e984036516785fa48dc19) | reachability small-text contrast and host wrapping | Accessibility/Presentation / H | Intentionally skipped: styling is feature-local | guard; shared contrast handled separately |
| [fc5090ac](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/fc5090acd6041d87261dfc7cae0cd57995f6aa26) | launch confirmation, shared feature components, mobile layout | Behavior/Accessibility / H | Intentionally skipped: charge-confirmation feature remains absent | guard; no launch or fixture content |
| [93fdfdad](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/93fdfdad50b7f143fe630d5ec7c288c9719cdac9) | rename reachability section to BSCHEKER | Localization/Presentation / H | Intentionally skipped: excluded product name | guard covers BSCHEK markers |
| [573601bb](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/573601bb79aa95ad492e245796031a7aa980fa1d) | BSCHEKER credits and reference ruble amounts | Contract/Behavior / U,H | Intentionally skipped: excluded paid service | guard; no pricing text/types |
| [1146559e](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/1146559e0cbacea8e63e7caba36bd90d3c5002c9) | operator icon bundle and renderers | Presentation / C,H | Intentionally skipped: assets exist only for BSCHEKER | guard covers `src/assets/operators/` |
| [9ffd8a62](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/9ffd8a62cff48cc4abe2209cc554e7f6ce8d9eb2) | additional `svyaz1` operator icon | Presentation / C | Intentionally skipped: feature-only asset | operator-assets guard |
| [77d92ca0](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/77d92ca025ac3e173a9ddb21b7760ad63da234f3) | rebuilt BSCHEKER launch flow and district operators | Behavior/Presentation / H | Intentionally skipped: whole frontend capability excluded | guard; no route/components |
| [1371afce](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/1371afce066d8bba83220c2bb070e6ea836d47ba) | manual BSCHEKER review fixes | Behavior/Presentation / H | Intentionally skipped: feature-local follow-up | guard |
| [08a8c6a7](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/08a8c6a7b60b37aab44477d757977816bc183c4b) | target tabs, probe help and Xray core labels | Behavior/Localization / H | Intentionally skipped: feature-only domain/UI | guard; no locale keys |
| [a1a2952d](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/a1a2952d778a4590de7d6a5e4fbead1b3d406cb4) | BSCHEKER settings card | Contract/Behavior / U,H | Intentionally skipped: settings are forbidden | guard covers setting markers |
| [69967674](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/699676747fc1c105eef887373185c344e3a8b59f) | SNI/config input, result table, history and matrix | Behavior / H | Intentionally skipped: feature forms/results excluded | guard |
| [141a4bfb](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/141a4bfb069bd3b554fd319c9249cccae4ec967d) | default SNI host and remembered input | Behavior/Storage / U,H | Intentionally skipped: no feature storage key | guard; no storage marker |
| [198ed32b](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/198ed32b0cb8b89520261b70360c00cd62bc4c19) | duplicate host/port labeling | Behavior / H | Intentionally skipped: feature-only server model | guard |
| [adf7ea6d](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/adf7ea6df601721b4a59d110319d9e7b7644b888) | mobile VLESS results and matrix | Behavior/Accessibility / H | Intentionally skipped: feature-only mobile UI | guard |
| [69a80a4e](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/69a80a4ee5f15159a8a220e6dab47a7ffb6187b4) | browser second-step launch confirmation | Behavior/Security / H | Intentionally skipped: launch and charge confirmation excluded | guard |
| [d7044185](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/d7044185c4bb0b4b104df17103cc72a5447cc919) | stalled probe diagnostics and matrix summary | Behavior / H | Intentionally skipped: feature results excluded | guard |
| [15d69690](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/15d6969079e10e29e4cc6051323359533f978279) | fleet probe duration guidance | Localization/Behavior / H | Intentionally skipped: feature guidance excluded | guard; no locale keys |
| [16a4e308](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/16a4e3088ed8a1de06bffd9c4499e2cded1f5c5c) | automatic history/progress refresh | Contract/Behavior / U,H | Intentionally skipped: polling is forbidden | guard |
| [a56bbcc3](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/a56bbcc30c14b942c69e64e776fc7876b77c7ccc) | human-readable history/results and mobile corners | Behavior/Accessibility / H | Intentionally skipped: feature-local rendering | guard |
| [81e793eb](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/81e793eb2f797103d19864b627310f340dda2db8) | simplified first response and automatic SIM choice | Behavior / H | Intentionally skipped: feature flow excluded | guard |
| [393c6a8f](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/393c6a8fd416f324bf973e15646b00b40efd093a) | subscription target labels and price warning | Behavior/Localization / H | Intentionally skipped: BSCHEKER subscription check excluded | guard |
| [8d8ec359](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/8d8ec359a777803e8645908be89997420d543aac) | batch/partial-result types and API client | Contract / U | Intentionally skipped: transport contract excluded | guard covers types/client |
| [e4f74a3e](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/e4f74a3e3670d1d294f0449b454a4e55cca52a95) | fleet-state locale keys | Localization / U | Intentionally skipped: dead feature translations forbidden | guard scans locales |
| [85bb407d](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/85bb407d216f0de7bd1cae3b787218f10afc03f6) | fleet-state pure functions | Behavior / U | Intentionally skipped: feature domain excluded | guard |
| [bd68ef0d](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/bd68ef0dfe4a38d16b413ee32b39d93e45b3af24) | batch target progress | Contract/Behavior / U,H | Intentionally skipped: partial-result flow excluded | guard |
| [13d4921f](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/13d4921f84fee8cb3f55b53283981a647605df48) | fleet state and batch polling hooks | Contract/Behavior / U | Intentionally skipped: feature hooks/polling forbidden | guard |
| [022f1681](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/022f1681c29be737ba30350ac03ea0af7277c52d) | fleet summary sentence | Behavior/Localization / H | Intentionally skipped: feature summary excluded | guard |
| [d13969a9](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/d13969a9a1491a56bc7c967eaa9dad0d7a71839e) | server filters and search | Behavior / H | Intentionally skipped: feature server list excluded | guard |
| [8b2fbeb4](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/8b2fbeb4c2b159bc1c3b2d354c15fd37918b32a4) | grouped server list and problem ordering | Behavior / H | Intentionally skipped: feature server cards excluded | guard |
| [ba8b1a22](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/ba8b1a22ebd772085e057661c9da56ffc1687343) | server card, operator results and single-server check | Behavior / H | Intentionally skipped: server card/launch flow excluded | guard |
| [c0562168](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/c056216842bd73b7ae9d45947103a79c99e8dfff) | batch scope, cost, duration and launch | Contract/Behavior / U,H | Intentionally skipped: paid launch flow excluded | guard |
| [2da479b5](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/2da479b51950317265b23475bfee8039e912e86c) | running batch, cancel and server progress | Contract/Behavior / U,H | Intentionally skipped: requests/polling excluded | guard |
| [8c121a85](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/8c121a850ff89ddffa7104c569a5d1b4af4a4a4f) | full fleet pages, cards, launch, history and single checks | Behavior/Presentation / H | Intentionally skipped: entire BSCHEKER frontend excluded | guard |
| [3fdf6b73](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/3fdf6b73809eff315a4e26d310e2bc94127e9fb2) | reachability page refactor | Behavior/Presentation / H | Intentionally skipped: feature-local replacement | guard |
| [e205dfa8](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/e205dfa8466e86d1e46c7d74bcddf78168e9af3e) | feature bars plus `main { contain: style }` in `globals.css` | Platform/Presentation / H,C | Adapted only the proven containing-block fix in Issue 02; every reachability file remains skipped | fixed-bar source regression; no-BSCHEKER guard |
| [bc0ab8b9](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/bc0ab8b9e61924b40fc6a8d980303bf0fc165a3b) | generic Sheet, Telegram header and bottom safe-area | Platform/Accessibility / C,H | Adapted in Issue 02 through the canonical Custom responsive Sheet and current Telegram hook | inset unit tests, rendered Sheet accessibility, viewport matrix |
| [cbb01710](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/cbb01710ca3f658846a6df7a17d7f27e6d17907a) | quick reachability check and SNI/operator controls | Behavior / H | Intentionally skipped: feature-only page content | guard |
| [149635dc](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/149635dcdb043cd92470ed1d7073c4c91a3c454b) | single-page BSCHEKER UI | Behavior/Presentation / H | Intentionally skipped: entire frontend capability excluded | guard |
| [a89d7608](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/a89d7608bf103fdb75055734f9a5acbb96532b8b) | expandable server row | Behavior/Accessibility / H | Intentionally skipped: feature server detail excluded | guard |
| [e7a344ac](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/e7a344ac9362aae8a30204e4adf5b454a2b5312d) | target bar and operator ordering/labels | Behavior/Localization / H | Intentionally skipped: feature-only behavior | guard |
| [e8ee7cf1](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/e8ee7cf126759d25f633307c86ddf56f38a0b938) | server table, card and history placement | Behavior/Presentation / H | Intentionally skipped: feature server/history UI excluded | guard |
| [0249ba18](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/0249ba1823e36d90036364b3fdf50bb2cffe4b9b) | operator reset and mobile subscription chip | Behavior/Responsive / H | Intentionally skipped: feature-local responsive fix | guard |
| [b4b66989](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/b4b66989e4e4dcff8a8c6f24b93ed672bf7f0ef4) | operator count/reset heading | Behavior/Responsive / H | Intentionally skipped: feature-local UI | guard |
| [cabfd845](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/cabfd8450d1b7b5573d4d6e25852c552a2464f05) | reachability history tab and server filter | Behavior/Navigation / H | Intentionally skipped: feature history/navigation excluded | guard |
| [870e5821](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/870e58218119eacf6c64af25c6ba7400b33b7292) | merge PR #583 | Metadata / U | Intentionally skipped as duplicate ancestry; constituent rows are authoritative | 80 unique commits/rows |
| [20122d95](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/20122d955cbdd8f9bacbed442d55a632355a7b92) | `CHANGELOG` and package version 1.70.0 | Dependency/Metadata / C | Intentionally skipped: Custom Cabinet owns release metadata | package/lock remain reproducible |
| [fff00650](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/fff00650ef974feae1a326052685651a8d713e3b) | merge release PR #584 | Metadata / U | Intentionally skipped as duplicate release ancestry | exact tag/SHA recorded |
| [7bcfd1a7](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/7bcfd1a7f465805ee46125bf1250b03a086e3b4e) | mobile nav routes, virtual keyboard, generic and reachability bars | Platform/Accessibility / C,H | Adapted AppShell route eligibility and one shared keyboard signal in Issue 02; reachability bars remain skipped | route/keyboard/fixed-bar tests and browser focus check; guard |
| [525a6f38](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/525a6f38c1a7a6b2d9b247cfa70609bb57c50aeb) | Done key through platform adapters and one-line inputs | Platform/Accessibility / U,H | Adapted in Issue 02 as touch-only document behavior with Web/Telegram platform capability | one-line, multiline, IME and dynamic-input tests; browser focus check |
| [a1058d73](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/a1058d73d612e531dc053ba36662fe9ae98912e6) | device reason codes and mobile subscription term | Contract/Localization / U,H | Adapted in Issue 06 through typed reason mapping and the current Dashboard subscription cards | reason mapping/fallback; 320/375 browser |
| [d6ec2468](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/d6ec24685d214159bdae165e5553ee80eb41f106) | env-locked partner/ticket settings and types | Contract/Behavior / U,H | Adapted in Issue 08 through typed `env_locked` sources, shared request filtering and backend-confirmed rereads | API/component mixed, success and error states; 320/375 browser |
| [881e557d](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/881e557d4a8165a6037af05d204780b7db2122e4) | shared daily-price calculation with promo discount | Financial/Behavior / U,H | Adapted with TDD in Issue 04 through the shared pricing utility; Bot group price remains authoritative and the active promo is applied once | financial unit tests and purchase browser |
| [15e02d4b](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/15e02d4b9a7204f18c7403490ec14b10ee2ba300) | email queue API, card, clear action and locales | Contract/Behavior / U,H | Adapted in Issue 07 with permission and confirmation gates | API/empty/error/confirm/browser tests |
| [2a95c06e](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/2a95c06e319a0653b4d0d97ffc7f4d179420182b) | queue card zero state | Behavior/Localization / H | Adapted in Issue 07 | empty queue stays visible |
| [0a8b63e0](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/0a8b63e09b38db64cabd4980fb041987aa0bc166) | honest queue counter labels | Localization/Behavior / H | Adapted in Issue 07 | ru/en/fa/zh key coverage |
| [93e71823](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/93e71823b141e2569d61645e5d5e3400a62c5f9e) | queue card mobile text wrapping | Accessibility/Presentation / H | Adapted in Issue 07 using existing layout tokens | 320/375 browser |
| [1a3c887d](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/1a3c887de35b9604f4cab3e8bd6ea26532dac044) | mobile queue metrics/actions layout | Accessibility/Presentation / H | Adapted in Issue 07 using current components | 320/375 actions and focus |
| [c507c244](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/c507c244a8a762195dc6e8840b809914ca9780b8) | secondary-text contrast across themes; one feature-local file | Accessibility/Presentation / C,H | Adapted non-reachability token usages in Issue 02; the feature-local file remains skipped | source scan, light/dark/operator contrast tests; guard |
| [fe778672](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/fe7786727b63838b31066d1a911d99e1b87d6096) | operator-palette contrast | Accessibility/Presentation / C,H | Adapted in Issue 02 through generated semantic token contrast floors without changing Custom accent ownership | extreme operator-palette unit matrix |
| [8d688b42](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/8d688b42bf0c9611a521b7c0a81fa8b26539b546) | admin Back returns to source route | Navigation/Accessibility / H | Adapted in Issue 02 with validated internal `backTo` state and native direct-entry fallback | direct, deep-link, history and invalid-state tests |
| [2f9a92b0](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/2f9a92b0fe39c534e95c32a08f0a5455d4b697d6) | hide disabled referral withdrawal | Behavior/Localization / H | Adapted in Issue 09 through the current mobile accordions; existing withdrawal history remains visible | feature-off/on unit, browser and locales |
| [5ce535ae](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/5ce535aead7d7aa295767eeef93a3d69d46fa72c) | Dashboard renew opens period choice | Behavior/Navigation / H | Adapted in Issue 04; ordinary expired subscriptions open their tariff periods, while daily tariffs retain the instant one-day path | renewal unit/browser flow |
| [b1d03ec6](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/b1d03ec60667709b4ffc92847f30369f30cdcbf1) | check-email resend states, countdown and auth API | Contract/Auth/Localization / U,H | Adapted in Issue 03 through the current auth flow and canonical Custom Card | resend wait/success/limit/error/browser |
| [bb239a42](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/bb239a42c85383099455b18ee8c40157d4722e7a) | best-value period contract and purchase/renewal UI | Contract/Behavior / U,H | Adapted in Issue 04 with typed API fields, operator control and the semantic urgent token | API fixtures, purchase and renewal |
| [81bb73dc](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/81bb73dc156006ee9abf95e5c8f3c8bdfff7bf69) | best-value tariff contract and grid | Contract/Behavior / U,H | Adapted in Issue 04 using current cards; the current-tariff state remains visually dominant | API fixtures and tariff grid browser |
| [3a127af8](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/3a127af8c9b4bf5bf698cf8404d08f449fa0adf9) | merge PR #586 | Metadata / U | Intentionally skipped as duplicate ancestry | constituent rows covered |
| [0e6f85b4](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/0e6f85b444073c077571a245011ec542bb2147df) | `CHANGELOG` and package version 1.71.0 | Dependency/Metadata / C | Intentionally skipped: Custom Cabinet owns release metadata | package/lock gate later |
| [48714ff4](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/48714ff469d75b1e9a4d1867957d27df188a0a16) | merge release PR #587 | Metadata / U | Intentionally skipped as duplicate release ancestry | exact tag/SHA recorded |
| [fee203bc](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/fee203bcfef79897745b3c4ee7472763f57f6233) | mobile bottom nav remains on subscription card context | Navigation/Responsive / C,H | Adapted in Issue 02 through the existing Custom four-item nav contract and Dashboard subscription-card routes | route matrix and 320/375/768/1024/1280+ browser widths |
| [e12b3f52](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/e12b3f5286b642c13512668b550bb74e859b8c6f) | merge PR #588 | Metadata / U | Intentionally skipped as duplicate ancestry | constituent row covered |
| [e8a6b8cb](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/e8a6b8cb137d125adfee9161bc528fa7cb9c9523) | `CHANGELOG` and package version 1.71.1 | Dependency/Metadata / C | Intentionally skipped now; final version changes only with verified Custom release | release gate later |
| [5ade78f5](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/5ade78f506fd0e102d70e2d59af4aa97ef9c164b) | merge release PR #589 and target tag | Metadata / U | Intentionally skipped as duplicate ancestry; retained as exact target identity | tag resolves to exact SHA |

## Separation of Shared UI Fixes

| Commit | Allowed seam | Explicitly excluded seam | Verification reference |
| --- | --- | --- | --- |
| `e205dfa8` | `main { contain: style }` only if existing fixed overlays reproduce the containing-block problem | every `admin/reachability` page/component | existing overlays and fixed action bars; guard |
| `bc0ab8b9` | generic Sheet header/top/bottom safe-area behavior | no reachability component or copy | web/Telegram Sheet tests |
| `7bcfd1a7` | AppShell route eligibility, virtual-keyboard signal and generic fixed-bar hiding | reachability launch/fleet bars | current nav, admin bulk bar and keyboard tests |
| `525a6f38` | platform-level Done key for ordinary one-line inputs | no feature-specific input or route | web/Telegram adapter tests |
| `c507c244`, `fe778672` | semantic secondary-text contrast | reachability `ProbesRow` and feature styles | theme and operator-palette tests |
| `8d688b42` | source-aware admin Back behavior | no BSCHEKER route target | admin navigation tests |
| `fee203bc` | subscription-card ownership of the existing bottom navigation | no feature route or menu | mobile subscription navigation tests |

## Frontend Exclusion Contract

Custom Cabinet must contain none of the following BSCHEKER surfaces:

- routes, menu items, deep links or permissions;
- settings or `BSCHEK_*` configuration;
- transport types, API clients, `/cabinet/admin/reachability` requests or
  polling/query keys;
- pages, hooks, history, server cards, launch and charge-confirmation flows;
- locale keys, fixtures or `src/assets/operators/` feature assets.

`src/noBscheker.guard.test.ts` tests each textual surface, the operator asset
path and the actual frontend tree. It runs as part of `npm test`. The guard
intentionally scans `src/`, `tests/`, `public/` and public root build/config
files, while excluding only its own policy implementation and policy test.

This frontend rule does not remove or disable the official Upstream Bot
`v4.7.1` backend. Bot migrations and backend source remain upstream-owned and
unchanged. Creating a backend fork is a separate owner-approved architecture
and Release decision.

## Provenance and Compatibility State

- `LICENSE`, copyright and the exact upstream repository URL are unchanged.
- `UPSTREAM.md` deliberately remains at the last integrated `v1.69.1` identity.
- `COMPATIBILITY.md` records this exact pending contract without claiming that
  `v1.71.1` or Bot `v4.7.1` is already verified.
- The combined source candidate has passed the available Issue 11 gates, but it
  is not an immutable Custom Cabinet commit. Promoting the canonical baseline,
  package/changelog or compatibility record before that commit exists would
  create false provenance.
- No Release Bundle, tag, publication or production operation is part of this
  integration worktree.

## Issue 01 Verification

| Gate | Expected result |
| --- | --- |
| Impact matrix count | 80 unique incoming commits, one row each |
| Upstream range | 80 commits and 264 changed paths |
| Exact tag resolution | `v1.69.1` and `v1.71.1` resolve to recorded SHAs |
| Negative frontend guard | detects route, menu, permission, setting, API, polling, locale, fixture and operator assets |
| Current frontend tree | no guard violations |
| Repository gates | `npm test`, `npm run type-check`, `npm run build`, and formatting for changed source |

### Actual results on Node 24.19.0

| Gate | Result | Evidence or limitation |
| --- | --- | --- |
| Guard TDD | Pass | RED for missing implementation, RED for operator assets, then 3/3 policy tests pass |
| Matrix identity | Pass | 80 commit URLs; sorted SHA set exactly equals `git rev-list v1.69.1..v1.71.1` |
| Standard `npm test` | Pass | 81/81 files and 641/641 tests pass with the repository's normal worker configuration |
| Diagnostic `npm test -- --maxWorkers=1` | Fail | 80/81 files and 638/641 tests pass; three pre-existing `loadingStates` cases exceed the fixed 5-second timeout when imports are serialized |
| `npm test -- --maxWorkers=1 --testTimeout=15000` | Pass | 81/81 files and 641/641 tests pass; override changes only the diagnostic runner timeout |
| `npm run type-check` | Pass | both TypeScript projects pass |
| `npm run build` | Pass | type-check plus Vite production build; 2,898 modules transformed |
| `npm run check` | Pass | 674 files, zero errors; 40 warnings and 5 info diagnostics in existing inline-compatible `index.html` |
| Dependency install | Pass with environment note | `npm ci` from the unchanged lockfile; 0 vulnerabilities; active verification runtime corrected from unsupported Node 24.11.1 to required Node 24.19.0 |

The required standard unit command passes. The two one-worker diagnostics show
that the unchanged `loadingStates` coverage is sensitive to its fixed
five-second timeout when dynamic imports are serialized; Issue 01 does not
modify or waive that existing suite.

## Issue 02 Verification

Issue 02 adapts only shared platform behavior. Custom Cabinet retains its
four-item navigation, responsive overlay primitives, theme ownership and
branding; no excluded frontend feature surface was imported.

| Gate | Result | Evidence or limitation |
| --- | --- | --- |
| TDD platform seams | Pass | RED then GREEN coverage for nav routes, keyboard state, Done key, safe-area geometry, source-aware Back, contrast and fixed-panel containment |
| Native Back | Pass | history depth, trusted source state, direct Cabinet paths, parent fallback and invalid external state are covered by unit/component tests |
| Mobile nav ownership | Pass | Dashboard, tariff, support, profile and subscription-card routes are eligible; renewal, balance and admin action routes are excluded |
| Keyboard and Done key | Pass | one-line dynamic input receives `enterkeyhint=done`, Enter blurs and restores the panel; multiline input retains focus and a newline |
| Telegram/safe-area geometry | Pass | iOS, Android and non-fullscreen SDK insets plus full-height Sheet geometry are covered; browser matrix has no horizontal overflow |
| Contrast | Pass | affected alpha-text usages are removed; dark, light and extreme operator-defined palettes meet the tested secondary-text floors |
| Accessibility and reduced motion | Pass | Sheet close has an accessible name and close behavior; browser computed animation/transition duration is `1e-05s` under reduced motion |
| Playwright CLI browser matrix | Pass | authenticated Custom Cabinet at requested widths 320, 375, 768, 1024 and 1280; four accessible nav links on Dashboard and no panel on `/balance` |
| Negative frontend guard | Pass | full test run keeps the executable Issue 01 exclusion contract green after every Issue 02 source change |
| Standard `npm test` | Pass | 90/90 files and 679/679 tests on Node 24.19.0 |
| `npm run type-check` | Pass | both TypeScript projects pass |
| `npm run build` | Pass | type-check plus Vite production build; 2,904 modules transformed |
| `npm run check` | Pass | 689 files, zero errors; 40 warnings and 5 info diagnostics remain in unchanged inline-compatible `index.html` |

The browser harness used local API responses and an unavailable WebSocket, so
the observed console retries were limited to that deliberately absent test
socket. No backend, disposable server, production environment or external
service was contacted.

## Issue 03 Verification

Issue 03 adapts the guest email-registration flow against the exact Upstream
Bot `v4.7.1` contract. The frontend classifies server responses but does not
copy registration thresholds, disposable-domain data or email delivery rules.

| Gate | Result | Evidence or limitation |
| --- | --- | --- |
| TDD auth seams | Pass | RED then GREEN coverage for the public resend endpoint, deadline countdown, pending/success/cooldown/rate-limit/error states and safe error classification |
| Upstream Bot contract | Pass | exact tag `cd903b7c…`: disabled email is `403` with `email_auth_disabled`; disposable rejection is `400`; hourly/daily throttles are `429` with server `Retry-After` |
| Safe registration errors | Pass | disabled, disposable, hourly, daily, generic rate limit, existing account, unverified login, invalid credentials and unknown failures map to localized states without raw backend details |
| Email-auth operator gate | Pass | ordinary email UI renders only after public branding answers `enabled=true`; a clean browser session with `enabled=false` contains no email entry point and has zero console errors |
| Localization and RTL | Pass | all Issue 03 keys exist in ru/en/fa/zh with matching placeholders; shared hint uses logical `text-start` alignment under RTL |
| Playwright CLI guest flow | Pass | local registration → check-email → initial cooldown → successful resend → new cooldown → `429` → safe generic error → edit-email with preserved fields → return to login |
| Web/Telegram ownership | Pass | the shared `CheckEmailCard` has no platform branch and uses the existing Platform-backed Custom Card in both hosts |
| Negative frontend guard | Pass | full test run keeps the executable Issue 01 BSCHEKER exclusion contract green |
| Standard `npm test` | Pass | 93/93 files and 709/709 tests on Node 24.19.0 |
| `npm run type-check` | Pass | both TypeScript projects pass |
| `npm run build` | Pass | type-check plus Vite production build; 2,907 modules transformed |
| `npm run check` | Pass | 695 files, zero errors; 40 warnings and 5 info diagnostics remain in unchanged inline-compatible `index.html` |

The browser harness intercepted only local `/api/cabinet/**` requests. It did
not contact Upstream Bot, a disposable test server, production, private env or
any external service. Generated Playwright artifacts and the local Vite server
were removed/stopped after verification.

## Issue 04 Verification

Issue 04 adapts tariff pricing and renewal behavior against the exact Upstream
Bot `v4.7.1` contract. The frontend never calculates a remaining subscription
term or switch charge: it displays `remaining_days` and
`upgrade_cost_kopeks` from the Bot preview response.

| Gate | Result | Evidence or limitation |
| --- | --- | --- |
| Financial TDD | Pass | RED then GREEN coverage for the shared daily quote, group discount, one active promo application, combined discount and monthly-period helper |
| Daily quote ownership | Pass | tariff card, activation form and switch preview consume one shared quote; the server-provided group price is not recomputed |
| Best-value contract | Pass | typed admin, purchase and renewal fields plus API fixtures cover `is_highlighted` and `highlight_period_days` |
| Best-value presentation | Pass | recommended tariff and period use one semantic urgent-token badge and border; selected/current states remain visually dominant |
| Renewal behavior | Pass | ordinary expired subscriptions open `/subscriptions/:id/renew` even with zero balance; daily subscriptions retain the one-day instant action |
| Last-day switch | Pass | compatibility fixture with `remaining_days: 1` and `upgrade_cost_kopeks: 1200` renders the non-zero `12 ₽` Bot quote without a local formula |
| Localization | Pass | customer and operator labels exist in ru/en/fa/zh; the complete locale parity suite passes |
| Playwright CLI | Pass | 6/6 local-fixture scenarios on mobile 320 and desktop 1280; dark/light purchase rendering, renewal and switch preview pass; no purchase, renewal or switch mutation was sent |
| Standard `npm test` | Pass | 97/97 files and 724/724 tests on Node 24.19.0 |
| `npm run type-check` | Pass | both TypeScript projects pass |
| `npm run build` | Pass | type-check plus Vite production build; 2,908 modules transformed |
| `npm run check` | Pass | 701 files, zero errors; 40 warnings and 5 info diagnostics remain in unchanged inline-compatible `index.html` |
| `git diff --check` | Pass | no whitespace errors in the combined Issues 01-04 worktree diff |

The configured Playwright Chromium download was unavailable because the CDN
timed out. Browser verification used the installed system Chrome through a
temporary local config; that config was removed after the run. All Cabinet API
traffic was fulfilled by the local browser harness, and no real payment,
Upstream Bot, production or private environment was contacted.

## Issue 05 Verification

Issue 05 keeps the exact Upstream Bot `v4.7.1` quick-top-up fix and closes the
equivalent web feedback gap in Custom Cabinet. The existing synchronous
submission lock and safe `openPaymentUrl` transition remain authoritative; the
pending action now keeps visible text and an accessible name, and an unknown
provider failure uses a dedicated localized message.

| Gate | Result | Evidence or limitation |
| --- | --- | --- |
| Upstream Bot identity | Pass | exact commit `7448af74…` answers the Telegram callback before the provider call and is an ancestor of the pinned `v4.7.1` SHA `cd903b7c…` |
| TDD payment seam | Pass | RED exposed the nameless pending button; 2/2 component tests then cover immediate pending, one request, error recovery and the unchanged safe success transition |
| Repeat protection | Pass | a synchronous ref lock rejects a second click/Enter before another mutation can start; the deferred component and browser requests both remain at one call |
| Pending accessibility | Pass | the disabled action visibly reads the localized `common.processing` value, exposes `aria-busy=true`, and hides the decorative spinner from assistive technology |
| Error recovery | Pass | ru/en/fa/zh provide a clear `balance.errors.paymentFailed` fallback; after a rejected request the action becomes enabled and keyboard-focusable again |
| Playwright browser flow | Pass | 2/2 local-fixture scenarios on mobile 320 and desktop 1280 cover pending, repeat Enter, localized failure, focus recovery and a safe retry |
| Payment isolation | Pass | the browser harness returned a fake payment URL but never opened it; no real provider, Upstream Bot, production or private environment was contacted |
| Standard `npm test` | Pass | 98/98 files and 726/726 tests on Node 24.19.0 |
| `npm run type-check` | Pass | both TypeScript projects pass |
| `npm run build` | Pass | type-check plus Vite production build; 2,908 modules transformed |
| `npm run check` | Pass | 703 files, zero errors; 40 warnings and 5 info diagnostics remain in unchanged inline-compatible `index.html` |
| `git diff --check` | Pass | no whitespace errors in the combined Issues 01-05 worktree diff |

One diagnostic run started `npm test` concurrently with the production build
and hit three unrelated fixed five-second test timeouts. The required isolated
standard command was repeated unchanged and passed all 726 tests; no timeout
was raised or waived for the recorded gate. The system-Chrome configuration
used for the browser run was temporary and was removed afterwards.

## Issue 06 Verification

Issue 06 adapts the Upstream Cabinet device-reason contract through the current
Custom Cabinet API and subscription sheets. It deliberately uses a stricter
fallback than upstream: an unknown code or legacy raw `reason` is never shown
to the user and resolves to a safe localized message. The active Dashboard
card already kept its term on a separate mobile line; the limited and expired
cards now follow the same readable layout without changing desktop behavior.

| Gate | Result | Evidence or limitation |
| --- | --- | --- |
| TDD reason mapping | Pass | three focused tests cover every known code, numeric interpolation and the safe unknown/legacy fallback |
| API contract | Pass | price and reduction clients preserve `reason_code` and keep the existing endpoints and parameters |
| Localization | Pass | ru/en provide the required user messages; fa/zh retain the repository's complete locale-key contract |
| Sheet behavior | Pass | top-up and reduction sheets translate stable reason codes and never expose a raw server reason |
| Mobile subscription layout | Pass | 8/8 local-fixture checks at 320 and 375 cover active, limited and expired cards, readable term placement, visible actions and no horizontal overflow |
| External isolation | Pass | browser fixtures contacted no real provider, Upstream Bot, backend, production or private environment |
| Standard `npm test` | Pass | 100/100 files and 730/730 tests on Node 24.19.0 |
| `npm run type-check` | Pass | both TypeScript projects pass |
| `npm run build` | Pass | type-check plus Vite production build; 2,909 modules transformed |
| `npm run check` | Pass | 707 files, zero errors; 40 warnings and 5 info diagnostics remain in unchanged inline-compatible `index.html` |
| `git diff --check` | Pass | no whitespace errors in the combined Issues 01-06 worktree diff |

## Issue 07 Verification

Issue 07 ports the Upstream Cabinet email retry-queue card onto the existing
email-template administration page. The counters describe only the retry
queue, the empty state remains visible, and raw provider errors are never
rendered. Read and clear operations follow the Upstream Bot `v4.7.1`
`email_templates:read` and `email_templates:edit` permission contract.

| Gate | Result | Evidence or limitation |
| --- | --- | --- |
| Upstream contract | Pass | GET and DELETE use `/cabinet/admin/email-queue`; DELETE preserves the Bot-owned `pending_only` flag and displays the returned `removed` count |
| Permission boundary | Pass | the route and card require `email_templates:read`; clear actions additionally require `email_templates:edit` |
| TDD API/component coverage | Pass | 1 API contract test and 9 card tests cover hidden/read-only access, empty/populated/unavailable states, confirmation, cancellation, repeat blocking, success refresh and failure recovery |
| Honest and safe presentation | Pass | pending/sent/dead values are labeled as retry-queue outcomes; SMTP state is explicit; raw `last_error` provider detail is not rendered |
| Localization | Pass | complete ru/en/fa/zh queue copy and placeholders pass the locale-parity suite |
| Playwright browser flow | Pass | 10/10 local-fixture scenarios at 320 and 375 cover permission denial, empty/populated states, one confirmed clear request, refreshed success, failure recovery and no horizontal overflow |
| External isolation | Pass | browser routes fulfilled every queue request locally; no real deletion, Upstream Bot, backend, production or private environment was contacted |
| Standard `npm test` | Pass | 102/102 files and 740/740 tests on Node 24.19.0 |
| `npm run type-check` | Pass | both TypeScript projects pass |
| `npm run build` | Pass | type-check plus Vite production build; 2,911 modules transformed |
| `npm run check` | Pass | 712 files, zero errors; 40 warnings and 5 info diagnostics remain in unchanged inline-compatible `index.html` |
| `git diff --check` | Pass | no whitespace errors in the combined Issues 01-07 worktree diff |

The system-Chrome configuration used for the browser run was temporary and was
removed afterwards. The rollback reference remains the receiving commit; this
worktree contains no production queue mutation or Release operation.

## Issue 08 Verification

Issue 08 adapts the env-owned settings contract from Upstream Cabinet commit
`d6ec24685d214159bdae165e5553ee80eb41f106` against the exact Upstream Bot
`v4.7.1` SHA `cd903b7cfd3bac6e08e571904662c88e8c151d1d`. Partner and ticket responses
carry a typed `env_locked` field list. Locked controls expose the existing
localized `.env` marker and cannot be edited; DB-backed controls remain
editable. A successful PATCH is not treated as confirmed until a following GET
returns the effective backend state.

| Gate | Result | Evidence or limitation |
| --- | --- | --- |
| Upstream contract | Pass | exact Bot tag exposes `env_locked` on partner and ticket settings responses; only the four ticket SLA keys participate in this ownership boundary |
| Typed source boundary | Pass | partner and ticket API types restrict `env_locked` to their update keys; the shared filter accepts only typed keys |
| Mixed forms | Pass | env-owned controls are disabled and marked `Задано в .env`; DB-backed controls in the same partner and ticket forms remain editable |
| Request boundary | Pass | component and browser assertions prove locked keys are absent from PATCH payloads for both forms |
| Confirmed reread | Pass | both mutations PATCH, then GET, cache only the reread response and preserve existing post-save navigation |
| Failure truth | Pass | PATCH errors leave the source-confirmed cache intact, keep the form open and show the localized generic error without raw backend detail |
| API/component TDD coverage | Pass | 2 API contract tests and 6 component tests cover mixed, success and error states for partner and ticket settings |
| Playwright browser flow | Pass | 8/8 local-fixture scenarios at 320 and 375 cover mixed ownership, filtered PATCH, confirmed reread, reopen state, errors and no horizontal overflow |
| External isolation | Pass | browser routes fulfilled every settings request locally; no real Upstream Bot, backend, `.env`, production or private material was contacted or changed |
| Standard `npm test` | Pass | 104/104 files and 748/748 tests on Node 24.19.0 |
| `npm run type-check` | Pass | both TypeScript projects pass |
| `npm run build` | Pass | type-check plus Vite production build; 2,913 modules transformed |
| `npm run check` | Pass | 717 files, zero errors; 40 warnings and 5 infos remain in the pre-existing `index.html` compatibility scripts |
| `git diff --check` | Pass | no whitespace errors in the combined Issues 01-08 worktree diff |

The system-Chrome configuration used for the Issue 08 browser run was temporary
and was removed afterwards. The rollback reference remains the receiving
commit; this worktree contains no `.env`, Release Bundle or production change.

## Issue 09 Verification

Issue 09 adapts the disabled-withdrawal behavior from Upstream Cabinet commit
[`2f9a92b0`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/2f9a92b0fe39c534e95c32a08f0a5455d4b697d6)
and pins the later runtime evidence contract to the exact Upstream Bot `v4.7.1`
SHA `cd903b7cfd3bac6e08e571904662c88e8c151d1d`. The fixture is intentionally
test-only: it prevents mocked frontend evidence from being reported as an
executed Bot or Remnawave operation. Issue 10 separately executes the same
ownership rules in the exact-Bot runtime and remains the authoritative backend
evidence.

| Gate | Result | Evidence or limitation |
| --- | --- | --- |
| Withdrawal TDD | Pass | RED exposed the disabled service reason, empty withdrawal section and stale partner action; 5/5 component tests now cover disabled, enabled, prior-history and partner states |
| Disabled presentation | Pass | the withdrawal accordion, zero-value balance card, request action and approved-partner link disappear only after the backend explicitly returns `is_withdrawal_enabled=false`; prior requests remain visible |
| Honest partner copy | Pass | ru/en/fa/zh use a no-withdrawal description when the backend has disabled withdrawal; the enabled description remains unchanged |
| Notification contract | Pass | the exact Bot contract keeps `referral_registered` with only `referral_name`, while `referral_bonus` carries `formatted_reward` and reward-specific values; the two events cannot collapse into a `+0` money notice |
| Reward contract fixtures | Pass | test-only create/update observations require the granted local subscription id to match the reread subscription and its `remnawave_id` to equal the id actually returned by the compatible panel path |
| Remnawave failure truth | Pass | the failure fixture preserves the Bot-owned rule that committed days survive a panel outage, while rejecting any frontend state that claims panel success and leaving linkage unconfirmed |
| Playwright browser flow | Pass | 4/4 local-fixture scenarios at 320 and 375 cover disabled and enabled withdrawal, honest partner copy, no service-detail leak and no horizontal overflow |
| Financial isolation | Pass | the browser test opens the enabled accordion but sends no withdrawal POST; no real reward, withdrawal, Upstream Bot, Remnawave, production or private environment was contacted |
| Standard `npm test` | Pass | 106/106 files and 757/757 tests on Node 24.19.0 |
| `npm run type-check` | Pass | both TypeScript projects pass |
| `npm run build` | Pass | type-check plus Vite production build; 2,913 modules transformed |
| `npm run check` | Pass | 721 files, zero errors; 40 warnings and 5 infos remain in the pre-existing `index.html` compatibility scripts |
| `git diff --check` | Pass | no whitespace errors in the combined Issues 01-09 worktree diff |

The system-Chrome configuration used for the Issue 09 browser run was temporary
and was removed afterwards. The rollback reference remains the receiving
commit; this worktree contains no Release Bundle or production change.

## Issue 10 Verification

Issue 10 verifies Custom Cabinet against an unmodified clone of the official
Upstream Bot repository at tag `v4.7.1` and exact SHA
`cd903b7cfd3bac6e08e571904662c88e8c151d1d`. The isolated Windows runtime uses
Python 3.13.14 and dependencies installed from the Bot's unchanged `uv.lock`
with `uv sync --frozen --all-groups`. `tzdata` is present only in the generated
test virtual environment because native Windows has no system IANA timezone
database; neither source repository was changed.

| Gate | Result | Evidence or limitation |
| --- | --- | --- |
| Exact source identity | Pass | origin is `https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot.git`; exact tag and HEAD are `v4.7.1` / `cd903b7cfd3bac6e08e571904662c88e8c151d1d`; Bot status and diff are clean |
| Cabinet-to-Bot route seam | Pass | OpenAPI generated from the exact Bot exposes 505 paths; 34 required methods across 28 auth, tariff/purchase/renewal, device, profile, support, queue, settings and referral paths match the current Custom Cabinet clients |
| Focused exact-Bot contract suite | Pass | 212/212 tests cover email auth/session/resend/disable/rate/disposable rules, tariff and no-provider purchase behavior, renewal, device reason contracts, support, email queue, env-owned settings, referral notifications/rewards, sync, trial reset and panel expiry |
| Referral and Remnawave identity | Pass | 96/96 focused data tests prove reward create-versus-update selection, the granted subscription target, returned panel identity persistence, `disable` trial-reset behavior, grace reconciliation and non-rewritten expired dates |
| Full exact-Bot suite | Pass with platform limitation | 6,339 passed and 46 skipped; the only 8 failures are upstream repository-policy tests that compare Windows backslash paths with hard-coded POSIX paths, plus one generated structure-document order check whose order differs on Windows |
| Browser compatibility smoke | Pass | 93 executed scenarios passed and 18 were intentionally filtered by the five-project viewport matrix; auth, tariff/renewal, payment isolation, devices, support, queue, env-locked settings and referral withdrawal were exercised through local API fixtures in system Chrome |
| BSCHEKER network exclusion | Pass | every selected authenticated browser flow rejects unexpected `/api/cabinet/**` traffic; none requested `/cabinet/admin/reachability` or another excluded frontend endpoint, and the executable full-tree guard remains green in the 757-test Custom Cabinet suite |
| External isolation | Pass | no real payment, production email queue, production Remnawave, production credentials, private env or production endpoint was used; panel/provider behavior was replaced by isolated fakes owned by the exact upstream tests |

`BLOCKED`: a completely green full upstream suite cannot be demonstrated in
native Windows without modifying the official Bot tests or running their
repository-policy checks on a POSIX filesystem. The eight failures are limited
to path separators and platform-dependent file ordering; none executes a Bot
business rule or a Custom Cabinet API contract. The exact Bot clone was not
forked or patched. The later Installer lifecycle gate supplies the Linux
runtime proof without weakening this pin.

`SKIPPED BY DESIGN`: real payment submission, production queue mutation,
production Remnawave access and production credentials. Docker Desktop's engine
was unavailable, so the disposable proof used the exact Bot's in-process HTTP,
SQLite and service test harnesses instead of a containerized live stack.

## Issue 11 Verification

Issue 11 closes every source, browser and release-delta gate that can be tied
to the current working-tree candidate. The receiving base remains
`e0b623e1cbe83b1697c24325ccb98c27ba6cdd46`; no commit, tag, push, Release
Bundle or production operation was performed.

| Gate | Result | Evidence or limitation |
| --- | --- | --- |
| Range and decision inventory | Pass | `v1.69.1..v1.71.1` resolves to 80 commits and 264 changed paths; the matrix contains exactly 80 unique SHAs with zero missing or extra rows |
| Final Custom Cabinet source gate | Pass on candidate | Node 24.19.0: 106/106 test files and 757/757 unit/component/API/contract tests pass; the normal suite includes the executable no-BSCHEKER guard |
| Type and production build | Pass on candidate | both TypeScript projects pass; Vite builds 2,913 modules |
| Biome and whitespace | Pass on candidate | 721 files checked with zero errors; 40 warnings and 5 infos remain only in the pre-existing inline-compatible `index.html`; `git diff --check` passes |
| Full local browser matrix | Pass on candidate | system Chrome: 464 passed and 24 intentionally skipped by project filters across 320, 375, 768, 1024 and 1280 widths; all browser API traffic used local fixtures |
| Theme, locale and accessibility coverage | Pass on candidate | the full matrix exercises dark/light and operator accent colors, Russian/English, RTL containment, keyboard/focus and accessible names; reduced-motion GeoCheck coverage passes |
| Mobile navigation regression | Pass | the first diagnostic matrix exposed one real Dashboard overlap and stale pre-Issue-02 expectations on action/admin routes; the content clearance was restored, tests now assert the approved route boundary and safe-area visibility, and the unchanged full matrix rerun has zero failures |
| BSCHEKER exclusion | Pass | the normal source guard passes and local browser harnesses reject unexpected Cabinet requests; no route, menu, permission, setting, API, locale, fixture or operator asset entered the frontend |
| Release-delta hygiene | Pass on candidate | 123 changed or untracked source/documentation files; zero private paths, `.env` files, accidental build/Playwright output, license files or high-confidence secret shapes. BSCHEKER/reachability text occurs only in the sync report, exclusion ADR, guard implementation/test and the pending contract/context records |
| Canonical provenance promotion | **BLOCKED** | the candidate is deliberately uncommitted, so no exact Custom Cabinet commit exists to record. `UPSTREAM.md`, the verified `COMPATIBILITY.md` baseline and release changelog/version remain unchanged until an authorized commit is created and the relevant gates are tied to that SHA |
| Live/manual integrations | **BLOCKED** | physical Telegram Android/iOS, physical screen readers, authenticated staging, live payment/email/Remnawave operations and production remain unverified; the exact Bot full-suite native-Windows limitation is recorded under Issue 10 |

The initial full browser diagnostic returned 442 passed, 24 configured skips
and 22 failures. Isolated reproduction reduced the deterministic set to the
Dashboard clearance plus four route-expectation failures; unrelated Connection
and Support failures passed unchanged. After the scoped layout/test correction,
all five deterministic reproductions passed and the complete 488-case matrix
reran as 464 passed plus the same 24 configured skips. No failing assertion was
waived or converted to a configured skip.

## Residual Risks and Next Boundary

The matrix now contains a final decision and evidence for every incoming
commit. Issues 01-11 prove the integration boundary, all selected Custom
Cabinet feature ports, the exact Upstream Bot API seam, isolated backend rules
and the complete local source/browser candidate. The remaining provenance step
requires an owner-authorized Custom Cabinet commit; after the gates are tied to
that immutable SHA, `UPSTREAM.md`, the verified compatibility baseline and
release-owned version/changelog can be promoted without ambiguity.

Rollback reference remains the unmodified receiving commit
`e0b623e1cbe83b1697c24325ccb98c27ba6cdd46`; no Release or production rollback
claim is created by this analysis branch.
