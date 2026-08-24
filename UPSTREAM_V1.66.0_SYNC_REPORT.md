# Upstream Synchronization Report: `v1.66.0`

Status: `release authorized with manual-gate waiver; automated, zoom and Bot runtime gates passed`
Date: `2026-08-24`
Owner: `repository owner and OpenCode`

Do not mark this report completed until the selected range is integrated,
verified and recorded in `UPSTREAM.md` and `COMPATIBILITY.md`.

## Source Identity

| Item | Value |
| --- | --- |
| Supplied release URL | <https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/releases/tag/v1.66.0> |
| Upstream Cabinet repository | <https://github.com/BEDOLAGA-DEV/bedolaga-cabinet.git> |
| Previous upstream tag | `v1.65.0` |
| Previous upstream SHA | `b866bebeeb6032db4baa3869a4917316fe8e0453` |
| Target upstream tag | `v1.66.0` |
| Target upstream SHA | `2192484b011068d8cb75c61a6aeaada1d06115aa` |
| Receiving Custom Cabinet commit | `c1ddbf39b145b298fbc0af0557fd26ef70a83c5e` |
| Integrated Custom Cabinet source commit | `653e26238105c8394c6abc271b6da836de5fa974` |
| Intended Upstream Bot | `v4.1.0` / `49b05d5ab79dd9bb92f0404bb0066cda8a175649` (owner-approved) |
| Intended Release Bundle | `v2026.08.19`; owner authorized publication with the manual-gate waiver recorded below |

## Range Summary

The range adds Telegram authentication recovery, guest-purchase attribution and
privacy handling, support error visibility, subscription device actions, admin
sorting and deletion, promocode traffic bonuses, and Remnawave GeoCheck. The
functional behavior is ported while Custom Cabinet keeps its unified Dashboard,
four-item navigation, compatibility routes, branding and responsive overlays.

Changed files: `53` (`18` overlapping, `12` unchanged locally, `23` new)
Incoming commits: `45`
Dependency changes: `react-zoom-pan-pinch@4.0.4`, required only by GeoCheck
API changes: admin sort/delete, promocode traffic, guest campaign attribution,
and GeoCheck start/result contracts

Decision totals: `5` direct ports, `21` adapted ports and `19` skipped metadata
or merge commits. No source commit is blocked. GeoCheck runtime verification is
blocked because the current Remnawave panel and nodes are `2.8`, below `3.3.0`.

The Custom Cabinet source candidate is version `1.66.0`, committed as exact SHA
`653e26238105c8394c6abc271b6da836de5fa974`. No immutable tag or Release Bundle
is declared here.

## Commit Impact Matrix

