# Upstream Synchronization Report: `<target tag>`

Status: `analysis | integration | verification | completed | blocked`<br>
Date: `YYYY-MM-DD`<br>
Owner: `<name or agent>`

Do not mark this report completed until the selected range is integrated,
verified and recorded in `UPSTREAM.md` and `COMPATIBILITY.md`.

## Source Identity

| Item | Value |
| --- | --- |
| Supplied release/PR/commit URL | `<exact URL>` |
| Upstream Cabinet repository | `https://github.com/BEDOLAGA-DEV/bedolaga-cabinet.git` |
| Previous upstream tag | `<tag>` |
| Previous upstream SHA | `<40-character SHA>` |
| Target upstream tag | `<tag>` |
| Target upstream SHA | `<40-character SHA>` |
| Receiving Custom Cabinet commit | `<40-character SHA>` |
| Intended Upstream Bot tag/SHA | `<exact tag and SHA or BLOCKED>` |
| Intended Release Bundle | `<tag or not scheduled>` |

## Range Summary

Summarize the purpose of the incoming range and its expected user, admin,
platform and operational impact.

Changed files: `<count>`<br>
Incoming commits: `<count>`<br>
Dependency changes: `<yes/no and summary>`<br>
API or event contract changes: `<yes/no and summary>`

## Commit Impact Matrix

Every incoming commit must appear once. A commit with mixed concerns may list
multiple classes.

| Upstream SHA | Source | Class | Affected flows/files | Ownership | Decision | Verification |
| --- | --- | --- | --- | --- | --- | --- |
| `<SHA>` | `<URL>` | Security/Contract/Behavior/Platform/Localization/Dependency/Accessibility/Presentation | `<scope>` | Upstream-owned/Custom-owned/Hybrid | Direct port/Adapted port/Skipped/Blocked | `<checks>` |

## File-Level Conflict Decisions

Record every non-trivial hybrid or custom-owned file decision.

| File | Previous upstream behavior | Incoming behavior | Custom Cabinet behavior | Resolution and reason |
| --- | --- | --- | --- | --- |
| `<path>` | `<summary>` | `<summary>` | `<summary>` | `<decision>` |

## Contract Changes

Record changes to:

- API endpoints and payloads;
- domain types and enums;
- routes and callback paths;
- query, storage and cache keys;
- permissions;
- WebSocket events;
- Telegram deep links and `startapp` values;
- payment and authentication flows;
- runtime and deployment requirements.

Write `None` only after the incoming diff has been reviewed for each category.

## Security Review

List every incoming security fix and show where the equivalent behavior exists
in Custom Cabinet after integration. Include skipped or superseded fixes with a
reason and evidence.

## Presentation Adaptation

Describe which upstream visual changes were:

- intentionally not imported;
- reproduced through Custom Cabinet canonical components;
- required to expose a new state or action;
- changed to satisfy accessibility, responsive or Telegram constraints.

Do not use this section to justify dropping functional behavior.

## Localization Review

| Locale | Added keys | Changed keys | Removed keys retained for compatibility | Verification |
| --- | --- | --- | --- | --- |
| `ru` | `<count/list>` | `<count/list>` | `<count/list>` | `<result>` |
| `en` | `<count/list>` | `<count/list>` | `<count/list>` | `<result>` |
| `fa` | `<count/list>` | `<count/list>` | `<count/list>` | `<result>` |
| `zh` | `<count/list>` | `<count/list>` | `<count/list>` | `<result>` |

## Dependency Review

| Package/configuration | Previous | Target | Upstream reason | Custom Cabinet action |
| --- | --- | --- | --- | --- |
| `<name>` | `<version/value>` | `<version/value>` | `<commit/feature>` | `<decision>` |

Confirm whether `package-lock.json` was regenerated with npm and whether build
chunking changed.

## Verification Results

| Gate | Result | Evidence or limitation |
| --- | --- | --- |
| `npm test` | Pass/Fail/Not run | `<summary>` |
| `npm run type-check` | Pass/Fail/Not run | `<summary>` |
| `npm run build` | Pass/Fail/Not run | `<summary>` |
| `npm run check` | Pass/Fail/Not applicable | `<summary>` |
| Browser smoke | Pass/Fail/Partial | `<flows and viewports>` |
| Telegram smoke | Pass/Fail/Not available | `<platforms>` |
| Theme and locale smoke | Pass/Fail/Partial | `<matrix>` |
| Accessibility smoke | Pass/Fail/Partial | `<keyboard/focus/dialog checks>` |

## Provenance and Compatibility Completion

- [ ] `UPSTREAM.md` records the target exact tag and SHA.
- [ ] `COMPATIBILITY.md` records the verified Upstream Bot and Custom Cabinet
      combination, or release remains explicitly blocked.
- [ ] Every incoming commit is classified above.
- [ ] Every skipped change has a reason.
- [ ] No upstream license, copyright or technical attribution was removed.
- [ ] No build output, environment file, screenshot or agent data is included.
- [ ] The work is committed before Release Bundle construction.
- [ ] A changed release uses a new immutable tag.

## Residual Risks and Rollback

List remaining risks, unavailable environments, deferred features and the last
known compatible Release Bundle or Custom Cabinet commit to use for rollback.

## Final Outcome

State one result:

- `Completed`: integrated, verified and provenance updated;
- `Integrated but release-blocked`: source work completed, compatibility or
  platform verification missing;
- `Partially integrated`: list blocked incoming commits;
- `Rejected`: explain why the target range is not suitable.
