# Upstream Cabinet Synchronization

This document defines the required process for bringing changes from Upstream
Cabinet into Custom Cabinet without losing Custom Cabinet design, branding or
behavior.

The source repository, current tag and exact Git SHA are recorded in
[`UPSTREAM.md`](UPSTREAM.md). A release page, changelog entry or branch name is
not an exact source identity and cannot replace the SHA.

## Core Model

Every synchronization is a three-way comparison:

1. The previous exact Upstream Cabinet SHA recorded in `UPSTREAM.md`.
2. The proposed new exact Upstream Cabinet SHA.
3. The current Custom Cabinet commit.

Do not replace the Custom Cabinet tree with a new Upstream Cabinet archive. Do
not resolve a hybrid-file conflict by taking the complete Custom Cabinet or
Upstream Cabinet side without reviewing the incoming behavior.

## Required Inputs

Before editing, record:

- the Upstream Cabinet release, PR or commit URL supplied by the owner;
- the previous upstream tag and SHA from `UPSTREAM.md`;
- the new upstream tag and exact SHA;
- every upstream commit in the selected range;
- the changed-file list and dependency changes;
- the intended Upstream Bot tag and exact SHA;
- the Custom Cabinet commit that will receive the update;
- the relevant Release Bundle compatibility constraints.

If the new exact SHA cannot be established, stop before integration. If the
compatible Upstream Bot version cannot be established, integration may continue
on an isolated branch, but compatibility and Release Bundle publication remain
blocked and the missing fact must be reported.

## Fetching Upstream

The recommended read-only remote name is `upstream`:

```bash
git remote add upstream https://github.com/BEDOLAGA-DEV/bedolaga-cabinet.git
git fetch upstream --tags
```

If the remote already exists, verify its exact URL instead of replacing it.
Fetching upstream objects does not authorize pushing to the upstream
repository.

Custom Cabinet and Upstream Cabinet may not share useful Git ancestry. Do not
use `git merge --allow-unrelated-histories` as a synchronization shortcut. Use
the exact old and new upstream trees as comparison inputs and port the selected
changes intentionally.

## Impact Review

Produce an impact matrix before implementation. Each incoming commit must be
classified as one or more of:

Use [`UPSTREAM_SYNC_REPORT_TEMPLATE.md`](UPSTREAM_SYNC_REPORT_TEMPLATE.md) for
the analysis and final record.

| Class | Examples | Default action |
| --- | --- | --- |
| Security | URL validation, tokens, sanitization, permissions | Port and verify first |
| Contract | API payloads, types, routes, storage keys, WebSocket events | Port unless incompatibility is explicit |
| Product behavior | Subscription, payment, connection, referral logic | Port behavior and all states |
| Platform | Telegram SDK, viewport, back button, deep links | Port and test in web and Telegram |
| Localization | Keys, interpolation, locale formatting, RTL | Port across every supported locale |
| Dependency | `package.json`, lockfile, build/runtime configuration | Port only the required, understood change |
| Accessibility | Semantics, focus, keyboard, contrast | Port or provide an equal Custom Cabinet fix |
| Presentation | Layout, color, typography, animation | Adapt to Custom Cabinet; do not copy automatically |

An upstream commit labelled `ui` or `refactor` still requires code review. It
may contain behavioral, responsive, accessibility or security fixes.

For each commit, the impact matrix must state:

- upstream SHA and source URL;
- affected files and user flows;
- ownership class from `CUSTOMIZATION_MAP.md`;
- API, data, route, storage and translation effects;
- planned action: direct port, adapted port, intentionally skipped or blocked;
- reason for every skipped part;
- required verification.

## Porting Order

Use this order unless a dependency requires a narrower variation:

1. Security fixes and external contract changes.
2. Dependencies, build configuration and exact lockfile changes.
3. Types, API clients and low-level utilities.
4. Stores, providers, hooks and platform adapters.
5. Routes, feature flags and integration logic.
6. User-visible states and translations.
7. Custom Cabinet presentation adaptation.
8. Provenance and compatibility documentation.

This order keeps functional changes reviewable before presentation changes.

## Conflict Rules

For an upstream-owned file, preserve the upstream structure where practical and
apply only documented Custom Cabinet adaptations.

