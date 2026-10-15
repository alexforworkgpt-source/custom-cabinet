# Live Check Report: Bot v5 native session recovery

Status: **BLOCKED (full live gate); targeted35 HTTPS checks PASS**<br>
Date: 2026-10-14, Europe/Moscow<br>
Checker: OpenCode<br>
Release owner: владелец проекта; продолжение S9 test verification разрешено

Формат: [LIVE_CHECK_REPORT_TEMPLATE](../../LIVE_CHECK_REPORT_TEMPLATE.md).

## Source Identity / Environment

Upstream Bot `5bda3c56f0afd9f4813e9c6fa48934948b05ebae`, Installer
`75c49bec9c2a764e123fc0ef675f8c45fc22a1ab`, Ubuntu24.04/PG15/Redis7/schema0131.
Known SSH fingerprint/owner marker and unchanged native image verified in fresh
preflight. Cabinet in the parent stack is the published reference
bundle-v2026.10.10.1 / `1d046656fbb01a928fd54a28694e10105d4185f8`, artifact
`a3f119a4548d7f49067406e1a4e15f3020d1eeff1da00490130e1600ec40d0b0`.
The new uncommitted Custom Cabinet was not installed by this HTTPS-only probe;
browser/Telegram versions and visual/locale/palette matrix are NOT_RUN.
New public Bundle not scheduled. Rollback reference remains the previous
immutable Bundle; native transition/rollback proof is separate preserved evidence.
[Canonical report and JSON](../compatibility-evidence-v1801-bot-v5-auth-recovery-20261014.md).

## Change Scope / Automated Gate

No runtime source changes. New native API scenarios cover selected401/403/422,
refresh recovery, concurrent refresh/replay, logout, separate sessions/accounts,
DB-expired refresh and blocked/active account controls.35 HTTPS checks include
three setup logins and32 scenario assertions. All expected statuses matched.
Three auth modules match exact Git blobs in a targeted source trace.

Existing1084 unit, TS/build/frontend Biome and398 browser cases/14 skips retained
their scope. Full repository Biome still has three historical JSON format errors.
Completed frontend/schema/browser/lifecycle/transition/role/ABAC/payment suites
were not repeated; focused validation applies only to the new documentation.

## Test Accounts / Functional Results

| Alias / area | Result | Scope |
| --- | --- | --- |
| test-actor | PASS in scope | New ORM verified Email account, two genuine HTTPS/password sessions |
| test-control | PASS in scope | Separate new account/session remains independent after actor logout |
| Session recovery | PASS in scope | Invalid access401 → refresh200 → same-account access200 |
| Refresh / logout concurrency | PASS in scope | Four barrier-started refreshes200 without new token rows; revoked key four replays401 |
| Expiry / inactive user | PASS in scope | Owned DB-expiry and blocked-user fixture controls deny; restoration resumes |
| Native logout boundary | OBSERVED_CONTRACT | Refresh-only revocation, no rotation; existing unexpired access still returns200 |
| Subscription / payments / Panel | NOT_RUN | Fixtures have zero balances/transactions/subscriptions; no merchant/Panel writes |
| Browser / Telegram auth recovery | NOT_VERIFIED | API probe does not execute compiled UI retry/storage/redirect or initData |

## Platform / Visual / Accessibility Results

No new browser, visual, physical Telegram or accessibility matrix. Existing
scoped compiled-artifact results do not cover this new native recovery scenario.

## Failure / Recovery / Defects

35/35 expected responses; no new unexpected behavior found in this scope.
JWT expiration by actual elapsed lifetime, offline/timeout recovery, browser
automatic retry and refresh-versus-logout race were not verified. DB expiry is
explicit fixture data. Source confirms refresh-only logout; immediate access
invalidation is not claimed. Existing ABAC/provider-read limitations remain OPEN.

## Residual Risks / Staging Decision

Full live/S9 remains **PARTIAL/BLOCKED**. L-ABAC-01/02, L-PAY-API-01,
Classic auto-purchase, Cashera flag-off/reload, remaining merchant/device flows,
read-only Panel and new Bundle requirements preserve their earlier statuses.
This scoped test does not authorize publication or a production transition.

## Production Smoke / Rollback

Production smoke **NOT_STARTED**, rollback **NOT_NEEDED** for this test.
No source commit, Release or production operation; no production baseline taken.

## Final Sign-off

Owned accounts/refresh records removed, temporary Email-auth DB flag removed,
original disabled gate restored and independently observed as403. Fresh
postflight16:42:46 UTC confirmed preserved core/refresh projections, five config
hashes/images, three healthy services/restart0/OOMfalse and local server.env.
Whole transition VPS cleanup remains SKIPPED_OWNER_REQUEST, runtime stays running.
Full live sign-off **BLOCKED**; report contains no credentials, tokens or personal
account data. Auth probe ran once; old gates were not repeated.
