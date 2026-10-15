# Bot v5: native HTTPS session recovery / logout — 2026-10-14

Status: **PASS_IN_SCOPE**, 35 HTTPS checks / 35 matching expectations.
Three checks establish native login sessions; 32 exercise recovery and denial.
Full S9 remains **PARTIAL**, full live sign-off **BLOCKED**.
[JSON evidence](compatibility-evidence-v1801-bot-v5-auth-recovery-20261014.json)
and [live report](releases/LIVE_CHECK_REPORT_2026.10.14_AUTH_RECOVERY.md).

## Exact runtime / scope

Unchanged Upstream Bot `v5.0.0` /
`5bda3c56f0afd9f4813e9c6fa48934948b05ebae`, Installer
`75c49bec9c2a764e123fc0ef675f8c45fc22a1ab`, Ubuntu24.04/PG15/Redis7,
schema0131. Native Bot image:
`sha256:bf27d5f0e1b9ec0b46979be6536877ced98b00c822b32d1e03a80a4677da6205`.
Fresh preflight verified known SSH fingerprint, transition owner marker,
completed native exit0 and the healthy running test stack.

The parent runtime still uses published reference Cabinet from
bundle-v2026.10.10.1, source `1d046656fbb01a928fd54a28694e10105d4185f8`,
artifact `a3f119a4548d7f49067406e1a4e15f3020d1eeff1da00490130e1600ec40d0b0`.
This probe calls actual HTTPS `/api/cabinet/auth/*`; it does not execute or
reverify browser behavior of that reference or the new uncommitted artifact.

Two new owned native ORM Email accounts had fixture verified flags, balances0,
transactions0 and subscriptions0. Password login happened through native HTTPS;
no JWT was minted by the test. Three genuine sessions comprise two logins for
the actor and one for an independent control account. The second actor login
was separated by two seconds, and distinct refresh tokens were asserted.
Registration, email verification delivery, SMTP and inbox were not retested.

The original Email-auth gate was disabled with no DB override. One temporary
owned DB flag was enabled through native CRUD and removed after the scenario;
source/configuration files and owner Superadmin were not changed, Bot was not
restarted. Expiry/status negative controls modified only the owned refresh row
and owned actor through native ORM, then restored their values.

## HTTPS results

| Case | Actual result | Evidence boundary |
| --- | --- | --- |
| Invalid access then refresh | Protected request401; real refresh200; new access returns the same account200 | Invalid signature on an issued token, not actual JWT expiry or automatic browser retry |
| Token-type / malformed input | Refresh token cannot authorize access401; access cannot refresh401; malformed401 and missing field422; wrong password401 | Native endpoints and selected response details |
| Four concurrent valid refreshes | 4×200; working access, same refresh retained; three DB token rows before/after | Barrier-started HTTPS calls; not a refresh/logout race or browser request deduplication |
| Logout / replay | Logout200; revoked refresh401; four concurrent replays4×401; repeated logout200 | Revocation of the supplied refresh token |
| Session / account isolation | Actor's second session and control account can still refresh200 and retrieve their own identity200 | Distinct genuine sessions; no all-session logout claim |
| DB-expired refresh |401; restoring original DB expiry returns200 and working access | DB `expires_at` fixture, not elapsed JWT lifetime |
| Blocked / reactivated actor | Blocked refresh401 and existing access403; restored active account refresh/access200 | Only the owned actor was modified |

All35 expected statuses matched. Identity, balance, response type/expiry,
refresh-token equality and refresh-row counts were also asserted. At the end,
three owned refresh records existed, exactly one revoked, none expired; balances,
transactions and subscriptions remained0.

## Native logout contract and source trace

An already issued unexpired access token returned200 after logout. This is the
existing native **refresh-only revocation** contract, not proof of immediate
access-token invalidation. No refresh-token rotation occurs: successful refresh
returns the supplied refresh token. These observations were expected from exact
source and were not relabeled as additional security guarantees.

At the exact Bot SHA, `app/cabinet/routes/auth.py` refresh checks the token type,
DB presence/revocation/expiry and active user; logout sets `revoked_at` for the
supplied refresh hash. `app/cabinet/dependencies.py` validates the access JWT
and current user status, without consulting that refresh row.
`app/cabinet/auth/jwt_handler.py` signs/validates the native token types.
These three runtime modules match exact raw Git blobs. This is a targeted trace
for the new auth scenario, not a repeat of the full810-file integrity gate.

## Cleanup / preservation

The fixture scenario completed at `2026-10-14T16:42:28.396665+00:00`.
Independent postflight snapshot at `2026-10-14T16:42:46.179634+00:00`
(19:42:46 Europe/Moscow) confirmed both accounts and their refresh rows absent,
temporary DB flag absent and effective Email-auth disabled. A separate HTTPS
postflight request returned403 / `email_auth_disabled` as at baseline.

Original core user/role/policy/payment/transaction/subscription projections and
original refresh-token hash/expiry/revocation projections match fresh preflight.
Five runtime configuration hashes and images are unchanged; three services
healthy, restart0/OOMfalse, local server.env unchanged. This does not claim
byte-identical entire DB, logs, counters, sequences or Redis keys.
Only newly owned fixtures were removed. The previous transition VPS remains
running, its whole-stack cleanup remains **SKIPPED_OWNER_REQUEST**.

Raw logs/accounts are private under workspace
`.scratch/bedolaga-v5-auth-recovery-20261014/private/`; redacted receipts are
`preflight.json`, `result.json` and `postflight.json` in that work directory.
Controller has a single-run marker; the completed financial/role/auth scenarios
must not be rerun merely to restore context. No provider mutations, Panel writes,
subscription mutations, source edits, commit, Release or production operations.

## Remaining S9

Automatic compiled Custom Cabinet refresh/retry/storage/redirect, real JWT expiry,
offline/timeout/browser recovery, refresh-versus-logout races and physical
Telegram session/navigation remain outside this proof. Actual initial merchant
and concurrent HTTPS payment callbacks, canceled/capture/refund/recurring/Cashera
flows, full ABAC/resource/global/mutation coverage and new public Bundle smoke
remain incomplete. Existing L-ABAC-01/02, L-PAY-API-01, Classic auto-purchase,
Cashera discovery and read-only Remnawave limits retain their earlier statuses.
Old frontend/schema/browser/lifecycle/transition/role/ABAC/payment gates were
not repeated; this auth scenario ran once.
