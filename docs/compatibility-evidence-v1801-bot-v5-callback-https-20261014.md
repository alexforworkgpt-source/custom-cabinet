# Bot v5: native callback router over loopback HTTPS — 2026-10-14

Status: **PASS_IN_SCOPE**,14/14 selected checks matched. Full S9 **PARTIAL**,
full live/Release sign-off **BLOCKED**.
[JSON evidence](compatibility-evidence-v1801-bot-v5-callback-https-20261014.json)
and [live report](releases/LIVE_CHECK_REPORT_2026.10.14_CALLBACK_HTTPS.md).

## Exact layer being tested

This adds TLS/HTTP/router coverage to the earlier
[canceled service-state proof](compatibility-evidence-v1801-bot-v5-payment-state-20261014.md).
Unchanged Bot `5bda3c56f0afd9f4813e9c6fa48934948b05ebae`, Installer
`75c49bec9c2a764e123fc0ef675f8c45fc22a1ab`, native image
`sha256:bf27d5f0e1b9ec0b46979be6536877ced98b00c822b32d1e03a80a4677da6205`,
Ubuntu24.04/PG15/Redis7/schema0131. Fresh known-SSH/owner/schema/SHA/image preflight.

Separate empty schema-only DB/Redis and the same image hosted the unchanged
native `create_payment_router` and `PaymentService`, without a Bot instance or
main.py/background processors. Uvicorn served actual TLS `/yookassa-webhook`
through a loopback-only Docker port. This is **not** the deployed public
merchant URL, stock Caddy `/api` prefix route, full unified lifespan or new Bundle.
Parent Cabinet remains published reference bundle-v2026.10.10.1.

The native IP gate remained enabled and its allowed list unchanged. Only the
worker trusted its Docker gateway. The accepted provider address in forwarded
headers was an explicit **test trusted-hop fixture**. All callbacks originated
from the operator test client, not YooKassa. There is no authentic merchant
delivery claim. Real provider API replies were unmocked; no test-added native
handler/SDK patch. A transparent ASGI test observer copied request/response
timings and native IP-resolution facts without altering bytes or outcomes.

Native ORM seeded one fixture user/pending unpaid5000-kopek/RUB payment from the
previously confirmed canceled sandbox reference. No original business rows were
copied/reset. The old succeeded/credited object was not replayed or requested.

## TLS and selected HTTP guards

One TLS negative assertion, nine selected sequential HTTPS requests and four
concurrent requests:14 matching checks. Readiness health GETs are not counted.

The new owned self-signed certificate had SAN127.0.0.1. Normal trust rejected it;
the client explicitly trusted that certificate and verified both chain and
hostname. Negotiated TLSv1.3, certificate SHA256
`1ddb0c5ef03931acc2bea0ab05abdcea7cf66300f82d8403dddbfeeb1c0d14eb`.
Certificate verification was never disabled; generated key/cert were removed.

| Test | Native observation |
| --- | --- |
| No forwarded source |403 unknown_ip |
| False Cloudflare address with nonprovider XFF |403 forbidden_ip |
| False X-Real-IP with nonprovider XFF |403 forbidden_ip |
| Rightmost nontrusted XFF hop |403 forbidden_ip |
| Accepted-hop empty body |400 empty_body |
| Accepted-hop invalid JSON |400 invalid_json |
| Accepted-hop missing event |400 missing_event |
| Unsupported refund.succeeded |200 ignored; no refund/accounting operation proved |
| Missing payment ID |500 processing_failed; existing native behavior, not robust400/schema proof |

Independent DB state after these guards exactly matched the initial fixture:
balance0/transactions0/subscriptions0, one pending/unpaid/unlinked5000/RUB row.

## Four concurrent HTTPS operator callbacks

Four independent TLS requests started on a barrier. Each deliberately claimed
`payment.succeeded`, succeeded and paidtrue for the actual canceled/unpaid object.
Native callbacks opened the normal DB/session path and performed real provider
revalidation; all four returned HTTP200. Native ASGI intervals share0.699614s of
overlap, proving simultaneous in-handler execution rather than sequential calls.
The worker logged four native provider lookups.

Final state: one canceled/unpaid/unlinked5000-kopek/RUB record, balance0,
transactions0/subscriptions0, correct fixture target. This is concurrent canceled
no-credit HTTP/router authority proof; it is not first successful paid credit,
actual provider network origin or an eight-confirmed paid-delivery race.
Earlier SDK-read failures/L-PAY-API-01 remain OPEN; this run does not replace them.

## Official notification context / remaining delivery boundary

[Official notification documentation](https://yookassa.ru/developers/using-api/webhooks)
states HTTP200 acknowledges a notification and other responses cause retries
for24 hours after the event. For Basic Auth, configuration is through the
Merchant Profile; the API webhook configuration documented there is OAuth-only.
No merchant setting, notification replay API or new payment was used here.
The private loopback fixture and trusted forwarded address do not establish
that the existing merchant URL is currently configured/reachable or has received
an actual notification. That scope remains NOT_VERIFIED.

## Cleanup and preservation

Independent postflight **2026-10-14T20:11:59.299479+00:00** (23:11:59 Moscow)
confirmed the owned database, Redis/worker, control directory, key/cert and TLS
listener absent. Original selected core projections matched this stage's **fresh
preflight**, five runtime config hashes/images preserved; three healthy services,
restart0/OOMfalse, known SSH key and local server.env unchanged.
This is not equality with an older checkpoint or all DB/log/counter bytes.
Caddy/UFW/public domains and parent Bot/process configuration were not changed.
Whole transition VPS cleanup remains **SKIPPED_OWNER_REQUEST**, parent running.

Native stdout+stderr and transparent transport receipts remain private under
workspace `.scratch/bedolaga-v5-callback-https-20261014/`; no secret, fixture
provider ID or personal metadata in public evidence. Controller has a start
marker;14 completed checks must not be repeated without new inputs/reason.

No provider/Panel/subscription mutations, runtime source edit, commit, Release or
production operation. Completed frontend/schema/Installer/role/ABAC and earlier
financial gates were not rerun. Remaining genuine merchant/public callback,
paid first delivery/concurrency, capture/refund/recurring/Cashera, physical-client
and default-publication gates retain their earlier limits.
