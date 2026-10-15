# Live Check Report: native canceled payment / missing-row recovery

Status: **BLOCKED (full live); three native service stages PASS with read limit**<br>
Date: 2026-10-14<br>
Checker: OpenCode<br>
Owner: продолжение S9; owned sandbox object read-only, isolated test data

Формат: [LIVE_CHECK_REPORT_TEMPLATE](../../LIVE_CHECK_REPORT_TEMPLATE.md).
[Canonical report / JSON](../compatibility-evidence-v1801-bot-v5-payment-state-20261014.md).

## Identity / environment

Bot `5bda3c56f0afd9f4813e9c6fa48934948b05ebae`, Installer
`75c49bec9c2a764e123fc0ef675f8c45fc22a1ab`, native image
`sha256:bf27d5f0e1b9ec0b46979be6536877ced98b00c822b32d1e03a80a4677da6205`.
Ubuntu24.04/PG15/Redis7/schema0131, existing SDK3.12.1/native timeout wrapper.
Owned separate schema-only DB/Redis/worker. Parent Cabinet remains published
reference bundle-v2026.10.10.1; no new compiled UI or public Bundle deployed.
Browser/theme/locale/Telegram/device versions NOT_RUN in this service-only scope.

## Automated / functional scope

Provider GET now confirms the previously declined test object canceled/unpaid,
50 RUB, insufficient_funds. No new merchant operation. Initial SDK read failed
at TLS handshake before user/payment fixture creation; NOT_PASS receipt retained.
Two read-only native confirmations allowed one run of the previously unstarted
service scenarios. No runtime/SDK/timeout patch or mock added by the test.

| Area | Result | Scope |
| --- | --- | --- |
| Real provider terminal state | PASS | Existing owned object test/canceled/unpaid confirmed read-only |
| False success / paid claim | PASS in scope | Native revalidation leaves canceled/unpaid, zero credit |
| Sequential repeat | PASS in scope | No transaction, unchanged canceled state |
| Missing local record | PASS in scope | Only isolated fixture row deleted; native restore to one5000-kopek/RUB unpaid row |
| Initial transport failure | NOT_PASS | SDK read failure before service stages; L-PAY-API-01 OPEN |
| Actual merchant HTTPS cancellation | NOT_VERIFIED | Service input is not an actual notification/IP/router proof |
| Paid concurrency / capture / refund / recurring / Cashera | NOT_VERIFIED | Earlier evidence and remaining limits retained |

After every successful stage: balance0/transactions0/subscriptions0, one canceled
unpaid payment with no transaction link. Four native provider reads in that run.
No uncaught-success/always-available claim: initial failure and diagnostic remain
separate from the successful scope.

## Platform / accessibility / recovery

No new browser/physical Telegram/visual/accessibility gate. Earlier compiled
recovery evidence remains unchanged, including its default5s unit limitation.
Local payment-row recovery verified only for this canceled/unpaid object; paid
financial recovery, callback retry/return and broader concurrency not inferred.

## Residual risks / decision

S9 PARTIAL, full live/Release gate BLOCKED. Existing L-PAY-API-01, L-ABAC-01/02,
Classic auto-purchase, Cashera discovery, read-only Panel and device/publication
limits unchanged. No backend implementation task or source change in this work.
Production smoke NOT_STARTED; no public Release, commit or production rollback.

## Final sign-off

Owned DB/Redis/worker removed on both attempts. Independent postflight18:56:24
UTC confirms original core/config/images preserved, three healthy/restart0/OOMfalse
services and local server.env unchanged. Parent VPS left running with entire
cleanup SKIPPED_OWNER_REQUEST. Provider/Panel/subscription mutations0.
No secrets, provider IDs or personal metadata in this report.
