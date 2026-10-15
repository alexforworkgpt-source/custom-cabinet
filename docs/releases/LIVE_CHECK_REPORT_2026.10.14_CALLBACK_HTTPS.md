# Live Check Report: native callback HTTPS transport

Status: **BLOCKED (full live);14/14 targeted TLS/HTTPS checks PASS**<br>
Date: 2026-10-14<br>
Checker: OpenCode<br>
Owner: продолжение S9, закрытый тестовый callback-стенд и existing canceled object

Формат: [LIVE_CHECK_REPORT_TEMPLATE](../../LIVE_CHECK_REPORT_TEMPLATE.md).
[Canonical report / JSON](../compatibility-evidence-v1801-bot-v5-callback-https-20261014.md).

## Identity / environment

Bot `5bda3c56f0afd9f4813e9c6fa48934948b05ebae`, Installer
`75c49bec9c2a764e123fc0ef675f8c45fc22a1ab`, native image
`sha256:bf27d5f0e1b9ec0b46979be6536877ced98b00c822b32d1e03a80a4677da6205`;
Ubuntu24.04/PG15/Redis7/schema0131, separate DB/Redis/worker. Native payment router
unchanged, test TLS app instead of main.py/full lifespan. Loopback only,
TLSv1.3/owned trusted certificate with hostname verification; no public merchant
URL, Caddy route or new Bundle deployed. Parent published Cabinet unchanged.

## Automated / functional checks

One TLS rejection, nine sequential HTTPS guards and four concurrent callback
assertions all matched. No API response/SDK/native handler mocking. Transparent
ASGI observer is test-only; native IP resolution runs with skip_ip_check=false.
Accepted source address is a trusted-forwarded fixture, not actual YooKassa.

| Area | Result | Scope |
| --- | --- | --- |
| TLS | PASS in scope | Unpinned cert rejected, pinned chain/hostname verified, TLS1.3 |
| Source headers | PASS in scope | No source/false CF/false real-IP/rightmost wrong hop rejected403 |
| HTTP input | PASS in scope | Empty/invalid JSON/missing event400; missing payment ID gives native500 |
| Unsupported refund | OBSERVED_IGNORED |200 ignored; no refund support/accounting proof |
| Four concurrent requests | PASS in scope | Actual HTTPS/native router/API lookups;4×200, common0.699614s handler overlap |
| Ledger state | PASS in scope | One canceled/unpaid row, balance0/transactions0/subscriptions0 |
| Real merchant/public callback | NOT_VERIFIED | Operator requests and forwarded fixture do not prove provider delivery |

## Platform / recovery / residual risks

Browser/Telegram/device/theme/locale/accessibility gates NOT_RUN here. Earlier
frontend evidence and default5s unit limitation retained. SDK/source/runtime
timeouts unchanged; L-PAY-API-01 remains OPEN. No guarantee of all malformed
request behavior or full IP/proxy coverage. Source main.py/lifespan and stock
Installer Caddy prefix layer were not tested again.

Full S9 PARTIAL, full live/Release BLOCKED. Paid first delivery/concurrency,
remaining merchant, full ABAC/physical/default-publication and existing OPEN
limitations unchanged. Actual merchant Basic Auth notification configuration
was not modified or independently read back by this closed lab.

## Production / final sign-off

Production smoke NOT_STARTED; no commit/Release/production or rollback operation.
Owned database/containers/control root/certificate/listener removed; independent
postflight20:11:59 UTC confirms current fresh-baseline core/config/images and
healthy/restart0/OOMfalse parent preserved. Caddy/UFW and local server.env unchanged.
Whole transition VPS cleanup SKIPPED_OWNER_REQUEST, parent running.
Provider/Panel/subscription mutations0; no backend/source patch.
