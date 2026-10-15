# Custom Cabinet: готовность к подготовке релиза — 2026-10-15

Решение: **FRONTEND_READY_FOR_RELEASE_PREPARATION_WITH_ACCEPTED_DEVICE_SKIP**.
[Машинная запись](FRONTEND_RELEASE_READINESS_2026.10.15.json).

## Решение владельца

Владелец сообщил: «Узкая проверка тг и устрйоств прпоустим, к релизу в целом готовы?».
Для текущей задачи и проверенной сборки
`0aa20cd0f035ec41fd4f0270a1b4e94f04a0bd03075d92e3493334728bd170d0`
реальная Android/iOS Telegram/device проверка отмечена **SKIPPED_OWNER_ACCEPTED**.
Это принятое ограничение для текущей задачи подготовки релиза, не PASS и не
постоянное исключение для любых будущих релизов. Сохранённые широкие S9 OPEN/BLOCKED
не переименовывались.

**Upstream Bot принимаем как рабочую основу.** Текущий frontend-остаток не
дополняется самостоятельными backend/payment-handler/SDK/full RBAC suites.

## Подтверждённая готовность Custom Cabinet

- Обычный `npm test`:1084 PASS,176 файлов, прежний5s timeout.
- Build/both TypeScript:PASS. Full Biome check:PASS с40 предупреждениями/5 infos.
- Exact compiled browser gate:1146 PASS/35 предусмотренных SKIP/0 FAIL.
- Публичный frontend:284 HTTPS файла совпали с manifest; guest Chrome320/375/1280,
  оферта/reload/возврат и подключение к существующему API PASS.
- В рамках этого решения runtime/E2E/dependencies/compiled bytes не менялись;
  завершённые проверки не запускались повторно.

Источники: [ordinary unit](../compatibility-evidence-v1801-bot-v5-unit-default-20261015.md),
[browser matrix](../compatibility-evidence-v1801-bot-v5-browser-matrix-20261015.md),
[full check и scoped integration](../compatibility-evidence-v1801-bot-v5-remaining-20261015.md),
[public frontend](../frontend-staging-20261015.md).

## Что ещё требуется именно для выпуска

1. **В отдельной чистой копии Custom Cabinet:** review выбранных изменений
   относительно выбранного stable source, secret/branding scan, сохранность owner
   work/provenance/LICENSE; зафиксировать точный tested source commit и reviewed
   release record. Рабочая папка пока содержит uncommitted work.
2. **В GitHub Actions Custom Cabinet/Installer:** фактический PASS применимых exact
   source-gates/Node24/26/CodeQL/publication и Bundle workflows. Существующие
   lifecycle/transition proofs переиспользуются только при совпадении identities
   и scope; новый backend test scope не добавляется. CI этого нового source ещё
   не выполнялся, будущий PASS не заявляется.
3. **На новом candidate Release Bundle:** независимая проверка публичных bytes,
   manifest/provenance/contracts и targeted installation/smoke нового Bundle.
   Активную временную frontend-подачу Caddy необходимо убрать из пути этого smoke
   до его начала, чтобы она не скрывала результат установки. Исходный parent
   runtime сохранять в разрешённом owner scope, старый whole cleanup не запускать.
4. **Перед stable:** согласованные notes/ограничения, immutable tags/assets и
   обязательные approvals/read-back. Browser proof переиспользовать при совпадении
   bytes/test inputs/scope; при изменении проверять затронутое покрытие.

Порядок: [RELEASE_PROCESS](../../RELEASE_PROCESS.md), workspace Installer
`docs/deployment-procedure.md` и `docs/cabinet-only-release-checklist.md`.
Это готовность **начать подготовку релиза**, не готовый опубликованный пакет и
не фактический PASS ещё не выполненных CI/publication/Bundle gates.

Вопрос о готовности и пропуск устройств не является разрешением на commits/push/
tags/публикацию конкретного пакета или production. Текущий frontend стенд оставлен
как есть; rollback/cleanup не выполнялись. Следующий шаг — согласованный пакет
Release-подготовки, без повторного запроса проверки телефонов.
