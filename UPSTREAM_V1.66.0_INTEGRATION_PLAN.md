# План интеграции Upstream Cabinet v1.66.0

Статус: `локальный source gate пройден; compatibility gate заблокирован`

Дата анализа: `2026-08-22`

Область: Custom Cabinet, совместимый Upstream Bot и новый Release Bundle

Подробное исследование: [`UPSTREAM_V1.66.0_RESEARCH.md`](UPSTREAM_V1.66.0_RESEARCH.md)

## 1. Цель

Перенести функциональные, контрактные, security/privacy, Telegram,
localization и accessibility-изменения Upstream Cabinet `v1.66.0` в Custom
Cabinet без потери нашего unified Dashboard, navigation, branding, design
system, responsive overlays и уже проверенных пользовательских сценариев.

Интеграция не является заменой дерева Custom Cabinet upstream-архивом. Для
каждого затронутого файла используется трёхстороннее сравнение:

1. предыдущий точный Upstream Cabinet SHA;
2. новый точный Upstream Cabinet SHA;
3. текущий принимающий commit Custom Cabinet.

## 2. Зафиксированные идентичности

| Компонент | Текущая точка | Целевая точка |
| --- | --- | --- |
| Upstream Cabinet | `v1.65.0` / `b866bebeeb6032db4baa3869a4917316fe8e0453` | `v1.66.0` / `2192484b011068d8cb75c61a6aeaada1d06115aa` |
| Custom Cabinet | `main` / `c1ddbf39b145b298fbc0af0557fd26ef70a83c5e` | Новый commit после интеграции и gate |
| Последний product commit | `cabinet-v2026.08.22.2` / `23c9889f6ab1ad514faf36ad9cbf66dc5407ad44` | Новый immutable Custom Cabinet tag |
| Upstream Bot | `v4.0.0` / `f553d1896dcd347fd74012f6394fd2277161bdd1` | Минимум `v4.1.0` / `49b05d5ab79dd9bb92f0404bb0066cda8a175649` |
| Installer | `v2026.08.18` / `8d5feb922958f6d3deed0f837060059d1919b356` | Тот же SHA допустим, но нужен новый lifecycle proof и новый Bundle tag |
| Rollback Release Bundle | `v2026.08.18` | Новый immutable Release Bundle после полного gate |

Тег Upstream Cabinet `v1.66.0` является lightweight-тегом и прямо указывает
на target commit. Диапазон `v1.65.0..v1.66.0` содержит 45 коммитов и меняет 53
файла: 3 554 добавления и 507 удалений.

Из 53 upstream-файлов:

- 18 также изменены в Custom Cabinet и требуют ручного трёхстороннего review;
- 12 существуют локально без отклонения от `v1.65.0`;
- 23 являются новыми upstream-файлами и пока отсутствуют в Custom Cabinet.

## 3. Решения по границам

1. Перенести весь функциональный диапазон `v1.66.0`, включая Telegram auth,
   guest purchase, Dashboard devices, support errors, admin sort/delete,
   promocode traffic и GeoCheck.
2. Сохранить Custom Cabinet presentation. Upstream JSX используется как
   описание новых состояний и поведения, а не как готовая замена наших страниц.
3. Не добавлять upstream `ResponsiveSheet`. Новые responsive dialogs и sheets
   строить через существующий
   `src/components/primitives/ResponsiveOverlay/ResponsiveOverlay.tsx`.
4. Сохранить unified Dashboard, четыре пункта navigation и compatibility URL,
   реализованные через `src/utils/userCabinetRouteState.ts`.
5. Не смешивать синхронизацию с редизайном, массовым форматированием,
   перемещением файлов или несвязанным обновлением зависимостей.
6. Сохранить все точные upstream URL, SHA, `LICENSE` и technical attribution.
7. Не обновлять `UPSTREAM.md` и `COMPATIBILITY.md` до завершения интеграции и
   успешного применимого gate.
8. Удаление активной платной подписки не должно отправлять `force=true` после
   обычного inline-подтверждения. Для него требуется отдельный destructive
   dialog с названием подписки и ясным предупреждением об отмене связанных
   автоплатежей.
