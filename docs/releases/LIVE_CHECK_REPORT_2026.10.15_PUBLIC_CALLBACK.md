# Live check — genuine canceled sandbox callback — 2026-10-15

**PASS for the selected canceled-payment delivery scenario. Full S9 PARTIAL.**

1. On the existing disposable VPS, the original merchant URL was temporarily
   routed through live Caddy to a separate schema0131 DB/Redis/same-native-image
   worker. Parent data was not copied; backend/SDK/product source was unchanged.
2. The owner authorized one new declined sandbox50 RUB invoice. Native
   PaymentService created it once. One test-card submission displayed insufficient
   funds. Recurring consent was not selected; no successful payment was repeated.
3. The earlier pending provider state was correctly left open. A real
   `payment.canceled` arrived05:33:02 UTC15 Oct, passed native IP checks, matched
   the owned ID and received native200. This was not an operator callback fixture.
4. Independent DB observation confirmed canceled/unpaid5000/RUB, balance0,
   transactions0, subscriptions0, no transaction link. Historical succeeded50 RUB
   merchant/one-credit PASS was not rerun or invalidated.
5. Owned cleanup and independent postflight06:57:13 UTC passed: exact live Caddy
   rollback, parent candidate/env/Compose/data/source/images preserved, original
   three services healthy/restart0/OOMfalse, owned DB/containers/root/listeners
   absent. Parent whole cleanup SKIPPED_OWNER_REQUEST.

The temporary callback receiver is removed; the parent is back to its original
configuration. This does not prove a permanent payment-enabled deployment,
capture/refund/recurring flows, initial paid concurrency, physical Mini App,
full `main.py` startup or a new Release Bundle.

[Canonical evidence](../compatibility-evidence-v1801-bot-v5-public-callback-20261015.md)
and [machine receipt](../compatibility-evidence-v1801-bot-v5-public-callback-20261015.json).
