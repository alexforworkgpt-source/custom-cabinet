# Custom Cabinet: автономный остаток S9 — 15 октября 2026

Результат: **PASS_IN_SCOPE**, восемь новых функциональных browser/native-API
сценариев и один подготовительный вход PASS. Полный S9 **PARTIAL**, полный
live/Release gate **BLOCKED**. [Машинные доказательства](compatibility-evidence-v1801-bot-v5-remaining-20261015.json),
[live-check record](releases/LIVE_CHECK_REPORT_2026.10.15_NATIVE_REMAINDER.md).

Владелец попросил проводить оставшиеся проверки подряд. Закрытые платежи,
настоящую отмену/уведомление ЮKassa, Installer lifecycle и роли не запускали заново.
Сохранены прежние [merchant success/credit](compatibility-evidence-v1801-bot-v5-sandbox-20261014.md)
и [genuine canceled delivery](compatibility-evidence-v1801-bot-v5-public-callback-20261015.md).
Upstream Bot используется как неизменённая рабочая основа. Проверялись Custom
Cabinet, его существующие API-запросы, подключение и условия тестового стенда.

## 1. Точные входные данные

- Custom Cabinet HEAD `1169e3cb964caec9a9500ace89bbb53b7e5a89df` плюс сохранённая
  незакоммиченная работа. Upstream Cabinet `a693d30ca6084b9a54b45a72294b99237841ef13`.
- Все284 файла текущей сборки совпадают с manifest
  `0aa20cd0f035ec41fd4f0270a1b4e94f04a0bd03075d92e3493334728bd170d0`.
- Native Upstream Bot `5bda3c56f0afd9f4813e9c6fa48934948b05ebae`, image
  `sha256:bf27d5f0e1b9ec0b46979be6536877ced98b00c822b32d1e03a80a4677da6205`;
  Ubuntu24.04, PostgreSQL15/Redis7, schema0131. Свежие SSH fingerprint и ownership
  совпали; исходные три сервиса healthy/restart0/OOMfalse.
- Chrome155.0.8059.40,1280×900, Windows/Node24.19.0. Compiled frontend локальный,
  API/WS перенаправляются в настоящий native HTTPS с проверкой TLS и hostname.
  Host/Origin переписывает локальный тестовый мост; API-ответы не подменялись.
- Это не новая установка Release Bundle и не развёртывание новой сборки на
  публичном staging-домене. Секреты, адреса стенда, аккаунты и тела служебных
  ответов остаются в ignored private receipts.

## 2. Полная проверка оформления проекта

`npm run check` сначала подтвердил три прежние ошибки форматирования JSON.
В трёх документах `docs/cabinet-record-8fb8cbe-20261002.pending.json`,
`docs/compatibility-evidence-8fb8cbe-877690a7-20261002.json` и
`docs/primary-cabinet-evidence-adoption-20261002.json` нормализованы переносы строк
и оформление. **Все JSON-значения полностью совпадают с исходными**, включая
Git SHA, URL, лицензируемое происхождение и все прежние статусы/ограничения.
Точные исходные байты сохранены в проверенном локальном ZIP до полной перезаписи.

Финальный на этом этапе `npm run check`: **PASS**,913 файлов,0 errors,
40 прежних warnings/5 infos. Это закрывает старый текущий format blocker,
но не удаляет предупреждения и не переименовывает исторические FAIL в PASS.
Runtime/E2E/dependencies не менялись, поэтому закрытые1084 unit и1146 browser
проверок переиспользованы по неизменным входам и compiled bytes.

## 3. Новые сценарии с настоящим API

Выполнены **12:17:32–12:32:42 UTC**. Подготовлены только три собственных ORM Email
аккаунта с verified flag, native password hashes и нулевыми балансами; реальные
JWT выдавал штатный HTTPS login через UI. Верификация Email/SMTP этим не доказана.
Создана одна временная роль для нужных действий и временный DB Email-auth flag.
Для проверки подключения этой роли позднее добавлены только два read permissions;
Panel manage/sync permissions не выдавались. Исходный owner/admin не менялся.
Девять recorded stages включают один отдельно учтённый setup actor; служебные
входы controller также prerequisites и не увеличивают число функциональных PASS.

