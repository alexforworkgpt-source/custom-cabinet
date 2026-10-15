# Live Check Report: Bot v5 first local payment-processing fixture

Status: **PARTIAL; eight-confirmed-delivery profile NOT_PASS, no full live sign-off**<br>
Date: 2026-10-14, Europe/Moscow<br>
Checker: Codex<br>
Release owner: владелец проекта; разрешено продолжение scoped test verification

Формат: [LIVE_CHECK_REPORT_TEMPLATE](../../LIVE_CHECK_REPORT_TEMPLATE.md).

## Source Identity / Environment

Exact Bot5bda3c56, Installer75c49be, native image, SDK3.12.1 и
PG15/Redis7/Ubuntu24.04:
[payment race evidence](../compatibility-evidence-v1801-bot-v5-payment-race-20261014.md).
Прежний transition VPS подтверждён known SSH fingerprint/owner preflight.
Новый worker использовал отдельную пустую БД с schema-only копией0131 и
отдельный пустой Redis, без публичных портов и изменения основного runtime.
Исходный Cabinet — published reference bundle-v2026.10.10.1; новый uncommitted
Custom Cabinet не развёртывался. Browser/Telegram/theme/locale coverage здесь нет.
Rollback reference и native transition proof сохранены; public Bundle не запланирован.

## Change Scope / Automated Gate

Source не менялся. Новые native calls проверяют первую локальную обработку
pending fixture payment с actual provider revalidation. Ранее passed source/
browser/schema/lifecycle/99/34 role/ABAC и already-credited duplicate proofs
не повторялись. Исторические Biome errors сохраняются; новый JSON проверяется
отдельно. Полный810-file image proof не повторялся; два payment source modules
сверены с raw Git только для нового SDK diagnostic.

## Test Accounts and Functional Results

| Alias / area | Result | Scope / limitation |
| --- | --- | --- |
| race-payer | Fixture | Native ORM user in separate empty DB; no native UI registration/login proof |
| Provider reference | PASS read-only | Existing real succeeded50RUB/test object; no new provider payment or mutation |
| Initial local state | PASS | Pending/unpaid/unlinked payment, balance0/transactions0/subscriptions0 |
| Native overlap | PASS for six / NOT_PASS for eight | Eight separate sessions started; six confirmed native handlers waited before credit; two provider reads failed |
| Financial invariant | PASS in observed scope | Final balance5000, transaction1, succeeded/paid/linked, subscriptions0 |
| Eight successful native deliveries | NOT_PASS | SixTrue/twoFalse; not an eight-confirmed-delivery race PASS |
| Provider read diagnostic | PARTIAL / OPEN L-PAY-API-01 | Serial2/3, parallel8/8; ReadTimeout masked by SDK AttributeError; later reads do not replace financial proof |
| Real first merchant / simultaneous HTTPS callbacks | NOT_VERIFIED | Existing provider object + pending local fixture; native HTTP/IP handler not exercised |
| Subscription / Panel writes | NOT_RUN / BLOCKED | No subscriptions/cart; Remnawave read-only |

## Platform / Visual / Accessibility

No new UI/device/a11y matrix. Service-only payment cases do not replace exact
compiled Custom Cabinet browser evidence or physical Telegram checks.

## Failure / Recovery / Defects

Two native lookups returned no confirmation following transport ReadTimeout
and SDK error-path AttributeError on absent HTTP response. The same failure
occurred in a later sequential read; a parallel-only shared-client cause was
not established. Financial run was not repeated. Backend/SDK source unchanged.
Full recovery/retry/HTTP return and remaining merchant flows are not verified.

## Residual Risks / Staging Decision

Full S9 **PARTIAL**, full live sign-off unavailable. Single-credit behavior is
proved only for the six confirmed first-local handlers in this fixture.
Eight confirmed deliveries, actual first-provider HTTPS concurrency and broader
payments remain unverified. L-PAY-API-01 and existing L-ABAC-01/02 stay OPEN.
No new release-risk acceptance, public Release or production authorization inferred.

## Production Smoke / Rollback

Production smoke **NOT_STARTED**; rollback NOT_NEEDED. No production baseline,
update, commit/push or public Release.

## Final Sign-off

Only owned temporary DB/worker/Redis resources removed. Independent postflight
PASS: absent owned resources, unchanged original core data/config/images,
healthy/restart0/OOMfalse. The earlier VPS remains running with its cleanup
SKIPPED_OWNER_REQUEST. No credentials, payment/account IDs or actual IP published.
