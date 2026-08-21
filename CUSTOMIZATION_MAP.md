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
| Branding presentation | `src/hooks/useBranding.ts`, visual branding components | Custom Cabinet public identity while preserving API provenance |
| Background presentation | `src/components/backgrounds/` | Optional brand effects with mobile performance limits |
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

For these files, never resolve an upstream change from filenames or JSX alone.
Review data loading, mutations, state, error handling, platform behavior and
rendered states separately from presentation.

## Known High-Conflict Hotspots

| Hotspot | Why it is sensitive |
| --- | --- |
| `src/App.tsx` | Central route registry and permission wrappers |
| `src/AppWithNavigator.tsx` | Telegram back button and deep-link routing |
| `src/main.tsx` | Startup order, SDK initialization and global providers |
| `src/components/layout/AppShell/` | Navigation, feature flags, branding and responsive shell |
| `src/pages/Dashboard.tsx` | Subscription modes, trial, gifts, promotions and onboarding |
| `src/pages/Login.tsx` | Telegram, OAuth, email, legal consent and branding |
| `src/pages/Subscription.tsx` | Payments, renewal, connection and status behavior |
| `src/pages/Balance.tsx` | Payment methods, saved methods and top-up entry |
| `src/pages/Profile.tsx`, `src/pages/ProfileEmailAuthSection.tsx`, `src/pages/ProfileNotifications.tsx` | Identity, account linking and notification settings |
| `src/pages/AdminSettings.tsx` | Broad operator configuration surface |
| `src/pages/AdminUserDetail.tsx` and components | Permissions and many administrative mutations |
| `src/styles/globals.css` | Tokens, themes, shared classes, containment and performance rules |
| `tailwind.config.js` | Runtime color mapping and shared visual scales |
| `package.json` and `package-lock.json` | Dependency and build reproducibility |

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
