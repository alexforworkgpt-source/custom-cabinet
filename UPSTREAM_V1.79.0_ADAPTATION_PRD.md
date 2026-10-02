# PRD: адаптация Upstream Cabinet v1.79.0 и Upstream Bot v4.15.0

Status: `ready-for-agent`
Research cutoff: `2026-09-23`
Architecture decision: [`ADR 0002`](docs/adr/0002-adapt-upstream-cabinet-v1.79-bot-v4.15.md)

## Problem Statement

Production работает на Custom Cabinet, в котором уже сохранены собственные
навигация, Unified Dashboard, branding, дизайн-система, загрузочные состояния,
инструкции и browser-проверки. Его подтверждённая upstream-база — Upstream
Cabinet `v1.74.0` и Upstream Bot `v4.10.0`.

После этой базы Upstream Cabinet выпустил версии `v1.75.0`–`v1.79.0`, а
Upstream Bot — `v4.11.0`–`v4.15.0`. В них есть новые API-контракты, миграции
базы, исправления подписок и синхронизации, PWA manifest, переработка списка
пользователей, напоминания, upstream Simple/Lite Mode и новые
административные операции. Simple/Lite Mode подтверждён в diff, но намеренно
исключён из адаптации: Custom Cabinet уже решает ту же продуктовую задачу через
Unified Dashboard, собственную навигацию и responsive overlays.

Прямая замена дерева Custom Cabinet на Upstream Cabinet потеряет кастомные
доработки. Перенос только пунктов из release notes тоже недостаточен: часть
обязательных состояний, fallback-поведения, permissions и исправлений находится
только в diff и тестах. Нужна проверяемая адаптация трёх точек: старого
Upstream Cabinet, нового Upstream Cabinet и текущего Custom Cabinet.

## Solution

Адаптировать подтверждённые изменения диапазона Upstream Cabinet
`v1.74.0..v1.79.0` в текущую архитектуру Custom Cabinet и проверять их с точным
Upstream Bot `v4.15.0`.

Работа выполняется функциональными срезами. Подтверждённые API, типы,
permissions, маршрутизация, платежные и subscription-состояния переносятся,
кроме явно исключённых Simple/Lite Mode и BSCHEKER contracts. Презентация
реализуется через существующие компоненты и Unified Dashboard.
Публичный branding, собственная навигация и запрет BSCHEKER сохраняются.
Upstream Simple/Lite Mode, его API client, admin toggle, storage hint и
параллельные presentation-компоненты не переносятся. Это осознанная граница,
а не пропущенная работа.

Upstream Bot не форкается и не копируется в Custom Cabinet. Его изменения
принимаются обновлением точного Bot SHA в будущем Release Bundle и проверяются
как совместимый backend. Публикация и production-переход являются отдельным
этапом после успешной адаптации и не разрешены этим PRD автоматически.

## Evidence Baseline

### Текущая подтверждённая production-точка

| Компонент | Точная идентичность |
| --- | --- |
| Release Bundle | `v2026.09.21.1`, identity `991c6ec42053876ae6079d82faee14dc7a6e65157fd9d3c8ada3875795b768af` |
| Custom Cabinet | `cabinet-v2026.09.21.1`, commit `aec198424aa0b489db6d07d1af92bd704aa7c518`, package `v1.74.0` |
| Адаптированный application source | `4b84e749cd797deb852b1cd8d92b70acb9d8b951` |
| Upstream Cabinet | `v1.74.0`, SHA `57810c7da24b5c142371ed83a6ad5e43a591d454` |
| Upstream Bot | `v4.10.0`, SHA `9fcebfd7bc075dcca1bb9d1514740039208b906a` |
| Database schema | Alembic `0119` |

Локальный `main` на дату исследования находится на
`80caeac6b756f208543a6c3f891877a4547c7d73`. Отличия от production commit
затрагивают только production-документацию. В рабочем дереве также есть ранее
существовавшие изменения владельца; coding-agent обязан сохранить их и начать
интеграцию в отдельной ветке от явно зафиксированного receiving commit.

### Целевая upstream-точка

| Компонент | Точная идентичность |
| --- | --- |
| Upstream Cabinet | [`v1.79.0`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/releases/tag/v1.79.0), SHA `821c7b71823573a756de00418acb25118ede1c9c` |
| Upstream Bot | [`v4.15.0`](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/releases/tag/v4.15.0), SHA `877690a7039d1326b2c00eda3e297879b80c0678` |
| Database schema | Alembic `0127` |

