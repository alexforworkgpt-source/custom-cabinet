# ADR 0004: отдельные страницы подписок и раздельные денежные действия

Status: Implemented locally; current unit and focused management UI checks PASS; older aggregate limitations retain their dated scope below

Date: 2026-10-20

## Context

Владелец выбрал самостоятельную страницу управления вместо основного выезжающего
окна. При одной подписке пункт «Подписка» открывает управление, при нескольких
«Подписки» открывает список; для пользователя без подписок остаются «Тарифы».
Границы браузерных и компонентных проверок подтверждены при подготовке PRD.

Исследованный baseline: Release Bundle `bundle-v2026.10.18.1`, Custom Cabinet
`cc17e371d2db45e8c498dc944923d3b8354892e9`, Upstream Bot
`5bda3c56f0afd9f4813e9c6fa48934948b05ebae`. Classic-покупка считает только
новый период, но меняет общий лимит существующей подписки. Для платной подписки
Custom Cabinet должен использовать существующее продление и отдельную докупку.

## Decision

1. `/subscriptions` и `/subscriptions/:subscriptionId` — обычные страницы
   пользовательской оболочки. Главная сохраняет сводку и открывает то же
   управление. Основной management overlay больше не используется.
2. Это узкое изменение presentation-решения ADR 0002/0003. Simple/Lite Mode не
   вводится; баланс, пополнение, подключение и временные диалоги сохраняют свои
   существующие модели. Исторические ADR не переписываются.
3. Один resolver контекстного пункта меню используется в desktop и mobile.
   Подтверждённые trial/expired записи считаются подписками. Loading/error не
   трактуются как отсутствие подписки. Количество основных пунктов остаётся 4.
4. Маршруты и ID сохраняются. Page-wrapper владеет заголовком, возвратом и
   временным просмотром устройств; существующий management остаётся владельцем
   API, настроек и действий. Web/Telegram back сохраняют источник и выбранный ID.
    При переносе сохраняется прежний компактный состав управления: флаг `embedded`
    выбирает содержимое компонента, а не всплывающую оболочку. Последующим отдельным
    подтверждением владельца2026-10-20 перед действиями добавлена компактная карточка
    условий: имя тарифа, статус, дата, трафик, устройства и серверы флагами. Она
    переиспользует read-only `SubscriptionConditions` из продления и уже загруженную
    подписку. Полный Dashboard overview с подключением и таймером не возвращается.
    По следующему запросу владельца видимая web-кнопка Back возле H1 management
    удалена; история, source context и native Back сохраняются. Balance-autopay
    показывается ниже Additional options отдельной Card, со старым guard/мутацией.
5. Платная classic-подписка не попадает в мастер новой покупки через меню,
   прямой URL или возврат. Продление использует `/renewal-options` и `/renew`
   с явным ID и текущим лимитом. Новая покупка, trial conversion и поддержанные
   tariff flows сохраняются по их существующим контрактам.
6. Существующая докупка устройств использует `/devices/price` и
   `/devices/purchase`: delta устройств, явный ID и финальная серверная цена
   на остаток. Клиент не реализует prorating или повторную скидку.
7. Пополнение устройств не создаёт новую серверную корзину: локально хранится
   только target limit и сигнатура условий для конкретного пользователя/подписки.
   Возврат и ручное подтверждение заново читают условия, баланс и цену. Смена
   аккаунта, неизвестный результат, уход до конца проверки и изменение условий
   не запускают слепой повтор покупки. Logout очищает локальные намерения.
8. Неоднозначная нулевая котировка без явной 100% device-скидки не отправляется.
   Неожиданный 402 с сохранённой серверной корзиной блокирует продолжение обычного
   ручного funding flow. Отмена такой корзины существующим Cabinet API недоступна;
   её реализация не становится условием готовности Custom Cabinet.
9. Upstream Bot, его API, бизнес-логика и миграции не изменяются. Финансовые
    действия проверяются frontend-mocks; это не новый backend acceptance scope.
10. По разрешению владельца2026-10-21 активная account скидка использует тот же
    контекстный подход: общий resolver и fresh readonly проверка перед маршрутом,
    owned ID сохраняется, неизвестный список не считается пустым. Claim/переход/
    подтверждение покупки/отключение остаются отдельными действиями. Expiry timer
    перечитывает GET, но не отключает скидку и не покупает. Renewal не пересчитывает
    уже возвращённую серверную сумму из account процента.

## Verification