9. GeoCheck включается в source-интеграцию, но его runtime sign-off требует
   Upstream Bot `v4.1.0` и Remnawave panel/node `3.3.0+`.

## 4. Матрица интеграции

| Группа | Основные файлы | Решение | Обязательная проверка |
| --- | --- | --- | --- |
| Telegram init data | `src/utils/telegramInitData.ts`, `src/api/client.ts`, `src/main.tsx`, `src/hooks/useTelegramSDK.ts`, `src/vite-env.d.ts` | Перенести helper и тесты; вручную встроить его в локальные bootstrap, token и health flows | Unit cases для bridge/SDK/stale/equal/error; Telegram iOS/Android smoke |
| Ручной вход через Telegram-бота | `src/components/TelegramLoginButton.tsx` | Адаптировать manual deep-link flow, polling, возврат к widget и referral state к текущему Login | Playwright для manual login, retry, back-to-widget и widget failure |
| Guest purchase и privacy | `src/api/landings.ts`, `src/pages/QuickPurchase.tsx`, `src/utils/campaign.ts`, новый `contactPrefill.ts` | Добавить `campaign_slug`; удалить `?contact=` при самом раннем client bootstrap до аналитики и последующих API-запросов; отдельно проверить redaction query в proxy/access logs | Unit URL/storage/hash; Playwright для payload, очищенного URL и последующих Referer |
| Support и ticket messages | `src/pages/Support.tsx`, `src/pages/AdminTickets.tsx`, `src/components/admin/userDetail/TicketsTab.tsx`, новый `ticketErrors.ts` | Показать backend errors, отдельно обработать `409`, переносить длинные URL/base64 во всех трёх renderer | Mutation error tests и browser overflow check на 320/375 px |
| Dashboard devices | `src/pages/Dashboard.tsx`, subscription/dashboard components, `connectFooterState.ts` | Перенести state machine; встроить действия в текущие subscription cards и существующий devices overlay; не импортировать upstream layout целиком | Свободный слот, полный лимит, unlimited, loading, delete device, connection, Back/focus |
| Admin user sort | `src/api/adminUsers.ts`, `src/pages/AdminUsers.tsx` | Добавить `subscription_end_date` и опцию сортировки без изменения текущей таблицы | Query value и сброс pagination offset |
| Admin subscription delete | `src/api/adminUsers.ts`, `src/pages/AdminUserDetail.tsx`, `SubscriptionTab.tsx` | Добавить endpoint и безопасный confirmation flow; сохранить RBAC и локальную вкладку | Trial delete, paid delete с отдельным force-confirm, 409/404, permission denial |
| Promocode traffic | `src/api/promocodes.ts`, `AdminPromocodeCreate.tsx`, `AdminPromocodes.tsx` | Добавить `traffic_gb`; адаптировать форму и list state к локальной реализации | TDD: traffic-only, mixed bonus, create/edit, validation, old records |
| GeoCheck | `src/api/adminRemnawave.ts`, `src/pages/AdminRemnawave.tsx`, новые `src/components/admin/remnawave/*`, `nodeVersion.ts` | Перенести API, route validation, polling и reports; заменить upstream portal/sheet на Custom Cabinet overlay; проверить read/manage permissions | Node 3.2/3.3, default route с body `{}`, IP/interface, success/failure/timeout, RBAC, Telegram restrictions |
| Localization | `src/locales/en.json`, `fa.json`, `ru.json`, `zh.json` | Добавить только ключи реально перенесённых функций; не заменять локальные locale-файлы целиком | Одинаковая key structure, RU/EN и RTL smoke |
| Dependency | `package.json`, `package-lock.json` | Добавить только `react-zoom-pan-pinch@4.0.4`, требуемый GeoCheck; сохранить локальные dependency versions и scripts | Lockfile review, clean `npm ci`, build chunk review |
| Metadata | `package.json`, `CHANGELOG.md`, `UPSTREAM.md`, `COMPATIBILITY.md` | После gate записать baseline `v1.66.0`, Custom Cabinet version и фактически перенесённые изменения | Exact SHA, provenance, compatibility и no-unrelated-diff review |