На cutoff-дате GitHub помечает оба тега как latest. Формальной upstream-матрицы,
которая отдельным документом объявляет `v1.79.0` и `v4.15.0` совместимой парой,
не найдено. Совместимость выводится из совпадающих API-контрактов, синхронных
release notes и публикации релизов 22 сентября 2026 года с интервалом около
четырёх минут. Это вывод из исходников, а не отдельное заявление upstream.

### Масштаб подтверждённого diff

| Диапазон | Коммиты | Изменённые пути | Diff stat |
| --- | ---: | ---: | --- |
| Upstream Cabinet `v1.74.0..v1.79.0` | 78 | 340 | `22886 insertions`, `8576 deletions` |
| Upstream Bot `v4.10.0..v4.15.0` | 133 | 365 | `28338 insertions`, `2148 deletions` |

Сравнение нового Cabinet diff с текущим Custom Cabinet выявило 136 общих
изменённых путей. Это оценка конфликтной поверхности, а не 136 автоматически
возникающих Git-конфликтов.

## User Stories

1. Как пользователь старой подписки без тарифа, я хочу видеть переход на тариф,
   а не неработающие продление или докупки, чтобы не попадать в тупик.
2. Как пользователь с одной подпиской, я хочу видеть корректный статус, срок,
   трафик и основное действие, чтобы быстро понять, что делать дальше.
3. Как пользователь с несколькими подписками, я хочу выбрать нужную подписку,
   чтобы действие не применялось к неверной записи.
4. Как пользователь Telegram Mini App, я хочу корректный фон, системную цветовую
   схему и Back-поведение, чтобы WebView не менял цвета и навигацию самовольно.
5. Как пользователь Android, я хочу устанавливаемый Cabinet с корректным
   manifest и иконкой, чтобы он устанавливался как приложение, а не ярлык.
6. Как пользователь, я хочу видеть актуальные напоминания на главной и иметь
   возможность закрыть их, чтобы получать нужную информацию без постоянного
   повторения.
7. Как пользователь, я хочу безопасно отвязать способ входа с явным
   предупреждением о забываемом email, чтобы не потерять доступ неожиданно.
8. Как оператор, я хочу создавать, редактировать, включать, выключать и
    тестировать напоминания, чтобы управлять коммуникацией из Cabinet.
9. Как оператор, я хочу оценивать аудиторию напоминания до включения, чтобы не
    отправить его неожиданно большой или неверной группе.
10. Как оператор, я хочу выбирать канал, категорию, условия, языковые тексты,
    частоту, лимит и кнопку напоминания, чтобы настройка соответствовала
    фактическому контракту Upstream Bot.
11. Как оператор, я хочу пересчитать участников промогрупп и видеть состояние
    фоновой операции, чтобы не запускать дублирующие пересчёты.
12. Как оператор, я хочу отправить email участникам промогруппы или одному
    подтверждённому пользователю, чтобы использовать новые upstream-аудитории.
13. Как оператор grace-доступа, я хочу выбирать внешний squad, настраивать
    уведомления, текст доступных сервисов и сброс трафика, чтобы Cabinet
    полностью отражал backend-конфигурацию.
14. Как оператор списка пользователей, я хочу использовать подтверждённые
    фильтры, сегменты, сортировки и infinite scroll, чтобы список совпадал с
    контрактом Upstream Bot.
15. Как оператор, я хочу видеть VPN-online, временный grace-доступ, число
    тарифов и корректную сверку с панелью, чтобы не принимать неверное решение.
16. Как оператор карточки пользователя, я хочу видеть поведение, соответствующее
    classic, tariffs и multi-tariff режимам, чтобы действия были применимы.
17. Как оператор с ограниченной ролью, я хочу видеть только разрешённые действия
    и маршруты напоминаний, рассылок, grace и промогрупп, чтобы UI не обходил
    RBAC Upstream Bot.
18. Как владелец Custom Cabinet, я хочу сохранить Unified Dashboard, branding,
    дизайн-систему, инструкции, responsive overlays и browser tests, чтобы
    upstream-синхронизация не стала скрытым редизайном.
19. Как владелец Custom Cabinet, я хочу не добавлять параллельный Simple/Lite
    Mode, потому что его продуктовая цель уже реализована текущим Custom
    Cabinet, а второй presentation path увеличит риск расхождения логики.
