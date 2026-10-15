# Custom Cabinet: точная сборка на тестовом адресе — 2026-10-15

Результат: **PUBLIC_FRONTEND_READY / DEVICE_CHECK_SKIPPED_BY_OWNER**.
[Машинные доказательства](frontend-staging-20261015.json).
[Live-check record](releases/LIVE_CHECK_REPORT_2026.10.15_FRONTEND_PUBLIC.md).

Позднее15 октября владелец решил пропустить реальную Telegram/device проверку:
**SKIPPED_OWNER_ACCEPTED**, не PASS, для текущей сборки/задачи.
[Текущая готовность к Release-подготовке](releases/FRONTEND_RELEASE_READINESS_2026.10.15.md).
Датированные deployment/browser результаты ниже сохранены без переоценки.

## Постоянная граница для следующих чатов

**Upstream Bot принимаем как рабочую основу.** Решение владельца записано в
корневых и проектных AGENTS/CONTEXT, PRD и ADR0003. Текущая задача — frontend
Custom Cabinet, его подключение к существующему API и условия стенда. Широкие
backend/payment-handler/SDK/RBAC пункты старых S9 reports остаются историческими
фактами, не новым todo. Применимые обязательные frontend/Installer/Release gates
сохраняются; старые OPEN/BLOCKED не объявлены PASS.

Актуальные инструкции: [AGENTS.md](../AGENTS.md), [CONTEXT.md](../CONTEXT.md).

## Что подготовлено

1. **В рабочей копии Custom Cabinet** зафиксирован уже проверенный compiled
   artifact:284 файла, manifest
   `0aa20cd0f035ec41fd4f0270a1b4e94f04a0bd03075d92e3493334728bd170d0`.
   Runtime/E2E/build inputs совпали с прошедшим browser gate; source не пересобирался
   и не редактировался. Собран и проверен отдельный static packet.
2. **На существующем тестовом VPS** выполнен свежий pinned SSH/ownership/runtime
   preflight. Файлы помещены в отдельную собственную папку, указанную в ignored
   `.scratch/cabinet-frontend-stage-20261015/prepared.json:remote_root`.
   Установленный managed Cabinet и его Release state не заменялись.
3. **В активном Caddy только тестового Cabinet site** добавлена временная подача
   этих статических файлов. API/health/cabinet/service пути исключены из frontend
   matcher и продолжают обслуживаться исходными handlers. Исходные bytes/метаданные
   Caddy сохранены; запись атомарная, validate/reload успешны. Новых контейнеров,
   портов, backend restarts, ручных DB fixtures и provider operations0.

На тестовом адресе проверенная сборка готова с **13:56:39 UTC**.
Это тестовая frontend-подача, не Release Bundle, не production update и не
повторная приёмка Upstream Bot.

## Проверка результата

| Проверка | Результат |
| --- | --- |
| Все284 файла скачаны по публичному HTTPS | **PASS**, каждый SHA256 совпал с сохранённым manifest,13:57:24 UTC |
| `/`, `/login`, `/profile`, `/instructions/share-subscription` | SPA index200, точный hash `eb87ff28c95c4b3a8b55f11298feda1117fb43a616a050fd5fec71d2d0853d2d` |
| Несуществующий `/assets/*.js` |404, не подменяется HTML |
| Frontend cache/header |`Cache-Control:no-store`, `X-Cabinet-Test-Artifact` равен manifest |
| Подключение API |Branding/languages/health HTTP200 JSON; branding/languages bytes совпали с preflight, frontend marker на API отсутствует |
| Public Chrome155 guest smoke |**PASS**,320/375/1280 без horizontal overflow |
| Protected entry без входа |`/profile` корректно открыл Login, интерфейс показал доступный login/consent state |
| Публичная оферта |Загрузилась через настоящий API, reload и возврат на Login PASS |
| Uncaught JS exceptions |0 в этом guest smoke |
| Независимый post-observe14:03:35 UTC |Исходные3 containers/images/restart counts и5 managed config hashes сохранены; frontend override active |

Реальный Telegram login/initData и физические устройства этим smoke не
подменяются. Пароль/подтверждение через Bot не вводились, платежи не создавались.
Полный1146-case browser gate и1084 ordinary unit proof не повторялись: application,
E2E/dependencies и все compiled bytes неизменны. Выполнен только необходимый smoke
нового публичного frontend-подключения.

В первой передаче packet возникла ошибка quoting SSH до выполнения Python и
изменения Caddy. Она сохранена. Свежий повторный preflight подтвердил отсутствие
новой папки/изменений; успешная передача выполнена через stdin с проверкой архива
и каждого файла. Это инфраструктурный setup, не дефект кабинета или Bot.

## Текущее состояние и возврат

Frontend оставлен как есть после принятого владельцем пропуска device gate.
Исходный deployment journal `FRONTEND_READY_WAITING_DEVICE` не переписывался;
его label не является новым поручением на телефоны. Активна frontend-подача Caddy;
исходные backend/API и managed files сохранены. Не разворачивать повторно,
не запускать прежние payment/Installer `finish` и не очищать parent VPS.

Контроллер в workspace:
`.scratch/cabinet-frontend-stage-20261015/control.py`.
Он читает только test `installer/server.env`, проверяет fingerprint/ownership,
сохраняет receipts и защищает конфигурацию от перезаписи изменений владельца.

Возврат предыдущей подачи frontend, когда проверка закончена или этого потребует
владелец, подготовлен командой через явный Git Bash:

```bash
"C:/Program Files/Git/bin/bash.exe" -lc 'PYTHONUTF8=1 PYTHONDONTWRITEBYTECODE=1 "/c/Users/DMITRY/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe" "M:/CURSOR2/PC WEB/.scratch/cabinet-frontend-stage-20261015/control.py" rollback'
```

Rollback **не выполнялся**: он вернёт точный исходный Caddy node/link и reload,
не перезапустит Bot и оставит собственный packet/backup на месте. Удаление этого
пакета не является whole-parent cleanup; требует отдельного точного inventory.
Полный cleanup frontend stage пока **NOT_RUN_FRONTEND_RETAINED**, не PASS.
Перед smoke нового Bundle исключить override из пути этого smoke.

## Пропущенный владельцем device шаг и текущая Release-подготовка

Первоначально требовалось на настоящих **Android и iOS** открыть тот же Mini App:
указать версии ОС/Telegram, пройти главная→баланс→профиль→Back, полностью закрыть
и снова открыть приложение, отметить сохранение входа, обрезанные элементы и
ошибки интерфейса. Этот шаг теперь **SKIPPED_OWNER_ACCEPTED**, не повторять запрос.
Далее — подготовка точного Release-пакета и его обязательные gates при применимом
разрешении. Backend suites/новые финансовые сценарии из исторического остатка не
являются продолжением текущей frontend-задачи.

Контекст и готовность сохранены для нового чата; source/commit/tag/Release/
GitHub settings/production/site не менялись. Адреса, credentials и original Caddy
остаются в ignored private receipts, screenshots не публикуются.
