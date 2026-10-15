# Локальная проверка Bot v5.0.0 для Custom Cabinet

Дата: 2026-10-13. **Local schema + selected contracts PASS; полный S9 остаётся PARTIAL.** Это проверка неизменённого Bot в локальных контейнерах, не live staging, Release или production. Frontend source, Upstream Bot source/API/business rules/migrations, Installer и site в этой фазе не менялись.

После этой локальной фазы native startup/unified lifespan/HTTPS и 14 выбранных
JWT/API checks прошли на owner-authorized тестовом Ubuntu24.04 VPS; cleanup PASS.
См. [последующее VPS evidence](compatibility-evidence-v1801-bot-v5-vps-runtime-20261013.md).
Ниже сохранён scope исходного local run; полный S9 по-прежнему PARTIAL.

Машиночитаемое evidence: [JSON](compatibility-evidence-v1801-bot-v5-local-20261013.json). Все данные пользователей/подписок тестовые. Реальные merchant и Telegram credentials не использовались. Логи находятся в игнорируемом `custom-cabinet/.scratch/bedolaga-v5-runtime-20261013/`.

## Точные identities

| Компонент | Проверенная идентичность |
| --- | --- |
| Новый source Bot | v5.0.0 / 5bda3c56f0afd9f4813e9c6fa48934948b05ebae |
| Local runtime image | sha256:c1451a83c2d674e9c8bf4f9ac0f68a61f0844703d1618e3d17b158b65d50fcf3; Linux/amd64; Python3.14.8 |
| Test-only dependency layer | sha256:12c48191f6f5d0eda2638108cab8a950bc142dffee63b87270539776ac90c2d5; dev dependencies из того же frozen uv.lock |
| Previous Bot image | sha256:f2e0b7e9210d95f8a7d315ea8eaf686bc8f67cc6fba62e52ad77225924e74ebd; source877690a7039d1326b2c00eda3e297879b80c0678 |
| PostgreSQL | postgres (PostgreSQL) 15.19; sha256:4006528dcbdd9be8c1aaa50389caea4e93c46d6f54c3533bcd3253725e526e23 |
| Redis | Redis server v=7.4.10 sha=00000000:0 malloc=jemalloc-5.3.0 bits=64 build=d70b7db78d693e15; sha256:e7723ff73d963f5cc6d9c4643ea3d989527a402a319239054e9472a7fb9219a2 |
| Custom Cabinet artifact | 4aa5d6ba362760ebdd4f34f18f3a8f91f1de400b5736d1e74948c2d1579b2130; ранее проверенные 284 файла |

Bot собран **штатным Dockerfile** из exact source. Тестовый image добавляет только dev dependencies; все 941 проверенных application/migration/locale/lock файлов совпадают с source и runtime image. Все 1835 tracked upstream файлов остались неизменными, Git status пуст. Для старого image сверены model/config/migration runner с Git877690a7 после универсального декодирования CRLF; source совпадает. Это не backend fork или patches.

## Фактически выполненные проверки

| Проверка | Результат / предел |
| --- | --- |
| Fresh database, штатный run_alembic_upgrade | PASS: create_all + stamp0131; 128 таблиц. Не выдаётся за полный Alembic chain от0001 |
| База старого Bot | PASS: штатный bootstrap source4.15, schema0127, 125 таблиц; затем добавлены два test user и subscription sentinel |
| Upgrade0127→0131 | PASS: штатные0128→0129→0130→0131; balance, user/subscription IDs, traffic и device limit сохранены |
| Повторный запуск migration runner | PASS: head0131 и sentinel data прежние |
| Logical backup / restore | PASS: pg_dump custom format, 516381 bytes, SHA256 3b07d9a90bde28a97a3e8858706bd54a12554746f5146793c554c86fe4415af0; restore в отдельную БД, старый Bot снова видит0127 и прежние sentinels |
| Backend CacheService + Redis7 | PASS: connect, JSON set/get/getdel и повторное чтение после удаления на настоящем Redis; не proof всего Redis failure/recovery поведения |
| 13 выбранных upstream test modules | PASS: 172 tests, 0 fail/errors/skips; 38 deprecation warnings |
| Обязательные PostgreSQL tests | PASS: все три reminder auth-condition cases реально выполнены; REQUIRE_POSTGRES_TESTS=1 и JUnit подтверждают отсутствие skip |
| Audience preview ASGI | PASS: без JWT401, ordinary user403, env admin200, count2 и IDs обеих test users; actual JWT/auth/DB, без dependency overrides |
| FAQ language parameter | PASS: ru/en принимаются, status200 и list DTO; FAQ база пустая, перевод реального контента этим не доказан |
| Cashera flag-off HTTP | PASS:403 с exact detail='Cashera recurrent disabled', совпадает с frontend discriminator; provider disabled, actual binding не создавался |
| Cleanup | PASS: отдельные test containers, networks и volumes удалены; перед остановкой Desktop других containers не было |

