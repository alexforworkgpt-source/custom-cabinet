# Название тарифа и trial как на Dashboard — 2026-10-22

Статус: **IMPLEMENTED_FRONTEND_VERIFIED**, локальная рабочая копия.

## Запрос и точка сравнения

Владелец попросил оформить название тарифа/пробного периода в основных карточках
страниц подписки и продления как в Dashboard: размер, капс, бейджи и иконки.
Референс — текущий `dashboard/SubscriptionCardActive.tsx`, его header103–142;
не production Release Bundle. Ранее предложенное добавление/перестановка блока
группы отменено владельцем и этим изменением не реализуется.

## Реализация

- Общий read-only `SubscriptionIdentityBadges` используется в
  `SubscriptionOverviewCard` и `renewal/RenewalSubscriptionInfo`.
- У обычной active-подписки: статус с8px точкой и название тарифа с12px
  TariffsIcon. У активного trial: один жёлтый бейдж «ПРОБНЫЙ» с12px GiftIcon,
  без второго названия/дублирующего статуса — как в Dashboard.
- Типографика12/16px, uppercase через CSS, status font-semibold, paid name
  font-medium; rounded-lg8px, border1px, px8/py4, gap6px, межбейджевый gap8px.
  Используются существующие utilities/токены и библиотечные иконки.
- Цвета адаптируются к обычной поверхности условий в light/dark; фиксированная
  контрастная палитра большой Dashboard-карточки не переносится на белый фон.
- Семантический h2 сохраняется. Длинное имя переносится полностью, без обрезания.
  API-названия не преобразуются в storage/данных. Существующий planTitle сохраняет
  fallback «Текущий тариф» и явный legacy «Без тарифа».
- Прежний порядок приоритетов статуса из overview сохранён: pause/disabled/
  expired/limited имеют приоритет над trial/active. У истёкшего trial видны
  «ИСТЕКЛА» и отдельный trial-бейдж; он не становится ошибочно активным.
- На продлении такая строка добавлена над существующими условиями; preview
  загрузки уже переиспользует RenewalSubscriptionInfo и получает тот же header.
  Overview skeleton повторяет форму компактных бейджей. Анимации не менялись.
- Dashboard служит неизменённым референсом; его исходник не редактировался.
  Условия, денежные действия, API, возврат и блок группы сохранены.

## Проверки точной сборки

- `npm test`: **1161PASS/0FAIL**,182файла, прежние worker/timeout settings.
- `npm run build`: **полный TypeScript обоих проектов и build PASS**.
- Полный Biome:0errors,40 прежних warnings/5infos,957files.
- Final compiled browser: **470PASS/0SKIP/0FAIL/0flaky**,4workers,0retries,
  пять ширин320/375/768/1024/1280; identity/overview/management/loading/sales
  loading/Dashboard summary/renewal/payment-mock regression scope.
- Новые85 browser cases сравнивают вычисленные font/line-height/weight/caps/
  radius/padding/gap/icon dimensions с реальным Dashboard в том же браузере,
  затем проверяют обе целевые страницы. RU/EN/FA/ZH, light/dark, paid/trial,
  длинное имя и истёкший trial, отсутствие overflow/неожиданной покупки.
- Focused135PASS перед широким gate. Первый широкий468PASS/2FAIL сохранён:
  старый summary-test ожидал management dialog после перехода на уже принятую
  ADR0004 обычную страницу. Исправлено только ожидание: URL, page heading,
  конкретный overview и отсутствие dialog; product flow/таймауты не менялись.
- Существующая проверка числа renewal SVG обновлена5→6 из-за добавленной
  иконки тарифа; проверки условий/локаций/денежного поведения сохранены.
- Есть16 новых card captures RU paid/trial ×management/renewal ×light/dark
  ×mobile320/desktop1280, часть визуально просмотрена. Это статические снимки
  с reduced-motion в тестовом браузере; код анимаций приложения сохранён.

Доказательства: `.scratch/subscription-identity-20261022/`:
`unit-first.json/.log`, `build-first.log`, `biome.log`, `browser-final.json/.log`,
`browser-full-first.json/.log`, `browser-focused-first.json/.log`,
`browser-results/`, `artifact-final.json`.

286compiled files, artifact:
`c4e1897ea70bf93acd5dd75e78aba9f2c1a9798f50fc2fdbd96fec11a728b7d0`.

Source/test:
`37e0163ac465a33377929a487201d6bf8aecc0d268bb95238a94b15c62184eab`.

До/после финального browser gate identities совпали. Node snapshot helper и
его сериализация те же, что у mobile-density; документы не входят в manifest.
Исторический artifact-verified содержит тот же compiled artifact и тестовый
снимок до коррекции устаревшего summary-ожидания; финальный record — artifact-final.

Коммитов, новых Releases и production-операций не было.

Рекомендуемый уровень рассуждения для следующей задачи: низкий — общий заголовок проверен, небольшие визуальные уточнения можно выполнять точечно.
