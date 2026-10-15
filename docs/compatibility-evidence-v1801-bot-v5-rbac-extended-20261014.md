# Bot v5: custom roles, multi-role and expiry — 2026-10-14

Status: **34 new native HTTPS assertions PASS in scope; full S9 PARTIAL**.
[JSON evidence](compatibility-evidence-v1801-bot-v5-rbac-extended-20261014.json)
and [live report](releases/LIVE_CHECK_REPORT_2026.10.14_RBAC_EXTENDED.md).
This continues the remaining role coverage after the
[99 sandbox assertions](compatibility-evidence-v1801-bot-v5-sandbox-20261014.md);
those assertions and successful frontend/schema/browser/lifecycle gates were
not repeated.

## Runtime and test-data boundary

The owner confirmed that the previous transition VPS had not been reinstalled.
Fresh read-only preflight matched the known SSH fingerprint, transition owner
marker, Ubuntu24.04 and Bot
`5bda3c56f0afd9f4813e9c6fa48934948b05ebae`. Bot/PG15/Redis7 were healthy with
restart0/OOMfalse. Native image:
`sha256:bf27d5f0e1b9ec0b46979be6536877ced98b00c822b32d1e03a80a4677da6205`.
This is the runtime left by the
[native transition](../../installer/docs/bot-v5-pg15-transition-20261014.md),
using the published reference Cabinet from `bundle-v2026.10.10.1`.
The new uncommitted Custom Cabinet artifact was not redeployed or browser-tested.

Two isolated Email accounts and a level90 test controller role were created
through the unchanged native ORM/CRUD. Controller permissions were limited to
`roles:*`, `users:read`, `payments:read`. Email verification flags were fixture
data; this is not another registration or inbox/SMTP proof. Both accounts then
logged in through the real HTTPS Email/password endpoint. No manual JWT minting
or owner Superadmin change. The actor used the same access token throughout
all subsequent permission changes.

## Initial failure and temporary setting

The first attempt stopped at controller login with HTTP403. Its newly created
accounts/role were removed, and non-fixture core data remained unchanged.
A minimal read-only diagnosis confirmed `detail.code=email_auth_disabled`:
the original environment had `CABINET_EMAIL_AUTH_ENABLED=false`, with no
overriding row in `system_settings`. This was an expected setting of the
native Installer reference runtime, not a demonstrated product regression.

For the new role scenarios, the native settings CRUD temporarily created only
that flag as `true` in the test DB. No Bot source, environment file or image
was changed, and no restart was needed. After the scenario, that owned row
was removed. Independent native DB and HTTPS checks confirmed the original
disabled gate and HTTP403/code `email_auth_disabled` again.

## Verified scenarios

| Scenario | Actual result |
| --- | --- |
| Custom role creation | Reader/users:read at level10 and payer/payments:read at level20 created through native HTTPS API |
| Grant boundaries | Unheld users:delete and users:* denied403; invalid permission400; create/update at controller level90 denied403 |
| Restricted actor / uniqueness | Actor cannot create a role403; duplicate custom role name409 |
| Multiple active roles | Permissions combine exactly to users:read + payments:read, maximum level20; both selected read endpoints200 |
| Expiry | Real 25-second assignment expiry removes payer role and payments:read from the same token; surviving reader remains level10/users200, payments403 |
| Safe custom-role update | Description/color update200 and returned values checked |
| Role deactivation/reactivation | Same token loses/restores reader permission; inactive role gives users403 |
| Revocation/reassignment | Same token loses/restores rights; native reassignment reactivates the same unique assignment |
| Deletion cascade | Deleting an assigned custom role removes effective permissions immediately; users403 on the same token |

34 HTTPS assertions and eight exact permission states passed. Mutation requests
were limited to these owned custom roles and assignments. No payment creation,
subscription mutation, broadcast send, initial sync or Remnawave Panel write.

## Cleanup and independent postflight

The probe removed only its newly created accounts, controller/custom roles and
temporary Email-auth DB flag. A digest comparison covered existing user
identity/balance/status fields, original role definitions/assignments,
transactions and subscriptions; these non-fixture core records were unchanged.
This does not claim byte-identical DB state, sequence counters or empty logs.

Independent postflight at `2026-10-14T13:42:53.074804+00:00`
(16:42:53 Europe/Moscow) confirmed owned users/roles/assignments0, temporary
setting absent, original disabled Email login, the same five runtime
configuration file hashes and the same three image IDs. All three services
were healthy with restart0/OOMfalse; local `installer/server.env` was preserved.

**The earlier transition VPS remains running.** Its cleanup remains
`SKIPPED_OWNER_REQUEST`; this fixture cleanup is not a cleanup of the VPS,
webhook, Caddy/UFW or earlier Installer resources. Private credentials and raw
probe/error logs stay under workspace
`.scratch/bedolaga-v5-rbac-extended-20261014/private/` and must not be published.

## Remaining scope

Full RBAC/ABAC remains PARTIAL: custom access policies, time/IP/resource
restrictions, all mutation endpoints and broader role combinations are not
covered. The remaining merchant/concurrency/physical Mini App checks and
read-only Panel constraints remain open. Existing Classic/Cashera limitations,
PG18 and new public Bundle gates are not closed. No source fix, commit, public
Release or production operation occurred.
