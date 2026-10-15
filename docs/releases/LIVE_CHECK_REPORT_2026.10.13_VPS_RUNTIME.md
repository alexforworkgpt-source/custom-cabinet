# Live Check Report: private v1.80.1 / Bot v5 VPS runtime

Status: **BLOCKED (full live gate); targeted VPS runtime PASS**<br>
Date: 2026-10-13, Europe/Moscow<br>
Checker / Implementer / Observer: Codex<br>
Release owner: владелец проекта; явно разрешены временный test startup и cleanup

Формат: [LIVE_CHECK_REPORT_TEMPLATE](../../LIVE_CHECK_REPORT_TEMPLATE.md).
Проверен частный runtime snapshot; full staging/public Release gate не закрыт.

## Source Identity

| Item | Exact value |
| --- | --- |
| Custom Cabinet commit | Receiving HEAD `1169e3cb964caec9a9500ace89bbb53b7e5a89df` + uncommitted tested owner/adaptation snapshot; new candidate commit отсутствует |
| Upstream Cabinet | v1.80.1 / `a693d30ca6084b9a54b45a72294b99237841ef13` |
| Upstream Bot | v5.0.0 / `5bda3c56f0afd9f4813e9c6fa48934948b05ebae` |
| Release Bundle candidate | not scheduled; private snapshots, не public Bundle |
| Artifact identity | `4aa5d6ba362760ebdd4f34f18f3a8f91f1de400b5736d1e74948c2d1579b2130`, 284 compiled files |
| Installer template source | `75c49bec9c2a764e123fc0ef675f8c45fc22a1ab` |
| Historical production reference | bundle-v2026.10.10.1; production в этой задаче не опрашивался и не менялся |

## Environment

Designated test VPS из local `installer/server.env`; URL/credentials здесь не
повторяются. Ubuntu24.04.4/Linux-amd64, Python3.14.8, PG15.19/Redis7.4.10.
Временный run: 22:39–22:45; собственные root/Compose/proxy resources удалены.
Native webhook mode, disabled providers, synthetic fixture admins/users;
physical Telegram clients и browser builds в этой runtime фазе не проверялись.

## Change Scope / Automated Gate

Приложение не редактировалось. Проверены native main.py/unified lifespan,
exact compiled artifact/proxy/HTTPS, actual JWT/DB и выбранные permissions.

| Command / gate | Result | Notes |
| --- | --- | --- |
| npm test / type-check / build | Reused PASS | 1084 tests, оба TS configs; exact artifact из предыдущего frontend gate |
| Frontend Biome | Reused PASS | 874 files; source не менялся |
| Full npm run check | FAIL (historical) | Три неизменённых JSON format errors, не исправлялись |
| Compiled browser automation | Reused PASS | 398 cases / 14 configured SKIP; повторного browser run не было |
| Private archive/transfer checks | PASS | Input archive hashes, 284 file set/hashes на VPS, index/JS/CSS HTTPS bytes |
| Native startup / actual HTTPS API | PASS in stated scope | 14 API/artifact cases; дополнительный unified health assertion |
| Cleanup / independent postflight | PASS | 38 management files exact, test resources/webhook absent; local config preserved |

## Test Accounts and Functional Results

Aliases: `env-admin`, `ordinary-user`, `native-marketer`. Только isolated DB,
native token helper; это проверка validation JWT, не реального login/initData.

| Area | Result | Checked scenarios / limits |
| --- | --- | --- |
| Runtime smoke | PASS | Native startup, unified processor running, three healthy services, 60s/restarts0/OOMfalse |
| Artifact / HTTPS / proxy | PASS | Exact files, SPA route, branding, no-store/immutable headers |
| JWT / selected Admin | PASS | guest401/user403/admin200; Marketer count3/list0 and user-search403 |
| Info / disabled Cashera | PASS | FAQ ru/en parameters with empty FAQ DB; exact disabled403 |
| Real authentication | BLOCKED | Telegram initData, OAuth/email login not exercised |
| Subscriptions / payments / recovery | BLOCKED | Real merchant/callback/concurrency/recurring, actual subscriptions and full Installer recovery absent |
| Full roles / Panel | BLOCKED | Only stated actor/endpoint checks and native Panel read; full RBAC/ABAC/identity/counts not exercised |
| Presentation / accessibility | BLOCKED (full live) | Mocked browser evidence reused; real authenticated live device/a11y gate not performed |
| Physical Telegram / Mini App | BLOCKED | Native processor health is proven; Android/iOS/end-to-end Mini App unverified |

## Errors, Risks and Decision

Native log: four warnings, zero error/critical-level lines/Traceback. Warnings
и scope разобраны в [runtime evidence](../compatibility-evidence-v1801-bot-v5-vps-runtime-20261013.md).
Не заявляется успешная доставка native logo prewarm синтетическому admin.
Classic auto-purchase и Cashera flag-off/reload discovery остаются OPEN.

Full live / S9: **PARTIAL/BLOCKED** до full Installer lifecycle новой exact
комбинации и перечисленных actual live checks. Source snapshot остаётся
uncommitted; public source/Bundle gate не закрыт. PG18 не применялся.
Публикация/production не разрешены этим test startup approval и не выполнялись.
Старые frontend/local schema/contracts gates без новой причины не повторять.
