# S9: current payment readiness and confirmed issues — 2026-10-14 UTC

Status: **current test receiver NOT_READY; full S9 PARTIAL**.
Read-only inspection at21:05–21:14 UTC,00:05–00:14 on15 October Moscow.
[JSON evidence](compatibility-evidence-v1801-bot-v5-current-payment-audit-20261014.json)
and [live report](releases/LIVE_CHECK_REPORT_2026.10.14_CURRENT_PAYMENT_AUDIT.md).

## Current merchant settings were read back

After the owner authenticated in the browser, the live Merchant Profile showed
**the correct test shop**: its ID fingerprint matches the existing private test
API credentials. HTTPS notification URL matches both the original saved sandbox
URL and the **currently expanded application host in parent Caddy**. Selected
events are payment.succeeded, payment.waiting_for_capture, payment.canceled and
refund.succeeded. No edit/save, new payment, cancellation, capture or refund.
URL/shop IDs and credentials are not published.

The earlier browser attempt required sign-in; it is superseded by this actual
owner-authenticated readback. The base TEST_APP_DOMAIN env value is not the
deployed-host comparison reference: the expanded parent Caddy application host
was checked separately. Those host checks match the merchant URL.

## One current environment blocker

**E-PAY-STAND-01 / TEST_ENVIRONMENT_BLOCKER:** verified HTTPS GET to the configured
callback URL returns404 with native Not Found JSON. Running parent container env
has YooKassa disabled and neither shop ID nor secret key; native system_settings
contains no YooKassa override rows. The env check is not a claim of introspecting
Python-process memory; public404 and absent env/DB credentials support the
receiver-not-configured finding.

This is the owner-left transition test stack, not production. The previously
configured sandbox was removed. Merchant settings are correct in the observed
scope, but the remaining stack is not ready for a new live provider callback.
Only the historical GET was reused after confirming the identical current URL;
no callback POST or ordinary payment was repeated. Current parent/core/config/
images preserved during the read; three healthy services/restarts0/OOMfalse,
known SSH fingerprint and local server.env unchanged.

## Existing confirmed problems / precise evidence scope

| Item | Actual issue or limit | Reference / scope |
| --- | --- | --- |
| L-PAY-API-01 | Native API transport can time out and SDK masks the absent response as None.status_code; processing can be delayed/rejected | [Payment race](compatibility-evidence-v1801-bot-v5-payment-race-20261014.md) and [canceled-state](compatibility-evidence-v1801-bot-v5-payment-state-20261014.md) saved failures; no new SDK calls |
| L-ABAC-01/02 | Deny policy remains after assignment expiry or role deactivation despite exclusion from returned permissions | [Native policy proof](compatibility-evidence-v1801-bot-v5-abac-20261014.md), two confirmed HTTPS failures; not rerun |
| Classic auto-purchase | Purchase producer saves subscription_purchase; dispatcher does not handle that explicit mode | [Historical live issue](known-issues/classic-auto-purchase.md); same mismatch re-read in exact v5 source, not a new live Panel flow |
| YooKassa refund event | Merchant selects refund.succeeded, but native router returns200 ignored; this is not refund accounting proof | [Native HTTPS lab](compatibility-evidence-v1801-bot-v5-callback-https-20261014.md); full real refund result remains unverified |
| Default unit budget | Follow-up default5s unit runs timed out on unchanged audience tests;1084 passed with explicit2 workers/10s | [Frontend recovery proof](compatibility-evidence-v1801-bot-v5-browser-recovery-20261014.md), not rerun and not mislabeled as default-policy PASS |

Exact v5 source review for classic: purchase.py contains subscription_purchase;
_process_single_cart supports extend/tariff_purchase/daily_tariff_purchase/
add_devices/add_traffic and skips an unknown explicit mode. This is source-only
confirmation of the existing mismatch; Remnawave remains read-only and no new
subscription/Panel action occurred. No backend/SDK fork, patch or implementation
work item is proposed or created by this review.

## Passed and unverified are distinct

The prior [50 RUB sandbox](compatibility-evidence-v1801-bot-v5-sandbox-20261014.md)
**already proved a real merchant success notification**, one5000-kopek credit,
one transaction and eight repeats of already-credited service processing with
no extra credit. Current unavailable receiver does not invalidate that dated
PASS, require another ordinary payment or mean no genuine notification was ever
seen. Later TLS lab operator requests retain their narrower scope.

Not verified is not the same as a newly discovered bug: genuine initial paid
concurrency, actual canceled merchant delivery, full capture/refund/recurring/
Cashera, physical Mini App navigation and new/default-policy publication gates
remain incomplete. No duplicate credit was observed in completed evidence;
unverified scenarios are not financial guarantees.

## Preservation / next boundary

Only read-only SSH/Docker/SQL/env-presence/HTTPS GET/browser DOM observations.
No provider API calls, callback POSTs, payments, merchant/runtime/DB/Caddy/UFW
changes, source edits, commits, Release or production actions. Parent transition
runtime remains running; whole cleanup SKIPPED_OWNER_REQUEST.

Local receipts in workspace `.scratch/bedolaga-v5-current-payment-audit-20261014/`:
result.json records the initial inspection, merchant-readback.json the live
authenticated configuration, routing-detail.json the exact domain comparison.
Sensitive shop/URL/credential values stay private; public report contains only
readiness facts. Completing a future live scenario needs a configured isolated
receiver on the selected test URL; neither merchant reset nor repetition of
closed success checks follows from this audit.
