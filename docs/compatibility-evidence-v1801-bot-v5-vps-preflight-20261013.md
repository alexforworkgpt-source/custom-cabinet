# Тестовый VPS для Bot v5: доступ и read-only preflight

Дата: 2026-10-13. **ACCESS_AND_READ_ONLY_PREFLIGHT_PASS; S9 остаётся PARTIAL.**
Установка новой комбинации на VPS не запускалась. Источник доступа — локальный
`installer/server.env`, указанный в документации Installer; production environment
не читался. Секреты и адреса сервера в этот отчёт не включены.

После этого preflight владелец явно разрешил test startup/cleanup. Native
runtime/HTTPS/API и independent postflight прошли; актуальный результат — в
[последующем VPS proof](compatibility-evidence-v1801-bot-v5-vps-runtime-20261013.md).
Ниже сохранено состояние именно read-only preflight до разрешённого запуска.

## Фактически проверено

| Проверка | Результат |
| --- | --- |
| SSH | PASS: fingerprint совпал с designated config, root доступ работает |
| Target OS | Ubuntu 24.04.4 LTS, linux/amd64 |
| Resources | 7759 MiB свободного диска; 1967 MiB RAM, 1500 MiB available; 511 MiB swap |
| Docker | Engine 29.9.0; containers=0, volumes=0; только стандартные networks |
| Existing stack | `/opt/bot-stack-integration` отсутствует; management Installer `/opt/bedolaga-installer` сохранён |
| Services/ports | Docker/Caddy/SSH active; listeners SSH22, HTTP80, local Caddy2019 и DNS53; HTTPS443 пока не слушается |
| Test domains | Оба нормализованных domain из config указывают на designated VPS: system DNS, independent DNS и local DNS |
| Test Telegram Bot | GET getMe200, username совпал; GET getWebhookInfo200, webhook отсутствует, pending=0 |
| Panel | GET `/api/system/health`200 с native API-key headers и cookie из designated test config; JSON response envelope присутствует |
| Private config | `installer/server.env` побайтно сохранён после всех проверок |

Panel200 подтверждает выбранный read-only запрос, а не полный Bot→Panel runtime,
identity/sync behavior или изолированность всех объектов Panel. Telegram GET не
доказывает webhook delivery, Mini App или physical Android/iOS.

## Исправление внешнего проверочного скрипта

Первая попытка неверно передала URL в DNS lookup и не передала Panel cookie.
Это вызвало `gaierror` и `RemoteDisconnected`. Диагностика сравнила обработку
адресов со штатным `normalize_domain` Installer, cookie — с native
`RemnaWaveAPI.__aenter__`. После исправления только external probe оба DNS и
Panel200 подтверждены повторным focused run. Успешные Telegram GET не повторялись.
Upstream Bot, Installer и frontend source ради этого не менялись.

## Подготовлено локально

В workspace `.scratch/bedolaga-v5-runtime-20261013/vps-prepared-inputs/` находятся:

- Exact unchanged Bot v5.0.0 source archive, SHA `5bda3c56f0afd9f4813e9c6fa48934948b05ebae`.
- Exact clean Installer archive, SHA `75c49bec9c2a764e123fc0ef675f8c45fc22a1ab`.
- Уже проверенный compiled Custom Cabinet: 284 файла, artifact identity
  `4aa5d6ba362760ebdd4f34f18f3a8f91f1de400b5736d1e74948c2d1579b2130`.

Проверены file set/hash относительно manifest предыдущего frontend gate и
каждый файл внутри подготовленного dist archive. Это проверка упаковки;
1084 frontend tests, build, browser gate и локальные schema/contracts не повторялись.
Новых commits, tags, public assets или Release Bundle нет. Working Custom Cabinet
остаётся uncommitted; подготовленные bytes не объявляются public source identity.

## Следующий gate и текущие ограничения

`SERVER_IS_DISPOSABLE` в локальном config не равен `yes`. Перед изменениями
назначенного VPS нужен явный disposable confirmation по Installer instructions;
штатный флаг действует в памяти и не требует редактировать private config.
Конкретный scoped runtime plan сохранён в workspace
`.scratch/bedolaga-v5-runtime-20261013/VPS_RUNTIME_PLAN.md`: отдельные test root,
Compose resources и proxy snippet; full startup/HTTPS/JWT checks; затем cleanup
только собственных ресурсов с сохранением management Installer.

В designated `server.env` не найдены Cashera/перечисленные sandbox merchant
параметры. Другие private test-config locations не исследовались; нельзя выводить
глобальное отсутствие merchant из этого файла. Sandbox payments/callbacks,
concurrency, enabled recurring, полный RBAC/Marketer и physical Telegram остаются
NOT_VERIFIED. Classic auto-purchase и flag-off/reload discovery остаются OPEN.

Новый Bot SHA требует full Installer lifecycle новой комбинации; старый proof
Bot4.15 не переиспользуется. Target PG15 whole-runtime compatibility и переход
PG15→PG18 не подтверждены. Runtime snapshots не являются новым Release Bundle.
Production, Release и project source changes в этом продолжении отсутствуют.

## Receipts

Workspace `.scratch/bedolaga-v5-runtime-20261013/`:
`vps-preflight-20261013.json`, `vps-inputs-readonly-20261013.json` (initial probe),
`vps-inputs-diagnose-20261013.json`, `vps-inputs-final-20261013.json`,
`vps-prepared-inputs/prepared-inputs.json`. Прежнее локальное runtime evidence:
[local proof](compatibility-evidence-v1801-bot-v5-local-20261013.md).