20. Как владелец Custom Cabinet, я хочу сохранить запрет BSCHEKER, чтобы
    исключённая возможность не вернулась через соседний upstream-коммит.
21. Как release-оператор, я хочу точные Git SHA, schema revision и неизменяемый
    Release Bundle, чтобы результат можно было воспроизвести и проверить.
22. Как release-оператор, я хочу полный lifecycle gate при смене Bot SHA и
    database schema, чтобы не переиспользовать доказательство от другой
    совместимой пары.
23. Как coding-agent, я хочу иметь порядок вертикальных срезов и критерии
    готовности, чтобы не переносить 340 файлов одним непрозрачным изменением.
24. Как будущий сопровождающий, я хочу commit ledger со статусом каждого
    upstream-коммита, чтобы следующий sync начинался с доказанной базы.
25. Как будущий сопровождающий, я хочу отдельно классифицировать изменения
    upstream Simple/Lite Mode, чтобы общие security/API/payment fixes не были
    потеряны, но сам параллельный интерфейс не вернулся без нового решения.

## Implementation Decisions

### 1. Source identities are immutable inputs

- Старый Cabinet source — только `57810c7da24b5c142371ed83a6ad5e43a591d454`.
- Новый Cabinet source — только `821c7b71823573a756de00418acb25118ede1c9c`.
- Старый Bot source — только `9fcebfd7bc075dcca1bb9d1514740039208b906a`.
- Новый Bot source — только `877690a7039d1326b2c00eda3e297879b80c0678`.
- Текущий receiving commit фиксируется перед началом интеграции и не подменяется
  production SHA, application-source SHA или незакоммиченным состоянием.
- Release pages и version strings являются источниками описания, но не заменяют
  точные SHA.

### 2. Release-by-release impact

| Upstream Cabinet / Bot | Подтверждённые изменения | Решение для Custom Cabinet |
| --- | --- | --- |
| `v1.75.0` / `v4.11.0` | Grace squads и тексты, уведомления grace, забываемый provider email, календарные отчёты, UTC WebSocket dates, исправления merge и traffic limit | Перенести контракты и состояния; presentation grace адаптировать к Custom-компонентам |
| `v1.76.0`–`v1.76.1` / `v4.12.0`–`v4.12.1` | Новый admin users list/detail, фильтры, sorting, online/grace, sales mode, mobile fixes, trial reset, корректный `total`, исправления panel-sync | Перенести как отдельный admin-срез с regression tests; не заменять Custom shell и primitives |
| `v1.77.0` / `v4.13.0` | Grace segment и sorting, PWA manifest/icons, calendar expiry, imported subscription device identity, Telegram theme/color-scheme, wheel rendering | Перенести platform и contract fixes; BSCHEKER UI не переносить |
| `v1.78.0` / `v4.14.0` | Legacy subscriptions требуют выбора тарифа; запрещены продление и addons; logout только в браузере; panel identity backfill | Перенести полностью как единое subscription-правило |
| `v1.79.0` / `v4.15.0` | Reminders, lite mode, promo-group recalculation, email-аудитории, grace traffic reset, account merge fix, panel-sync/payment/webhook/logging/branding fixes | Перенести функциональными срезами, кроме намеренно исключённого Simple/Lite Mode; остальные новые upstream defaults оставить выключенными |

Полные источники: [Cabinet compare](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/compare/v1.74.0...v1.79.0)
и [Bot compare](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/compare/v4.10.0...v4.15.0).

### 3. Required vertical slices and order

#### Slice 0 — provenance and commit ledger

- Зафиксировать receiving commit и отдельную integration branch.
- Классифицировать все 78 Cabinet-коммитов как direct port, adapted port,
  intentionally skipped или blocked.
- Для mixed commits разделять contract/behavior от presentation.
- Не менять `UPSTREAM.md` и `COMPATIBILITY.md` до прохождения gate.

Готово, когда каждый Cabinet-коммит присутствует в sync report ровно один раз,
а каждый skip имеет доказуемую причину.

#### Slice 1 — Bot contract and schema fixture

- Поднять тестовый Upstream Bot точно на `v4.15.0`.
- Применить последовательность Alembic `0120`–`0127` от подтверждённой базы
  `0119`.
- Использовать его OpenAPI/ответы как контракт для frontend fixtures.
- Не копировать Bot business logic в Custom Cabinet.

Новые миграции:

| Revision | Подтверждённое назначение |
| --- | --- |
| `0120` | `grace_tail_expire_at` для защиты от повторной выдачи grace |
| `0121` | признак открытой grace-session |
| `0122` | дата grace overlay для защиты от позднего snapshot |
| `0123` | дата admin trial reset без стирания исторического факта оплаты |
| `0124` | backfill panel identity в subscription |
| `0125` | backfill panel identity в user после multi-tariff |
| `0126` | отметка последнего напоминания по withdrawal request |
| `0127` | таблицы user reminders и встроенное выключенное напоминание |

Изменение старой миграции `0118` в target diff является только форматированием
одной строки; схема `0118` по diff не изменена.

#### Slice 2 — account, date and grace contracts

- Добавить optional `forgets_email` и предупреждение перед unlink.
- Добавить grace-поля, squad source, внешний squad endpoint, operator text,
  admin/user notification toggles и `reset_traffic_on_start`.
- Сохранить env-lock и partial-update поведение текущей grace-формы.
- Перенести безопасное отображение нераспознанной даты вместо `Invalid Date`.
- Использовать календарные дни и operator timezone там, где это изменил
  upstream; не заменять их локальным UTC-расчётом.

`GRACE_ACCESS_RESET_TRAFFIC_ON_START` в Upstream Bot по умолчанию `false`.
Адаптация не должна включать его сама.

#### Slice 3 — admin users and user detail

- Расширить API списка подтверждёнными фильтрами: expiry, recent activity,
  VPN-online, restrictions, no subscription, traffic threshold, no purchases,
  in grace.
- Поддержать `sort_order` и `grace_until` как sort key.
- Сохранить список в URL, единый поиск, сегменты, чипы, infinite scroll и
  возврат к позиции.
- Показывать `is_online`, `online_at`, `grace_until`, число тарифов и корректно
  протухать online-indicator без нового ответа сервера.
- Карточка пользователя должна учитывать `sales_mode` и
  `multi_tariff_enabled`, показывать опасные действия только после
  подтверждения и не смешивать действия разных subscriptions.
- `total` берётся из исправленного Bot API; frontend не компенсирует старый
  ошибочный `total: 1` локальной эвристикой.
- Состояния panel sync должны различать настоящий diff и открытый grace overlay.
- Upstream visual layout адаптируется к существующим Custom primitives и admin
  shell; широкое копирование JSX запрещено.

#### Slice 4 — platform, PWA and branding

- Подключить same-origin Bot manifest и обычные URL для иконок `192` и `512`,
  включая maskable-варианты.
- Не заменять same-origin manifest runtime `data:` manifest-ом.
- При отдельном API origin сохранить подтверждённый upstream fallback на
  frontend manifest.
- Объединить manifest с текущим ранним branding pipeline так, чтобы удаление
  quick-purchase `contact` происходило до любого subresource request.
- Сохранить Custom foreground rules для монограммы и operator-defined colors.
- Добавить `color-scheme` и синхронизацию Telegram background с выбранной темой.
- Показывать logout в обычном web, но не в Telegram Mini App.
- Перенести исправление edge color: логотип-плитка не получает рамку цвета темы.

Готово, когда Chrome Android получает installable PWA, Safari/обычный browser
не теряют favicon, Telegram не затемняет страницу сам, а privacy ordering
текущего Custom Cabinet остаётся прежним.

#### Slice 5 — legacy subscription rule

- Принять optional `requires_tariff_selection` в single- и multi-subscription
  ответах.
- Централизовать решение, является ли subscription legacy.
- Для legacy subscription скрыть renewal, traffic/device addons и «купить ещё».
- Основное действие во всех существующих Custom surfaces ведёт на выбор тарифа
  и использует одно централизованное правило.
- Не выводить это правило из отсутствующего поля только по UI-эвристике, если
  Bot уже присылает явный признак.

Готово, когда одинаковое решение подтверждено для Dashboard, списка
subscriptions, карточки, renew route и tariff picker.

#### Slice 6 — user reminders

- Добавить пользовательское чтение активных reminder cards и dismiss.
- Добавить admin CRUD, audience preview, toggle, delete и test-to-self.
- Поддержать каналы `bot`, `cabinet`, `both`; категории `service`, `marketing`;
  auth/subscription/age/inactivity conditions; локализованные тексты; repeat и
  max-send limits; button kinds `none`, `cabinet`, `url`.
- Добавить маршруты списка, создания и редактирования с permissions
  `user_reminders:read|create|edit|delete`.
