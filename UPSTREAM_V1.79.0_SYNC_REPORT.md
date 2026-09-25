# Upstream v1.79.0 Synchronization Report

Status: `source-gated`<br>
Date: `2026-09-24`<br>
Owner: `Codex implementation agent`

This report starts the source-only adaptation of Upstream Cabinet `v1.79.0`.
It does not declare a Custom Cabinet release, a compatible Release Bundle or a
production deployment. Do not mark it completed until the selected source range
is integrated, verified and recorded in `UPSTREAM.md` and `COMPATIBILITY.md`.

## Source Identity

| Item | Exact value |
| --- | --- |
| Supplied release | <https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/releases/tag/v1.79.0> |
| Upstream Cabinet repository | <https://github.com/BEDOLAGA-DEV/bedolaga-cabinet.git> |
| Previous Upstream Cabinet | `v1.74.0` / `57810c7da24b5c142371ed83a6ad5e43a591d454` |
| Target Upstream Cabinet | `v1.79.0` / `821c7b71823573a756de00418acb25118ede1c9c` |
| Receiving Custom Cabinet commit | `80caeac6b756f208543a6c3f891877a4547c7d73` |
| Integration branch | `sync/upstream-v1.79.0` |
| Intended Upstream Bot | `v4.15.0` / `877690a7039d1326b2c00eda3e297879b80c0678` |
| Target schema | Alembic `0127`, upgraded in exact Upstream Bot source from `0119` through `0120`-`0127` |
| Intended Release Bundle | Not scheduled; publication and production require separate owner authorization |
| Architecture decision | [`ADR 0002`](docs/adr/0002-adapt-upstream-cabinet-v1.79-bot-v4.15.md) |
| Implementation PRD | [`UPSTREAM_V1.79.0_ADAPTATION_PRD.md`](UPSTREAM_V1.79.0_ADAPTATION_PRD.md) |

The receiving commit is the committed `HEAD` that was checked before the
integration branch was created. Uncommitted owner files present in the worktree
are not part of that identity and must be preserved separately.

## Range Summary

| Metric | Verified value |
| --- | ---: |
| Unique commits | 78 |
| Changed paths | 340 |
| Insertions | 22,886 |
| Deletions | 8,576 |

The frontend dependency set does not change. Upstream changes only the package
version from `1.74.0` to `1.79.0` in `package.json` and the root entries of
`package-lock.json`. Custom Cabinet keeps its existing dependency decisions;
package metadata is updated only after the source gate, not by importing an
upstream release commit.

## Ownership and Adaptation Seams

- `src/api/`, `src/types/`, functional utilities, permissions, platform
  adapters and locale contracts stay close to upstream unless excluded below.
- `src/pages/`, Dashboard, subscription, admin-user, grace, reminder, broadcast
  and wheel components are hybrid. Their behavior is ported concern-by-concern
  into the existing Custom Cabinet presentation.
- `index.html`, runtime branding, AppShell, mobile navigation, primitives,
  design tokens and browser acceptance tests retain Custom Cabinet ownership.
- Upstream Simple/Lite Mode is intentionally excluded by ADR 0002. Its five
  feature/refactor commits remain in the ledger so future syncs do not mistake
  the absence for an omission.
- BSCHEKER/reachability remains excluded by ADR 0001. Mixed responsive or
  admin-user commits are adapted only after the reachability paths and
  dependencies are removed.

## Upstream Cabinet Commit Ledger

Every exact commit in `v1.74.0..v1.79.0` appears once. Decisions describe the
planned source action; a row is not evidence that its behavior has already
passed the gate.

