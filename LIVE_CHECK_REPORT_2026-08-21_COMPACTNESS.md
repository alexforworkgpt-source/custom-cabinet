# Compactness Live Check: `2026-08-21`

Status: `BLOCKED`<br>
Local compactness result: `PASS`<br>
Date: `2026-08-21`<br>
Checker: `OpenCode`<br>
Release owner: `workspace owner`

## Scope

Отчёт фиксирует исходный compactness-аудит, реализацию семи рекомендаций и
повторную локальную проверку всех 50 пользовательских route declarations Custom
Cabinet. Цель повторной проверки: доказать, что важные действия не теряются из-за
избыточной высоты, дублирования блоков или fixed navigation.

Точка сравнения: локальный аудит от `2026-08-18` на commit
`793880e6a106cdc23dff5a2478f61954647dd29a` плюс его незакоммиченные изменения.
Текущая проверка выполнена на новом HEAD и текущем незакоммиченном рабочем
дереве. Это не staging или production approval.

Admin routes не входят в эту проверку. Реальные платежи, изменения аккаунтов,
Telegram-переходы и другие записывающие действия не выполнялись.

## Source Identity

| Item | Exact value |
| --- | --- |
| Screenshot audit base HEAD | `3bf4eadc7c48fed7dbda587a98151ddb9c9ad495` |
| Post-review product commit | `491f1cdfb630c8aef4a8fc1535c1c2083e19dee2` |
| Custom Cabinet version | `1.65.0` |
| Audited source state | Screenshot matrix: base HEAD плюс прежнее рабочее дерево; последний automated gate: exact post-review product commit |
| Upstream Cabinet baseline | `v1.65.0` / `b866bebeeb6032db4baa3869a4917316fe8e0453` |
| Compatible Upstream Bot | `v4.0.0` / `f553d1896dcd347fd74012f6394fd2277161bdd1` |
| Release Bundle baseline in `COMPATIBILITY.md` | `v2026.08.9`; не является кандидатом этого аудита |
| Staging artifact checksum | `NOT AVAILABLE`; локальный Vite runtime |
| Rollback Release Bundle | `NOT APPLICABLE`; deployment не выполнялся |

Во время post-review фиксации `2026-08-22` в рабочем дереве был 41 изменённый
tracked-файл и 7 untracked-файлов. Часть этих изменений существовала до данной задачи. Этот
отчёт не приписывает их текущей проверке и не включает их в Release.

## Environment

| Item | Value |
| --- | --- |
| Runtime URL | `http://127.0.0.1:5175` |
| Audit generated | `2026-08-21T20:25:42.634Z` |
| Browser | Playwright Chromium `151.0.7922.34` |
| Viewports | `320x568`, `375x812`, `768x1024`, `1024x768`, `1280x800`, `1440x900` |
| Themes | dark, light |
| Locales | English, Russian, Persian/RTL |
| Telegram clients | `NOT AVAILABLE` |
| Backend | local deterministic API fixtures |

## Safety Model

- Все внешние запросы возвращались локально с `204`.
- Все `/api/cabinet` запросы обслуживались локальными fixtures.
- Ни один `POST`, `PUT`, `PATCH` или `DELETE` не дошёл до реального сервера.
- Screenshots и machine-readable evidence сохранены вне репозитория.
- Отсутствие ошибок в mock-среде не подтверждает реальные provider callbacks,
  Telegram Mini App или Upstream Bot mutations.

## Method

1. Из `src/App.tsx` перечислены все 50 пользовательских route declarations,
   включая новый `/profile/notifications`.
2. Для каждой страницы сняты базовые состояния на desktop `1280x800` dark/en и
   mobile `320x568` light/en.
3. Для критичных страниц добавлены проверки `375`, `768`, `1024` и `1440`, обеих
   тем и локалей `ru`/`fa`.
4. Всего выполнено 190 cases и сохранено 190 screenshots. Для
   `/profile/notifications` дополнительно проверены critical viewports, обе темы,
   Russian и Persian/RTL.
5. Compactness оценивалась не только по `scrollHeight`: отдельно проверялись
   количество самостоятельных задач на странице, повторные пустые состояния,
   видимость primary action и перекрытие fixed navigation.
6. Для исправленных primary actions сохранена минимальная высота `44px`.
   Существующие small-target findings scanner фиксирует отдельно.

## Automated Gate

| Command/check | Result | Notes |
| --- | --- | --- |
| `npm ci` | `NOT RUN` | `node_modules` уже присутствовал; lockfile не изменялся |
| `npm run check` | `PASS` | Exit code 0; 262 warnings и 102 infos зафиксированы, formatter errors нет |
| Targeted Biome для затронутых файлов | `PASS` | Formatter errors отсутствуют |
| `npm test` | `PASS` | 142 tests |
| `npm run type-check` | `PASS` | TypeScript errors отсутствуют |
| `npm run build` | `PASS` | Production build собран |
| Subscription/Connection compactness Playwright | `PASS` | 3 passed на `320`, `375`, `768`; 2 expected desktop skips |
| Full Playwright rerun | `PASS` | Последний post-review run: 151 passed, 5 expected skips |
| Local route audit | `PASS` | 50 declarations, 190 cases, 190 screenshots |
| `git diff --check` | `PASS` | Whitespace errors отсутствуют |