HTTP-проверки использовали FastAPI с исходным `app.cabinet.routes.router` и настоящими dependencies через httpx ASGITransport. Сессии и права не подменялись. Полный `main.py`, unified lifespan, reverse proxy и внешний HTTPS endpoint не запускались. Остальные upstream tests используют свои штатные mocks/SQLite fixtures, в том числе для merchant calls; нельзя считать все172 tests реальными PostgreSQL/payment операциями.

Warnings относятся к deprecated Pydantic config, SQLAlchemy noload и Alembic path separator; исходники ради них не менялись. Два начальных environment/harness сбоя сохранены: неверное предположение аудит-колонки исправлено на actual `audience` по0129; test LOG_FILE перенаправлен в `/tmp` из read-only source. Девять schema checks после успешного выполнения не повторялись ради исправления pytest environment.

## Что остаётся неподтверждённым

- Полный запуск Bot v5 и Installer lifecycle точной комбинации на target OS, fresh installation, update, uninstall и recovery. Локальный logical restore не заменяет rollback Installer или whole runtime.
- Полная совместимость PG15 runtime, а также переход PG15→PG18. Здесь доказаны только указанные schema/query/selected API операции на PG15. Official v5 compose остаётся PG18 и не применялся к Installer.
- Real sandbox Cashera merchant: enable/purchase/confirmation/callback/cancel, old providers, duplicate/concurrent callbacks и panel identity. Нет merchant/test Telegram данных — платёжный PASS не назначен.
- Все реально настроенные роли, Marketer count-only flow, media/proxy URLs и real Telegram Android/iOS. Local admin/user JWT checks не заменяют полный staging RBAC и Telegram.
- Classic auto-purchase gap и Cashera flag-off/reload cancellation discovery остаются OPEN. Native backend DPI schema сохраняется; DPI frontend полностью исключён.
- Full repository Biome в рабочем Custom Cabinet всё ещё имеет три неизменённых format errors старых JSON-отчётов. Эта фаза добавила только документационное evidence и не исправляла несвязанные файлы.

Для оставшегося S9 нужны отдельная disposable среда target OS, test Bot/Panel/accounts и sandbox provider, без production credentials. Выполнять исходный [runtime gate PRD](prd/bedolaga-v1.80.1-bot-v5.0.0.md) и [LIVE_CHECK](../LIVE_CHECK.md). Не менять backend source/API/business logic/migrations. Новый Bot SHA не позволяет переиспользовать прежний full Installer lifecycle PASS. Release/production остаются отдельными разрешёнными операциями.

## Source references

- [Штатный migration runner](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/blob/5bda3c56f0afd9f4813e9c6fa48934948b05ebae/app/database/migrations.py).
- [Audience migration0129](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/blob/5bda3c56f0afd9f4813e9c6fa48934948b05ebae/migrations/alembic/versions/0129_broadcast_audience.py).
- [Cabinet audience route](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/blob/5bda3c56f0afd9f4813e9c6fa48934948b05ebae/app/cabinet/routes/admin_broadcasts.py).
- [Cashera route](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/blob/5bda3c56f0afd9f4813e9c6fa48934948b05ebae/app/cabinet/routes/subscription_modules/cashera_recurrent.py).
- [Real PostgreSQL fixture](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/blob/5bda3c56f0afd9f4813e9c6fa48934948b05ebae/tests/fixtures/postgres_db.py).
- [Штатный Dockerfile](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/blob/5bda3c56f0afd9f4813e9c6fa48934948b05ebae/Dockerfile) и [frozen dependencies](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/blob/5bda3c56f0afd9f4813e9c6fa48934948b05ebae/uv.lock).
