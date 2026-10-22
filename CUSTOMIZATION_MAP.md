# Custom Cabinet Ownership Map

## Dashboard-style subscription identity — 2026-10-22

- `subscription/SubscriptionIdentityBadges` is the shared read-only heading for
  SubscriptionOverviewCard and RenewalSubscriptionInfo. Typography/badge geometry
  match the unchanged Dashboard reference; light/dark colors use the normal
  conditions surface tokens. Full tariff text and semantic h2 remain available.
- The existing overview status precedence is preserved. Active trial has one
  gift badge; expired/disabled/limited/paused states remain explicit. Route pages
  retain all data, eligibility, prices and actions; the heading makes no requests.
- The management skeleton follows the badges; renewal's existing read-only
  conditions preview reuses the updated real view. Motion stays unchanged.
- Owner cancelled group-banner addition/reordering; its placement is preserved.
  [Local verification](docs/subscription-identity-badges-20261022.md):1161unit,
  build/types/Biome and470compiled browser cases PASS;16card captures.

## Mobile action density — 2026-10-22

- Owner approved packages A/B: below640px embedded management opts into compact
  action presentation; sm and larger preserve existing dimensions. No foundation
  Card/Button/Switch defaults, global CSS, colors or animation contracts changed.
- `PurchaseCTAPresentation` owns the read-only geometry shared by the actual CTA
  and `SubscriptionPurchaseSkeleton`. Applicable captions reserve wrapping space
  while sales_mode is unknown; link/route/readiness remain in PurchaseCTAButton.
- `sheets/subscriptionActionStyles` shares only trigger/form classes. Existing
  device/traffic/reduction components retain their queries, guards and mutations.
  Open traffic form density also applies to its existing Dashboard consumer.
- `SubscriptionAutopayToggle` separates a mobile52×44 hit area from its unchanged
  52×28 track. Subscription owns the same mutation; embedded Card padding is local.
  DeviceLimitPanel locally raises its mobile add-slots target to44px.
- [Exact local proof](docs/mobile-interface-density-20261022.md):1161 unit,
  479compiled browser/17configured skips, build/types/Biome PASS;16measurements
  and9captures. No new financial or backend acceptance scope.

## Permanently visible additional options — 2026-10-21

- Owner requested removal of the collapse interaction. `Subscription` renders a
  static h2 and the existing actions, preserving subscription/feature guards and
  explicit individual form/confirmation state. Success closes forms, not the section.
- The existing `initiallyOpenAdditionalOptions` prop/section URL now requests scroll
  to an always-visible section. Its cancellable frame scheduling runs after route
  scroll restoration/closing-overlay focus. API contracts stay unchanged.
- Management skeleton reserves the expanded action structure with existing primitives.
  Balance-autopay remains below; provider UI no longer depends on collapse state.
- [Local proof](.scratch/additional-options-20261021/IMPLEMENTATION_REPORT.md):1161
  unit,313 compiled browser/5 configured skips,4 visual cases, build/types/Biome PASS.

## Context-aware discount actions — 2026-10-21

- `discountAction` owns readonly destination policy; `canRenewSubscription` is shared
  with the existing PurchaseCTAButton guard. Dashboard supplies explicit selection,
  owned records and full-subscription readiness instead of treating its first-record
  fallback as a user's explicit choice.
- `useDiscountAction` owns fresh GET/ownership/selection/account checks and pending/
  retry before navigation. It performs no purchase mutation. PromoOffersSection
  retains claim and source-specific deactivation, composing presentation from
  `components/promo/ActiveDiscountBanner` and `offerPresentation`.
- `promoExpiry` owns UTC deadline checks; `usePromoAvailability` owns the mounted
  clock and one readonly refresh per expired benefit/account/deadline. `useNow` keeps
  its existing default behavior with optional timer enable/cleanup.
- `invalidatePromoState` marks existing discount/group/subscription/quote caches
  stale after benefit changes. `usePromoDiscount` filters expired account discounts;
  existing group prices/rounding and authoritative flow-specific quotes remain.
