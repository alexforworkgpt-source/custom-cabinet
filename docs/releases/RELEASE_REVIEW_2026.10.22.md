# Проверка перед выпуском Custom Cabinet — 2026-10-22

Продолжение после команды владельца «исправляй»: R1–R3 и два Cashera expectations
исправлены локально,1166unit/45targeted compiled browser/build/types/Biome PASS.
Полный browser gate выполняется. [Текущая запись исправлений](RELEASE_FIXES_2026.10.22.md).
Ниже сохранён первоначальный результат проверки исходного `0d04a822`, не статус
исправленных байтов.

Результат: **BLOCKED_FRONTEND — публикация остановлена по условию владельца**.
Дизайн принят владельцем. Выявлены ошибки поведения интерфейса и устаревшие
браузерные ожидания; обязательный browser gate не пройден.

## 1. Разрешение, исходники и точка сравнения

Владелец разрешил подготовку и публикацию нового Custom Cabinet Release и Release
Bundle, необходимые commits/push/PR/merge/tags, публичные проверки, тестовую
установку и stable promotion после успешных gates. Production явно исключён.
Дополнительное условие: при реальном блокере остановиться и назвать причину.

- Проверенный HEAD: `0d04a822a5a47953c047edd901a22ed1f0f7141a`.
- Родитель: `9d6b583180c760c35d6328e87dc955f24345fdd4`.
- Последний stable Bundle по GitHub API и публичному manifest:
  `bundle-v2026.10.18.1`, Installer `f1f301b31b62e8f3234ea438596678ba03c2413a`.
- Cabinet этого Bundle: `cc17e371d2db45e8c498dc944923d3b8354892e9`,
  project tag `cabinet-v2026.10.15.1`.
- Публичный предыдущий manifest скачан без токена; SHA256
  `5c125c2ffd83919117d3f7601de0f6b1c70073cdeb323a84c8e6139f12720867`.
- Upstream Bot остаётся `5bda3c56f0afd9f4813e9c6fa48934948b05ebae`.
- Review использует **`git diff cc17e371 HEAD`**, прямую разницу снимков:
  119 файлов, из них 77 в `src/` и20 в `tests/`. Ветки расходятся от `1169e3cb`;
  трёхточечный diff включает уже выпущенные изменения и не является release delta.

В снимке рабочей ветки отсутствуют некоторые исторические release records/evidence
из stable/main. Это не разрешение удалить их новым PR: при возобновлении сохранить
историю в чистой release-копии и перенести только reviewed delta. Такая release-копия
и новый source commit в этой проверке не создавались.

## 2. Фактически выполненные проверки

Отдельная чистая копия exact HEAD:
`C:\Users\DMITRY\AppData\Local\Temp\opencode\cabinet-release-review-20261022`.
Dependencies установлены `npm ci`; Node24.15.0, pinned Chromium153.
Committed source и существующие тесты в этой копии не редактировались.

| Проверка | Фактический результат |
| --- | --- |
| `npm test` | **1161 PASS**,182 файла,0 FAIL |
| `npm run build` | **PASS**, включая оба TypeScript projects |
| `npm run check` до добавления диагностических probes | **PASS**,0 errors,40 warnings/5 infos |
| Browser на compiled `dist`,320/1280,2 workers,0 retries | **4 PASS /10 FAIL /0 SKIP /0 flaky**,14 случаев |
| Состав browser FAIL | 6 воспроизведений трёх product findings +4 FAIL двух устаревших Cashera tests |
| Secret/public-branding scan tracked candidate | Реальных secret candidates0;3 unsigned JWT — синтетические fixtures; branding matches0 |
| LICENSE/UPSTREAM/COMPATIBILITY/package/lockfile vs stable | Не изменены |

Browser запуск целевой, диагностический, **не полный финальный Release gate**.
`dist` содержит286 файлов; manifest и алгоритм сериализации сохранены в evidence.
Это локальная сборка; тождество будущему публичному архиву не заявляется.
Первый запуск browser runner не стартовал из-за неверного `cwd` локальной
обвязки; он сохранён отдельно и не считается продуктовой ошибкой или PASS.
Следующий запуск использовал правильный root и production preview, не Vite dev.

`npm ci` сообщил15 dependency vulnerabilities:1low/4moderate/10high.
Это наблюдение установки с прежней non-blocking политикой, не свежий успешный
Security Audit/CodeQL gate. Новые publication workflows не запускались.

## 3. Standards review

**Одно замечание к согласованности проверок, затрагивает два теста:**
`tests/e2e/upstream-v180-adaptation.spec.ts:174,227` всё ещё ожидает
`/?sub=42` после закрытия оплаты и кнопку `Additional options`.
По принятому ADR0004 возврат идёт на `/subscriptions/42`, а дополнительные опции
постоянно раскрыты и имеют заголовок, не кнопку.

Оба теста действительно упали на320 и1280. Это4 FAIL тестовых ожиданий, а не
доказательство поломки Cashera. При исправлении сохранить проверки QR/pending
payment, отсутствия лишней покупки и отмены recurring для правильного ID;
продуктовый дизайн к старым ожиданиям не возвращать.

Других подтверждённых существенных нарушений документированных стандартов
в рассмотренном release delta не найдено; отдельное переустройство кода не требуется.

## 4. Spec review: три воспроизведённых frontend findings

### R1 — limited classic: действие возвращает на ту же страницу

**Где:** `src/components/subscription/PurchaseCTAButton.tsx:72–79` и
`src/pages/SubscriptionPurchase.tsx:107–111,199`.