| Commit | Subject / scope | Class | Ownership | Decision | Reason and required verification |
| --- | --- | --- | --- | --- | --- |
| [06c98028](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/06c9802829c0fdc58556408843e9f87fd60c40a1) | Calendar days in revenue chart | Behavior, localization | Hybrid | adapted port | Reuse the calendar-date helper, but wire it into the current Admin Dashboard and verify operator timezone boundaries. |
| [603fdd09](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/603fdd098af197b8392ee7b8eca57e35b7356046) | Preserve an unrecognized expiry value instead of `Invalid Date` | Reliability, behavior | Hybrid | adapted port | Port the safe formatter and keep the current success-modal presentation; test valid and invalid dates. |
| [974c7c82](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/974c7c829d70616b4b96dd921fc8fb0bf07e7ad4) | Grace section wording and layout | Presentation, accessibility | Hybrid | adapted port | Keep Custom primitives and existing form behavior; adapt useful labels and states across all locales. |
| [09f44858](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/09f44858ed76a77572c53cbd7596acac7eb8e71c) | Grace mode and squad state | Contract, behavior | Hybrid | adapted port | Extend the existing API/form seam and preserve env-lock plus partial-payload behavior. |
| [d9be0bd8](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/d9be0bd804e2eaad19adf7a156b1912f8423cab9) | Grace allowed-services text and notification toggles | Contract, behavior, localization | Hybrid | adapted port | Port exact fields/defaults into the current grace form and regression-test changed-field payloads. |
| [29af2c53](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/29af2c536dcfdc0b5787908c1b7a1b2243e17b10) | Grace subtitle no longer hardcodes Telegram | Localization | Upstream-owned | direct port | Port the four locale changes and verify no Custom copy depends on the removed channel wording. |
| [65531466](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/655314660db44063e3f3fc1a397dfa882d96c983) | Grace allowed-services punctuation | Localization | Upstream-owned | direct port | Port the same four-locale clarification and verify interpolation remains unchanged. |
| [ddd35042](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/ddd350421da35260812cadbb867f4e6a2808712f) | Grace advanced section can be collapsed with external squad | Behavior | Hybrid | adapted port | Apply to the existing disclosure state and add a regression case with an external squad. |
| [6e42870f](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/6e42870f9535cfc290fb27b6a2c0b4a64060ab5f) | External grace squad is selected from panel squads | Contract, behavior | Hybrid | adapted port | Port endpoint/types and adapt the selector to Custom form components; verify loading/error/env-lock states. |
| [394c59ce](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/394c59cefe000ea0000b4d3c35186969645e8573) | Warn which provider email will be forgotten | Contract, behavior | Hybrid | adapted port | Add optional `forgets_email` and a confirmation in the current linked-account flow. |
| [12572678](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/1257267812ca6e4f72d9c236c6a1c64330e4e98c) | Merge PR #599 | Metadata | None | intentionally skipped | Merge commit has no independent behavior beyond the classified parent commits. |
| [92cb96bb](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/92cb96bb278062dfaa9b22480eedaf3827e1864a) | Release 1.75.0 metadata | Dependency, metadata | Upstream-owned | intentionally skipped | Do not import upstream changelog/version bumps mid-integration; final package/provenance metadata follows the source gate. |
| [001531d0](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/001531d04dda5c42f0b23b699e8408c6ca83ede9) | Merge release PR #600 | Metadata | None | intentionally skipped | Merge commit has no independent runtime behavior. |
| [cac1374c](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/cac1374c5fec7890878f76cea9c3ed6e890c3e54) | Admin users URL state, unified search and relative time | Contract, behavior | Hybrid | adapted port | Reuse pure state/time helpers, adapt query parameters to current routes and test round-trip URL state. |
| [9edaea6f](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/9edaea6f75b912488fb9f4a56957b30bcdc28da8) | Admin users filters, segments, chips and infinite list | Behavior, presentation | Hybrid | adapted port | Preserve Custom admin shell/primitives while porting filters, infinite loading and position restoration. |
| [8b58efd8](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/8b58efd857e175487bd3de9f031e93f30bfdf500) | Admin user detail facts, URL tabs and dangerous confirmations | Behavior, accessibility | Hybrid | adapted port | Port state/actions and confirmations without replacing the current user-detail presentation. |
| [215d389e](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/215d389e676d16d506616b160fa5d4a502d8e276) | Subscription tab action and panel refactor | Behavior, presentation | Hybrid | adapted port | Take required actions/panel states only; compose them through existing Custom user-detail seams. |
| [ff1a5e70](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/ff1a5e708f5ade7a658861a7bf31024010f1d5cc) | User-detail tabs use canonical controls | Accessibility, presentation | Hybrid | adapted port | Map accessibility improvements to existing Custom primitives; do not duplicate upstream component styling. |
| [4794375a](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/4794375a021125c994ab111c7d3d34c1f8997cbd) | Remove obsolete admin-user locale keys | Localization | Upstream-owned | adapted port | Remove a key only after Custom consumer search proves it dead; retained keys are documented as compatibility divergences. |
| [6625ccd8](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/6625ccd83b6cf024e9a38cc801785a9ae1cdaed4) | Complete admin users/detail rework and utilities | Contract, behavior, presentation | Hybrid | adapted port | Split API/types/pure helpers from presentation; port observable behavior with focused tests instead of copying the page tree. |
| [ab4852bb](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/ab4852bb6785607f0ce690886f62da38bfa6aa83) | Filters, online state and user-detail refinements | Contract, behavior, presentation | Hybrid | adapted port | Reuse confirmed filter/online contracts and adapt controls to Custom primitives. |
| [95634ce7](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/95634ce7ecb65a2d8f2a9fd72b41a1555f3aeee6) | Balance and referral fact-card consistency | Presentation | Hybrid | adapted port | Preserve current cards and apply only information hierarchy/accessibility improvements that remain relevant. |
| [d8b2c704](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/d8b2c7049f24b825e21f36d1b020ec503cfb05b6) | User-detail actions become explicit buttons | Accessibility, presentation | Hybrid | adapted port | Use existing Button contracts and verify accessible names/touch targets. |
| [71907284](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/71907284b5a6e85648efae41ff4ae15d7bc934a7) | User detail follows classic, tariff and multi-tariff sales modes | Contract, behavior | Hybrid | adapted port | Port the pure sales-mode decision and test every mode against exact Bot fields. |
| [e04b7860](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/e04b78609be32e8c8007122913360f7dd810f6c3) | Deduplicate queries, distinguish panel directions and remove BSCHEKER duplication | Behavior | Hybrid | adapted port | Port query/panel/referral fixes; exclude every BSCHEKER path, label and dependency under ADR 0001. |
| [468e2270](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/468e227086573c327ee750bc09c911db81b2ddc0) | Cross-product mobile overflow and formatting fixes | Accessibility, presentation, behavior | Hybrid / Custom-owned | adapted port | Review each affected Custom surface separately; reuse canonical components and keep Unified Dashboard/mobile navigation. |
| [b5b4a0d7](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/b5b4a0d73cb5af54ca0246f0676ce4181d0be322) | Admin mobile overflow, table and number fixes | Accessibility, presentation | Hybrid / Custom-owned | adapted port | Port relevant admin/formatting fixes file-by-file; omit all reachability files and verify 320 px containment. |
| [cc786100](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/cc786100b841f7ad57ceaa480eda2e25c1169ea3) | Standards-compatible IntersectionObserver test double | Security, test | Custom acceptance | direct port | Port the test-double signature if the adapted list test uses it; run CodeQL-compatible type/lint checks. |
| [34ad04be](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/34ad04be18548f971ef2fd7c381b5df1c4eaa9e1) | Merge PR #601 | Metadata | None | intentionally skipped | Merge commit has no independent behavior beyond classified parents. |
| [1f1b630b](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/1f1b630bfc14c3516eb78f001ce867b1244eaa95) | Release 1.76.0 metadata | Dependency, metadata | Upstream-owned | intentionally skipped | Defer changelog/package version to the final verified Custom Cabinet provenance step. |
| [43338769](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/43338769868a3427306b89de823e7dfe6098a38d) | Merge release PR #602 | Metadata | None | intentionally skipped | Merge commit has no independent runtime behavior. |
| [051a8d8a](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/051a8d8a2a63201e515e035d579b87d962465850) | Online indicator expires without a server response | Contract, behavior | Hybrid | adapted port | Port the clock/helper seam and test stale online timestamps without forced refetch. |
| [29c54f43](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/29c54f431b169a934fc1d58b49f1c8fd5db1400f) | Show grace and tariff count in the users list | Contract, behavior | Hybrid | adapted port | Accept exact optional fields and render them through existing status components. |
| [82326b09](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/82326b09e04aa9badf70171bc528077cb8ce77c7) | Mobile grace marker, Enter search and scroll-to-top | Accessibility, behavior | Hybrid | adapted port | Adapt controls to Custom list layout and verify keyboard plus narrow widths. |
| [3e443f6c](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/3e443f6cfc48045ddab956ef4a1629495c8a949b) | Panel comparison explains an open grace overlay | Contract, behavior | Hybrid | adapted port | Port pure comparison rows and distinguish real panel diff from grace state in tests. |
| [82bf3ac0](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/82bf3ac074d64ef921f008986346f8279704afd3) | Localize trial-reset refusal | Reliability, localization | Upstream-owned behavior seam | direct port | Port the error mapping and all four locale keys; test known and unknown backend errors. |
| [5f3d39af](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/5f3d39af1130a141fa78a7c07ca5d3d16d638b47) | Merge PR #603 | Metadata | None | intentionally skipped | Merge commit has no independent behavior beyond classified parents. |
| [6aa781f2](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/6aa781f2740c1a04c0ba7324599bf12f4180b84b) | Release 1.76.1 metadata | Dependency, metadata | Upstream-owned | intentionally skipped | Defer changelog/package version to the final verified Custom Cabinet provenance step. |
| [a9e702b0](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/a9e702b04d9041a799d1c1a9661b76b000852f55) | Merge release PR #604 | Metadata | None | intentionally skipped | Merge commit has no independent runtime behavior. |
| [800e0523](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/800e052379681a88935677bb21b04b7555659473) | Replace hand-drawn controls and stop reissue-label overflow | Accessibility, presentation | Hybrid / Custom-owned | adapted port | Use the existing icon set only, retain Custom components and verify accessible names plus wrapping. |
| [713822b4](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/713822b4b18c215f34beca60c003d7cf4f0a71b9) | Admin-user sort direction | Contract, behavior | Hybrid | adapted port | Port `sort_order`, URL serialization and exact request parameters. |
| [0b010ffb](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/0b010ffbaf4833f2fdbf6cc9c29a34c25a6fd9b8) | Sort as a single list of prepared orders | Behavior, presentation | Hybrid | adapted port | Adapt the selection control to Custom primitives while preserving the same query contract. |
| [ab24caed](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/ab24caeda7b809ab592767337275bd9b471ad80e) | Same-origin Bot manifest URL and frontend fallback | Platform, branding, security | Custom-owned / Hybrid | adapted port | Merge with the privacy-first early branding pipeline; `contact` removal must still precede every subresource request. |
| [29ff901d](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/29ff901d3240d6ae2f27e8d1f3ce15ddde542c19) | Telegram background follows page and explicit `color-scheme` | Platform, accessibility | Hybrid / Custom-owned | adapted port | Extend platform adapters/provider without changing Custom theme semantics; test web and Telegram modes. |
| [5194b8db](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/5194b8dba440f7d731cf82b9293301dcc9301d46) | Wheel rim/lights render over rotating group | Presentation, performance | Hybrid | adapted port | Port the corrected layer order into the current wheel and retain game behavior. |
| [ef86033a](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/ef86033adea9150460ba2c8d1b518a63854b380b) | Sort users by grace expiry | Contract, behavior | Hybrid | adapted port | Add exact sort key and URL/API mapping; verify optional grace timestamps. |
| [c18dd817](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/c18dd8178381e52f72008d19853446b2292a35c0) | In-grace segment | Contract, behavior | Hybrid | adapted port | Port segment/filter semantics and test request/URL round trips. |
| [6c682654](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/6c68265421a2a8da263052414b9b75932bb4c76f) | Wheel uses one rendered image instead of separate GPU layers | Performance, presentation | Hybrid | adapted port | Preserve the optimization and current wheel visuals; verify reduced layer count and rendering parity. |
| [a6dc42e6](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/a6dc42e695a9c85aa24814b810e3ce1ba7c03134) | Grace sort only applies to the grace segment | Behavior | Hybrid | adapted port | Centralize the segment/sort invariant and cover incompatible URL state. |
| [7ad5ae1b](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/7ad5ae1b679a2e3731a085c4175fe8c5514b3e63) | Merge PR #606 | Metadata | None | intentionally skipped | Merge commit has no independent behavior beyond classified parents. |
| [9710f824](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/9710f824b06024631c1329d6991d3f3cc9bbad21) | Release 1.77.0 metadata | Dependency, metadata | Upstream-owned | intentionally skipped | Defer changelog/package version to the final verified Custom Cabinet provenance step. |
| [227d789f](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/227d789f94d82e3d172dedab5a06f7663a8f12d3) | Merge manifest PR #605 | Metadata | None | intentionally skipped | The manifest behavior is fully classified under `ab24caed`; the merge adds no separate behavior. |
| [51dfb22b](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/51dfb22bce15c5900c8a2a5549b3e1ea2ae69622) | Merge release PR #607 | Metadata | None | intentionally skipped | Merge commit has no independent runtime behavior. |
| [5e34130b](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/5e34130b3d54c76f45f51e598088fce4ac1bdbce) | Merge `origin/main` into upstream `dev` | Metadata | None | intentionally skipped | History reconciliation has no independent source delta after parent commits are classified. |
| [4fea85e4](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/4fea85e4b1e05f1f3165926e6853196f824811f6) | Legacy subscription selects a tariff instead of renewing | Contract, behavior | Hybrid | adapted port | Introduce optional `requires_tariff_selection` and one pure `needsTariff` decision used by all Custom surfaces. |
| [645b5d19](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/645b5d1969e39e406eb822adf561b631c3ab9528) | Legacy subscription hides addons and exposes a real transition action | Behavior | Hybrid | adapted port | Apply the centralized legacy rule to detail/card/addon consumers and verify navigation. |
| [78c4ba42](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/78c4ba42e83258073daab3baec5a6320f83914e2) | Do not offer another purchase while a legacy subscription exists | Behavior | Hybrid | adapted port | Port the rule into Unified Dashboard/subscription entry points and test single/multi states. |
| [c083353a](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/c083353adbb32c796ad42bc44e7958929c59498d) | Logout is visible only in a regular browser | Platform, behavior | Custom-owned shell | adapted port | Keep Custom shell/navigation and gate logout through the existing platform adapter. |
| [e8cf2a47](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/e8cf2a479fc930dc39496152666d873f09e73aba) | Trial-days status chip contract test | Contract, test | Hybrid test seam | direct port | Carry the exact regression into the adapted status-chip suite using v4.15 fixtures. |
| [42b301ea](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/42b301ea33e247563c03534605185624e9ebbf1c) | Merge PR #608 | Metadata | None | intentionally skipped | Merge commit has no independent behavior beyond classified parents. |
| [22985055](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/2298505514e854e464664180a7605ade233dbf98) | Release 1.78.0 metadata | Dependency, metadata | Upstream-owned | intentionally skipped | Defer changelog/package version to the final verified Custom Cabinet provenance step. |
| [9c6a58a1](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/9c6a58a148edf6e97ae593cda922ef9ed7e9f5cc) | Merge release PR #609 | Metadata | None | intentionally skipped | Merge commit has no independent runtime behavior. |
| [fd8d0c2a](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/fd8d0c2a87913f801958a53f3c0531022b9bb1bf) | Promo-group member recalculation and polling | Contract, behavior | Hybrid | adapted port | Port start/status API and bounded polling with `promo_groups:edit`; test queued/running/success/error states. |
| [19ecdd5f](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/19ecdd5f74c48fb06cf86c2012cd036691b09d16) | Manifest icon tile has no theme-colored rim | Platform, presentation | Custom-owned branding | adapted port | Apply the edge-color fix without changing Custom black/white/foreground monogram semantics. |
| [1c0070ff](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/1c0070ff98344482096fe74e50f057ad988512e2) | User reminder cards and dismiss | Contract, behavior, presentation | Hybrid | adapted port | Port authenticated API/cache behavior and render cards through the existing Unified Dashboard. |
| [ea3bd716](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/ea3bd716b3d1bde13f9952eb97b8220f060dc9c9) | Reminder admin list, form, audience and self-test | Contract, routing, RBAC, behavior | Hybrid | adapted port | Add routes/API with exact four permissions and Custom admin components; update `INTERFACE_MAP.md`. |
| [4ff777a1](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/4ff777a1473065fd9a59c740fe5954650de23e08) | Reminder payload omits unused button text and tariff without ID | Contract, validation | Hybrid | adapted port | Port normalized payload construction and regression-test absent/partial fields. |
| [5927be80](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/5927be80445b09bfacd49c2d24e52330afbc84c3) | Reminder validation, focus refetch and dirty-form preservation | Reliability, behavior | Hybrid | adapted port | Preserve edits during background refresh, refetch cards on visibility return and test validation. |
| [ebe4a57b](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/ebe4a57b57dcb8dbf234f09c2d66aa5fa4bae16a) | Extract subscription page sections | Refactor, presentation | Hybrid | intentionally skipped | Behavior-neutral preparation for the excluded parallel presentation; no independent Custom behavior is proven. |
| [3de515b1](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/3de515b18366dd0202dad818fcb21a2ae82e76f3) | Extract `tariffAction()` | Refactor, behavior | Hybrid | intentionally skipped | Preparation for two storefronts is unnecessary. Slice 5 ports the narrower centralized `needsTariff` rule instead. |
| [b247fbfa](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/b247fbfa0ae2151b4ab397c60170e58f3eaa6021) | Upstream Simple/Lite Mode | Contract, routing, presentation | Hybrid / Custom-owned | intentionally skipped | ADR 0002 excludes its endpoint client, toggle, storage key, screens, routes and navigation branches. |
| [501c9c33](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/501c9c33cbf8b5aef3a01e993ba9d8a26e167897) | Paid-trial dead-end fix in `DashboardLite` | Behavior | Excluded Lite surface | intentionally skipped | The affected screen does not exist in Custom Cabinet; paid-trial behavior is verified in Unified Dashboard separately. |
| [e12f3880](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/e12f3880a31090d103daa74dc812d5ebbe89676a) | Parity test for two tariff storefronts | Test | Excluded Lite surface | intentionally skipped | Custom Cabinet has one storefront; existing tariff/legacy matrices cover its observable behavior. |
| [347ee33d](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/347ee33d8807848849c69c2637d95373045b0007) | Grace traffic reset toggle | Contract, behavior | Hybrid | adapted port | Port optional field/default `false`, preserve env-lock and test partial updates. |
| [516c16be](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/516c16be777f9e5eabfeccdf27c9622e61831dca) | Email promo-group audience and direct user target | Contract, RBAC, behavior | Hybrid | adapted port | Port exact filter/target values; gate user action by `broadcasts:send` and confirmed email, including zero-deliverable preview. |
| [ce81c493](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/ce81c49337e1297ec68de41ed749e638c9b12309) | Merge PR #614 | Metadata | None | intentionally skipped | Merge commit has no independent behavior beyond classified parents. |
| [61b8aa72](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/61b8aa7256502276367ccb342251707a73bf24c0) | Release 1.79.0 metadata | Dependency, metadata | Upstream-owned | intentionally skipped | Final Custom package/provenance metadata is applied only after source and compatibility gates pass. |
| [821c7b71](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/821c7b71823573a756de00418acb25118ede1c9c) | Merge release PR #615 | Metadata | None | intentionally skipped | Target tag merge has no independent runtime behavior beyond classified parents. |

