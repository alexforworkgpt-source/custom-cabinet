# Live Check Report: exact public Custom Cabinet frontend

Status: **PUBLIC_FRONTEND_READY; device gate SKIPPED_OWNER_ACCEPTED**<br>
Date:2026-10-15<br>
Checker:OpenCode<br>
Owner scope:permanent Upstream Bot working baseline; continue frontend/connection

Format: [report template](../../LIVE_CHECK_REPORT_TEMPLATE.md).
[Canonical staging state / machine evidence](../frontend-staging-20261015.md).
[Later owner waiver and release-preparation readiness](FRONTEND_RELEASE_READINESS_2026.10.15.md).
The owner skipped the real Telegram/device check for the current candidate;
historical deployment/guest results remain unchanged, no device PASS claimed.

## Source identity and environment

| Item | Identity |
| --- | --- |
| Custom Cabinet HEAD |`1169e3cb964caec9a9500ace89bbb53b7e5a89df` plus preserved uncommitted work |
| Upstream Cabinet target |`a693d30ca6084b9a54b45a72294b99237841ef13` |
| Existing unchanged Upstream Bot |`5bda3c56f0afd9f4813e9c6fa48934948b05ebae` |
| Exact284-file compiled manifest |`0aa20cd0f035ec41fd4f0270a1b4e94f04a0bd03075d92e3493334728bd170d0` |
| New Release Bundle / production |Not scheduled/NOT_STARTED; no publication operations |
| Staging |Existing disposable test Cabinet address; URL/owner paths remain in private receipts |
| Serving |Existing Caddy, isolated static directory, original API/health routes retained |
| Ready time |13:56:39 UTC |
| Browser |Chrome155.0.8059.40,320/375/1280,guest/en |

## Scope and gates

Upstream Bot is the accepted working foundation. No independent backend/payment/
SDK/RBAC suite is part of this continuation. Its normal API is used only for the
Cabinet connection/guest page flow and operational route preservation.

| Gate | Result |
| --- | --- |
| Existing ordinary unit/build/both TS |Reused PASS1084 unit; app/E2E/build inputs and exact compiled bytes unchanged |
| Existing full compiled browser |Reused1146 PASS/35 configured SKIP; not rerun |
| Every public static file |284 HTTPS hashes equal tested manifest |
| SPA routes / missing static |4 routes index200; missing JS404 |
| Native API connection |Branding/languages/health JSON200; no frontend marker on API, stable branding/language hashes |
| Guest public browser |Protected entry→Login, login/consent rendered;320/375/1280 no overflow; offer/reload/back PASS |
| Uncaught JS exceptions |0 in this smoke |
| Real Telegram/signed authentication |SKIPPED_OWNER_ACCEPTED, not PASS or substituted by guest Chromium |

Public cache control is no-store; frontend responses expose only the test artifact
hash. No login confirmation, payment, subscription creation, DB fixture, backend
restart or source/API modification. Initial SSH packet quoting failure occurred
before remote upload/Caddy application; fresh preflight and corrected stdin
transport completed successfully, preserving the failed setup receipt.

## Preservation / rollback / current decision

Independent14:03:35 UTC post-observe: original3 containers/image IDs/restart counts
and5 managed config hashes preserved. Only active Cabinet-site frontend routing
differs; original Caddy bytes/node/link metadata saved. Managed Cabinet/Release
state and hook/API/health handling were not replaced.

Initial deployment journal **FRONTEND_READY_WAITING_DEVICE** remains recorded.
The owner later waived that device step; it is no longer a current todo.
Rollback controller is prepared but not executed; it restores original serving
without touching Bot and retains the own packet. Frontend cleanup
**NOT_RUN_FRONTEND_RETAINED**, whole parent cleanup **SKIPPED_OWNER_REQUEST**.
Before a new Bundle smoke, remove the override from its verification path.
Canonical report contains the exact command/guards; old payment/transition finish
controllers must not be used. Historical OPEN/BLOCKED remain facts of their scope,
not new backend tasks or automatic PASS. No full live/Release sign-off claimed.