| # | Upstream SHA | Class | Affected flow/files | Ownership | Decision | Verification |
| ---: | --- | --- | --- | --- | --- | --- |
| 1 | [`89a9f9f70c5910916097818696711cb99ae19bcc`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/89a9f9f70c5910916097818696711cb99ae19bcc) | Contract / Behavior / Localization | User sort; `AdminUsers`, locales | Hybrid / Upstream-owned | Adapted port | Query value, pagination reset, locale parity |
| 2 | [`d03b9bdad785ac7710f30527f230eeb793e1089b`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/d03b9bdad785ac7710f30527f230eeb793e1089b) | Platform / Behavior / Localization | Manual Telegram deep-link login | Hybrid | Adapted port | Manual opt-in, polling, referral and widget fallback |
| 3 | [`75424dba473925b99d993d0e52f33067f14125ce`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/75424dba473925b99d993d0e52f33067f14125ce) | Platform / Behavior / Presentation | Telegram login entry states | Hybrid | Adapted port | Two entry points and automatic fallback |
| 4 | [`596b39b765de0b574bae1ef9affb7d9bec21feae`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/596b39b765de0b574bae1ef9affb7d9bec21feae) | Merge metadata | No unique behavior | N/A | Skipped | Parent changes classified separately |
| 5 | [`eafc563128b68f49f0a1f03a30c899b527ce4734`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/eafc563128b68f49f0a1f03a30c899b527ce4734) | Security / Contract / Behavior | Admin subscription deletion | Upstream-owned / Hybrid | Adapted port | Trial, paid force dialog, RBAC, `409/404` |
| 6 | [`f6a64bfc1eb885cde31bcbab1f1474b1d693e718`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/f6a64bfc1eb885cde31bcbab1f1474b1d693e718) | Contract / Behavior / Localization | Promocode traffic bonus | Upstream-owned / Hybrid | Adapted port | Traffic-only, mixed, create/edit and validation |
| 7 | [`06c7d1388308de5fc1adad0cd2697d3c03c41c49`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/06c7d1388308de5fc1adad0cd2697d3c03c41c49) | Behavior / Presentation | Dashboard device action | Hybrid | Adapted port | Free/full/unlimited/loading states |
| 8 | [`b3a3dc4ff4846cc69761c4c5df1ae15b41968020`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/b3a3dc4ff4846cc69761c4c5df1ae15b41968020) | Merge metadata | Sort branch merge | N/A | Skipped | Changes covered by rows 1 and 9 |
| 9 | [`2d6f8d97546f7ca69540924aa0637f720500bef3`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/2d6f8d97546f7ca69540924aa0637f720500bef3) | Contract / Localization | Sort type and Chinese label | Upstream-owned | Direct port | Type-check, request and `zh` key |
| 10 | [`fdaf03feffdf0542b0af7316de18bed26d381ff3`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/fdaf03feffdf0542b0af7316de18bed26d381ff3) | Merge metadata | Sort PR merge | N/A | Skipped | Changes covered by rows 1 and 9 |
| 11 | [`76e10cc06ccc3e59183b4036c57d40cd065ecbf3`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/76e10cc06ccc3e59183b4036c57d40cd065ecbf3) | Merge metadata | Telegram branch merge | N/A | Skipped | Auth changes classified separately |
| 12 | [`c1088325aabaf43de6f60653ff650c3cfb1beb2f`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/c1088325aabaf43de6f60653ff650c3cfb1beb2f) | Platform / Behavior / Localization | Back to Telegram widget | Hybrid | Adapted port | Widget return, polling, retry and four locales |
| 13 | [`02b3ffd4a0afb72b750357588917feadf2a82e64`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/02b3ffd4a0afb72b750357588917feadf2a82e64) | Merge metadata | Manual login PR merge | N/A | Skipped | Changes covered by rows 2, 3 and 12 |
| 14 | [`fa6b57b6ed5965479257d3bd9b1800547ec9f591`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/fa6b57b6ed5965479257d3bd9b1800547ec9f591) | Merge metadata | Delete branch merge | N/A | Skipped | Delete changes classified separately |
| 15 | [`415a76f7cff4e0e06edb15b91a24467f0465e2e9`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/415a76f7cff4e0e06edb15b91a24467f0465e2e9) | Security / Behavior | Delete error visibility | Hybrid | Adapted port | Server detail/fallback for `409/404/403` |
| 16 | [`04d39907491a9241630eb9ef05ce7e7e9ed624a5`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/04d39907491a9241630eb9ef05ce7e7e9ed624a5) | Merge metadata | Delete PR merge | N/A | Skipped | Changes covered by rows 5 and 15 |
| 17 | [`1883ec93400cfa623f7fadfd796d566bc33bf7bd`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/1883ec93400cfa623f7fadfd796d566bc33bf7bd) | Merge metadata | Promocode branch merge | N/A | Skipped | Parent changes classified separately |
| 18 | [`29c9ed1a40bad95b187fabd81098a795d4c096da`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/29c9ed1a40bad95b187fabd81098a795d4c096da) | Contract / Behavior / Localization | Promocode state and list | Hybrid | Adapted port | Value-derived checks, traffic display, old records |
| 19 | [`3995ed8a28b2f82b43da56ce8b692d6b8202a69d`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/3995ed8a28b2f82b43da56ce8b692d6b8202a69d) | Merge metadata | Promocode PR merge | N/A | Skipped | Changes covered by rows 6 and 18 |
| 20 | [`9532819fc6104c98e3a4e377755fc14d38620576`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/9532819fc6104c98e3a4e377755fc14d38620576) | Merge metadata | Dashboard branch merge | N/A | Skipped | Dashboard changes classified separately |
| 21 | [`39b9b8e1d2690c894ce08b0ce16d4780ecffee09`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/39b9b8e1d2690c894ce08b0ce16d4780ecffee09) | Behavior | Per-subscription device count | Hybrid | Adapted port | Query key, totals and loading/error states |
| 22 | [`9a12e002fd3bea1e0fc94b46430934e275da69cd`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/9a12e002fd3bea1e0fc94b46430934e275da69cd) | Merge metadata | Dashboard device PR merge | N/A | Skipped | Changes covered by rows 7 and 21 |
| 23 | [`d88928912acaaf9eeee52235ee4e2aace5e245e7`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/d88928912acaaf9eeee52235ee4e2aace5e245e7) | Contract / Behavior / Localization | Support mutation errors | Hybrid / Upstream-owned | Adapted port | `409`, create/reply handlers and fallback |
| 24 | [`a82950126e5600a9cd63e3db45f91f6d713a73be`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/a82950126e5600a9cd63e3db45f91f6d713a73be) | Merge metadata | Support branch merge | N/A | Skipped | Support changes classified separately |
| 25 | [`533fc3073f24c3a6dc8c280c99ff4e1cf0c27a7d`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/533fc3073f24c3a6dc8c280c99ff4e1cf0c27a7d) | Behavior test | Support mutation bindings | Upstream-owned test | Direct port | Unit coverage for `409` and mutation handlers |
| 26 | [`893b4020bdd2eff7d21b6c60b773e45005aee8b0`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/893b4020bdd2eff7d21b6c60b773e45005aee8b0) | Merge metadata | Support PR merge | N/A | Skipped | Changes covered by rows 23 and 25 |
| 27 | [`d4379fce25af69e866e9232a3cd036652e7eae17`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/d4379fce25af69e866e9232a3cd036652e7eae17) | Contract / Behavior | Guest campaign attribution | Upstream-owned / Hybrid | Adapted port | Non-consuming slug and unchanged payment logic |
| 28 | [`2ba6fc0f6f743b8648c0d1e708cd123a465ee77f`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/2ba6fc0f6f743b8648c0d1e708cd123a465ee77f) | Accessibility / Presentation | Long ticket message wrapping | Hybrid | Direct port | Browser overflow at 320/375 px |
| 29 | [`cfc2ab2f7fe641570a818d0ca75c9cd9dddbf2b7`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/cfc2ab2f7fe641570a818d0ca75c9cd9dddbf2b7) | Merge metadata | Campaign PR merge | N/A | Skipped | Changes covered by row 27 |
| 30 | [`8e9bb0dc23e2f963673a25a494d58d549327a759`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/8e9bb0dc23e2f963673a25a494d58d549327a759) | Contract test | Campaign storage behavior | Upstream-owned test | Direct port | Stored/expired/non-consuming slug cases |
| 31 | [`eede5ffdfdde9ece9956817c646ade36a9b2ccf6`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/eede5ffdfdde9ece9956817c646ade36a9b2ccf6) | Merge metadata | Ticket wrapping PR merge | N/A | Skipped | Changes covered by rows 28 and 32 |
| 32 | [`714ece82508533b076eeecdb4a503a8600186d63`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/714ece82508533b076eeecdb4a503a8600186d63) | Accessibility test | Ticket message wrapping | Hybrid test | Adapted port | Unit/source contract plus browser overflow |
| 33 | [`cb309ead51dd6031c640927d0accfeb111e9ff63`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/cb309ead51dd6031c640927d0accfeb111e9ff63) | Contract / Behavior | Contact query prefill | Hybrid | Adapted port | URL precedence and storage fallback |
| 34 | [`8d0c33bb08b8f28b19367d1ea612a8455fba0ff1`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/8d0c33bb08b8f28b19367d1ea612a8455fba0ff1) | Merge metadata | Contact PR merge | N/A | Skipped | Changes covered by row 33 |
| 35 | [`acbffa4e17e4549a1068f286e3009b38d30ae6be`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/acbffa4e17e4549a1068f286e3009b38d30ae6be) | Security / Privacy / Behavior | Contact URL cleanup | Upstream-owned / Hybrid | Adapted port | Early cleanup, preserved query/hash, log limitation |
| 36 | [`f81af401f7f6ca1a28806cbf237a33da7449d893`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/f81af401f7f6ca1a28806cbf237a33da7449d893) | Security / Platform | Fresh Telegram initData | Upstream-owned | Adapted port | Bridge/SDK/stale/equal/error and startup order |
| 37 | [`b4e1de6152cfc85418c62e4f840180411989a2a7`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/b4e1de6152cfc85418c62e4f840180411989a2a7) | Contract / Behavior / Platform / Localization / Dependency / Accessibility | GeoCheck feature | Upstream-owned / Hybrid | Adapted port | Source tests and `>=3.3.0` gate; runtime `BLOCKED` on `2.8` |
| 38 | [`28e25a92922501ed609623776e987fcd96f71032`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/28e25a92922501ed609623776e987fcd96f71032) | Behavior / Accessibility / Presentation | Subscription connect footer and device limit | Hybrid / Custom-owned overlay | Adapted port | Existing `ResponsiveOverlay`, device states, Back/focus |
| 39 | [`debe26ae359545fead38bf087b069e9defecec26`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/debe26ae359545fead38bf087b069e9defecec26) | Platform / Accessibility | GeoCheck click isolation and safe areas | Hybrid | Adapted port | No click-through, Escape/Back and focus return; runtime `BLOCKED` |
| 40 | [`5db1ffccf6a6659c06a1fbe5b2b703abd0c609bd`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/5db1ffccf6a6659c06a1fbe5b2b703abd0c609bd) | Platform / Behavior | GeoCheck fullscreen restriction | Hybrid | Adapted port | Fullscreen absent in Telegram; runtime `BLOCKED` |
| 41 | [`5c3031f5f52e4a7bbe101441a97f5e47dd1eff3f`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/5c3031f5f52e4a7bbe101441a97f5e47dd1eff3f) | Behavior / Accessibility | GeoCheck skeleton and zoom reset | Hybrid | Direct port | Image loading and report reset; runtime `BLOCKED` |
| 42 | [`a451a129fe0b211369f336f09f8c8e1abd105173`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/a451a129fe0b211369f336f09f8c8e1abd105173) | Platform / Behavior | GeoCheck download restriction | Hybrid | Adapted port | Download absent in Telegram; runtime `BLOCKED` |
| 43 | [`6474b28cef525083c17631238165cce198c991ca`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/6474b28cef525083c17631238165cce198c991ca) | Merge metadata | Final development merge | N/A | Skipped | Parent changes classified separately |
| 44 | [`8a7ef9ace0fc714dac242b44459ef504d86f1737`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/8a7ef9ace0fc714dac242b44459ef504d86f1737) | Release metadata | Upstream changelog/version | Upstream metadata | Skipped | Custom metadata is updated only after its gate |
| 45 | [`2192484b011068d8cb75c61a6aeaada1d06115aa`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/2192484b011068d8cb75c61a6aeaada1d06115aa) | Merge metadata | Release target merge | N/A | Skipped | Tree contains already classified changes |

