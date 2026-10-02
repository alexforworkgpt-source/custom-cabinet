# Custom Cabinet / Upstream Bot — source contracts, 2026-10-02

Status: **PASS_SOURCE_CONTRACT_SCOPE**. Owner acceptance: accepted for the stated limited scope, 2026-10-02.
Проверки относятся к указанным source identities и ограниченному покрытию;
это не полный staging/runtime/product PASS и не разрешение публикации.

| Component | Exact identity |
| --- | --- |
| Custom Cabinet | `8fb8cbec19d651fcfaee3bce32621031b3e69965` |
| Cabinet tree | `2a3769d515f87f6e7c325d51d8b218fc4ce49bec` |
| Upstream Cabinet | `v1.79.0` / `821c7b71823573a756de00418acb25118ede1c9c` |
| Upstream Bot | `v4.15.0` / `877690a7039d1326b2c00eda3e297879b80c0678` |
| Backend contract | `1` |
| Release Bundle | `not scheduled`; новый Bundle не собран и не опубликован |

## Что проверено

1. **Upstream Bot: 145 PASS, 0 FAIL, 0 SKIP.** Из exact Git source выбраны
   11 существующих tests: migration chain/0127, linked-provider forgets_email,
   grace settings/HTTP, admin users filters/multi-tariff/grace, branding manifest,
   admin reminders, promo-group recalculation и scoped email broadcast targets.
   FastAPI routes/schema выполнялись с test doubles БД и внешних сервисов.
   Это проверка серверных contracts, не live PostgreSQL, Telegram или payment.
2. **API method/path audit: 578 из 579 вызовов сопоставлены.** Из exact Bot
   сгенерирован OpenAPI на 521 Cabinet path. TypeScript AST собрал shared-client
   calls из src/api; string constants и template bases разрешены. Для динамических
   templates проверялся возможный matching route; query values, authorization,
   response-field parity всех 579 calls этим аудитом не доказываются.
   Единственное исключение и его disposition указаны ниже.
3. **Browser smoke: 11 PASS, 1 configured SKIP, 0 FAIL, 0 retries.** Существующий
   harness проверил Login, Dashboard/Balance/loading, управление подпиской/
   Devices и Connection wizard на mobile-320 и desktop-1280. Desktop-вариант
   density test пропущен самим тестом с причиной `Mobile and tablet density only`.
   API и Telegram в этом harness mocked; browser smoke не доказывает реальный Bot.
4. **Source gates сохранены.** Exact Cabinet [CI push](https://github.com/alexforworkgpt-source/custom-cabinet/actions/runs/36996424344)
   и [CI после source merge](https://github.com/alexforworkgpt-source/custom-cabinet/actions/runs/37009856693)
   ранее подтвердили 991 frontend + 15 publication tests на каждой Node 24/26,
   lint/build; CodeQL/Audit SUCCESS. Они не заменяют новое Bundle smoke.
   Application blobs/modes 691 src/public paths, LICENSE/UPSTREAM/package/lock
   совпадают с published source `5ee46023afc373fbfcef69f6793d440aa1d2cdd0`;
   единственная src разница — test-only grace_until fixture.

## Окружение и воспроизводимость

Bot source экспортирован из Git с `core.autocrlf=false` и сверкой test/config
bytes. Первоначальный Windows export с CRLF обнаружен до выполнения tests и
не использован. Global Git settings и owner source не менялись.

Bot tests использовали local image
`sha256:a2aeaefa5d48b79b77bb2c038977be1ba57e33343e214f5e23469c540c8f4107`.
Revision label совпал с exact Bot SHA, runtime layers prefix — с image
`sha256:f2e0b7e9210d95f8a7d315ea8eaf686bc8f67cc6fba62e52ad77225924e74ebd`.
Exact exported source mounted read-only; контейнеры имели `--network none`,
synthetic test settings и ephemeral writable directories. Private env не
копировались. Оба созданных test containers удалены; чужие containers не трогали.
34 warnings — прежние SQLAlchemy/Pydantic/Starlette/Alembic deprecations.

Browser — system Chrome `154.0.8037.93`, Playwright Core `1.63.0`.
Первый run дал 12 launch failures из-за отсутствующего bundled revision 1243;
ни один сценарий тогда не выполнился. Загрузка revision завершилась CDN timeouts.
Старые browsers сохранены (`--no-remove`). Успешный run использовал временный
config, меняющий только browser channel, test/output paths и cwd server.
Source, assertions, timeout и retry policy не менялись. Результаты initial run
не скрыты. Raw browser data/screenshots/private logs не входят в этот report.
Docker Desktop был запущен для локальных tests и оставлен работать, поскольку
используется другими локальными containers; команды управления чужими containers
и их данными не выполнялись.

[Receipt JSON](compatibility-evidence-8fb8cbe-877690a7-20261002.json) содержит
counts, executed test names, skip reason, image identities и hashes локальных
JUnit/log/OpenAPI/inventory artifacts. Artifacts остаются локальными; summary
не содержит credentials, private env или raw production/browser data.

## Известные ограничения

| ID | Status | Что установлено |
| --- | --- | --- |
| `unused-legacy-email-wrapper` | OPEN | `adminBroadcastsApi.createEmail` объявляет POST `/cabinet/admin/broadcasts/email`, которого нет в exact Bot schema. Static search нашёл только declaration; текущий `AdminBroadcastCreate` использует `createCombined` → поддерживаемый POST `/cabinet/admin/broadcasts/send`. Wrapper совпадает с published source и не исправлялся в этой проверке. |
| `classic-auto-purchase` | OPEN | Backend сохраняет `subscription_purchase`, который top-up dispatcher не обрабатывает. Эти tests не доказывают new auto-purchase или реальный renewal/payment. |
| `source-contract-coverage` | BLOCKED | Нет полного response-field parity proof всех calls, authenticated staging, real Telegram, panel/payment/renewal/concurrency и physical-device coverage. |
| `new-bundle-smoke` | BLOCKED | Новый primary Release Bundle не опубликован и не установлен; targeted smoke отсутствует. |

BSCHEKER и Simple/Lite Mode сохраняют frontend exclusions. Source identity,
licenses/provenance и runtime coverage limits не заменяются общим утверждением
полной совместимости. [Исторический COMPATIBILITY.md](https://github.com/alexforworkgpt-source/custom-cabinet/blob/8fb8cbec19d651fcfaee3bce32621031b3e69965/COMPATIBILITY.md)
сохраняет прежние rows, их scope и OPEN backend limitation.

## Принятие владельцем и границы

Владелец принял ограниченное source-contract coverage 2026-10-02.
Результат остаётся PASS_SOURCE_CONTRACT_SCOPE; все OPEN/BLOCKED ограничения
выше сохранены. Это принятие отчёта и Cabinet record для exact source/Bot,
без утверждения полного runtime PASS. Original local review snapshots сохранены.

Evidence MD/JSON добавляются отдельным commit; Cabinet record ссылается на
его exact public blob URL. Source 8fb8cbe и его tree не дополняются задним числом.
Record использует прежнее предложенное имя cabinet-v2026.10.02.1; tag не создан
и не зарезервирован. Новые tags/Releases, latest/settings и production не входят
в принятие этого пакета. Actual staging и новое Bundle smoke остаются BLOCKED.
