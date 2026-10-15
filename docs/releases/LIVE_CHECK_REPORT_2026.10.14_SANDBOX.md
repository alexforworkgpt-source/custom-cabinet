# Live Check Report: Bot v5 YooKassa sandbox / preset roles

Status: **BLOCKED (full live gate); targeted checks PASS**<br>
Date: 2026-10-14, Europe/Moscow<br>
Checker / Implementer / Observer: Codex; owner участвовал в Telegram login<br>
Release owner: владелец проекта; разрешены test runtime, merchant и temporary roles

Формат: [LIVE_CHECK_REPORT_TEMPLATE](../../LIVE_CHECK_REPORT_TEMPLATE.md).

## Source Identity / Environment

Exact identities, artifact284 и native source810 proof указаны в
[sandbox evidence](../compatibility-evidence-v1801-bot-v5-sandbox-20261014.md).
Public Bundle не запланирован; production не менялся. Тестовая Ubuntu24.04 /
PG15 / Redis7; Codex in-app browser и owner Google Chrome, RU/light.
Owner подтвердил открытие Mini App на Android и iOS; номера browser/Telegram
builds и полные действия на телефонах не зафиксированы. Временный stage удалён
после проверки, cleanup PASS; merchant UI notification setting сохранён.

## Change Scope / Automated Gate

Изменения только в disposable runtime configuration, isolated test data и
локальных verification scripts/evidence. Upstream Bot и frontend source неизменны.
Прежние1084 unit, TS/build, frontend Biome и398 browser cases/14 skips reused;
три historical full repository Biome JSON errors не исправлялись.
Новые проверки: native Email registration/login, YooKassa actual test merchant,
real callback/credit, declined card/no-credit, 8 concurrent duplicate native
service calls и99 HTTPS auth/RBAC assertions. Их scope не подменяет full gate.

## Test Accounts and Functional Results

| Alias / area | Result | Scope / limitation |
| --- | --- | --- |
| sandbox-payer / web auth | PASS | Native UI registration/login; verification disabled only on disposable stage |
| rbac-actor / native auth | PASS | Native HTTPS standalone registration/password login; no DB seeding/JWT minting |
| owner-admin / Telegram web | PASS | Owner Google Chrome session, profile and env Superadmin UI |
| YooKassa successful topup | PASS | Provider test:true; 50 RUB; native callback before return; balance5000, transaction1 |
| Declined card | PASS in scope | Insufficient funds UI, no credit; payment remains pending, terminal canceled unverified |
| Duplicate concurrency | PASS in scope | 8 separate DB sessions/native service/provider revalidation; balance/transaction unchanged; first-delivery race unverified |
| Four preset roles | PASS in scope | Eight selected read/preview/search routes; correct200/403; guest401; hierarchy self-escalation403 |
| Role revocation | PASS | Four assignments removed via native UI; previous tokens immediately denied selected admin routes |
| Callback protection | PASS in scope | Real delivery accepted; untrusted public POST403; skip-IP-checkfalse |
| Subscription / Panel writes | BLOCKED | Remnawave access explicitly read-only; create/sync/mutations not exercised |
| Full RBAC/ABAC | BLOCKED | All write/resource policies/custom roles/expiry/multiple roles not covered |
| Physical Telegram / Mini App launch | PASS_OWNER_CONFIRMED | Owner подтвердил открытие на Android и iOS; версии, навигация, отсутствие повторного login и полный initData flow не подтверждены |
| Full physical Telegram gate | PARTIAL | Launch evidence не закрывает все device/auth/navigation scenarios |
| Presentation/a11y/full matrix | BLOCKED (full live) | No new full responsive/theme/locale/keyboard/device gate |
| Cleanup | PASS | Entire owned root/test DB preserved privately; test root/resources/webhook/listeners absent; management222 and config unchanged, Caddy restored |

## Failure / Recovery / Defects

Insufficient-funds error and return do not mean terminal canceled. Recurring,
two-stage capture, refund, first-delivery race and full Installer recovery are
not covered by this sandbox. Subsequent separate
[native lifecycle](../../../installer/docs/bot-v5-pg15-lifecycle-20261014.md) and
[cross-version transition/rollback](../../../installer/docs/bot-v5-pg15-transition-20261014.md)
passed using the published reference Cabinet. Their scope does not replace
the new Custom Cabinet artifact/public Bundle gate. The last transition VPS
cleanup was skipped at owner's request; this report's cleanup PASS applies
only to the sandbox. No new product source fix was made. Existing Classic/Cashera and
historical Biome limitations remain OPEN. Read-only Panel is an environment
constraint; backend modifications are outside the project boundary.

## Staging Decision / Production Smoke

Full live / S9 **PARTIAL/BLOCKED**. Current scoped checks PASS with the explicit
limits above. Production smoke NOT_STARTED; no commit/Release/deployment to
production. No additional npm/build/browser/local schema gates were repeated.
После cleanup test Cabinet/notification URL недоступен до следующего запуска;
merchant UI не менялся. Подтверждение owner дополнило evidence открытия Mini App,
не превратило полный device gate в PASS.