## 5. Порядок реализации

### Этап 0. Подготовка

Где: Git и документация в `custom-cabinet/`.

1. Создать ветку `sync/upstream-v1.66.0` от
   `c1ddbf39b145b298fbc0af0557fd26ef70a83c5e`.
2. Создать рабочий sync report из `UPSTREAM_SYNC_REPORT_TEMPLATE.md`.
3. Внести в report все 45 upstream-коммитов и классифицировать каждый как
   direct port, adapted port, skipped или blocked.
4. Зафиксировать 18 overlapping files отдельной file-level conflict matrix.
5. Записать intended Upstream Bot `v4.1.0` exact SHA, но не объявлять пару
   совместимой до runtime gate.

Результат: reviewable scope до первого изменения source-кода.

### Этап 1. Regression Tests First

Где: Vitest и Playwright tests в `custom-cabinet/src/**/*.test.ts` и
`custom-cabinet/tests/e2e/`.

Сначала добавить падающие тесты для:

1. выбора более свежего Telegram `initData` между SDK cache и bridge;
2. чтения и удаления `?contact=` при самом раннем client bootstrap с
   сохранением остальных query и hash; отдельно зафиксировать, что начальный
   HTTP request уже содержит параметр и требует server-side log redaction;
3. отправки `campaign_slug` при guest purchase;
4. показа ошибок создания ticket/reply и поведения `409`;
5. состояния connect footer при свободном и заполненном device limit;
6. `traffic_gb` create/edit payload и validation;
7. admin delete без force и с отдельным force-confirm;
8. GeoCheck default route с body `{}`, IP/interface validation, version gate и
   polling timeout.

Результат: тесты доказывают отсутствие требуемого поведения до реализации и
защищают от регрессий Custom Cabinet.

### Этап 2. Security, Privacy и Platform

Где: `src/utils/`, `src/api/client.ts`, `src/main.tsx`,
`src/hooks/useTelegramSDK.ts`, `src/components/TelegramLoginButton.tsx`.

1. Добавить общий `telegramInitData` helper и заменить прямое чтение
   `retrieveRawInitData()` в трёх upstream-sensitive точках.
2. Сохранить текущий порядок health check, stale session cleanup, token storage
   и Telegram startup.
3. Добавить manual deep-link login как альтернативу widget, не меняя формат
   `webauth_{token}`.
4. Добавить contact prefill и удалить PII из URL до client analytics и
   последующих API requests. Начальный document request frontend изменить не
   может, поэтому server/proxy logs проверяются отдельно.

Результат: security/privacy fixes из upstream работают без потери локальной
auth recovery.

### Этап 3. API Contracts и Low-Level Behavior

Где: `src/api/`, новые pure utilities и их unit tests.

1. Добавить `campaign_slug` в guest purchase payload.
2. Добавить admin user sort value и delete-subscription endpoint.
3. Добавить `traffic_gb` в promocode types и payloads.
4. Добавить GeoCheck start/result types и endpoints.
5. Добавить node IP/version helpers, ticket error normalization и connect footer
   state machine.

Результат: UI получает небольшие проверенные контракты до visual adaptation.

### Этап 4. User Flows

Где: `QuickPurchase.tsx`, `Support.tsx`, `Dashboard.tsx` и существующие Custom
Cabinet components.

1. Встроить campaign/contact behavior в текущий Quick Purchase без изменения
   price, currency, payment method и redirect logic.
2. Встроить ticket error handling и long-message wrapping в текущий Support.
3. Встроить device connect/manage behavior в unified Dashboard.
4. При полном лимите открывать существующий devices overlay вместо disabled CTA.
5. Сохранить compatibility routes, selected subscription и Connection wizard
   Back behavior.

Результат: пользователь получает новые сценарии в текущем интерфейсе Custom
Cabinet.

### Этап 5. Admin Flows

Где: Admin users, promocodes и Remnawave pages/components.