- Group-link subtitles and unknown-effect copy are neutral in all four locales.
  [Exact local proof](docs/discount-banners-implementation-20261021.md):1161 unit,
  821 browser/5 configured skips,32 capture cases, build/both TypeScript/Biome PASS.
  The pending proposal wording in the dated audit section below is historical.

## Management order and discount audit — 2026-10-20

- `SubscriptionPage` intentionally has no visible web back control beside H1;
  existing history/source metadata, devices close and native Back remain owned
  by the page/router. Tests use browser Back for leaving management.
- `SubscriptionAutopayToggle` extracts the existing display-only balance toggle;
  `Subscription` still owns its mutation and `showsAutopayToggle` guard. Embedded
  management places its Card after Additional options. Standalone composes the
  same toggle in its existing settings; empty embedded settings chrome is omitted.
  `SubscriptionManagementSkeleton` follows the new section order.
- Discount handlers were audited, not modified. The proposed state-aware Use now
  resolver/expiry/cache changes remain pending owner acceptance:
  [audit](docs/discount-banners-audit-20261020.md).
  Current UI proof:1139 unit/147 focused browser/build/both TypeScript/Biome PASS.

## Renewal and purchase loading — 2026-10-20

- `usePurchaseContext` owns the existing display-only group query and banner
  readiness. Query URL/key/30s cache stay the same; optional metadata has no retry
  so its error fails open instead of holding the layout. Inline tariff groups
  avoid that query; paid-classic/invalid/unsupported contexts retain their guards.
- `PurchaseContextBanners` is now pure presentation of the resolved context.
  Both route pages retain real headers during loading and use `SubscriptionFlowSkeleton`.
- `PeriodOptionsSkeleton` reuses `PeriodCardContent`'s opt-in loading rendering,
  typography and responsive period-grid density. No selectable prices or actions
  are manufactured. The catalogue skeleton follows its own card structure;
  unknown sales mode/count remains a neutral placeholder until API data arrives.
- `SubscriptionFlowSkeleton` only accepts read-only conditions as geometry preview:
  invisible/aria-hidden template plus canonical Skeleton. Financial actions must
  not be added to that preview. Actual mutations remain in route/form owners.
- [Latest exact proof](.scratch/purchase-loading-20261020/IMPLEMENTATION_REPORT.md):
  344 browser and65 focused unit/build/both TypeScript/Biome PASS; aggregate unit
  retains2 admin audience failures, NOT_PASS.

## Management loading seams — 2026-10-20

- `SubscriptionManagementSkeleton` owns the embedded management loading shape,
  without the heading already owned by `SubscriptionPage`. It reuses Card,
  Skeleton/SkeletonGroup and the same256px minimum as `SubscriptionOverviewCard`.
- `PurchaseCTAButton` accepts opt-in `loading`/`reserveSpace` presentation props.
  Loading exposes a status skeleton rather than a live link; the existing daily
  multi-tariff visibility rule still applies first. Management opts into96/80px
  reserved action height on the painted HoverBorderGradient, not on an oversized
  invisible Link. Its child fills the surface; the following devices gap stays16px.
  Route/price decisions retain their existing owners.
- `Subscription` keeps its query gates and exposes pending devices as a subtitle
  skeleton, reserving unavailable text for a completed missing/error result.
  Standalone legacy page loading keeps its existing PageSkeleton.
- [Exact loading proof](.scratch/subscription-loading-20261020/IMPLEMENTATION_REPORT.md):
  80 focused unit/239 focused browser/build/both TypeScript/Biome PASS; aggregate
  unit1129 PASS/2 existing admin audience FAIL, NOT_PASS.

## Compact management overview — 2026-10-20

- Owner explicitly approved a compact overview above the existing management CTA.
  `SubscriptionOverviewCard` owns plan/status presentation, reusing Card, existing
  badge variants, `planTitle` and date formatting. `Subscription` supplies its
  already-loaded subscription only in embedded management, without a new query.
- `SubscriptionConditions` owns the shared read-only date/traffic/device/server
  layout. `RenewalSubscriptionInfo` composes it with the existing device guidance;
  management composes it with title/status and requests flag-only server display.
  Existing `getFlagEmoji` uses API country codes, falling back to the server name;
  native tooltips retain names. Financial logic and API clients remain unchanged.
