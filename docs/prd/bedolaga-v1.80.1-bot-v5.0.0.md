---
title: "Адаптация Upstream Cabinet v1.80.1 с сохранением Custom Cabinet"
type: prd
status: ready-for-agent
date: 2026-10-13
scope: "Исследование и требования; frontend implementation отдельно, Release и production не разрешены"
---

# PRD: адаптация Upstream Cabinet v1.80.1

**Уточнение владельца от 2026-10-15:** Upstream Bot принимаем как рабочую основу.
В текущем продолжении S9 проверяем Custom Cabinet, его подключение к существующему
API и условия стенда. Самостоятельная повторная приёмка внутренней backend-логики,
платёжных handlers, SDK и всей backend RBAC/ABAC-матрицы не является задачей или
условием готовности frontend. Датированные результаты и OPEN/BLOCKED не изменены;
применимые обязательные frontend/installation/Release gates сохранены. Следующий
конкретный шаг и текущая сборка закреплены в [CONTEXT.md](../../CONTEXT.md).

Для текущей Release-подготовки владелец15 октября отдельно пропустил реальный
Telegram/device gate: **SKIPPED_OWNER_ACCEPTED**, не PASS.
[Readiness и граница waiver](../releases/FRONTEND_RELEASE_READINESS_2026.10.15.md).

Документ подготовлен 13 октября 2026 года, Europe/Moscow. Предназначен для coding-agent вместе с [ADR 0003](../../docs/adr/0003-adapt-upstream-v1.80.1-bot-v5.0.0.md). `ready-for-agent` означает, что требования к frontend описаны достаточно для реализации; это не разрешение публиковать пакет, менять production или переписывать backend.

Состояние реализации: frontend перенесён и проверен; targeted VPS startup/HTTPS/API Bot v5 прошёл, полный S9 остаётся PARTIAL. Полный repository Biome сохраняет три исходные format errors в исторических JSON-отчётах, frontend Biome проходит. Прочитать [отчёт реализации и переноса](../../UPSTREAM_V1.80.1_SYNC_REPORT.md), чтобы не применять patch повторно и не повторять выполненную адаптацию. Commit, Release и production не выполнялись.

Локальный этап S9 от 2026-10-13: штатные schema/bootstrap/upgrade/restore операции на PostgreSQL15 и CacheService на Redis7 прошли; также прошли 172 выбранных upstream tests и шесть ASGI/JWT/DB checks. Для этого локального этапа полный запуск Bot не проверялся. См. [local evidence](../compatibility-evidence-v1801-bot-v5-local-20261013.md).

Последующий owner-authorized VPS этап: native main.py/unified lifespan на Ubuntu24.04/PG15/Redis7, HTTPS/proxy/exact artifact, 14 actual JWT/API checks (включая Marketer count-only), 60s stable observation и cleanup/independent postflight PASS. Full Installer lifecycle, real sandbox payments/concurrency, полный RBAC и physical Telegram остаются NOT_VERIFIED; **S9 PARTIAL**. [Точное VPS evidence](../compatibility-evidence-v1801-bot-v5-vps-runtime-20261013.md).

## 1. Результат исследования

Последние публичные stable Releases на дату проверки: Upstream Cabinet **v1.80.1** и Upstream Bot **v5.0.0**, опубликованы 29 сентября 2026 года. Между нашей базой и ними вышли также Cabinet v1.80.0 и Bot v4.16.0. Исследованы GitHub Releases API, release notes и точные Git trees; изменения незарелизенных веток `main`/`dev` в требования не включены. [C01, C02, B01, B02 в реестре источников ниже.]

Рекомендуемый перенос:

1. В Custom Cabinet перенести исправления языка документов, списка напоминаний и success-переводов. Они не требуют новых endpoint текущего Bot v4.15.0.
2. В Custom Cabinet адаптировать редактор аудитории рассылок, Cashera top-up/QR и Cashera recurring. Контракты появились в Bot v4.16.0; проверяемый кандидат последнего Bot — неизменённый v5.0.0. Они не считаются работающими на текущем v4.15.0.
3. Сохранить уже присутствующий TipTap 3.31.3 и кастомные исправления покупки, продления, возврата из оплаты, Unified Dashboard и навигации. Не повторять автоматически major upgrades tooling.
4. Полностью исключить DPI//CHECKER по прямому решению владельца 2026-10-13; сохранять прежние исключения BSCHEKER и Simple/Lite Mode.
5. Отдельно зафиксировать runtime-границу Bot v5: PostgreSQL 18/Python 3.14 в официальной сборке, новые schema migrations и несовпадение upstream compose с compose Installer. Новый Release Bundle не готов до применимых проверок этой комбинации.

Наш известный дефект новой Classic-автопокупки **сохраняется в Bot v5.0.0 по исходникам**. Перенос Cashera не является его исправлением. Проекту не требуется backend fork; frontend продолжает работать с официальными контрактами и честно показывает ограничения.

## 2. Проблема и цель

Upstream Cabinet развивается независимо от Custom Cabinet. Простое копирование нового дерева потеряет кастомные интерфейсы, проверенную цену server preview, renewal того же subscription ID и payment return context; также вернёт исключённые сервисы. Одни release notes не показывают всех изменений query keys, permissions, locales и сборки.

Цель: последовательно перенести подтверждённые retained contracts/behavior новых Releases, сохранив актуальный Custom Cabinet и явно описав каждый пропуск. У coding-agent должны быть точные source identities, список изменений, зависимости, acceptance cases и критерии остановки. Полное визуальное совпадение с Upstream Cabinet не является целью.

## 3. Зафиксированная база

| Компонент | База | Новый источник / кандидат |
| --- | --- | --- |
| Upstream Cabinet | `v1.79.0`, исторический SHA `821c7b71823573a756de00418acb25118ede1c9c` | `v1.80.1`, `a693d30ca6084b9a54b45a72294b99237841ef13` |
| Custom Cabinet receiving source | Последний записанный production source `1d046656fbb01a928fd54a28694e10105d4185f8`, tag `cabinet-v2026.10.10.1` | Изолированный кандидат от этого source; до реализации сверить актуальную `main` |
| Owner worktree | HEAD `1169e3cb964caec9a9500ace89bbb53b7e5a89df` + dirty/untracked работа | Сохраняется отдельно; не становится Release source автоматически |
| Upstream Bot | `v4.15.0`, `877690a7039d1326b2c00eda3e297879b80c0678` | `v5.0.0`, `5bda3c56f0afd9f4813e9c6fa48934948b05ebae` |
| Промежуточный Bot | — | `v4.16.0`, `e31831f5e24892ba97dfe341b00eb748e4dce59d`; источник новых API, не автоматически выбранный production target |
| Schema | `0127` | Исходники нового Bot содержат линейную цепочку `0128 -> 0129 -> 0130 -> 0131` |
| Installer | `installer-v2026.10.02`, `75c49bec9c2a764e123fc0ef675f8c45fc22a1ab` | В исследовании не менялся |
| Записанный production Release Bundle | `bundle-v2026.10.10.1` | Новый пакет не назначен и не публиковался |

Источник текущего production baseline — последние записи корневых `CONTEXT.md` / `PRODUCTION_TRANSITION_RUNBOOK.md`, а не свежая серверная проверка. Записи локальных Cabinet `CONTEXT.md` и `COMPATIBILITY.md` местами устарели. Не использовать package version `1.79.0` как доказательство, что Custom Cabinet не имеет октябрьских доработок.

### Расхождение старого upstream-тега

Сейчас тег Cabinet v1.79.0 разрешается в `f5ea595f8f732c37f2d5c270f34879ab2e2fba2d`, тогда как у нас зафиксирован `821c7b7…`. Оба имеют одинаковое Git tree `354b7f77d179dd3494c11fcfe27b4099bc5e0f4d`; diff пуст. Причина изменения истории не подтверждена.

Сравнение содержимого: **821c7b7… → a693d30… → 1d046656…**. Каталог новых коммитов: **f5ea595… → a693d30…**, поскольку этот эквивалентный tree находится в новой истории. Получены 58 новых Cabinet commits и 125 changed paths. Среди них 47 существующих Custom-файлов отличаются от previous upstream; отсутствующие и custom-only paths также требуют картирования. Прямой range от исторического SHA содержит 216 коммитов и завышает фактический новый scope.

Bot range **877690a7… → 5bda3c56…**: 74 commits, 261 changed paths, 26 415 добавленных и 2 362 удалённых строк. Последний этап **v4.16.0 → v5.0.0**: 40 paths, 2 081 добавленная и 1 109 удалённых строк. Это статистика diff, не объём обязательных frontend правок.

Проверенная локальная source-копия почти совпадает с опубликованным Cabinet после CRLF/LF normalization, однако четыре проверенных source-файла отличаются: PurchaseCTAButton, его legacy test и два admin tests. Уникальные owner changes не оценивались как разрешённые к удалению. Receiving baseline брать из актуального опубликованного исходника; owner HEAD не сбрасывать.

## 4. Что изменилось в Releases

| Release | Подтверждённый состав | Практический вывод |
| --- | --- | --- |
| Cabinet v1.80.0 | Rule-based broadcast audience, user lookup/list permissions и focus; Cashera method/QR/recurrent; язык документов; reminder error/cache; success labels/traffic unit; DPI//CHECKER; Lite fix | Переносить retained behavior; DPI полностью исключён, Lite/BSCHEKER не возвращать |
| Cabinet v1.80.1 | TipTap 3.31.3; Vite 8 / plugin-react 6; Vitest 5; i18next 26 / react-i18next 17; lint-staged 17; native Vite config, vendor splitting и Twemoji interop | TipTap resolved версия уже есть у нас; major tooling не нужен автоматически для новых функций |
| Bot v4.16.0 | Audience API/evaluation at send time, Cashera payment/H2H/refund/recurring; legal fallback; reminders reliability; live Telegram menu; activity/media external API; abuse integration; proxy URLs, Redis pool, Tribute reliability, panel trial cleanup | Audience/Cashera задают новые frontend contracts. Остальное — изменения официального Bot и сценарии compatibility проверки, без копирования backend |
| Bot v5.0.0 | PostgreSQL 18 upgrade tooling и guard, Python 3.14, backend dependency/security updates, bulk-delete lazy-load fix, Telegram HTML/legal handling, BSCHEK duplicate-job fix | Требует нового runtime proof; новые frontend возможности в основном уже появились в v4.16.0 |

Release-note утверждения о безопасности TipTap/PyJWT отражают заявление upstream; конкретные CVE и полное устранение всех угроз не установлены этим исследованием. Обещание 390 KB gzip относится к upstream build и не переносится на Custom Cabinet без измерения. Source [C01/C02/B01/B02], dependency diff [C10], runtime commit [B10].

## 5. Границы работ

Внутри реализации: frontend code/tests/locales, узкие dependency metadata changes при необходимости, executable exclusion guard, затем проверенные provenance/compatibility записи. Следовать ADR 0003 и существующим UPSTREAM_SYNC / CUSTOMIZATION_MAP / REDESIGN_RULES.

Не входят:

- изменение исходников, API, бизнес-логики или миграций Upstream Bot;
- backend fork, patches или собственная реализация server audience/финансовой логики;
- DPI//CHECKER, BSCHEKER/reachability/GEO, Simple/Lite presentation;
- новая визуальная система, массовый refactor, новая page tree или общий monorepo;
- модификация `site/`, приватного `old/`, production access/config или данных;
- автоматическое обновление Installer, PG major migration, commit/push/Release/production;
- новые экраны для abuse service, live Telegram menu, external webapi activity/media: в Cabinet target diff таких экранов нет;
- автоматически включённые major tooling upgrades и исправления несвязанных known issues из INTERFACE_MAP.

## 6. Требования к сохранению кастомизации

