# Bot v5: YooKassa sandbox и штатные роли — 2026-10-14

Status: **targeted sandbox / preset role checks PASS; full live gate PARTIAL**.
Structured record: [JSON evidence](compatibility-evidence-v1801-bot-v5-sandbox-20261014.json).
Продолжение [VPS runtime proof 2026-10-13](compatibility-evidence-v1801-bot-v5-vps-runtime-20261013.md).
Owner разрешил временный test runtime/cleanup, тестовый merchant и любые
временные роли с их последующим снятием. Production и публикация не выполнялись.

## Exact inputs и границы

| Input | Identity |
| --- | --- |
| Upstream Bot | v5.0.0 / `5bda3c56f0afd9f4813e9c6fa48934948b05ebae` |
| Upstream Cabinet | v1.80.1 / `a693d30ca6084b9a54b45a72294b99237841ef13` |
| Custom Cabinet | HEAD `1169e3cb964caec9a9500ace89bbb53b7e5a89df` + прежний tested uncommitted snapshot |
| Compiled artifact | 284 files / `4aa5d6ba362760ebdd4f34f18f3a8f91f1de400b5736d1e74948c2d1579b2130` |
| Installer template | `75c49bec9c2a764e123fc0ef675f8c45fc22a1ab` |

Повторно использованы прежние проверенные archives/artifact. Frontend source,
backend source/API/migrations, Installer и site не редактировались. В новом
контейнере все 810 файлов `app/` и `main.py` побайтно совпадают с exact Bot archive.
Frontend unit/build/browser gates и local schema/contracts не повторялись.

Отдельный тестовый runtime: Ubuntu24.04, PG15/Redis7, native Dockerfile/main.py,
stock Installer Caddy template. Merchant `/v3/me` и оба payment objects реально
подтверждены API YooKassa как test; TLS verification включена. IP check не
отключался; доверен конкретный gateway тестовой Docker network. Email verification
отключена только настройкой disposable stage; SMTP/inbox не проверены.
Remnawave разрешён только на чтение: subscription create/sync/Panel writes не выполнялись.

## Регистрация, оплата, уведомления

1. `sandbox-payer` создан обычной регистрацией через compiled Custom Cabinet.
   Обычный Email/password login открыл главную и баланс 0; DB подтверждает
   native email user и verified flag. Прямого создания пользователя в DB не было.
2. Через UI создан платёж 50 RUB. До подтверждения настоящий API YooKassa
   вернул `test:true`, `pending`, `paid:false`; баланс 0, операций 0.
3. На hosted test checkout использована официальная тестовая карта успешной
   оплаты без автосписаний. Провайдер показал успех. В 08:01:50 UTC native
   webserver записал receipt callback и successful balance credit. Ещё до
   возврата в кабинет DB/API подтвердили `succeeded`, баланс 5000 kopeks,
   ровно одну completed transaction, связанную с этим payment.
4. После возврата Custom Cabinet показал «Баланс пополнен!» и баланс 50 RUB.
5. Восемь одновременных вызовов **native service**, каждый с отдельной DB session
   и настоящей перепроверкой provider API, повторно обработали уже оплаченный
   платёж: 8 true, баланс 5000, transaction count 1 до/после. Это не параллельные
   HTTPS deliveries и не гонка первоначального зачисления.
6. Второй платёж 50 RUB также `test:true`. Официальная тестовая карта
   insufficient-funds показала «Не хватает денег»; баланс остался 5000,
   операция по второму платежу отсутствует. Provider/local payment остаётся
   `pending`; при возврате кабинет корректно показывает ожидание оплаты:
   отказ отдельной попытки **не доказал terminal canceled webhook**.
7. Посторонний POST к public callback отклонён `403 unknown_ip`;
   `YOOKASSA_SKIP_IP_CHECK=false`, automatic payment status checker выключен.

Owner настроил payment.succeeded / payment.waiting_for_capture /
payment.canceled / refund.succeeded. В exact Bot payment router принимает
первые три события; refund событие игнорируется. Реальный refund, two-stage
capture, recurring и terminal cancellation этой проверкой не закрыты.
Факт наличия Signature в receipt log не трактуется как криптографическая
проверка: native handler обязательно перепроверяет payment через provider API.

## Настоящий вход и preset роли

Owner вошёл через Telegram в Google Chrome; UI профиля и штатная админка
показали env-managed Superadmin. Это реальная browser authentication,
не synthetic JWT. Отдельно owner подтвердил запуск Mini App из тестового бота
на физических Android и iOS: «На андроид открылся, на IOS тоже открылся».
Это **PASS_OWNER_CONFIRMED только для открытия Mini App**. Версии клиентов,
навигация главная→баланс→профиль, отсутствие повторного login и полный initData
flow этим ответом не подтверждены; полный physical Telegram gate остаётся PARTIAL.