| Сценарий | Результат и точный охват |
| --- | --- |
| Подготовительный native UI login | PASS, настоящий вход собственного actor и native identity200; это prerequisite, не девятый функциональный сценарий |
| Privacy language/cache | PASS: RU→EN→FA→ZH→RU, публичный документ без входа; native200, RTL/возврат к кешу |
| Offer language/cache | PASS, тот же отдельный consumer и его реальные запросы/отображение |
| Recurrent terms language/cache | PASS, третий публичный consumer и отдельный language cache |
| Reminder create/update с прогретым списком | PASS: native201→PUT200→GET200, после сохранения список сразу показывает новое имя |
| WebSocket reconnect и несохранённая форма | PASS: принудительно разорван только локальный WS tunnel, новый native101; поле сохранило черновик, GET подтвердил отсутствие его записи |
| Direct-user audience preview | PASS: UI передал внутренний ID собственного получателя, native preview200, его identity видна в диалоге, Escape вернул focus; рассылка не отправлялась |
| Удаление собственного напоминания | PASS: native204, последующий nativeGET404 |
| Настоящее истечение15-минутного access token | PASS: после реального ожидания старый токен получил401, повторное открытие Profile вызвало native refresh200 и доступ200 того же actor без пароля |

Для legal-проверок **до вставки подтверждены пустые таблицы** трёх документов.
Добавлены девять собственных строк: RU/EN с маркерами, FA с пустым текстом; ZH
отсутствует. EN вернул свой текст, пустой FA и отсутствующий ZH — default RU;
пользовательский интерфейс показал те же ответы. Возврат RU использовал правильный
кеш, guest остался без refresh token. Чужой текст не перезаписывался.

Напоминание создавалось штатным API неактивным, channel=cabinet и с условием
регистрации3650 дней; toggle/test/send не вызывались. После create/update оно
оставалось неактивным. Проверка preview подтверждает выбранную identity и
отображение/фокус, не объявляет доказанным весь состав/число адресатов рассылки.

Для elapsed-expiry приложение выгружено навигацией в `about:blank`, сохранив
обычное browser storage. Между первым валидным чтением и expired-проверкой прошло
**902.996 секунды**. Часы, exp, подпись и backend lifetime не изменялись. Это
desktop-проверка повторного открытия; не физическое сворачивание Telegram.

Actor uncaught JS exceptions0; общий zero-console/network-error не заявляется:
expired401, deleted404 и разрыв WS являются отрицательными контролями.
Семь native101 handshakes относятся ко всем переходам; это не семь повторов
сценария reconnect. Один такой разрыв проверен с несохранённой формой.

## 4. Подключение и API-инвентарь

1. **Native Remnawave status endpoint:** HTTP200, `is_configured=true`,
   `connection.status=connected`. Существующий native client выполнил чтение
   system stats. Panel writes, sync, создание/активация подписок0. Это PASS
   подключения на чтение, не полного жизненного цикла Panel-пользователя.
2. **Current payment discovery:** настоящий работающий API вернул HTTP200 и
   только `telegram_stars`. ЮKassa/Cashera в текущем стенде не предлагаются.
   Это проверка доступных методов в текущем окружении, а не вывод из свежего
   `docker exec settings` без DB overrides. Она не отменяет прежний merchant PASS.
3. **Static method/path audit:**59 API-файлов,549 request declarations против765
   путей exact native factory schema:349 literal matches,199 possible template
   matches, один missing,0 unresolved. Lifespan новой factory не запускался;
   это source/schema proof, а не публичный OpenAPI или весь live response parity.
