# Live Check Custom Cabinet

Эта инструкция определяет обязательную проверку Custom Cabinet после редизайна,
крупного функционального изменения или синхронизации с Upstream Cabinet.

Live check подтверждает не только внешний вид. Он должен доказать, что production
сборка Custom Cabinet совместима с выбранным Upstream Bot, работает в обычном
браузере и Telegram Mini App и не ломает критические пользовательские сценарии.

Для фиксации результатов используется
[`LIVE_CHECK_REPORT_TEMPLATE.md`](LIVE_CHECK_REPORT_TEMPLATE.md).

## Модель проверки

Live check состоит из четырех обязательных уровней:

1. Локальный технический gate.
2. Локальный design live-check через тестовую Playwright-авторизацию.
3. Полный staging live check через тестовый Upstream Bot и тестового Telegram-бота.
4. Короткий неразрушающий production smoke после выпуска.

Полная первая проверка редизайна на production запрещена. Production smoke не
заменяет staging live check.

## Когда требуется полный live check

Полный сценарий обязателен после:

- редизайна shared primitives, navigation или layout;
- изменения Login, Dashboard, Subscription, Balance, Connection или Profile;
- изменения Telegram SDK, back behavior, deep links или viewport handling;
- изменения authentication, payments, permissions или storage;
- крупной синхронизации с Upstream Cabinet;
- изменения тем, semantic tokens или responsive foundations;
- обновления Upstream Bot с изменением Cabinet API;
- изменения Release Bundle, влияющего на frontend runtime.

Для небольшого изолированного исправления допускается сокращенный live check, но
он всегда включает автоматический gate, затронутый сценарий и critical smoke:
Login, Dashboard, открытие подписки, Connection и read-only Balance.

## Роли и ответственность

Перед началом назначаются:

| Роль | Ответственность |
| --- | --- |
| Release owner | Выбирает точные версии, разрешает staging/production deploy и принимает результат |
| Implementer | Предоставляет commit, список изменений, known risks и rollback source |
| Checker | Выполняет сценарий и фиксирует фактические результаты |
| Observer | Следит за frontend/backend logs и сетевыми ошибками |

Один человек может совмещать роли, но итоговые версии и результат должны быть
записаны явно.

## Обязательные исходные данные

До запуска проверок зафиксировать:

| Данные | Требование |
| --- | --- |
| Custom Cabinet | Точный commit SHA |
| Upstream Cabinet baseline | Точный tag и SHA из `UPSTREAM.md` |
| Upstream Bot | Точный tag и SHA |
| Release Bundle | Candidate tag или пометка `not scheduled` |
| Environment | Staging URL без секретов |
| Build source | Чистый committed worktree |
| Rollback | Последний проверенный Custom Cabinet/Release Bundle |
| Scope | Список измененных flows и компонентов |

Если точная версия Upstream Bot неизвестна, проверка совместимости и Release
остаются заблокированными.

## Требования к staging

Staging должен максимально повторять production:

- HTTPS и отдельный домен;
- production build Custom Cabinet из зафиксированного commit;
- тестовый Upstream Bot совместимой версии;
- отдельный тестовый Telegram-бот;
- отдельная тестовая база или безопасные изолированные test accounts;
- те же proxy, nginx, base path и security headers, что в production;
- доступные frontend и backend logs;
- sandbox payment providers;
- тестовые email и OAuth настройки;
- безопасные test media и attachments;
- возможность быстро вернуть предыдущий build.

Нельзя помещать staging tokens, passwords, bot tokens или payment secrets в
репозиторий, отчет, screenshots или console output.

## Тестовые пользователи

Минимальный набор данных:

| Пользователь | Требуемое состояние |
| --- | --- |
| Guest | Нет авторизации |
| New user | Нет подписки, доступен onboarding/registration flow |
| Trial user | Активный trial |
| Active user | Активная платная подписка и трафик |
| Expiring user | Подписка скоро заканчивается |
| Expired user | Просроченная или limited подписка |
| Multi-subscription user | Несколько подписок, если feature включен |
| Full admin | Все permissions |
| Restricted admin | Ограниченная роль для проверки RBAC |