- Встроенное напоминание `link_auth_method` остаётся выключенным после миграции.
- Built-in reminder нельзя удалить; его можно выключить.
- Marketing opt-out и quiet hours остаются обязанностью Bot, frontend не
  дублирует dispatcher rules.
- Reminder card должна обновляться после возврата вкладки и не должна терять
  несохранённую форму из-за фонового refetch.

#### Slice 7 — promo groups, broadcasts and grace traffic reset

- Добавить запуск и polling фонового promo-group recalculation с состояниями
  running, queued, last result и error.
- Кнопка пересчёта доступна только с `promo_groups:edit`.
- Добавить email filters `promo_group_<id>` и direct user target `user_<id>`.
- В карточке пользователя показывать email action только при permission
  `broadcasts:send` и подтверждённом email.
- Preview должен показать нулевую аудиторию, если письмо одному человеку
  доставить нельзя.
- Добавить grace traffic reset toggle, сохранив default `false` и env-lock.

#### Slice 8 — intentional exclusion of upstream Simple/Lite Mode

- Классифицировать как `intentionally skipped` основной feature commit
  `b247fbfa0ae2151b4ab397c60170e58f3eaa6021`, его lite-only fixes
  `501c9c33cbf8b5aef3a01e993ba9d8a26e167897` и
  `e12f3880a31090d103daa74dc812d5ebbe89676a`, а также подготовительные
  refactor commits `ebe4a57b57dcb8dbf234f09c2d66aa5fa4bae16a` и
  `3de515b18366dd0202dad818fcb21a2ae82e76f3`.
- Не добавлять `useLiteMode`, storage key `cabinet-lite-mode`, frontend client
  публичной настройки `/cabinet/branding/lite-mode`, admin toggle,
  `HomeScreen`, `DashboardLite`, `SubscriptionScreen`, `SubscriptionLite` или
  остальные lite-specific components, routes и navigation branches.
- Upstream Bot `v4.15.0` может содержать endpoint lite mode как часть точного
  неизменённого Bot source; Custom Cabinet его не вызывает и не показывает.
- Подготовительные refactors не переносить сами по себе. Их можно использовать
  только если отдельный diff докажет независимое исправление, нужное текущим
  Custom surfaces; в исследованных пяти commits такого независимого поведения
  не подтверждено.
- Сохранить текущий Unified Dashboard и четырёхпунктовую mobile navigation как
  единственный пользовательский presentation path.
- Для будущих upstream releases отдельно проверять lite-related commits. Общие
  security, API contract, payment, subscription или accessibility fixes
  адаптировать в существующие Custom surfaces; сам Simple/Lite Mode не включать
  без явного решения владельца и нового ADR.

Evidence для этой границы:

| Upstream commit | Подтверждённый scope | Решение |
| --- | --- | --- |
| [`ebe4a57b57dcb8dbf234f09c2d66aa5fa4bae16a`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/ebe4a57b57dcb8dbf234f09c2d66aa5fa4bae16a) | 7 paths; извлечение секций `Subscription`, commit message явно говорит, что поведение не менялось | Не переносить refactor без функциональной необходимости |
| [`3de515b18366dd0202dad818fcb21a2ae82e76f3`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/3de515b18366dd0202dad818fcb21a2ae82e76f3) | 3 paths; извлечение `tariffAction()` и tests, commit message явно говорит, что поведение не менялось | Не переносить refactor только ради второй витрины; legacy-правило переносится отдельно в Slice 5 |
| [`b247fbfa0ae2151b4ab397c60170e58f3eaa6021`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/b247fbfa0ae2151b4ab397c60170e58f3eaa6021) | 32 paths; API client, admin toggle, storage hint, lite screens/components, routing/navigation, locales и tests | Намеренно исключить feature целиком |
| [`501c9c33cbf8b5aef3a01e993ba9d8a26e167897`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/501c9c33cbf8b5aef3a01e993ba9d8a26e167897) | Только `DashboardLite` и его test; исправляет paid-trial dead end простого вида | Не применимо к отсутствующему lite screen; существующий paid-trial flow проверяется отдельно |
| [`e12f3880a31090d103daa74dc812d5ebbe89676a`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/e12f3880a31090d103daa74dc812d5ebbe89676a) | Только новый test parity двух tariff storefronts | Не применимо, пока в Custom Cabinet одна витрина |