| ID | Инвариант | Обязательная проверка |
| --- | --- | --- |
| KEEP-01 | Unified Dashboard остаётся единственным пользовательским центром подписки/устройств/баланса; старые URL открывают существующие overlays | Direct entry, reload, закрытие overlay и selected subscription ID |
| KEEP-02 | Custom AppShell, mobile navigation, semantic tokens, Card/Button/ResponsiveOverlay, operator colors и reduced motion | Web/Telegram, 320–1280+, light/dark/operator theme, keyboard/focus |
| KEEP-03 | Classic purchase-preview — финальная server price, скидка повторно не применяется | Server preview с promo 90%, stale response, смена периода, CTA и summary одной суммы |
| KEEP-04 | Paid active/expired Classic и поддержанные periodic tariffs продлевают ту же subscription identity | Dashboard entry → renewal, return/reload, single/multi; trial/daily/legacy paths сохраняют свои правила |
| KEEP-05 | Renewal session selection scoped к user/subscription; цена и permission берутся свежими | Смена user/subscription, logout, unavailable period, серверный price change |
| KEEP-06 | Top-up close/back сохраняет origin, returnTo и pending payment; выход не отменяет invoice | До/после создания оплаты, expired/failure/success, Telegram Back, reload |
| KEEP-07 | Top-up success означает зачисление; purchase success подтверждается состоянием покупки/подписки | Нет purchase POST на balance event и нет ложного «подписка куплена» |
| KEEP-08 | Custom InfoNavigation/Profile/Support/Instructions, promo-group return и gift result exit остаются | Origin/back/reload, loading/error headers, Info section return и renewal period restoration |
| KEEP-09 | Early contact removal до subresources, branding provenance, auth/legal consent, safe storage и backend detail normalization | Existing privacy/auth/storage regressions; ни raw object detail, ни утечек contact/token |
| KEEP-10 | Admin roles/permissions, form env locks, media sanitization и HTML sanitization остаются | Restricted role, forbidden action, structured errors, HTML/media cases |
| KEEP-11 | DPI/BSCHEKER/Lite frontend отсутствует и при прямом URL, а не только скрыт в меню | Static guards, network request assertions и отсутствующие feature routes |

Эти инварианты — существующие Custom Cabinet доработки из receiving source и карты ownership. Они не заявляются как новые features Bedolaga. Точные seams и пути находятся в ADR.

## 7. Функциональные требования

### FR-01. Документы следуют языку интерфейса — P0

Основание: [C03]. Previous Custom info client не передаёт язык и использует query keys без языка. Current Bot v4.15 уже принимает `language` в этих endpoints; расширенный fallback к configured DEFAULT_LANGUAGE появляется в новом Bot [B03].

1. Передавать текущий normalized interface language в FAQ list/item, rules, privacy, public offer и recurrent-payments API.
2. Добавить язык в соответствующие query/cache keys и заменить непосредственный `queryFn: infoApi.get...` обёрткой с явным language. Не передавать объект React Query context вместо строки языка.
3. Обновить каждый retained consumer, включая публичные legal страницы и Custom recurrent-document tab. Upstream page diff явно меняет не все Custom consumer paths; перенос четырёх query keys целиком не покрывает наш fifth tab.
4. Сохранить visibility, custom info-page replacements, sanitization и back/origin contracts. Server fallback остаётся серверным; не создавать второй набор юридических документов во frontend.

Acceptance: RU → EN → FA/RTL → RU переключает запросы и содержимое без смешивания кеша; публичные документы доступны до login; missing/empty requested-language text отображает реальный server response. Fallback Bot v4.15 и v5 проверяется отдельно, не обещать одинаковое поведение по одному frontend test.

### FR-02. Ошибка напоминаний и свежий кеш после сохранения — P0

Основание: [C04], backend reliability [B04].

1. Ошибка list запроса показывает видимый alert и retry. Empty state разрешён только после успешного пустого ответа.
2. Успешный create/update инвалидирует list и соответствующий detail cache до возврата в список; повторное открытие показывает сохранённое состояние.
3. Сохраняются существующие form state, audience/test behavior, validation и permissions; не подменять server failure пустым массивом.

Acceptance: 500/error не показывает «напоминаний нет»; retry с успешным ответом восстанавливает список; edit/create при прогретом кеше сразу отражается в списке; restricted admin не получает лишних write actions. Bot-side сбой отдельного reminder не маскируется frontend fake success.

### FR-03. Success-переводы без незаполненных placeholders — P0

Основание: [C05]. Четыре ключа `successNotification.devicesAdded`, `totalDevices`, `totalTraffic`, `trafficAdded` становятся подписями без `{{count}}` / `{{value}}`, поскольку числа уже отдельно рисуются компонентом. Единица traffic берётся через `common.units.gb`.

Acceptance: покупка devices и traffic показывает числа ровно один раз и не содержит буквальных braces; RU/EN/FA/ZH проверены; overlay закрывается/возвращает focus по текущим Custom правилам. Не заменять весь locale tree upstream-файлом.

### FR-04. Rule-based аудитория рассылки — P1, нужен новый Bot

Основание: [C06], [B05].

1. Telegram и Email имеют отдельные audience conditions. Поддержать только подтверждённые atomic fields: subscription status/type, tariff, zero/greater/less traffic, registration/activity/subscription-end dates, registration source/auth type, payment history, user lookup; email promo-group — по available filters.
2. Condition transport: `field`, `operator` (`eq`, `ne`, `before`, `after`, `between`), string `value`, optional `value_to`, `label`, `join`. Первая строка `join=null`; далее `and/or`. `client_id` — локальный editor key, не server identity.
3. Conditions вычисляются **последовательно сверху вниз**, без стандартного приоритета AND над OR. Frontend не вычисляет получателей и не строит SQL; правила определяет неизменённый Bot.
4. Preview — `POST /cabinet/admin/broadcasts/audience/preview` с `channel`, `category`, `audience`, `offset`, `limit`; возвращает `count`, page metadata и `users`. Search — `GET /cabinet/admin/broadcasts/audience/users` с `field`, `q`, `offset`, `limit`.
5. Count доступен по `broadcasts:read`, список людей и lookup дополнительно требуют `users:read`. Restricted Marketer не выполняет search и не показывает user details; count не трактуется как permission на identities.
6. Selected user transport value — строка внутреннего `users.id`, а не Telegram ID/email label. Search поддерживает substring, debounce/paging и keyboard selection по upstream behavior.
7. Send использует существующий `/cabinet/admin/broadcasts/send` через createCombined, `audience` вместо обязательного target. Старое `target` остаётся поддержанным transport/history contract. Для audience `channel='both'` запрещён: два последовательных отдельных запроса Telegram и Email.
8. Сохранять `?email_user=<id>` из admin user card, email promo-group filters, category, HTML/media/custom buttons и existing history/detail/stop. Preview dialog использует focus trap, Escape и focus return в Custom primitives.
9. История показывает понятные сохранённые conditions; старые записи без audience продолжают показывать target. Actual recipients вычисляются Bot заново перед доставкой с notification preferences, preview не является snapshot гарантированного списка.

Acceptance: пустая/невалидная дата или диапазон блокируют submit; valid ноль traffic принимается; `between` сверяет обе даты; две channel audiences не смешиваются; old email/user/promo-group entry points работают; без `users:read` нет user search запросов; send payload и first/subsequent join точны. Partial failure второго channel запроса не называется успехом обоих и не вызывает автоматическое повторение первого; серверная atomic delivery двух каналов не заявляется.

На Bot v4.15 endpoint отсутствует. До перехода на совместимый Bot сохранить прежний editor в соответствующем candidate либо не назначать этот source для Cabinet-only публикации. Не придумывать unsupported capability probe или безопасный fallback с отправкой всем.

### FR-05. Cashera как динамический payment method и QR — P1, нужен новый Bot

Основание: [C07], [B06].

1. Поддержать Cashera label/description/icon и CASHERA settings category по existing server settings tree; доступные options/limits берутся из Bot. Не включать provider и не задавать credentials из frontend.
2. Top-up response может содержать optional `qr_payload`. При наличии QR и payment link показать QR в существующей payment-ready card, сохранив ручное действие открытия ссылки. QR не запускает automatic open_url_direct redirect.
3. При отсутствии `qr_payload` работают прежние Stars/Telegram deep links и web/Telegram external payment behavior. QRCode renderer уже имеется в стеке (`qrcode.react`); новый пакет не нужен.
4. Сохранять pending info **до** перехода/выхода, `payment_id`, method/amount/returnTo, submit lock, rate limit и существующий `useCreatedTopUpStatus`. Payment-ready QR не означает завершение оплаты.
5. New submission очищает старый QR/link state. Ошибки и отмена/истечение показываются по реальному payment status; не создавать вторую оплату для refresh.

Acceptance: QR появляется при server field, auto-navigation не выполняется; no-QR path не меняется; кнопка открытия оплаты использует существующий safe platform helper; один быстрый двойной click создаёт один invoice; back/reload возврат сохраняется; polling привязан к созданному payment ID, подтверждённое зачисление не объявляет Classic purchase success. Проверить scale/contrast QR в темах и на 320 px. Реальный charge — только sandbox или отдельное разрешение владельца.

### FR-06. Cashera recurring и оформление тарифа — P1, нужен новый Bot

Основание: [C08], [B07].

1. Добавить transport/state contracts и связать их с существующим SubscriptionManagement overlay и purchase form. Не добавлять новый Dashboard/Subscription presentation path.
2. Использовать `cashera_recurrent_enabled` из purchase options. Новая CTA доступна только при явном true в tariffs mode; trial и unsupported contexts не обещают подключение recurring. Missing flag не доказывает наличие endpoint.
3. `GET /cabinet/subscription/cashera-recurrent`, `POST .../enable`, `POST .../cancel` относятся к конкретному optional query `subscription_id`. `POST .../purchase` получает query `tariff_id` и пустое тело. Ответ purchase: `status`, nullable `redirect_url`, `subscription_id`.
4. State response: `status` (`none`, `PENDING`, `ACTIVE`, `PAST_DUE`), optional `charge_days`, `interval`, `amount_kopeks`, nullable `next_charge_at`, `redirect_url`. UI states: hidden/off/pending/active/past_due; unknown status следует upstream fallback, не выдаётся за ACTIVE.
5. Pending polling — 8 секунд, только PENDING. Enable/cancel/purchase обновляют existing relevant subscription/options/list/recurring caches. Balance-autopay changes также инвалидируют новый Cashera key, поскольку Bot отменяет recurring provider при включении balance-autopay.
6. Feature-disabled определяется строго как 403 и `detail === 'Cashera recurrent disabled'`. Other 403/detail objects показываются через существующий error normalizer, не считаются выключенной функцией.
7. Перед cancel используется existing destructive confirmation. PENDING redirect открывается штатным openPaymentUrl; PENDING не является active subscription/payment success.
8. Recurring CTA не наследует показанную цену/скидку обычной покупки. Bot purchase endpoint не принимает выбранный period/device/traffic payload. Сервер выбирает cadence и full recurring amount, округляет вверх до RUB; показывать фактический status amount/interval. Не изобретать API для управления ценой.
9. Не раздувать существующую Subscription page: добавить маленький Cashera feature module/hook там, где уже расположен management; старые Platega/Lava consumers не переносить wholesale в upstream RecurringPanels.

Acceptance: hidden/false/missing/trial не дают нового erroneous request; PENDING polling прекращается при ACTIVE/PAST_DUE и unmount; pending/active cancellation и strict-disabled discriminator протестированы; targeted subscription ID не теряется в multi-mode; repeated click не дублирует POST; enable/purchase response не обещает выбранный ordinary purchase period. Platega/Lava и manual renewal не регрессируют.

OPEN: upstream UI скрывает Cashera panel при disabled flag, хотя cancel API специально доступен при отключении. После flag-off/reload возможность безопасно определить и отменить ранее активный договор не доказана. Зафиксировать фактический результат, не подменять его PASS и не предполагать исчезновение автосписаний вместе с панелью. Backend changes из этого не следуют и не входят в completion frontend задачи.

### FR-07. DPI//CHECKER отсутствует в frontend — P0

Прямое решение владельца: «Полностью исключить из Custom Cabinet». Не переносить API/routes/types/settings/permissions/navigation/actions/polling/locales/assets/fixtures. Особый риск: upstream добавляет shortcuts в существующие admin users, Remnawave nodes и SupportDetails; пропуска одного нового каталога недостаточно.

Acceptance: executable guard в стандартном npm test покрывает каждый surface и выявляет случайный import/route/query/settings insertion; browser network gate не обнаруживает `/cabinet/admin/dpichecker` запросов. BSCHEKER и Simple/Lite guards остаются. Официальные Bot migrations не вырезаются: `0128` требуется для следующего `0129`.


Generic полученные settings categories/definitions и permission registry тоже фильтруются как display-данные: исключённый сервис не должен всплывать через Other, поиск, favorites или редактор роли. Auth permissions и ранее назначенные role permissions остаются данными официального Bot. Только точная декларация frontend-исключения допускает forbidden markers в отдельном policy-модуле; runtime client/route там запрещён guard-тестом. Основание и граница — ADR 0003.

### FR-08. Dependencies и build — P0 baseline / отдельный optional tooling scope