Тестовые данные должны быть восстанавливаемыми. Destructive admin actions
выполняются только над специально созданными тестовыми объектами.

## Этап 1. Проверка рабочей копии

Перед build:

1. Проверить `git status`.
2. Убедиться, что source changes committed.
3. Зафиксировать `git rev-parse HEAD`.
4. Сверить `UPSTREAM.md` и `COMPATIBILITY.md`.
5. Убедиться, что build не берет код из другой локальной папки.
6. Проверить отсутствие `.env`, logs, screenshots и agent data в staged files.

Наличие несвязанных source changes в Release Candidate блокирует проверку до
уточнения их происхождения.

## Этап 2. Автоматический gate

В чистом окружении выполнить:

```bash
npm ci
npm run check
npm test
npm run type-check
npm run build
```

После появления browser automation выполнить предусмотренную проектом команду
Playwright или другого принятого browser runner.

Gate считается пройденным только при exit code 0. Warnings о bundle size,
dependency compatibility или security фиксируются в отчете и оцениваются до
deploy.

При ошибке test, type-check или build staging deploy блокируется.

## Этап 2A. Локальный design live-check с тестовой авторизацией

Для локальной проверки защищенных экранов используется существующий harness
`tests/e2e/cabinetTestHarness.ts`. Он создает только тестовую browser-сессию:

- записывает тестовый JWT и пользователя в browser storage;
- перехватывает Cabinet API через Playwright `page.route`;
- возвращает подготовленные mock-состояния подписки, баланса и branding;
- не добавляет auth bypass в production-код и не обращается к реальному Telegram.

После успешного автоматического gate нужно запустить Custom Cabinet локально,
открыть нужные состояния через этот harness и провести визуальный live-check на
desktop, 375 и 320 пикселях. Проверяются дизайн, тексты, темы, раскрытие блоков,
focus, scrolling и отсутствие overflow.

Владелец Release должен явно подтвердить, что дизайн его устраивает. До такого
подтверждения commit для Release Bundle и публикация Release запрещены.

Тестовая авторизация проверяет локальный дизайн и browser-поведение, но не
доказывает работу Telegram init data, реального Upstream Bot или staging
инфраструктуры. После design approval полный staging и Telegram live-check
остаются обязательными.

## Этап 3. Сборка и staging deploy

1. Собрать production artifact из зафиксированного commit.
2. Записать checksum artifact.
3. Развернуть artifact в staging без ручного редактирования файлов после build.
4. Записать время deploy и staging URL.
5. Проверить health endpoint Upstream Bot.
6. Проверить доступность `index.html` и основных static assets.
7. Убедиться, что direct route reload возвращает приложение, а не 404.
8. Проверить, что staging можно вернуть к предыдущему artifact.

Тестируется тот же artifact, который планируется включить в Release Bundle. Не
нужно пересобирать «такой же» artifact после успешного live check.

## Этап 4. Первичный runtime smoke

В чистом browser context проверить:

| Проверка | Ожидаемый результат |
| --- | --- |
| Health | Backend отвечает ожидаемым status |
| Initial load | Нет белого экрана и бесконечного loader |
| Console | Нет необработанных exceptions |
| Network | Нет неожиданных 4xx/5xx и redirect loops |
| Branding | Название, logo, favicon и colors загружены |
| Theme | Разрешенные dark/light themes применяются |
| Languages | Enabled languages загружены без мигания и raw keys |
| WebSocket | Соединение устанавливается или корректно восстанавливается |
| Lazy routes | Chunks загружаются при переходах |
| Direct reload | Защищенный и публичный route корректно восстанавливаются |

Каждая неожиданная ошибка в console или network должна быть объяснена. Нельзя
помечать ее «неважной» без определения источника и влияния.