Готово, когда commit ledger содержит причины skip для всех пяти commits, в
frontend нет lite endpoint/storage/UI, а существующие Dashboard и mobile
navigation regression tests остаются зелёными.

#### Slice 9 — cross-cutting quality fixes

- Адаптировать mobile overflow fixes только в реально затронутых Custom screens.
- Перенести number, traffic, axis, transaction, relative-time и calendar-date
  utilities там, где текущий код потребляет соответствующие значения.
- Перенести wheel single-layer rendering и rim layering как performance/visual
  bug fix, не меняя правила розыгрыша.
- Заменить рвущиеся hand-drawn controls эквивалентными доступными иконками из
  существующего набора; новую icon dependency не добавлять.
- Общие responsive исправления проверять на Custom presentation, а не принимать
  массовый upstream markup diff.

#### Slice 10 — localization and documentation

- Добавить/изменить ключи во всех четырёх локалях: `ru`, `en`, `fa`, `zh`.
- Проверить interpolation, pluralization и RTL для новых форм и карточек.
- Обновить `INTERFACE_MAP.md`, если reminder routes меняют фактическую карту.
- Обновить `CUSTOMIZATION_MAP.md`, закрепив намеренное отсутствие upstream
  Simple/Lite Mode и правило будущей классификации lite-related commits.
- После полной проверки обновить upstream provenance, compatibility matrix,
  changelog и итоговый sync report.

#### Slice 11 — immutable release preparation

- Собрать committed Custom Cabinet artifact, не локальную папку.
- Создать новый immutable Custom Cabinet tag и новый Release Bundle tag.
- Закрепить target Bot SHA, Custom Cabinet SHA, artifact checksum, schema head и
  runtime image digests.
- Из-за изменения Bot SHA и schema повторить полный Installer lifecycle gate;
  доказательство для `v2026.09.21.1` переиспользовать нельзя.
- Публикация и production rollout выполняются только после отдельного
  разрешения владельца.

### 4. Dependencies

В `v1.74.0..v1.79.0` upstream `package.json` меняет только package version;
версии frontend dependencies не меняются. `package-lock.json` также меняет
только package version. Поэтому этот sync не разрешает dependency upgrade и не
должен откатывать Custom Tiptap `^3.30.4`, Playwright, расширенный type-check
или read-only lint-staged policy.

В Bot `pyproject.toml` список dependencies по diff не меняется; меняется version.
`.env.example` уточняет, что `TRAFFIC_DAILY_CHECK_TIME` трактуется в `TIMEZONE`,
а не UTC. Bot `uv.lock` внутри точного тега `v4.15.0` всё ещё содержит version
`4.14.0` для virtual project, тогда как `pyproject.toml` и Docker build arg
содержат `4.15.0`. Это подтверждённая upstream-несогласованность метаданных.
Она не исправляется локально без отдельного upstream SHA; exact-tag build обязан
доказать, что она не блокирует Release Bundle.

### 5. Explicitly excluded upstream capabilities

Upstream Simple/Lite Mode намеренно не переносится. Исключение охватывает его
frontend API client, admin setting, storage hint, route/navigation branching и
отдельные presentation-компоненты. Причина: Unified Dashboard уже реализует
упрощённый пользовательский путь, а второй интерфейс дублирует subscription и
payment decisions и повышает риск расхождения. Это решение пересматривается
только отдельным owner-approved ADR. Lite-related commits будущих релизов всё
равно проверяются на общие исправления, которые могут потребовать адаптации в
существующие Custom surfaces.

BSCHEKER/reachability frontend остаётся исключённым по ADR 0001. Нельзя
переносить routes, navigation, permissions, API clients, polling, locales,
fixtures или assets этой возможности. Общие fixes из соседних commits можно
переносить только после отделения от reachability contracts.

Upstream Bot продолжает содержать собственный reachability backend. Это не
является разрешением на Bot fork и не доказывает отсутствие capability в Bot.

## Testing Decisions

### Test philosophy

- Каждый domain/contract срез начинается с failing regression test, затем
  получает минимальную реализацию и рефакторинг.
- Тестируется наблюдаемое поведение: запросы и payload, маршруты, permissions,
  видимые состояния, действия пользователя и platform behavior.
- Нельзя проверять только snapshots JSX или наличие строк в исходнике, если
  риск находится в data flow.
- Highest useful seam — browser flow через API mock или настоящий test Bot.
  Unit tests используются для чистых helpers, state machines и validation.

