# Custom Cabinet Redesign Rules

These rules keep Custom Cabinet visually independent while preserving the
ability to port future Upstream Cabinet behavior safely.

The current implementation audit is in
[`DESIGN_UX_UI_AUDIT.md`](DESIGN_UX_UI_AUDIT.md). This document is the shorter
mandatory contract for future design work.

## Product Boundaries

Treat the product as three related interface modes:

- public authentication and transactional pages;
- user Cabinet in web and Telegram Mini App;
- administrative console.

They may share foundations and primitives, but they do not have to share one
layout density or navigation shell. A user-facing layout must not constrain
wide administrative tables and editors.

## Separation of Behavior and Presentation

Presentational components must receive normalized data and callbacks through
props. They must not duplicate or hide API, authentication, payment,
subscription, permission, deep-link or Telegram behavior.

Keep route pages as integration boundaries where practical. Data loading,
mutations and platform integration may remain close to the upstream structure,
while visual sections use Custom Cabinet components.

Do not copy a whole upstream page into a second custom implementation. A
duplicated upstream implementation drifts silently and makes future security or
contract fixes easy to miss.

## Stable Contracts

Do not change these solely for visual reasons:

- route and callback paths;
- API endpoint paths and payload shapes;
- query and cache keys;
- local, session and CloudStorage keys;
- permission names;
- WebSocket event names;
- Telegram `startapp` and deep-link formats;
- payment return routes;
- public hook and utility contracts.

When a contract must change, document the compatibility reason and verify the
matching Upstream Bot version.

## Design-System Ownership

New design decisions belong in the smallest shared layer that can express them:

- semantic color tokens;
- typography roles;
- spacing, radius, elevation and motion scales;
- canonical primitives;
- user and admin shells;
- reusable product patterns.

Do not create another local button, card, dialog, sheet, field, badge, spinner or
table pattern when the canonical component can be extended safely.

Use semantic tokens such as surface, text, border, action and status roles. Do
not build new components around theme-specific names such as `dark-400` as their
public design contract.

Operator-defined colors must remain supported. Filled actions and statuses must
retain readable foreground contrast for arbitrary valid operator colors.

## Canonical Component Contracts

Interactive cards must render or contain a semantic link or button and work with
keyboard activation.

User-facing canonical cards use `md` as the standard density. Use `sm` for
compact rows, actions and lists; use `lg` only explicitly for isolated empty,
error, success or promotional states. Do not introduce new user-facing uses of
the legacy `.card` class.

Buttons must provide loading, disabled, icon-only accessible-label and haptic
behavior through the canonical component.

Fields must associate label, description and error with the control and expose
`aria-invalid` when appropriate.

Dialogs and sheets must use portals, focus management, Escape/back behavior,
scroll locking, an accessible title and focus return.

Switches, checkboxes and icon-only actions must always have an accessible name.

Tables must provide semantic sorting, keyboard-accessible row actions and a
defined responsive strategy.

## State Preservation

Every redesigned flow must preserve all existing applicable states:

- initial loading and background refresh;
- skeleton, empty and partial data;
- validation and server error;
- pending, success and failure;
- disabled and permission-restricted;
- trial, active, limited, expiring and expired subscription;
- insufficient balance and interrupted payment;
- maintenance, channel requirement, blacklist, deleted account and unavailable
  backend;
- feature disabled and platform capability unavailable.

A redesign is incomplete if it covers only the successful state.

## Responsive and Platform Rules

Support 320 pixels without accidental horizontal page overflow. Data tables may
scroll only through an explicit contained strategy.

Account for Telegram safe areas, stable viewport height, software keyboard,
fullscreen mode, native back behavior and external-link handling.

Do not rely on hover for required information or actions. Maintain touch targets
of at least 44 by 44 pixels for primary mobile interactions.

Do not use a raw fixed overlay inside route content. Use the canonical portal so
header, bottom navigation and CSS containment cannot clip it.

## Accessibility Rules

Do not disable browser zoom.

Preserve visible keyboard focus and logical focus order. Add `aria-current` to
active navigation and provide a skip path to main content where applicable.

Respect `prefers-reduced-motion`. Motion must communicate state or continuity,
not block task completion.

Use visible labels for form fields. Color alone must not communicate status,
selection or errors.

New body text should not be smaller than 12 pixels. Text at 10 or 11 pixels is
reserved for non-critical supporting data that remains readable and does not
carry an action or required state.

## Localization Rules

Design with Russian expansion, English and RTL behavior in mind. Do not use
fixed widths that only fit one locale. Mirror directional icons where meaning
requires it.

Keep user-visible text in locale files. Hardcoded fallback text is not a
substitute for a complete translation.

## Performance Rules

Preserve route lazy loading and existing mobile performance protections. Use
blur, noise, glow and animated backgrounds only where they provide a deliberate
brand or state benefit.

Avoid remounting persistent backgrounds or providers during navigation. Reserve
layout space for asynchronously loaded content to prevent visible jumps.

Remote fonts and heavy visual dependencies require an explicit performance and
WebView reliability review.

## Change Discipline

Keep visual customization separate from repository maintenance and upstream
synchronization. Do not combine a broad redesign with a dependency upgrade or
upstream version port in one review unit.

Avoid broad file movement, mass renaming and whole-repository formatting. Keep
the diff focused so later upstream comparisons remain understandable.

When replacing an old component, inventory its unique behavior before deletion.
Remove the old implementation only after all consumers have migrated and the
replacement passes the applicable gate.

## Redesign Definition of Done

A redesigned screen is complete only when it:

- uses canonical components and semantic tokens;
- preserves upstream-compatible behavior and every applicable state;
- works in dark, light and operator color configurations;
- works at 320, 375, 768, 1024 and 1280+ pixel widths;
- works with keyboard-only navigation and visible focus;
- has accessible names, landmarks and field error associations;
- respects reduced motion and browser zoom;
- handles Russian, English and an RTL case;
- handles web and relevant Telegram capabilities;
- passes tests, type-check, build and affected browser smoke checks;
- updates `CUSTOMIZATION_MAP.md` when ownership boundaries change.