## Этап 5. Публичные сценарии

### Web authentication

1. Открыть Login без cookies и storage.
2. Проверить branding и language switcher.
3. Проверить вход с валидными email/password.
4. Проверить неверный password.
5. Проверить пустые и невалидные поля.
6. Проверить registration.
7. Проверить обязательный legal consent.
8. Проверить email verification.
9. Проверить forgot/reset password.
10. Проверить каждый enabled OAuth provider.
11. Проверить legal links и browser Back.
12. Проверить возврат на исходный protected route после Login.
13. Проверить logout и повторный Login.

### Telegram authentication

1. Открыть Mini App из тестового Telegram-бота.
2. Проверить автоматическую авторизацию через init data.
3. Проверить first-user legal consent.
4. Закрыть и повторно открыть Mini App.
5. Проверить сохранение или корректное восстановление session.
6. Проверить logout.
7. Проверить retry/reopen path при ошибке авторизации.
8. Проверить Back и Close согласно текущему route.

## Этап 6. Dashboard

Для каждого подготовленного subscription state проверить:

- правильный status и срок;
- правильный primary CTA;
- отсутствие дублирующихся CTA;
- traffic и refresh cooldown;
- device count;
- trial activation;
- переход к purchase, renewal и connection;
- multi-subscription list и управление;
- balance и referral stats;
- pending gifts;
- promo offers;
- news;
- wheel и feature flags;
- onboarding start, next, skip и focus;
- loading, empty и API error states.

Числа, даты, суммы и сроки сверяются с backend/test fixtures, а не оцениваются
только визуально.

## Этап 7. Subscription и purchase

1. Открыть список subscriptions.
2. Открыть каждое поддерживаемое состояние subscription.
3. Выбрать tariff и period.
4. Проверить цену, скидку и итоговую сумму.
5. Применить валидный и невалидный promocode.
6. Проверить insufficient balance.
7. Проверить free/trial switch behavior.
8. Выбрать каждый enabled payment method.
9. Выполнить sandbox payment.
10. Проверить pending, success, cancel и failure returns.
11. Убедиться, что новая или продленная subscription появилась один раз.
12. Проверить recurring payment state и cancel flow, если enabled.
13. Проверить renewal.
14. Проверить повторное открытие result URL.
15. Проверить защиту от двойной отправки и двойного списания.

Реальный платеж допускается только по отдельному явному разрешению владельца,
если provider не имеет sandbox. Сумма, возврат и ответственный фиксируются до
начала. ИИ не должен самостоятельно инициировать реальный платеж.

## Этап 8. Balance

Проверить:

- текущий balance;
- ручной ввод суммы;
- minimum/maximum limits;
- global и per-method quick amounts;
- каждый enabled payment method;
- external payment opening в web и Telegram;
- success, pending, cancel и failure result;
- saved cards и recurring methods;
- удаление тестового saved method;
- long provider names и disabled methods;
- loading, empty и API error states.

## Этап 9. Connection

Для каждой поддерживаемой platform:

1. Выбрать application.
2. Пройти instruction steps.
3. Скопировать subscription URL.
4. Проверить QR.
5. Проверить application deep link.
6. Проверить fallback при unsupported scheme.
7. Проверить external navigation в Telegram.
8. Вернуться в Cabinet.
9. Проверить long URLs, names и mobile wrapping.

Минимальные platform cases: iOS, Android, Windows и macOS. Android TV и Apple
TV добавляются, когда соответствующие flows enabled.

## Этап 10. Profile и accounts

Проверить:

- отображение identity data;
- linked Telegram/email accounts;
- изменение email;
- OTP, resend, invalid и expired code;
- account merge и cancel paths;
- referral copy/share;
- notification switches и dependent fields;
- saved state после reload;
- logout и session cleanup;
- keyboard и focus во всех inline forms.

## Этап 11. Support и notifications

Проверить:

- внешний support contact;
- Telegram username/link;
- создание ticket;
- отправку и получение message;
- attachment upload и просмотр media;
- long message и long filename;
- WebSocket notification;
- unread badge;
- empty, loading и reconnect states;
- отсутствие склейки разных support URLs.

## Этап 12. Дополнительные пользовательские функции

Если функции enabled, проверить:

- referral application и withdrawal;
- gifts: purchase, share, claim и QR;
- promocodes и coupons;
- contests;
- polls;
- wheel;
- news и info pages;
- public quick purchase;
- account auto-login и deep-link redirects.

Feature flag должен скрывать navigation и entry points согласованно, но direct
route не должен приводить к crash или неконтролируемому пустому экрану.

## Этап 13. Admin smoke

Минимальный admin scope:

| Раздел | Действия |
| --- | --- |
| Admin panel | Search, permissions, metrics, navigation |
| Users | Search, filter, pagination, detail |
| User detail | Subscription, balance, messages, safe test mutation |
| Tariffs | Create/edit validation на тестовом объекте |
| Payments | List, filters, detail, status rendering |
| Payment methods | Read and safe edit/restore test configuration |
| Promocodes/coupons | Create, validate, apply, remove test object |
| Broadcasts | Preview и test-recipient send only |
| News/info/legal | Draft, preview, localization |
| Settings | Read, safe edit and restore selected test setting |
| Roles/policies | Full и restricted admin behavior |
| Audit log | Проверяемые действия появились в log |
| Remnawave | Nodes, squads и metrics load без destructive action |

Restricted admin не должен видеть или выполнять запрещенные действия даже при
прямом переходе по URL.

## Этап 14. Responsive и visual matrix

Обязательные viewport sizes:

```text
320 x 568
375 x 812
768 x 1024
1024 x 768
1280 x 800
1440 x 900
```

На критических страницах проверить:

- отсутствие случайного page-level horizontal scroll;
- отсутствие обрезанных names, IDs, amounts и actions;
- доступность primary CTA без скрытого hover;
- header, drawer и bottom navigation;
- software keyboard и fixed navigation;
- dialogs, sheets, popovers и z-index;
- skeleton/layout stability;
- dark theme;
- light theme;
- минимум одну operator-defined palette;
- Russian;
- English;
- RTL case;
- browser zoom 200%;
- reduced motion.

Screenshots и video можно использовать как локальные QA evidence, но нельзя
добавлять их в репозиторий или публичный Release без отдельного решения.

## Этап 15. Реальные устройства

Минимальная device matrix:

| Среда | Обязательная проверка |
| --- | --- |
| Desktop Chromium | Основной web flow и DevTools evidence |
| Desktop Firefox | Независимый browser engine smoke |
| Android Telegram | Mini App, keyboard, Back, deep links, payment return |
| iOS Telegram | Safe area, fullscreen, Back/Close, external navigation |
| Mobile browser | Cabinet вне Telegram |

Viewport emulation не заменяет реальные Telegram iOS/Android checks для
keyboard, native Back, fullscreen и application schemes.

## Этап 16. Accessibility smoke

1. Пройти Login, Dashboard, purchase и один admin flow только keyboard.
2. Проверить видимый focus и logical order.
3. Проверить skip path к main content, если он предусмотрен shell.
4. Проверить accessible names icon-only actions.
5. Проверить labels, descriptions, errors и `aria-invalid` forms.
6. Проверить active navigation и `aria-current`.
7. Проверить Dialog/Sheet focus trap, Escape и focus return.
8. Проверить Switch, Checkbox и selectable Cards.
9. Проверить 200% browser zoom.
10. Проверить reduced motion.
11. Проверить status, selection и errors без зависимости только от color.
12. Пройти базовый пользовательский flow screen reader, если доступен.

## Этап 17. Failure и recovery

Намеренно проверить в staging:

- backend unavailable;
- slow network;
- request timeout;
- 401 и refresh/relogin;
- 403 permission denial;
- 422 validation detail;
- 429 cooldown/retry;
- 500 generic recovery;
- offline и возврат сети;
- WebSocket disconnect/reconnect;
- stale frontend chunks после deploy;
- закрытие Telegram во время операции;
- повторную отправку form;
- double click primary action;
- interrupted external payment return.

Ожидаемый результат: нет white screen, бесконечного spinner, потери navigation,
двойной mutation или raw backend object в UI.

## Этап 18. Наблюдаемость

Во время live check фиксировать:

- browser и Telegram platform;
- test role и data state;
- route и timestamp;
- Custom Cabinet commit;
- Upstream Bot tag/SHA;
- console exceptions и warnings;
- failed network requests и response status;
- backend errors;
- WebSocket reconnects;
- точные reproduction steps;
- ожидаемый и фактический результат.

Не включать в отчет access/refresh tokens, cookies, Telegram init data, personal
data, bot tokens или payment credentials. Перед публикацией logs должны быть
очищены от secret shapes и персональных данных.

## Release-blocking conditions

Результат `FAIL` и остановка Release обязательны при:

- невозможности войти или восстановить session;
- неправильной цене, скидке, валюте, сроке или balance;
- риске двойного платежа или subscription mutation;
- неработающем purchase, renewal или connection;
- bypass permissions;
- unsafe redirect, URL scheme или exposed secret;
- crash, white screen или непрерывном redirect loop;
- неработающем Telegram Back/Close;
- невозможности использовать primary flow на mobile;
- потере функциональности из принятого Upstream Cabinet range;
- неизвестной совместимости с выбранным Upstream Bot;
- отсутствии рабочего rollback source.

Некритичный visual defect допускает `PASS WITH RISKS` только когда он записан,
не блокирует действие, не нарушает accessibility и имеет согласованное решение.

## Результаты проверки

Допустимы только:

| Результат | Значение |
| --- | --- |
| `PASS` | Все обязательные проверки пройдены, release разрешен |
| `PASS WITH RISKS` | Нет release blockers, остаточные риски приняты владельцем |
| `FAIL` | Release заблокирован до исправления и повторной проверки |
| `BLOCKED` | Проверка невозможна из-за environment, version или test-data ограничения |

`BLOCKED` не равен `PASS`.

## Этап 19. Production rollout

После staging `PASS` или явно принятого `PASS WITH RISKS`:

1. Зафиксировать immutable Release tag.
2. Собрать или выбрать уже проверенный artifact из committed source.
3. Проверить checksum.
4. Записать rollback Release Bundle.
5. Развернуть новую версию.
6. Проверить health и static assets.
7. Выполнить production Telegram Login.
8. Открыть Dashboard.
9. Открыть существующую subscription.
10. Проверить Connection без изменения данных.
11. Открыть Balance без реального платежа.
12. Открыть read-only admin pages.
13. Проверить frontend/backend logs и error rate.
14. Зафиксировать production smoke result.

Production smoke не включает destructive admin actions, массовые рассылки,
изменение settings или реальный платеж без отдельного разрешения.

## Rollback

Rollback выполняется немедленно при production release blocker.

До deploy должны быть известны:

- предыдущий Release Bundle tag;
- предыдущий Custom Cabinet commit и artifact;
- команда или процедура rollback;
- ответственный;
- expected recovery time;
- проверка health/Login после rollback.

После rollback сохранить evidence, открыть defect и не заменять assets неудачного
Release tag. Исправление публикуется новым immutable tag после повторного gate.

## Завершение

Live check завершен только когда:

- заполнен `LIVE_CHECK_REPORT_TEMPLATE.md`;
- записаны точные версии;
- все обязательные cases имеют результат;
- defects и blocked checks перечислены;
- staging result принят владельцем;
- production smoke записан или явно помечен как не начатый;
- rollback source подтвержден;
- отчет не содержит secrets или personal data.