## File-Level Conflict Decisions

The reference points are previous Upstream Cabinet `b866bebe...`, target
Upstream Cabinet `2192484b...` and receiving Custom Cabinet `c1ddbf39...`.

| File | Previous upstream behavior | Incoming behavior | Custom Cabinet behavior | Resolution and reason |
| --- | --- | --- | --- | --- |
| `package.json` | No GeoCheck zoom dependency | Zoom dependency and upstream version | Custom scripts, metadata and test tooling | Preserve Custom metadata; add only required zoom dependency |
| `package-lock.json` | No zoom package | Zoom package and upstream root version | Custom dependency graph | Regenerate with npm; never take an entire side |
| `src/api/adminRemnawave.ts` | Existing node contracts | GeoCheck start/result and node IP fields | Custom API type organization | Add contracts without replacing existing node methods |
| `src/api/adminUsers.ts` | Existing list and subscription methods | Expiry sort and force-delete contracts | Custom request guards and exported types | Add query/payload fields while preserving guards |
| `src/api/auth.ts` | Widget and OIDC auth | Deep-link request and poll endpoints | Auth API boundary accepts cancellable requests | Add endpoint methods and pass an abort signal to polling |
| `src/api/client.ts` | Existing Telegram initData source | Fresh SDK/bridge selection | CSRF and blocking-error handling | Replace only initData source; preserve local flow |
| `src/api/landings.ts` | Guest purchase without campaign slug | Optional campaign attribution | Custom purchase response and payment types | Add the optional field without changing payment contracts |
| `src/api/promocodes.ts` | Time, traffic-percent and device bonuses | Additive `traffic_gb` bonus | Custom admin API types | Add the optional field without renaming existing bonuses |
| `src/AppWithNavigator.tsx` | Route-depth Telegram Back handling | GeoCheck adds a same-route history overlay | Global Back handler already owns native Telegram navigation | Recognize the existing `cabinetOverlayParent` state before direct-route fallback |
| `src/components/TelegramLoginButton.tsx` | Widget and OIDC paths | Manual deep-link login and fallback | Custom auth store, campaign capture and canonical buttons | Adapt one guarded polling state machine with cancellation and expiry invalidation |
| `src/components/admin/remnawave/GeoCheckModal.tsx` | No GeoCheck | New custom modal | `ResponsiveOverlay`, history Back and platform closing confirmation | Adapt running-state close guards and internal web fullscreen without `ResponsiveSheet` |
| `src/components/admin/remnawave/GeoCheckReport.tsx` | No GeoCheck report | Image/JSON controls and Telegram restrictions | Canonical buttons and modal-owned fullscreen | Preserve report behavior, minimum targets and platform restrictions |
| `src/components/admin/remnawave/geoCheckJobState.ts` | Poll result handled inline | Completed/failed/pending job states | Local timeout boundary needs deterministic precedence | Extract state resolution so a completed boundary response wins over timeout |
| `src/components/admin/userDetail/SubscriptionTab.tsx` | Existing subscription controls | Delete action | Local null safety and tab UI | Add action contract; delegate paid deletion to destructive dialog |
| `src/components/admin/userDetail/TicketsTab.tsx` | Existing ticket renderer | Long-token wrapping | Sanitizer and callback fixes | Add wrapping only; preserve sanitization |
| `src/components/dashboard/SubscriptionCardActive.tsx` | Separate upstream card flow | Device connect state | Unified active card | Extend current CTA; do not replace the card |
| `src/components/dashboard/SubscriptionCardExpired.tsx` | Incoming footer applies to list cards | Device actions remain available by state | Custom unified expired card | Reuse the local footer state without restoring upstream list presentation |
| `src/components/subscription/DeviceLimitSheet.tsx` | Existing upstream sheet content | Limit warning and management state | Custom overlay owns the container | Keep content reusable and let `ResponsiveOverlay` own dialog/sheet behavior |
| `src/components/subscription/SubscriptionConnectFooter.tsx` | Incoming footer variants | Free/full/unlimited/loading/error actions | Custom cards need one shared footer | Adapt variants to canonical buttons and the unified card boundary |
| `src/components/primitives/ResponsiveOverlay/ResponsiveOverlay.tsx` | Upstream adds `ResponsiveSheet` | GeoCheck needs guarded close/fullscreen states | Canonical Custom dialog/sheet abstraction | Add opt-in close visibility and fullscreen; preserve defaults for all other overlays |
| `src/components/ui/hover-border-gradient.tsx` | No incoming change | New device CTA reuses the gradient wrapper | Interactive use must render the canonical `Button` | Preserve content-sized CTA layout while adding button semantics and haptics |
| `src/hooks/useTelegramSDK.ts` | Reads cached SDK initData | Selects freshest SDK/bridge value | Existing fullscreen and platform helpers | Replace only initData selection and preserve the hook API |
| `src/locales/en.json` | Existing English catalogue | 52 functional keys | Custom copy and keys | Key-wise merge only |
| `src/locales/fa.json` | Existing Persian catalogue | 52 functional keys | Custom RTL copy | Key-wise merge and RTL smoke |
| `src/locales/ru.json` | Existing Russian catalogue | 52 functional keys | Custom product copy | Key-wise merge only |
| `src/locales/zh.json` | Existing Chinese catalogue | 52 functional keys | Custom UI keys | Key-wise merge, including corrected sort label |
| `src/main.tsx` | Existing bootstrap initData | Fresh initData source and early contact capture | Polyfill, root guard and startup order | Preserve bootstrap; add shared initData and contact cleanup before requests |
| `src/pages/AdminPromocodeCreate.tsx` | Existing bonus form | Traffic bonus input and payload | Local numeric parsing and ARIA errors | Add traffic state/payload while preserving parsing |
| `src/pages/AdminPromocodes.tsx` | Existing promo table/cards | Traffic bonus display | Custom responsive presentation | Add the value without replacing the current table/cards |
| `src/pages/AdminRemnawave.tsx` | Existing node administration | GeoCheck action and modal | Custom node cards and metrics | Add version/RBAC-gated action with canonical `ResponsiveOverlay` |
| `src/pages/AdminTickets.tsx` | Existing ticket renderer | Long-token wrapping | Null safety and sanitizer | Add wrapping only |
| `src/pages/AdminUserDetail.tsx` | Existing subscription administration | Delete handler with automatic force upstream | Query guards and local layout | Ordinary delete never forces; paid delete requires a separate destructive dialog |
| `src/pages/AdminUsers.tsx` | Existing filters and pagination | Subscription-expiry sort | Custom responsive controls | Add the option and reset pagination when sorting changes |
| `src/pages/Dashboard.tsx` | Unified Dashboard | Per-subscription device actions | Compatibility URLs and overlay state | Adapt state machine; preserve navigation and existing overlay |
| `src/pages/QuickPurchase.tsx` | Existing guest payment flow | Contact/campaign fields | Payment logic and Custom presentation | Add helpers/payload; preserve amount, method and redirect |
| `src/pages/Support.tsx` | Existing support flow | Mutation errors and wrapping | Deep links, attachments and sanitizer | Add errors/wrapping without replacing current flow |
| `src/store/auth.ts` | Existing widget/OIDC token storage | Deep-link auth response | Store owns session persistence and profile refresh | Add one store action so all auth paths retain the same post-login behavior |
| `src/utils/adminSubscriptionDeletion.ts` | Upstream force decision was inline | Trial and paid deletion rules | Custom confirmation flow needs explicit policy | Centralize payload selection and require destructive confirmation before `force=true` |
| `src/utils/contactPrefill.ts` | No contact prefill | Capture, cleanup and storage fallback | Privacy requires operation when storage is blocked | Keep one transient value until the active purchase consumes it |
| `src/utils/promocodeForm.ts` | Traffic parsing lived in form state | `traffic_gb` validation | Custom form supports mixed bonus types | Centralize value-derived validation and payload inclusion |