4. Единственный missing — старый `adminBroadcastsApi.createEmail`, POST
   `/cabinet/admin/broadcasts/email`. AST-проверка636 runtime source files нашла
   только declaration и0 ссылок использования. Текущая форма использует
   поддержанный createCombined/send. Прежний OPEN сохранён; source не вырезался.

Raw сборка schema потребовала исправления доставки payload в тестовом helper;
первый setup receipt сохранён. Начальная ошибка запуска аудитора из Git Bash
не исполнила аудит; успешный запуск выполнен с корректной обработкой путей.
Эти setup-ошибки не объявлены дефектами Custom Cabinet/Upstream Bot.

## 5. Cleanup и контроль сохранности

Удалены только собственные три аккаунта, роль/назначение, refresh rows, девять
legal rows и напоминание. Temporary Email-auth flag снят. Независимый postflight
**12:35:15 UTC PASS**, дополнительный native HTTP restore control
**12:43:25 UTC PASS**: login снова403/`email_auth_disabled`.

Исходные core/refresh projections, все reminder/legal rows, пять runtime config
hashes, images и три healthy/restart0/OOMfalse сервиса совпали со свежим baseline.
Это не побайтное равенство всей БД/Redis/logs/sequences. Локальный мост остановлен,
его listener отсутствует; весь parent VPS оставлен работающим согласно прежнему
`SKIPPED_OWNER_REQUEST`. Backend/API/business logic/migrations/SDK и Installer/site
не менялись. Provider operations/new payments/Panel writes0; commit/Release/
production0. Raw receipts: workspace `.scratch/bedolaga-v5-remaining-20261015/`.

## 6. Точный остаток: почему полный S9 ещё не PASS

| Область | Статус и условие продолжения |
| --- | --- |
| Физический Telegram Android/iOS | **BLOCKED_ARTIFACT_AND_DEVICE**. Публичный test root HTTP200, но его entry module не входит в проверенный manifest0aa20cd. Нужен отдельный публичный test candidate этой сборки, затем версии ОС/Telegram, навигация, Back, close/reopen/no-repeat-login на телефонах владельца |
| Кнопка тестового Bot | Readiness подтверждена read-only: тот же origin/path, отличие URL — только query. Это не ошибка подключения; меню не менялось. На публичном root сейчас другая сборка |
| Physical accessibility | **BLOCKED_DEVICE_ACTION**: реальные TalkBack/VoiceOver не заменяются Chrome viewport/keyboard tests |
| Capture/refund/recurring/initial paid merchant concurrency | **BLOCKED_TEST_CONDITIONS/AUTHORIZATION**: текущий runtime не payment-enabled receiver, нужны соответствующие изолированные условия и отдельное разрешение на новые финансовые операции. Закрытые success/canceled merchant сценарии не повторять |
| Cashera QR/positive recurring/flag-off discovery | **BLOCKED_PROVIDER_AND_DATA**: метод не предлагается, нет готового тестового merchant/договора и нужных subscription data. Positive purchase/provisioning дополнительно ограничены read-only Panel scope |
| Реальная покупка/продление/Panel identity lifecycle | **BLOCKED_DATA/READ_ONLY_SCOPE**: subscriptions0 и запрет Panel writes; подтверждено только подключение на чтение |
| Full RBAC/ABAC/global/resource/all-mutation и full field parity | **PARTIAL/OPEN**: прежние scoped proofs сохраняются; новые выбранные UI/API-сценарии не доказывают все состояния/операции. L-ABAC-01/02, L-PAY-API-01, Classic/Cashera ограничения не переименованы |
| Новый Release Bundle/public smoke/production | Вне разрешённого задания; нужны соответствующие отдельные авторизации и процедуры |

Таким образом, доступный автономный пакет выполнен последовательно; ни один
BLOCKED/OPEN пункт не объявлен PASS. Остаток касается данных, тестовой публикации,
доступа к провайдерам, разрешённых операций и действий владельца, а не предложения
переписывать рабочую основу Upstream Bot.
