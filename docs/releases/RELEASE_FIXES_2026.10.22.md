# Исправления блокеров Custom Cabinet — 2026-10-22

Статус: **IMPLEMENTED_LOCAL_CHECKS_PASS; BROAD_BROWSER_RUNNING**.
Продолжение [release review](RELEASE_REVIEW_2026.10.22.md) после команды владельца
«исправляй». Исходная точка исправлений: `0d04a822a5a47953c047edd901a22ed1f0f7141a`.
Дизайн остаётся принятым; меняются только подтверждённые ошибки и тестовые ожидания.

## 1. Что исправлено

1. **R1, classic CTA:** `PurchaseCTAButton` при известном classic-режиме и
   неподдержанном состоянии платной подписки использует существующий
   `FundingNotice` вместо ссылки на generic purchase. Текст о недоступном продлении
   переведён на RU/EN/FA/ZH. Loading по-прежнему не даёт финансовой ссылки; обычные
   active/expired renewal, legacy tariff selection и отсутствие подписки сохранены.
   Прежний guard самой classic-покупки не ослаблялся.
2. **R2, trial ID:** CTA trial использует существующий `tariffSelectionPath(id)`.
   Страница покупки уже читает этот ID и передаёт его запросам/форме. Теперь переход
   из выбранного trial43 не вызывает generic GET основной подписки42.
3. **R3, повторный выбор устройств:** при серверном
   `available=false/reason_code=can_add_limited/can_add>0` форма сохраняет счётчик
   и показывает причину недоступности. Увеличение заблокировано, уменьшение доступно.
   При нуле доступных устройств и остальных причинах прежний unavailable-view
   сохранён. До допустимого свежего quote покупка заблокирована; она выполняется
   только после явного подтверждения. Не добавлены auto-POST, локальная формула
   цены или новая обработка backend.
4. **Cashera tests:** существующие сценарии ожидают `/subscriptions/42` после
   закрытия оплаты и видимый heading `Additional options`, без клика по удалённому
   accordion toggle. Проверки QR, payment identity, количества запросов, отсутствия
   лишней покупки и отмены recurring для того же ID сохранены.

## 2. Red → green и проверки

Использованы уже согласованные ADR0004 seams: пользовательский CTA, существующие
component tests докупки и браузерные сценарии с API mocks.

| Проверка | Результат |
| --- | --- |
| R1 до исправления | 4 FAIL/22 PASS: обнаружена нежелательная ссылка |
| R1 после исправления | 26 PASS; промежуточный запуск требовал добавления штатного PlatformProvider в тест |
| R2 до исправления | 3 FAIL/24 PASS: в trial URL отсутствовал ID |
| R2 после исправления | 27 PASS |
| R3 до исправления | 1 FAIL/14 PASS: отсутствовал счётчик уменьшения добавки |
| R3 после исправления | 15 PASS; дополнительно3 negative cases для unavailable состояний |
| Полный `npm test` без одновременного браузера | **1166 PASS**,182 файла |
| Build/оба TypeScript | **PASS** |
| Biome | **PASS**,0 errors, прежние40 warnings/5 infos |
| Целевой compiled browser | **45 PASS/0 SKIP/0 FAIL/0 flaky**,5 ширин,4 workers,0 retries |
| Полный compiled browser | **RUNNING**,1781 собранный случай; результат будет записан после окончания |

Сохранён неуспешный общий unit run:1162 PASS/4 timeout в прежних admin audience/
loading tests при одновременном браузере. Следующий полный run на тех же исходниках
без browser contention прошёл1166/0; код этих тестов, workers и таймауты не менялись.
Первый длинный terminal run был прерван лимитом120s. Первый focused browser run
требовал исправить имя нового тестового locator на существующее «Увеличить кол-во
устройств»/«Уменьшить кол-во устройств»; это не дополнительная продуктовая правка.
Прежние логи сохранены и не объявлены PASS.

В preview logs встречается `ECONNREFUSED` для best-effort activity beacon
`/cabinet/activity/events`: локального live API нет, этот путь не перехватывается
API-fixtures. Поэтому claim «console/network errors0» не делается. Browser mocks
подтверждают frontend flow, не работу настоящих платёжных провайдеров или Telegram.

## 3. Точная сборка и evidence

Node24.15.0, pinned Chromium153. Собранный frontend имеет286 файлов.
Алгоритм manifest: JSON sorted keys, compact separators, UTF-8.

- Source/test/build inputs:
  `b89385311ddbb20d9f7410b59e6818112a45f13802a03283f58086e3418fe9bc`.
- Compiled file manifest:
  `64eb2b6dfd3fac35b468ed0013a7de5b1a9eec4d7ebe1a1a6281d92e5ef7ab7f`.
- Это локальный directory manifest, не checksum будущего публичного tar.gz.

Доказательства: `.scratch/release-fixes-20261022/`: `r1-red.log`,
`r1-green-final.log`, `r2-red.log`, `r2-green.log`, `r3-red.log`, `r3-green.log`,
`unit-without-browser.log`, `build.log`, `biome-final.log`,
`browser-focused-final.json/.log`, `browser-full*`, `artifact-before-full.json`.
Новый штатный browser regression source:
`tests/e2e/subscription-release-regressions.spec.ts`.

## 4. Рамки выпуска

Этот документ не является доказательством новой публикации или полной live-проверки.
Новый tag/Release/Release Bundle и stable promotion ещё не выполнялись.
Production/backend/site/Installer runtime source не менялись. Условия exact-source
публикации, независимых сборок, public verification и targeted smoke сохраняются.
После отдельного вопроса владелец выбрал «Принять ограничение» **для текущего
исправленного выпуска**: физический Telegram/Android/iOS —
**SKIPPED_OWNER_ACCEPTED**, не PASS. Это новое применимое решение, а не
автоматический перенос ограничения15 октября. Остальные release gates сохранены.

Рекомендуемый уровень рассуждения для следующей задачи: высокий — выпуск должен
связать исправленный снимок, итоговые gates и фактические ограничения проверок.