- [ADR 0004](docs/adr/0004-subscription-management-page.md) records this follow-up
  after the earlier compact correction. Current proof:54 focused unit and97 focused
  browser PASS, build/both TypeScript/Biome PASS. Aggregate unit/browser retain
  unrelated test timeouts and are NOT_PASS; exact scope is in
  [the report](.scratch/subscription-overview-20261020/IMPLEMENTATION_REPORT.md).

## Renewal structure and funding notices — 2026-10-20

- Shared `PeriodCardContent` uses existing `text-success-400` for monthly-price
  captions in renewal, classic purchase and tariff purchase. Sub-month period-only
  captions retain neutral text. Callers retain all price calculations.
  [Latest color proof: 1116 unit, 90 compact-period browser PASS](.scratch/renewal-structure-20261020/MONTHLY_PRICE_COLOR.md).
- `utils/renewalDeviceGuidance` selects display-only active/expired/known-maximum
  device guidance; `RenewalSubscriptionInfo` renders it with the existing
  `FundingNotice` accent wash, border and InfoIcon. Owner refinement removes the
  repeated sentence about retaining the device count in RU/EN/FA/ZH. Its traffic
  label reuses Dashboard's `ChartIcon`. The route supplies the optional classic device maximum
  from existing purchase options; no device-price request or pricing rule is added.
  Trial/daily/tariff-selection-required/unlimited/unsupported inactive states omit
  this paragraph; traffic-limited subscriptions are not treated as expired.
  [Latest proof: 1116 unit, 92 browser, 14 visual PASS](.scratch/renewal-structure-20261020/DEVICE_GUIDANCE.md).
- `RenewalSummary` keeps an ordinary `space-y-4` container around the period
  heading/grid and the independent summary Card; the former outer Card and its
  border/padding are intentionally removed. Period controls and payment contracts
  remain owned by their existing components.
- `RenewalSubscriptionInfo` composes the shared `SubscriptionConditions` and
  renewal-specific guidance; `RenewalOptions` owns the period-heading hint.
  Both reuse existing Card, tokens and utility classes.
  The traffic/device insets use existing `bg-accent-500/10`, matching the secondary
  accent wash in FundingNotice. Owner refinement supersedes the intermediate
  gray `bg-dark-700/50`; the original `bg-dark-800/50` was barely visible.
- `RenewalSummary` owns the selected-term/server-price hierarchy, balance,
  shortfall display and existing payment CTA. `RenewSubscription` remains the
  API/mutation owner; `utils/renewalPreview` supplies a display-only expected end
  date, never a payment amount or authoritative subscription state.
- `FundingNotice` owns the shared informational Card and optional action slot.
  `PurchaseFundingNotice`, `InsufficientBalancePrompt` and `GiftSubscription`
  supply existing messages/actions and retain return paths and amount handling.
  Reuse covers classic/tariff/daily purchase and applicable renewal, devices,
  traffic, tariff change, servers, daily resume and gifts. API errors retain their
  error presentation rather than becoming informational notes.
- RU/EN/FA/ZH keys belong to the existing localization system. No global styles,
  alternate design system, dependency changes or backend changes are introduced.
- Initial local proof before the inset-background correction: 1102 unit PASS; build/both TypeScript PASS; affected compiled
  browser 320 PASS/5 configured SKIP, plus four final visual captures.
  [Exact identities and evidence](.scratch/renewal-structure-20261020/IMPLEMENTATION_REPORT.md).
  [Later background correction](.scratch/renewal-structure-20261020/BACKGROUND_FIX.md):
  build/both TypeScript PASS, 80 renewal browser and 10 visual PASS; full unit
  1100 PASS/2 FAIL in the unchanged admin audience test file, not a full unit PASS.
  Subsequent accent-wash refinement: 1102 unit PASS, build/both TypeScript PASS,
  80 renewal browser and 10 visual PASS on the new exact artifact; see the
  report's `accent-follow-up` section for its identities.

## Subscription page seams — 2026-10-20