## Ledger Totals

| Decision | Count | Meaning at Slice 0 |
| --- | ---: | --- |
| `direct port` | 5 | Narrow upstream-owned behavior or test can be carried without a Custom presentation fork. |
| `adapted port` | 48 | Behavior is required but must be integrated through Custom or hybrid seams. |
| `intentionally skipped` | 25 | 20 merge/release-history commits plus 5 explicitly excluded Simple/Lite Mode commits. |
| `blocked` | 0 | No Cabinet commit lacks a source-level disposition; later compatibility gates can still block release. |
| **Total** | **78** | Must remain equal to `git rev-list --count v1.74.0..v1.79.0`. |

## Initial File-Level Conflict Decisions

| Seam | Previous/current Custom responsibility | Incoming behavior | Planned resolution |
| --- | --- | --- | --- |
| `src/pages/AdminGraceAccess.tsx` and `src/components/admin/grace-access/` | Custom form structure, env locks, validation and changed-field payload | External squad, allowed-service text, notifications and traffic reset | Extend existing form helpers/components; do not replace the page. |
| `src/pages/AdminUsers.tsx`, `src/pages/AdminUserDetail.tsx`, admin user components | Custom admin shell and permissions | URL state, filters, infinite list, online/grace fields, sales modes and panel comparison | Extract/port pure state and contracts first, then adapt presentation; exclude BSCHEKER adjacency. |
| `index.html`, branding hooks/utilities and `vite-plugins/brandingHtml.ts` | Contact privacy ordering and Custom first-paint/monogram policy | Same-origin PWA manifest, fallback and icon edge fix | Keep the privacy script first, then add manifest/fallback; retain Custom foreground rules. |
| Unified Dashboard and subscription components | One Custom presentation path and four-item mobile navigation | Legacy tariff selection and reminder cards | Centralize behavior in helpers/API seams and render it in existing surfaces; do not add Lite screens. |
| `src/App.tsx` and `src/pages/AdminPanel.tsx` | Current route map and permission wrappers | Reminder admin routes and four permissions | Add only reminder routes/links with exact RBAC; update `INTERFACE_MAP.md`. |
| Promo groups, broadcasts and user detail | Existing admin editors/actions | Recalculation polling, promo-group filters and direct-user email | Extend current API/forms, enforce permissions and exact audience preview. |
| Wheel components | Existing game rules and Custom visuals | Correct layer order and single-layer rendering | Port rendering fixes without changing probability or game state. |
| `src/locales/{ru,en,fa,zh}.json` | Complete Custom locale set and async loading behavior | New/changed upstream copy | Merge key-by-key; do not delete a key until all Custom consumers are absent. |