1. Добавить сортировку по окончанию подписки.
2. Добавить удаление конкретной подписки с RBAC и усиленным подтверждением.
3. Добавить `traffic_gb` в создание, редактирование и список промокодов.
4. Добавить GeoCheck к существующим node cards без замены текущего
   AdminRemnawave layout.
5. Для GeoCheck использовать Custom Cabinet overlay, platform guards и
   локализованные error/loading/timeout states.

Результат: admin-функции доступны только с корректными permissions и не ломают
существующие таблицы, вкладки и Remnawave metrics.

### Этап 6. Localization, Dependency и Documentation

Где: locale-файлы, package metadata и upstream records.

1. Синхронно добавить ключи в `ru`, `en`, `fa`, `zh`.
2. Добавить `react-zoom-pan-pinch@4.0.4` штатной npm-командой и проверить только
   ожидаемый lockfile diff.
3. После source gate обновить Custom Cabinet package version/changelog.
4. После полного compatibility gate обновить `UPSTREAM.md`,
   `COMPATIBILITY.md`, sync report и при необходимости `INTERFACE_MAP.md`.

Результат: reproducible build и точная provenance без преждевременного
объявления совместимости.

## 6. Предлагаемые commits

Каждый commit должен ссылаться на соответствующие upstream SHA в sync report.

1. `test(sync): cover v1.66.0 auth and privacy behavior`
2. `sync(upstream): port Telegram init data fixes`
3. `sync(upstream): port guest purchase attribution`
4. `sync(upstream): surface support ticket errors`
5. `sync(upstream): align v1.66.0 API contracts`
6. `adapt(ui): add device actions to unified dashboard`
7. `adapt(admin): add subscription and promocode controls`
8. `adapt(admin): add Remnawave GeoCheck`
9. `sync(i18n): add v1.66.0 locale keys`
10. `docs(upstream): record v1.66.0 integration`

При практической реализации соседние commits можно объединить, если это
уменьшает промежуточно сломанные состояния, но auth/privacy, Dashboard, Admin и
documentation не должны превращаться в один непрозрачный commit.

## 7. Локальный Gate

Где: чистая committed рабочая копия `custom-cabinet/`.

Выполнить:

```bash
npm ci
npm run check
npm test
npm run type-check
npm run build
npm run test:e2e
```

Дополнительно проверить:

1. production chunks и отсутствие неожиданного роста GeoCheck dependency;
2. отсутствие console errors и неожиданных 4xx/5xx;
3. 320, 375, 768, 1024 и 1280+ px;
4. dark, light и operator-defined palette;
5. Russian, English и Persian RTL;
6. keyboard, focus trap, Escape/Back и focus return;
7. reduced motion и 200% browser zoom;
8. отсутствие build output, screenshots, `.env`, logs и agent data в Git.

## 8. Compatibility Gate

### Upstream Bot

Где: isolated test environment с exact Upstream Bot `v4.1.0` SHA
`49b05d5ab79dd9bb92f0404bb0066cda8a175649`.

Проверить:

1. штатные Bot tests;
2. database migration `v4.0.0 -> v4.1.0` на тестовой копии;
3. восстановление pre-update dump и повторный запуск `v4.0.0`;
4. пять новых server contracts: sort, delete subscription, `traffic_gb`,
   campaign attribution и GeoCheck;
5. сохранение существующих Cabinet API, auth, payment и WebSocket contracts.

### Installer и Release Bundle

Смена Upstream Bot SHA является сменой защищённой identity. Поэтому lifecycle
proof Installer `v2026.08.18` остаётся полезным baseline, но не может быть
переиспользован как доказательство нового Bundle.

Нужно:

1. сохранить Installer SHA `8d5feb922958f6d3deed0f837060059d1919b356`,
   если его код не меняется;
2. выполнить новый полный disposable Ubuntu 24.04 lifecycle gate;
3. отдельно проверить Protected Update от Release Bundle `v2026.08.18` к
   candidate с rollback injection и затем с `outcome=committed`;
4. собрать Cabinet artifact дважды и доказать byte-identical checksum;
5. выпустить только новый immutable Custom Cabinet tag и новый immutable Release
   Bundle tag;