- `SubscriptionPage` owns normal-page header/back context and the temporary
  devices overlay. Existing `Subscription` keeps subscription API/settings/actions;
  it is no longer mounted as Dashboard's primary management overlay.
- `Subscriptions` is the normal list route, with explicit loading/error handling
  and ID-preserving entry into management. Existing Card/Back primitives remain.
- `useSubscriptionNavigation` resolves the single shared contextual menu slot;
  `mobileNavRoutes` supplies matching active-state and four-item navigation rules.
- `SubscriptionPurchase` and `ClassicPurchaseWizard` guard paid classic contexts;
  existing renewal remains the API owner for renewal with current device limits.
- `useDevicePurchase` owns fresh quote/balance/subscription checks and explicit
  confirmation. `deviceIntent` persists user/subscription-scoped intent only;
  `DeviceTopupSheet` retains the existing presentation and server quote display.
- `topUpReturnPath` separates the existing payment-result destination from closing
  a prepared subscription payment into its normal management page.
- [ADR 0004](docs/adr/0004-subscription-management-page.md) records the narrow
  presentation change. No second pricing engine, backend patch, global style
  system or parallel Simple/Lite presentation is introduced.

## v1.80.1 Integrated Feature Seams

- `src/components/broadcasts/audience*`, `AudienceConditionRow`,
  `AudienceUserLookup`, `AudienceRecipientsPreview`, `BroadcastAudienceEditor`:
  upstream audience contracts with Custom controls, ResponsiveOverlay and
  permission-aware display; no duplicated backend audience calculation.
- `src/hooks/useCasheraRecurring`, `CasheraRecurringPanel`,
  `CasheraPurchaseAction`: the new provider inside existing subscription
  management/purchase paths. Existing Dashboard, price and return contracts
  remain Custom-owned.
- `src/config/cabinetFeatureVisibility`: display-only exclusion policy for
  settings and permission definitions; authorization data stays untouched.
- `PurchaseCTAButton` preserves the owner's Classic hint and renewal routing.
  Active/expired captions now match subscription status; legacy migration
  does not receive the expired renewal hint.
- Historical v1.80.1 `RenewalSummary` used one outer canonical Card. The owner's
  2026-10-20 refinement removes that outer wrapper, retaining the independent
  summary Card and natural-flow period grid; see the current seams above.
- Existing owner regression requirements remain covered; corrected fixtures,
  exact price formatting assertions and stable geometry/transition checks are
  recorded in [the integration report](UPSTREAM_V1.80.1_SYNC_REPORT.md).

This map identifies which areas should stay close to Upstream Cabinet and which
areas are expected to carry Custom Cabinet design and branding. It is a review
guide, not permission to skip a file-level diff.

Update this map whenever a redesign or upstream synchronization changes an
ownership boundary.

## Ownership Classes

| Class | Meaning | Synchronization rule |
| --- | --- | --- |
| Upstream-owned | Behavior and contracts should track Upstream Cabinet closely | Port incoming behavior first; keep local changes minimal |
| Custom-owned | Custom Cabinet intentionally owns the implementation | Preserve locally and extend its contract for incoming behavior |
| Hybrid | Upstream behavior and Custom Cabinet presentation coexist | Always perform a three-way, concern-by-concern review |

## Upstream-Owned Areas

These paths are upstream-sensitive by default:

| Area | Paths | Required review focus |
| --- | --- | --- |
| API contracts | `src/api/` | Endpoints, payloads, errors, authentication, query behavior |
| Domain and transport types | `src/types/` | Added fields, enums, optionality, compatibility |
| State | `src/store/` | Persistence, authentication, permissions, blocking states |
| Safe browser storage | `src/utils/safeStorage.ts`, storage call sites in stores/pages/hooks | Denied/quota behavior, persistence truth, reload boundaries |
| Platform integration | `src/platform/`, `src/hooks/useTelegramSDK.ts` | Telegram/web capability and back/viewport behavior |
| Routing bootstrap | `src/App.tsx`, `src/AppWithNavigator.tsx`, `src/main.tsx` | Routes, callbacks, deep links, providers, startup ordering |
| Functional utilities | `src/utils/` | Security, validation, URL handling, pricing and formatting |
| Feature/config constants | `src/config/`, `src/constants/` | Storage keys, timeouts, feature behavior |
| Localization data | `src/i18n.ts`, `src/locales/` | Keys, interpolation, enabled locale behavior, RTL |
| Runtime/deployment | `Dockerfile`, `docker-compose.yml`, `nginx.conf`, `vite.config.ts` | Health, base path, proxy, chunks, runtime compatibility |