Первый parallel compactness run содержал три test-locator failures: навигация
была видна, но перевод ссылки временно отображался как raw key `nav.dashboard`.
Локатор заменён на устойчивый публичный route-признак `a[href="/"]`; повторный
compactness run дал 25/25 PASS, полный Playwright run — 117 PASS и 1 SKIP.

После уплотнения management и Connection первый полный Playwright run выполнялся
одновременно с 190-case screenshot-аудитом. Один длинный Connection-сценарий на
`mobile-320` достиг общего timeout. Без конкурирующего процесса тот же сценарий
прошёл 1/1, а повторный полный run дал 138 PASS и 5 expected SKIP.

### Post-review verification: `2026-08-22`

После screenshot-аудита были добавлены error/retry states Balance и
notification settings, восстановлены Email change/resend flows и исправлено
перекрытие form controls нижней mobile navigation. Реальный Playwright
pointer-click сначала стабильно воспроизвёл дефект: navigation появлялась между
`pointerdown` и `pointerup` и забирала завершение жеста. `AppShell` теперь
сохраняет navigation скрытой, пока focus переходит с input на нажатый control.

Targeted Email regression прошёл 6/6 на `mobile-320`. После удаления временной
диагностики последний полный gate дал 151 PASS и 5 expected SKIP. Также удалён
избыточный мгновенный замер hover-цвета после уже polling-проверки
`toHaveCSS`; targeted color regression прошёл 6/6.

190 screenshots не переснимались после этих post-review source-изменений.
Поэтому screenshot evidence описывает более раннее состояние рабочего дерева,
а новый код подтверждён automated gate, но не новым visual audit. Это ограничение
не позволяет использовать данный отчёт как Release evidence.

## Render Stability

| Check | Result |
| --- | --- |
| ErrorBoundary/page crash | 0 cases |
| Evidence collection error | 0 cases |
| Unexpected API mock | 0 cases |
| Horizontal document overflow | 0 cases |
| Remaining loading indicator | 0 cases |
| Failed network request | 0 cases |

Эти результаты подтверждают стабильность локального render, но не закрывают
compactness, accessibility или real-integration defects.

## Compactness Findings

| ID | Route | Before `320x568` | After `320x568` | Verification | Local status |
| --- | --- | ---: | ---: | --- | --- |
| `CC-001` | `/referral` | `2201 px` | `1431 px` | Partner и Withdrawal свёрнуты независимо только на mobile; desktop остаётся раскрытым | `RESOLVED` |
| `CC-002` | `/profile` | `2193 px` | `1713 px` | Пять notification controls перенесены на `/profile/notifications` (`704 px`), ссылка осталась в Preferences | `RESOLVED` |
| `CC-003` | `/wheel` | `967 px` | `808 px` | `SPIN!` выше fixed navigation при `34px` safe area, высота action не меньше `44px` | `RESOLVED` |
| `CC-004` | `/support` | `848 px` | `568 px` | Mobile показывает одно empty state; desktop сохраняет split view | `RESOLVED` |
| `CC-005` | `/gift` | `798 px` | `744 px` | Payment context и `Send Gift` выше navigation, action не меньше `44px` | `RESOLVED` |
| `CC-006` | `/buy/:slug` | overlay finding | `1163 px` | Fixed Pay скрывается при пересечении payment methods и появляется после прокрутки; safe area учтена | `RESOLVED` |
| `CC-007` | `/subscriptions/:subscriptionId`, `/connection` | management `1425 px`; success `554.5 px` | management/install/success не выше Balance более чем на `16 px` | Primary management actions видны сразу; secondary actions закрыты в `Additional Options`; Upstream Bot blocks не дублируются generic-текстом | `RESOLVED` |

Высота указана для базового mobile case `320x568`. Она используется как сигнал,
но не как автоматический дефект: длинная форма или юридический документ может
быть корректным, если структура последовательна и primary action не теряется.

## Pages That Do Not Need More Compactness Now

| Route/group | Evidence | Decision |
| --- | --- | --- |
| `/balance/top-up/:methodId` | Все три quick amounts видны в sheet; измеренная высота каждой кнопки `44-48 px`, фактический класс `h-12` | Compactness accepted |
| `/subscription/purchase` | Текущий step wizard помещает title, step, period option и navigation actions в первый `320x568` экран | Не уплотнять |
| `/referral/partner/apply` | `950 px`, но высота вызвана шестью последовательными полями формы; Submit остаётся после последнего поля | Не уплотнять за счёт полей или labels |
| `/merge/:mergeToken` | `1056 px`, но три card-секции нужны для сравнения current account, found account и результата необратимой операции | Сохранить явное сравнение |
| Dashboard, Subscriptions list, Balance | Базовый `scrollHeight` около `864 px` в основном формируется общей AppShell reserve space; критичная информация расположена первой | Нет отдельной compactness-задачи |
| Legal/content pages | Высота зависит от текста и должна сохранять читаемость | Не сокращать типографику ради числа экранов |

