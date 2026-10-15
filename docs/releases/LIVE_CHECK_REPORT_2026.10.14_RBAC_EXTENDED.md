# Live Check Report: Bot v5 extended native RBAC

Status: **BLOCKED (full live gate); targeted 34 HTTPS assertions PASS**<br>
Date: 2026-10-14, Europe/Moscow<br>
Checker: Codex<br>
Release owner: владелец проекта; продолжение test verification разрешено

Формат: [LIVE_CHECK_REPORT_TEMPLATE](../../LIVE_CHECK_REPORT_TEMPLATE.md).

## Source Identity / Environment

Bot `5bda3c56f0afd9f4813e9c6fa48934948b05ebae`, Installer
`75c49bec9c2a764e123fc0ef675f8c45fc22a1ab`; Ubuntu24.04/PG15/Redis7.
Прежний transition runtime подтверждён fresh SSH fingerprint/owner preflight.
Cabinet — published reference bundle-v2026.10.10.1, source
`1d046656fbb01a928fd54a28694e10105d4185f8`, artifact
`a3f119a4548d7f49067406e1a4e15f3020d1eeff1da00490130e1600ec40d0b0`.
Новый uncommitted Custom Cabinet здесь не развёртывался. Browser/Telegram
builds, theme/locale/palette не проверялись этим HTTPS-only сценарием.
[Точные результаты и JSON](../compatibility-evidence-v1801-bot-v5-rbac-extended-20261014.md).
Новый public Bundle не запланирован; rollback reference — прежний immutable
bundle-v2026.10.10.1, native transition/rollback proof сохранён отдельно.

## Change Scope / Automated Gate

Source не менялся. Новые сценарии: custom roles/selected permission guards,
multi-role union, actual expiry, deactivate/reactivate, revoke/reassign и
delete cascade на прежнем токене. Старые99 assertions не повторялись.
Прежние1084 unit, TS/build/frontend Biome и398 browser cases/14 skips сохранены;
три historical full repository Biome errors остаются FAIL. Frontend/build,
browser/schema/lifecycle/transition повторно не запускались.

## Test Accounts and Functional Results

| Alias / area | Result | Scope / limitation |
| --- | --- | --- |
| test-controller | PASS in scope | Native HTTPS Email login; account/verified flag/limited level90 role seeded through native ORM |
| test-actor | PASS in scope | Native HTTPS Email login; same token for eight permission states; no manual JWT minting |
| Custom-role CRUD | PASS in scope | Own create/update/delete, duplicate409, invalid400, forbidden grants/level403 |
| Multiple roles / expiry | PASS in scope | Exact union/max level; actual expiry removes one role, other permission persists |
| Revocation / deactivation / cascade | PASS in scope | Current DB state immediately enforced on old token; reassignment uses same unique assignment |
| Full RBAC/ABAC | BLOCKED | All policies/resources/mutations and broader combinations not covered |
| Subscription / payments / Panel | NOT_RUN / BLOCKED | No new business mutations; Remnawave remains read-only |
| Telegram / user navigation | NOT_RUN | Earlier evidence retained; full physical device gate remains incomplete |

## Platform / Visual / Accessibility Results

No new browser/device/visual/accessibility matrix. Existing compiled-artifact
evidence retains its scope; native HTTPS cases do not replace browser UI checks.

## Failure / Recovery / Defects

First login403 was diagnosed as `email_auth_disabled`, with original environment
flagfalse and no DB override. Its temporary fixtures were removed. Native CRUD
enabled one owned test DB flag for this scenario and restored its original
absence afterward; no environment-file/image/source change or restart.
This setup mismatch is not declared a product defect. Other network/422/429/500,
WebSocket/payment-return/recovery cases were not repeated or newly covered.
Existing Classic/Cashera and historical Biome limitations remain open.

## Residual Risks / Staging Decision

Full live/S9 remains **PARTIAL/BLOCKED**. Custom-role mutation coverage is limited
to owned roles/assignments; ABAC, full mutation matrix, remaining merchant,
physical-client and read-only Panel scopes are not closed. Owner authorization
for this test does not authorize a new public Release or production transition.

## Production Smoke / Rollback

Production smoke **NOT_STARTED**. No commit/Release/production update or rollback.
Existing production references retained; no new production baseline was taken.

## Final Sign-off

Scoped test fixtures removed; independent postflight PASS: owned accounts/roles/
assignments0, original disabled Email gate restored, core non-fixture data and
five configuration files unchanged, images unchanged, healthy/restart0/OOMfalse.
The earlier transition VPS remains running and its cleanup remains
SKIPPED_OWNER_REQUEST. Full live sign-off **BLOCKED**; this report contains no
tokens, credentials or personal account data.