Local accessibility or reliability fixes in these paths remain valid Custom
Cabinet changes, but they must be documented if they diverge from Upstream
Cabinet.

## Custom-Owned Areas

These areas are intended Custom Cabinet ownership after redesign:

| Area | Current or planned paths | Ownership intent |
| --- | --- | --- |
| Design foundations | `tailwind.config.js`, token sections of `src/styles/globals.css` | Semantic colors, type, spacing, radius, elevation and motion |
| Canonical primitives | `src/components/primitives/` | Accessible interaction contracts and variants |
| Responsive overlays | `src/components/primitives/ResponsiveOverlay/` | Canonical desktop Dialog and mobile/Telegram Sheet composition |
| Display foundations | `src/components/data-display/`, selected `src/components/ui/` | Card, stat and reusable display patterns |
| Shared motion | `src/components/motion/` | Reduced-motion-aware durations and transitions |
| Layout presentation | `src/components/layout/` | User and admin shell presentation |
| Profile presentation | `src/components/profile/` | Progressive-disclosure sections for preferences, information and enabled features |
| Information presentation | `src/components/info/InfoNavigation.tsx` | Mobile section list reuses Profile `HubLink` and canonical Card; desktop tabs remain available |
| Branding presentation | `src/components/DocumentBranding.tsx`, `src/hooks/useBranding.ts`, `src/hooks/useDocumentBranding.ts`, `src/utils/documentBranding.ts`, `vite-plugins/` | One owner for title/favicon/monogram and Custom Cabinet public identity while preserving API provenance |
| Background presentation | `src/components/backgrounds/` | Optional brand effects with mobile performance limits |
| Browser acceptance harness | `tests/e2e/`, `playwright.config.ts` | Custom responsive, Telegram, storage and branding behavior across the supported viewport matrix |
| Design documentation | `DESIGN_UX_UI_AUDIT.md`, `REDESIGN_RULES.md` | Custom Cabinet design decisions and acceptance rules |

Some listed files currently contain upstream-derived code. Custom-owned means
future intentional ownership, not removal of upstream copyright or provenance.

## Hybrid Areas

All route pages under `src/pages/` are hybrid unless explicitly reclassified.
They commonly combine React Query, mutations, navigation, permissions,
translations and page-specific JSX.

`Info.tsx` retains document queries, visibility, administrator replacements,
sanitization and accordion content. Mobile section selection uses router history
state `infoSection` on the unchanged `/info` URL; `InfoNavigation` owns only the
responsive presentation and focus return. `profile/HubLink` is shared with Profile
without changing its existing link appearance or destinations.

Profile subsection exit presentation reuses `WebBackButton` from renewal. Route
pages keep API queries and mutations intact; their headers remain available in
loading and error states. `InfoNavigation` separates the web exit to Profile
from the existing mobile return to its section list. The Instructions catalog
preserves its Support origin and article navigation. Gift result exit stays
outside the changing live status region and performs navigation only.

The following shared feature components are also hybrid by default:

- `src/components/dashboard/`;
- `src/components/subscription/`;
- `src/components/connection/`;
- `src/components/admin/`;
- `src/components/tickets/`;
- `src/components/partner/`;
- `src/components/sales-stats/`;
- `src/components/news/`;
- `src/components/wheel/`;
- root feature components directly under `src/components/`.

The v1.69.0 synchronization established these explicit hybrid seams:

- `src/components/ui/skeleton/` owns the canonical upstream loading primitives,
  while page-specific sizes, error/retry states and Custom Cabinet layout remain
  in their feature components;
- `src/components/referral/` renders upstream reward/terms/tier behavior inside
  the existing Custom Cabinet partner presentation;
