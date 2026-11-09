# Появление QR/колеса и увеличенное колесо — 2026-10-29

## Запрос и исходная точка

Владелец сообщил, что на странице QR-кода и странице колеса не видно появления,
и попросил увеличить колесо. Использован прежний browser seam аудита анимаций:
полный видимый контейнер/его предки, первое открытие/возврат, поздние данные,
отсутствие повторного входа при refetch и reduced motion.

Baseline — текущая owner working tree после Profile avatar, HEAD `0d04a822`,
не чистый HEAD и не production. Source/test identities930files сохранены в
`.scratch/qr-wheel-entrance-20261029/before.json`, исходные3runtime файла — рядом.
Существующие owner changes не откатывались.

По исходникам обе страницы имели старый opacity-only `animate-fade-in`0.4s,
но не общий подъём/stagger кабинета. У Wheel loading header был статичен.
Поэтому «нет появления» здесь не означает отсутствие любого CSS fade: не было
согласованного section entrance. RED-тесты полного QR и Wheel header это
воспроизвели; наличие внутреннего SVG/spin/history effects не считалось proof.

## Минимальные runtime-изменения

1. **ConnectionQR:** существующие root/header/content div переиспользуют
   PageEntrance/PageEntranceItem. Сохраняются QR value, hideLink, валидация
   router state, invalid-state redirect, геометрия кода и обратный маршрут.
2. **Wheel:** PageEntrance сохраняется между loading/ready; заголовок входит
   независимо от config. Полные готовые Card колеса/контролов/legend и истории
   получают существующий staggerItem. Header не входит второй раз после данных,
   refetch не меняет key и не пересоздаёт секции. Error/disabled/back сохранены.
3. **FortuneWheel:** только внешний max-width:176→доступная ширина до320px на
   мобильном,380→448px с sm. Использованы существующие max-w-xs/max-w-md.
   SVG viewBox400, центр/секторы, пять секунд вращения, easing, callbacks,
   результаты, цены и платёжные действия не менялись.

Новых CSS-классов, inline styles, зависимостей, глобального навигационного
перехвата, новых backend/API/БД изменений нет. Вход использует прежние opacity/y8
и очередность50ms. При reduced motion готовые секции сразу видны без движения.

## Размер и доступность управления

Фактический размер SVG одинаков в light/dark:

| Viewport width | Раньше | Теперь |
| --- | ---: | ---: |
|320px|176px|254px|
|375px|176px|309px|
|768px|380px|448px|
|1024px|380px|448px|
|1280px|380px|448px|

Колесо квадратное, SVG и указатель внутри Card, горизонтального overflow нет.
На коротком320×568 возможна прокрутка; кнопка после прокрутки доступна выше
нижнего меню и34px safe area. Условия доступности Spin не изменены.

## TDD и уточнения probes

- `qr-entrance.spec.ts`: RED отсутствия общего подъёма целого QR → GREEN;
  проверяются повторное открытие, окончание движения/полная видимость и reduce.
- `wheel-entrance.spec.ts`: RED статичного loading header → GREEN поздних
  готовых секций, stationary header/refetch, возврата из Profile и reduce.
  Численные кадры прикладываются к test artifacts.
- `wheel-layout.spec.ts`: RED176px при ожидаемом увеличении → GREEN на5ширинах
  в двух темах, с границами Card/указателя и доступностью контролов над меню.

Первый probe возврата ждал только URL `/profile`; добавлено ожидание реального
Profile H1 до browser back, чтобы lazy-переход успел завершиться. Не добавлялись
runtime remount keys ради прохождения теста.

Существующий первый Wheel-test `compactness-flows.spec.ts` ожидал отсутствие
меню — это старое правило, заменённое подтверждённой mobile-navigation задачей
28Oct. Проверка приведена к наличию панели и прокрутке большого колеса;
44px target/34px safe area сохранены, добавлен зазор8px над панелью. Действие
проверяет только существующее Stars confirmation, не создаёт платёж.
Ранний запуск этого старого test остановился ещё на холодной Vite-загрузке;
readiness теперь явно ждёт Spin, без ослабления layout assertions/таймаутов.

После просмотра первого QR screenshot выяснилось, что старый ancillary снимок
сделан в начале входа. В dashboard-qr добавлено ожидание окончания transform
перед screenshot; новый QR test также явно проверяет финальную stationary
видимость. Повтор всего285-case gate выполнен на тех же compiled bytes.

## Финальные проверки

- `npm run build`: **PASS**, оба TypeScript-проекта.
- `npm test -- --maxWorkers=1`: **1167PASS/182files**. Предварительный focused
  run имел50PASS/1timeout на прежнем холодном import Referral в loadingStates;
  следующий полный run PASS с прежними assertions/timeouts. FortuneWheel unit
  сохраняет native SVG layers,5s spin и completion ровно один раз.
- Biome:9затронутых TS/TSX PASS, без оставшихся fixes; diff check PASS.
- Exact dist, Chromium153,320/375/768/1024/1280:
  **285PASS/0FAIL/0SKIP/0flaky**, retries0. Все30новых checks выполнены;
  ещё5проверок короткого320×568 и250existing QR/back/menu/reduced-motion checks.
- Просмотрены Wheel320light/375dark/1280light и готовый QR320. Само движение
  доказано покадровыми assertions, статические снимки — proof геометрии.

Это frontend fixtures/локальный Chromium. Upstream Bot принят как рабочая
основа; реальный backend, платежи, production и физический Telegram/телефон
не проверялись и не изменялись.

## Exact evidence

`.scratch/qr-wheel-entrance-20261029/`:

- `artifact.sha256`:286files, manifest SHA256
  `73c75e4dd84d535318a6ab02f6ad1ebeb3edbb66516408d98c86c46c21545179`.
- `tested-source.json`:932source/test files, SHA256
  `8a54797ed1d06a5f66953e0d27077ba9a054013f9d5dbc64dddcb10ecb52a661`.
- `red-*.log`, `green-*.log`, `wheel-return-probe*.log`, numeric frame/layout
  JSON, `build.log`, `focused-unit.log`, `unit.log`, `final-browser.log`,
  `final-browser-confirmed.log`, `final-browser-results.json`, screenshots/configs.

После gate `identity.mjs --verify` подтвердил неизменность compiled bytes и
source/test inputs. `final-validation.json` подтвердил30новых и5коротких PASS,
все10замеров размеров в двух темах и документацию. Мокап5173 отвечает200,
собственный preview4173 завершён.

Изменения локальные; commit/Release Bundle/production-переход не выполнялись.

Рекомендуемый уровень рассуждения для следующей задачи: средний — входы теперь используют общий механизм, а размеры и возвраты покрыты browser checks.