### Complete Upstream File Decision Ledger

This ledger covers every file in the exact 53-file upstream compare. `Port`
means the incoming behavior is retained directly in the same local boundary;
`Adapt` means the behavior is retained through Custom Cabinet structure; `Skip`
means only the incoming presentation module is omitted and names its local
replacement.

| # | Upstream file | Decision | Local result or reason |
| ---: | --- | --- | --- |
| 1 | `CHANGELOG.md` | Adapt | Record the Custom Cabinet `1.66.0` integration without copying upstream branding |
| 2 | `package-lock.json` | Adapt | Regenerate the local lock graph with only `react-zoom-pan-pinch@4.0.4` added |
| 3 | `package.json` | Adapt | Preserve local scripts/metadata; update version and add the exact dependency |
| 4 | `src/api/adminRemnawave.ts` | Adapt | Add GeoCheck and node IP contracts to the existing admin API module |
| 5 | `src/api/adminUsers.ts` | Adapt | Add sort/delete contracts while preserving local query guards |
| 6 | `src/api/client.ts` | Adapt | Use freshest Telegram initData without replacing CSRF/error handling |
| 7 | `src/api/landings.ts` | Adapt | Add optional `campaign_slug` to the existing purchase contract |
| 8 | `src/api/promocodes.ts` | Port | Add optional `traffic_gb` to the existing promocode contract |
| 9 | `src/components/TelegramLoginButton.tsx` | Adapt | Add manual deep-link auth, fallback and one guarded polling state machine |
| 10 | `src/components/admin/remnawave/GeoCheckImageViewer.tsx` | Adapt | Use canonical controls, 44 px targets and a localized image-error state |
| 11 | `src/components/admin/remnawave/GeoCheckModal.tsx` | Adapt | Use `ResponsiveOverlay`, Custom platform guards and controller-owned node mapping |
| 12 | `src/components/admin/remnawave/GeoCheckReport.tsx` | Adapt | Preserve report/JSON behavior with canonical buttons and Telegram restrictions |
| 13 | `src/components/admin/remnawave/GeoCheckSetup.tsx` | Adapt | Keep route behavior while accepting normalized suggestions instead of `NodeInfo` |
| 14 | `src/components/admin/remnawave/geoCheckRoute.test.ts` | Port | Retain route request and validation coverage, including strict IPv4/IPv6 cases |
| 15 | `src/components/admin/remnawave/geoCheckRoute.ts` | Adapt | Retain request mapping and strengthen IP/interface validation |
| 16 | `src/components/admin/remnawave/useGeoCheckJob.ts` | Adapt | Retain polling with an explicit 180-second timeout and state tests |
| 17 | `src/components/admin/userDetail/SubscriptionTab.tsx` | Adapt | Add delete entry point while preserving the local tab and permission boundary |
| 18 | `src/components/admin/userDetail/TicketsTab.tsx` | Port | Add long-token wrapping without changing sanitization |
| 19 | `src/components/dashboard/ConnectDeviceTile.tsx` | Skip | Local unified cards use `SubscriptionConnectFooter` instead of a separate tile |
| 20 | `src/components/dashboard/SubscriptionCardActive.tsx` | Adapt | Integrate per-subscription device state into the unified active card |
| 21 | `src/components/icons/extended-icons.tsx` | Port | Add the required GeoCheck/device icons to the existing icon boundary |
| 22 | `src/components/subscription/DeviceLimitSheet.tsx` | Adapt | Reuse the existing device-management overlay content and add the limit warning |
| 23 | `src/components/subscription/SubscriptionConnectFooter.tsx` | Adapt | Implement the stateful footer for local active/expired card variants |
| 24 | `src/components/subscription/SubscriptionListCard.tsx` | Skip | Local Dashboard has no list card; behavior lives in active/expired cards and footer state |
| 25 | `src/components/subscription/connectFooterState.test.ts` | Adapt | Cover local free/full/unlimited/loading/error/limited mappings |
| 26 | `src/components/subscription/connectFooterState.ts` | Adapt | Map existing subscription/device data into the local footer states |
| 27 | `src/components/ui/ResponsiveSheet.tsx` | Skip | Canonical `ResponsiveOverlay` already owns dialog/sheet, Back and focus behavior |
| 28 | `src/hooks/useTelegramSDK.ts` | Adapt | Select fresh initData while preserving local fullscreen/platform helpers |
| 29 | `src/locales/en.json` | Adapt | Merge functional keys and Custom destructive-delete/image-error copy |
| 30 | `src/locales/fa.json` | Adapt | Merge the same keys with Persian translation and RTL preservation |
| 31 | `src/locales/ru.json` | Adapt | Merge the same keys with Custom Russian product copy |
| 32 | `src/locales/zh.json` | Adapt | Merge the same keys, including the corrected sort label |
| 33 | `src/main.tsx` | Adapt | Preserve bootstrap/polyfills; capture contact early and select fresh initData |
| 34 | `src/pages/AdminPromocodeCreate.tsx` | Adapt | Add traffic-only/mixed bonuses to local parsing, validation and ARIA errors |
| 35 | `src/pages/AdminPromocodes.tsx` | Adapt | Display traffic bonuses while preserving the existing table/cards |
| 36 | `src/pages/AdminRemnawave.tsx` | Adapt | Add version/RBAC-gated GeoCheck to current node cards and metrics layout |
| 37 | `src/pages/AdminTickets.tsx` | Port | Add long-token wrapping only |
| 38 | `src/pages/AdminUserDetail.tsx` | Adapt | Add trial delete and separate paid destructive confirmation with cache guards |
| 39 | `src/pages/AdminUsers.tsx` | Port | Add the subscription-expiry sort option to the current filter UI |
| 40 | `src/pages/Dashboard.tsx` | Adapt | Add device query/actions without changing unified navigation or compatibility URLs |
| 41 | `src/pages/QuickPurchase.tsx` | Adapt | Add contact/campaign attribution and cleanup for document and SPA navigation |
| 42 | `src/pages/Support.tsx` | Adapt | Surface safe backend errors while preserving attachments, deep links and sanitizer |
| 43 | `src/utils/campaign.test.ts` | Port | Retain stored, expired and non-consuming campaign cases |
| 44 | `src/utils/contactPrefill.test.ts` | Adapt | Cover capture, storage fallback, query/hash preservation and bootstrap ordering |
| 45 | `src/utils/contactPrefill.ts` | Adapt | Capture before requests and retain a transient fallback when storage is blocked |
| 46 | `src/utils/nodeVersion.test.ts` | Port | Retain semantic `3.3.0+` version-gate cases |
| 47 | `src/utils/nodeVersion.ts` | Port | Retain numeric node-version comparison |
| 48 | `src/utils/telegramInitData.test.ts` | Adapt | Cover bridge/SDK freshness, malformed and equal candidates in local Vitest style |
| 49 | `src/utils/telegramInitData.ts` | Port | Select the valid candidate with the newest `auth_date` |
| 50 | `src/utils/ticketErrors.test.ts` | Adapt | Cover safe backend detail extraction and conflict handling |
| 51 | `src/utils/ticketErrors.ts` | Adapt | Normalize support errors without logging payloads or personal data |
| 52 | `src/utils/ticketMessageWrap.test.ts` | Adapt | Verify all three local ticket renderers retain long-token wrapping |
| 53 | `src/vite-env.d.ts` | Port | Add the Telegram bridge types needed by fresh initData selection |