- `src/components/admin/grace-access/form.ts` owns pure validation and changed
  field calculation; `SquadField.tsx` and `SessionsSection.tsx` own their UI;
- `src/components/admin/referral-levels/fields.tsx` and
  `ReferralLevelCard.tsx` own reusable level fields/card presentation;
- `src/providers/TransientOverlayBackProvider.tsx` coordinates transient overlay
  priority, while each overlay remains responsible for its own close behavior;
- `src/utils/contactPrefill.ts` owns transient contact handoff. Reading is safe
  during React StrictMode re-render; the committed destination explicitly clears
  the in-memory fallback.

The v1.69.1 increment adds these seams:

- `src/hooks/useLegalConsentGate.ts` owns consent-required decoding, document
  loading and exact retry; each Telegram entry owns only its original payload
  and presentation context;
- `src/utils/api-error.ts` is the only boundary that turns unknown backend
  `detail` into visible text. UI files must not render raw structural payloads;
- `src/hooks/useUserAvatar.ts` owns Bot fallback loading, while
  `src/components/layout/AppShell/AppHeader.tsx` retains Custom Cabinet layout,
  safe-area and fallback presentation;
- the first inline script in `index.html` owns pre-subresource contact privacy,
  `src/utils/contactPrefill.ts` consumes its in-memory handoff, and runtime
  `DocumentBranding` remains the final owner of title/favicon state;
- early branding may supply a validated name/PNG hint, but must not overwrite
  Custom Cabinet white light, black dark or white-on-accent contrast semantics.

For these files, never resolve an upstream change from filenames or JSX alone.
Review data loading, mutations, state, error handling, platform behavior and
rendered states separately from presentation.

The classic purchase/renewal consistency change adds these hybrid seams:

- `PurchaseCTAButton` routes ordinary paid active/expired Classic subscriptions
  and subscriptions with an attached periodic tariff to renewal of the same ID,
  including single-subscription mode. Trial, daily, limited and explicit tariff
  selection behavior remains unchanged.
- `RenewSubscription` owns fresh subscription/options/balance queries and the
  existing manual renew/top-up contract; `subscription/renewal/` owns compact
  period cards and the inline payment summary.
  Its action uses canonical `Button` with `legacyPrimary` to reuse the tariff
  `btn-primary` appearance and CSS interaction states without duplicate styles.
  Renewal period cards reuse Classic purchase card classes; the period area
  uses canonical `Card`, `PurchaseContextBanners` supplies the same promo-group
  banner, and `RenewalSubscriptionInfo` presents current parameters with icons.
  Devices occupy a separate info row; the renewal route heading uses
  `subscription.extend`, while ordinary purchase uses `subscription.getSubscription`.
  `RenewalSummary` groups period content with the payment summary inside `Card`
  on every screen size, with the standard 16px gap and no fixed panel or spacer.
  Renewal prices remain final server values; the banner never reapplies discounts.
- `useRenewalSelection` and `utils/renewalSelection` own session-only period
  intent, scoped to user/subscription and validated against fresh server state.
  They never persist price, balance or payment permission; auth logout clears it.
- `ClassicPurchaseWizard` treats purchase preview as the final server amount;
  `promoDiscount` is applied only to preliminary option prices and follows the
  confirmed Bot floor-discount arithmetic. Long-period Classic options share
  `getMonthlyPriceKopeks` with renewal, using the discounted period price;
  `SubscriptionPurchase` groups the Classic wizard inside canonical `Card`.

## Known High-Conflict Hotspots

