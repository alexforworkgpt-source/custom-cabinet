# Нижнее меню пользовательских разделов — 2026-10-28

## Согласованная задача и baseline

Владелец подтвердил три browser seams: меню/родительский пункт на обычных
страницах, разделение каталога и оформления, отсутствие меню в отдельных действиях
с сохранением поведения клавиатуры и доступности конца содержимого.
Административная навигация не входит в изменение.

Точка сравнения — рабочая копия после аудита анимаций27 октября, HEAD `0d04a822`,
со всеми существовавшими owner changes. HEAD не является снимком owner tree.
Исходные920 source/test identities записаны в
`.scratch/mobile-navigation-20261028/before.json`. Изменения сравниваются с этим
снимком, не с production и не с чистым HEAD. Никаких reset/checkout/commit нет.

## Где теперь есть меню

| Маршрут | Подсветка мобильного пункта |
| --- | --- |
| `/profile/accounts`, `/profile/notifications` | Профиль |
| `/referral` | Профиль |
| `/contests`, `/polls`, `/wheel`, `/gift` | Профиль |
| `/instructions`, `/instructions/:slug` | Профиль; Поддержка при существующем `instructionsOrigin: support` |
| `/info`, `/info/:slug` | Профиль |
| `/news/:slug`, `/balance/saved-cards` | Главная |
| `/subscription/purchase` в режиме каталога тарифов | Контекстный пункт Тарифы/Подписка/Подписки |

Основные `/`, `/support`, `/profile`, `/subscriptions`, `/subscriptions/:id`
сохраняют меню. Число пунктов — прежние4; разрешённые адреса заданы явно,
вложенные action routes не включаются по широкому startsWith.

На `/subscription/purchase` нижняя панель определяется фазой страницы:
готовый/определённый tariff catalogue — есть; tariff checkout, switch dialog
и весь classic wizard — нет. Неизвестный sales mode до ответа не считается
каталогом. Loading/error списка подписок не скрывают известный каталог и
не подменяют неизвестный список пустым: существующий pending/retry пункт сохранён.

## Где меню отсутствует

Продление `/subscriptions/:id/renew`, заявки `/referral/partner/apply` и
`/referral/withdrawal/request`, баланс/пополнение/результаты `/balance…`, кроме
saved-cards, `/gift/result`, `/connection` и `/connection/qr` сохраняют свои
собственные выходы. Публичные/служебные экраны не получили пользовательскую панель.
Открытая игра/опрос временно скрывает панель; закрытие восстанавливает её.

Меню использует прежнюю защиту `useVirtualKeyboard`: при фокусе текстового поля
opacity0/pointer-events:none, после выхода из ввода панель возвращается. Тест
проверяет browser focus/blur, а не физическую клавиатуру Android/iOS.
Длинная статья сохраняет существующий нижний резерв; последний link остаётся
выше меню и доступен нажатию. Новых CSS-классов, global CSS, зависимостей нет.

## Владельцы кода

- `mobileNavRoutes.ts` — явный список вторичных экранов и их мобильных родителей;
  desktop `isNavItemActive` не изменён.
- `MobileBottomNav.tsx` — применяет мобильную подсветку с существующим контекстом
  инструкций, не меняет пункты, href и дизайн.
- `MobileNavigation.tsx` — небольшой presentation context под `Layout`.
  Страница сообщает `catalogue/section/action`; AppShell решает, рисовать ли
  нижнюю панель. Сообщение привязано к history-entry key; cleanup не переносит
  режим оформления на следующую страницу. Обновление через layout effect
  выполняется до рисования, включая StrictMode.
- `SubscriptionPurchase`, `Polls`, `Contests` сообщают существующую UI-фазу.
  API, query keys, денежные расчёты, мутации и URLs не менялись.

Архитектурное решение: [ADR0005](adr/0005-mobile-section-navigation.md).

## TDD и промежуточные результаты

RED → GREEN выполнены на настоящем browser UI с существующим API harness:

1. Connected Accounts: отсутствующее меню → доступные4пункта и возврат.
2. Info/остальные разделы: отсутствующее меню → родительская подсветка,
   прямой вход/reload/browser back и работающие переходы.
3. Instructions из Support: неверная подсветка → сохранение Support в статье
   и возврате. Обычный вход остаётся в Profile.