## Slice 0 Verification

- [x] Previous and target Cabinet tags resolve to the exact expected SHAs.
- [x] Receiving Custom Cabinet commit is recorded before source edits.
- [x] Dedicated integration branch exists.
- [x] Git range is independently counted as 78 commits and 340 changed paths.
- [x] Dependency diff is limited to package-version metadata.
- [x] Every incoming Cabinet commit has exactly one ledger row and one allowed decision.
- [x] All five Simple/Lite Mode commits have explicit skip reasons.
- [x] Mixed BSCHEKER-adjacent commits require filtered adaptation.
- [x] Slice 1 exact Upstream Bot fixture and schema `0119 -> 0127` proof.

`UPSTREAM.md` and `COMPATIBILITY.md` intentionally remain unchanged until the
complete source and compatibility gates pass.

## Slice 1 Exact Upstream Bot Contract Proof

All checks in this section used isolated local Docker resources. They did not
read from or write to production, and they did not modify the exact upstream
Bot worktrees.

### Exact source and runtime identity

| Item | Verified value |
| --- | --- |
| Previous Bot fixture | clean detached worktree at `v4.10.0` / `9fcebfd7bc075dcca1bb9d1514740039208b906a` |
| Target Bot fixture | clean detached worktree at `v4.15.0` / `877690a7039d1326b2c00eda3e297879b80c0678` |
| Exact target runtime image | `local/bedolaga-upstream-bot:v4.15.0-contract` / `sha256:f2e0b7e9210d95f8a7d315ea8eaf686bc8f67cc6fba62e52ad77225924e74ebd` |
| Exact previous runtime image | `local/bedolaga-upstream-bot:v4.10.0-contract` / `sha256:629e88728309f0055cf2c70ef9f67eff5ee38222f4c3f920e3efe727a6078e43` |
| Target runtime metadata | image labels `v4.15.0` and exact target SHA; Python `3.13.15`; project version `4.15.0` |
| Upstream lock anomaly | reproduced unchanged: target `uv.lock` still records the virtual project as `4.14.0` |
| Database fixture | isolated `postgres:15-alpine`; no persistent volume |