| Hotspot | Why it is sensitive |
| --- | --- |
| `src/App.tsx` | Central route registry and permission wrappers |
| `src/AppWithNavigator.tsx` | Telegram back button and deep-link routing |
| `src/main.tsx` | Startup order, SDK initialization and global providers |
| `index.html`, `vite-plugins/brandingHtml.ts`, `nginx.conf` | Network work before React: contact privacy, first paint, Bot favicon, cache headers and CORS separation |
| `src/i18n.ts` | Async locale startup, import deduplication and bounded Telegram language waits |
| `src/components/DocumentBranding.tsx`, branding hook/utilities and `vite-plugins/` | Runtime and first-paint title/favicon ownership must remain consistent |
| `src/components/layout/AppShell/` | Navigation, feature flags, branding and responsive shell |
| `src/pages/Dashboard.tsx` | Subscription modes, trial, gifts, promotions and onboarding |
| `src/pages/Login.tsx` | Telegram, OAuth, email, legal consent and branding |
| `src/pages/TelegramCallback.tsx`, `src/pages/TelegramRedirect.tsx`, `src/components/TelegramLoginButton.tsx` | Original Telegram payload, one attempt, consent gate retry and cancellation behavior |
| `src/pages/Subscription.tsx` | Payments, renewal, connection and status behavior |
| `src/pages/Balance.tsx` | Payment methods, saved methods and top-up entry |
| `src/pages/TopUpAmount.tsx`, `src/pages/TopUpResult.tsx`, `src/hooks/useCreatedTopUpStatus.ts`, `src/utils/topUpReturnPath.ts` | Close/back destination depends on whether payment was created; preserve its source and pending record, confirm through existing payment API before showing success |
| `src/pages/Profile.tsx`, `src/pages/ProfileEmailAuthSection.tsx`, `src/pages/ProfileNotifications.tsx` | Identity, account linking and notification settings |
| `src/pages/AdminSettings.tsx` | Broad operator configuration surface |
| `src/pages/AdminGraceAccess.tsx` and `src/components/admin/grace-access/` | Permission-gated writes, env locks, validation and partial changed-field payloads |
| `src/pages/AdminReferralLevels.tsx` and `src/components/admin/referral-levels/` | Strict numeric rules, reward modes, chain depth and reorder/edit state |
| `src/pages/AdminSystemErrors.tsx` | Load failure must remain distinct from a genuinely empty journal |
| `src/pages/AdminUserDetail.tsx` and components | Permissions and many administrative mutations |
| `src/components/admin/remnawave/GeoCheckModal.tsx` and `src/providers/TransientOverlayBackProvider.tsx` | Telegram Back, browser history and reopened-overlay races |
| `src/styles/globals.css` | Tokens, themes, shared classes, containment and performance rules |
| `tailwind.config.js` | Runtime color mapping and shared visual scales |
| `package.json` and `package-lock.json` | Dependency and build reproducibility |

## Intentional v1.69.0–v1.69.1 Divergences

- `.github/workflows/release.yml` remains absent because release publication is
  owned outside the upstream Cabinet workflow.
- `CHANGELOG.md` remains at the Custom Cabinet release history until a real
  immutable candidate tag is approved; source integration alone is not a
  release entry.
- `src/components/admin/remnawave/geoCheckRoute.test.ts` and
  `src/utils/nodeVersion.test.ts` keep the stricter Custom Cabinet cases.
- `src/utils/glassTheme.ts` and its test keep Custom Cabinet semantic light/dark
  text and background behavior.
- Profile notification loading lives in `ProfileNotifications`, system-document
  loading in the current `SystemDocumentContent`, and subscription-device
  loading in `DevicesPanel`; do not restore superseded upstream editor/layout
  locations merely to match filenames.
- `src/components/ui/BentoSkeleton.tsx`, `src/components/ui/Skeleton.tsx`,
  `src/data/colorPresets.ts` and `src/hooks/useUserThemePreferences.ts` remain
  deleted after consumer review. On case-insensitive Windows,
  `src/components/ui/Skeleton.tsx` must not shadow `src/components/ui/skeleton/`.
- Tiptap direct dependencies require `^3.30.4` or newer compatible v3 and the
  lockfile currently resolves the coordinated set to 3.31.3. This closes the
  advisory inherited from the target v1.69.0 lockfile.
- `LegalConsentGate` uses the canonical Custom Cabinet `Card`/`Button` surface;
  do not restore a duplicate upstream `.card` presentation class.
- `AppShell` and `MobileBottomNav` keep the Custom four-item navigation while
  adapting upstream route visibility, keyboard and safe-area behavior.
- `AppHeader` keeps the Custom safe-area behavior while accepting the Upstream
  Bot avatar fallback.