For a custom-owned file, preserve the Custom Cabinet implementation and extend
its public contract when incoming behavior requires it.

For a hybrid file, compare the previous upstream, new upstream and current
Custom Cabinet versions. Review imports, types, state, effects, mutations,
validation, error handling, feature flags, translations, navigation and every
rendered state separately.

Never drop an incoming behavior merely because the upstream markup does not fit
the current design. Extend the Custom Cabinet component contract or add the
smallest appropriate adapter.

Never import an upstream visual change merely because it is bundled with a
functional fix. Separate the behavior from the presentation where practical.

Do not perform broad formatting, renaming, directory movement, import sorting or
branding replacement during synchronization. These changes obscure provenance
and increase future conflicts.

## Dependencies

For each dependency change:

1. Identify the upstream feature or fix that requires it.
2. Review breaking changes and runtime support.
3. Preserve unrelated dependency versions.
4. Regenerate `package-lock.json` with npm; do not hand-merge lockfile sections.
5. Preserve licenses, copyright notices and technical attribution.
6. Verify production chunking and build output.

## Localization

Find every added, renamed and removed key. Update all supported locale files,
including locales that may be disabled in the current operator configuration.
Preserve interpolation, pluralization and locale-aware number/date formatting.

Do not remove an old key until no Custom Cabinet code uses it. Do not replace a
translation with a hardcoded fallback just to make a build pass.

## Security

Security behavior is never presentation-only. Preserve or improve:

- redirect and callback validation;
- allowed URL and application schemes;
- OAuth state checks;
- Telegram init-data handling;
- token and CloudStorage handling;
- signed media URLs;
- HTML sanitization;
- payment return validation;
- permission gates;
- SRI and trusted external-script provenance.

If a security fix conflicts with Custom Cabinet UI, the security behavior wins
and the UI must be adapted around it.

## Git History

Use a dedicated branch such as:

```text
sync/upstream-v1.66.0
```

Keep functional synchronization separate from unrelated redesign work. Prefer
small thematic commits, for example:

```text
sync(upstream): align API types for v1.66.0
sync(upstream): port subscription fixes
adapt(ui): render new subscription state
docs(upstream): record v1.66.0 provenance
```

Commit messages or the final synchronization report must reference the incoming
upstream SHAs. Do not collapse a large synchronization into an opaque commit if
separate behavior can be reviewed and reverted independently.

Do not commit, tag, push or publish unless the owner explicitly requests it.

## Verification Gate

Run the repository-required gate after source changes:

```bash
npm test
npm run type-check
npm run build
```

Run `npm run check` when the synchronization changes linted or formatted source.

The browser smoke scope must cover every affected flow and, where applicable:

- public login, registration and legal consent;
- Dashboard states: empty, trial, active, limited and expired;
- subscription purchase, renewal, connection, QR and deep links;
- balance, payment method, top-up and return result;
- profile, linked accounts and notifications;
- support and ticket attachments;
- affected admin permissions, forms and tables;
- web and Telegram behavior;
- 320, 375, 768, 1024 and 1280+ pixel widths;
- dark, light and operator-defined colors;
- Russian, English and an RTL case;
- keyboard, focus, dialogs and accessible names.

A successful build alone is not sufficient evidence of a safe synchronization.

## Completion Records

Before declaring the synchronization complete:

1. Update `UPSTREAM.md` to the new exact upstream tag and SHA.
2. Update `COMPATIBILITY.md` with the verified Upstream Bot and Custom Cabinet
   versions.
3. Add a dated entry to the Custom Cabinet changelog or synchronization report.
4. List every incoming commit as ported, adapted, skipped or blocked.
5. Record intentional deviations and residual test gaps.
6. Confirm that the worktree contains no accidental build output, environment
   files, screenshots or agent data.

Do not update `UPSTREAM.md` merely because analysis started. Update it only when
the selected range has been integrated and passed the applicable gate.

## Release Boundary

Do not build a Release Bundle from an uncommitted local directory. A Release
Bundle must pin the committed Custom Cabinet source, Upstream Bot and runtime
images.

Do not replace assets under an existing Release tag. Any changed asset requires
a new immutable tag after the complete applicable gate.
