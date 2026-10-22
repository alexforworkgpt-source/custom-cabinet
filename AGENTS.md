# Custom Cabinet Repository

- **Upstream Bot принимаем как рабочую основу.** Текущая задача — Custom Cabinet,
  его подключение к существующему API и правильность условий тестирования.
  Не превращать её в самостоятельный аудит/проверку backend, внутренних платежных
  обработчиков, SDK или полной backend RBAC/ABAC-матрицы. При несовпадении сначала
  проверять наш frontend, exact artifact, URL/proxy/auth и тестовые данные/настройки.
  Старые OPEN/BLOCKED сохранять как исторические ограничения, не как новый backend
  todo и не как PASS. Обязательные применимые frontend/Release gates сохраняются.
  Прочитать актуальный scope в начале `CONTEXT.md` до выбора следующей проверки.
- Выполнять доступные frontend/connection проверки подряд, без запроса
  «продолжать?» после каждого этапа; отдельно запросить только действительно
  необходимые действия владельца, доступы или авторизацию новых операций.
- Backend — постоянная граница проекта: не изменять исходный код Upstream Bot,
  его API, бизнес-логику или миграции БД; не создавать backend fork или patches.
  Не предлагать и не обсуждать решения, требующие таких изменений, и не включать
  их в планы, ADR или задачи. Custom Cabinet адаптируется к существующему API
  и поведению неизменённого Upstream Bot. Если frontend-only решение невозможно,
  кратко зафиксировать ограничение без предложения исправлять backend и без
  добавления такого исправления в условия завершения frontend/Release задачи.
  Это правило не отменяет обязательные проверки и не превращает OPEN/BLOCKED
  ограничения в PASS.
- Preserve `LICENSE`, exact upstream URLs and the provenance in `UPSTREAM.md`.
- Do not publish build output, local environment files, screenshots or agent
  working data.
- Keep functional and visual customization separate from repository maintenance.
- Run `npm test` and `npm run build` after source changes. The current build
  invokes the full `type-check` script, including `tsconfig.node.json`, so a
  separate successful `npm run type-check` is not required in the same check
  cycle. If build stops invoking that full check or only `build:docker` runs,
  run `npm run type-check` explicitly. Documentation-only changes need focused
  documentation validation instead of frontend tests/build.
- Before any Upstream Cabinet integration, read and follow `UPSTREAM_SYNC.md`,
  `CUSTOMIZATION_MAP.md` and `COMPATIBILITY.md`.
- Treat every integration as a three-way comparison between the previous exact
  upstream SHA, the new exact upstream SHA and the current Custom Cabinet commit.
- Never replace the Custom Cabinet tree with an upstream archive or resolve a
  hybrid file by taking an entire side without reviewing behavior and states.
- Preserve upstream security, API, routing, payment, Telegram, localization and
  accessibility fixes even when upstream presentation is intentionally skipped.
- During redesign work, follow `REDESIGN_RULES.md`; keep business behavior out of
  presentational components and update `CUSTOMIZATION_MAP.md` when ownership
  boundaries change.
- Do not combine an upstream synchronization with unrelated redesign,
  dependency upgrades, mass formatting, broad renaming or file movement.
- Update `UPSTREAM.md` and `COMPATIBILITY.md` only after integration and the
  applicable verification gate succeed.
- Before staging or production verification, follow `LIVE_CHECK.md` and create a
  report from `LIVE_CHECK_REPORT_TEMPLATE.md`.
- Never let an agent initiate a real payment, destructive production action or
  public Release without explicit owner approval. Use sandbox and isolated test
  data by default.
- Treat `BLOCKED` as not verified, never as `PASS`; keep a tested rollback source
  before production deployment.
- Follow `RELEASE_PROCESS.md` for project publication and Installer
  `docs/deployment-procedure.md` for Bundle/deployment coordination. Cabinet-only
  releases reuse the exact unchanged Installer source and trusted lifecycle;
  run Cabinet gates and targeted new Bundle smoke/cleanup. Preserve tested tags,
  existing assets, owner local changes, `latest` and settings. Execute the named
  operations within one package authorization without repeated questions;
  production is separately authorized through root production runbook.
- For Cabinet-only release preparation, use Installer
  `docs/cabinet-only-release-checklist.md`. Do not add another full local Linux
  Node 24/26 matrix solely to repeat the publication CI. Keep its actual exact
  source gates, both Node test versions, and one final compiled-artifact browser
  gate: current CI does not run Playwright. New source/artifact or changed test
  inputs invalidate affected evidence; old PASS does not prove a new candidate.

