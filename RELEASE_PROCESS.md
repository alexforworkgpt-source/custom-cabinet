# Отдельный Release Custom Cabinet

Status: действующий процесс; первый primary выпуск завершён 2026-10-02.
`cabinet-v2026.10.02.1` stable на source
`8fb8cbec19d651fcfaee3bce32621031b3e69965`;
[exact source CI/publication](https://github.com/alexforworkgpt-source/custom-cabinet/actions/runs/37026262757) SUCCESS.
Общий порядок выпуска и отдельного deployment — Installer
`docs/deployment-procedure.md`; production runbook находится в корне workspace.

Custom Cabinet Release фиксирует версию исходников и известные ограничения.
Release Bundle в репозитории Installer содержит готовый frontend и проверенный
комплект для установки. Собственный Release Cabinet не обновляет production.
Решение: Installer `docs/adr/0001-independent-project-releases-and-bundles.md`.

## Порядок нового выпуска

1. **В Custom Cabinet:** выбрать чистый, закоммиченный source и существующий
   `cabinet-vYYYY.MM.DD[.N]`, указывающий на его точный 40-символьный commit SHA.
   SHA — идентификатор конкретного коммита. Локальные изменения владельца
   не включать автоматически. Сначала выполнить review diff, public branding
   и secret scan по AGENTS.md. `UPSTREAM.md` и `LICENSE` сохранить без подмены.
   Это связывает будущий Release с проверенными исходниками.
2. **На default branch Custom Cabinet:** согласовать публичную запись
   `releases/records/<name>.json` и получить точный SHA её коммита. Она может
   быть добавлена после source tag: публикация читает её через Git, не изменяя
   tagged source. Запись содержит изменения, исходники, проверенную комбинацию
   с Upstream Bot, ссылки на evidence и открытые ограничения.
3. **В GitHub Actions Custom Cabinet:** вручную запустить `Publish Custom Cabinet`
   из того же коммита, что `cabinet_sha` (в выборе workflow branch/tag — его ref).
   Передать `cabinet_tag`, `cabinet_sha`, `record_commit`, `record_path`.
   По умолчанию `prerelease=true`: это кандидат. `false` допускается только
   после согласования стабильного project Release и принятия ограничений.
   Выбранные source, tag и workflow должны совпасть; произвольная ветка
   с workflow от другого коммита отклоняется.
4. **В этом же запуске Actions:** reusable CI выполняет lint/format, unit tests
   на Node 24/26, publication guard tests, type-check и build на exact source.
   CodeQL анализирует тот же SHA. Успешное завершение CodeQL job не является
   доказательством отсутствия всех security alerts. `npm audit` сохраняет
   прежнюю non-blocking политику и запускается отдельно на push/schedule.
   Обычные CI, CodeQL и audit также охватывают `release/**`, `sync/**`
   и `cabinet-v*`; push сам по себе Release не создаёт.
5. **В Releases Custom Cabinet:** после gates создать собственный draft,
   загрузить только `cabinet-release.json` и `cabinet-release.json.sha256`,
   скачать их обратно и сравнить весь набор и каждый байт с подготовленными
   файлами. JSON фиксирует Cabinet source/tree, Upstream provenance, Bot,
   reviewed record, workflow/run и checksum committed LICENSE. Notes описывают
   изменения и ограничения. GitHub добавляет обычные source archives от tag.
   Compiled `dist`, env, локальные отчёты и production logs не загружаются.
6. **В Installer:** выбрать тот же Cabinet SHA для нового Release Bundle;
   собирать Cabinet в Bundle существующим воспроизводимым процессом.
   Предыдущий Installer Release можно использовать повторно, если его код
   не менялся. Кандидат Bundle может проверяться до stable project Releases.
   Перед stable Bundle оба project Releases должны стать stable на exact SHA.
   В Installer используется отдельный `Promote Release Bundle`:
   порядок и durable evidence описаны в `docs/bundle-promotion-evidence.md`
   проекта Installer. Первый primary Bundle promotion прошёл SUCCESS 2026-10-02.
   Для Cabinet-only изменения неизменный Installer Release и exact lifecycle
   evidence переиспользуются; новый Bundle требует своего targeted smoke.

## Подготовка без повторных полных прогонов

Для Cabinet-only выпуска применять Installer
`docs/cabinet-only-release-checklist.md` вместе с общим deployment procedure.
После source changes выполнить `npm test` и `npm run build`: последний уже
включает полный `type-check`. Дополнительный полный локальный прогон на обеих
Linux Node 24/26 не нужен только ради дублирования publication CI. Встроенные
source-gates/CodeQL, обе версии Node в tests и approvals остаются обязательными.

Текущий CI не запускает Playwright. Один финальный browser gate выполнить на
точном compiled artifact до stable: локальном с последующим byte equality
публичному архиву либо уже скачанном candidate. Не повторять тот же полный
набор через Vite dev и public artifact при неизменных bytes, test inputs и
scope. Изменения source, общих компонентов/стилей, окружения или тестов требуют
повторной проверки затронутого покрытия. Mocks не доказывают live integrations.

Независимость компиляций подтверждать по checklist: второй Docker build может
использовать кэш. Не считать планируемый Actions run выполненным gate и не
пропускать targeted smoke именно нового публичного Bundle. Evidence/docs
обновляются после tested source; source tags и существующие assets сохраняются.

## Формат reviewed record

Ниже намеренно **непригодный к публикации** шаблон: placeholders и
`owner_approved=false` должны быть заменены подтверждёнными данными после review.
Не копировать секреты в публичную запись.

```json
{
  "schema_version": 1,
  "cabinet": {
    "tag": "cabinet-vYYYY.MM.DD",
    "sha": "EXACT_CABINET_COMMIT",
    "tree_sha": "EXACT_CABINET_TREE"
  },
  "upstream": {
    "repository": "EXACT_URL_FROM_COMMITTED_UPSTREAM_MD",
    "tag": "EXACT_TAG_FROM_COMMITTED_UPSTREAM_MD",
    "sha": "EXACT_SHA_FROM_COMMITTED_UPSTREAM_MD"
  },
  "bot": {
    "repository": "EXACT_PUBLIC_UPSTREAM_BOT_GIT_URL",
    "sha": "EXACT_VERIFIED_BOT_COMMIT",
    "backend_contract": "1",
    "compatibility_evidence": "PUBLIC_GITHUB_RUN_OR_EXACT_COMMIT_BLOB_URL"
  },
  "changes": ["Конкретные изменения относительно указанного предыдущего Cabinet"],
  "limitations": [
    {
      "id": "classic-auto-purchase",
      "status": "OPEN",
      "summary": "Известный backend defect; не закрыт изменением frontend"
    },
    {
      "id": "live-integrations",
      "status": "BLOCKED",
      "summary": "Перечислить реальные непроверенные сценарии и решение владельца"
    }
  ],
  "frontend_policy": {"bscheker": "excluded", "simple_mode": "excluded"},
  "owner_approved": false
}
```

`tree_sha` получают через `git rev-parse <cabinet_sha>^{tree}`. Upstream данные
сверяются с `UPSTREAM.md` именно выбранного Cabinet commit. Compatibility
evidence допускает публичный GitHub Actions run URL или GitHub blob URL
с точным commit SHA. Ссылка и `owner_approved=true` не доказывают правдивость
результата: содержание проверяет владелец в reviewed процессе.
Проверка ancestry требует, чтобы record commit был включён в default branch.
Защита этой ветки и environment `production-release` — внешние настройки;
workflow не создаёт approval rules и сам по себе их не гарантирует.

На первом primary выпуске 2026-10-02 проверены native immutable Releases,
защита `cabinet-v*` от update/delete, main через PR без force-push/delete и bypass.
Независимых branch approvals 0; существующий `production-release` требует owner
approval, допускает self-review и запрещает admin bypass. Exact source Actions
и environment approval выполнены. Перед следующим выпуском сверить актуальные
защиты, не менять настройки и не обходить approvals.

Unit tests, mock/browser tests и build не заменяют живую проверку оплаты,
Telegram, panel, продления и совместимости с выбранным Bot. Отсутствующее
покрытие остаётся `BLOCKED` либо явно принятым владельцем ограничением,
но не записывается как PASS. BSCHEKER и Simple/Lite Mode остаются исключёнными;
classic auto-purchase остаётся принятым OPEN ограничением. Backend fix не входит
в задачи или условия завершения выпуска; backend постоянно неизменен.

## Сохранение Releases и повторное использование

Любой existing draft или public Release останавливает новую публикацию под
этим tag. Ошибки API, включая HTTP 404, не означают подтверждённое отсутствие.
Cleanup проверяет repository, Release ID, tag, run/attempt marker и draft;
удаляет только незавершённый draft своего запуска. Public Release сохраняется.
Upload не использует `--clobber`; candidate и stable создаются с `latest=false`.

Изменение assets требует нового tag. Этот workflow не переводит уже публичный
Cabinet candidate в stable повторным запуском. Такой переход metadata должен
проверяться отдельно без перезаписи assets. Отдельный автоматический Cabinet
promotion workflow пока не подготовлен; Bundle promotion не переводит Cabinet
Release в stable автоматически.

### Metadata-only перевод Custom Cabinet в stable

1. **В задаче выпуска:** подтвердить разрешение на конкретный пакет и принятые
   ограничения. Перед переводом нового Cabinet завершить source gates,
   независимую проверку public metadata и targeted smoke нового Bundle.
   Это связывает stable статус с фактической проверкой пакета.
2. **В GitHub API Custom Cabinet:** прочитать Release по ID и dereferenced tag;
   сверить exact source SHA, `draft=false`, `prerelease=true`, `immutable=true`,
   notes, asset IDs/names/sizes/digests/URLs и прежний `latest`.
   Сохранить снимок до изменения; при несовпадении остановиться.
3. **Для этого Release ID:** выполнить `PATCH /repos/<owner>/<repository>/releases/<id>`
   только с JSON `{"prerelease": false, "make_latest": "false"}`.
   Это меняет статус без повторной публикации и замены assets.
4. **В GitHub API:** повторно прочитать Release и `latest`; подтвердить stable,
   immutable и прежние notes/tag/source/assets/latest. Если Release уже stable,
   сверить те же bindings без повторного PATCH. Сохранить receipt и затем
   выполнить отдельный guarded promotion Bundle в Installer.

Одно разрешение на перечисленные операции конкретного пакета достаточно;
рутинные шаги не требуют повторных вопросов. Разрешение на Release не означает
разрешения на production, `latest` или GitHub settings. Backend source/API/
миграции и выбранный Upstream Bot SHA сохраняются. Исторические Releases
не перепубликовывать; evidence/docs добавлять после source отдельными commits,
не перемещая tested source tag.

Исторический стабильный Cabinet Release разрешено использовать в новых Bundles
без добавления в него нового JSON. Если меняется Bot, новую совместимость
подтверждают в evidence нового Bundle; старый Cabinet Release не редактируют.
Backfill недостающих исторических Releases — отдельная задача: существующий
tag/SHA, фактическая новая дата публикации, ссылки на прошлые Bundles,
без выдуманных исторических PASS и без перемещения tags. Старый tagged source
не обязан содержать новый workflow; его нельзя переписывать ради backfill.

## Проверка локальной подготовки

Следующие записи — исторические результаты подготовки 2026-10-01, не текущий
статус процесса. Первый primary выпуск на `8fb8cbe…` прошёл actual Linux CI:
991 frontend + 15 publication tests на каждом Node 24/26, lint/typecheck/build/
CodeQL SUCCESS; metadata public download и последующий Bundle smoke/promotion
прошли. Точные receipts — Installer `docs/primary-first-release-completion-20261002.json`.

На 2026-10-01: 991 frontend tests PASS на Node 24.19.0 и 26.10.0
с `--maxWorkers=2`; Node 24 type-check/build PASS. До release-правок обычный
параллельный прогон дал 21 ошибку преимущественно по timeout; тот же набор
прошёл с двумя workers без изменения продуктового кода. Связь с нагрузкой —
предположение, поэтому ограничено число workers, а не ослаблены timeout/asserts.
Publication fixtures используют временные Git repositories и подменённый API;
они не создают настоящие reviewed records или Releases.
Все 12 publication tests PASS на Node 24/26; Biome check/format, `actionlint`
и Bash syntax для 24 workflow run blocks PASS. В прежнем frontend Biome
сохраняет warnings; ошибок нет. Контрольные суммы исходных dirty/untracked
файлов владельца сохранены; для README проверена точная замена release абзаца
с сохранением прежней работы владельца (39 файлов в исходном baseline).

Дополнительно в локальном этапе 5 Installer все 12 publication fixtures PASS
на Linux Debian 12 / Node 24.18.1 / Git 2.39.5 в контейнере без сети и host mounts.
Это проверяет release scripts на Linux и не заменяет настоящий Actions run.

После отдельного разрешения selective release-process commit
`2c48c837505a5fb652b6fe8eeb4db9612e25ff5b` создан в чистой копии без прежних
dirty application changes владельца; сохранён на локальной ветке
`release/process-stage5-20261001`, без push. Его 12 publication fixtures PASS
на Node 24.19.0. Прежние frontend gates выше относятся к dirty source владельца,
а не к новому exact Actions proof этого commit.

GitHub native immutable Releases включены; `cabinet-v*` защищён от update/delete,
main требует PR и запрещает force-push/delete, bypass actors отсутствуют.
Независимых branch approvals 0. Environment `production-release` требует owner
approval, допускает self-review, admin bypass запрещён; разрешены `cabinet-v*`.
Настройки повторно прочитаны API, но реальный Actions approval не проверен.
Настоящие dispatch, exact Linux CI/CodeQL и public upload/download не выполнены.
VPS lifecycle нового Installer с existing Cabinet `5ee46023…` не является
runtime smoke Cabinet `2c48c837…`. Releases/production не изменялись.

В следующем продолжении exact `2c48c837…` дополнительно прошёл local Linux
gates: 947 frontend tests/159 files и 12 publication fixtures на Node 24.18.1
и 26.10.0; Node 24 lint/format/type-check/build PASS с 40 lint warnings.
`npm ci` использовал committed lockfile внутри контейнера; во время tests
сеть и host mounts отсутствовали. Все 970 source files совпали с Git archive
после gates; контейнер удалён. Это не actual Actions/CodeQL или public smoke.

Официальные основания API/workflow:
[Reuse workflows](https://docs.github.com/en/actions/how-tos/reuse-automations/reuse-workflows),
[GitHub Releases REST API](https://docs.github.com/en/rest/releases/releases).