### Fresh database and real upgrade

- The supported `run_alembic_upgrade()` fresh-install path created the exact
  v4.15.0 model schema and stamped Alembic head `0127`. Table
  `user_reminders` was present.
- A second database was created by the exact v4.10.0 runtime and confirmed at
  head `0119`. The exact v4.15.0 runtime then applied each migration in order:
  `0120`, `0121`, `0122`, `0123`, `0124`, `0125`, `0126`, `0127`.
- The upgraded schema contains `subscriptions.grace_tail_expire_at`,
  `subscriptions.grace_session_open` (`false`, not null),
  `subscriptions.grace_overlay_expire_at`, `users.trial_reset_at`,
  `withdrawal_requests.last_reminder_at`, `user_reminders` and
  `user_reminder_states`.
- The built-in `link_auth_method` reminder is inactive by default, uses the
  `both` channel, `service` audience, `14`-day inactivity threshold,
  `3`-day repeat interval and `/profile/accounts` Cabinet action.

Raw `alembic upgrade head` on an empty database was also tested and stops at
historical migration `0021`: migration `0001` creates current JSON columns via
`Base.metadata.create_all()`, while `0021` still compares those fields with a
text literal. This is not the supported fresh-install interface. The exact Bot
source explicitly routes a fresh database through `run_alembic_upgrade()`;
that supported path passed. The raw-replay limitation is recorded here so it
is not mistaken for a successful gate later.

### Cabinet-facing API surface

The exact target FastAPI router generated 521 `/cabinet` paths. The Slice 1
fixture confirms the v1.79.0 work will consume these Bot v4.15.0 contracts:

- grace access: admin settings, squads, external squads and sessions;
- user accounts: linked-provider `forgets_email` plus admin user filters,
  grace fields and multi-tariff facts;
- promo groups: recalculation start and status;
- reminders: active/dismiss user routes and admin CRUD, audience, test and
  toggle routes;
- broadcasts: email filters and preview;
- branding: same-origin manifest and regular/maskable app icons.

The Bot also exposes `/cabinet/branding/lite-mode`, but Custom Cabinet will not
call it under ADR 0002.

### Focused upstream regression result

The exact v4.15.0 source tests were mounted read-only into a local test layer
built from the exact runtime image. The following 11 files passed together:

- migration-chain and `0127` reminder migrations;
- linked-provider `forgets_email`;
- grace settings and grace HTTP contracts;
- admin-user list filters, multi-tariff and grace fields;
- branding manifest;
- admin reminders;
- promo-group recalculation routes;
- scoped email-broadcast targets.

