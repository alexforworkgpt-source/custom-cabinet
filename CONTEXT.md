# Custom Cabinet Context

## Выпуск2026.10.22.1 завершён stable — 2026-10-22

**RELEASED_STABLE_AND_VERIFIED:** `cabinet-v2026.10.22.1`, source
`80be79d59791c330dae3fc5eac46d96d2e503357`, и **`bundle-v2026.10.22.1`**.
Installerf1f301b/Bot5bda3c56/PG18 и protected contracts сохранены; trusted lifecycle
переиспользован, полный цикл не повторялся. Исправлены R1–R3 и два дополнительных
PR43 finding по catalogue/retry. SourcePR43/recordPR44/Installer evidencePR13 merged.

Exact CI Node24/26 по1166unit/types/build/guards/lint PASS; CodeQL без новых IDs,
audit15 OPEN/non-blocking (4moderate/10high/1critical). Final exact-public-artifact
browser **1766PASS/35configuredSKIP/0FAIL/0flaky**,2workers/0retries; одна атомарная
geometry sampling корректировка только в отдельной verification-copy, assertions/
fixtures/timeouts/compiled bytes/source tag сохранены. Все8 public files,
независимые uncached/Actions bytes, новый public Bundle smoke/owned cleanup PASS.
287 public artifact files exact, PG18/schema0131; старые volumes/host files сохранены.
Guarded promotion39850161557 SUCCESS; прежние Releases/assets/tags/latest/settings
сохранены. Физический Telegram/Android/iOS **SKIPPED_OWNER_ACCEPTED именно для
этого исправленного пакета**, не PASS. Остальные live OPEN/BLOCKED сохраняют scope.

Archive `3b02860e5de08b1f7d6aae56777eeb1b4cb740dc6acfc8460fa449671fdbb8ed`,
Bundle identity `517e663836e6e7fe5699e7b6f4f7f9253cd2275abefab524659b7e00f6fe9eca`.
**Пакет готов к отдельному production-переходу; production не подключался и не
обновлялся.** Основные owner HEAD/index сохранены: локальный HEAD0d04a822,
исправления в рабочих файлах; публичный точный source80be79d5 принят в чистой копии.
[Итог](docs/releases/RELEASE_COMPLETION_2026.10.22.1.md),
[scope live-check](docs/releases/LIVE_CHECK_REPORT_2026.10.22.md).
Ниже RUNNING/BLOCKED/PENDING относятся к более ранним состояниям подготовки.

## Исправления R1–R3 и продолжение выпуска — 2026-10-22

После команды владельца «исправляй» исправлены три finding предыдущего review:
недоступное classic-продление больше не ведёт в purchase loop; trial CTA сохраняет
выбранный ID; device quote с can_add_limited позволяет уменьшить восстановленную
добавку и подтвердить её только по свежей допустимой цене. Два Cashera browser
tests приведены к принятому UI.1166unit/45focused compiled browser/build/оба
TypeScript/Biome PASS, широкий1781-case browser gate выполняется. Результаты
неуспешных промежуточных запусков сохранены; код админки/таймауты не менялись.

Для **текущего исправленного выпуска** владелец отдельно выбрал «Принять ограничение»:
физический Telegram/Android/iOS **SKIPPED_OWNER_ACCEPTED**, не PASS. Продолжается
ранее разрешённая Cabinet-only подготовка в отдельных копиях; source tag/новый
Bundle ещё не опубликованы, production исключён. Ниже BLOCKED_FRONTEND описывает
исходный0d04a822 до этих исправлений. [Текущий отчёт](docs/releases/RELEASE_FIXES_2026.10.22.md).

## Проверка перед новым Release остановлена — 2026-10-22

Владелец завершил дизайн и разрешил новый Cabinet-only выпуск/stable после gates,
без production, с остановкой при реальном блокере. Проверен exact HEAD `0d04a822`
(родитель `9d6b5831`) относительно Cabinet `cc17e371` из последнего stable Bundle
`bundle-v2026.10.18.1`. В отдельной чистой копии1161unit/оба TypeScript/build/Biome
PASS. Targeted compiled browser320/1280:4PASS/10FAIL/0SKIP/0flaky,0retries.
Три frontend findings воспроизведены на обеих ширинах: limited classic CTA делает
круг через purchase обратно в управление; trial CTA теряет выбранный ID (ветка
существовала в stable, не новая регрессия); восстановленная докупка устройств
после снижения максимума скрывает счётчик и не даёт уменьшить добавку. Ещё4FAIL —
два прежних Cashera tests с устаревшими URL/accordion expectations; дизайн к ним
не возвращать. Полный финальный Release browser gate **NOT_PASS**.

Результат **BLOCKED_FRONTEND**, публикация остановлена по условию владельца.
Новых commits/push/PR/tags/Releases/workflows/stable/smoke/SSH нет; production,
Installer/site/backend и прежние assets/latest/settings сохранены. HEAD/index и
исходные owner files сохранены, кроме этой записи и нового отчёта. Разрешение на
пакет записано в отчёте; прежнее отсутствие разрешения в handoff — исторический факт.
Продолжение: frontend-only R1–R3 + обновление двух browser tests, затем gates.
Сохранить исторические release records из main в будущей чистой release-копии:
рабочая ветка расходится со stable, нельзя переносить её tree с удалением истории.

[Точные findings, воспроизведение и результаты](docs/releases/RELEASE_REVIEW_2026.10.22.md).
Evidence: `.scratch/release-review-20261022/`, включая воспроизводимые probes/traces.
Installer `f1f301b3`/trusted lifecycle предварительно сверены с прежним Bundle;
новая publication binding ещё не выполнялась. Новый Bundle tag не создан,
кандидат **не готов к production**.

## Бейджи тарифа и trial как на Dashboard — 2026-10-22

По запросу владельца основные карточки управления и продления используют общий
read-only SubscriptionIdentityBadges:12px uppercase, compact badges и12px иконки;
paid active — статус с точкой и тариф с TariffsIcon, active trial — один жёлтый
«ПРОБНЫЙ» с GiftIcon. Pause/disabled/expired/limited сохраняют прежний приоритет;
expired trial не становится активным. Dashboard не редактировался, длинные имена
переносятся полностью, h2/fallback/условия/API/анимации сохранены. Skeleton согласован.

1161unit/build/оба TypeScript/Biome PASS; final compiled browser470PASS/0SKIP/
0FAIL/0flaky. Первый широкий468/2FAIL был из-за старого ожидания management dialog,
тест приведён к принятой обычной странице без изменения flow или таймаутов.
286files, artifact `c4e1897ea70bf93acd5dd75e78aba9f2c1a9798f50fc2fdbd96fec11a728b7d0`,
source/test `37e0163ac465a33377929a487201d6bf8aecc0d268bb95238a94b15c62184eab`.
[Точный scope и доказательства](docs/subscription-identity-badges-20261022.md).
Владелец отменил добавление/перестановку блока группы: сохраняем прежнее размещение.

## Единая иконка группы пользователя — 2026-10-22

По разрешению владельца в PurchaseContextBanners и group banner GiftSubscription
используется существующий UsersIcon вместо GiftIcon/SparklesIcon. Размеры, тексты,
оформление и переход в «Статусы» сохранены.1161unit, build/оба TypeScript,
focused Biome и20compiled group-navigation browser checks PASS.
Локальные логи: `.scratch/group-icon-20261022/`. Это более поздняя icon-only
правка;479browser/manifest ниже относятся к предыдущему density artifact.
Владелец рассмотрел добавление блока на страницу подписки и перестановку на
продлении, затем отменил предложение («Ладно не трогаем»). Существующее размещение
сохраняется; это не ожидающая реализации задача. Замена иконок остаётся принятой.

## Компактные мобильные действия и формы — 2026-10-22