## Adjacent Findings Kept Separate

Эти проблемы видны в той же матрице, но не должны маскироваться словом
"compactness":

| Existing finding | Route | Why separate |
| --- | --- | --- |
| `LC-008` | `/buy/:slug` | Закрыт локально через intersection-aware fixed CTA и geometry regression |
| `LC-010` | `/referral` | Read-only referral inputs не имеют программных labels; это accessibility defect |
| `LC-012` | `/wheel`, `/gift` | Закрыт локально отдельными geometry regressions с `34px` safe area |
| `LC-017` | `/support` | Закрыт локально: detail empty state скрыт только на mobile |

Последующий all-pages accessibility пакет исправил shared Back controls и mobile
Admin theme target. Оставшиеся icon-only, form-label и small-target сигналы
ведутся отдельно и не считаются закрытыми данным compactness-отчётом.

## Change Verified In This Check

1. `/wheel`: уменьшены только mobile spacing и размер колеса; primary action
   проверен относительно navigation и safe area.
2. `/referral`: добавлены доступные mobile disclosure для Partner и Withdrawal.
3. `/profile`: notification settings вынесены на защищённый
   `/profile/notifications`; API save contract сохранён.
4. `/support`: повторный detail empty state скрыт только на mobile.
5. `/gift`: уплотнён mobile layout без уменьшения primary CTA ниже `44px`.
6. `/buy/:slug`: fixed Pay учитывает пересечение payment methods и bottom safe
   area.
7. Ранее проверенное уплотнение quick amounts в `TopUpAmount` сохранено.
8. `/subscriptions/:subscriptionId` и `/connection`: primary actions вынесены в
   компактный первый экран, вторичные настройки свёрнуты, повторные описания
   Upstream Bot blocks удалены.

Публичные browser seams закреплены в `tests/e2e/compactness-flows.spec.ts` и
`tests/e2e/cabinet-flows.spec.ts`.

## Evidence

Machine-readable matrix:

```text
C:\Users\DMITRY\AppData\Local\Temp\opencode\custom-cabinet-compactness-live-check-20260821-postfix\live-ui-audit.json
```

Screenshots находятся в той же временной директории и не добавлены в
репозиторий. Основные case IDs:

- `all-routes__referral__320x568__light__en`
- `all-routes__profile__320x568__light__en`
- `all-routes__profile--notifications__320x568__light__en`
- `all-routes__wheel__320x568__light__en`
- `all-routes__support__320x568__light__en`
- `all-routes__gift__320x568__light__en`
- `all-routes__buy--_slug__320x568__light__en`
- `all-routes__subscription--purchase__320x568__light__en`
- `all-routes__balance--top-up--_methodId__320x568__light__en`

## Limitations

- Screenshot-проверка выполнена на прежнем незакоммиченном рабочем дереве,
  поэтому её evidence нельзя считать доказательством для immutable Release
  Bundle. Последний automated gate привязан к точному product commit, но не
  заменяет visual audit.
- Изолированные staging accounts для new/trial/active/expired/multi-user и admin
  states не использовались.
- Android/iOS Telegram, Safari, Firefox, физическое устройство и screen reader
  были недоступны.
- Реальные Upstream Bot errors, WebSocket reconnect, provider callbacks и
  payment returns не проверялись.
- Production и интеграционный VPS не изменялись и не проверялись.

## Decision

Local compactness result: `PASS`.

Причина: все семь рекомендаций реализованы и закреплены browser tests. Полная
локальная route matrix стабильна; screenshots и geometry tests подтверждают
доступность primary actions. Horizontal overflow, crash, неожиданные API mocks,
collection errors, зависшие loaders и failed network отсутствуют.

Full live-check result: `BLOCKED`.

Причина:

```text
Нет immutable Release candidate, staging artifact checksum, изолированных
test accounts и реальных Telegram clients. Локальный mock-аудит не является
staging или production approval.
```

## Recommended Order

1. Использовать точный product commit
   `491f1cdfb630c8aef4a8fc1535c1c2083e19dee2` как источник нового Custom Cabinet
   candidate; не переносить на него старое screenshot evidence без нового audit.
2. Если планируется Release, собрать новый immutable Release Bundle candidate и
   выполнить staging gate с совместимым Upstream Bot.
3. Проверить Android/iOS Telegram, provider callbacks и sandbox payment returns;
   только после этого менять общий результат `BLOCKED`.
4. Accessibility findings `LC-010` и icon-only controls вести отдельной задачей,
   не смешивая их с закрытым compactness scope.

Рекомендуемый уровень рассуждения для следующей задачи: высокий — локальная часть
закрыта, но Release-проверка требует разделения незакоммиченных изменений,
immutable Bundle и реальных staging/Telegram интеграций.