Result: **145 passed**, 0 failed. The 34 warnings are existing SQLAlchemy,
Pydantic, Starlette and Alembic deprecation notices, not test failures.

## Slice 2 Account, Date and Grace Adaptation

The v4.15 account/date/grace contracts are integrated through the existing
Custom Cabinet seams rather than by replacing their pages:

- linked providers accept optional `forgets_email`; the first unlink
  confirmation warns when the provider forgets the email;
- invalid machine dates render their original value instead of `Invalid Date`,
  while date-only revenue keys are parsed as local calendar days;
- grace settings accept `reset_traffic_on_start`, `allowed_services`,
  `notify_admins` and `notify_user` without changing the Bot default or the
  existing env-lock/partial-update behavior;
- internal squad source and the separate external-panel squad endpoint are
  represented explicitly, with a manual fallback when the panel is unavailable;
- all new copy is present in Russian, English, Farsi and Chinese.

Focused Slice 2 result: **55 passed**, 0 failed. TypeScript and the production
build passed after the adaptation.

## Slice 3 Admin Users and User Detail Adaptation

The admin-user list now uses the exact confirmed Bot v4.15 filters and keeps its
state in the URL:

- one search field classifies ID/name/username versus email;
- expiry, subscription state, tariff, promo group, campaign, VPN-online,
  no-purchase, traffic-threshold, blocked and in-grace views map to server
  parameters; `sort_order` and `grace_until` sorting are supported;
- the list loads in 50-item chunks without replacing already visible rows,
  stores the last view and restores the scroll position after returning from a
  user card;
- rows show current panel online state, grace state and additional tariff count;
  the online marker recalculates every ten seconds and expires after the panel's
  one-minute window without waiting for a new response;
- the frontend trusts the corrected Bot `total` and contains no local
  compensation for the old `total: 1` response.

The existing Custom user-detail page remains in place. Its tabs now round-trip
through the URL, the Bot `sales_mode`/`multi_tariff_enabled` contract controls
classic, tariff and multi-tariff actions, and an explicit subscription id never
falls back to a different subscription. Existing inline/native confirmations
remain the only path to destructive actions. Panel comparison now distinguishes
real differences from fields intentionally owned by an open grace overlay.

Focused Slice 2+3 result: **79 passed**, 0 failed across 15 contract, page,
helper and locale test files. The complete project suite then passed with
**130 test files and 824 tests**, 0 failed, using one worker to avoid the
previously reproduced CPU-contention timeouts. `npm run type-check` and
`npm run build` passed. `npm run check` completed with the same pre-existing
40 warnings and 5 informational diagnostics seen before Slice 3, primarily in
`index.html`; the affected 42-file scope is clean. `package.json` and
`package-lock.json` remain unchanged.

The local dependency tree initially lacked the already-locked `jsdom@30.0.1`;
it was installed with `--no-save --ignore-scripts` only to execute browser-like
unit tests. The current local Node `24.11.1` is below the repository engine
floor `24.15.0`, but all tests, type checks and the production build above
completed successfully. No package metadata changed.

## Slice 4 Platform, PWA and Branding Adaptation

The platform and PWA changes are integrated without changing the existing
Custom privacy-first branding pipeline:

- `index.html` keeps the quick-purchase `contact` removal script before the
  manifest, favicon, fonts and every other subresource;
- the build injects the Bot `/cabinet/branding/manifest.webmanifest` URL next
  to the favicon URL. A same-origin manifest remains authoritative at runtime;
  a separate API origin falls back to the existing frontend `data:` manifest;
- the existing Custom monogram, operator palette, first-paint hint and Safari
  favicon behavior remain in place;
- dark/light `color-scheme` is declared both before first paint and in the
  application stylesheet;
- Telegram now receives the selected page background in addition to its header
  and bottom-bar surface colors;
- logout is rendered in normal web only. One shared guard now covers the
  desktop header, admin mobile menu and the Custom profile page;
- generated shortcut and maskable icons continue a uniform opaque edge color
  from a full-bleed logo, while transparent glyphs and non-uniform images keep
  the configured theme background.

Focused Slice 4 result: **7 test files and 40 tests passed**, 0 failed.
`npm run type-check` and the final `npm run build` passed. The built
`dist/index.html` was inspected and contains the `contact` script before
`/api/cabinet/branding/manifest.webmanifest`, the favicon and external fonts.
`git diff --check` passed.

The complete project run executed **134 test files and 840 tests**. It reported
one five-second timeout in the existing `Referral` loading-skeleton case
(**839 passed, 1 timed out**); the unchanged file then passed in isolation with
**48/48 tests** in 8.02 seconds. The timeout is consistent with the previously
observed full-suite CPU contention and is not in a Slice 4 dependency path.
No test assertion failed. The existing Biome baseline remains 40 warnings and
5 informational diagnostics in `index.html`; the Slice 4 TypeScript/CSS scope
is formatted, and package metadata remains unchanged.

## Slice 5 Explicit Legacy-Subscription Adaptation

Custom Cabinet now accepts the optional Upstream Bot
`requires_tariff_selection` field on both the single-subscription and
subscription-list contracts. One pure `needsTariff` helper is the only source
of the legacy decision: a missing tariff id alone does not trigger this state.

The explicit rule is applied across the existing Custom surfaces:

- active, expired and traffic-limited Dashboard cards lead to
  `/subscription/purchase?subscriptionId=<id>` instead of management, renewal
  or traffic top-up;
- subscription detail and list cards show the real “move to tariff” action,
  label the plan as absent and hide unavailable autopay, device and traffic
  addons;
- old renewal links redirect to tariff selection for the same subscription;
- the tariff picker and purchase page describe applying a tariff to the same
  subscription while preserving the connection link and remaining days;
- “buy another” actions stay hidden while any returned subscription explicitly
  requires tariff selection;
- Russian, English, Farsi and Chinese contain the matching action, hint,
  no-tariff label and transition explanation.

Focused Slice 5 result: **12 test files and 40 tests passed**, 0 failed. The
complete project suite passed with **143 test files and 865 tests**, 0 failed,
using one worker. `npm run type-check`, the production `npm run build`, the
affected 28-file Biome check and `git diff --check` passed. `package.json` and
`package-lock.json` remain unchanged. No Simple/Lite Mode or BSCHEKER source
was introduced.

