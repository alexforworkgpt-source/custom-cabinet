# Public test callback receiver / one declined sandbox invoice — 2026-10-15

## Result and reference

**Receiver readiness PASS; genuine merchant canceled delivery PASS;
owned cleanup and independent rollback postflight PASS.**
Compared with the read-only audit on 2026-10-14, the same Merchant Profile HTTPS
callback URL now returns native `200`, `service=yookassa_webhook`, `enabled=true`
through the active Caddy route. Merchant settings were not changed.

Upstream Bot v5 source remains `5bda3c56f0afd9f4813e9c6fa48934948b05ebae`, native image
`sha256:bf27d5f0e1b9ec0b46979be6536877ced98b00c822b32d1e03a80a4677da6205`.
This is a selected native payment-router/service proof, not full `main.py`
startup, Custom Cabinet deployment, Release Bundle or full S9 PASS.

## Isolation and routing

- Separate schema-only0131 database, Redis and same-image worker; parent data is
  not copied. One owned user has zero balance and no subscriptions.
- TLS is the existing public Caddy certificate; native IP checks remain enabled.
  An external test-scope admission proxy forwards only the owned payment ID and
  preserves the real forwarded source. No provider address was injected.
- Only the exact callback path is temporarily routed to the isolated receiver.
  The active `/etc/caddy/conf.d/<compose-project>.caddy` file has an owned backup
  and compare-before-restore guard. Parent candidate `state/bot-stack.caddy`,
  env files, Compose configuration and original business data are unchanged.
- The receiver was retained while awaiting terminal provider status. After the
  genuine callback and zero-financial-state proof, only its owned database,
  Redis/worker, control directory and listeners were removed, and the exact live
  Caddy bytes restored. Whole parent cleanup remains SKIPPED_OWNER_REQUEST.

## Operations and observations

1. Fresh SSH fingerprint/ownership/runtime preflight confirmed the same three
   healthy parent services, restart0/OOMfalse and original core digest
   `147711bb81d1241a67468afddbc2cd0d5fc940fd55717c8c799d90ac6ccf3690`.
2. Initial receiver setup rolled back cleanly: the candidate Caddy file is not
   the live imported snippet. Correcting the infrastructure target produced
   public200 at `2026-10-14T23:47:07.095716+00:00`.
3. Old canceled-object scope saw no genuine callback during its observation
   window. The owner then explicitly authorized **one new declined sandbox50 RUB
   invoice**; this is not a repeat of the historical succeeded/credited50 RUB gate.
4. Native `PaymentService.create_yookassa_payment` created exactly one pending
   test invoice at provider time `2026-10-15T04:31:01.040Z`, amount5000 kopeks/RUB,
   balance_topup metadata, no cart/subscription metadata. Its ID and checkout URL
   remain in ignored private receipts. No create retry was performed.
5. The test checkout identified the operation as a test payment. One attempt with
   the insufficient-funds test card displayed **«Не хватает денег»**. Recurring
   consent and receipt checkboxes were unchecked; payment submission was not repeated.
6. At `2026-10-15T04:43:40.474602+00:00`, a real native SDK GET of the **new** ID
   returned `pending`, `paid=false`, `test=true`, no `cancellation_details` and no
   `expires_at`. Local state remained pending/unpaid, one5000/RUB payment,
   balance0/transactions0/subscriptions0 and no transaction link.
7. Earlier observation04:49:54 UTC still had canceled callbacks0. This waiting
   state is preserved in historical receipts; the card refusal alone was not
   labeled terminal cancellation or merchant-delivery proof.
8. The actual provider-source `payment.canceled` arrived at
   `2026-10-15T05:33:02.713804+00:00`, passed the unchanged native IP rule and
   matched the owned target. Native response200 completed at05:33:03.621162 UTC.
   No operator callback POST or provider-address injection produced this event.
9. Independent observation `2026-10-15T06:55:17.166202+00:00` confirmed one genuine
   canceled callback accepted, zero rejected out-of-scope callbacks, one local
   canceled/unpaid5000/RUB row, no transaction link, balance0/transactions0/subs0.
10. Owned cleanup06:57:08 UTC and separate read-only postflight
    `2026-10-15T06:57:13.222932+00:00` PASS: exact live Caddy/candidate/env/Compose,
    original core digest/source/images and three healthy/restart0/OOMfalse parent
    services match the fresh preflight; owned DB/containers/root/listeners absent.

No capture/refund API calls, successful charge, balance credit, Panel mutation,
backend/SDK/product source change, commit, Release or production transition.
Historical real merchant success50 RUB/one credit remains PASS. SDK/ABAC/classic
and other existing OPEN limits retain their scopes.

## Preparation diagnostics retained

Infrastructure-only diagnostics include an expired preflight guard, candidate vs
live Caddy distinction, inherited Compose image labels affecting the parent
inventory, and a temporary502/non-JSON response while restarting the owned worker.
The one invoice was already created before that last readiness interruption;
the follow-up was a read-only readiness check, not another creation. These are
not declared product regressions. Current receiver is ready.

## Completion and future reuse

Ignored controller and receipts:
`.scratch/bedolaga-v5-public-callback-20261015/` at workspace root.
Read `observe.json`, `finish.json` and `postflight.json` for the completed result;
`ready-target.json`, `read-target.json` and `wait-canceled.json` preserve the
earlier pending state. Private target IDs/checkout data are not published.

This selected scenario is complete. Do not rerun it or create another invoice
without changed inputs or a new reason. The temporary public receiver is removed;
the parent transition stack continues running in its original configuration.
Successful cleanup is not evidence of a permanently configured merchant receiver.
No full S9, capture/refund/recurring, initial paid concurrency, physical Mini App
or new Custom Cabinet compiled-artifact gate is implied by this selected PASS.

See [machine-readable evidence](compatibility-evidence-v1801-bot-v5-public-callback-20261015.json)
and [live check report](releases/LIVE_CHECK_REPORT_2026.10.15_PUBLIC_CALLBACK.md).

Related: [previous readiness audit](compatibility-evidence-v1801-bot-v5-current-payment-audit-20261014.md),
[historical real success](compatibility-evidence-v1801-bot-v5-sandbox-20261014.md),
[closed HTTPS lab](compatibility-evidence-v1801-bot-v5-callback-https-20261014.md).