Source [C10]. Receiving lockfile уже разрешает все найденные TipTap packages в 3.31.3. Проверить и сохранить эту версию; при согласовании declaration ranges с `^3.31.3` не обновлять несвязанные resolved packages. Не утверждать наличие у нас прежней уязвимой версии по одному package.json range `^3.30.4`.

Locale diff содержит 434 новых ключа RU, 433 EN, по 432 FA/ZH и четыре изменённые success-подписи в каждом языке, без удалённых ключей. После исключения DPI//CHECKER и Lite остаётся одинаковый набор из 79 новых ключей на каждом языке; его переносить выборочно вместе с retained consumers. Эти числа относятся к upstream delta, не к замене Custom locale-файлов.

| Tooling | Receiving lockfile | Upstream target lockfile | Решение первой адаптации |
| --- | --- | --- | --- |
| TipTap | `3.31.3` | `3.31.3` | Уже есть; preserve / проверить installation и editor |
| Vite / plugin-react | Vite `7.3.6`, прежний plugin major 5 | Vite `8.3.1`, plugin major 6 | Отложить связанный migration scope |
| Vitest | `4.1.11` | `5.0.2` | Отложить major; existing behavioral tests сохраняются |
| i18next / react-i18next | `25.10.10` / `16.6.6` | `26.4.2` / `17.0.15` | Отложить major; локализационные fixes работают на existing stack |
| lint-staged | `16.4.0` | `17.6.0` | Отложить major |

Если владелец позже включит Vite 8 в implementation scope, принять связанную группу config/Rolldown/Twemoji и пройти compiled artifact gate. Точные места и риск custom barrel side effects описаны ADR. Нельзя импортировать native Vite config без совместимой группы или обещать upstream gzip результат для нашего проекта.

## 8. Пользовательские истории

1. Как пользователь, хочу видеть документы на выбранном языке, чтобы понимать правила сервиса.
2. Как гость, хочу открыть оферту и recurring terms до login, чтобы прочитать их до согласия.
3. Как пользователь, хочу видеть правильные числа devices/traffic без braces, чтобы понимать результат операции.
4. Как администратор, хочу отличать ошибку напоминаний от пустого списка, чтобы не потерять созданные правила.
5. Как администратор, хочу сразу увидеть сохранённое напоминание, чтобы не создавать дубликат.
6. Как администратор, хочу составлять несколько audience conditions, чтобы отправлять только нужной группе.
7. Как администратор, хочу отдельные Telegram/Email audiences, чтобы сохранить их разные критерии.
8. Как Marketer без users:read, хочу видеть разрешённый count, сохраняя ограничения на персональные данные.
9. Как администратор с users:read, хочу выбрать пользователя и открыть его карточку из preview.
10. Как администратор, хочу видеть сохранённые audience rules в истории, чтобы понимать, что было отправлено.
11. Как пользователь, хочу пополнить баланс через доступный Cashera method, если его включил оператор.
12. Как пользователь, хочу оплатить QR из существующего экрана без потери возврата и pending state.
13. Как пользователь, хочу отличать готовую платёжную ссылку от подтверждённого зачисления.
14. Как пользователь тарифа, хочу понимать отдельные условия Cashera recurring до подтверждения провайдеру.
15. Как пользователь нескольких подписок, хочу управлять recurring выбранной subscription, сохраняя остальные.
16. Как пользователь, хочу сохранить привычные Dashboard, period choice и renewal после обновления.
17. Как владелец, хочу исключить DPI//CHECKER и сохранить кастомизацию без backend fork.
18. Как следующий coding-agent, хочу traceability каждого incoming изменения, чтобы не копировать неподтверждённые возможности.

## 9. Что из Bot влияет на проверку, но не переносится как frontend feature

| Source area | Подтверждено | Действие coding-agent |
| --- | --- | --- |
| Broadcast audience | Server evaluation at send time, live trials/negative predicates, RBAC, schema audience column | Использовать API и проверить parity, не вычислять recipient list локально |
| Cashera refund/chargeback | Bot корректирует balance по payment reversal, добавляет payment records/search/status | Проверять displayed balances/status, не создавать client debit/credit logic |
| Legal fallback | Новая версия возвращает default language при отсутствующем/пустом тексте | Проверить server response в staging, не синтезировать юридические тексты |
| Reminders | VK BIGINT predicate и изоляция сбоев individual rule | Не копировать dispatch logic; ошибка API всё равно отображается честно |
| Activity/media webapi | Existing activity collector переиспользован внешним API; внешняя галерея вложений | Проверить существующий admin activity и media links; новый UI не подтверждён |
| Abuse service | Новые Bot integration/routes, email verification и malformed-response handling | Информативное upstream изменение; нет соответствующей frontend реализации в target |
| Live Telegram menu | Автообновление Bot rich-menu и SCAN вместо KEYS | Проверка неизменённого Bot; не новый polling loop Cabinet |
| Proxy public URLs | Scheme/host файлов берутся из proxy headers | Проверить signed media/attachments через существующий proxy |
| Redis pool / Tribute | Backend reliability, commit/retry behavior | Staging/recovery evidence, без client compensation или финансовых promises |
| Panel trial reset / bulk delete | Исправления очистки identity и async lazy-load | Sandbox admin regression существующих actions; не новый endpoint |
| Bot dependency security / HTML | PyJWT и related dependency update; Telegram legal HTML handling | Auth/legal regression с новым exact Bot; без изменения нашего auth protocol |
| DPI/BSCHEKER | Backend modules/permissions/migrations остаются | Frontend не экспонирует; backend source не изменяется |

## 10. Последовательный план для coding-agent

Каждый шаг: failing behavioral test при изменении testable behavior → минимальный перенос → targeted verification. Документационные/metadata шаги проверяются статически. Точные code paths — ADR, source refs — приложения ниже.

| Шаг | Где выполняется, что и зачем | Зависимость / проверка завершения |
| --- | --- | --- |
| S0 | В clean Custom Cabinet copy закрепить receiving SHA, previous/target upstream trees, owner snapshot и unchanged source Bot v5; исключить stale owner overwrite | Tree equality, full ledger, no owner/remote changes; изменившийся baseline требует обновления сравнения |
| S1 | В Custom Cabinet добавить DPI exclusion guard и сохранить BSCHEKER/Lite boundaries, чтобы mixed imports не вернулись при переносе | Guard red на запрещённом surface → green на actual tree; без Bot edits |
| S2 | В Custom info API/pages/cache перенести language и проверить все consumers | FR-01 tests на cache switch/public/retained tab; KEEP-08/09 |
| S3 | В Custom reminders и success modal/locales перенести error/cache/interpolation fixes | FR-02/03 tests; all four locales; source-compatible текущий Bot contract |
| S4 | В API/types + broadcast feature/pages перенести audience/editor/permissions/history | FR-04 tests; новый Bot contract evidence; no actual mail/broadcast send вне sandbox |
| S5 | В payment method/settings/TopUpAmount встроить Cashera и QR в текущий payment-ready flow | FR-05 tests и KEEP-06/07; не повторять существующую платёжную логику |
| S6 | В subscription API/helper/management и tariff form добавить Cashera recurring | FR-06 state/ID/disabled/error/cache tests; KEEP-03/04/05; no invented selected-period payload |
| S7 | В locales/docs сверить retained additions и проверенные dependencies; классифицировать optional tooling group как skipped | Locale usage + key parity; TipTap proof; custom metadata/scripts остаются |
| S8 | На exact compiled Custom artifact выполнить единый affected browser gate и полный source gate | Unit/build/type/Biome + existing regression suites; all skips/failures явно записаны |
| S9 | В isolated staging проверить новый unchanged Bot pair, API/RBAC/payment/recurring/recovery и runtime boundary | OPEN/BLOCKED остаются таковыми; новый Bot lifecycle нельзя заменять прежним PASS |
| S10 | В Custom provenance/compatibility/sync report записать фактически проверенный result и все deviations | UPSTREAM.md не переключается до gate; source completion отдельно от release/production |

S4–S6 можно реализовать и проверять локально до runtime staging, но их live compatibility остаётся неподтверждённой. S9 не разрешает менять Installer/runtime без отдельного scope. Если такой работы нет, coding-agent завершает frontend и сохраняет точный BLOCKED список для Release, не переписывает backend.

## 11. Верификация

### Source и regression gate

Использовать существующие scripts: `npm test`, `npm run build` (включает полный type-check), `npm run check` для затронутого source и `git diff --check`. Отдельный type-check нужен, если использован build:docker или full check исключён из build. Dependency installation — `npm ci` в isolated copy, без npm install/update в owner папке. Терминальные команды запускать явным `C:\Program Files\Git\bin\bash.exe`.

Existing seams: info API tests; reminder page tests; SuccessNotificationModal tests; adminBroadcasts tests и admin permission fixtures; TopUpAmount feedback/return tests; recurringFeatureProbing/sbp/lava helpers; Classic preview/renewal/payment/back unit и E2E. Upstream test names доступны в file ledger, но переносить assertions к нашим consumers, а не копировать path/import assumptions.

| Матрица | Минимальные scenarios |
| --- | --- |
| User states | No subscription, trial, active/expired/limited, tariff selection, daily, Classic, periodic tariff, single/multi |
| Payment | Sufficient/insufficient balance, stale preview, QR/no QR, failed/expired/pending/paid, manual Classic confirmation, return/reload |
| Recurring | Feature false/missing/true, trial, none/PENDING/ACTIVE/PAST_DUE, exact 403 vs another error, target ID, cancel/flag-off limitation |
| Admin | Full admin и restricted Marketer/users:read absence, preview only, old target history, email preset, both-channel partial failure |
| Presentation | 320, 375, 768, 1024, 1280+ px; web и Telegram mock; light/dark/operator palette; RU/EN и FA RTL; ZH locale correctness |
| Accessibility | Keyboard combobox, preview trap/Escape/focus return, QR text action, named retry/error, no accidental page overflow |
| Preservation | Existing Dashboard/navigation/privacy/storage/renewal/topup/promo-group/gift-result tests |
| Exclusion | Нет DPI/BSCHEKER/Lite consumers, routes, settings, locales, feature assets и background requests |

Browser gate проверяет **compiled artifact** той же exact source, которая рассматривается для публикации, по существующему Playwright compiled-build режиму. Не добавлять повторные большие проверки, если их scope/inputs не изменились. Unit mocks и browser API fixtures не доказывают реальные payments, DB/Redis state, Telegram devices или panel sync.

### Staging / runtime gate

Для нового Bot зафиксировать exact source/image identities, schema, target OS, disposable environment, test accounts и sandbox provider. Сверить новые request/response/RBAC contracts; проверить real sandbox purchase/recurring/confirmation/cancel и disabled-provider gap, old providers, balance, panel identity и operation counts. Проверки восстановления/параллельных callbacks выполняются только с тестовыми данными; финансовую гарантию не выводить из sequential mocks.

Source Bot v5 official compose использует PG18 с иным data mount/volume, Installer — свой PG15 contract. На PG15 подтверждены local schema/query proof и targeted native VPS startup/HTTPS/API; весь runtime/business matrix и full Installer lifecycle ещё не проверены. Переход PG15 → PG18 нельзя свести к image replacement. По отдельно разрешённой runtime задаче требуется фактический full Installer lifecycle новой комбинации, schema upgrade `0127 -> 0131`, restore/rollback/recovery и fresh-install/cleanup/postflight proof. Не запускать upstream make pg-upgrade над Installer managed installation по одной release note.

Следующая публикация — существующая deployment procedure, new immutable tags, public bytes/contract verification и новый Bundle smoke. Production — самостоятельное разрешение, свежий baseline и off-host backup. Имеющиеся OPEN/BLOCKED live cases, non-blocking dependency audit и Classic limitation не становятся PASS от успешного frontend build.

## 12. Критерии завершения и неподтверждённые сведения

**Исследование и документы:** точные версии и compare bases установлены; incoming delta классифицирован; owner exclusion записан; PRD/ADR имеют источники и последовательные acceptance requirements. Первичный этап исследования не запускал runtime; последующий локальный proof описан выше, полный S9 остаётся PARTIAL.

**Frontend implementation:** S0–S8/S10 завершены в согласованном source scope; retained behavior и KEEP invariants прошли applicable source/browser gates; все 58 incoming commits имеют final action и evidence, каждый changed path обработан; никаких запрещённых frontend surfaces. Optional skipped tooling объяснён. Target runtime может оставаться BLOCKED и не становится условием переписывания frontend.