После согласования пакетов A/B управление подпиской уплотнено только ниже640px:
CTA min72/auto, устройства min64, дополнительные действия text14/12 и p12/gap8;
с640 прежние размеры. Shared read-only CTA layout согласует skeleton/ready без
ранней финансовой ссылки, интервалы между секциями16px и анимации сохранены.
Автопродление использует меньшие оболочки, прежний track52×28 и hit area52×44.
Открытые формы p16/step12, close44, counters48; traffic form также на Dashboard.

1161 unit PASS, build/оба TypeScript/Biome PASS (40 прежних warnings/5infos),
compiled browser479 PASS/17 configured SKIP/0FAIL/0flaky. Дополнительно16 runtime
замеров и9captures; RU375 исследованный участок760,5→614px,320→642,5px.
Прежние неуспешные unit/helper attempts сохранены.286compiled files,
artifact `7adde33aa2c7972b9f8ab4a278aab6416a1df047f6ea4f8ed4128287cdd9cab5`;
source/test `738f462c277c0497a5b857cf8c71f7af5b0f86aa6596136739cf49b4a6acb937`.
[Реализация, измерения и scope](docs/mobile-interface-density-20261022.md).
Это локальная frontend-проверка; Release/production не выполнялись.

## Дополнительные опции постоянно раскрыты — 2026-10-21

По запросу владельца в `Subscription` заголовок дополнительных опций стал обычным
h2 без кнопки/стрелки; доступные действия всегда видны при прежних guards. Удалены
состояние раскрытия, collapse animation и закрытие всего раздела при success.
Отдельные формы/подтверждения и feature guards сохранены, autopay остаётся ниже.
`?section=additional-options` теперь только прокручивает к разделу после route
scroll reset/закрытия устройства overlay; прежний prop сохраняет совместимость.
Loading skeleton отражает раскрытую структуру. Это заменяет датированное поведение
collapsed/expanded ниже; не возвращать accordion.

1161 full unit PASS, build/оба TypeScript/Biome PASS; compiled browser313 PASS/
5 configured SKIP/0 FAIL/0 flaky, ещё4 visual cases PASS.286 файлов:
artifact `75a4a0abf49a2ea275e1015cc5b0866dc8f01b8779e6ee1205c2a69053877543`,
source/test `29d200820e7a5fc1abf01a6ffdaf90e847ce214a95a7be6b6c351ef283f2d267`;
до/после gate совпали. Старые неуспешные запуски сохранены в
[локальном отчёте](.scratch/additional-options-20261021/IMPLEMENTATION_REPORT.md).

## Интерактивные скидочные сценарии мокапа — 2026-10-21