- `src/components/auth/CheckEmailCard.tsx` owns the canonical Custom Cabinet
  presentation for the upstream guest resend flow; `src/utils/emailAuthError.ts`
  owns the safe response-to-state boundary. Bot rate thresholds and disposable
  domain data must never be copied into either frontend seam.
- `vite-plugins/brandMonogram.ts` keeps black/white Custom output; the v1.69.1
  Safari size and radius changes do not transfer upstream accent ownership.
- `index.html` removes quick-purchase `contact` before the static favicon and
  any other subresource request. This privacy ordering takes precedence over
  an API-backed first paint on that landing URL.

## Intentional v1.79.0 Simple/Lite Mode Exclusion

Custom Cabinet intentionally keeps one user presentation path: the Unified
Dashboard, responsive overlays and the existing four-item mobile navigation.
The upstream Simple/Lite Mode is not a second supported presentation variant.
Custom Cabinet therefore has no `/cabinet/branding/lite-mode` client, storage
hint, admin toggle, route branch, navigation branch or lite-specific screen.
The endpoint may still exist in the exact unmodified Upstream Bot `v4.15.0`;
frontend absence is not a claim that the backend contract was removed.

For every future upstream synchronization, classify each lite-related commit
individually:

- skip code whose only purpose is Simple/Lite Mode;
- separate mixed commits and adapt shared security, API, payment,
  subscription, accessibility or platform fixes into the existing Custom
  surfaces;
- do not import a lite endpoint, storage key, setting or presentation branch
  as a side effect of a shared fix;
- reconsider the product boundary only through a new owner-approved ADR that
  explicitly supersedes
  [`ADR 0002`](docs/adr/0002-adapt-upstream-cabinet-v1.79-bot-v4.15.md).

`src/noLiteMode.guard.test.ts` enforces this boundary in the normal source
gate. BSCHEKER remains independently excluded by ADR 0001 and its own guard.

## Boundary Rules

The active subscription summary is a Custom presentation seam:
`src/components/dashboard/SubscriptionCardActive.tsx` groups status, tariff,
refresh, remaining term and traffic conditions. Unlimited traffic shows usage
against infinity and hides the progress bar when the existing API data indicates unlimited;
limited subscriptions keep those indicators. `SubscriptionActiveActions.tsx`
shares the existing primary action between the summary and legacy callers,
with setup and connection link controls below the summary. This layout does
not change refresh, device, trial or management contracts.

`SubscriptionTechGrid.tsx` owns the stationary SVG background of this summary,
the expired/limited/disabled subscription card and the free/paid trial offer.
The latter cards use theme-aware `text-dark-50` for the grid and an isolated
stacking context so it stays behind the content. Active summaries retain their
fixed contrast palette. Loading, errors and the standalone purchase link when
no trial is available retain their existing presentation.
Its base geometry and edge fades remain static. `useSubscriptionGridNodes.ts`
measures the visible SVG on resize and selects scattered nodes on the same
32px lattice. Per-instance seeded variation gives each row a different phase;
within each row the rightmost nodes always pulse before those to their left.
The `grid-node` animation from `tailwind.config.js` changes the actual SVG
radius from 1.25px to approximately 2.05–2.45px and back over a 12-second cycle,
along with a soft opacity pulse. Node centres and grid lines never move. CSS
drives the animation without frame-by-frame React updates, blur or glow.
The pulse layer is fully masked in the faded leftmost 35% of the card and
then follows the base grid's gradual increase in visibility to the right.
Reduced-motion users see only the original static layer; no API or
subscription behavior is involved.

Presentational components should not call API clients, mutate stores or decode
external payloads when that behavior can remain in a route, hook or adapter.

Do not create a copied `src/upstream/` tree inside Custom Cabinet. The exact
upstream Git SHA is the comparison source of truth; a copied tree would drift.

Do not move an upstream-sensitive module merely to make it appear custom-owned.
Ownership follows responsibility, not directory name.

When a hybrid file becomes difficult to synchronize repeatedly, extract only a
stable visual seam or reusable behavior seam. Avoid speculative wrappers and
large refactors without a concrete recurring conflict.