**Воспроизведение:** одна paid classic-подписка42, `status=limited`,
`is_limited=true`, `multi_tariff_enabled=false`. На `/subscriptions/42` виден
«Продлить подписку» с `href=/subscription/purchase`. Клик загружает purchase
options, новый paid-classic guard возвращает на `/subscriptions/42`, та же ссылка
остаётся. Воспроизведено на320/1280; повторные GET и конечный URL записаны.

**Ожидается:** при недоступном продлении не открывать generic classic purchase,
показать применимое действие/недоступность по существующим условиям. Основание:
`.scratch/subscription-management-page/PRD.md`, требование18, строки209–212.
Цикл возникает в сочетании прежнего CTA fallback с новым guard purchase page.
Отсутствие права на продление не является разрешением новой classic-покупки.

### R2 — trial: теряется выбранный subscription ID

**Где:** `PurchaseCTAButton.tsx:75–76`, `SubscriptionPurchase.tsx:24–26,39–40,55–56`.

**Воспроизведение:** основной paid42 и выбранный trial43, multi-tariff включён.
Открыть `/subscriptions/43`, нажать CTA перехода к платной подписке. Ссылка ведёт
на `/subscription/purchase` без `subscriptionId=43`; frontend делает generic
`GET /api/cabinet/subscription`, fixture возвращает основной42 вместо выбранного43.
На320/1280 сохранены href, URL и список запросов. Финансовый POST не выполнялся.

**Ожидается:** сохранить выбранную подписку во всех действиях; основание:
PRD, строка86. Эта ветка CTA существовала в stable — **не объявлять её новой
регрессией относительно cc17e371**. Это незакрытое требование новой страницы,
подтверждённое на текущем кандидате. Неправильное реальное списание не заявляется.

### R3 — устройства: после изменения максимума нельзя выбрать меньшую докупку

**Где:** `src/hooks/useDevicePurchase.ts:102–113` и
`src/components/subscription/sheets/DeviceTopupSheet.tsx:107–116`.

**Воспроизведение:** текущий лимит1, сохранённая цель5 для пользователя1/подписки42
и неизменной подписи подписки. Новый quote допускает добавить только2, максимум3.
Открыть `/subscriptions/42?section=additional-options&action=devices`.
Hook восстанавливает добавку4. На `available=false/reason_code=can_add_limited`
форма показывает «Можно добавить максимум2 устройства», но скрывает весь счётчик,
включая уменьшение выбранной добавки. Подтверждено на320/1280, запросы1→4 записаны.
Кнопка отдельной операции уменьшения общего лимита не заменяет этот счётчик.

**Ожидается:** сбросить устаревшее подтверждение и дать заново выбрать разрешённое
количество; основание: PRD, требование27, строки251–256. Покупка должна по-прежнему
требовать свежего quote и явного подтверждения; API/backend не меняются.

Итог review: **Standards —1 finding (два stale tests); Spec —3 findings**.
В Standards главный вопрос — непройденное browser-покрытие; в Spec — потеря
выбранного контекста trial и недоступные корректные действия R1/R3.

## 5. Evidence, сохранность и выпуск

Локальные доказательства: `.scratch/release-review-20261022/`:

- `source-review.json`, `source-scan-classification.json`, `compiled-artifact.json`;
- `unit-review.log`, `build-review.log`, `biome-review.log`;
- `diagnose.spec.ts`, `playwright.config.ts`, `browser-run-2.log`,
  `browser-result.json`, `browser-summary.json`, `browser-results/` с traces/screenshots;
- `owner-before-docs.json`, `owner-preservation.json`, `previous-bundle.json`;
- `lifecycle-reuse-precheck.json`, локальный work item `release-blockers.md`.

Trusted lifecycle record `b1e5a4a8b8c198ce0bbf7e5b30cb403c41bee977` /
`releases/evidence/lifecycle-pg18-f1f301b-20261018.json` скачан вместе с log;
его checksum и Installer source/archive, Bot, PG/Redis, contracts и Ubuntu24.04 /
linux-amd64 совпали с выбранным прежним baseline. Это preparatory read-only
сверка, не завершённая привязка нового Bundle к source/tag/archive.
При сохранении identities полный lifecycle повторять не нужно.

**Новый Bundle tag не создан и не опубликован.** Commits/push/PR/merge/tags,
Custom Cabinet Release/Release Bundle, Actions dispatch/approval, stable promotion,
SSH и тестовая установка не выполнялись. Production не обновлялся и заново
не обследовался. Последний recorded production baseline — `bundle-v2026.10.18.1`.
Public files/smoke нового Bundle отсутствуют и не отмечаются PASS.

Локальные HEAD/index и исходные файлы обоих проектов сохранены; в owner Cabinet
добавлены только этот отчёт и запись в CONTEXT плюс ignored diagnostic evidence.
Два прежних untracked файла не включались в коммиты. Installer/site/backend source,
существующие Releases/assets/tags/latest/settings не изменялись.

Готовность кандидата к production: **НЕТ — BLOCKED_FRONTEND**.
Следующий необходимый шаг — frontend-only исправления R1–R3 и обновление двух
browser tests с регрессионной проверкой, затем продолжение разрешённого выпуска.
Это не новый redesign и не задача проверки/изменения backend.

Рекомендуемый уровень рассуждения для следующей задачи: высокий — исправления
затрагивают выбранную подписку и восстановление действия рядом с оплатой.