## Agent skills

### Issue tracker

Work items are local Markdown files under `.scratch/<feature>/`. See
`docs/agents/issue-tracker.md`.

### Triage labels

Use the canonical `needs-triage`, `needs-info`, `ready-for-agent`,
`ready-for-human` and `wontfix` statuses. See
`docs/agents/triage-labels.md`.

### Domain docs

This is a single-context project. Read `CONTEXT.md` and the consumer rules in
`docs/agents/domain.md`; record future architectural decisions under
`docs/adr/`.

#### Automatic triggers

- `diagnose`: use automatically when the user reports broken, failing, incorrect, slow, hanging, or inconsistent behavior. Follow reproduce → minimise → hypothesise → instrument → fix → regression-test. For a trivial, already-proven typo, a full diagnosis loop is unnecessary.
- `tdd`: use automatically for financial calculations, Accounting Core rules, sync behavior, data transformations, bug fixes with regression risk, and other testable domain behavior. Start with a failing test, then implement and refactor. Skip only for documentation-only, styling-only, generated configuration, or infrastructure changes where a meaningful pre-implementation test is not practical; still add the strongest available verification.
- `triage`: use automatically when creating or reviewing bugs, feature requests, incomplete reports, or work items; when deciding whether an issue needs information, is ready for an agent/human, or should be rejected; and when updating local issue workflow state.
- `grill-with-docs`: use when a plan or feature still contains unresolved domain terms, business rules, boundaries, or hard-to-reverse architectural choices. Ask one question at a time and update `CONTEXT.md` or ADRs as decisions are resolved. Do not use it for routine implementation of an already approved issue.
- `grill-me`: use when the user asks to stress-test a plan but does not want project documentation updated inline. Prefer `grill-with-docs` when the decisions belong in this repository.
- `to-prd`: use when a sufficiently resolved conversation, plan, or feature brief should become a formal PRD. Synthesize existing decisions without restarting discovery or interviewing the user again.
- `to-issues`: use after a PRD or implementation plan is approved and needs to be decomposed into dependency-ordered, independently deliverable vertical slices. Present the proposed breakdown for approval before publishing issues.
- `prototype`: use before committing to an uncertain interaction, state machine, data model, or UI direction when a throwaway implementation can answer the question faster than discussion. Do not treat prototype code as production code or silently merge it into the product.
- `improve-codebase-architecture`: use when the user asks for architectural improvement, refactoring opportunities, reduced coupling, deeper modules, better testability, or easier agent navigation. Ground recommendations in `CONTEXT.md` and ADRs rather than generic patterns.
- `zoom-out`: use when a code area is unfamiliar or a local change cannot be evaluated safely without mapping its callers, dependencies, and domain role. Explore one abstraction level higher before editing.
- `handoff`: use when work must continue in another session or agent. Save a compact handoff in the OS temporary directory, reference existing artifacts instead of duplicating them, suggest relevant skills, and redact secrets.
- `setup-matt-pocock-skills`: use only when this repository's issue tracker, triage vocabulary, or domain-document layout is missing or intentionally changing. Do not rerun it for ordinary tasks now that setup is complete.

#### Workflow combinations

- Bug report: `diagnose`, then `tdd` for the regression fix, then `triage` if an issue must be created or updated.
- New business rule: `grill-with-docs` if unresolved; once approved, `tdd` for implementation.
- New substantial feature: `grill-with-docs` when needed → `to-prd` → `to-issues` → implement each AFK issue with `tdd` where applicable.
- Uncertain UI direction: `prototype` first; after approval, implement with the design tooling below and verify in a browser.
- Architecture review: `zoom-out` to map the area when necessary, then `improve-codebase-architecture` for concrete recommendations.

These triggers are defaults, not ceremony. Choose the smallest workflow that materially improves correctness, clarity, or handoff quality.



### Правила разработки

Не ломай существующую логику и не переписывай рабочий код без необходимости.
Перед изменениями изучай текущую структуру проекта и придерживайся уже принятого стиля кода, компонентов и UI.
Не раздувай файлы: один файл — одна зона ответственности. Обычные компоненты, хуки,
сервисы и API-обработчики старайся держать до 200–300 строк; если файл приближается к 400–500 строкам, сначала оцени декомпозицию.
Не прячь бизнес-логику внутри UI, выноси сложную логику в отдельные модули, хуки или сервисы.
Если данных не хватает — не выдумывай, а явно укажи допущение или задай вопрос.
При внесении изменений придерживайся такого порядка:

