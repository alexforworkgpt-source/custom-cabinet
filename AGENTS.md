# Custom Cabinet Repository

- Preserve `LICENSE`, exact upstream URLs and the provenance in `UPSTREAM.md`.
- Do not publish build output, local environment files, screenshots or agent
  working data.
- Keep functional and visual customization separate from repository maintenance.
- Run `npm test`, `npm run type-check` and `npm run build` after source changes.
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
