# Live Check Report: read-only current payment readiness

Status: **BLOCKED (current live receiver); read-only findings recorded**<br>
Date: 2026-10-14 UTC /15 October Moscow<br>
Checker: OpenCode<br>
Owner: asked to inspect problems and authenticated the test Merchant Profile

Формат: [LIVE_CHECK_REPORT_TEMPLATE](../../LIVE_CHECK_REPORT_TEMPLATE.md).
[Canonical audit / JSON](../compatibility-evidence-v1801-bot-v5-current-payment-audit-20261014.md).

## Environment / identity

Current owner-left test transition stack, Bot
`5bda3c56f0afd9f4813e9c6fa48934948b05ebae`, image
`sha256:bf27d5f0e1b9ec0b46979be6536877ced98b00c822b32d1e03a80a4677da6205`,
Installer `75c49bec9c2a764e123fc0ef675f8c45fc22a1ab`.
Known SSH key/owner/schema/SHA/image/state freshly verified. No new deploy/build,
browser matrix or previously closed suite rerun. No production inspection.

## Read-only functional findings

| Area | Result | Scope |
| --- | --- | --- |
| Merchant shop / URL / events | PASS in observed scope | Owner-authenticated test shop matches saved credentials; original URL and four events read back |
| Current test callback receiver | BLOCKED / E-PAY-STAND-01 | Same current parent-domain URL returns404; YooKassa env disabled/no credentials, no DB overrides |
| Runtime preservation | PASS in scope | Core/config/images unchanged during reads; three healthy/restart0/OOMfalse services |
| Prior real sandbox50 RUB success | REUSED_PASS | Actual provider notification/one credit already proved; not repeated or invalidated |
| SDK / policies / classic | EXISTING_OPEN | Saved transport/access failures and exact v5 classic source mismatch reviewed without rerun |
| Refund / full paid concurrency / physical / Release | NOT_VERIFIED | No new live financial, Panel/device or public package operations |

## Decision / preservation

Full S9 PARTIAL, current live receiver not ready. Correct portal settings do not
configure an already removed sandbox runtime. This is an environment blocker,
not a newly observed ordinary-payment product regression. Existing native
limitations retain OPEN; no backend implementation is part of the task.

Zero provider/callback POST/payment/config/source mutations. Owner portal login
enabled readback; no credential, shop ID or URL literal in public evidence.
Parent left running, whole cleanup SKIPPED_OWNER_REQUEST. No commit/Release/
production action. Existing frontend tests/build/budget limits retain their scope.