## Slice 6 User Reminders Adaptation

The exact Upstream Bot v4.15 reminder contracts are integrated into the
existing Unified Dashboard and Custom admin shell:

- Dashboard reads localized active reminder cards, renders at most two, hides
  a dismissed card immediately and reports the dismiss to the Bot;
- cabinet buttons use internal navigation while URL buttons go through the
  platform adapter; active cards refetch when the browser tab regains focus;
- the admin API covers list, get, create, update, audience preview, toggle,
  delete and test-to-self routes with the confirmed Bot payload types;
- the editor supports `bot`, `cabinet` and `both` channels, service and
  marketing categories, auth/subscription/age/inactivity conditions,
  localized text, repeat/max-send limits and `none`/`cabinet`/`url` buttons;
- client validation rejects a tariff segment without an id, partial
  translations, missing Russian text/button text and non-HTTPS external URLs;
  the payload omits unused button text and target fields;
- background query updates do not overwrite an administrator's unsaved form;
  test-to-self errors distinguish missing Telegram, invalid saved text and
  other failures;
- list, create and edit routes require `user_reminders:read`, `:create` and
  `:edit`; toggle and test-to-self require edit, while ordinary deletion
  requires `user_reminders:delete`. Built-in reminders never expose delete;
- all user/admin copy is present in Russian, English, Farsi and Chinese, and
  `INTERFACE_MAP.md` records the new routes and action permissions.

The frontend does not duplicate Bot marketing opt-out or quiet-hour dispatch
rules. It also does not activate the built-in `link_auth_method` reminder; the
Slice 1 exact migration proof remains the source of its inactive default.

Focused Slice 6 result: **5 test files and 32 tests passed**, 0 failed. The
complete project suite passed with **147 test files and 890 tests**, 0 failed,
using one worker. `npm run type-check`, the production `npm run build`, the
affected 17-file Biome check and `git diff --check` passed. `package.json` and
`package-lock.json` remain unchanged. No Simple/Lite Mode or BSCHEKER source
was introduced.

## Slice 7 Promo Groups, Broadcast Targets and Grace Traffic Reset

The exact Upstream Bot v4.15 contracts are integrated through the existing
Custom admin surfaces:

- the promo-group page starts recalculation through the confirmed POST route,
  polls the confirmed status route while either `queued` or `running`, and
  keeps the last success or error visible; polling is bounded to two minutes
  and refreshes the group list when the job reaches a terminal state;
- only `promo_groups:edit` exposes the start action, while read-only operators
  can still see queued, running and last-result state;
- email audiences include the Bot `promo_group_<id>` filters and the direct
  `user_<id>` target; a direct target opens as email-only, previews immediately
  and keeps the valid zero-recipient result visible instead of treating it as
  an error;
- the user-card email action requires exactly `broadcasts:send`, a present
  address and `email_verified`; broadcast history resolves promo-group labels
  and renders a safe `#<id>` fallback for a direct recipient;
- the Slice 2 grace implementation was reused unchanged. Regression coverage
  now explicitly fixes `reset_traffic_on_start` at the Bot default `false` and
  verifies that its existing `.env` lock prevents editing;
- all new audience, action and recalculation copy is present in Russian,
  English, Farsi and Chinese, and `INTERFACE_MAP.md` records the action-level
  permissions and target forms.

Focused Slice 7 result: **7 test files and 58 tests passed**, 0 failed. The
complete project suite passed with **152 test files and 906 tests**, 0 failed,
using one worker. `npm run type-check`, the production `npm run build`, the
affected 19-file Biome check and `git diff --check` passed. `package.json` and
`package-lock.json` remain unchanged. No Simple/Lite Mode or BSCHEKER source
was introduced.

## Slice 8 Intentional Simple/Lite Mode Exclusion

The five upstream commits are fully classified and remain intentionally
skipped:

- `ebe4a57b` and `3de515b1` are behavior-neutral preparation for a second
  storefront/presentation path; the required legacy-subscription behavior is
  already adapted through the narrower Slice 5 `needsTariff` rule;
- `b247fbfa` is the complete Simple/Lite Mode feature and is excluded together
  with its public endpoint client, storage hint, admin toggle, routing,
  navigation branches, screens, components, utilities and locale copy;
- `501c9c33` fixes only the absent `DashboardLite`, while the current Unified
  Dashboard renewal/legacy regressions remain green;
- `e12f3880` tests parity between two storefronts, but Custom Cabinet keeps one
  tariff storefront and its existing regression matrix.

Upstream Bot v4.15.0 may continue to expose `/cabinet/branding/lite-mode` as
part of its exact immutable source. Custom Cabinet neither calls nor presents
that contract. The Unified Dashboard and four-item Custom mobile navigation
remain the only user presentation path.

`src/noLiteMode.guard.test.ts` now scans the real frontend source, tests,
public assets and root build configuration. It rejects the Lite endpoint and
storage contract, `useLiteMode`, the admin setting, alternate screens,
lite-specific components and utilities before they can enter a future sync.

Focused Slice 8 result: **9 test files and 26 tests passed**, 0 failed. The
complete project suite passed with **153 test files and 908 tests**, 0 failed,
using one worker. `npm run type-check`, the production `npm run build`, the
affected two-file Biome check and `git diff --check` passed. `package.json` and
`package-lock.json` remain unchanged. No Simple/Lite Mode or BSCHEKER runtime
source was introduced.

## Slice 9 Cross-Cutting Quality Adaptation

The upstream quality fixes are adapted only at the Custom Cabinet seams that
consume the affected values or presentation:

- shared number helpers now format decimals and traffic in the active UI
  locale, keep small non-zero traffic visible and compact large chart-axis
  labels; traffic units and currency symbols use a non-breaking separator;
- the existing Slice 2/3 calendar-date and relative-time helpers remain the
  single implementations for their consumers instead of importing duplicates;
- all eight Upstream Bot transaction types have a case-insensitive badge and a
  translated label in Russian, English, Farsi and Chinese; unknown future
  values render the neutral translated operation label instead of a raw enum;
