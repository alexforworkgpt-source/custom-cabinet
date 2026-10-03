# Отдельный Release Custom Cabinet

Status: workflow опубликован и проверен настоящими GitHub runs 2026-10-02.
Stable reference: `cabinet-v2026.10.02.1` / `bundle-v2026.10.02.1`.
Данные разделов с датой 2026-10-01 ниже относятся к исторической подготовке.

## Выпуск дизайна 2026-10-03

Кандидат `cabinet-v2026.10.03.1` подготовлен из isolated source
`3b6255597f5ad5270136dd1f683fed980b925a66`; tree
`8422dc4a2ab015b6025200a3f8c417fa912c38de`.
Reviewed record: `releases/records/cabinet-v2026.10.03.1.json`.
Ограниченное compatibility evidence:
`releases/evidence/compatibility-design-3b62555-877690a7-20261003.md`.
Installer `installer-v2026.10.02` / `75c49bec9c2a764e123fc0ef675f8c45fc22a1ab`
и принятое lifecycle evidence переиспользуются при прежних identities/contracts.
Новый Bundle `bundle-v2026.10.03.1` сначала публикуется как candidate,
проходит public-byte verification и отдельную disposable installation,
затем metadata promotion Cabinet и Bundle. Состояние публикации и фактический
smoke фиксируются в отдельных completion/evidence документах, не в tagged source.
`latest`, production, прежние tags/Releases/assets и owner working copies
сохраняются. Production transition требует отдельного разрешения.

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
   В Installer локально подготовлен отдельный `Promote Release Bundle`:
   порядок и durable evidence описаны в `docs/bundle-promotion-evidence.md`
   проекта Installer. Его настоящий запуск на GitHub ещё не проверен.

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

Read-only проверка GitHub API на 2026-10-01: в Custom Cabinet список environments
и repository rulesets пуст. `production-release` и защита новых tag prefixes
должны быть отдельно настроены и проверены до первого внешнего запуска по ADR.
Настройки здесь не изменялись. Branch protection и native immutability будущих
Releases этой проверкой не подтверждены.

Unit tests, mock/browser tests и build не заменяют живую проверку оплаты,
Telegram, panel, продления и совместимости с выбранным Bot. Отсутствующее
покрытие остаётся `BLOCKED` либо явно принятым владельцем ограничением,
но не записывается как PASS. BSCHEKER и Simple/Lite Mode остаются исключёнными;
classic auto-purchase остаётся OPEN до отдельного подтверждённого backend fix.

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

Исторический стабильный Cabinet Release разрешено использовать в новых Bundles
без добавления в него нового JSON. Если меняется Bot, новую совместимость
подтверждают в evidence нового Bundle; старый Cabinet Release не редактируют.
Backfill недостающих исторических Releases — отдельная задача: существующий
tag/SHA, фактическая новая дата публикации, ссылки на прошлые Bundles,
без выдуманных исторических PASS и без перемещения tags. Старый tagged source
не обязан содержать новый workflow; его нельзя переписывать ради backfill.

## Проверка локальной подготовки

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

Настоящие GitHub dispatch, Linux CI/CodeQL, review/environment permissions,
immutability, public upload/download и живые integration gates здесь
не выполнены. Локальная подготовка не разрешает push, tag, Release или deploy.

Официальные основания API/workflow:
[Reuse workflows](https://docs.github.com/en/actions/how-tos/reuse-automations/reuse-workflows),
[GitHub Releases REST API](https://docs.github.com/en/rest/releases/releases).