Уточнение владельца2026-10-21: Additional options постоянно раскрыты, заголовок
не является toggle. Прежние условия доступности действий, отдельные формы и
подтверждения сохранены; source/deep-link прокрутка работает без accordion.
Balance-autopay остаётся ниже.1161 unit,313 compiled browser PASS/5 configured SKIP/
0 FAIL,4 visual cases, build/types/Biome PASS.
[Точный local proof](../../.scratch/additional-options-20261021/IMPLEMENTATION_REPORT.md).

Скидочное продолжение2026-10-21:1161 full unit PASS,821 affected compiled browser
PASS/5 configured SKIP/0 FAIL/0 flaky,32 дополнительных banner captures PASS,
build/оба TypeScript/Biome PASS. Три старых browser сценария приведены к browser
Back вместо ранее удалённой web-кнопки; проверки return URL/содержимого сохранены.
[Точные identities и исторические неуспешные запуски](../discount-banners-implementation-20261021.md).

Последующий UI порядок2026-10-20: full unit1139 PASS, focused unit34 PASS,
management/overview/loading browser147 PASS, build/оба TypeScript/Biome PASS.
Проверены отсутствие web Back, browser/native возвраты и autopay ниже collapsed/
expanded options. Админкод/лимиты не менялись, отдельное исправление прежних
таймаутов или новый широкий Connection wizard proof не заявлены.
`.scratch/promo-banners-20261020/UI_IMPLEMENTATION_REPORT.md` фиксирует identity.

Последующее подтверждённое добавление компактной карточки2026-10-20:
54 focused unit и97 focused management/overview browser PASS, включая65 новых
overview cases; build/оба TypeScript/Biome PASS. Общий unit1128 PASS/1 timeout
в прежнем admin audience test; широкий browser390 PASS/5 configured SKIP/1 timeout
в Connection wizard mobile, отдельный повтор этого wizard на текущих байтах2 PASS.
Общие gates остаются NOT_PASS, не заменяются targeted PASS. Новые API-запросы,
денежные правила и backend-проверки не добавлены.
Точные286-file artifact/source identities и записи:
`.scratch/subscription-overview-20261020/IMPLEMENTATION_REPORT.md`.
Предыдущие датированные proofs ниже относятся к прежним байтам и составу страницы.

TDD выполняется на согласованных seams: пользовательские браузерные сценарии с
API mocks, существующие device/renewal component tests, route/return helpers.
Обязательны unit suite, build с полным TypeScript check и affected browser gate
на точном compiled artifact. Состояние gates фиксируется в отчёте реализации.

Факт исходной реализации 2026-10-20: 1099 unit PASS; полный TypeScript/build и Biome PASS (40 прежних
warnings, 5 infos). Финальная affected compiled browser matrix: 292 PASS,
5 configured SKIP, 0 FAIL, 0 retries/flaky; пять viewport-проектов, Telegram
эмулирован. Дополнительные 3 повторных проверки atomic geometry и 2 visual capture
PASS. 285 файлов artifact и source/test inputs совпали до и после финального gate.
Это frontend-local proof, не проверка реальных списаний или новая production-сборка.
Основные финальные gates выполнены на совместимом Node24.15.0/npm11.12.1 из
официальной checksum-verified portable копии. Повторная сборка285 файлов совпала
побайтно, и browser matrix292/5/0 пройдена тем же поддержанным toolchain.

Уточнение после просмотра владельцем 2026-10-20: в первую версию страницы
ошибочно попал полный обзор существующего компонента. Возвращён прежний
компактный режим внутри обычной страницы; настройки и денежные действия сохранены.
Новый regression-case сначала подтвердил лишний «Текущий тариф», затем прошёл
на пяти viewport-проектах. Текущие gates: **1099 unit PASS**, TypeScript/build PASS,
affected compiled browser **297 PASS/5 configured SKIP/0 FAIL**, 0 retries/flaky,
2 compact visual captures PASS. Новые exact identities и записи до/после gate
сохранены в `COMPACT_MANAGEMENT_FIX.md` локального work item. Прежние292 PASS
относятся к исходной сборке, а не к исправленным байтам.

## Consequences

- Пользователь управляет подпиской в основном разделе, а срок и лимит устройств
  оплачиваются независимыми подтверждаемыми действиями.
- Нет второй реализации management или финансового расчёта для отдельной страницы.
- Сохраняются четыре пункта меню, происхождение upstream и границы проектов.
- Прямые ручные API-вызовы, старые frontend-сборки и уже сохранённые серверные
  корзины не становятся управляемыми новой навигацией.
- Это локальное frontend-изменение. Release Bundle и production требуют отдельных
  разрешений и существующих применимых процедур.

Рекомендуемый уровень рассуждения для следующей задачи: высокий — изменение связывает навигацию и подтверждение денежных действий через существующие API.