## Contract Changes

- API: `sort_by=subscription_end_date`; subscription DELETE with optional
  `force=true`; `traffic_gb`; optional `campaign_slug`; GeoCheck POST and GET.
- Types: additive admin sort, promocode traffic, GeoCheck job/report and node IP
  fields.
- Routes: no new browser path; `/buy/:slug` accepts and removes `?contact=`.
- Storage: no new persistent key; campaign slug is read without consuming it.
- Cache: GeoCheck uses `['admin-remnawave-geocheck', jobId]` with no retention.
- Permissions: existing `users:subscription`, `remnawave:manage` and
  `remnawave:read` boundaries remain authoritative.
- WebSocket: no changes.
- Telegram: existing `webauth_{token}` format remains unchanged; initData source
  selection and platform restrictions change.
- Payment: amounts, currency, methods and redirect remain unchanged; guest
  attribution and subscription/autopay deletion context change.
- Runtime: intended Upstream Bot is exact `v4.1.0`; GeoCheck additionally needs
  Remnawave panel and nodes `3.3.0+`.

## Security Review

- Read the freshest Telegram initData from the SDK cache and official bridge,
  while preserving current health, token and stale-session behavior.
- Capture and remove `contact` before client analytics and subsequent requests.
  The initial document request can still be present in proxy/access logs.
