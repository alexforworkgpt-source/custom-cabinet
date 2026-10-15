# ADR 0003: выборочная адаптация Upstream Cabinet v1.80.1 к неизменённому Upstream Bot

Status: Implemented (frontend); targeted VPS runtime PASS, full S9 PARTIAL. Исключение DPI//CHECKER — Accepted по прямому решению владельца от 2026-10-13. Решения применены в локальном Custom Cabinet; это не разрешение на выпуск или production.

Date: 2026-10-13 (Europe/Moscow).

PRD: [требования и исследование](../prd/bedolaga-v1.80.1-bot-v5.0.0.md).

Уточнение владельца **2026-10-15**: **Upstream Bot принимаем как рабочую основу**.
Применительно к текущему продолжению это frontend/connection задача Custom Cabinet,
а не самостоятельная повторная приёмка backend. Не добавлять внутренние payment
handlers/SDK/full backend RBAC проверки в условия завершения frontend. Исторические
факты/OPEN/BLOCKED и обязательные применимые frontend/Installer/Release gates
сохранены. Актуальный следующий шаг: [Custom Cabinet CONTEXT](../../CONTEXT.md).

Для текущей Release-подготовки owner device/Telegram проверка15 октября
**SKIPPED_OWNER_ACCEPTED**, не PASS; [решение и readiness](../releases/FRONTEND_RELEASE_READINESS_2026.10.15.md).

Состояние реализации: frontend перенесён и проверен; targeted VPS startup/HTTPS/API Bot v5 прошёл, полный S9 остаётся PARTIAL. Полный repository Biome сохраняет три исходные format errors в исторических JSON-отчётах, frontend Biome проходит. Прочитать [отчёт реализации и переноса](../../UPSTREAM_V1.80.1_SYNC_REPORT.md), чтобы не применять patch повторно и не повторять выполненную адаптацию. Commit, Release и production не выполнялись.

Локальный этап S9 от 2026-10-13: штатные schema/bootstrap/upgrade/restore операции на PostgreSQL15 и CacheService на Redis7 прошли; также прошли 172 выбранных upstream tests и шесть ASGI/JWT/DB checks. Для этого локального этапа полный запуск Bot не проверялся. См. [local evidence](../compatibility-evidence-v1801-bot-v5-local-20261013.md).

Последующий owner-authorized VPS этап: native main.py/unified lifespan на Ubuntu24.04/PG15/Redis7, HTTPS/proxy/exact artifact, 14 actual JWT/API checks (включая Marketer count-only), 60s stable observation и cleanup/independent postflight PASS. Full Installer lifecycle, real sandbox payments/concurrency, полный RBAC и physical Telegram остаются NOT_VERIFIED; **S9 PARTIAL**. [Точное VPS evidence](../compatibility-evidence-v1801-bot-v5-vps-runtime-20261013.md).

## Контекст и точные точки сравнения

Custom Cabinet сохраняет собственный Unified Dashboard, ResponsiveOverlay, навигацию, purchase/renewal и payment return. Upstream Cabinet — источник контрактов и исправлений, а не готовая замена дерева проекта. Upstream Bot является внешней неизменяемой зависимостью: его исходники, API, бизнес-логика и миграции не редактируются.

| Назначение | Точная идентичность |
| --- | --- |
| Предыдущая интегрированная база Upstream Cabinet | `v1.79.0` / `821c7b71823573a756de00418acb25118ede1c9c` из локального `UPSTREAM.md` |
| Текущее разрешение upstream-тега `v1.79.0` | `f5ea595f8f732c37f2d5c270f34879ab2e2fba2d` |
| Дерево файлов обеих предыдущих идентичностей | `354b7f77d179dd3494c11fcfe27b4099bc5e0f4d` — одинаковое |
| Новый Upstream Cabinet | `v1.80.1` / `a693d30ca6084b9a54b45a72294b99237841ef13` |
| Новый Upstream Cabinet tree | `87b2ea9305bbf2938dcf52145afd739f7838d381` |
| Записанный production Custom Cabinet | `cabinet-v2026.10.10.1` / `1d046656fbb01a928fd54a28694e10105d4185f8`; tree `c208d47d2c32b41276ae1c387a569c7628791553` |
| Локальный owner HEAD | `1169e3cb964caec9a9500ace89bbb53b7e5a89df` плюс незакоммиченные и untracked файлы |
| Текущий записанный Upstream Bot | `v4.15.0` / `877690a7039d1326b2c00eda3e297879b80c0678`; schema `0127` |
| Первый stable Bot с новыми frontend-контрактами | `v4.16.0` / `e31831f5e24892ba97dfe341b00eb748e4dce59d` |
| Последний stable Bot, целевой кандидат проверки | `v5.0.0` / `5bda3c56f0afd9f4813e9c6fa48934948b05ebae`; source migrations до `0131` |
| Последний записанный Release Bundle | `bundle-v2026.10.10.1`; identity `bc2d203b48dfaeb8c18f9311202aa0b99e7617e5f4f0383f3409a45a74d8d019` |
| Installer в этом Bundle | `installer-v2026.10.02` / `75c49bec9c2a764e123fc0ef675f8c45fc22a1ab` |