1. В первую очередь используй уже существующие компоненты, классы, переменные, токены, utility-классы и паттерны проекта.
2. Не создавай новые классы и стили, если задачу можно решить через существующую систему стилей.
3. Если без нового класса или нового стиля не обойтись, сначала проверь, действительно ли нет подходящего существующего решения.
4. Не дублируй стили, которые уже есть в проекте под другим именем.
5. Не добавляй инлайн-стили без крайней необходимости.
6. Не ломай существующую структуру, не меняй глобальные стили без необходимости.
7. Все изменения должны быть в логике текущей дизайн-системы проекта.
8. Если создаешь новый класс, делай это только как исключение и только если это нельзя решить через существующие сущности.

Перед тем как добавлять новый класс или стиль:
- проверь, есть ли в проекте аналогичный элемент;
- проверь, можно ли переиспользовать существующий класс;
- проверь, можно ли решить задачу через существующие отступы, размеры, цвета и состояния;
- только если это невозможно, создавай новое решение.

Все терминальные команды запускай через явный Git Bash:
C:\Program Files\Git\bin\bash.exe
Не используй generic bash из PATH и не используй PowerShell для проектных команд, кроме технической обертки запуска Git Bash.

Если rg внутри Git Bash падает как несовместимый бинарник, используй find/sed/cat/git grep из Git Bash, но не переключайся на PowerShell

## Локальный запуск веб-кабинета

Custom Cabinet содержит только frontend. Upstream Bot, PostgreSQL и Redis этим
репозиторием локально не запускаются.

1. Используй рабочую директорию `M:\CURSOR2\PC WEB\custom-cabinet` и явный Git
   Bash `C:\Program Files\Git\bin\bash.exe`.
2. Не запускай `npm install` или `npm update`: они могут изменить
   `package-lock.json`. Если `node_modules` отсутствует, выполни `npm ci`.
3. Запусти frontend командой `npm run dev` и не завершай процесс во время
   проверки.
4. Открывай `http://localhost:5173`.

Vite проксирует `/api` и `/health` на `http://localhost:8080`. На этом адресе
должен отдельно работать совместимый Upstream Bot. Если backend не запущен,
экран недоступности сервиса является ожидаемым поведением. Локальный
`docker-compose.yml` запускает только frontend и не поднимает Upstream Bot.

Для browser-проверки без настоящего backend используй `npm run test:e2e`:
Playwright сам запускает Vite на `http://localhost:4173` и подменяет API
тестовыми ответами.

Для интерактивной проверки полного локального API-мокапа, включая тестовые
платежи, подключение, тарифы и права `super_admin`, следуй инструкции
[`docs/agents/full-local-api-mock.md`](docs/agents/full-local-api-mock.md).

**Если пользователь просит «запустить мокап» или разные сценарии пользователя,
сразу используй [быстрый запуск 28 сценариев](docs/agents/full-local-api-mock.md#scenario-quick-start).**
Пункты15–28 — скидки/предложения; для их просмотра используй `LOCAL_PREVIEW_SCENARIO=32`
(пункт15, активная скидка20%).
Готовый entry: `.scratch/subscription-management-page/user-preview.mts`;
launcher: `.scratch/subscription-management-page/launch-mock.cjs` (`vite` / `window`).
Инструкция содержит точные команды, portable Node24.15.0, Chromium, логи и
переключатель Mock Mode. Сначала проверь уже работающие процессы и порт 5173;
не ищи помощники заново по всему `.scratch/`, не пересоздавай fixtures и не
устанавливай `tsx`: этот entry запускается обычным Node24.15.0. Для простого
запуска не повторяй сборку, весь e2e/28-state check или Release gates без
изменений либо конкретной неисправности. API-подмена действует в отдельном
окне helper Chromium, а не в произвольной вкладке браузера.

## Стиль общения с пользователем

Пользователь — вайбкодер, а не профессиональный разработчик.

Общайся с ним простым и понятным языком

Когда вносишь изменения:
1. Сначала объясни проблему одним простым предложением.
2. Потом объясни, что именно будет изменено.
3. Потом укажи риск, если он есть.
4. Потом дай точную команду или путь к файлу, если пользователю нужно что-то сделать вручную.

Главное правило: понятность важнее красивых технических формулировок.
Техническую точность сохраняй там, где это важно для безопасных изменений в коде.

Начиная со следующей правки, в конце каждого отчета  добавляй отдельную строку:
Рекомендуемый уровень рассуждения для следующей задачи: <низкий|средний|высокий|очень высокий> + краткое почему