- Balance transaction cards keep the amount intact, wrap long descriptions and
  use a stable three-column pager; Admin Payments wraps long identifiers,
  usernames and action groups; `StatCard` uses its own container width so long
  values receive the full narrow-tile width instead of being truncated;
- every numeric Recharts Y axis in the current partner and sales statistics
  components uses compact locale-aware labels and automatic axis width;
- Fortune Wheel keeps the existing five-second, five-turn game behavior, but
  rotates through the SVG transform attribute on `requestAnimationFrame`. The
  rim and LED layer render above the rotating sectors, LED glow animates
  `fill-opacity`, and no inner wheel group creates a separate CSS transform
  layer;
- the affected subscription status and reissue controls now use the existing
  Phosphor icon barrel. No icon or frontend dependency was added.

Focused Slice 9 result: **6 test files and 27 tests passed**, 0 failed. The
complete project suite passed with **158 test files and 932 tests**, 0 failed,
using one worker. `npm run type-check`, the production `npm run build`, the
affected 27-file Biome check and `git diff --check` passed. The existing
API-mocked browser flow for Balance, subscription management and Connection
also passed in the `mobile-320` project using local system Chrome. The bundled
Playwright Chromium download was unavailable because its CDN timed out; no
repository file or dependency metadata was changed by that fallback.
`package.json` and `package-lock.json` remain unchanged. No Simple/Lite Mode or
BSCHEKER source was introduced.

## Slice 10 Localization and Documentation Completion

The localization audit covered the 193 base keys added or changed by Slices
1–9 across Russian, English, Farsi and Chinese. The normal test gate now checks
that the affected feature scopes have non-empty keys in all four locales, use
the same interpolation placeholders and keep the i18next plural categories
required by each language. The seven affected plural groups cover relative
minutes/hours/days/weeks/months, the admin-user list ending and subscription
counts.

The reminder editor now gives Persian title, body and button-copy fields an
explicit `rtl` direction even when the surrounding admin interface uses a
left-to-right language. Reminder cards use logical inline positioning and
padding, so the dismiss action and text clearance mirror with the document
direction.

`INTERFACE_MAP.md` records the three reminder routes and the exact read,
create, edit/test/toggle and delete permissions. `CUSTOMIZATION_MAP.md` now
records the Simple/Lite Mode exclusion and the rule for separating shared fixes
from lite-only code during every future upstream synchronization. `UPSTREAM.md`,
`COMPATIBILITY.md` and `CHANGELOG.md` record the source-gated candidate without
inventing a commit, tag, package version, Release Bundle or production claim.

Focused Slice 10 result: **3 test files and 31 tests passed**, 0 failed. The
complete project suite passed with **158 test files and 936 tests**, 0 failed,
using one worker. `npm run type-check`, the production `npm run build`, the
affected eight-file Biome check and `git diff --check` passed. A local
API-mocked system-Chrome check at `390 x 844` confirmed `lang=fa`, `dir=rtl`,
two RTL reminder text fields, logical card action placement, `32px` inline-end
title clearance, no horizontal overflow and zero console errors or warnings.
`package.json` and `package-lock.json` remain unchanged.

## Slice 11 Immutable Release Preparation

Local release preparation aligned the root package version in `package.json`
and both root version entries in `package-lock.json` from `1.74.0` to `1.79.0`.
No dependency version, resolved package, integrity value or build input changed.

The immutable source snapshot before these metadata-only edits received a
complete Codex Security diff review covering all 133 prepared source items.
The review found no reportable security issue or secret exposure. The
owner-owned `AGENTS.md`, `docs/agents/full-local-api-mock.md` and
`performance-audit-report.md` files were explicitly excluded from the release
set and preserved.

The post-metadata local gate passed **158 test files and 936 tests**, 0 failed,
with one worker. `npm run type-check`, the production `npm run build` and
`git diff --check` passed. `npm run check` completed with exit code 0 and no
errors; it reported 40 warnings and 5 informational diagnostics in the
existing ES5-compatible inline bootstrap code in `index.html`, and applied no
fixes. A structural comparison against the receiving commit confirms that the
dependency declarations and full lock graph are unchanged apart from the three
root version values. A final scan of all 145 changed release-set files found no
private-key or common provider-token signatures.

Read-only remote checks on 2026-09-25 found no existing Custom Cabinet tags in
the `cabinet-v2026.09.24*` or `cabinet-v2026.09.25*` namespaces and no Installer
tags in the `v2026.09.24*` or `v2026.09.25*` namespaces. The owner subsequently
authorized release work and selected `cabinet-v2026.09.25.1` for Custom Cabinet
and `v2026.09.25` for Installer / Release Bundle. Both names must be rechecked
immediately before creating their immutable tags.

The exact integrated application source was committed as
`a772599846d58e86367d8ac5684630cfa3f471f4`. This record does not claim that an
immutable tag, artifact or Release Bundle has been published or that the full
Installer lifecycle has passed. Production remains outside the authorization.

## Residual Risks and Rollback Reference

- A source-level decision does not prove exact Bot runtime compatibility.
- Migration rollback safety remains unproven until the full Installer lifecycle
  gate exercises fresh install, `0119 -> 0127`, rollback/recovery and uninstall.
- Bot tag `v4.15.0` contains the known `uv.lock` virtual-project version mismatch;
  do not patch the tag and still call it the exact upstream source.
- The source-gated Custom Cabinet application source is committed, but the
  release remains unverified until the immutable tag, artifact checksum,
  Release Bundle and full Installer lifecycle all pass.
- Until a new immutable Release Bundle is published and verified, the confirmed
  runtime fallback remains Release Bundle `v2026.09.21.1` with Custom Cabinet
  `aec198424aa0b489db6d07d1af92bd704aa7c518`, Upstream Cabinet `v1.74.0`,
  Upstream Bot `v4.10.0` and schema `0119`.

## Final Outcome

`Source committed; release gate pending`: Slices 0 through 10 are complete, and
Slice 11 has aligned package metadata, a completed security diff review and exact
application source commit `a772599846d58e86367d8ac5684630cfa3f471f4`.
Immutable tag/artifact verification, Release Bundle publication and the full
Installer lifecycle gate remain pending. Production is not authorized.