По замечанию владельца расширен существующий локальный helper: теперь28 состояний,
пункты15–28 покрывают account скидку/TEST20/предложения/test_access/expiry и контекст
подписки. До этой правки интерактивные14 состояний включали только скидки устройств;
автоматические product browser tests не заменяли ручные fixtures.
`mock-promo.mts` хранит локальную выгоду, routes реагируют на claim/activate/disable;
тестовый quote30 дней99 ₽ →79.20 ₽, дополнения не получают account процент автоматически.
`PROMO_STATES_CHECK=1` вместе с `USER_STATES_CHECK=1`:28 сценариев и14 скидочных
проверок PASS; лог `.scratch/subscription-management-page/mock-promo-actions-final.log`.
Для скидок стартовать готовый launcher с `LOCAL_PREVIEW_SCENARIO=32` (пункт15),
подробности — [быстрый запуск](docs/agents/full-local-api-mock.md#scenario-quick-start).
Это изменение mock helpers/инструкции; product source/test/artifact сохраняют proof ниже.

## Контекстные действия скидок реализованы — 2026-10-21

После разрешения владельца продолжить реализован единый discount resolver и fresh
GET-проверка перед переходом. Обычная paid active/expired открывает своё продление,
trial/legacy — применимый purchase с ID, daily/limited — управление; несколько без
явного owned выбора — список. Pending/error не считается пустым аккаунтом.
Общий renewal guard переиспользован, classic paid guard и API quotes сохранены.

После промокода/claim/отключения обновляется кеш существующих readonly consumers.
Истёкшая скидка/offer не допускает прежнее действие, время обновляется на открытой
странице, истечение вызывает один readonly refresh без auto-clear. Общий discount
helper также исключает истёкший account процент, не меняя server group price.
RU/EN/FA/ZH: «Условия вашей группы», нейтральное описание неизвестного offer.
Claim не покупает и остаётся на Dashboard; source-specific disable сохранён.

**1161 full unit PASS**, build/оба TypeScript/Biome PASS (952 файла,40 прежних
warnings/5 infos). Финальный compiled browser **821 PASS/5 configured SKIP/0 FAIL/
0 flaky**, ещё32 banner capture cases PASS. Старые3 unit failures и11 browser
failures сохранены историческими; browser tests приведены к ранее одобренному
отсутствию web Back с сохранением проверок browser return. Unit timeout/код админки
не менялись.286 файлов, artifact `5acf17d4770b8acc0bba52230b70595cac3cd03be33cb53b67b7ec9bf904cf35`,
source/test `9bb6361076212c12be298d20e1c762776a44bb8650c9d2b59d0f0f26cca4f270`;
до/после gate совпали. Это локальная реализация; записи «предложение ещё не одобрено»
ниже относятся к состоянию аудита20 октября.
[Реализация и точные проверки](docs/discount-banners-implementation-20261021.md).

## Порядок страницы подписки и аудит скидок — 2026-10-20

По запросу владельца на `/subscriptions/:id` убрана видимая WebBackButton возле
H1. Browser/Telegram Back и контекст устройств сохранены и проверены; header
не восстанавливать только ради прежних web-back tests. Balance-autopay toggle
перемещён отдельной Card ниже Additional options, включая раскрытый блок.
`SubscriptionAutopayToggle` переиспользует прежнюю презентацию/состояние pending;
мутация остаётся в Subscription. Пустой старый settings wrapper не показывается,
условия provider/traffic contents сохранены; loading skeleton переставлен так же.

Проверки текущего UI: **1139 full unit PASS**,34 focused unit PASS, build/оба
TypeScript/Biome PASS (939 файлов,40 прежних warnings/5 infos),147 focused
management/overview/loading browser PASS. Админкод/таймауты/workers unit не менялись;
прежние failed runs сохраняют свой исторический scope, не объявляются исправленными.
286 compiled files, artifact manifest
`1652266402acdd542ed9cf5e6111e23e0b8034c37260215cf78bca8238a8e8b7`,
source/test manifest `77d9d308e19943059849c909776f1a8bfb005da591c4418f5d5ef293b167f8b5`.

Отдельно выполнен **аудит всех discount surfaces**, не реализация новой маршрутизации.
18 current-behavior browser cases +2 promocode-cache cases PASS на320/1280:
Use now всегда generic purchase; paid classic уходит в management через guard,
paid tariff остаётся в покупке, multi selected ID теряется и может показать
«Новый тариф / Все тарифы уже куплены». Подтверждены stale-expiry CTA и отсутствие
active-discount invalidation после промокода. Предложена state-aware матрица с
текущими guards/owned ID/авторитетным API quote. **Предложение ещё не одобрено**;
скидочные handlers/price logic этой задачей не менялись.
[Аудит и рекомендации](docs/discount-banners-audit-20261020.md).
[UI proof](.scratch/promo-banners-20261020/UI_IMPLEMENTATION_REPORT.md).

## Зазор после действия продления — 2026-10-20

По замечанию владельца устранена лишняя пустота между «Продлить подписку» и
«Мои устройства»: резерв96/80px был на Link, а окрашенная Card оставалась ниже.
В375px это давало37.5px видимого зазора, в1280 —21.5px вместо стандартных16px.
Min-height перенесён на видимый HoverBorderGradient с растянутым содержимым;
Link снова обычный block. Loading footprint сохранён, gap теперь16px (±1px).
147 focused management/overview/loading browser PASS на пяти ширинах и двух темах,
без skips/failures/flaky/retries; build/оба TypeScript/Biome PASS. Общий unit1139:
1137 PASS/2 прежних admin audience FAIL, NOT_PASS.286 compiled files:
artifact `a5e0c5d7f028ff463d514bb7b65a8144cc99ddeef2d9f4db7f11d6032797518a`,
source/test `6141d2951f5d6ed7ea8c412e5f0a7d399592a270cd909d7bea03f52e46456af6`;
до/после gate совпали. [Проверка зазора](.scratch/subscription-loading-20261020/IMPLEMENTATION_REPORT.md#painted-gap).

## Скелетоны продления и покупки — 2026-10-20

После отдельной проверки трёх сценариев (renewal/classic purchase/tariff catalogue)
заменены generic PageSkeleton тела на `SubscriptionFlowSkeleton`: реальный H1/Back
остаётся, периоды используют общий `PeriodCardContent` loading-view и тот же grid,
каталог — свою responsive структуру. Пока sales_mode неизвестен, шаблон нейтральный;
после options учитываются известный режим и количество карточек. Скелетон read-only
условий продления резервирует геометрию уже загруженного RenewalSubscriptionInfo.

Причина дополнительного скачка — поздний «Ваша группа»: раньше двигал содержимое
на78–102px. Существующий group GET вынесен из Banner в `usePurchaseContext`:
тот же URL/key/staleTime30s, готовность метаданных учитывается до показа тела.
Optional group error завершается после одной попытки и не удерживает форму;
неизвестная группа не выдумывается. Баннер стал pure presentation. Цены/скидки
и финансовые query gates не пересчитывались этой правкой.

Финальный exact artifact: **344 browser PASS/0 SKIP/0 FAIL/0 flaky**,4 workers,
без retries;120 новых loading cases, остальные — existing period/preview/renewal/
management regressions.65 focused unit PASS, build/оба TypeScript/Biome PASS
(938 файлов,40 прежних warnings/5 infos). Общий unit1139:1137 PASS/2 прежних
admin audience FAIL, **NOT_PASS**. Probe повторён320/1280: сдвиг при замене group
placeholder на данные0px во всех трёх сценариях; это не общий CLS score.
286 compiled files, artifact manifest
`d2adf43477da4a247fa3aef59b6e48ee8387da595cecb1d3e25134e3a7c9bd68`,
source/test manifest `5a80b1ed8a149a4a204c704c6e3d42846d4354d8352fac481e6262aa39657307`;
до/после gate совпали.
[Подробная проверка двух страниц](.scratch/purchase-loading-20261020/IMPLEMENTATION_REPORT.md).

## Загрузка страницы «Подписка» без подтверждённых скачков — 2026-10-20

На exact предыдущей overview-сборке воспроизведены: лишняя заглушка заголовка
сдвигала overview на56px при загрузке full subscription; маленькая строка загрузки
purchase-options меняла положение «Моих устройств» на40.5px (320) /22.5px (1280).
В embedded management добавлен `SubscriptionManagementSkeleton` без второго
заголовка; overview и его placeholder имеют min-height256px. Pending purchase
использует отдельный скелетон, ready action резервирует96px до sm /80px от sm.
Свежие финансовые условия по-прежнему обязательны до показа ссылки; на background
refetch overview остаётся, а action заменяется скелетоном того же размера.
Поздний devices query показывает скелетон счётчика вместо прежнего «Недоступно».

Повтор того же phased API probe: overview и «Мои устройства» меняют позицию на
**0px** между измеренными фазами320/1280. Это локальный geometry proof после
готовности fonts, не обещание нулевого CLS при любом содержимом/сети.
На новом artifact **239 focused browser PASS**, включая50 loading cases:
light/dark ×320/375/768/1024/1280, cold/staggered, cached return, errors/retry.
Допуск стабильности4px не повышался.80 focused unit/build/оба TypeScript/Biome PASS
(40 прежних warnings/5 infos). Общий unit1131:1129 PASS/2 FAIL в прежних admin
audience tests — **NOT_PASS**, не переоценивать как новый backend todo.
286 compiled files, artifact manifest
`07cb5b3cc5485b74bb9e5f1652be83b9bf3815ade149b8bd26e36b22bc77c261`,
source/test manifest `1303baca2d72af21d5596a607eab5a2b8e4b64d657059cf4539ac212a39a9b0f`;
до/после gate совпали.
[Диагностика и проверка загрузки](.scratch/subscription-loading-20261020/IMPLEMENTATION_REPORT.md).

## Компактная карточка на странице «Подписка» — 2026-10-20

Владелец отдельно подтвердил добавление карточки над управлением на
`/subscriptions/:id`: название тарифа/существующий fallback, статус, окончание,
трафик, лимит устройств, серверы флагами. `SubscriptionOverviewCard` читает уже
загруженную полную подписку в embedded management, до существующего CTA.
`SubscriptionConditions` — общий read-only вид условий для карточки и продления;
акцентные ячейки и ChartIcon сохранены. Флаги управления строятся существующим
`getFlagEmoji(country_code)`, имя — fallback/tooltip. Продление сохраняет названия.
Настройки/действия остаются в прежнем management. Это уточняет раннее решение
compact correction ниже; полный Dashboard overview с VPN/таймером не возвращён.

Функциональные проверки текущей версии: **54 focused unit PASS**, **97 focused
management/overview browser PASS** без skips/failures/flaky, включая65 новых
overview cases; build/оба TypeScript/Biome PASS (40 прежних warnings/5 infos).
Общие gates **NOT_PASS**:1128 PASS/1 timeout в прежнем admin audience unit test;
широкий browser390 PASS/5 configured SKIP/1 timeout Connection wizard (mobile).
Отдельный повтор Connection wizard на текущих байтах2 PASS; это не превращает
широкий run в PASS. Таймауты/assertions не ослаблялись; новые статусы проверены
unit, active/expired/trial — в browser; темы light/dark/operator, RU/EN/FA/ZH,
пять ширин320–1280.14 RU screenshots, часть визуально просмотрена.
286 compiled files, artifact manifest
`90b613b991ef35a0b3bf07e606187e436d7b31a1620e7a72e89d98070beda2e9`,
source/test manifest `85d04ca71893ee9540ed43cfd43a06b1770c998f842c6e843f51bb730d314355`;
до/после gate совпали. Это локальная реализация с указанными ограничениями общих
проверок, не полный Release gate PASS.
[Отчёт карточки и точные проверки](.scratch/subscription-overview-20261020/IMPLEMENTATION_REPORT.md).

## Зелёная месячная цена в карточках периодов — 2026-10-20

По просьбе владельца месячная стоимость под основной ценой в общем
`PeriodCardContent` использует существующий `text-success-400`, включая адаптацию
к светлой теме. Это действует в продлении, classic purchase и tariff purchase;
«за14 дней» остаётся нейтральным, поскольку это не цена за месяц. Расчёты сохранены.
Unit **1116 PASS**, build/оба TypeScript PASS, Biome0 errors/40 прежних warnings/
5 infos. Compiled compact-period matrix **90 PASS/0 SKIP/0 FAIL/0 flaky**, без retries:
3 режима ×2 темы ×3 языка ×5 ширин. Снимки RU320/1280 сохранены; четыре просмотрены.
285 compiled files, artifact manifest
`27b59dc295b6015fc4928d76c0277b368812cdea6acdb7e5ca70215f26f7456b`,
source/test manifest `2dee8531f15f4f9d73191e1f8ca7fe028bd7c94691a043b90656a7aa38410489`;
сверка до/после browser gate совпала.
[Запись проверки цвета](.scratch/renewal-structure-20261020/MONTHLY_PRICE_COLOR.md).

## Финальное оформление продления — 2026-10-20

Последние уточнения владельца применены вместе: пояснение об устройствах теперь
использует существующий `FundingNotice` (акцентный фон10%, тонкая рамка, InfoIcon),
как рекомендация возле пополнения. Повтор «Количество устройств при продлении
сохранится» удалён из всех трёх сообщений и RU/EN/FA/ZH; state/maximum rules прежние.
Внешний Card вокруг «Выберите срок» и сетки периодов убран, общий контейнер теперь
обычный div с существующими отступами; карточки периодов и итог оплаты сохранены.
Иконка трафика — существующий `ChartIcon`, как в Dashboard SubscriptionCardActive.

Итоговые gates: **1116 unit PASS**, build/оба TypeScript PASS,
Biome 0 errors/40 прежних warnings/5 infos; **92 browser PASS** без retries/flaky,
**14 visual PASS**. Первый browser run91 PASS/1 timeout сохранён; на тех же байтах
следующий полный run92 PASS без увеличения timeout или retries.
285 compiled files, artifact manifest
`5d7cc055fb94b5546aba5102a67efd5f6ed9599fc61be0b4f7301c555e5a8168`,
source/test manifest `0e00cc2abbe3cedf5f9b96c08e32ba434cfc5053a37494f1c0bd6effbdb62c38`;
до/после gate совпали. Предыдущие варианты оформления ниже исторические.
[Точные записи финального оформления](.scratch/renewal-structure-20261020/DEVICE_GUIDANCE.md#final-presentation).

## Пояснение об устройствах при продлении — 2026-10-20

По согласованному предложению владельца в карточке условий продления удалены
«Продление с текущими параметрами» и RefreshIcon. Вместо них — обычный абзац
без иконки: для действующей платной подписки поясняет отдельную докупку, для
истёкшей — сначала продление, затем «Дополнительные опции». Известный достигнутый
максимум получает отдельный текст без обещания докупки. При безлимите, trial,
daily, обязательном выборе тарифа и прочем неподдержанном неактивном состоянии
пояснение не показывается. Исчерпанный трафик сам по себе не равен expired.
`renewalDeviceGuidance` выбирает только текст; maximum берётся из уже загруженного
classic `purchase-options.devices.max`, для неизвестного максимума не выдумывается.
Новых API-запросов, финансовых условий или изменений Upstream Bot нет.

Текущие локальные gates: **1116 unit PASS**, build/оба TypeScript PASS,
Biome 0 errors/40 прежних warnings/5 infos; **92 renewal browser PASS**, без
SKIP/FAIL/flaky/retries; **14 visual captures PASS**. Браузерный scope: прежняя
renewal locale/theme/viewport матрица и новые active/expired/known-max проверки
на320/1280; active visual — пять ширин, expired —320/1280, light/dark.
Первый unit run и первый browser run с устаревшим ожиданием пяти иконок сохранены;
итоговый browser contract требует четыре после согласованного удаления иконки.
Artifact manifest `94abdcf6603fd2380152e74d1390f4aa9f650ba290bf7ae257332e3ff595207c`,
source/test manifest `8a1beb6b83b16743aada1232ec8af2fa2e729308a2799594beadc96eedfd8746`;
285 compiled files, до/после browser gate совпали.
[Реализация и доказательства](.scratch/renewal-structure-20261020/DEVICE_GUIDANCE.md).

## Второстепенный акцентный фон условий — 2026-10-20

По уточнению владельца серый фон «Трафика» / «Устройств» заменён на существующий
`bg-accent-500/10` в `RenewalSubscriptionInfo`. Это мягкая заливка акцентного цвета,
уже используемая в FundingNotice, без рамки выбранного действия. Два изменения
классов; прочие стили и финансовые контракты сохранены. Серое решение ниже — история.

На новом exact artifact: **1102 unit PASS**, build/оба TypeScript PASS,
Biome 0 errors/40 прежних warnings/5 infos; **80 renewal browser PASS** и
**10 visual captures PASS**, без SKIP/FAIL/flaky. Пять ширин320–1280,
ru/en/fa/zh и operator coverage в renewal suites; снимки light/dark просмотрены.
Текущий успешный unit run относится к новому снимку; прежние два admin FAIL
ниже сохраняются как факты предыдущего запуска, админка этой задачей не менялась.
Artifact manifest `c9398073518219d4d98d721716a8a4a230a180f9e1cdf2838ba3bd9b775efd81`,
source/test manifest `a96cdad2e7f9cde01195491ff661b4eb15ecc990919e1e20cb9c1f89ee5a22b5`;
285 compiled files, до/после browser gate совпали.
[Актуальная запись заливки](.scratch/renewal-structure-20261020/BACKGROUND_FIX.md#accent-follow-up).

## Видимый фон условий продления — 2026-10-20

По замечанию владельца в `RenewalSubscriptionInfo` усилен фон двух блоков
«Трафик» / «Устройства»: существующий `bg-dark-800/50` заменён на `bg-dark-700/50`.
Измерение browser styles показало причину: прежний surface почти совпадал с общей
Card; новый оттенок заметен в обеих темах и следует операторской палитре.
Это styling-only изменение двух классов, без денежных или API-изменений.

Новый build/оба TypeScript и Biome (0 errors/40 прежних warnings/5 infos) PASS.
На новом exact artifact: **80 renewal browser PASS/0 SKIP/0 FAIL/0 flaky**,
**10 visual captures PASS** (320/375/768/1024/1280 × light/dark); locale/operator
coverage включён в renewal suites. Полный unit run — **1100 PASS/2 FAIL** в
`adminBroadcastCreateAudience.test.tsx`; повтор этого файла сохранил два сбоя,
27 payment renewal tests PASS. Полный unit gate сейчас **NOT_PASS**;
исторические 1102 PASS ниже не доказывают новый снимок.
Artifact manifest `b7c3c4954a0baeb501651eccfa1aaf397e7e9f42338c8f28b5079886f1233cf6`,
source/test manifest `f9c6052df66b7d352b7b8bc92b577f326062dfd068242244d408dff49672b9d3`;
285 compiled files, до/после browser gate совпали.
[Исправление фона и границы проверки](.scratch/renewal-structure-20261020/BACKGROUND_FIX.md).

## Структура продления и подсказки пополнения — 2026-10-20

После compact correction ниже завершено локальное улучшение `/subscriptions/:id/renew`
по референсам владельца в существующей дизайн-системе: условия подписки сгруппированы,
выбор периода дополнен «Дольше — выгоднее», итог показывает срок, серверную цену,
ожидаемую дату окончания, баланс и отдельное «К пополнению». Ожидаемая дата — только
предпросмотр; подтверждение и финансовые условия остаются за существующим API.

Общий `FundingNotice` переиспользуется в продлении, покупке classic/tariff/daily,
подарках и через `InsufficientBalancePrompt` в устройствах, трафике, смене тарифа,
серверах и возобновлении daily. Это информационные подсказки; ошибки API сохраняют
свой статус. Пояснение продления учитывает возможное автопродление после пополнения:
«После пополнения баланса подтвердите продление, если оно ещё не выполнено.»
Компактная страница управления, денежные запросы и Upstream Bot сохранены.

Локальный gate до последующего исправления фона выше: **1102 unit PASS**, build/оба TypeScript PASS,
полный Biome — 0 errors/40 прежних warnings/5 infos (924 файла); affected compiled
browser **320 PASS/5 configured SKIP/0 FAIL/0 flaky**, без retries. Viewport:
320/375/768/1024/1280; renewal locales ru/en/fa/zh, темы light/dark/operator;
Telegram Back эмулирован. 4 final visual captures (320/1280 × light/dark) PASS.
Node24.15.0/npm11.12.1. 285 compiled files:

- artifact manifest: `12209c5ad006128f74a32e818836f3938f9c2a99dae2603bbac26e98d7f75f39`;
- source/test manifest: `26d7386f26bc6d1dad7c9000728f25b43f45c6145f50227e4f0a0c9668d4abb6`.

Снимки до/после browser gate и при закрытии задачи совпали. Предыдущие failed runs
сохранены; старые compact proof ниже относятся к прежним байтам.
[Итог и точные записи проверок](.scratch/renewal-structure-20261020/IMPLEMENTATION_REPORT.md).
Статус — **IMPLEMENTED_FRONTEND_VERIFIED**, локально; не новый live/payment/device
PASS или Release. В интерактивном API-мокапе изменения доступны через текущий Vite.

## Локальная реализация страниц подписок — 2026-10-20

По PRD «Страница управления подпиской и раздельная оплата срока и устройств»
завершена frontend-only реализация через TDD. Статус: **IMPLEMENTED_FRONTEND_VERIFIED**.
Это локальный код, не новый Release или production.

Список и управление подпиской становятся обычными страницами; контекстный пункт
«Тарифы / Подписка / Подписки» использует успешно загруженные подписки. Платная
classic-подписка направляется в управление и существующее продление с текущими
параметрами. Существующая докупка устройств получает отдельный ручной return flow
с серверной котировкой и локальным намерением без сохранения новой add_devices
корзины. Upstream Bot остаётся неизменным. Граница сохранённой серверной корзины
фиксируется как ограничение API, без backend-задачи.

После замечания владельца исправлен лишний большой обзор на странице управления:
в оболочке обычной страницы используется прежнее компактное содержимое management,
без карточки «Текущий тариф», трафика, подключения и таймера. Автопродление,
«Продлить», «Мои устройства» и дополнительные опции сохранены. Причина — ранее
передавался только `hideHeader`, но не существующий `embedded` presentation flag.

[ADR 0004](docs/adr/0004-subscription-management-page.md) уточняет прежнее
overlay-решение только для списка/управления подпиской. Root CONTEXT остаётся
источником актуального production baseline. Старые отчёты ниже сохраняют даты
и scope; старые browser PASS не доказывают новый код.

Исторические gates compact correction: **1099 unit PASS**, build/оба TypeScript/полный Biome PASS
(40 прежних warnings/5 infos); affected compiled browser **297 PASS/5 configured
SKIP/0 FAIL**, без retries/flaky, viewport 320/375/768/1024/1280, Telegram Back
эмулирован. 2 новых compact visual captures PASS. 285 compiled files,
artifact manifest `db9f060e38f25df4568c478774048f69d8fb41f8d59a1d3b73e89c28eb514248`,
source/test manifest `93e6041995d9b3f69e102bffadd370c5686fb441db5ffa4bfe787668c7067886`.
Снимки до/после gate совпали. Прежние failed runs сохранены в локальном отчёте;
успешный финальный gate относится к исправленной версии.
Основные финальные gates выполнены на совместимых **Node24.15.0/npm11.12.1**
(официальная checksum-verified portable копия в OS temp). Системный24.11.1 ниже
engine проекта. Текущие записи — compact-unit/build/browser-compact-fix;
прежние292 PASS и e130d87 относятся к исходной полной сводке и не доказывают
исправленные байты. Настройки ПК и project dependencies не менялись.
[Текущее исправление и доказательства](.scratch/subscription-management-page/COMPACT_MANAGEMENT_FIX.md).
[Исторический итог первой реализации](.scratch/subscription-management-page/IMPLEMENTATION_REPORT.md).
Source commit/Release/production/реальных платежей0; owner HEAD сохранён,
исходные public source inputs архивированы; последующие разрешённые изменения
инструкций и compact correction зафиксированы отдельно. Удалённых baseline-файлов0.
Это не новый physical Telegram/payment PASS.

## Актуальный scope владельца — 2026-10-15

**Upstream Bot принимаем как рабочую основу.** Это постоянное решение, а не только
запрет редактировать backend. Следующий чат не должен снова выбирать самостоятельные
backend-тесты из исторического списка S9. Проверяем Custom Cabinet, его запросы к
существующему API, подключение и условия тестового стенда; исправления относятся
к нашему frontend или его тестовому подключению.

Текущее решение о готовности и следующий шаг:

**Владелец2026-10-15 пропустил реальный Telegram/device gate:
SKIPPED_OWNER_ACCEPTED, не PASS.** Решение относится к текущему tested manifest
0aa20cd и текущей подготовке релиза; не требовать телефоны снова и не переносить
waiver автоматически на другие релизы/существенные Telegram-auth изменения.
Frontend готов **к подготовке релиза** с этим
ограничением. Следующий этап — чистый reviewed/tested source/record и обязательные
CI/publication/new Bundle smoke по RELEASE_PROCESS, после разрешения на конкретный
пакет. Сам пакет ещё не собран/опубликован, его новые gates не объявлены PASS.
[Readiness record](docs/releases/FRONTEND_RELEASE_READINESS_2026.10.15.md).

Текущие доказательства и тестовый стенд:

1. **Уже выполнено15 октября14:03 UTC:** exact проверенный Custom Cabinet manifest
   `0aa20cd0f035ec41fd4f0270a1b4e94f04a0bd03075d92e3493334728bd170d0` доступен на
   публичном тестовом адресе. Все284 файла проверены по HTTPS; существующий Caddy
   подаёт отдельную папку, API/health и managed files сохранены. Новых контейнеров,
   backend restarts и DB fixtures0. Guest Chrome320/375/1280, оферта/reload/возврат,
   API-подключение PASS. Повторная выкладка и повтор полного browser gate не нужны.
2. Реальные Android/iOS Telegram/navigation/session/device проверки
   **SKIPPED_OWNER_ACCEPTED**; фактического device PASS не было.

Frontend сохранён на тестовом адресе; device gate уже пропущен владельцем.
Deployment journal `FRONTEND_READY_WAITING_DEVICE` — исторический operational
label, не требование возобновить device gate.
Workspace controller/receipts: `.scratch/cabinet-frontend-stage-20261015/`; источник
test URL — private/target.json, remote_root/owner — prepared.json. Команда `rollback`
возвращает исходную подачу Caddy и сохраняет пакет; **не выполнялась**. Не запускать
старые payment/Installer `finish` и whole-parent cleanup. Cleanup нового frontend
stage пока **NOT_RUN_FRONTEND_RETAINED**; parent `SKIPPED_OWNER_REQUEST` сохранён.
Перед smoke нового Bundle контролируемо убрать frontend override из его пути,
иначе старая тестовая подача может скрыть результат новой установки.
[Актуальный frontend staging report](docs/frontend-staging-20261015.md).

Внутренние capture/refund/recurring handlers, SDK, вся backend RBAC/ABAC-матрица
и повторная приёмка Upstream Bot не входят в этот остаток. Датированные ограничения
ниже остаются фактами своего scope, не становятся PASS и не являются поручениями
на backend. Применимые frontend/installation/Release gates не отменены.
Закрытые1084 unit/1146 browser/merchant callback/lifecycle proofs повторять только
при изменённых входах или конкретной новой причине. Работать последовательно;
новый Release Bundle, production и новые финансовые операции не разрешены.

## Local v1.80.1 frontend integration (2026-10-13)

Latest15 October autonomous remainder: full `npm run check` **PASS** after format-only
normalization of three historical JSONs; all values preserved, exact originals
archived,40 warnings/5 infos remain. On the unchanged284-file0aa20cd artifact,
**8 new functional browser/native-API cases +1 native-login prerequisite PASS**:
three public documents RU/EN/emptyFA/missingZH/cache, inactive reminder create/
update/delete, real WS reconnect with unsaved input, owned audience preview and
actual15-minute access expiry→native refresh without password. Read-only native
Remnawave status200/connected PASS. Source/schema API audit549 declarations:
349 literal/199 possible-template/one known unused wrapper/0 unresolved.
All owned fixtures removed; postflight12:35:15 and native403 restore12:43:25 UTC
PASS, parent preserved, local bridge stopped. Backend/application/E2E/Installer/
site/dependencies unchanged; closed gates not repeated. Current payment discovery
offers only Stars. Public test entry module is not this exact candidate; Bot
menu normalized origin/path matches (query difference harmless). Full S9 PARTIAL:
remaining matrix requires exact public candidate/device actions, provider/data/
operation conditions; no full live/Release PASS.
[Autonomous remainder evidence](docs/compatibility-evidence-v1801-bot-v5-remaining-20261015.md).
The dated paragraphs below retain their original scope and earlier failure states.

Later2026-10-15 unit follow-up: **ordinary npm test now PASS,1084 tests/176 files**,
without CLI flags, with unchanged5000ms timeout. Only `vitest.config.ts` now caps
workers at2, matching the already configured CI command. Same-source diagnostic
baseline:1082 PASS/2 FAIL with13 overlapping module intervals; worker-only control
at2/default5s:1084 PASS. Build/both TS/focused Biome PASS; all284 compiled files
match manifest `0aa20cd0f035ec41fd4f0270a1b4e94f04a0bd03075d92e3493334728bd170d0`.
The completed1146/35 browser gate is retained by exact bytes/source; not rerun.
This supersedes only the current local ordinary-unit gap below; earlier failures
retain their old configuration scope. Full S9/live/Release readiness still incomplete.
[Default unit evidence](docs/compatibility-evidence-v1801-bot-v5-unit-default-20261015.md).

Latest2026-10-15: the missing full local compiled browser matrix is now
**1146 PASS /35 configured SKIP /0 FAIL**, no retries, on new284-file manifest
`0aa20cd0f035ec41fd4f0270a1b4e94f04a0bd03075d92e3493334728bd170d0`.
Five old test contracts corrected; a genuine19–23px loading shift fixed only in
SubscriptionCardSkeleton/Dashboard. Limited/unlimited regression10 PASS with the
original4px allowance. Build/both TS/focused Biome PASS;1084 unit PASS with2 workers/
10s. Ordinary npm test **FAIL:1076 PASS/8 FAIL in six unchanged test files**;
default publication policy remains NOT_PASS. Full S9/live remains PARTIAL/BLOCKED.
No remote/merchant/Panel/commit/Release/production actions; completed native gates
not repeated. [Final browser matrix evidence](docs/compatibility-evidence-v1801-bot-v5-browser-matrix-20261015.md).
The dated14 October paragraphs below retain their historical artifact scope.

Latest 2026-10-14 follow-up: two frontend session-recovery/return fixes now
modify the previously tested snapshot. Final compiled manifest is
`024382a677dc952f64364425698eb8766260ebc5cdbb0360c1592170874c8df9` (284 files).
Seven actual native-API browser stages and two mocked regression tests PASS.
1084 unit tests pass with explicit2 workers/10s budget; build/both TS/focused
Biome PASS. Follow-up default5s unit runs timed out in unchanged audience tests
and are not PASS. Historical398 cases below apply to the original artifact,
not the new bytes; full new browser/default-publication gates remain incomplete.
[Latest browser recovery proof](docs/compatibility-evidence-v1801-bot-v5-browser-recovery-20261014.md).

The selective Upstream Cabinet `v1.80.1` adaptation is now applied in this
working tree. Existing owner changes are retained; no commit, tag or Release
was created. Language/reminder fixes, audience rules and Cashera use the
existing Custom Cabinet consumers. DPI/BSCHEKER/Lite stay excluded.
Installer, site, Upstream Bot and production were not modified.

Local verification: 1084 unit tests, both TypeScript configurations, build and
frontend Biome passed. The rebuilt 284-file artifact and all 945 source/test
inputs match the candidate that passed 398 browser cases (14 configured skips).
Full repository Biome retains three unchanged historical JSON format errors;
Bot v5 targeted VPS startup/HTTPS/JWT/Marketer checks passed. Subsequent
2026-10-14 sandbox and native Installer results are recorded below;
full S9/live, full RBAC/ABAC and physical-client coverage remain PARTIAL.
Read [the transfer report](UPSTREAM_V1.80.1_SYNC_REPORT.md),
[PRD](docs/prd/bedolaga-v1.80.1-bot-v5.0.0.md) and
[ADR 0003](docs/adr/0003-adapt-upstream-v1.80.1-bot-v5.0.0.md).

Older source/production paragraphs below retain their recorded dates.
The newer recorded production Bundle is `bundle-v2026.10.10.1` in root
CONTEXT.md; this local integration did not query or change production.

### Targeted VPS Bot v5 proof

Subsequent 2026-10-14 sandbox stage: native Email registration/login, actual
YooKassa test success/callback/credit, declined-card no-credit and eight
concurrent duplicate native service calls passed. Owner's actual Telegram web
login and four preset role assignment/revocation cycles passed selected HTTPS
checks (99 assertions). Read-only Remnawave permits no subscription mutations.
Owner confirmed Mini App opening on physical Android/iOS; client versions,
navigation and no-repeat-login are not yet confirmed. Owned cleanup/postflight
passed after this check: root/resources/webhook/listeners absent, private snapshot
and DB preserved, management222/config unchanged, Caddy baseline restored.
Merchant UI is unchanged; the test URL was offline immediately after this
sandbox cleanup. Separate later Installer runs are recorded below. Full RBAC/ABAC,
physical-client coverage, first-delivery race and full live remain partial. See
[sandbox evidence](docs/compatibility-evidence-v1801-bot-v5-sandbox-20261014.md).
The following paragraph records the separate completed run of 2026-10-13.

Owner-authorized native main.py/unified lifespan, exact compiled Cabinet,
HTTPS/proxy and 14 actual JWT/API checks passed on Ubuntu24.04/PG15/Redis7.
Native Marketer receives count-only preview and cannot search user lists.
Three services stayed healthy during 60s observation without restart/OOM.
Owned cleanup and independent postflight passed: no test stack/webhook remains;
38 management runtime files and private config are preserved. Native warnings,
uncommitted snapshot scope and remaining S9 limits are in
[the VPS proof](docs/compatibility-evidence-v1801-bot-v5-vps-runtime-20261013.md).
No source, Release or production changes; do not repeat existing gates
without changed identities/inputs or a new concern.

### Native Installer lifecycle and cross-version transition (2026-10-14)

Exact unchanged Installer `75c49bec9c2a764e123fc0ef675f8c45fc22a1ab`, Bot v5,
PG15/Redis7 and the published reference Cabinet from `bundle-v2026.10.10.1`
passed [ten native lifecycle stages](../installer/docs/bot-v5-pg15-lifecycle-20261014.md).
The terminal receipts were recovered after SSH interruption without rerunning
the scenario; that run's source-integrity and cleanup/postflight passed.

The separate [cross-version transition](../installer/docs/bot-v5-pg15-transition-20261014.md)
then passed Bot v4.15/schema0127 → v5/schema0131, intentional failure after
successful native verification, native rollback to old runtime/dump/schema0127,
and a second committed update. Two fixture users/balances and one synthetic
legacy transaction were preserved; subscriptions0, Panel writes0, native exit0.
These Installer runs used the published reference Cabinet, not the new
uncommitted Custom Cabinet artifact. They do not constitute a new Bundle gate.

Latest recorded test VPS state: transition runtime left running at owner's
request, cleanup `SKIPPED_OWNER_REQUEST`; state after a possible reinstall is
unknown. No remote action is needed to consolidate these saved proofs. The
transition container's source-integrity probe and final DB/root archives were
not collected. Earlier cleanup/image proofs apply only to their own runs.
No commit, public Release or production operation; full S9 remains PARTIAL.

### Extended native role checks (2026-10-14)

Owner confirmed the transition VPS was not reinstalled. Fresh verified SSH
preflight and independent final postflight observed the same healthy native v5
stack, unchanged configuration/images and no restart/OOM. Thirty-four new HTTPS
assertions passed custom-role CRUD/permission grants, multi-role union, actual
expiry and deactivate/revoke/reassign/delete enforcement on the same token.
Two native ORM fixture accounts used real HTTPS Email/password login; verified
Email/controller-role setup is fixture data, no manual JWT or owner admin change.

Initial login403 was the original disabled Email-auth setting. One temporary
DB flag enabled the scenario without a restart and was removed afterward,
restoring the original403 gate. New accounts/roles/assignments were removed;
core non-fixture data and local server.env were preserved. The transition VPS
itself remains running; earlier SKIPPED_OWNER_REQUEST cleanup was not performed.
Full ABAC/resource/all-mutation coverage and full S9 remain partial. See
[the extended role proof](docs/compatibility-evidence-v1801-bot-v5-rbac-extended-20261014.md).
Old99 assertions and frontend/schema/browser/lifecycle gates were not repeated.

### Native access-policy checks (2026-10-14)

Subsequent native policy proof on 2026-10-14 produced31 HTTPS checks:
29 expected statuses matched, two failed. Deny policies attached to expired
assignments or inactive carrier roles still apply even though the permission
response excludes those roles. Native source trace and same-token negative
controls confirm L-ABAC-01/02; targeted ABAC gate FAIL, limitations remain OPEN.
No backend change is in scope. Its owned fixtures/policies/temporary Email-auth
flag were removed; independent postflight preserved core records/config/images
and healthy/restart0/OOMfalse. The earlier VPS remains running. See
[native ABAC evidence](docs/compatibility-evidence-v1801-bot-v5-abac-20261014.md).

### First-local payment race fixture (2026-10-14)

A separate empty DB/Redis and the same native Bot image exercised first local
processing of an existing real succeeded test provider object. Eight sessions
started, six provider-confirmed handlers overlapped under a fixture row-lock
guard; balance0→5000 and transactions0→1, paid/linked and subscriptions0.
Two lookups failed: eight-success profile NOT_PASS, financial invariant PASS
only in the observed six-handler scope. This is not actual first merchant or
simultaneous HTTPS delivery. No previous credited payment record was reset.

Read-only diagnosis found transport ReadTimeout masked by installed SDK3.12.1
as AttributeError on absent HTTP response; serial2/3 and parallel8/8 reads.
The later diagnostic did not repeat or replace the financial race. L-PAY-API-01
OPEN; backend/SDK source unchanged. Two native payment modules matched raw Git
at exact SHA in a targeted diagnostic, not a full810-file rerun.
Only the fixture DB/containers were removed. Independent postflight preserved
original core records/config/images and healthy/restart0/OOMfalse services;
the earlier VPS stays running with cleanup skipped. Full S9 remains PARTIAL.
[Payment race evidence](docs/compatibility-evidence-v1801-bot-v5-payment-race-20261014.md).

### Native session recovery / logout (2026-10-14)

Thirty-five new native HTTPS checks matched 35 expected responses: three setup
logins and 32 recovery/denial cases on two new ORM verified Email accounts.
Invalid access 401 → native refresh 200 → same-account access 200; four parallel
refreshes added no token rows. Logout rejected the revoked refresh, including
four concurrent replays; second session and control account stayed usable.
Owned DB-expiry/blocked-status controls denied, restoration resumed access.
Native logout revokes only refresh; unexpired access still returns 200 and
refresh does not rotate the key. Automatic compiled UI recovery is not proved.

Only new accounts/refresh rows and the temporary DB Email-auth flag were removed.
Independent postflight 16:42:46 UTC confirmed original disabled login 403,
unchanged core/refresh projections/config/images and healthy/restart0/OOMfalse.
Earlier transition VPS stays running with cleanup skipped. Three auth modules
match exact Git blobs; this is a targeted new trace, not a full integrity rerun.
Full S9 remains PARTIAL; old gates were not repeated.
[Auth recovery evidence](docs/compatibility-evidence-v1801-bot-v5-auth-recovery-20261014.md).

### Canceled payment authority / missing-row recovery (2026-10-14)

Latest payment follow-up on 2026-10-14: the earlier declined test object now
confirms canceled/unpaid/insufficient_funds via real provider GET. Separate empty
DB/Redis/same-image worker passed three native service cases: false success body,
repeat and missing-local-row recovery. Each ends balance0/transactions0/
subscriptions0, one canceled5000-kopek/RUB unpaid/unlinked record. No provider
writes/new payment, mocks, SDK/source or parent configuration change.
First SDK lookup failed at TLS handshake before user/payment fixtures/stages;
failure retained, then read-only2/2 confirmations allowed one unstarted run.
L-PAY-API-01 OPEN, actual merchant canceled HTTPS delivery not proved.
Postflight18:56:24 UTC removed only new DB/containers and preserved the healthy
parent/core/config/images. Whole VPS cleanup stays skipped; old gates not rerun.
[Canceled payment-state evidence](docs/compatibility-evidence-v1801-bot-v5-payment-state-20261014.md).

### Native callback HTTPS lab (2026-10-14)

Latest native callback layer on 2026-10-14:14/14 checks passed on a closed
loopback TLS app mounting unchanged native payment router/service. Certificate
trust/hostname verified, header/body guards exercised and four concurrent
operator callbacks returned200; canceled/unpaid row with balance0/transactions0/
subscriptions0. Native API replies were genuine, accepted forwarded source a
trusted-hop fixture. This is not true merchant delivery, stock Caddy prefix,
full main.py startup or new Bundle proof. Parent source/Caddy/UFW unchanged;
postflight20:11:59 UTC removed all newly owned DB/containers/root/cert/listener
and preserved fresh-baseline core/config/images. Full S9 PARTIAL, old gates
not repeated. [Native callback HTTPS evidence](docs/compatibility-evidence-v1801-bot-v5-callback-https-20261014.md).

### Current merchant / receiver readiness audit (2026-10-14 UTC)

Read-only readiness audit21:05–21:14 UTC on14 October (00:05–00:14 Moscow15 Oct)
confirmed the owner-authenticated test Merchant Profile matches saved credentials,
historical notification URL/current expanded Caddy app host and four events.
That target currently returns404; parent env has YooKassa off/no shop/key and no
YooKassa DB override. E-PAY-STAND-01 is current test receiver NOT_READY after the
configured sandbox was removed, not a regression/invalidation of earlier real
50 RUB callback PASS. No source/config/provider mutation or closed gate rerun.
Known SDK/access/classic/refund/default-unit limits retain their actual scopes.
[Current readiness / issue audit](docs/compatibility-evidence-v1801-bot-v5-current-payment-audit-20261014.md).

### Genuine public canceled callback completed (2026-10-15 UTC)

The same merchant URL is now native200/enabledtrue through the live Caddy snippet,
with isolated schema0131 DB/Redis/same-image worker and target-only admission.
Parent candidate/env/Compose/core and product source are preserved. Initial setup
rollback and infrastructure diagnostics are retained, not product regressions.
The owner authorized one new declined sandbox50 RUB invoice, created once through
native PaymentService04:31:01 UTC. The checkout displayed insufficient funds, but
native provider GET04:43:40 UTC still reports pending/unpaid/testtrue. Local balance,
transactions and subscriptions0 in that earlier observation. Later, actual
provider `payment.canceled` arrived05:33:02 UTC, passed native IP checks/owned ID
and received200. Independent DB observation06:55:17 UTC confirmed canceled/unpaid,
one5000/RUB row, balance0/transactions0/subscriptions0/no transaction link.
Selected genuine canceled-delivery scope PASS; no operator callback injection.
Owned cleanup and independent exact-rollback postflight06:57:13 UTC PASS: parent
core/config/source/images/three healthy services preserved, owned receiver absent.
Parent whole cleanup SKIPPED_OWNER_REQUEST; temporary route removed, parent original
configuration restored. Historical succeeded50 RUB merchant/credit PASS unchanged;
do not repeat completed gates without new inputs/reason. Full S9 PARTIAL.
[Public callback result](docs/compatibility-evidence-v1801-bot-v5-public-callback-20261015.md).

### Earlier partial local Bot v5 proof

The unchanged v5 source now passed local schema0127→0131/fresh/restore,
Redis7 CacheService operations, 172 selected upstream tests and six real
local ASGI JWT/auth/DB contract cases. Full target runtime/staging remains
PARTIAL at that run's completion; later main.py, sandbox merchant and Installer
proofs are linked above. Full merchant/physical Telegram coverage remains partial.
Frontend source and existing production remain unchanged.
Read [the proof and scope](docs/compatibility-evidence-v1801-bot-v5-local-20261013.md); do not repeat successful local proofs
without changed inputs or another unresolved concern.

## Product

Custom Cabinet is an independently maintained frontend for a compatible
Upstream Bot. It works as a normal web application and as a Telegram Mini App.

The product has three interface modes:

1. Public authentication and transactional flows.
2. User Cabinet for subscriptions, connection, payments and account management.
3. Administrative console protected by roles and permissions.

## Current Source and Production Reference

As recorded on `2026-10-02`, the latest separate stable Custom Cabinet Release is
`cabinet-v2026.10.02.1` at `8fb8cbec19d651fcfaee3bce32621031b3e69965`;
Release Bundle `bundle-v2026.10.02.1` uses Installer
`75c49bec9c2a764e123fc0ef675f8c45fc22a1ab` and unchanged Upstream Bot
`877690a7039d1326b2c00eda3e297879b80c0678`. Exact source CI/public downloads and
targeted disposable Bundle installation/cleanup passed; Installer lifecycle
was reused for exact identities. Accepted OPEN/BLOCKED live limitations remain.

This publication did not deploy production or change `latest`. The last recorded
production deployment is Bundle `v2026.10.01`, Custom Cabinet
`cabinet-v2026.10.01.1` at `5ee46023afc373fbfcef69f6793d440aa1d2cdd0`, artifact
`a068888441ab8cc996a45c9f60fc2f4c750d23efa389041b255c6138f2d3ff7e`, with
unchanged Upstream Bot `877690a7039d1326b2c00eda3e297879b80c0678`.
Read root `CONTEXT.md` and `PRODUCTION_TRANSITION_RUNBOOK.md` and take a fresh
baseline before another production operation.

Future publication follows [`RELEASE_PROCESS.md`](RELEASE_PROCESS.md) and
Installer `docs/deployment-procedure.md`: exact clean source, project releases,
prerelease Bundle, public checks/targeted smoke, reviewed evidence, stable
metadata promotion, then a separately authorized production transition.
Backend code/API/migrations and the selected Bot SHA remain unchanged.

### Historical verified reference — 2026-09-21

The historical production reference, deployed and verified on `2026-09-21`, is
Custom Cabinet `cabinet-v2026.09.21.1` at
`aec198424aa0b489db6d07d1af92bd704aa7c518`, package `v1.74.0`, through Release
Bundle `v2026.09.21.1`, identity
`991c6ec42053876ae6079d82faee14dc7a6e65157fd9d3c8ada3875795b768af`. It
integrates Upstream Cabinet `v1.74.0` at
`57810c7da24b5c142371ed83a6ad5e43a591d454` and runs with Upstream Bot
`v4.10.0` at `9fcebfd7bc075dcca1bb9d1514740039208b906a`.

The protected transition from Release Bundle `v2026.09.14` completed with
`outcome=committed`. A full migration package was checksum-verified on the VPS,
copied off-host and verified again before the update. Database revision `0119`,
the existing PostgreSQL/Redis volumes and immutable runtime images were
preserved. Independent verification passed for exact identities, clean runtime
repositories, three healthy services without restart/OOM, Installer Status and
Diagnostics, firewall, Caddy, public health and Telegram webhook.

The owner-authenticated read-only production browser smoke passed for Dashboard,
Balance, Connection, Profile, Support, tariffs without purchase, Instructions
and selected admin pages. Responsive checks at 390 and 320 pixels also passed
for the changed Dashboard/Instructions/Support scope, including all six lazy
instruction images. No payment, ticket, synchronization, settings save or other
production mutation was performed. Full authenticated Telegram staging, real
Android/iOS Telegram and physical screen-reader checks remain `BLOCKED` and were
explicitly accepted by the owner for this rollout. See
[`LIVE_CHECK_REPORT_2026.09.21.md`](LIVE_CHECK_REPORT_2026.09.21.md).

Release Bundle `v2026.09.07` is an immutable, superseded publication and was
not deployed. A migration-export race was found after publication; the fix was
published and deployed only as `v2026.09.07.1`. Never replace assets under the
older tag.

Release Bundle `v2026.09.21` is also immutable and superseded. Targeted
fresh-install smoke found a nonexistent PostgreSQL digest before production.
Its assets remain unchanged; only corrected Bundle `v2026.09.21.1` may be used.

## Historical Release Reference

The following references are retained as historical evidence and must not be
used as the current production baseline.

- Previous published candidate: Custom Cabinet `cabinet-v2026.09.05.1`, commit
  `5cf81e74dcacad02336e57af6f71d490688cdf88`, through Release Bundle
  `v2026.09.05`. Publication and independent public-asset verification passed.
  The translation-loading limitation was accepted by the owner; a separate
  disposable-VPS installation was skipped by owner decision.
- Previous production management Installer: `v2026.08.25`, commit
  `27e73f662297bbfe459af86cbe00b2a132d8ac0e`.
- Previous fully verified production Release Bundle: `v2026.08.24`, policy
  `rollback-compatible`.
- Custom Cabinet in that historical Bundle: `cabinet-v2026.08.24.4`, commit
  `3250e3a7f31fc2dc6f2c7779a42d86cf99a03210`.
- Production baseline, transition, Status, Diagnostics, health, exact runtime
  identities and authorized browser smoke passed. The later Installer update
  was management-only and did not change the runtime Bundle.
- Real Telegram Android/iOS, physical screen-reader, authenticated staging,
  initial Remnawave synchronization and Remnawave `3.3.0+` GeoCheck remain
  `BLOCKED`, not `PASS`.

See [`COMPATIBILITY.md`](COMPATIBILITY.md) for exact source, image and Release
Bundle identities. Historical live-check reports retain the result known at
their verification date and must not be reinterpreted as current production
state.

## Actors

**Guest**

An unauthenticated visitor using Login, registration, legal, callback or public
purchase flows.

**User**

An authenticated customer who needs to understand subscription state, connect a
device, pay, renew and get support with minimal cognitive load.

**Administrator**

An authenticated operator with one or more administrative permissions.

**Installer**

The supported installation and update path for a committed Custom Cabinet and a
compatible Release Bundle.

**Upstream Cabinet**

The external source Cabinet from which selected changes are intentionally
integrated.

**Upstream Bot**

The compatible external Bot providing Cabinet APIs and Telegram behavior.

**Release Bundle**

An immutable, verified combination of Installer, Upstream Bot, Custom Cabinet
and runtime images.

## Primary User Jobs

- Understand whether the service is active.
- Connect the current device.
- Buy or renew a subscription.
- Check traffic and device usage.
- Top up balance and understand payment result.
- Manage account identity and notifications.
- Reach support when a critical flow fails.

## Product Direction

The user Cabinet prioritizes clarity over feature visibility. Critical status
and primary actions stay visible. Secondary settings and multi-step operations
use progressive disclosure through accessible dialogs or sheets.

The interface must remain compatible with Upstream Cabinet behavior, Upstream
Bot contracts, Telegram navigation and Installer-based deployment.

## Canonical Rules

- Do not use public upstream branding as Custom Cabinet branding.
- Preserve exact technical attribution, source URLs, Git SHAs and licenses.
- Keep presentation separate from authentication, payment, subscription and
  platform behavior.
- Preserve callback routes and deep links when simplifying visible navigation.
- Test user-facing changes through whole browser scenarios and the live-check
  process after installation through Installer.

## Excluded Frontend Capability

BSCHEKER is intentionally unsupported in Custom Cabinet. No route, navigation
item, permission, setting, API client or request, polling, locale, fixture or
feature-specific asset may expose it. This is an executable product boundary,
not a temporary feature flag; `src/noBscheker.guard.test.ts` enforces it during
the normal unit-test gate.

The official Upstream Bot `v4.7.1` still contains its BSCHEKER backend and
migrations. Custom Cabinet's frontend exclusion does not authorize a backend
fork or a claim that the upstream capability is absent. General platform and
accessibility fixes may be adapted from adjacent upstream commits only after
they are separated from reachability contracts. See
[`docs/adr/0001-no-bscheker-frontend.md`](docs/adr/0001-no-bscheker-frontend.md).
