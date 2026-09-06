# Custom Cabinet Ownership Map

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
- `AppHeader` keeps the Custom four-item navigation and safe-area behavior while
  accepting the Upstream Bot avatar fallback.
- `vite-plugins/brandMonogram.ts` keeps black/white Custom output; the v1.69.1
  Safari size and radius changes do not transfer upstream accent ownership.
- `index.html` removes quick-purchase `contact` before the static favicon and
  any other subresource request. This privacy ordering takes precedence over
  an API-backed first paint on that landing URL.

## Boundary Rules

Presentational components should not call API clients, mutate stores or decode
external payloads when that behavior can remain in a route, hook or adapter.

Do not create a copied `src/upstream/` tree inside Custom Cabinet. The exact
upstream Git SHA is the comparison source of truth; a copied tree would drift.

Do not move an upstream-sensitive module merely to make it appear custom-owned.
Ownership follows responsibility, not directory name.

When a hybrid file becomes difficult to synchronize repeatedly, extract only a
stable visual seam or reusable behavior seam. Avoid speculative wrappers and
large refactors without a concrete recurring conflict.