Текущее production-состояние взято из последних записей корневых `CONTEXT.md` и `PRODUCTION_TRANSITION_RUNBOOK.md`, не из свежего обращения к серверу. Локальные `custom-cabinet/CONTEXT.md`, `COMPATIBILITY.md` и некоторые записи `UPSTREAM.md` описывают более ранние этапы; их нельзя использовать как единственное доказательство текущей установки.

Причина расхождения SHA старого тега не подтверждена. Git trees совпадают, `git diff 821c7b7 f5ea595` пуст. Поэтому для контента используется точный старый `821c7b7…`, а для списка новых коммитов — эквивалентный по дереву `f5ea595…`. Обычный range `821c7b7..a693d30` содержит 216 коммитов, в том числе историю, которая уже представлена старым деревом; фактический новый range `f5ea595..a693d30` содержит 58 коммитов и 125 изменённых путей. Исторический SHA не переписывать и не выдавать `f5ea595…` за ранее проверенный commit.

Исследование использовало отдельные копии в `M:\CURSOR2\PC WEB\.scratch\bedolaga-research-20261013\`. Оригинальные Git refs и owner worktree не обновлялись. Ссылки на все новые коммиты и решения по путям находятся в приложениях PRD.

## Решение 1. Receiving source — актуальный Custom Cabinet, не старый локальный HEAD

1. В отдельной чистой копии Custom Cabinet начать от `1d046656fbb01a928fd54a28694e10105d4185f8`. Перед реализацией сверить её с актуальной `main`; если появился новый согласованный исходник, записать новый receiving SHA и повторить затронутое сравнение. Не делать rollback `main` к этой дате.
2. Сохранить локальную owner-папку побайтно. На дату исследования из проверенных опубликованных source-файлов отличаются четыре: `src/components/subscription/PurchaseCTAButton.tsx`, `src/components/subscription/purchaseCtaLegacy.test.tsx`, `src/pages/adminPromoGroupsRecalculation.test.tsx`, `src/pages/adminUsers.test.tsx`. Сравнение нормализовало CRLF/LF и не классифицирует эти различия как ошибки или разрешённые к удалению изменения.
3. Не переносить автоматически dirty дерево поверх receiving source. Опубликованные UI-правки уже входят в `1d046656…`; старые локальные версии могут их затереть. Любую уникальную owner-правку сначала отдельно сопоставить и сохранить.
4. Каждый hybrid-файл сравнивать как previous upstream → target upstream → receiving Custom Cabinet. Для конфликтующих owner-файлов дополнительно учитывать локальную четвёртую версию. Не использовать archive replacement, whole-file theirs/ours, unrelated-history merge или массовый cherry-pick.

Среди 125 upstream-путей 47 существующих файлов опубликованного Custom Cabinet уже отличаются от старого upstream. Это нижняя оценка конфликтных зон: отсутствующие, переименованные и custom-only файлы нужно картировать отдельно.

## Решение 2. Контракты отделяются от оформления

API/types и чистые state helpers переносить близко к upstream. Route pages остаются местом запросов и навигации; Custom-owned primitives, semantic tokens и ResponsiveOverlay остаются владельцами представления.

| Подтверждённое изменение | Место адаптации в Custom Cabinet | Что сохранять |
| --- | --- | --- |
| Язык FAQ/правил/privacy/offer/recurrent | `src/api/info.ts`, `src/pages/Info.tsx`, `src/pages/PublicLegal.tsx` и все consumer call sites | `InfoNavigation`, custom pages/replacements, HTML sanitization, origin/back и promo-group return |
| Ошибка списка и обновление напоминаний | `src/pages/AdminReminders.tsx`, `src/pages/AdminReminderEdit.tsx` | Existing CRUD, permissions, form state, retry/error компоненты |
| Success labels и единицы трафика | `src/components/SuccessNotificationModal.tsx`, `src/locales/{ru,en,fa,zh}.json` | Custom overlay/focus/close, числовые значения отдельно от подписей |
| Аудитория рассылок | `src/api/adminBroadcasts.ts`, `src/pages/AdminBroadcastCreate.tsx`, `AdminBroadcastDetail.tsx`, `AdminBroadcasts.tsx`; небольшой feature module под `src/components/broadcasts/` | Existing editor/media/custom buttons/email preset/category, admin shell, PermissionGate |
| Cashera top-up, labels/settings | `src/api/balance.ts`, `src/constants/paymentMethods.ts`, `src/components/PaymentMethodIcon.tsx`, `src/components/admin/constants.ts`, locales | Динамические server payment methods/options и существующий generic pending-payment flow |
| QR на готовой оплате | `src/pages/TopUpAmount.tsx` и существующие `useCreatedTopUpStatus`, `topUpStorage`, `topUpReturnPath` | pending payment identity, submit lock/rate limit, возврат, честный balance-topup result |
| Cashera recurrent API/state | `src/api/subscription.ts`, `src/types/index.ts`, `src/utils/recurringFeature.ts`; новый узкий `casheraRecurring` helper по upstream | `subscription_id` в query params, feature-disabled distinction, server amounts/statuses |
| Управление Cashera | `src/pages/Subscription.tsx`, используемый как `SubscriptionManagement` внутри `src/pages/Dashboard.tsx` | Один management overlay, Platega/Lava/balance-autopay и их refresh/cancel behavior |
| Оформление тарифа Cashera | `src/components/subscription/purchase/TariffPurchaseForm.tsx`, `src/pages/SubscriptionPurchase.tsx` | Unified payment CTA для обычной покупки, server preview, выбранный период и return context |
| История admin-действий Cashera | `src/components/admin/userDetail/activityLabels.ts` | Existing activity API и прочие подписи |
| Проверка dependency baseline | `package.json`, `package-lock.json` | Custom package identity, engines, scripts, Playwright/Radix dependencies, публикационные workflows |

Upstream `RecurringPanels.tsx` отсутствует в Custom Cabinet: нельзя создать параллельную page tree только ради его прямого копирования. При необходимости вынести исключительно Cashera-часть в небольшой hook/component и встроить в существующий management consumer. Не выполнять полный рефакторинг старой страницы.

Upstream `BroadcastAudienceEditor.tsx` содержит несколько обязанностей. При адаптации допустим минимальный feature-local split: transport-independent condition helpers, user lookup, recipient preview и editor. Это размещение новой upstream-функции, не новая архитектурная платформа. Использовать существующие Field/Select/DateField, Button, Card и ResponsiveOverlay; не вводить второй набор общих controls.

## Решение 3. Новые функции не включаются на неподдерживаемом Bot

Новые audience endpoints и Cashera появились в stable `v4.16.0`; точный `v5.0.0` содержит их и является целевым кандидатом. Это вывод из исходников обоих тегов, а не опубликованная формальная матрица совместимости Bedolaga.

Frontend-only исправления языка, reminders и success labels можно проверять с текущим `v4.15.0`. Новый audience editor и Cashera должны проходить контрактные и staging-проверки с новым неизменённым Bot. Не выпускать UI, который безусловно вызывает отсутствующие audience endpoints текущего `v4.15.0`; 404/403/5xx не превращать в «все получатели», «нет напоминаний» или «оплата прошла».

Cashera purchase доступен только при `cashera_recurrent_enabled === true` в tariffs options. Для нового Cashera consumer отсутствие флага и незавершённая/ошибочная загрузка options не доказывают поддержку. Старое legacy probing Platega/Lava не менять попутно.

`GET/POST /cabinet/subscription/cashera-recurrent` использует query `subscription_id`; purchase использует query `tariff_id` и пустое тело. Параметры выбранных периода/устройств/трафика отсутствуют в purchase endpoint. Не добавлять выдуманные request fields.

Cashera — отдельный договор автосписаний: сервер выбирает cadence и считает полную recurring-цену без пользовательского promo, округляя вверх до целых рублей. Нельзя маркировать новую CTA ценой/периодом обычной покупки или обещать перенос выбранной скидки. Показывать фактические `amount_kopeks`, `interval`, `charge_days`, `next_charge_at` из recurring status; подтверждение выполняется через серверный `redirect_url` штатным `openPaymentUrl`.

Enable/purchase/get гейтятся Bot-флагом, cancel намеренно не гейтится. Upstream UI при выключенном флаге скрывает весь Cashera panel. Доступность отмены уже действующей привязки после выключения флага и reload не доказана — записывать OPEN, не обещать её по одному POST-контракту. Эта граница не требует изменения Bot и не разрешает frontend выдумывать статус действующей привязки.

При включении balance-autopay Bot отменяет внешние recurring engines. При добавлении Cashera пересмотреть invalidation всех затронутых query keys; новый provider не должен оставаться визуально ACTIVE после серверной отмены. Не реализовывать финансовое взаимоисключение во frontend.

## Решение 4. DPI//CHECKER полностью исключён

Владелец прямо выбрал «Полностью исключить из Custom Cabinet» 2026-10-13. Это постоянная frontend-граница, аналогичная ADR 0001, а не временный flag.

Не переносить:

- `src/api/dpichecker.ts`, `src/pages/AdminDpiChecker.tsx`, `src/components/admin/dpichecker/`;
- `/admin/dpichecker`, navigation, `dpichecker:*`, `DPICHECKER` settings category;
- links/actions/status polling в `AdminPanel`, `AdminRemnawave`, `AdminUserDetail` и `SupportDetails`;
- feature-specific locales, fixtures, CSV actions, assets, tests и icon exports;
- изменения BSCHEKER/reachability/GEO и Simple/Lite presentation, ранее исключённых ADR 0001/0002.

Новый frontend guard должен защищать source, fixtures и build/public configuration от DPI//CHECKER surfaces по существующему паттерну `src/test/noBschekerGuard.ts` и `src/noBscheker.guard.test.ts`. Source test guard и документация могут содержать запрещённые markers как проверяемые примеры. Generic полученный список backend permissions не переписывать для симуляции отсутствия сервиса; не регистрировать frontend permissions/actions для DPI//CHECKER.

`downloadFile` в platform adapters и `IconTabs` добавлены для новых исключённых DPI consumers. В проверенном target tree у `PlatformContext.downloadFile` нет действующего consumer вне DPI//CHECKER. Не добавлять неиспользуемую платформенную обязанность ради формальной синхронизации. Если будущая отдельная задача даст retained consumer, принимать общий контракт отдельно с его tests.

Официальный Bot остаётся целым, включая миграцию `0128_dpichecker_actions`, далее `0129 -> 0130 -> 0131`. Frontend-исключение не означает удаление Bot-миграции или backend capability. Нельзя вырезать звено цепочки миграций.

## Решение 5. Security baseline и major tooling имеют разные основания

В опубликованном Custom Cabinet все 34 найденных пакета `node_modules/@tiptap/*` в lockfile уже имеют `3.31.3`. Upstream `v1.80.1` содержит ту же версию. Сначала перепроверить receiving lockfile; повторный security upgrade не нужен, если результат совпадает. Это подтверждение наличия версии, не независимое заключение об отсутствии всех уязвимостей.

Можно согласовать прямые `@tiptap/*` диапазоны с upstream `^3.31.3` узким metadata change, сохранив resolved dependencies и regenerating npm metadata штатно при необходимости. Не подменять весь lockfile upstream-файлом и не делать `npm update`.

Для первой функциональной адаптации рекомендовано сохранить Vite 7 / Vitest 4 / i18next 25 + react-i18next 16 / lint-staged 16 из Custom Cabinet. Новые frontend-контракты не импортируют API этих новых major versions. Upstream upgrades классифицируются как сознательно отложенные tooling/performance изменения, а не пропущенные security contracts. Полное отсутствие новых advisories этим исследованием не доказано.

Если отдельный scope включает Vite 8, переносить связанную группу целиком: `@vitejs/plugin-react` 6, native config imports, `import.meta.dirname`, `tsconfig.node` noEmit/TS extension compatibility, Rolldown vendor splitting и `src/lib/twemoji.ts` со всеми retained импортами. У Custom Cabinet есть собственные branding plugins; нельзя заменять `vite.config.ts` целиком. Upstream blanket `moduleSideEffects: false` для всех barrels применять только после проверки наших side effects. До принятия Vite 8 твемоджи-обёртка и массовая смена импортов не обязательны.

Уменьшение upstream startup gzip с 409 до 390 KB — заявленный результат upstream, не бюджет или измерение Custom Cabinet.

## Решение 6. Bot v5 runtime — отдельный compatibility gate

`v5.0.0` меняет официальный compose на `postgres:18-alpine`, использует `postgres18_data:/var/lib/postgresql`, держит legacy PG15 volume read-only и добавляет upgrade guard/script. Dockerfile Bot использует Python 3.14. Installer самостоятельно рендерит compose; его текущий шаблон использует `postgres_data:/var/lib/postgresql/data`, а `lib/common.sh` проверяет именно этот mount/volume contract.

Следовательно, нельзя просто заменить PG image digest на PG18 в новом Bundle или запустить upstream `make pg-upgrade` в управляемой Installer установке. Это разные compose ownership/contracts. На PG15 подтверждены local schema/query proof и targeted native VPS startup/HTTPS/API; весь runtime/business matrix и full Installer lifecycle ещё не доказаны. Release candidate остаётся BLOCKED до отдельного проверенного решения по Installer/runtime и exact lifecycle.

Настоящий план изменения Installer, PG major transition и production относится к независимому проекту и требует своего применимого задания. Этот ADR фиксирует границу и входные данные для него, не меняет Installer и не содержит разрешения на миграцию. Промежуточный Bot `v4.16.0` не назначается автоматически вместо последнего `v5.0.0`; для иной целевой пары нужен явно записанный scope и собственная проверка.

При новом Bot SHA прежний Installer lifecycle proof не переиспользуется. Нужны isolated fresh install, upgrade schema `0127 -> 0131`, rollback/recovery, cleanup/postflight и targeted новый public Bundle smoke по существующим процедурам. Наличие `downgrade()` в source не доказывает безопасный откат новых financial records или PG major. Если Installer/Bot/images/contracts/OS не меняются в отдельном Cabinet-only выпуске, действует существующее правило exact proof reuse.

## Решение 7. Classic auto-purchase остаётся OPEN

В target Bot `app/cabinet/routes/subscription_modules/purchase.py` по-прежнему записывает `cart_mode='subscription_purchase'`. `app/services/subscription_auto_purchase_service.py` принимает `extend`, `tariff_purchase`, `daily_tariff_purchase`, `add_devices`, `add_traffic` и пропускает неизвестный режим. Этот dispatcher не изменён в диапазоне `v4.15.0..v5.0.0`.

Сохранить `docs/known-issues/classic-auto-purchase.md`, manual confirmation, route paid renewal по существующему subscription ID и финальную server preview price. Не добавлять автоматический purchase POST на `balance.topup`, не считать top-up доказательством покупки и не обещать, что Cashera исправляет Classic flow. Этот backend-only предел не включается в задачи исправления backend или в условия завершения frontend реализации; release/live ограничения фиксируются честно отдельно.

## Последствия, альтернативы и завершение

Выборочная адаптация требует review больше, чем копирование upstream, зато сохраняет product identity, local source и проверенные кастомные сценарии. Полная замена дерева и массовый cherry-pick отклонены: теряются custom navigation/renewal и возвращаются исключённые сервисы. Перенос только release-note пунктов отклонён: он пропускает permission/focus, interpolation, query cache и build compatibility изменения.

Внутри Custom Cabinet допустимы небольшие разделённые local diffs по шагам PRD. Commit/push/Release/production выполняются только по отдельному применимому разрешению. `UPSTREAM.md` и `COMPATIBILITY.md` обновляются после соответствующих фактических gates, с явными skipped/OPEN/BLOCKED строками; датой исследования их не переключать.

Реализация считается завершённой по frontend scope после source/tests/build/affected-browser gate и полного ledger. Target-pair compatibility, public Release Bundle и production имеют отдельные критерии; mock PASS не закрывает их. Точные источники, acceptance cases, порядок шагов и полный ledger — в PRD.

Рекомендуемый уровень рассуждения для следующей задачи: очень высокий — адаптация затрагивает оплату, permissions, кастомную навигацию и границу runtime Bot v5.

## Уточнение frontend-исключения при реализации

Generic settings API и permission registry нового Bot содержат определения исключённых сервисов. Custom Cabinet фильтрует только display-определения в `adminSettingsApi.getSettings/getCategories` и `rbacApi.getPermissionRegistry` через `src/config/cabinetFeatureVisibility.ts`. Это закрывает Other/search/favorites; auth permissions, назначенные роли и payload их сохранения не переписываются. Guard разрешает только точную regex-декларацию исключения; добавление client/route в этом модуле приводит к FAIL. Официальные Bot source и migrations остаются неизменными.

Основание: [settings service](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/blob/5bda3c56f0afd9f4813e9c6fa48934948b05ebae/app/services/system_settings_service.py), [permission registry](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/blob/5bda3c56f0afd9f4813e9c6fa48934948b05ebae/app/services/permission_service.py).
