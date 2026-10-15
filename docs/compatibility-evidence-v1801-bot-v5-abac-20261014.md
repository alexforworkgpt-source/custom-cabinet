# Bot v5: scoped native ABAC policies — 2026-10-14

Status: **31 HTTPS checks: 29 expectations met, 2 failed; targeted ABAC gate FAIL**.
Full S9 remains **PARTIAL**. [JSON evidence](compatibility-evidence-v1801-bot-v5-abac-20261014.json)
and [live report](releases/LIVE_CHECK_REPORT_2026.10.14_ABAC.md).
The probe process exited0 after recording observations and removing fixtures;
that exit code does not mean the access-policy gate passed.

## Exact runtime and scope

Unchanged Upstream Bot v5.0.0 / `5bda3c56f0afd9f4813e9c6fa48934948b05ebae`,
Installer `75c49bec9c2a764e123fc0ef675f8c45fc22a1ab`, Ubuntu24.04/PG15/Redis7.
The previous transition runtime and known SSH fingerprint were freshly verified.
Native image stayed
`sha256:bf27d5f0e1b9ec0b46979be6536877ced98b00c822b32d1e03a80a4677da6205`.
Cabinet is the published reference from `bundle-v2026.10.10.1`, source
`1d046656fbb01a928fd54a28694e10105d4185f8`, artifact
`a3f119a4548d7f49067406e1a4e15f3020d1eeff1da00490130e1600ec40d0b0`.
The new uncommitted Custom Cabinet artifact was not redeployed or browser-tested.

Two owned Email accounts/verified flags and a limited test-controller role were
native ORM fixtures. Both accounts logged in via real HTTPS Email/password;
the actor used the same native token throughout. No manual JWT or owner
Superadmin change. Policies were configured through unchanged native CRUD,
only for owned custom roles; global policies and other users' roles were untouched.
One temporary Email-auth DB flag enabled this isolated scenario and was removed
afterward; source, environment files and images were unchanged, no restart.
This is an API/policy proof, not a policy-editor UI, registration or SMTP proof.

## Matching observations

- A matching active role policy denied users:read403. A different resource,
  different action or inactive policy did not deny that read200.
- Resource/action wildcards matched. A current UTC time window denied403;
  an empty time window did not apply200.
- A deny condition matching the actual client IP denied403; a nonmatching IP
  did not apply200. The actual IP was read from the owned actor's native audit
  record and is not published.
- The unchanged engine kept a matching deny final even with a higher-priority
  allow. An allow policy did not grant missing payments:read without RBAC.
  This records the tested engine behavior, not complete priority-policy coverage.
- A policy on an unassigned role did not affect the actor. Assigning its role
  made the deny effective403. Revoking that assignment restored users200.
- The permission response correctly removed expired/inactive roles while
  retaining the separate reader role, users:read and level10 on the same token.

The 29 matching expectations include native login/owned role setup and selected
HTTP decisions; they are not 29 independent policies or full ABAC coverage.

## Confirmed OPEN limitations

| Case | Expected access after role exclusion | Actual evidence |
| --- | --- | --- |
| L-ABAC-01 / expired assignment | The policy attached to the expired role should no longer deny the surviving reader role | After a real15-second expiry, auth/me/permissions excludes the carrier role and retains users:read, but GET admin/users still403. Revoking the expired assignment restores200 without relogin |
| L-ABAC-02 / inactive role | The policy attached to an inactive role should no longer deny the surviving reader role | Deactivating the carrier role excludes it from auth/me/permissions, but GET admin/users still403. Removing the owned policy restores200 without relogin |

The source trace explains both observations. Native
[`UserRoleCRUD.get_user_permissions`](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/blob/5bda3c56f0afd9f4813e9c6fa48934948b05ebae/app/database/crud/rbac.py)
filters expired assignments and inactive role definitions. Its separate
`get_user_roles` query filters only the assignment's `is_active`, so it still
returns the expired assignment or an assignment to an inactive role.
[`PermissionService.check_permission`](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/blob/5bda3c56f0afd9f4813e9c6fa48934948b05ebae/app/services/permission_service.py)
uses those role IDs to fetch active policies after the RBAC check. Consequently,
the surviving reader permission passes RBAC, then the excluded carrier role's
policy denies the request. Same-token negative controls support this trace;
this is not explained by stale frontend role state or a stale actor token.

These are native access-policy limitations at the unchanged Upstream Bot
boundary. A frontend-only change cannot change the server's decision under the
existing API. They remain **OPEN**, not PASS; no backend change, fork/patch or
backend implementation work item is part of this task. The earlier
[34 RBAC assertions](compatibility-evidence-v1801-bot-v5-rbac-extended-20261014.md)
without these policies retain their separate successful scope.

## Cleanup and preservation

Only the new owned accounts, roles, assignments, policies and temporary
Email-auth row were removed. The probe's digest comparison preserved existing
core user fields, role definitions/assignments, access policies, transactions,
subscriptions and the original Email-auth setting. It does not claim identical
DB sequence counters or empty native audit/application logs.

Independent postflight at `2026-10-14T15:18:24.804568+00:00`
(18:18:24 Europe/Moscow) confirmed owned users/roles/policies/assignments0,
original disabled Email-auth gate, unchanged five configuration-file hashes
and image IDs, and all three services healthy/restart0/OOMfalse.
Local server.env was preserved. Remnawave Panel writes, subscription mutations,
payment creation and global policy changes were0.

The earlier transition VPS remains running. Its cleanup still has
`SKIPPED_OWNER_REQUEST`; the owned fixture cleanup is not a cleanup of the
webhook/Caddy/UFW/Installer resources. Credentials, actual IPs and raw logs
remain private in workspace `.scratch/bedolaga-v5-abac-20261014/private/`.
Source/frontend/schema/browser/lifecycle/transition and prior99/34 role suites
were not repeated. No commit, public Release or production operation occurred.

Full ABAC/all-mutation/global-policy coverage, remaining merchant/first-delivery
concurrency, physical Mini App navigation and read-only Panel constraints remain
unverified. No complete S9 or public Bundle gate is declared PASS.
