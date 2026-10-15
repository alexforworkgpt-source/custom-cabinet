# Bot v5: canceled payment authority / local-row recovery — 2026-10-14

Status: **PASS_IN_SCOPE_WITH_PROVIDER_READ_LIMIT**.
Three new native service stages PASS after an initial provider-read failure;
that first attempt remains **NOT_PASS_PROVIDER_READ**, L-PAY-API-01 **OPEN**.
Full S9 **PARTIAL**, full live gate **BLOCKED**.
[JSON evidence](compatibility-evidence-v1801-bot-v5-payment-state-20261014.json)
and [live report](releases/LIVE_CHECK_REPORT_2026.10.14_PAYMENT_STATE.md).

## Provider fact and exact scope

The previously declined owned50 RUB sandbox object was fetched read-only over
verified HTTPS. It now has `test:true`, `status:canceled`, `paid:false`, amount
5000 kopeks/RUB and cancellation reason `insufficient_funds`.
This is a newly confirmed **terminal provider state**, unlike the earlier
[sandbox check](compatibility-evidence-v1801-bot-v5-sandbox-20261014.md), where
decline alone still left the object pending. No payment, cancellation, capture,
refund or charge was initiated; the previously succeeded/credited object was
not reset, replayed or requested by this probe.

Unchanged Bot `5bda3c56f0afd9f4813e9c6fa48934948b05ebae`, Installer
`75c49bec9c2a764e123fc0ef675f8c45fc22a1ab`, Ubuntu24.04/PG15/Redis7/schema0131.
Native image:
`sha256:bf27d5f0e1b9ec0b46979be6536877ced98b00c822b32d1e03a80a4677da6205`.
SDK3.12.1 and its existing native timeout wrapper are unchanged. Fresh preflight
verified the known SSH key, parent owner marker/schema/SHA/image and healthy
services. No new full810-file source-integrity gate was run.

A separate owned empty database received only schema0131, no original business
rows. Separate empty Redis and a short-lived worker used the same native image.
Only that worker carried temporary test merchant configuration in memory/env.
Native ORM recreated the provider metadata's target user and a pending/unpaid/
unlinked payment, balance0/transactions0/subscriptions0. Existing business data
was not copied or reset; this is isolated native service proof, not merchant
callback delivery, HTTP IP/router testing or compiled payment-return UI proof.
Parent Cabinet still uses the published reference bundle-v2026.10.10.1;
the new Custom Cabinet artifact was not involved in this service worker.

## Initial read failure and justified continuation

The first worker's native SDK lookup timed out during TLS handshake, followed
by ReadTimeout and SDK `None.status_code` AttributeError. It returned no confirmed
object and stopped **before creating fixture users/payments or calling the
three service scenarios**. Its schema-only DB/Redis/worker were removed; the
first receipt/log remain separate and NOT_PASS. This reproduces the existing
provider-read limit, not a new financial credit or a canceled-DTO parsing failure.

A minimal read-only check then performed two sequential lookups through the
unchanged native provider service: both confirmed canceled/unpaid50 RUB, in
0.440/0.656 seconds. No DB calls, timeout/SDK/source change or provider writes.
It did not establish a deterministic network/worker-specific cause or prove
financial handling. Verified read recovery, zero completed prior service stages
and removed owned resources permitted **one** separate attempt of the unstarted
scenarios. Controller preserves both receipts and guards both start markers.
L-PAY-API-01 stays OPEN; later reads do not replace the failure or turn the old
[eight-success race profile](compatibility-evidence-v1801-bot-v5-payment-race-20261014.md)
into PASS.

## Three successful native stages

Native `PaymentService.process_yookassa_webhook` used genuine provider lookups;
no handler/SDK/response was mocked or monkey-patched by the test. Its native
module-import timeout wrapper was preserved. The worker had no Bot instance,
SMTP was disabled, recurring was disabled, and fixture Redis started empty.

1. **False success body:** supplied `payment.succeeded`, `status:succeeded`,
   `paid:true`, amount9999.99/USD and an unrelated synthetic metadata target.
   Native provider confirmation corrected the terminal status/paid fields;
   local payment ended canceled/unpaid with no balance credit.
2. **Repeat notification:** supplied `payment.canceled` but still falsely
   claimed paid and the wrong amount/currency/target. Revalidation preserved
   canceled/unpaid and no transaction. This is sequential unpaid processing,
   not a repeat of earlier already-credited concurrency tests.
3. **Missing local row:** only the owned isolated payment row was deleted after
   verifying user/provider identity and no transaction link. Row absence and
   balance0/transactions0 were asserted. Native processing restored exactly one
   local canceled/unpaid5000-kopek/RUB record from provider metadata, with no
   transaction/credit/subscription. No original paid record was deleted.

All three calls returnedTrue and all expected states matched. The successful
worker logged four native provider lookups: initial confirmation plus one for
each stage. After every stage:

| Field | Observed |
| --- | --- |
| Balance / transaction count / subscriptions |0 /0 /0 |
| Payment count / status |1 / canceled |
| is_paid / transaction linked |false /false |
| Amount / currency |5000 kopeks / RUB |

This establishes canceled no-credit/status authority and missing-row recovery
in the observed successful service scope. Actual merchant-origin canceled
HTTPS notification, first delivery, concurrency and router/IP checks remain
NOT_VERIFIED. Service inputs must not be relabeled as actual provider deliveries.

## Cleanup / preservation

Both attempts removed only owner-labeled worker/Redis and owner-commented DB.
Independent postflight **2026-10-14T18:56:24.850881+00:00** (21:56:24 Moscow)
confirmed owned resources absent, original core user/role/policy/payment/
transaction/subscription projections and five configuration hashes/image IDs
unchanged; three services healthy/restart0/OOMfalse and local server.env preserved.
This does not claim all DB/log/counter bytes unchanged.

The parent transition VPS stays running; whole cleanup remains
**SKIPPED_OWNER_REQUEST**. No Caddy/UFW/public listener change, parent restart,
Panel/subscription/provider mutation, backend/SDK/frontend source edit, commit,
public Release or production operation.

Private receipts/logs/reference object remain in workspace
`.scratch/bedolaga-v5-payment-state-20261014/`: `result.json` retains the initial
read failure, `provider-read-diagnostic.json` records only the read check,
`second-attempt-result.json` contains the three successful stages, and
`postflight.json` proves scoped cleanup. Raw logs and provider IDs/metadata are
private and must not be published.
The saved child log captures stdout, not a complete stderr archive. Missing-row
recovery evidence is the executed row-absence assertion followed by the restored
single-row state; no separate restoration-warning log is claimed.

Completed frontend/browser/build, Installer, role/ABAC, earlier paid duplicate
and first-local race suites were not repeated. Remaining actual merchant/
capture/refund/recurring/Cashera/device/default-publication gates and all recorded
OPEN limitations retain their scope in [Compatibility Matrix](../COMPATIBILITY.md).