- Keep GeoCheck SVG in an image context, validate IP/interface input and enforce
  existing permissions.
- Never send `force=true` from the ordinary delete confirmation. Active paid
  deletion requires a separate destructive confirmation naming the subscription
  and warning that related autopay is cancelled.

## Presentation Adaptation

- Keep the unified Dashboard, four-item navigation and compatibility routes.
- Use `src/components/primitives/ResponsiveOverlay/ResponsiveOverlay.tsx` for
  new device and GeoCheck overlays. Do not import upstream `ResponsiveSheet`.
- Preserve local admin node cards, subscription cards, payment presentation and
  ticket sanitization while adding the incoming behavior and states.
- Preserve focus trap, Escape/Back handling, focus return, minimum touch targets,
  no nested buttons and long-token wrapping.

## Localization Review

| Locale | Added keys | Changed keys | Removed keys retained | Verification |
| --- | --- | --- | --- | --- |
| `ru` | 52 upstream functional paths plus local destructive-delete copy | None | All existing keys | `locales.test.ts` and browser RU smoke passed |
| `en` | 52 upstream functional paths plus local destructive-delete copy | None | All existing keys | `locales.test.ts` and browser EN smoke passed |
| `fa` | 52 upstream functional paths plus local destructive-delete copy | None | All existing keys | Key parity and Persian RTL browser smoke passed |
| `zh` | 52 upstream functional paths plus local destructive-delete copy | None | All existing keys | Key parity passed |