6. после публикации повторно проверить exact public assets и targeted smoke
   установки опубликованного Bundle.

## 9. Staging Live Check

Где: staging, максимально повторяющий production, с sandbox providers,
тестовым Telegram-ботом и изолированными accounts/data.

Обязательные новые сценарии:

1. Telegram manual login, widget fallback и выбор свежего `initData`;
2. guest purchase с `?contact=`, очищенным URL и `campaign_slug`;
3. multi-subscription Dashboard: connect, full device limit, delete device;
4. ticket create/reply failures и длинные сообщения;
5. admin sort по сроку подписки;
6. delete trial subscription и отдельно paid subscription с force-confirm;
7. promocode `traffic_gb`, включая mixed bonus;
8. GeoCheck default route с body `{}`, IP/interface, success, failure, timeout,
   version gate и RBAC;
9. Telegram GeoCheck без fullscreen/download;
10. все прежние critical flows: Login, Dashboard, Subscription, Connection,
    read-only Balance, Profile, restricted Admin и WebSocket recovery.

Для GeoCheck фактические Remnawave panel и тестовые nodes должны быть `3.3.0+`.
Если такой environment отсутствует, GeoCheck runtime result остаётся `BLOCKED`,
а не `PASS`.

Реальный платёж запрещён. Используются sandbox или безопасная имитация.

## 10. Rollback

Последний доказанный rollback source:

| Часть | Exact source |
| --- | --- |
| Release Bundle | `v2026.08.18` |
| Installer | `8d5feb922958f6d3deed0f837060059d1919b356` |
| Upstream Bot | `v4.0.0` / `f553d1896dcd347fd74012f6394fd2277161bdd1` |
| Custom Cabinet | `cabinet-v2026.08.22.2` / `23c9889f6ab1ad514faf36ad9cbf66dc5407ad44` |
| Cabinet artifact SHA-256 | `e778f7f2106b0fc83e9a3cebc90f4ba616e1e5ebbe20713e6941d12c98863739` |

До production rollout дополнительно нужны:

1. проверенный pre-update PostgreSQL dump;
2. исходная и целевая Alembic revision;
3. доказанный rollback после неудачной migration;
4. отдельный late-recovery plan после уже committed update;
5. health/Login smoke после восстановления старого Bundle.

## 11. Definition of Done

Интеграция source завершена, когда:

- все 45 incoming commits классифицированы;
- по всем 53 changed files записано решение;
- все ported/adapted tests проходят;
- все skipped или blocked изменения имеют причину;
- Custom Cabinet design и critical flows сохранены;
- `UPSTREAM.md` указывает exact `v1.66.0` SHA;
- sync report и changelog завершены;
- рабочая копия чистая и не содержит запрещённых артефактов.

Release Bundle готов, когда дополнительно:

- exact Upstream Bot `v4.1.0` прошёл source, migration и runtime gates;
- полный Installer lifecycle повторён из-за смены Bot SHA;
- candidate и public Bundle прошли Protected Update, rollback и postflight;
- staging live check завершён без release blockers;
- Android/iOS Telegram evidence получено; если оно недоступно, Release Bundle и
  production rollout остаются `BLOCKED`;
- owner отдельно разрешил tags, public Release и production rollout.

## 12. Блокирующие вопросы владельцу

1. Подтверждается ли совместное обновление Upstream Bot до `v4.1.0` exact SHA
   `49b05d5ab79dd9bb92f0404bb0066cda8a175649`? Без него полный набор функций
   Cabinet `v1.66.0` несовместим с текущим Release Bundle.
2. Какие exact версии Remnawave panel и nodes используются на staging и
   production? Для полного GeoCheck sign-off нужны версии `3.3.0+`.
3. После успешной локальной интеграции потребуется отдельное явное разрешение
   на staging deploy, принятие staging-результата, push/tag, публичный Release
   Bundle, destructive disposable-VPS lifecycle и production rollout. До
   соответствующего разрешения работа должна остановиться перед конкретным
   внешним действием.