`rbac-actor` создан через native HTTPS standalone registration и вошёл через
native Email/password login. Через Chrome-сессию owner ему по очереди
назначены и сняты Marketer, Support, Moderator и Admin. DB seeding и ручного
выпуска JWT нет. При каждой роли проверены настоящие HTTPS ответы:

| Role | Users read | Ticket stats | Ticket settings | Payment stats | Roles read | Broadcast preview | Audience user search |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Ordinary | 403 | 403 | 403 | 403 | 403 | 403 | 403 |
| Marketer | 403 | 403 | 403 | 403 | 403 | 200 count-only | 403 |
| Support | 200 | 200 | 403 | 403 | 403 | 403 | 403 |
| Moderator | 200 | 200 | 200 | 403 | 403 | 403 | 403 |
| Admin | 200 | 200 | 200 | 200 | 200 | 200 with users | 200 |

Также проверены broadcasts filters, guest401, точные native permissions/levels.
Admin попытался назначить себе роль уровня100 и Superadmin уровня999: оба403.
После **каждого** отзыва роли прежний настоящий token сразу показал level0,
пустые permissions и403 на выбранных admin routes. Всего99 HTTP assertions,
включая регистрацию/login/permissions, пять исходных состояний и четыре отзыва.
Все четыре временных назначения сняты; env Superadmin owner не менялся.
Рассылки не отправлялись, Panel mutations не вызывались.

Это покрытие всех четырёх назначаемых preset ролей на выбранных read endpoints
и двух hierarchy guards. **Полный RBAC/ABAC gate остаётся PARTIAL**: не проверены
все mutation endpoints, custom roles/policies, expiry, комбинации нескольких
ролей и все resource-level ограничения.

## Текущее состояние и receipts

После подтверждения запуска Mini App временный stage очищен в рамках ранее
выданного разрешения: **OWNED_SANDBOX_CLEANUP_PASS**, 09:05:01–09:05:40 UTC
(12:05:01–12:05:40 Europe/Moscow). До удаления проверены exact absolute root,
owner marker и baseline; полный owned root (2244 файла), native log и test DB
dump сохранены в закрытой локальной копии. Private runtime и merchant
credentials не публиковать.

Удалены только owner Compose containers/volumes/network, image tag, собственный
Caddy snippet, test root и webhook тестового Telegram Bot. Независимый postflight
подтвердил отсутствие этих ресурсов и test listeners18089/443, pending updates0
без их принудительного удаления, восстановление baseline Caddy и неизменность
222 management files. Caddy/Docker active; local `installer/server.env` сохранён.
Настройка уведомлений в merchant UI не менялась; тестовый Cabinet/notification
URL после cleanup не обслуживается до следующего отдельно запущенного стенда.
Cleanup предыдущего run 2026-10-13 остаётся отдельным историческим PASS.

На последнем read-only postcheck перед cleanup три сервиса healthy, restart0/OOMfalse;
222 management files равны baseline начала этого stage, все284 Cabinet files
сохранили прежние hashes. Native subscriptions0, temporary active assignments0.

Private receipts в workspace `.scratch/bedolaga-v5-payments-20261014/`:
`merchant-auth-check.json`, `stage-context.json`, `payment-before-success.json`,
`payment-after-success.json`, `payment-after-decline.json`, `payment-final.json`,
`duplicate-concurrency.json`, `callback-audit.json`, `runtime-source-integrity.json`,
`rbac-ordinary.json`, `rbac-{marketer,support,moderator,admin}.json` и четыре
`rbac-*-revoked-stale-token.json`, `miniapp-owner-confirmation.json`, `cleanup-result.json`.
Закрытые backup/log/dump находятся только в `private/<owner>/` и не публикуются.
В public evidence actor/payment IDs и secrets
не переносятся. [Live report](releases/LIVE_CHECK_REPORT_2026.10.14_SANDBOX.md).

На момент завершения этого sandbox S9 оставался PARTIAL: Installer lifecycle,
previous→new/rollback/recovery и оставшиеся live gates здесь не проверялись.
Позднее отдельные [native lifecycle](../../installer/docs/bot-v5-pg15-lifecycle-20261014.md)
и [cross-version transition](../../installer/docs/bot-v5-pg15-transition-20261014.md)
прошли с published reference Cabinet, а не новым uncommitted artifact.
JSON этого sandbox сохраняет исторический scope и список remaining на момент
его завершения; текущий сводный статус — в [Compatibility Matrix](../COMPATIBILITY.md).
Cleanup PASS выше относится только к sandbox: последний transition VPS оставлен
работающим, cleanup SKIPPED_OWNER_REQUEST. Полный S9 остаётся PARTIAL:
остальные payment flows, полный RBAC/ABAC и physical Telegram не закрыты.
Classic auto-purchase,
Cashera flag-off/reload и три historical full repository Biome errors сохранены.