## Dependency Review

| Package | Previous | Target | Upstream reason | Custom Cabinet action |
| --- | --- | --- | --- | --- |
| `react-zoom-pan-pinch` | Absent | `4.0.4` | GeoCheck report zoom/pan/pinch | Add exact lock result without changing unrelated dependencies |

The lockfile was regenerated through npm and verified by a clean `npm ci`.
Production build transformed 2,857 modules; the lazy AdminRemnawave chunk is
90.00 kB (25.35 kB gzip), and no unrelated dependency version was changed.

## Verification Results

| Gate | Result | Evidence or limitation |
| --- | --- | --- |
| `npm ci` | `PASS` | 456 packages installed; npm reported 5 unresolved high-severity audit findings |
| `npm test` | `PASS` | 37 files and 281 tests passed |
| `npm run type-check` | `PASS` | TypeScript completed without errors |
| `npm run build` | `PASS` | Vite production build completed; build output remains ignored |
| `npm run check` | `PASS` | Biome checked 584 files without changes |
| Browser smoke | `PASS` (mocked committed source) | 257 Playwright tests passed and 6 were intentionally skipped across 320, 375, 768, 1024 and 1280 px projects; GeoCheck reload/Telegram Back passed 40 repeated runs and Close/Forward restoration passed 20; Login and GeoCheck passed 200% zoom smoke with no horizontal overflow or console errors at desktop 1280x800-equivalent reflow and mobile 375x812 pinch zoom |
| Telegram smoke | `PASS` (mocked source UI) / `BLOCKED` (real clients) | Manual login, fallback, cancellation and platform guards passed; Android/iOS evidence is still required |
| Theme and locale smoke | `PASS` (automated) | Dark/light/operator palette, Russian, English and Persian RTL scenarios passed |
| Accessibility smoke | `PARTIAL` | Automated focus return, Back/Escape, names, wrapping and 44 px GeoCheck controls passed; 200% desktop reflow and mobile pinch zoom passed; a physical screen reader was not run |
| GeoCheck runtime | `BLOCKED` | Current panel and nodes are `2.8`; requires `3.3.0+` |
| Upstream Bot source gate | `PASS` | Exact `v4.1.0` SHA `49b05d5ab79dd9bb92f0404bb0066cda8a175649`: 3,302 tests passed and 3 were intentionally skipped on Python 3.13.15 |
| Installer lifecycle | `PASS` | Full disposable Ubuntu 24.04 lifecycle and final postflight passed on exact Installer SHA `8d5feb922958f6d3deed0f837060059d1919b356`; this proof was repeated because the protected Bot identity changed |
| Candidate artifact | `PASS` | Exact Cabinet commit `bbd56ee8f8ec4533e1bd5eeb692249345672190c` built twice with pinned Node/Nginx images; archives were byte-identical at SHA-256 `94f974dc4293cfdc99b73a4803a5c90b7351c60d9287e13d5230897aa82292a5` |
| Protected Update and migration | `PASS` | Public Bundle `v2026.08.18` (`v4.0.0`, DB `0104`) updated to the candidate; injected post-migration failure restored the dump, old exact SHAs and health, then a clean retry committed `v4.1.0` with DB `0106` |
| Candidate runtime smoke | `PASS` (route availability) / `BLOCKED` (authenticated account matrix) | Exact Bot/Cabinet checkouts, doctor, frontend and branding returned healthy/HTTP `200`; unauthenticated sort, subscription delete, promocode, Telegram auth and GeoCheck probes returned expected auth/validation responses rather than `404/405/500`; account mutations were not attempted |
| Candidate final postflight | `PASS` | Candidate project, Caddy snippet and private env were absent; 0 candidate containers and 0 candidate volumes remained; Installer management launcher stayed executable with its lifecycle receipt at mode `600` |

