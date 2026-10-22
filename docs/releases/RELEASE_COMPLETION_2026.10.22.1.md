# Custom Cabinet и Release Bundle2026.10.22.1 — завершение

Результат: **RELEASED_STABLE_AND_VERIFIED**. Пакет готов к отдельно разрешённому
production-переходу в рамках явно принятых ограничений. Production не подключался
и не обновлялся.

## 1. Опубликованные версии

| Компонент | Точный выпуск / source |
| --- | --- |
| [Custom Cabinet](https://github.com/alexforworkgpt-source/custom-cabinet/releases/tag/cabinet-v2026.10.22.1) | `cabinet-v2026.10.22.1`, `80be79d59791c330dae3fc5eac46d96d2e503357` |
| [Release Bundle](https://github.com/alexforworkgpt-source/installer/releases/tag/bundle-v2026.10.22.1) | **`bundle-v2026.10.22.1`**, stable/immutable |
| Installer, повторно использован | `installer-v2026.10.18`, `f1f301b31b62e8f3234ea438596678ba03c2413a` |
| Upstream Bot, без изменений | `5bda3c56f0afd9f4813e9c6fa48934948b05ebae` |

Bundle identity:
`517e663836e6e7fe5699e7b6f4f7f9253cd2275abefab524659b7e00f6fe9eca`.

Cabinet archive SHA256:
`3b02860e5de08b1f7d6aae56777eeb1b4cb740dc6acfc8460fa449671fdbb8ed`.

Installer archive SHA256, сохранён:
`59594a9e99629299e7b83f5dc86f020593c52207ce6f28fa3debe45619c8c308`.

Предыдущий stable Bundle: `bundle-v2026.10.18.1`, Cabinet `cc17e371`.
Точное сравнение — разница снимков этого Cabinet и нового source, без включения
уже выпущенной работы из расходящихся веток. Исторические release records сохранены.

## 2. Изменения и исправления

Выпущены принятые отдельные страницы подписок, компактные мобильные действия и
формы, общие условия/бейджи тарифа, устойчивые placeholders и контекстные скидки.
Сохранены постоянно раскрытые дополнительные опции, отсутствие web Back возле
H1 управления, native/browser return и принятые анимации. Отменённое размещение
блока группы не возвращалось.

После [первоначального review](RELEASE_REVIEW_2026.10.22.md) исправлены:

1. Unsupported classic CTA больше не ведёт через purchase обратно в управление.
2. Trial CTA сохраняет ID выбранной подписки.
3. При уменьшившемся максимуме устройств можно заново выбрать меньшую добавку;
   свежая цена и ручное подтверждение остаются обязательными.
4. Generic tariffs catalogue не требует неподдержанного primary subscription GET;
   classic и явно выбранный ID сохраняют обязательную проверку своей подписки.
5. Ошибка purchase-options в списке показывает явный Retry своего запроса.

Обновлены два Cashera expectations и стабилизированы датированная discount fixture,
remount/clock checks. Backend, API-контракты, зависимости, lockfile, LICENSE,
Upstream provenance и release workflows не менялись.

## 3. Фактические проверки

| Gate | Результат |
| --- | --- |
| Exact source CI Node24/26 | **1166 unit/182 файла на каждой версии, PASS**; guards/lint/format/types/build PASS |
| CodeQL | Completed; baseline32/source31 open IDs,0 новых; не заявление об устранении всех alerts |
| Fresh Security Audit | **OPEN/non-blocking:**15 findings —4moderate/10high/1critical; прежняя политика сохранена |
| Cabinet / Bundle publication workflows | **PASS**; Bundle143 contract tests, runtime/source/lifecycle bindings и две одинаковые сборки |
| Независимая компиляция | **PASS:** локальная Linux/amd64 `--no-cache` и реально исполненные npm ci/build в первом Actions build; второй workflow build мог использовать cache |
| Публичные файлы | **8 файлов без токена, PASS:** наборы/размеры/hashes/checksums/source/tag/tree/provenance/archive safety |
| Final exact-public-artifact browser | **1766 PASS/35 configured SKIP/0 FAIL/0 flaky**,1801 case,5 ширин,2workers,0retries |
| Новый публичный Bundle install/smoke | **PASS/exit0:**141 Installer source files, PG18/schema0131,287 artifact files,health/публичные routes/webhook404/no-store |
| Cleanup/postflight | **PASS:** только собственные новые ресурсы удалены; прежние volumes и management/Caddy/UFW/launcher/locator bytes/modes сохранены |
| Stable promotion | **PASS**, metadata-only; source/tag/notes/assets/latest сохранены |

Публичный Docker payload содержит287 файлов:286 файлов Vite и стандартный
`50x.html` закреплённого Nginx. Все287 файлов установленного Cabinet сверены с архивом.
Независимый локальный tar.gz побайтно равен публичному.

Для окончательного browser gate использована отдельная проверочная копия62 файлов
тестов. Единственное отличие — пять независимых bounding-box запросов заменены одним
одновременным DOMRect-замером секций Profile. Это устраняет сравнение разных кадров
анимации; все assertions, API fixtures, допуски, timeouts и retries сохранены.
Tagged source и опубликованные assets не редактировались.16 diagnostic repeats PASS
предшествовали полному финальному run. Браузер — pinned Chromium153, fallback fonts;
загрузка удалённых Google Fonts и физические устройства не заявляются PASS.

Прежние1741/35/5 и1765/35/1 runs остаются **NOT_PASS** своих входов. Промежуточные
неуспешные unit/browser/controller попытки сохранены в локальном evidence;
они не переименованы в успешные. Полный итог подтверждён новым фактическим run.

## 4. Разрешения и ограничения

Владелец разрешил пакет и исправления, commits/push/PR/merge/tags, существующие
workflows/approvals, public verification, targeted disposable smoke/cleanup и stable.
Для **текущего исправленного пакета** отдельно выбран пропуск физического
Telegram/Android/iOS: **SKIPPED_OWNER_ACCEPTED**, не PASS. Это применимое новое
решение, не перенос старого разрешения15 октября.

Historical OPEN/BLOCKED и непроверенные реальные provider/recurring/response parity/
renewal/concurrency/Panel сценарии сохраняют свой scope. Mocks и source checks не
превращают их в live PASS. Upstream Bot — принятая рабочая основа; самостоятельная
повторная backend-приёмка и backend changes в этот выпуск не включались.
BSCHEKER/Simple/Lite по-прежнему исключены. Реальных финансовых операций агент0.

Trusted Installer lifecycle переиспользован: exact SHA/tree/archive, Bot,
PG/Redis digests, contracts, Ubuntu24.04/linux-amd64 совпали с record
`b1e5a4a8b8c198ce0bbf7e5b30cb403c41bee977` /
`releases/evidence/lifecycle-pg18-f1f301b-20261018.json`. Новый полный lifecycle и
previous-to-candidate transition не нужны при неизменном protected tuple.
Targeted smoke именно нового Bundle выполнен отдельно.

## 5. Публичные доказательства и сохранность

- [Source PR43](https://github.com/alexforworkgpt-source/custom-cabinet/pull/43),
  [release record PR44](https://github.com/alexforworkgpt-source/custom-cabinet/pull/44).
- [Cabinet publication39845015620](https://github.com/alexforworkgpt-source/custom-cabinet/actions/runs/39845015620).
- [Bundle publication39844607445](https://github.com/alexforworkgpt-source/installer/actions/runs/39844607445).
- [Promotion evidence PR13](https://github.com/alexforworkgpt-source/installer/pull/13),
  [durable log](https://github.com/alexforworkgpt-source/installer/blob/ee423729a23a4a644e8c74a949952d3d31a8ad40/releases/evidence/cabinet-subscription-bundle-2026.10.22.1-checks.log).
- [Guarded promotion39850161557](https://github.com/alexforworkgpt-source/installer/actions/runs/39850161557): SUCCESS.

Сохранены22 прежних Cabinet Releases/22tags и49 Installer Releases/50tags, включая
их notes/assets/source identities. `latest`: Cabinet `cabinet-v2026.10.02.1`,
Installer `v2026.10.01`. GitHub rules/settings не менялись. Основные owner HEAD/index
и несвязанные файлы сохранены; изменения публиковались из отдельных копий.
В основной папке Cabinet исправления остаются в рабочих файлах при прежнем HEAD
`0d04a822`; публичный exact source — `80be79d5` с сохранённой историей release/main.
`site/`, существующие production/backups и backend source не менялись.

Локальный полный пакет evidence: workspace `.scratch/cabinet-release-preparation-20261022/`;
TDD/ранние результаты — `custom-cabinet/.scratch/release-fixes-20261022/`.
Private test logs/env/archives/screenshots не публиковались.

## 6. Production

**Новый Bundle готов к отдельному production-переходу с указанными ограничениями.**
В этой задаче production не подключался и не обновлялся. Последний recorded
baseline — `bundle-v2026.10.18.1`; перед переходом нужны отдельное разрешение,
fresh baseline и новый проверенный off-host backup по production runbook.

Рекомендуемый уровень рассуждения для следующей задачи: высокий — отдельный
production-переход требует свежего backup и точной сверки текущей установки.