4. Catalogue0/1/2 subscriptions и classic wizard:4RED →4GREEN; видимость
   разделена по фазе, а не по адресу динамического пункта подписки.
5. Poll dialog: панель оставалась видимой над action → скрытие и восстановление;
   тот же owner contract применён к игре и проверен отдельным browser сценарием.

Логи `red-*.log`, `green-*.log`, `boundaries-first.log` сохранены локально.
Первый accounts probe остановился на холодной Vite-загрузке до готовности страницы;
настоящий RED получен после ожидания заголовка. Первые boundary probes уточнены:
нужен `tickets_enabled:true`, а HTML-ссылка статьи штатно открывает новую вкладку.
Это корректировки fixtures/ожиданий теста, не изменения API/санитайзера приложения.

### Уточнение двух прежних геометрических проверок

Два широких compiled run дали по488PASS/1FAIL/6configuredSKIP:

- Renewal Back:43.99999px вместо44 при измерении во время подъёма. Повтор
  воспроизвёл4/15; layout height44, transform предка содержал дробный y.
- Dashboard Copy/QR: последовательные boundingBox читались в разных кадрах
  общего8px входа; ложное различие Y7.9568px при допуске1px.

В `navigation.spec.ts` геометрия ждёт завершения движения предков через
`waitForRestingGeometry` из существующего entranceProbe. В `dashboard-qr.spec.ts`
обе геометрии дополнительно читаются атомарно, в одном browser evaluation.
Требования44px/1px, действия, fixtures, retries и таймауты не ослаблены;
визуальный код кнопок не менялся. Тридцать повторов двух проверок на3ширинах PASS.
Это отдельно зафиксированные гонки измерения, не доказательство поломки кнопок.

## Финальные gates

- `npm test -- --maxWorkers=1`: **1167PASS/182files**.
  Первый run прерван terminal timeout240s и содержал timeout холодного импорта
  Referral в loadingStates. Отдельный loadingStates48PASS и полный повтор с
  достаточным временем terminal завершились PASS; код/таймауты unit не менялись.
- `npm run build`: **PASS**, включая оба TypeScript-проекта.
- Biome: **15 затронутых TS/TSX PASS**, `git diff --check` PASS.
- Exact `dist/`, Chromium153,320×720/375×812/1280×800:
  **489PASS/6configuredSKIP/0FAIL/0flaky**, retries0,495сценариев.
  Все105новых checks выполнены. Остальные384PASS включают прежнюю навигацию,
  возвраты/окна, purchase/renewal readiness, skeleton, QR и анимации.
- Проверены RU/light и FA/dark/RTL, просмотрены screenshots320RU,375FA и1280RU.
  Desktop сохраняет верхнюю навигацию. При длинной статье/фокусе поля не создаётся
  новая финансовая операция; локальные тесты не инициировали настоящий платёж.

Использованы Node24.15.0 и существующий Chromium153. Собственный Vite/preview4173
запускался и завершался Playwright; API fixtures не требуют Upstream Bot.
Физический Telegram/Android/iOS и production не проверялись.

## Exact identities и evidence

`.scratch/mobile-navigation-20261028/`:

- `artifact.sha256`:286files, manifest SHA256
  `8445a76f34f83479d98896ec8c10581d9523a4aa3c4889bc374f6ccc360c224a`.
- `tested-source.json`:924source/test files, SHA256
  `52ba7e6c415a833bf0dbfa7ba7c2a01aa665cae103141e706f1bb01cee3ef32d`.
- `final-unit.log`, `build.log`, `final-biome.log`, `final-browser-pass.log`,
  `final-browser-results.json`, `identity.json`, raw screenshots и прежние
  неуспешные результаты. Артефакт одинаков до/после test-only уточнений геометрии.

После gate `identity.mjs --verify` подтвердил неизменность всех compiled bytes
и source/test inputs. `final-validation.json` подтвердил105новых PASS без retries,
целостность ссылок двух новых документов и завершение preview4173.

Изменение локальное, поверх сохранённой owner tree. Публикации, нового Release
Bundle и production-перехода не выполнялось.

Рекомендуемый уровень рассуждения для следующей задачи: средний — правила меню изолированы, следующие небольшие изменения можно проверять теми же browser seams.
