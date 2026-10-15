# Bot v5 и Custom Cabinet: тестовый запуск на Ubuntu 24.04

Дата: 2026-10-13, **22:39–22:45 Europe/Moscow**.
**TARGETED_VPS_RUNTIME_PASS; полный S9 остаётся PARTIAL.** Владелец явно разрешил
временный запуск и cleanup в этом чате. Disposable confirmation применён только
в памяти; локальный `installer/server.env` сохранён.
[Машиночитаемое evidence](compatibility-evidence-v1801-bot-v5-vps-runtime-20261013.json).
Общий [Live Check report](releases/LIVE_CHECK_REPORT_2026.10.13_VPS_RUNTIME.md)
сохраняет BLOCKED по полному live gate и PASS только для перечисленного scope.

## Точная проверенная комбинация

| Компонент | Identity / результат |
| --- | --- |
| Upstream Bot | v5.0.0 / `5bda3c56f0afd9f4813e9c6fa48934948b05ebae`; неизменённый Git archive, native Dockerfile/frozen uv.lock |
| VPS image ID | `sha256:43756146ee75c05e09cc0693af9a9cebc39523b1f39d01cadc183c8a3869bdd1`; actual revision label совпал |
| Installer templates | Exact clean `75c49bec9c2a764e123fc0ef675f8c45fc22a1ab`; source/archive hashes в JSON |
| Custom Cabinet | Уже проверенные 284 compiled файла; identity `4aa5d6ba362760ebdd4f34f18f3a8f91f1de400b5736d1e74948c2d1579b2130` |
| Runtime | Ubuntu24.04.4/linux-amd64; Docker29.9.0, Compose5.6.0, Python3.14.8, Bot UID1000 |
| PostgreSQL | 15.19, digest `4006528dcbdd9be8c1aaa50389caea4e93c46d6f54c3533bcd3253725e526e23` |
| Redis | 7.4.10, digest `e7723ff73d963f5cc6d9c4643ea3d989527a402a319239054e9472a7fb9219a2` |
| Isolated root | `/opt/bot-stack-integration-v5-20261013`; отдельные Compose resources и test DB |

Compiled snapshot остаётся uncommitted; он проверен как частный runtime artifact.
Новый Release Bundle, public source identity, commit/tag или production update
не создавались. Installer/frontend/Upstream Bot source, API, migrations и `site/`
не менялись. Native PostgreSQL18 compose Bot не применялся.

## Фактически выполнено

1. **В private runtime root:** hashes архивов PASS, native Dockerfile build и
   штатный `python main.py`. Пустая БД штатно получила models + stamp0131.
   Это инициализация нового whole-runtime, без повторения локальной upgrade/
   restore matrix; полный Alembic chain от0001 этим не доказан.
2. **Через exact Installer proxy template и test domains:** HTTPS/certificate,
   root/SPA route, branding и unified health200. Index, один JS и один CSS
   побайтно совпали с artifact; no-store/immutable headers подтвердились.
   Все 284 переданных файла отдельно сверены с прежним manifest на VPS.
3. **В native unified app:** health подтверждает `status=ok`, webhook mode,
   работающий Telegram processor, enabled Web API и mounted Mini App static.
   Native main.py startup summary присутствует. Startup прочитал пять server
   squads из designated Panel и создал строки только в isolated DB;
   проверочный скрипт не выполнял Panel mutations.
4. **В actual HTTPS API:** 14 checks PASS. Audience preview: guest401,
   user403, env admin200/count3/list3, native Marketer200/count3/list0.
   Marketer user-search403. FAQ ru/en200 и list DTO; база FAQ пустая.
   Cashera flag-off403 с точным `Cashera recurrent disabled`.
5. **В actual PostgreSQL/RBAC:** три fixture users и штатная роль Marketer.
   JWT выпущены native helper; реальные auth/DB/permission dependencies через
   HTTPS, без mocks/overrides. Реальные login/OAuth/Telegram initData этим не
   проверялись. Test subscriptions=0; payment/broadcast-send endpoint calls=0.
6. **В 60-секундном окне:** три сервиса healthy, restarts=0, OOM=false, UID1000.
   В captured native log нет error/critical level и Traceback; четыре warnings
   сохранены. Providers в test configuration отключены.

## Native warnings и cleanup

Warnings: штатный empty DB bootstrap; env admin ещё не зарегистрирован при
первом startup; native logo prewarm попытался отправить фото синтетическому admin
и получил `chat not found`; одна webhook operation заняла1.38s. Успешная доставка
фото/уведомления и конкретный physical Telegram client не заявляются. Actor
identifiers и JWT удалены из receipts. Backend ради warnings не редактировался.

Cleanup и независимый postflight PASS: собственные три containers, два volumes,
Compose network, Caddy snippet, runtime image tag и exact root удалены после
проверки ownership. GET подтвердил webhook absent/pending0. Ports18089/443 не
слушаются; containers0/volumes0/networks только `bridge/host/none`; Caddy active.
Management launcher сохранён, все **38** runtime files совпали с exact Installer
archive. Исходный Caddy восстановлен; `server.env` побайтно неизменён.
На cleanup Caddy штатно предупредил об empty glob и HTTP-only baseline после
удаления test HTTPS snippet. Общие Docker base images/build cache сохранены;
global prune и удаление неизвестных ресурсов не выполнялись. Docker Desktop
в этой фазе не запускался.

## Осталось для S9

- Full Installer lifecycle новой комбинации, previous→new update, Installer
  rollback/recovery и Release Bundle contract. Частный Compose smoke не закрывает
  этот gate; новый Bot SHA исключает reuse старого Bot4.15 proof.
- Все business/runtime flows Bot v5 на PG15 и переход PG15→PG18.
- Real sandbox merchant/old providers, enabled recurring purchase/confirmation/
  cancel и duplicate/concurrent callbacks. Sandbox Cashera parameters не найдены
  в designated `server.env`; другие private locations не исследовались.
- Полный RBAC/ABAC matrix, login/OAuth, media/proxy flows, subscription/Panel
  identity и operation counts; physical Telegram Android/iOS и Mini App end-to-end.

Classic auto-purchase и Cashera flag-off/reload discovery остаются OPEN;
три historical full repository Biome JSON errors сохранены. Прежние frontend/
browser и local schema/restore/172 contracts не повторялись.
[Local proof](compatibility-evidence-v1801-bot-v5-local-20261013.md) и
[VPS preflight](compatibility-evidence-v1801-bot-v5-vps-preflight-20261013.md)
сохраняют свои фактические scope.

Receipts: workspace `.scratch/bedolaga-v5-runtime-20261013/cabv5-vps-20261013-bba0a9bf/`:
`result.json`, `native-lifespan-health.json`, `observe.log`, `native-bot-log.log`,
`https-api-attempt-1.log`, `cleanup.log`, `independent-postflight.json`.
