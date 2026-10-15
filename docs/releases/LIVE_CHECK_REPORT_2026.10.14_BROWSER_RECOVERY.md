# Live Check Report: compiled Custom Cabinet session recovery

Status: **BLOCKED (full live/Release gate); targeted final browser PASS**<br>
Date: 2026-10-14<br>
Checker: OpenCode<br>
Owner: продолжение S9 и frontend recovery fix с регрессионными тестами разрешены

Формат: [LIVE_CHECK_REPORT_TEMPLATE](../../LIVE_CHECK_REPORT_TEMPLATE.md).
[Canonical report / JSON](../compatibility-evidence-v1801-bot-v5-browser-recovery-20261014.md).

## Identity / environment

Custom Cabinet uncommitted HEAD `1169e3cb964caec9a9500ace89bbb53b7e5a89df`,
target Cabinet `a693d30ca6084b9a54b45a72294b99237841ef13`, native Bot
`5bda3c56f0afd9f4813e9c6fa48934948b05ebae`, Installer
`75c49bec9c2a764e123fc0ef675f8c45fc22a1ab`; Ubuntu24.04/PG15/Redis7/schema0131.
Final284-file compiled manifest
`024382a677dc952f64364425698eb8766260ebc5cdbb0360c1592170874c8df9`.
Chrome155.0.8059.40/1280×800/Russian; local compiled frontend with TLS-verified
real VPS API. Parent Cabinet is the unchanged published reference Bundle.
Local proxy rewrites Host/Origin; source/API replies are not instrumented/mocked
in the native gate. This is not a full deployed-staging-domain or Bundle gate.
Local Telegram widget domain mismatch is an environment limit, not Telegram proof.

## Scope / automated checks

Two frontend fixes: incomplete-session recovery and stable one-time Login return.
New E2E regression file verifies the approved browser seam with API mocks.
Meaningful red results retained; final two regressions PASS.1084 unit tests PASS
with explicit2 workers/10s budget; TypeScript/build and focused Biome PASS.
Default5s unit follow-up runs failed on unchanged audience-test timing and are
not declared PASS. Three historical repository JSON format errors remain.
Old398 browser cases/14 skips retain original artifact scope; no full new matrix.

## Functional results

| Area | Result | Coverage |
| --- | --- | --- |
| Native UI login / identity | PASS in scope | Owned ORM verified Email actor, genuine password UI/native JWT |
|401 / refresh-only bootstrap | PASS in scope | Automatic native refresh/retry, correct owned identity |
| Local transport interruption | PASS in scope | Screen appears, key survives, profile automatically restores |
| Logout / revoked reopen | PASS in scope | Native logout, cleared storage/user, refresh401 and Login |
| Fresh UI relogin | PASS in scope | Profile return, fresh key, consumed saved fallback |
| Full Telegram / visual / accessibility / WS | NOT_VERIFIED | One desktop native-API scenario only |
| Payments / subscription / Panel | NOT_RUN | No merchant or Panel writes; fixture business records zero |

## Failure / recovery / defects

Original F-RECOVERY-01 and F-RECOVERY-02 failures preserved. Both fixes passed on
the final artifact; intermediate artifacts/results remain separate. Seven final
native stages PASS, uncaught exceptions0. Expected injected transport/401 console
errors retained; no zero-console claim. Actual elapsed JWT expiry, active-form
preservation and broader recovery races remain outside scope.

## Decision / residual risks

Full S9 PARTIAL; full live and default-policy Release gates BLOCKED. Earlier
L-ABAC-01/02, L-PAY-API-01, Classic auto-purchase, Cashera discovery, physical
device, read-only Panel and merchant limits unchanged. No owner acceptance of a
new Release inferred from this frontend fix. Production smoke NOT_STARTED.
Original compiled artifact preserved privately; no production rollback required.

## Final sign-off

Only new accounts/refresh rows/temp Email-auth flag removed. Independent
postflight18:19:51 UTC confirmed disabled login403, original core/refresh/config/
images and three healthy/restart0/OOMfalse services. Browser storage cleared,
local bridge stopped; previous transition VPS left running with whole cleanup
SKIPPED_OWNER_REQUEST. No backend/Installer/site/commit/Release/production action.
Report contains no credentials, tokens or personal account data.