## Provenance and Compatibility Completion

- [x] `UPSTREAM.md` promotes the target exact tag and SHA after the compatibility runtime gate.
- [x] `COMPATIBILITY.md` records the exact verified candidate combination and its remaining release blockers.
- [x] Every incoming commit is classified.
- [x] Every skipped change has a reason.
- [x] No upstream license, copyright or technical attribution was removed.
- [x] No build output, environment file, screenshot or agent data is included.
- [x] The integrated source is committed before Release Bundle construction.
- [ ] A changed release uses a new immutable tag.

## Residual Risks and Rollback

- GeoCheck source can be integrated and hidden below `3.3.0`, but its runtime
  behavior cannot be accepted on the current Remnawave `2.8` deployment.
- Upstream Bot `v4.1.0` source, `0104 → 0106` migration, verified rollback and
  candidate runtime compatibility passed on the disposable integration VPS.
- Android/iOS Telegram evidence is unavailable.
- Physical screen-reader evidence is unavailable.
- On `2026-08-24`, the owner explicitly instructed publication without the
  remaining manual checks and accepted these evidence gaps. This is a release
  decision, not a technical `PASS` for the skipped scenarios.
- `npm ci` reports five high-severity dependency audit findings; no broad or
  breaking `npm audit fix` was applied during synchronization.
- The last rollback Release Bundle remains `v2026.08.18` with Installer
  `8d5feb922958f6d3deed0f837060059d1919b356`, Upstream Bot `v4.0.0` at
  `f553d1896dcd347fd74012f6394fd2277161bdd1`, and Custom Cabinet
  `cabinet-v2026.08.22.2` at `23c9889f6ab1ad514faf36ad9cbf66dc5407ad44`.

## Final Outcome

`Source integration and the automated gate passed on exact source commit
653e26238105c8394c6abc271b6da836de5fa974. Exact Upstream Bot v4.1.0 source,
migration, rollback and candidate runtime compatibility also passed. The full
Local Gate remains PARTIAL because physical screen-reader, real Telegram clients
and GeoCheck on Remnawave 3.3.0+ were not run. The owner explicitly waived those
manual release blockers and authorized immutable tags and public Release Bundle
`v2026.08.19`; production rollout remains separate and unproven.`