### Required automated gates

1. Unit/integration: `npm test`.
2. Type contracts: `npm run type-check`.
3. Production build: `npm run build`.
4. Source policy and formatting: `npm run check` для затронутого source scope.
5. Browser scenarios: `npm run test:e2e` с обновлёнными fixtures.
6. No-BSCHEKER guard должен оставаться зелёным.

### Regression seams to add or extend

- Grace form validation, partial payload and env-lock.
- Admin users URL state, filters, sort, infinite loading and stale online state.
- User detail sales-mode decisions and panel/grace comparison.
- Legacy subscription action matrix во всех consumer surfaces.
- Manifest URL/origin selection, favicon edge color, contact privacy ordering и
  color-scheme.
- Reminder admin validation, RBAC, audience, test action, dashboard dismiss и
  refetch behavior.
- Promo recalculation polling and terminal states.
- Single-user and promo-group email targets.
- Отсутствие frontend-запроса lite-mode endpoint, storage key, admin toggle и
  lite-only routes/components; сохранность Unified Dashboard и Custom mobile
  navigation.
- Existing Dashboard loading, QR, Support instructions и mobile navigation
  tests не должны регрессировать.

### Browser and integration matrix

- Widths: `320`, `375`, `390`, `768`, `1024`, `1280+`.
- Themes: dark, light, arbitrary valid operator colors.
- Locales: Russian, English, one RTL case; locale files также должны оставаться
  полными для Farsi и Chinese.
- Platforms: browser and Telegram adapter; Chrome Android installability;
  keyboard/focus/accessibility smoke.
- Roles: no permission, read-only, editor, Admin, Marketer.
- Subscription states: none, trial, paid trial, active, limited, expired,
  legacy, multi-subscription, grace.

### Bot and release verification

- Fresh database reaches schema `0127`.
- Upgrade database reaches `0127` from `0119` without skipping revisions.
- Exact Bot tag builds from `877690a…`; version metadata anomaly is recorded.
- Frontend contract tests use v4.15 responses, not invented payloads.
- Full disposable Installer lifecycle gate is required because Bot SHA, schema
  and Release Bundle identity change.
- Targeted staging smoke covers all changed flows before any production action.

## Out of Scope

- BSCHEKER/reachability frontend.
- Forking or editing Upstream Bot source.
- Upstream Simple/Lite Mode целиком, включая frontend API client, admin toggle,
  storage hint и отдельные presentation-компоненты.
- Enabling reminder campaigns or grace traffic reset on production.
- Sending real reminders, emails, payments or destructive admin actions during
  verification.
- Unrelated redesign, dependency upgrade, broad renaming, mass formatting or
  project reorganization.
- Replacing current Custom navigation, branding, Unified Dashboard or
  instructions with upstream presentation.
- Publishing tags, Release assets, Release Bundle or deploying production
  without separate owner authorization.
- Fixing open upstream issues not present in the selected release diff.

## Further Notes

### Facts not confirmed by available evidence

- Upstream не опубликовал отдельную compatibility matrix для пары Cabinet
  `v1.79.0` / Bot `v4.15.0`.
- Release notes не заявляют rollback-совместимость миграций `0120`–`0127` с
  production-данными. Наличие `downgrade()` не является доказательством
  безопасного rollback.
- Реальная Android/iOS Telegram, физический screen reader и production
  integrations не были проверены в рамках исследования.
- В исследованных repository history и release notes нет подтверждённого
  roadmap, обещающего дальнейшее развитие Simple/Lite Mode. Ожидание будущих
  изменений — planning assumption владельца, поэтому правило повторной
  классификации действует для каждого следующего upstream release.
- Новый Release Bundle tag, artifact SHA и runtime image identities ещё не
  существуют и не должны быть выдуманы в implementation work.

### Primary sources

- [Upstream Cabinet v1.79.0 release](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/releases/tag/v1.79.0)
- [Upstream Cabinet full comparison](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/compare/v1.74.0...v1.79.0)
- [Upstream Bot v4.15.0 release](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/releases/tag/v4.15.0)
- [Upstream Bot full comparison](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/compare/v4.10.0...v4.15.0)
- Repository policies: `UPSTREAM_SYNC.md`, `CUSTOMIZATION_MAP.md`,
  `REDESIGN_RULES.md`, `LIVE_CHECK.md`, `COMPATIBILITY.md`, `CONTEXT.md`.