**Проверенная целевая совместимость:** новый exact Bot/source/runtime действительно прошёл S9; подтверждён полный ledger runtime/schema/API/live limitations. Формальная upstream compatibility matrix для v1.80.1 + v5.0.0 не найдена в изученных материалах. Связь выводится из exact route/schema source и inclusion v4.16 contracts в v5, не из совпадения дат.

**Release / production:** вне данного задания. Новый пакет и переход не разрешены этим PRD.

| Вопрос | Состояние на дату исследования |
| --- | --- |
| Почему изменился upstream SHA тега v1.79.0 | Причина не подтверждена; equality trees доказано |
| Свежая текущая production identity | Не снималась; использована последняя запись 2026-10-10 |
| Совместимость нового Bot с Installer PG15 compose | NOT_VERIFIED; neither PASS nor автоматически невозможность |
| Безопасный PG major upgrade/rollback нашим Installer | NOT_VERIFIED; отдельный runtime scope |
| Cashera реальные merchant credentials/availability/sandbox | Не проверены; наличие frontend/API не включает provider |
| Recurring отмена после выключения флага и reload | OPEN: cancel API есть, discovery/UI availability не доказаны |
| Classic новая автопокупка после top-up | OPEN по target source; producer mode не принимается dispatcher |
| Действительно ли closed все CVE | Не подтверждено; source версии/notes установлены |
| Улучшение startup size нашего Custom Cabinet | Не измерено; upstream число не является нашим result |
| Physical Telegram/accessibility/payment/recovery full matrix | NOT_RUN в исследовании; исторические accepted limits не закрыты |

## 13. Реестр первичных источников

Ссылки на paths ниже привязаны к exact commit, кроме Release pages/API. Release text и код иногда имеют разную детализацию; требования опираются на код.

