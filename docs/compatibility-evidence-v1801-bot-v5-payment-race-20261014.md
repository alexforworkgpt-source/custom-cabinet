# Bot v5: first local payment-processing race fixture — 2026-10-14

Status: **PARTIAL_WITH_PROVIDER_READ_LIMIT**.
Observed financial invariant PASS: six provider-confirmed native deliveries
credited5000 kopeks once and produced one linked transaction. The intended
eight-confirmed-delivery profile is **NOT_PASS**: two native provider reads
failed, so only six sessions reached the guarded payment update.
[JSON evidence](compatibility-evidence-v1801-bot-v5-payment-race-20261014.json)
and [live report](releases/LIVE_CHECK_REPORT_2026.10.14_PAYMENT_RACE.md).
Full S9 remains PARTIAL; this is not a full payment/live PASS.

## Exact runtime and isolation

Unchanged Upstream Bot `5bda3c56f0afd9f4813e9c6fa48934948b05ebae`, Installer
`75c49bec9c2a764e123fc0ef675f8c45fc22a1ab`, Ubuntu24.04/PG15/Redis7.
Existing native image:
`sha256:bf27d5f0e1b9ec0b46979be6536877ced98b00c822b32d1e03a80a4677da6205`;
installed YooKassa SDK3.12.1. Fresh preflight verified the transition owner
marker/known SSH fingerprint and healthy original services.

A separate owned database on the existing test PostgreSQL received only the
current0131 schema, no original user/payment/business rows. A separate empty
Redis and short-lived worker used the same native Bot image. No public port,
webhook/Caddy/UFW change or original Bot restart. The worker's database/Redis
settings and merchant credentials existed only in its temporary environment.
The probe asserted its separate database identity before writing any fixture.

The existing real succeeded50 RUB sandbox provider object was reused read-only.
A native ORM user matching its metadata and a native pending local payment
were created in the empty fixture DB: balance0, transactions0, no subscriptions,
no linked transaction and is_paidfalse. The previous credited payment record
was not reset. No new provider payment, charge, refund or capture was created.

This models **first local service processing** of a pending record, using real
provider revalidation. It is not the real first delivery of a newly created
merchant payment or simultaneous HTTPS callbacks. The HTTP IP/router gate and
new Custom Cabinet artifact were not tested by this service-only worker.
The original VPS still serves the published reference Cabinet from
bundle-v2026.10.10.1; its identities remain in the JSON.

## Actual concurrency and financial observations

Eight native AsyncSession instances acquired distinct PostgreSQL connections.
An external fixture transaction held the new payment row lock while the eight
unmodified `PaymentService.process_yookassa_webhook` calls began. Each used the
native provider lookup; no handler, SDK call or provider response was mocked.

Before lock release, six native sessions were observed waiting on locks in that
isolated DB. Its payment remained pending/unpaid/unlinked, balance0 and
transactions0. Two other deliveries had failed provider reads and returnedFalse.
The guard then released its lock. Six deliveries returnedTrue; none raised a
caller-visible exception. Final state:

| Field | Before / held | After |
| --- | --- | --- |
| Balance, kopeks | 0 | 5000 |
| Transaction count | 0 | 1 |
| Payment status | pending | succeeded |
| is_paid / transaction linked | false / false | true / true |
| Subscription count | 0 | 0 |

This establishes single credit in the observed six-confirmed-handler race.
It does not establish eight successful first deliveries. Source/runtime gates
and the older eight **already-credited duplicate** calls were not repeated.

## Provider-read diagnosis / OPEN L-PAY-API-01

The saved native log contains two transport `ReadTimeout` traces, followed by
`AttributeError: 'NoneType' object has no attribute 'status_code'` in the installed
SDK's error path. `ApiClient.request` catches a transport exception and passes
its absent HTTP response to `__handle_error`, which dereferences status_code.
The unchanged native provider wrapper returns no confirmed payment for these
calls; the corresponding native deliveries returnedFalse.

A subsequent read-only diagnostic, with no DB calls or provider mutations,
confirmed2/3 sequential reads and8/8 parallel reads. The failed sequential read
had the same ReadTimeout→AttributeError path. Thus a deterministic parallel-only
shared-client cause was not confirmed. The later successful parallel reads do
not replace or turn the financial race profile into PASS.

Two relevant native payment modules were independently hashed against raw Git
blobs at the exact Bot SHA; both match. This targeted inspection was prompted by
the SDK diagnostic, not a repeat of the full810-file integrity gate. The native
upstream SDK timeout wrapper was preserved; no backend/SDK source change,
dependency upgrade or implementation work item is part of this task.
L-PAY-API-01 remains OPEN for the observed provider-read/error-reporting limit.

## Cleanup and preservation

The new worker/Redis containers were removed only after verifying their owner
labels. The fixture DB was dropped only after its exact generated name and
database owner marker were verified. The schema-only setup and fixture data
were not a repeat migration/lifecycle gate. Raw logs and receipts remain private
under workspace `.scratch/bedolaga-v5-payment-race-20261014/private/`.

Independent postflight `2026-10-14T16:03:15.541954+00:00`
(19:03:15 Europe/Moscow) confirmed the new DB/containers absent and the original
core user/role/policy/payment/transaction/subscription records unchanged.
Five original configuration-file hashes, image IDs and healthy/restart0/OOMfalse
services matched preflight; local server.env was preserved. Original logs/counters
are not claimed byte-identical. Earlier transition VPS cleanup remains
SKIPPED_OWNER_REQUEST and its runtime stays running.

Panel writes, subscription mutations and provider mutation calls were0. No
frontend source, commit, public Release or production operation occurred.
Full S9 remains PARTIAL: actual initial merchant/HTTPS concurrency, other payment
flows, physical Mini App navigation, read-only Panel, public Bundle and the
existing OPEN ABAC/Classic/Cashera limitations are not closed.