| ID | Первичный источник |
| --- | --- |
| C01 | [Cabinet v1.80.0 notes](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/releases/tag/v1.80.0) |
| C02 | [Cabinet v1.80.1 notes](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/releases/tag/v1.80.1) и [stable compare](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/compare/f5ea595f8f732c37f2d5c270f34879ab2e2fba2d...a693d30ca6084b9a54b45a72294b99237841ef13) |
| C03 | [language fix 9726d64](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/9726d643344951587535ce4e495a133b55c71894) и target info/public-legal paths в file ledger |
| C04 | [reminders fix 0e94eb1](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/0e94eb1170dbb48f2aaa7d64ceabd272a8e1899b) |
| C05 | [labels 05eecd4](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/05eecd4faaada7a04fc1d0e03331ca4618cc5c5e), [traffic unit 8ca6987](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/8ca6987c38bc474f4c58e7766058b1cf71707f65) |
| C06 | [audience 87635df](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/87635df22efd806fe0ff4864bcee744f2f274aa4), [atomic filters 4b45740](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/4b457404c8255bd39f3ba62ea7e7b477e1863617), [permission fix 72a7d73](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/72a7d73ef58329738a1f8152d0238b0ff12a0be2) |
| C07 | [method e035c27](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/e035c27755ecbdc7fa09dc7884650cca7d269f96), [QR 20dcfaf](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/20dcfafffefc5ec9fa85e61c36f19788208a9709) |
| C08 | [recurring d6d3ab0](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/d6d3ab0e04140eb15df0bd319ea0d38c995f8474), [purchase/panel 0d5a582](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/0d5a5820dfba11bbbd0049ad5d0446a45dc71484) |
| C10 | [package target](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/package.json), [build/security 589ef56](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/589ef566089be0e9fa595e3e9df00f3fa220d341) |
| B01 | [Bot v4.16.0 notes](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/releases/tag/v4.16.0) |
| B02 | [Bot v5.0.0 notes](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/releases/tag/v5.0.0), [exact range](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/compare/877690a7039d1326b2c00eda3e297879b80c0678...5bda3c56f0afd9f4813e9c6fa48934948b05ebae) |
| B03 | [target info routes](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/blob/5bda3c56f0afd9f4813e9c6fa48934948b05ebae/app/cabinet/routes/info.py), [current v4.15 info](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/blob/877690a7039d1326b2c00eda3e297879b80c0678/app/cabinet/routes/info.py) |
| B04 | [reminder dispatcher resilience](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/bc982703182a9bc78b949f0f119b19c3a6dee80d), [VK predicate fix](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/e1db56242c06aac716871a07b3338b7176fd3a80) |
| B05 | [audience docs](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/blob/5bda3c56f0afd9f4813e9c6fa48934948b05ebae/docs/broadcast_audiences.md), [routes](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/blob/5bda3c56f0afd9f4813e9c6fa48934948b05ebae/app/cabinet/routes/admin_broadcasts.py), [schemas](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/blob/5bda3c56f0afd9f4813e9c6fa48934948b05ebae/app/cabinet/schemas/broadcasts.py) |
| B06 | [balance routes](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/blob/5bda3c56f0afd9f4813e9c6fa48934948b05ebae/app/cabinet/routes/balance.py), [Cashera payment source](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/blob/5bda3c56f0afd9f4813e9c6fa48934948b05ebae/app/services/payment/cashera.py) |
| B07 | [Cashera recurring routes](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/blob/5bda3c56f0afd9f4813e9c6fa48934948b05ebae/app/cabinet/routes/subscription_modules/cashera_recurrent.py), [period helper](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/blob/5bda3c56f0afd9f4813e9c6fa48934948b05ebae/app/services/autopay_period.py) |
| B08 | [Classic producer](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/blob/5bda3c56f0afd9f4813e9c6fa48934948b05ebae/app/cabinet/routes/subscription_modules/purchase.py), [dispatcher](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/blob/5bda3c56f0afd9f4813e9c6fa48934948b05ebae/app/services/subscription_auto_purchase_service.py) |
| B10 | [v5 runtime commit](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/4b7875162a8bef394e1b096d9e65179d6683d4a9), [PG upgrade docs](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/blob/5bda3c56f0afd9f4813e9c6fa48934948b05ebae/docs/postgresql-18-upgrade.md), [compose](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/blob/5bda3c56f0afd9f4813e9c6fa48934948b05ebae/docker-compose.yml) |
| K01 | [Custom Cabinet source](https://github.com/alexforworkgpt-source/custom-cabinet/tree/1d046656fbb01a928fd54a28694e10105d4185f8), [locked dependencies](https://github.com/alexforworkgpt-source/custom-cabinet/blob/1d046656fbb01a928fd54a28694e10105d4185f8/package-lock.json) |
| K02 | Локальные [CONTEXT.md](<M:/CURSOR2/PC WEB/CONTEXT.md>), [production runbook](<M:/CURSOR2/PC WEB/PRODUCTION_TRANSITION_RUNBOOK.md>) и [transition report](<M:/CURSOR2/PC WEB/installer/docs/production-transition-bundle-2026.10.10.1-20261010.md>) — записанная история, не fresh baseline. Публичный файл transition report по проверенному GitHub URL недоступен (404); публичная публикация этого отчёта не подтверждена. |

Дополнительная локальная evidence-копия: `M:\CURSOR2\PC WEB\.scratch\bedolaga-research-20261013\` — releases JSON, exact upstream Git repositories, published Custom reference, diff inventories, locales delta и owner hashes. Передача двух документов не требует переноса этих временных копий: exact public sources и итоговая классификация включены ниже. Исторический `821c7b7…` сохранён в локальном Custom Git, его равное дерево подтверждено в исследовании.

## 14. Полный ledger входящих Cabinet-коммитов

Следующая таблица фиксирует рекомендуемое действие, не уже выполненный перенос. Merge-коммиты — evidence состава, не отдельный cherry-pick. Mixed commits читать по concern; SHA и полное содержание доступны по ссылке.

| SHA / source | Изменение | Действие |
| --- | --- | --- |
| [b8550d08](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/b8550d089e30f4bf4f709e5315f7bd8ed8c2aff6) | feat(dpichecker): контракт API и адрес раздела | SKIP: DPI//CHECKER исключён владельцем; unused shared download/IconTabs также не нужны |
| [24b07e14](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/24b07e1425874f51e602455394d9efda9d203ec9) | feat(dpichecker): раздел в админке, вкладки и подсказка настройки | SKIP: DPI//CHECKER исключён владельцем; unused shared download/IconTabs также не нужны |
| [4f45a6a6](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/4f45a6a65af22aa18d8bda9f15fb3ee557756602) | feat(dpichecker): выбор точек как на сайте — пресеты, округа, регионы | SKIP: DPI//CHECKER исключён владельцем; unused shared download/IconTabs также не нужны |
| [42027cf0](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/42027cf04718db9874be8ecbf40649898bab5779) | test(dpichecker): без Array.at — цель сборки ниже es2022 | SKIP: DPI//CHECKER исключён владельцем; unused shared download/IconTabs также не нужны |
| [e50397f3](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/e50397f38f277c4d6ca251c8f45216f12946edea) | feat(dpichecker): форма проверки в три шага и монитор из неё | SKIP: DPI//CHECKER исключён владельцем; unused shared download/IconTabs также не нужны |
| [df9079a3](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/df9079a32cb9c692cf9c30c959d4bf3958b36723) | fix(dpichecker): вкладки на телефоне листаются вбок, частично выбранный округ заметен | SKIP: DPI//CHECKER исключён владельцем; unused shared download/IconTabs также не нужны |
| [8f78c9b3](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/8f78c9b3eacedfc3a0cee2da35dae60b0ff547d6) | feat(dpichecker): результат проверки — сводка, регионы словами, отмена, повтор, CSV и карта | SKIP: DPI//CHECKER исключён владельцем; unused shared download/IconTabs также не нужны |
| [bfa3e88e](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/bfa3e88e112161a853e30f1edca8bf97787b17b6) | feat(dpichecker): Соседи, Зонд и Черемша | SKIP: DPI//CHECKER исключён владельцем; unused shared download/IconTabs также не нужны |
| [ac67e37b](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/ac67e37b1b89098e6e2ef22457091258f9f62d37) | feat(dpichecker): мониторы, история и траты по админам | SKIP: DPI//CHECKER исключён владельцем; unused shared download/IconTabs также не нужны |
| [f697829b](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/f697829bb596733694670ad9d6013381fe4716f4) | feat(dpichecker): переходы с карточки ноды и из подписки пользователя | SKIP: DPI//CHECKER исключён владельцем; unused shared download/IconTabs также не нужны |
| [7997a76d](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/7997a76df7b062f807c26396670b02d00d0ed773) | i18n(dpichecker): Зонд на китайском и персидском | SKIP: DPI//CHECKER исключён владельцем; unused shared download/IconTabs также не нужны |
| [aed7aa23](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/aed7aa2359a4c1f0b59d1759785bf7b6b97721b8) | fix(dpichecker): суммы строкой не роняют отчёт Зонда | SKIP: DPI//CHECKER исключён владельцем; unused shared download/IconTabs также не нужны |
| [cd71610a](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/cd71610a5cf6af01d2631a72cc2768f28eb00cf8) | feat(dpichecker): замечания владельца — карта всегда, подсказки регионов, история, из панели как у BSCHEKER | SKIP: DPI//CHECKER исключён владельцем; unused shared download/IconTabs также не нужны |
| [ed6f4dec](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/ed6f4decc2e1b21f4927acff504ca638ea4956ad) | feat(dpichecker): карта целиком, CSV в шапке и в Mini App, мониторы, пустой раздел как у BSCHEKER | SKIP: DPI//CHECKER исключён владельцем; unused shared download/IconTabs также не нужны |
| [4e5de2ef](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/4e5de2ef5bdf51f545485ed4928baf10431109ff) | fix(dpichecker): темы операторов — легенда карты заливкой, загрузка карты, контраст; шаги без номеров | SKIP: DPI//CHECKER исключён владельцем; unused shared download/IconTabs также не нужны |
| [9bcab38b](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/9bcab38ba1d5625afebd57da36006c403878984a) | fix(dpichecker): «Из панели» грузит хосты и ноды сразу, без кнопок «Показать» | SKIP: DPI//CHECKER исключён владельцем; unused shared download/IconTabs также не нужны |
| [e9a6f91f](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/e9a6f91f3e6e152629ef797cf51a350f397e21eb) | fix(dpichecker): шапка раздела на телефоне — подзаголовок у иконки, баланс и Соседи отдельной строкой | SKIP: DPI//CHECKER исключён владельцем; unused shared download/IconTabs также не нужны |
| [834187a2](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/834187a291bfe8b6acb41257ef196ba7bdd1d877) | fix(dpichecker): шапка на телефоне — баланс и Соседи строкой под подзаголовком, в колонке названия | SKIP: DPI//CHECKER исключён владельцем; unused shared download/IconTabs также не нужны |
| [036851b3](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/036851b3a049e60a815c9968efd90aa2ef0820ef) | feat(dpichecker): API сервиса целиком — весь аккаунт, подробности точки, прогоны и настройки мониторов | SKIP: DPI//CHECKER исключён владельцем; unused shared download/IconTabs также не нужны |
| [87635df2](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/87635df22efd806fe0ff4864bcee744f2f274aa4) | feat: add rule-based broadcast audience editor | ADAPT: FR-04; transport/RBAC/keyboard/focus и history в Custom admin shell |
| [d989315e](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/d989315e4a3f62366e9bb37591fc415a95d6ebf2) | fix: trap focus in broadcast recipient preview | ADAPT: FR-04; transport/RBAC/keyboard/focus и history в Custom admin shell |
| [4b457404](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/4b457404c8255bd39f3ba62ea7e7b477e1863617) | feat: add atomic broadcast filters and user autocomplete | ADAPT: FR-04; transport/RBAC/keyboard/focus и history в Custom admin shell |
| [3e2310b3](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/3e2310b3f668dac24b3a8d5c67f4561c161289b4) | feat: link broadcast recipients to user details | ADAPT: FR-04; transport/RBAC/keyboard/focus и history в Custom admin shell |
| [ebd42a7e](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/ebd42a7e6c87e0a2b63da712875ca3fa73f96d1b) | fix(broadcast): preserve upstream email targeting | ADAPT: FR-04; transport/RBAC/keyboard/focus и history в Custom admin shell |
| [f795ab11](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/f795ab1112becc638ad3482d1494bb9808622f04) | style(broadcast): align comparison and date fields | ADAPT: FR-04; transport/RBAC/keyboard/focus и history в Custom admin shell |
| [9726d643](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/9726d643344951587535ce4e495a133b55c71894) | fix(info): документы следуют языку интерфейса (#570) | ADAPT: FR-01; язык всех Custom consumers и cache keys |
| [05eecd4f](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/05eecd4faaada7a04fc1d0e03331ca4618cc5c5e) | fix(i18n): не показывать {{count}}/{{value}} в окне покупки устройств и трафика | ADAPT: FR-03; четыре labels и traffic units без замены locales целиком |
| [72a7d73e](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/72a7d73ef58329738a1f8152d0238b0ff12a0be2) | fix(broadcast): поиск и список получателей — только с правом users:read | ADAPT: FR-04; transport/RBAC/keyboard/focus и history в Custom admin shell |
| [bd923c7e](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/bd923c7e7f0a82f05b10abacd2ebd1b61d97b76b) | Merge pull request #617 from mitetenov/feat/precise-broadcast-audience-upstream | RECORD: metadata/merge; учитывать содержимое leaf commits, не cherry-pick отдельно |
| [2f12c7ed](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/2f12c7ed1edb5962e01d15c7eb02998257b2d3ed) | Merge pull request #619 from iLuckyGUY/fix/info-docs-language | RECORD: metadata/merge; учитывать содержимое leaf commits, не cherry-pick отдельно |
| [2fd69a39](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/2fd69a399396afcdbe426f3f6cea35b2b96f033d) | Merge remote-tracking branch 'origin/dev' into pr-620 | RECORD: metadata/merge; учитывать содержимое leaf commits, не cherry-pick отдельно |
| [8ca6987c](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/8ca6987c38bc474f4c58e7766058b1cf71707f65) | fix(i18n): единица трафика в окне покупки — из перевода, а не латиницей GB | ADAPT: FR-03; четыре labels и traffic units без замены locales целиком |
| [ce25ace1](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/ce25ace13ce54016dfd1093ac4dc9cbfe0fed1bb) | Merge pull request #620 from doxfie/fix/success-modal-placeholders | RECORD: metadata/merge; учитывать содержимое leaf commits, не cherry-pick отдельно |
| [e369e8a5](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/e369e8a54517834c532cb2ec5ea37e7781ed1485) | fix(lite): после триала — подключение и тарифы, а не тупик «Продлить»; ссылка подписки в простом виде | SKIP: Lite-only behavior, действующая граница ADR 0002 |
| [0e94eb11](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/0e94eb1170dbb48f2aaa7d64ceabd272a8e1899b) | fix(reminders): упавший список не выдаётся за «напоминаний нет»; после сохранения — свежий список | ADAPT: FR-02; error/retry и cache invalidation |
| [e035c277](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/e035c27755ecbdc7fa09dc7884650cca7d269f96) | feat(payments): Cashera в кабинете — подпись, иконка, раздел настроек, тексты | ADAPT: FR-05/06; только официальные method/recurring contracts, server amount и target ID |
| [20dcfaff](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/20dcfafffefc5ec9fa85e61c36f19788208a9709) | feat(topup): свой экран оплаты — QR прямо на карточке пополнения | ADAPT: FR-05; QR в существующем payment-ready/return/status flow |
| [d6d3ab0e](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/d6d3ab0e04140eb15df0bd319ea0d38c995f8474) | feat(cashera): автопродление СБП в кабинете | ADAPT: FR-05/06; только официальные method/recurring contracts, server amount и target ID |
| [0d5a5820](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/0d5a5820dfba11bbbd0049ad5d0446a45dc71484) | feat(cashera): автопродление в кабинете — панель, покупка, типы, тексты | ADAPT: FR-05/06; только официальные method/recurring contracts, server amount и target ID |
| [d6051e85](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/d6051e8502e752b8b8cf478306b487e466346eb9) | Merge pull request #621 from BEDOLAGA-DEV/dev | RECORD: metadata/merge; учитывать содержимое leaf commits, не cherry-pick отдельно |
| [0d5c73a2](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/0d5c73a240f27275266713885fd9eb6e43eddd80) | chore(main): release 1.80.0 | RECORD: metadata/merge; учитывать содержимое leaf commits, не cherry-pick отдельно |
| [4e0887d8](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/4e0887d89c09f6b865e0d05ba56e1a45d4876568) | Merge pull request #622 from BEDOLAGA-DEV/release-please--branches--main--components--cabinet-frontend | RECORD: metadata/merge; учитывать содержимое leaf commits, не cherry-pick отдельно |
| [073dc084](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/073dc0841c0e3d6a6a24ccd282d759893e32036a) | chore(deps): tiptap 3.31.3 (security) и обновления в пределах диапазонов | PRESERVE + DEFER: TipTap 3.31.3 уже locked; несвязанные upgrades/build — optional FR-08 |
| [95b55283](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/95b55283aaacdf9d145cafe85771dac8b8db7cad) | Merge pull request #623 from BEDOLAGA-DEV/chore/deps-2026-09 | RECORD: metadata/merge; учитывать содержимое leaf commits, не cherry-pick отдельно |
| [9d8eacea](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/9d8eaceaa23defbfd21b9ca9c3821fefa7abb029) | chore(deps): vitest 5 | DEFER: связанный major tooling scope FR-08; не смешивать с функциональной адаптацией |
| [ad100b50](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/ad100b5029bf1358ba0af9883f3ab3b5965c11cc) | chore(deps): vite 8 и @vitejs/plugin-react 6 | DEFER: связанный major tooling scope FR-08; не смешивать с функциональной адаптацией |
| [852dc4d3](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/852dc4d39be430f563967108243bd680a2e1487e) | chore(deps): i18next 26 и react-i18next 17 | DEFER: i18next 26/react-i18next 17 — major tooling FR-08; изменения success labels относятся к 05eecd4/8ca6987, а не к этому dependency commit |
| [3cece458](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/3cece4587f02b6e3899c4380db5c68110181f5e7) | Merge pull request #624 from BEDOLAGA-DEV/chore/vitest-5 | RECORD: metadata/merge; учитывать содержимое leaf commits, не cherry-pick отдельно |
| [e8269113](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/e826911349b5a6701a9ad306e871c7e87b2ad3d3) | Merge pull request #625 from BEDOLAGA-DEV/chore/vite-8 | RECORD: metadata/merge; учитывать содержимое leaf commits, не cherry-pick отдельно |
| [94bc0e07](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/94bc0e07a30be10cbe65d677f9b8d46285f3a800) | Merge pull request #626 from BEDOLAGA-DEV/chore/i18next-26 | RECORD: metadata/merge; учитывать содержимое leaf commits, не cherry-pick отдельно |
| [8a170424](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/8a170424c457279e9c16a58bc11d0997648e3958) | chore(build): vite.config совместим с нативным загрузчиком конфига | DEFER: связанный major tooling scope FR-08; не смешивать с функциональной адаптацией |
| [898622c2](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/898622c24d5ae20ceffcd2ab2d72aaab2884ce8c) | Merge pull request #627 from BEDOLAGA-DEV/chore/vite-native-config-loader | RECORD: metadata/merge; учитывать содержимое leaf commits, не cherry-pick отдельно |
| [5efd0c81](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/5efd0c81f6e5d24567b032d37078d4a8467b9505) | chore(deps): lint-staged 17 | DEFER: связанный major tooling scope FR-08; не смешивать с функциональной адаптацией |
| [66576689](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/665766891b69227d8457b6fd089a1e5653c81e4a) | Merge pull request #628 from BEDOLAGA-DEV/chore/lint-staged-17 | RECORD: metadata/merge; учитывать содержимое leaf commits, не cherry-pick отдельно |
| [502a761a](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/502a761abea49f010b27d2ddddd3fcddbf425f01) | Merge pull request #629 from BEDOLAGA-DEV/dev | RECORD: metadata/merge; учитывать содержимое leaf commits, не cherry-pick отдельно |
| [589ef566](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/589ef566089be0e9fa595e3e9df00f3fa220d341) | fix(deps): tiptap 3.31.3 — закрыты уязвимости редактора новостей и инфо-страниц | PRESERVE + DEFER: TipTap 3.31.3 уже locked; несвязанные upgrades/build — optional FR-08 |
| [f95bdcc3](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/f95bdcc3664befac77082540db3540a26a9cda50) | chore(main): release 1.80.1 | RECORD: metadata/merge; учитывать содержимое leaf commits, не cherry-pick отдельно |
| [a693d30c](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/a693d30ca6084b9a54b45a72294b99237841ef13) | Merge pull request #631 from BEDOLAGA-DEV/release-please--branches--main--components--cabinet-frontend | RECORD: metadata/merge; учитывать содержимое leaf commits, не cherry-pick отдельно |

## 15. Полная карта 125 changed paths Cabinet

`H` — существующий Custom file отличается от previous upstream; `U` — существующий совпадает; `A` — отсутствует в опубликованном Custom tree. `A` не означает обязательное добавление: consumer мог быть исключён или заменён custom seam. Ownership уточняется по CUSTOMIZATION_MAP, решение ниже относится к **incoming delta**, не к удалению текущего файла.

| Target path / source | Сравнение с Custom | Действие с incoming delta |
| --- | --- | --- |
| [CHANGELOG.md](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/CHANGELOG.md) | H | RECORD own sync result; не подменять Custom историю upstream changelog |
| [package-lock.json](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/package-lock.json) | H | PRESERVE TipTap locked 3.31.3/custom metadata; DEFER major group FR-08 |
| [package.json](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/package.json) | H | PRESERVE TipTap locked 3.31.3/custom metadata; DEFER major group FR-08 |
| [scripts/build-geo-map.mjs](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/scripts/build-geo-map.mjs) | A | SKIP BSCHEKER/GEO: прежнее exclusion |
| [src/App.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/App.tsx) | H | SKIP incoming DPI surface/consumer; существующий Custom код остаётся |
| [src/AppWithNavigator.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/AppWithNavigator.tsx) | H | DEFER Vite/i18n major-related delta FR-08; текущий bootstrap сохраняется |
| [src/api/adminBroadcasts.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/api/adminBroadcasts.ts) | H | ADAPT FR-04; split нового editor при необходимости, retained tests/permissions |
| [src/api/balance.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/api/balance.ts) | U | ADAPT FR-05 method/QR и meaningful tests; сохранить payment context |
| [src/api/dpichecker.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/api/dpichecker.ts) | A | SKIP DPI: не переносить incoming feature или её tests |
| [src/api/info.test.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/api/info.test.ts) | A | ADAPT FR-01 через Custom consumers; сохранить InfoNavigation/back/replacements |
| [src/api/info.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/api/info.ts) | U | ADAPT FR-01 через Custom consumers; сохранить InfoNavigation/back/replacements |
| [src/api/subscription.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/api/subscription.ts) | U | ADAPT FR-06 types/client/helpers/purchase/state и tests; preserve Custom prices |
| [src/components/PaymentMethodIcon.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/PaymentMethodIcon.tsx) | U | ADAPT FR-05 method/QR и meaningful tests; сохранить payment context |
| [src/components/SuccessNotificationModal.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/SuccessNotificationModal.tsx) | H | ADAPT FR-03 только labels/units; сохранить Custom overlay |
| [src/components/admin/IconTabs.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/IconTabs.tsx) | A | SKIP incoming DPI surface/consumer; существующий Custom код остаётся |
| [src/components/admin/constants.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/constants.ts) | H | ADAPT CASHERA settings FR-05; SKIP DPICHECKER/BSCHEK categories |
| [src/components/admin/dpichecker/AccountFull.test.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/AccountFull.test.tsx) | A | SKIP DPI: не переносить incoming feature или её tests |
| [src/components/admin/dpichecker/AccountRuns.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/AccountRuns.tsx) | A | SKIP DPI: не переносить incoming feature или её tests |
| [src/components/admin/dpichecker/CheckForm.test.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/CheckForm.test.tsx) | A | SKIP DPI: не переносить incoming feature или её tests |
| [src/components/admin/dpichecker/CheckForm.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/CheckForm.tsx) | A | SKIP DPI: не переносить incoming feature или её tests |
| [src/components/admin/dpichecker/CheckResult.test.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/CheckResult.test.tsx) | A | SKIP DPI: не переносить incoming feature или её tests |
| [src/components/admin/dpichecker/CheckResult.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/CheckResult.tsx) | A | SKIP DPI: не переносить incoming feature или её tests |
| [src/components/admin/dpichecker/CheremshaTab.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/CheremshaTab.tsx) | A | SKIP DPI: не переносить incoming feature или её tests |
| [src/components/admin/dpichecker/CsvButton.test.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/CsvButton.test.tsx) | A | SKIP DPI: не переносить incoming feature или её tests |
| [src/components/admin/dpichecker/CsvButton.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/CsvButton.tsx) | A | SKIP DPI: не переносить incoming feature или её tests |
| [src/components/admin/dpichecker/DeliveriesLog.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/DeliveriesLog.tsx) | A | SKIP DPI: не переносить incoming feature или её tests |
| [src/components/admin/dpichecker/DpiRegionMap.test.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/DpiRegionMap.test.tsx) | A | SKIP DPI: не переносить incoming feature или её tests |
| [src/components/admin/dpichecker/DpiRegionMap.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/DpiRegionMap.tsx) | A | SKIP DPI: не переносить incoming feature или её tests |
| [src/components/admin/dpichecker/HistoryTab.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/HistoryTab.tsx) | A | SKIP DPI: не переносить incoming feature или её tests |
| [src/components/admin/dpichecker/MonitorExtras.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/MonitorExtras.tsx) | A | SKIP DPI: не переносить incoming feature или её tests |
| [src/components/admin/dpichecker/MonitorsHistory.test.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/MonitorsHistory.test.tsx) | A | SKIP DPI: не переносить incoming feature или её tests |
| [src/components/admin/dpichecker/MonitorsTab.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/MonitorsTab.tsx) | A | SKIP DPI: не переносить incoming feature или её tests |
| [src/components/admin/dpichecker/PointDetails.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/PointDetails.tsx) | A | SKIP DPI: не переносить incoming feature или её tests |
| [src/components/admin/dpichecker/PopPicker.test.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/PopPicker.test.tsx) | A | SKIP DPI: не переносить incoming feature или её tests |
| [src/components/admin/dpichecker/PopPicker.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/PopPicker.tsx) | A | SKIP DPI: не переносить incoming feature или её tests |
| [src/components/admin/dpichecker/ScanTabs.test.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/ScanTabs.test.tsx) | A | SKIP DPI: не переносить incoming feature или её tests |
| [src/components/admin/dpichecker/ScanTabs.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/ScanTabs.tsx) | A | SKIP DPI: не переносить incoming feature или её tests |
| [src/components/admin/dpichecker/SetupCard.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/SetupCard.tsx) | A | SKIP DPI: не переносить incoming feature или её tests |
| [src/components/admin/dpichecker/TargetsStep.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/TargetsStep.tsx) | A | SKIP DPI: не переносить incoming feature или её tests |
| [src/components/admin/dpichecker/TotalStep.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/TotalStep.tsx) | A | SKIP DPI: не переносить incoming feature или её tests |
| [src/components/admin/dpichecker/checkView.test.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/checkView.test.ts) | A | SKIP DPI: не переносить incoming feature или её tests |
| [src/components/admin/dpichecker/checkView.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/checkView.ts) | A | SKIP DPI: не переносить incoming feature или её tests |
| [src/components/admin/dpichecker/deepLink.test.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/deepLink.test.ts) | A | SKIP DPI: не переносить incoming feature или её tests |
| [src/components/admin/dpichecker/deepLink.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/deepLink.ts) | A | SKIP DPI: не переносить incoming feature или её tests |
| [src/components/admin/dpichecker/formState.test.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/formState.test.ts) | A | SKIP DPI: не переносить incoming feature или её tests |
| [src/components/admin/dpichecker/formState.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/formState.ts) | A | SKIP DPI: не переносить incoming feature или её tests |
| [src/components/admin/dpichecker/historyStyle.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/historyStyle.ts) | A | SKIP DPI: не переносить incoming feature или её tests |
| [src/components/admin/dpichecker/pollInterval.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/pollInterval.ts) | A | SKIP DPI: не переносить incoming feature или её tests |
| [src/components/admin/dpichecker/popSelection.test.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/popSelection.test.ts) | A | SKIP DPI: не переносить incoming feature или её tests |
| [src/components/admin/dpichecker/popSelection.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/popSelection.ts) | A | SKIP DPI: не переносить incoming feature или её tests |
| [src/components/admin/dpichecker/regionIso.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/regionIso.ts) | A | SKIP DPI: не переносить incoming feature или её tests |
| [src/components/admin/dpichecker/regionMap.test.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/regionMap.test.ts) | A | SKIP DPI: не переносить incoming feature или её tests |
| [src/components/admin/dpichecker/regionMap.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/regionMap.ts) | A | SKIP DPI: не переносить incoming feature или её tests |
| [src/components/admin/dpichecker/testUtils.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/testUtils.tsx) | A | SKIP DPI: не переносить incoming feature или её tests |
| [src/components/admin/dpichecker/useDpiStatus.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/useDpiStatus.ts) | A | SKIP DPI: не переносить incoming feature или её tests |
| [src/components/admin/reachability/GeoMap.test.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/reachability/GeoMap.test.tsx) | A | SKIP BSCHEKER/GEO: прежнее exclusion |
| [src/components/admin/reachability/ModeSwitch.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/reachability/ModeSwitch.tsx) | A | SKIP BSCHEKER/GEO: прежнее exclusion |
| [src/components/admin/reachability/SubscriptionSourcePicker.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/reachability/SubscriptionSourcePicker.tsx) | A | SKIP BSCHEKER/GEO: прежнее exclusion |
| [src/components/admin/reachability/assets/NOTICE.md](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/reachability/assets/NOTICE.md) | A | SKIP BSCHEKER/GEO: прежнее exclusion |
| [src/components/admin/reachability/assets/russia-regions.json](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/reachability/assets/russia-regions.json) | A | SKIP BSCHEKER/GEO: прежнее exclusion |
| [src/components/admin/reachability/geoMapData.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/reachability/geoMapData.ts) | A | SKIP BSCHEKER/GEO: прежнее exclusion |
| [src/components/admin/reachability/geoRegions.test.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/reachability/geoRegions.test.ts) | A | SKIP BSCHEKER/GEO: прежнее exclusion |
| [src/components/admin/userDetail/SubscriptionTab.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/userDetail/SubscriptionTab.tsx) | H | SKIP incoming DPI surface/consumer; существующий Custom код остаётся |
| [src/components/admin/userDetail/SupportDetails.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/userDetail/SupportDetails.tsx) | A | SKIP incoming DPI surface/consumer; существующий Custom код остаётся |
| [src/components/admin/userDetail/activityLabels.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/userDetail/activityLabels.ts) | H | ADAPT Cashera recurrent action labels FR-06 |
| [src/components/admin/userDetail/supportDetailsDpiChecker.test.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/userDetail/supportDetailsDpiChecker.test.tsx) | A | SKIP DPI: не переносить incoming feature или её tests |
| [src/components/broadcasts/BroadcastAudienceEditor.test.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/broadcasts/BroadcastAudienceEditor.test.tsx) | A | ADAPT FR-04; split нового editor при необходимости, retained tests/permissions |
| [src/components/broadcasts/BroadcastAudienceEditor.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/broadcasts/BroadcastAudienceEditor.tsx) | A | ADAPT FR-04; split нового editor при необходимости, retained tests/permissions |
| [src/components/icons/extended-icons.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/icons/extended-icons.tsx) | H | SKIP incoming DPI surface/consumer; существующий Custom код остаётся |
| [src/components/icons/noHandDrawnIcons.test.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/icons/noHandDrawnIcons.test.ts) | A | SKIP incoming DPI surface/consumer; существующий Custom код остаётся |
| [src/components/paymentMethodIconCashera.test.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/paymentMethodIconCashera.test.tsx) | A | ADAPT FR-05 method/QR и meaningful tests; сохранить payment context |
| [src/components/subscription/manage/RecurringPanels.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/subscription/manage/RecurringPanels.tsx) | A | ADAPT Cashera FR-06 в существующий SubscriptionManagement; не добавлять duplicate panel tree |
| [src/components/subscription/purchase/ClassicPurchaseWizard.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/subscription/purchase/ClassicPurchaseWizard.tsx) | H | DEFER incoming Twemoji import; preserve Custom preview/discount/renewal |
| [src/components/subscription/purchase/TariffPurchaseForm.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/subscription/purchase/TariffPurchaseForm.tsx) | H | ADAPT FR-06 types/client/helpers/purchase/state и tests; preserve Custom prices |
| [src/constants/paymentMethods.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/constants/paymentMethods.ts) | U | ADAPT FR-05 method/QR и meaningful tests; сохранить payment context |
| [src/i18n.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/i18n.ts) | H | DEFER Vite/i18n major-related delta FR-08; текущий bootstrap сохраняется |
| [src/lib/twemoji.test.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/lib/twemoji.test.ts) | A | DEFER Vite/i18n major-related delta FR-08; текущий bootstrap сохраняется |
| [src/lib/twemoji.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/lib/twemoji.ts) | A | DEFER Vite/i18n major-related delta FR-08; текущий bootstrap сохраняется |
| [src/locales/en.json](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/locales/en.json) | H | ADAPT retained FR-02..06 keys; SKIP DPI/Lite; сохранить custom keys |
| [src/locales/fa.json](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/locales/fa.json) | H | ADAPT retained FR-02..06 keys; SKIP DPI/Lite; сохранить custom keys |
| [src/locales/ru.json](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/locales/ru.json) | H | ADAPT retained FR-02..06 keys; SKIP DPI/Lite; сохранить custom keys |
| [src/locales/zh.json](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/locales/zh.json) | H | ADAPT retained FR-02..06 keys; SKIP DPI/Lite; сохранить custom keys |
| [src/pages/AdminBroadcastCreate.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/AdminBroadcastCreate.tsx) | H | ADAPT FR-04; split нового editor при необходимости, retained tests/permissions |
| [src/pages/AdminBroadcastDetail.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/AdminBroadcastDetail.tsx) | H | ADAPT FR-04; split нового editor при необходимости, retained tests/permissions |
| [src/pages/AdminBroadcasts.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/AdminBroadcasts.tsx) | H | ADAPT FR-04; split нового editor при необходимости, retained tests/permissions |
| [src/pages/AdminCampaignCreate.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/AdminCampaignCreate.tsx) | H | DEFER Twemoji-only build delta; сохранить текущий screen behavior |
| [src/pages/AdminCampaignEdit.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/AdminCampaignEdit.tsx) | H | DEFER Twemoji-only build delta; сохранить текущий screen behavior |
| [src/pages/AdminDpiChecker.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/AdminDpiChecker.tsx) | A | SKIP DPI: не переносить incoming feature или её tests |
| [src/pages/AdminPanel.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/AdminPanel.tsx) | H | SKIP incoming DPI surface/consumer; существующий Custom код остаётся |
| [src/pages/AdminPromoOfferTemplateEdit.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/AdminPromoOfferTemplateEdit.tsx) | H | DEFER Twemoji-only build delta; сохранить текущий screen behavior |
| [src/pages/AdminReminderEdit.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/AdminReminderEdit.tsx) | H | ADAPT FR-02 и regression tests |
| [src/pages/AdminReminders.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/AdminReminders.tsx) | H | ADAPT FR-02 и regression tests |
| [src/pages/AdminRemnawave.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/AdminRemnawave.tsx) | H | SKIP DPI shortcuts; DEFER Twemoji если есть; preserve existing admin behavior/tests |
| [src/pages/AdminRemnawaveSquadDetail.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/AdminRemnawaveSquadDetail.tsx) | H | DEFER Twemoji-only build delta; сохранить текущий screen behavior |
| [src/pages/AdminServerEdit.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/AdminServerEdit.tsx) | H | DEFER Twemoji-only build delta; сохранить текущий screen behavior |
| [src/pages/AdminServers.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/AdminServers.tsx) | H | DEFER Twemoji-only build delta; сохранить текущий screen behavior |
| [src/pages/AdminTariffCreate.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/AdminTariffCreate.tsx) | H | DEFER Twemoji-only build delta; сохранить текущий screen behavior |
| [src/pages/AdminUserDetail.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/AdminUserDetail.tsx) | H | SKIP DPI shortcuts; DEFER Twemoji если есть; preserve existing admin behavior/tests |
| [src/pages/DashboardLite.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/DashboardLite.tsx) | A | SKIP Lite: прежнее exclusion |
| [src/pages/Info.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/Info.tsx) | H | ADAPT FR-01 через Custom consumers; сохранить InfoNavigation/back/replacements |
| [src/pages/PublicLegal.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/PublicLegal.tsx) | H | ADAPT FR-01 через Custom consumers; сохранить InfoNavigation/back/replacements |
| [src/pages/Subscription.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/Subscription.tsx) | H | DEFER upstream Twemoji delta; FR-06 добавить в Custom management seam отдельно |
| [src/pages/SubscriptionLite.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/SubscriptionLite.tsx) | A | SKIP Lite: прежнее exclusion |
| [src/pages/SubscriptionPurchase.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/SubscriptionPurchase.tsx) | H | ADAPT FR-06 types/client/helpers/purchase/state и tests; preserve Custom prices |
| [src/pages/TopUpAmount.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/TopUpAmount.tsx) | H | ADAPT FR-05 method/QR и meaningful tests; сохранить payment context |
| [src/pages/adminBroadcastCreate.test.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/adminBroadcastCreate.test.tsx) | A | ADAPT FR-04; split нового editor при необходимости, retained tests/permissions |
| [src/pages/adminDpiChecker.test.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/adminDpiChecker.test.tsx) | A | SKIP DPI: не переносить incoming feature или её tests |
| [src/pages/adminReminderEdit.test.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/adminReminderEdit.test.tsx) | H | ADAPT FR-02 и regression tests |
| [src/pages/adminReminders.test.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/adminReminders.test.tsx) | H | ADAPT FR-02 и regression tests |
| [src/pages/adminUserDetail.test.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/adminUserDetail.test.tsx) | A | SKIP DPI shortcuts; DEFER Twemoji если есть; preserve existing admin behavior/tests |
| [src/pages/dashboardLite.test.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/dashboardLite.test.tsx) | A | SKIP Lite: прежнее exclusion |
| [src/pages/recurringFeatureProbing.test.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/recurringFeatureProbing.test.tsx) | H | ADAPT FR-06 types/client/helpers/purchase/state и tests; preserve Custom prices |
| [src/pages/subscriptionLite.test.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/subscriptionLite.test.tsx) | A | SKIP Lite: прежнее exclusion |
| [src/pages/topUpAmountQr.test.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/topUpAmountQr.test.tsx) | A | ADAPT FR-05 method/QR и meaningful tests; сохранить payment context |
| [src/platform/adapters/TelegramAdapter.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/platform/adapters/TelegramAdapter.ts) | H | SKIP unused DPI downloadFile delta; сохранить текущие adapters |
| [src/platform/adapters/WebAdapter.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/platform/adapters/WebAdapter.ts) | H | SKIP unused DPI downloadFile delta; сохранить текущие adapters |
| [src/platform/types.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/platform/types.ts) | H | SKIP unused DPI downloadFile delta; сохранить текущие adapters |
| [src/types/index.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/types/index.ts) | H | ADAPT FR-06 types/client/helpers/purchase/state и tests; preserve Custom prices |
| [src/utils/casheraRecurring.test.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/utils/casheraRecurring.test.ts) | A | ADAPT FR-06 types/client/helpers/purchase/state и tests; preserve Custom prices |
| [src/utils/casheraRecurring.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/utils/casheraRecurring.ts) | A | ADAPT FR-06 types/client/helpers/purchase/state и tests; preserve Custom prices |
| [src/utils/liteStatus.test.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/utils/liteStatus.test.ts) | A | SKIP Lite: прежнее exclusion |
| [src/utils/liteStatus.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/utils/liteStatus.ts) | A | SKIP Lite: прежнее exclusion |
| [src/utils/recurringFeature.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/utils/recurringFeature.ts) | H | ADAPT FR-06 types/client/helpers/purchase/state и tests; preserve Custom prices |
| [tsconfig.node.json](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/tsconfig.node.json) | U | DEFER Vite/i18n major-related delta FR-08; текущий bootstrap сохраняется |
| [vite.config.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/vite.config.ts) | H | DEFER Vite/i18n major-related delta FR-08; текущий bootstrap сохраняется |

## 16. Ledger Bot-коммитов и schema contract

Bot-коммиты не портируются. Действие — read-only contract/runtime review или проверка существующего frontend consumer. Pure formatting/docs/merge записи не становятся требованиями к UI. Все 74 source commits перечислены для воспроизводимости состава range.

| SHA / source | Изменение | Действие |
| --- | --- | --- |
| [83f0f289](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/83f0f28978faa54c8786134f4c63e0e1d0b2b247) | feat(webapi): таймлайн активности пользователя во внешнем API | RECORD/VERIFY: external API, нет нового соответствующего Cabinet UI в target |
| [0007fa9c](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/0007fa9ca411e5428a88304e7cf068fa2347802b) | style: формат по ruff и справочник структуры под новый сервис | RECORD: formatting/docs, не новые UI requirements |
| [1201810b](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/1201810b713e36a481085bf8a77ef398a8f40fa3) | feat(webapi): галерея вложений доезжает до внешнего API | RECORD/VERIFY: external API, нет нового соответствующего Cabinet UI в target |
| [b8f5aa6d](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/b8f5aa6d0ada79a919b99f1b2ab901716da8026a) | feat: интеграция с внешним антифрод-сервисом | RECORD/VERIFY: external API, нет нового соответствующего Cabinet UI в target |
| [9d31bff9](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/9d31bff9eb98f8fae08b1121e97f7982c722b937) | docs: подключение внешнего антифрод-сервиса | RECORD/VERIFY: external API, нет нового соответствующего Cabinet UI в target |
| [e8271931](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/e8271931104eb5b1847359bd6c2ea8bda4d33e90) | style: формат и порядок импортов по ruff | RECORD: formatting/docs, не новые UI requirements |
| [64c72b16](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/64c72b169e211efda52e3896eed7db2c1332ff2d) | chore: справочник структуры и замечания линтера | RECORD: formatting/docs, не новые UI requirements |
| [240be37e](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/240be37e96a1e88ba007b564c6bb080df65e0dfc) | chore: справочник структуры без локальной папки локалей | RECORD: formatting/docs, не новые UI requirements |
| [de0285dd](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/de0285dd10fb981ba65f551ded4d0ec652cec59e) | chore(changelog): убрать повторы в разделе 4.15.0 | RECORD: formatting/docs, не новые UI requirements |
| [57afbc7f](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/57afbc7ff2833217cbbf33b46dece882084de637) | feat(dpichecker): настройки и права раздела DPI//CHECKER | EXCLUDED FRONTEND: official Bot сохраняется целиком; 0128 не вырезать |
| [4329229a](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/4329229af35a3873b1188cf94ba69e0884e6da62) | feat(dpichecker): клиент API и фикстуры живых ответов | EXCLUDED FRONTEND: official Bot сохраняется целиком; 0128 не вырезать |
| [8caf8409](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/8caf8409de014b2a4d463dffd089fed2afe73daa) | feat(dpichecker): своя запись действий (миграция 0128) | EXCLUDED FRONTEND: official Bot сохраняется целиком; 0128 не вырезать |
| [8f6ab0c4](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/8f6ab0c4fa1c1280c004addd5ff347bedad7feec) | feat(dpichecker): округа точек и компактный вид результата | EXCLUDED FRONTEND: official Bot сохраняется целиком; 0128 не вырезать |
| [3b71445f](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/3b71445fe70c541ec4609a67606367a2029fa1d9) | feat(dpichecker): цели из панели — подписка пользователя, хосты, ноды | EXCLUDED FRONTEND: official Bot сохраняется целиком; 0128 не вырезать |
| [b3f08b0a](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/b3f08b0a1ca427e9648f5ebd385badebfaabbf77) | feat(dpichecker): запуск, проверка и отмена через фасад | EXCLUDED FRONTEND: official Bot сохраняется целиком; 0128 не вырезать |
| [88871a71](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/88871a71b86747b236604317de7fa76e28c3d8d2) | feat(dpichecker): Зонд, Соседи, Черемша и мониторы через фасад | EXCLUDED FRONTEND: official Bot сохраняется целиком; 0128 не вырезать |
| [fcfe305d](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/fcfe305d35f9852063be307ff39cd63cb9bdd02b) | feat(dpichecker): ручки кабинета /admin/dpichecker | EXCLUDED FRONTEND: official Bot сохраняется целиком; 0128 не вырезать |
| [9e32b54f](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/9e32b54f9e6948b1445797dccedd6f057866209b) | feat(dpichecker): итоги мониторов админам — обходчик и вебхук | EXCLUDED FRONTEND: official Bot сохраняется целиком; 0128 не вырезать |
| [c50bccda](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/c50bccdac56ccaaf7e5d23cdbe604ccde6c0847c) | chore(dpichecker): справочник структуры | RECORD: formatting/docs, не новые UI requirements |
| [09ff21b4](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/09ff21b4e3caa81d536a6ecf1df594f4d3bee428) | fix(dpichecker): замечания ревью — дубли мониторов, повтор запуска, ключи в именах, включение на ходу | EXCLUDED FRONTEND: official Bot сохраняется целиком; 0128 не вырезать |
| [f8fed4f3](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/f8fed4f3cd78425dccb4672690194b36b0cb11f0) | feat(dpichecker): пустой выбор хостов и нод — список для выбора в кабинете | EXCLUDED FRONTEND: official Bot сохраняется целиком; 0128 не вырезать |
| [1b0433a3](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/1b0433a31797095e5843d43c16cad64d4998fe7c) | fix(logging): ошибки stdlib-логгеров доезжают до админ-чата с текстом и traceback | VERIFY: retained payment/media/admin/reliability contract; без backend edits |
| [79faa652](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/79faa652279be5270a321f74d218e20098d406ec) | feat(dpichecker): замечания владельца — подписка по умолчанию, история, без трат по админам | EXCLUDED FRONTEND: official Bot сохраняется целиком; 0128 не вырезать |
| [5d922f92](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/5d922f92d86ad585a8ec9a894ac712b260b073ba) | feat(dpichecker): CSV в Mini App, мониторы с сайта под управлением, быстрый статус | EXCLUDED FRONTEND: official Bot сохраняется целиком; 0128 не вырезать |
| [f733cc29](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/f733cc29424b58a395aa16074920a58dbe4ba261) | fix(links): внешние ссылки на файлы — схема и хост из заголовков прокси | VERIFY: retained payment/media/admin/reliability contract; без backend edits |
| [2cdbe86f](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/2cdbe86f30f9dc74b9a6dc18b1ab82ae8ffacc11) | fix(balance): explain how to retry an invalid top-up amount | VERIFY: retained payment/media/admin/reliability contract; без backend edits |
| [41130619](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/41130619232bfd14bb7f8378646b1f98d559309a) | feat(dpichecker): API сервиса целиком — весь аккаунт, отчёт по точке, журнал уведомлений, мониторы в группу | EXCLUDED FRONTEND: official Bot сохраняется целиком; 0128 не вырезать |
| [a9960fce](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/a9960fce101a635e69dfb12d938e90bee41d8d32) | feat: evaluate broadcast audience rules at send time | CONTRACT: FR-04, server rules/RBAC/0129; frontend не вычисляет recipients |
| [8b005bf6](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/8b005bf675d7d4eaaa1b0fe3347143a9c48b57c0) | fix: include missing activity in negated audiences | CONTRACT: FR-04, server rules/RBAC/0129; frontend не вычисляет recipients |
| [cd1d3e8d](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/cd1d3e8d0b5241806176d6c31cc3debba3e2dc23) | fix: compile long broadcast audience rules iteratively | CONTRACT: FR-04, server rules/RBAC/0129; frontend не вычисляет recipients |
| [269723fa](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/269723fa53d9551c11c3df2eee8bc57a3acd7bf8) | feat: add atomic broadcast audience filters and user search | CONTRACT: FR-04, server rules/RBAC/0129; frontend не вычисляет recipients |
| [ea8be74c](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/ea8be74cf40959e39594292114a2021dfaee16c1) | fix: include all matching users in audience suggestions | CONTRACT: FR-04, server rules/RBAC/0129; frontend не вычисляет recipients |
| [11af434a](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/11af434a11536c2983f656640b904c3adf673cc7) | fix: include live trials and normalize missing broadcast traffic | CONTRACT: FR-04, server rules/RBAC/0129; frontend не вычисляет recipients |
| [76b2b549](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/76b2b549d78d5ba8f50400ace66b5447d6fa331b) | fix(broadcast): integrate atomic audiences with upstream dev | CONTRACT: FR-04, server rules/RBAC/0129; frontend не вычисляет recipients |
| [83bda636](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/83bda6365f73305657ba600a50d6f57390a43e8a) | docs(broadcast): describe rule-based audience delivery | CONTRACT: FR-04, server rules/RBAC/0129; frontend не вычисляет recipients |
| [bf6236b8](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/bf6236b8180633a7e3b92375cc7406b35a9a6043) | fix(cabinet): документы кабинета откатываются на язык по умолчанию, если текста нет | CONTRACT: FR-01 legal fallback; проверить server response |
| [b9a02ad0](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/b9a02ad04b00702e5b973fb8469c70fe7784e81f) | fix(tribute): не терять оплату — транзакция и зачисление одним коммитом, ошибка = 5xx для повтора вебхука, тревога вместо тихого лога | VERIFY: retained payment/media/admin/reliability contract; без backend edits |
| [b82b8ce4](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/b82b8ce4c96ef8e9be0dfeda46890b7d755f3632) | feat(menu): живое главное меню — бот сам обновляет последнее rich-меню при смене трафика, статуса, устройств и баланса | VERIFY BOT: живое Telegram menu/Redis behavior, не новый Cabinet polling |
| [222a1841](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/222a1841c0d288e3569f8490bdc3a47d7ec143bf) | Merge pull request #3266 from Case211/feat/webapi-user-activity | RECORD: composition/metadata, без самостоятельного frontend переноса |
| [e9eade11](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/e9eade11bfc1a9f83ae42c2cd7658f5e72d9e78d) | Merge remote-tracking branch 'origin/dev' into pr-3269 | RECORD: composition/metadata, без самостоятельного frontend переноса |
| [c5d78817](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/c5d78817d8d8e0570b2eb6f6bfaf8c8a1ee6ec17) | Merge pull request #3269 from Case211/feat/webapi-ticket-media-items | RECORD: composition/metadata, без самостоятельного frontend переноса |
| [3efc0693](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/3efc0693c9602dab4ce2ca434091a039489368d2) | Merge remote-tracking branch 'origin/dev' into pr-3270 | RECORD: composition/metadata, без самостоятельного frontend переноса |
| [8d5c8071](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/8d5c80719197fa1e46bde87d52abbf0a8ebb3bc7) | fix(abuse): письма только на подтверждённый адрес, кривой ответ сервиса не роняет экраны | RECORD/VERIFY: external API, нет нового соответствующего Cabinet UI в target |
| [0aed0a22](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/0aed0a22911a141db360d2dd08777f9c2d608c3b) | Merge pull request #3270 from Case211/feat/external-abuse-api | RECORD: composition/metadata, без самостоятельного frontend переноса |
| [ddaa5b4f](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/ddaa5b4fe387bfa2472aa612463521559d5f1e0a) | Merge pull request #3283 from NerRobDog/fix/logging-notifier-event-dict-snapshot | RECORD: composition/metadata, без самостоятельного frontend переноса |
| [92eaa5a3](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/92eaa5a3970a7976ecef6ee64eb9bbbca6927977) | Merge pull request #3284 from xNIDINx/codex/topup-amount-retry-pr | RECORD: composition/metadata, без самостоятельного frontend переноса |
| [adf98e13](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/adf98e13c2fa22e98cfd38e8b1041d283e56c009) | Merge remote-tracking branch 'origin/dev' into pr-3285 | RECORD: composition/metadata, без самостоятельного frontend переноса |
| [835a059c](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/835a059cee2ffc06280042fc1d2ec8d621350961) | fix(broadcast): люди из аудитории — только с правом на карточки пользователей | CONTRACT: FR-04, server rules/RBAC/0129; frontend не вычисляет recipients |
| [c16b8d65](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/c16b8d657ad540f390bb3ef5485ac2a62437792b) | Merge pull request #3285 from mitetenov/feat/precise-broadcast-audience-upstream | RECORD: composition/metadata, без самостоятельного frontend переноса |
| [eb8c4ab3](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/eb8c4ab3dd4307b8487ff31852f27f803ea6b023) | Merge remote-tracking branch 'origin/dev' into pr-3287 | RECORD: composition/metadata, без самостоятельного frontend переноса |
| [a31f0ec8](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/a31f0ec8f6f1766a4b97c306eb1eada207673315) | fix(cabinet): правила откатываются на язык по умолчанию и при пустой строке | CONTRACT: FR-01 legal fallback; проверить server response |
| [13601612](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/1360161247bd2bbc66659c51d851c02d06e5d005) | Merge pull request #3287 from iLuckyGUY/fix/cabinet-info-language-fallback | RECORD: composition/metadata, без самостоятельного frontend переноса |
| [6a4713a6](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/6a4713a6eb51ada6f1be314af4d3501d9156554b) | Merge remote-tracking branch 'origin/dev' into pr-3290 | RECORD: composition/metadata, без самостоятельного frontend переноса |
| [9cef7e68](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/9cef7e680488d522d7147aa9cb1596d4091a54e8) | fix(tribute): после зачисления не отвечать 5xx, тревога только за донаты | VERIFY: retained payment/media/admin/reliability contract; без backend edits |
| [7688b1c6](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/7688b1c68a2585598e29c7acf3bcf07ff5ff0c2c) | Merge pull request #3290 from chudo-arky/fix/tribute-payment-not-lost | RECORD: composition/metadata, без самостоятельного frontend переноса |
| [028980ac](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/028980ac5e7ac29ca2f6df44e5cebd18a1900153) | Merge remote-tracking branch 'origin/dev' into pr-3291 | RECORD: composition/metadata, без самостоятельного frontend переноса |
| [05e70c2d](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/05e70c2d63a16848c613597996015dd84218c96c) | perf(live-menu): ключи живых меню через SCAN, а не KEYS | VERIFY BOT: живое Telegram menu/Redis behavior, не новый Cabinet polling |
| [545b22bc](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/545b22bcac2882abfa0cee2d7a73b68543911aba) | Merge pull request #3291 from chudo-arky/feat/live-menu | RECORD: composition/metadata, без самостоятельного frontend переноса |
| [34dff22b](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/34dff22b46bf2c4d5518089a164415be001e6904) | fix(panel): сброс триала в мультитарифе стирает у человека id удалённого аккаунта | VERIFY: retained payment/media/admin/reliability contract; без backend edits |
| [037a8255](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/037a825537827f834b275f49a2f636fda62a97b2) | fix(redis): ожидающий пул соединений и его размер из .env | VERIFY: retained payment/media/admin/reliability contract; без backend edits |
| [e1db5624](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/e1db56242c06aac716871a07b3338b7176fd3a80) | fix(reminders): условие «способ входа» не сводит vk_id (BIGINT) с пустой строкой | VERIFY: reminders error/parity FR-02; dispatcher logic не портировать |
| [bc982703](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/bc982703182a9bc78b949f0f119b19c3a6dee80d) | fix(reminders): сбой одного напоминания не роняет список админки и проход рассылки | VERIFY: reminders error/parity FR-02; dispatcher logic не портировать |
| [38b8d572](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/38b8d5720ed53dce0a3ccf1107aa714bd59d6166) | feat(payments): платёжная система Cashera для пополнения баланса | CONTRACT: FR-05/06, balance/status/refund/recurring и 0130/0131 |
| [46de12c1](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/46de12c19224c518c7f68b79101010e5445aabe0) | feat(cashera): возврат и чарджбэк по зачисленному платежу списывают баланс | CONTRACT: FR-05/06, balance/status/refund/recurring и 0130/0131 |
| [7a589897](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/7a5898971064f353ad961eb9b0f5d128b4d9dde2) | feat(cashera): свой экран оплаты (H2H) — QR в боте и кабинете | CONTRACT: FR-05/06, balance/status/refund/recurring и 0130/0131 |
| [99324bbc](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/99324bbc7188304668b8dfdcdbb9c2456a71dad9) | feat(cashera): автопродление подписки через подписки Cashera (sbp_recurring) | CONTRACT: FR-05/06, balance/status/refund/recurring и 0130/0131 |
| [0d232da7](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/0d232da7037201626d80ccbe9003c0062c9b2284) | fix: алерты CodeQL релизного PR — слабый хеш ключа DPI//CHECKER и кольца импортов | EXCLUDED FRONTEND: official Bot сохраняется целиком; 0128 не вырезать |
| [8a5030ef](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/8a5030efe990e6e10e92b138b9443bdb83d8eaa1) | Merge pull request #3292 from BEDOLAGA-DEV/dev | RECORD: composition/metadata, без самостоятельного frontend переноса |
| [b8866f34](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/b8866f34be22d3d12a8c094a3030380b29612b5a) | chore(main): release 4.16.0 | RECORD: composition/metadata, без самостоятельного frontend переноса |
| [e31831f5](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/e31831f5e24892ba97dfe341b00eb748e4dce59d) | Merge pull request #3293 from BEDOLAGA-DEV/release-please--branches--main | RECORD: composition/metadata, без самостоятельного frontend переноса |
| [4b787516](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/4b7875162a8bef394e1b096d9e65179d6683d4a9) | Релиз: PostgreSQL 18, Python 3.14, обновления зависимостей (#3303) | RUNTIME: B10, новый dependency/compose/schema proof; backend не редактировать |
| [8eea9a98](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/8eea9a98c3a37c1463f0f7bdc777c1828e9a6841) | chore: перезапуск CI — GitHub не запустил workflow на 4b787516 | RECORD: composition/metadata, без самостоятельного frontend переноса |
| [600b07c6](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/600b07c6203670cef56b05eabe622d6030da1c3d) | chore(main): release 5.0.0 | RECORD: composition/metadata, без самостоятельного frontend переноса |
| [5bda3c56](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/5bda3c56f0afd9f4813e9c6fa48934948b05ebae) | Merge pull request #3304 from BEDOLAGA-DEV/release-please--branches--main | RECORD: composition/metadata, без самостоятельного frontend переноса |

| Migration | Что добавляет официальный source | Значение для адаптации |
| --- | --- | --- |
| `0128_dpichecker_actions` | Audit/actions внешнего DPI//CHECKER | Frontend исключён; official chain сохраняется |
| `0129_broadcast_audience` | Nullable JSON `broadcast_history.audience` | Новый editor/history требует применения official migration |
| `0130_create_cashera_payments` | Cashera payment records | Payment/status/refund данные остаются серверными |
| `0131_add_cashera_subscriptions` | Recurring records, interval/charge/amount/state и uniqueness | Новый recurring contract; источник схемы — Bot, не Custom Cabinet |

Наличие source upgrade/downgrade функций не доказывает выполненный upgrade, финансовую безопасность или rollback. Проверки этой задачи — исследование и документация.

Рекомендуемый уровень рассуждения для следующей задачи: очень высокий — нужно сохранить кастомные финансовые сценарии и проверить новые API на неизменённом Bot, не смешивая frontend с инфраструктурным переходом.
