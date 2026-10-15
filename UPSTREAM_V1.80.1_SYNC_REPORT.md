# Синхронизация Upstream Cabinet v1.80.1 — рабочий Custom Cabinet

## Фаза S: граница владельца / публичный frontend для Telegram 2026-10-15

В8 основных policy/context/spec документах закреплена рабочая основа Upstream Bot:
текущая задача — только наш frontend/connection, не повторная backend приёмка из
широкого исторического S9. Exact0aa20cd/284 файла уже доступны на публичном test
адресе через существующий Caddy из отдельной папки. Все284 HTTPS hashes совпали,
guest Chrome320/375/1280, оферта/reload/возврат и API connection PASS. API/health,
5 managed config hashes, исходные3 containers/images/restart counts сохранены;
нет новых DB fixtures/контейнеров/backend restarts/provider операций.

Позднее владелец пропустил реальную Telegram/device проверку текущего кандидата:
**SKIPPED_OWNER_ACCEPTED**, не PASS. Frontend готов к Release-подготовке; actual
clean source/CI/publication/new Bundle smoke gates ещё требуются. Initial journal
**FRONTEND_READY_WAITING_DEVICE** — история, не новый device todo.
Не выкладывать тот же frontend и не запускать старые payment/backend suites.
Frontend route rollback подготовлен, не выполнялся; cleanup NOT_RUN_FRONTEND_RETAINED,
parent whole cleanup SKIPPED_OWNER_REQUEST. Новых commit/Release/production нет.
[Текущий frontend report и управление](docs/frontend-staging-20261015.md).
[Readiness и owner waiver](docs/releases/FRONTEND_RELEASE_READINESS_2026.10.15.md).

## Фаза R: автономный native остаток S9 / full check 2026-10-15

Выполнено подряд8 новых функциональных browser/native-API сценариев +1 setup,
12:17:32–12:32:42 UTC, exact0aa20cd284-file artifact, native TLS, no API mocks.
Public privacy/offer/recurrent RU→EN→emptyFA→missingZH→RU/cache PASS; inactive
reminder create/update/delete и warm-list refresh PASS; native WS reconnect с
unsaved input PASS; owned audience preview/focus/send0 PASS; реальное ожидание
902.996s, старый access401→native refresh→тот же actor200 без пароля PASS.
Дополнительно native Remnawave status200/connected на чтение, Panel writes0.

Full npm run check PASS: три старых JSON только отформатированы, все значения
совпадают с snapshot, исходные байты архивированы;40 warnings/5 infos сохранены.
Runtime/E2E/dependencies unchanged: закрытые1084 unit/build/1146 browser+35 skips
переиспользованы. Static API audit59 files/549 declarations против765 native
factory paths:349 literal/199 possible template/one known unused legacy wrapper/
0 unresolved; не full live field/parameter proof. AST636 runtime files:uses0.

Owned users/role/refresh/reminder/9 legal rows/temp Email flag удалены; independent
postflight12:35:15 и native403 restore12:43:25 UTC PASS, исходный parent сохранён,
локальный мост stopped. Financial/provider/Panel mutations0, закрытые payment/
lifecycle/role suites не повторялись. Actual discovery сейчас Stars only;
публичный test root содержит другой entry module, Bot menu origin/path совпадают
(query variation не дефект). Physical/current exact-public-candidate/provider/data/
operation gaps остаются BLOCKED, full S9 PARTIAL; source backend/API/SDK/Installer/
site и commit/Release/production не менялись.
[Canonical remainder matrix](docs/compatibility-evidence-v1801-bot-v5-remaining-20261015.md).

## Фаза Q: ordinary npm test / worker policy 2026-10-15

При неизменных source/assertions diagnostic baseline с автоматической
параллельностью дал1082 PASS/2 FAIL и13 overlapping module intervals. Изменение
только workers до2 при прежнем timeout5000ms дало1084 PASS. В `vitest.config.ts`
зафиксирован тот же лимит2, который уже указан в CI; workflow не менялся.
Финальный обычный `npm test` без flags/reporters **1084 PASS/176 files**,
08:28:49–08:30:18 UTC. Build/both TS/focused Biome/diff check PASS.

Все284 output files побайтно совпали с manifest
`0aa20cd0f035ec41fd4f0270a1b4e94f04a0bd03075d92e3493334728bd170d0`;
application/E2E source unchanged, закрытый1146/35 browser gate не повторялся.
Прежние ordinary-unit FAIL сохранены как история старой config; текущий local
unit gap закрыт. Full S9 PARTIAL; full live/Release/lint/CI/publication не объявлены
PASS. Backend/Installer/site/remote/merchant/commit/Release/production unchanged.
[Canonical unit evidence](docs/compatibility-evidence-v1801-bot-v5-unit-default-20261015.md).

## Фаза P: full local compiled browser matrix 2026-10-15

Initial exact14 October artifact:1115 PASS/35 SKIP/26 FAIL. Five test files had
old Dashboard selectors/layout, dev-only dictionary interception or incomplete
renewal fixtures. Corrected current contracts retain prices, no-money-mutation,
retry/return, visible selection and geometry checks. They exposed a real19–23px
loading shift: SubscriptionCardSkeleton/Dashboard now reserve progress/metric/
action heights using existing utilities and known unlimited state. Expanded
limited/unlimited red8 FAIL/2 PASS → green10 PASS, original4px allowance retained.

New284-file manifest `0aa20cd0f035ec41fd4f0270a1b4e94f04a0bd03075d92e3493334728bd170d0`:
one final full run07:51:28–08:03:00 UTC, **1146 PASS/35 configured SKIP/0 FAIL**,
five viewport projects/two workers/no retries; local API fixtures, not live Bot.
Build/both TS/focused Biome PASS;1084 unit PASS with2 workers/10s. Ordinary npm
test1076 PASS/8 FAIL in six unchanged test files, default policy remains NOT_PASS.
Old failures and original artifact archived; final bytes/inputs preserved and
preview listener stopped. Earlier native merchant/roles/lifecycle not repeated;
backend/Installer/site/remote/commit/Release/production unchanged. Full S9 PARTIAL.
[Canonical browser matrix report](docs/compatibility-evidence-v1801-bot-v5-browser-matrix-20261015.md).

## Фаза O: native callback loopback HTTPS 2026-10-14

Closed TLS stand с unchanged native create_payment_router/PaymentService,
separate schema-only0131 DB/Redis/same image.14/14 checks: unpinned certificate
rejection, pinned chain/hostname TLS1.3, девять native HTTP guards и четыре
concurrent operator callbacks4×200. Общий overlap четырёх ASGI intervals0.699614s,
real SDK lookups4; final one canceled/unpaid5000/RUB row, balance0/transactions0/
subscriptions0. False succeeded/paid claims не дали credit.

IP check включён, native allowed list неизменён; accepted provider IP задан
тестовым trusted forwarded-hop. No native request/response/handler/SDK mocks;
transparent ASGI observer only. Это не настоящая merchant delivery, публичный
Caddy /api path, main.py/full lifespan или новый Bundle. Native missing payment
ID дал500processing_failed, refund.succeeded200ignored — не claims полноценной
schema validation/refund accounting. Все прежние provider/paid-race limits OPEN.

Owned DB/Redis/worker/root/key/cert/loopback listener удалены. Independent
postflight20:11:59 UTC preserved fresh-baseline core/five config hashes/images,
healthy/restart0/OOMfalse parent; Caddy/UFW/source/server.env unchanged. Whole
transition VPS cleanup SKIPPED_OWNER_REQUEST. Provider/Panel/subscription writes0,
commit/Release/production0. Старые completed suites не повторялись.
[Canonical callback HTTPS report](docs/compatibility-evidence-v1801-bot-v5-callback-https-20261014.md).

## Фаза N: real canceled object / native local-row recovery 2026-10-14

Ранее declined sandbox50 RUB object теперь подтверждён real GET как canceled,
paidfalse/testtrue, reason insufficient_funds. Provider mutations/new payments0;
старый succeeded/credited object не сбрасывали и не replayed. Отдельная empty
schema-only0131 DB/Redis и same native image, native ORM pending fixture сbalance0.

Первый native SDK lookup: TLS handshake timeout→ReadTimeout→None.status_code
AttributeError, остановка ДО fixture user/payment и service stages. Результат
NOT_PASS_PROVIDER_READ и cleanup сохранены. Два последующих read-only native
lookups подтвердили canceled/unpaid; source/SDK/timeouts не менялись. Это стало
причиной одного запуска ещё не начатых трёх сценариев, без повтора закрытых gates.

Три native service cases PASS: ложные success/paid/amount/currency/target claims,
sequential repeat и missing owned local row restoration по real provider data.
После каждого balance0/transactions0/subscriptions0, одна canceled/unpaid/
unlinked5000-kopek/RUB запись. Workerlogged4 actual provider reads, no response
mocks/test-added handler patches, no Bot instance. Это не настоящая merchant
canceled HTTPS delivery/IP/router/concurrency proof. L-PAY-API-01 OPEN; прежний
eight-success financial race NOT_PASS не менялся.

Owned DB/Redis/worker удалены в обеих попытках. Independent postflight18:56:24 UTC
PASS: original core/config/images сохранены, healthy/restart0/OOMfalse, local
server.env unchanged. Parent transition VPS оставлен, whole cleanup
SKIPPED_OWNER_REQUEST. Frontend/SDK/backend/Installer/site source unchanged;
publication/production0. S9 PARTIAL, remaining merchant/ABAC/device/default-gate
limits сохранены. [Canonical payment-state report](docs/compatibility-evidence-v1801-bot-v5-payment-state-20261014.md).

## Фаза M: compiled browser recovery и frontend fixes 2026-10-14

На original compiled artifact обнаружен FAIL восстановления после обрыва:
ключ сохранялся, native API отвечал, но UI оставался на Login. Owner разрешил
frontend fix с failing browser regression. В ServiceUnavailableScreen теперь
различаются публичная доступность API и завершённый вход; незавершённая сессия
перезапускается на сохранённом same-origin маршруте. Второй red/native check
обнаружил повторное чтение/остаток return URL в Login; адрес фиксируется на одну
попытку, storage fallback потребляется один раз. Изменены два runtime файла и
новый tests/e2e/session-recovery.spec.ts, без новых стилей/backend/dependencies.

Final284-file manifest `024382a677dc952f64364425698eb8766260ebc5cdbb0360c1592170874c8df9`:
семь native-API browser stages PASS в Chrome155/1280×800/RU; два mocked regressions
PASS.1084 unit PASS при `--maxWorkers=2 --testTimeout=10000`; build/both TS и scoped
Biome PASS. Default5s unit follow-up runs FAIL по timing неизменённых audience
tests; их не объявлять PASS. Old398 browser cases относятся к original artifact;
full new browser/default-publication gates не выполнены. Ранние FAIL/setup/runner
receipts сохранены; новые inputs/исправление — причины повторных focused gates.

Compiled frontend локальный, настоящий native HTTPS API через verified TLS proxy;
это не новая VPS установка/публичный Bundle. Parent Cabinet остался published
reference. Два owned ORM verified Email аккаунта с UI password/JWT, temporary
native DB Email-auth flag; actual gate без API mocks/manual JWT. Обрывался только
локальный transport, VPS не останавливался. Expected console transport/401 errors
сохранены, uncaught JS exceptions0; Telegram local widget domain invalid вне scope.

Fixture accounts/refresh rows/flag удалены, browser storage очищен, local bridge
остановлен. Independent postflight18:19:51 UTC: original login403/core/refresh/
config/images сохранены, healthy/restart0/OOMfalse. Прежний VPS оставлен, whole
cleanup SKIPPED_OWNER_REQUEST. Существующие Installer/roles/ABAC/payments не
повторялись. S9 PARTIAL; все прежние native/merchant/device OPEN ограничения
сохранены, новых commit/Release/production операций нет.
[Canonical browser recovery report](docs/compatibility-evidence-v1801-bot-v5-browser-recovery-20261014.md).

## Фаза L: native HTTPS session recovery / logout 2026-10-14

После fresh SSH fingerprint/owner/runtime preflight на прежнем unchanged Bot v5
прошли 35/35 HTTPS expectations: три setup login и 32 recovery/denial запроса.
Два новых ORM verified Email аккаунта, три настоящие password sessions, no manual
JWT. Invalid access401 → refresh200 → same identity200; четыре concurrent
refresh200 без новых token rows; logout/replay401, включая четыре concurrent
replays. Второй actor session и другой account сохраняют refresh/access.
Owned DB-expiry и blocked-status controls дали deny; restoration вернул access.

Native logout отзывает только refresh, unexpired access продолжает давать200;
refresh token не ротируется. Это сохранённый native contract, не дополнительная
гарантия. Три relevant auth modules равны exact raw Git; full810-file не повторён.
Новые accounts/refresh rows и temporary Email-auth DB flag удалены. Independent
postflight16:42:46 UTC PASS: original disabled login403, core/refresh projections,
configuration/images сохранены, healthy/restart0/OOMfalse. Прежний transition VPS
оставлен работающим, его cleanup SKIPPED_OWNER_REQUEST не выполнен.

HTTPS API-only proof: automatic compiled UI retry/storage/redirect, actual JWT
lifetime, offline/timeout recovery и physical Telegram не подтверждены.
S9 PARTIAL; L-ABAC-01/02, L-PAY-API-01 и остальные прежние ограничения OPEN.
Старые frontend/schema/browser/lifecycle/role/ABAC/payment gates не повторялись.
Source/merchant/Panel/Release/production изменений нет.
[Canonical auth recovery report](docs/compatibility-evidence-v1801-bot-v5-auth-recovery-20261014.md).

## Фаза K: first-local native payment race fixture 2026-10-14

Separate empty test DB/schema-only0131/Redis и same native image. Existing real
succeeded50RUB/test provider object использован только для GET; новый native
pending local record начинал с balance0/transaction0/is_paidfalse/linkfalse.
Восемь independent sessions стартовали, шесть provider-confirmed native calls
дождались снятия fixture row lock. Итог balance5000/transaction1/paid/linked,
subscriptions0. Financial invariant PASS в этом scope; два provider reads
вернулиFalse, поэтому eight-success profile **NOT_PASS**, S9 PARTIAL.

Saved traces: ReadTimeout маскируется SDK3.12.1 как None.status_code AttributeError.
Read-only diagnostic дал serial2/3 и parallel8/8; parallel-only cause не доказана,
financial fixture не перезапускалась. L-PAY-API-01 OPEN; backend/SDK source
не менялись. Два payment modules равны raw Git точного SHA в scoped diagnostic.
Это first local fixture processing, не actual first merchant/HTTPS callbacks
и не повтор прежних already-credited duplicates. Новые DB/Redis/worker удалены,
independent postflight PASS, original core/config/images/runtime сохранены.
Прежний VPS оставлен, его cleanup SKIPPED_OWNER_REQUEST не выполнен.
[Canonical payment race report](docs/compatibility-evidence-v1801-bot-v5-payment-race-20261014.md).

## Фаза J: native ABAC policies 2026-10-14

На прежнем test runtime проверены31 actual HTTPS запрос и четыре состояния
прав с native ORM/CRUD policy fixtures. 29 expected statuses совпали; два
ожидаемых users200 вернули403 после expiry/inactive carrier role. Auth permission
response уже исключает carrier role, но native policy selector продолжает
учитывать её deny policy. Negative controls удаления назначения/политики
восстановили200 на том же token; source trace подтверждён.
**Targeted ABAC gate FAIL, L-ABAC-01/02 OPEN, S9 PARTIAL.**

Matched scope: resource/action/wildcards, UTC-window/IP conditions, selected
allow/deny behavior и base RBAC boundary. Глобальные политики не менялись.
Backend source/API/migrations неизменны; backend implementation не входит
в задачу. Новые accounts/roles/assignments/policies и temporary DB Email-auth
flag удалены. Independent postflight PASS: original flagfalse, core records/
configuration/images сохранены, healthy/restart0/OOMfalse. Прежний VPS оставлен
работающим; его cleanup SKIPPED_OWNER_REQUEST не выполнен. Старые99/34 role,
frontend/schema/browser/lifecycle/transition gates не повторялись.
[Canonical ABAC evidence](docs/compatibility-evidence-v1801-bot-v5-abac-20261014.md).

## Фаза I: extended native role coverage 2026-10-14

Owner подтвердил, что transition VPS не переустановлен. Fresh known fingerprint,
owner/runtime preflight PASS. На unchanged Bot v5 проверены34 новых HTTPS
assertions и8 состояний прав: custom-role CRUD/границы выдачи permissions,
multi-role union/max level, actual expiry, deactivate/reactivate,
revoke/reassign/delete cascade на прежнем token. Accounts/controller role и
Email verification — native ORM fixtures; вход через настоящий HTTPS
Email/password, без ручного JWT и без изменения env Superadmin.

Первый403 вызван штатным Email-auth flagfalse, не RBAC regression. Один
temporary DB flag включён через native CRUD и затем удалён; original disabled
gate восстановлен. Новые accounts/roles/assignments удалены; independent
postflight подтвердил unchanged core data/config/images, три healthy/restart0/
OOMfalse сервиса. Прежний transition стенд оставлен, его cleanup
SKIPPED_OWNER_REQUEST сохранён. Старые99 assertions/frontend/schema/browser/
lifecycle/transition не повторялись; source/Release/production не менялись.
Полный ABAC/resource/all-mutation и прочие S9 scope остаются PARTIAL.
[Точный extended role report](docs/compatibility-evidence-v1801-bot-v5-rbac-extended-20261014.md).

## Фаза H: native cross-version transition 2026-10-14

Последующий targeted сценарий exact Installer75c49be с unchanged Bot прошёл
fresh v4.15/schema0127 → fixture seed → update v5/schema0131 → намеренный
отказ после успешного native verify-release → native rollback старого runtime
и dump/schema0127 → второй committed update v5/schema0131. Все четыре стадии
PASS, native exit0; два пользователя/баланса и одна synthetic legacy transaction
сохранены, subscriptions0/Panel writes0. Это сохранение данных до upgrade,
не доказательство удержания новых записей после upgrade при restore старого dump.

Использован published reference Cabinet из bundle-v2026.10.10.1, а не новый
uncommitted artifact Custom Cabinet. Native receipts/full log уже локально
сохранены. Cleanup **SKIPPED_OWNER_REQUEST**: runtime оставлен на тестовом VPS
для переустановки владельцем. Source-integrity probe этого контейнера и final
DB/root archives не собирались; ранние cleanup/image proofs не переносятся.
Состояние после возможного reinstall неизвестно; новых remote действий не было.
[Долговечный Installer report](../installer/docs/bot-v5-pg15-transition-20261014.md).

**S9 PARTIAL**: полный RBAC/ABAC, first-delivery race, остальные merchant/device
flows и read-only Panel ограничения не закрыты. PG18/new public Bundle smoke
не проверены; публикация evidence, commit/Release/production не выполнялись.
Предыдущие фазы ниже сохраняют статус на момент соответствующего прогона.

## Фаза G: native Installer / Bot v5 / PG15 lifecycle 2026-10-14

Exact Installer75c49be/Bot5bda3c56/PG15/Redis7/Ubuntu24.04 и published reference
Cabinet прошли все десять native same-version lifecycle стадий, включая
injected rollback, recovery и uninstall. После обрыва SSH terminal log и stage
receipt восстановлены без повторного прогона. Source-integrity810 raw Git blobs
и cleanup/postflight236 baseline files PASS для этого отдельного run.
Это не проверка нового Cabinet artifact и не cross-version proof фазы H.
[Канонический Installer report](../installer/docs/bot-v5-pg15-lifecycle-20261014.md).

## Фаза F: actual sandbox / native roles 2026-10-14

На том же exact artifact/unchanged Bot новый disposable stage подтвердил native
UI Email registration/login, YooKassa test merchant/50 RUB success/real callback,
declined card без зачисления и8 concurrent duplicate service calls без дубля.
Owner выполнил настоящий Telegram web login в Chrome. Четыре preset роли
назначены/сняты через штатную админку;99 actual HTTPS assertions подтвердили
выбранные allow/deny, hierarchy и немедленный отзыв прав у прежнего token.
Panel только read-only; subscription mutations не выполнялись. Все test role
assignments сняты. Owner подтвердил открытие Mini App на Android/iOS; остальные
phone actions и client versions не подтверждены. Затем owned cleanup/postflight
PASS: root/resources/webhook/listeners отсутствуют, private snapshot/DB сохранены,
management222/config неизменны, Caddy baseline восстановлен. Merchant UI сохранён,
test URL после cleanup не обслуживается до следующего запуска.
Full lifecycle, full RBAC/ABAC, first-delivery race и physical Telegram остаются
неполными; **S9 PARTIAL**. [Точные результаты и ограничения](docs/compatibility-evidence-v1801-bot-v5-sandbox-20261014.md).

## Фаза E: owner-authorized targeted VPS runtime 2026-10-13

После отдельного разрешения владельца native Bot v5/main.py и прежний exact
compiled Custom Cabinet запущены в isolated test root на Ubuntu24.04/PG15/Redis7.
Startup/unified lifespan health, HTTPS/proxy/artifact, 14 actual JWT/API checks,
включая native Marketer count-only/list denial, и 60s healthy observation PASS.
Cleanup и независимый postflight PASS; 38 management Installer files сохранены,
test webhook/root/containers/volumes/network удалены, local config неизменён.
Native warnings сохранены; full Installer lifecycle, merchants/concurrency,
полный live/RBAC и physical Telegram остаются NOT_VERIFIED. **S9 PARTIAL**.
Frontend/local schema/contract gates не повторялись; source/Release/production
не менялись. [Точный отчёт](docs/compatibility-evidence-v1801-bot-v5-vps-runtime-20261013.md)
и [JSON](docs/compatibility-evidence-v1801-bot-v5-vps-runtime-20261013.json).

## Фаза D: test VPS read-only preflight 2026-10-13

Documented test access найден в `installer/server.env`. SSH fingerprint/root,
Ubuntu24.04/linux-amd64, ресурсы, отсутствие test stack/containers/volumes,
test domain DNS, Telegram GET identity и Panel health GET с native cookie PASS.
Private config сохранён. Подготовлены exact Bot/Installer source archives и
284-file compiled Cabinet snapshot для дальнейшего scoped runtime gate;
frontend и локальные schema/contracts повторно не запускались.
На VPS выполнялось только чтение; disposable lock в config не равен `yes`,
новая установка не запускалась. **S9 остаётся PARTIAL**, не full runtime/lifecycle
PASS. [Фактический отчёт и ограничения](docs/compatibility-evidence-v1801-bot-v5-vps-preflight-20261013.md).

## Фаза C: локальный partial S9 proof 2026-10-13

После переноса выполнены проверки неизменённого Bot v5.0.0 в отдельных локальных
Linux/amd64 контейнерах. PASS: fresh0131, штатный0127→0128→0129→0130→0131,
повторный запуск migrations, сохранение test balance/subscription sentinels,
logical restore0127 на старом unchanged Bot и actual CacheService Redis7.
Прошли172 выбранных upstream tests (0 failures/errors/skips, три обязательных
PostgreSQL cases) и шесть in-process ASGI route checks с real JWT/auth/DB.
Полный Bot startup/lifespan, target OS Installer lifecycle, реальные merchant,
настроенные роли и physical Telegram остаются NOT_VERIFIED; **S9 PARTIAL**.
Это не подтверждение полной PG15 runtime compatibility или Release PASS.

[Подробный proof и точные identities](docs/compatibility-evidence-v1801-bot-v5-local-20261013.md);
[машиночитаемое evidence](docs/compatibility-evidence-v1801-bot-v5-local-20261013.json).
Все1835 upstream tracked files сохранили hashes, 941 image application files
совпадают с source и test-only image. Frontend source, Installer, site и
production не менялись; test resources удалены, Docker Desktop снова остановлен.
Полный repository Biome по-прежнему содержит три исходные historical JSON format
errors. Ни Classic auto-purchase, ни flag-off/reload cancellation gap не закрыты.

## Фаза B: перенос в рабочую папку 2026-10-13

Проверенный patch из 67 source/test файлов применён в `custom-cabinet/` к HEAD `1169e3cb964caec9a9500ace89bbb53b7e5a89df` на существующей ветке `sync/upstream-v1.79.0`. Owner изменения сохранены, commit и смена ветки не выполнялись. Все 67 результатов побайтно равны isolated candidate. После patch 979 прежних файлов вне его scope были неизменны; далее добавлены только перечисленные документационные записи. Снимки затрагиваемых файлов и прежнего dist сохранены в локальной копии до изменения.

| Проверка после переноса | Факт | Evidence |
| --- | --- | --- |
| Working tree / patch | APPLIED; SHA256 `21ff2aff9f16bd7b119465e0aa61274c1f5f54ddf355d9df138d0a72d6ecbaa3` | .scratch/bedolaga-v1801-transfer-20261013/application.json |
| Source/test inputs | 945 inputs совпадают; installed dependencies совпадают; local env отсутствует | .scratch/bedolaga-v1801-transfer-20261013/source-equivalence.json |
| npm test | PASS: 176 files / 1084 tests | .scratch/bedolaga-v1801-transfer-20261013/unit.log |
| npm run build | PASS: app + Node TypeScript и Vite build, Node24.19.0 | .scratch/bedolaga-v1801-transfer-20261013/build.log |
| Compiled artifact | Все 284 файла равны проверенному artifact; manifest identity `4aa5d6ba362760ebdd4f34f18f3a8f91f1de400b5736d1e74948c2d1579b2130` | .scratch/bedolaga-v1801-transfer-20261013/artifact-equivalence.json |
| Browser gate | Reused PASS: 398 cases, 0 FAIL, 14 configured SKIP; нового запуска после переноса не было | .scratch/bedolaga-v1801-transfer-20261013/browser-gate-final.log; exact source/artifact proof выше |
| Frontend Biome | PASS: 874 files, 0 errors / warnings | .scratch/bedolaga-v1801-transfer-20261013/biome-frontend.json |
| Full repository Biome | FAIL: 3 исходные historical JSON format errors, 40 warnings / 5 infos | .scratch/bedolaga-v1801-transfer-20261013/biome.json |
| Scope / whitespace | См. финальную запись integrity; source diff без whitespace errors | .scratch/bedolaga-v1801-transfer-20261013/final-integrity.json |
| Target Bot runtime / real payments / physical Telegram | NOT_VERIFIED | S9 из PRD |
| Release / production | NOT_RUN | Upstream Bot, Installer, site и production не менялись |

Три format errors находятся в исторических отчётах:

- [cabinet record](docs/cabinet-record-8fb8cbe-20261002.pending.json);
- [compatibility evidence](docs/compatibility-evidence-8fb8cbe-877690a7-20261002.json);
- [evidence adoption](docs/primary-cabinet-evidence-adoption-20261002.json).

Их bytes совпадают со снимком до всей адаптации; эти документы не входили в isolated candidate и не изменены при переносе. Это FAIL полного repository check, а не новый frontend regression. Доказательство: .scratch/bedolaga-v1801-transfer-20261013/baseline-format-errors.json. Не исправлять исторические evidence или объявлять полный check PASS ради этой адаптации.

**DPI//CHECKER полностью исключён.** BSCHEKER/reachability/GEO и Simple/Lite остаются исключёнными. Audience/Cashera не объявляются совместимыми с текущим Bot v4.15.0. Classic auto-purchase и flag-off/reload cancellation discovery остаются OPEN; успешные mocks и build их не закрывают. Backend source/API/business logic/migrations остаются неизменяемой границей.

Основные документы: [PRD](docs/prd/bedolaga-v1.80.1-bot-v5.0.0.md) и [ADR 0003](docs/adr/0003-adapt-upstream-v1.80.1-bot-v5.0.0.md). Следующий агент не должен применять уже применённый patch повторно. Runtime proof и публикация остаются отдельными этапами с соответствующим scope и разрешением.

## Фаза A: исторический отчёт проверенной изолированной копии

Ниже сохранён отчёт **до** переноса в рабочую папку, включая все 58 commits / 125 paths. Упоминания нетронутого owner, неприменённого patch и source/browser gates относятся только к фазе A. Все относительные `.scratch/*` evidence-пути в этом историческом разделе принадлежат `M:/CURSOR2/PC WEB/.scratch/bedolaga-adaptation-20261013`. Текущее состояние рабочей папки задаёт фаза B выше.

### Исторический source report

Дата: 2026-10-13. Состояние: выборочная frontend-адаптация и source/browser gates завершены в изолированной копии. Runtime-пара с Bot v5.0.0 остаётся NOT_VERIFIED; Release и production не выполнялись. Исходники Upstream Bot, Installer, site и production не изменялись; commit/push/публикация не выполнялись.

## Точная база и сохранение владельца

| Компонент | Идентичность |
| --- | --- |
| Receiving Custom Cabinet main | c4ad4774255dc47690a1dde37e52cbac9885ee69 |
| Последний записанный production source | 1d046656fbb01a928fd54a28694e10105d4185f8; от receiving main отличаются только два evidence-файла |
| Owner HEAD и рабочие изменения | 1169e3cb964caec9a9500ace89bbb53b7e5a89df плюс сохранённое dirty tree; 1020 исходных файлов защищены hash snapshot |
| Previous upstream | v1.79.0 / 821c7b71823573a756de00418acb25118ede1c9c |
| Текущее разрешение previous tag | f5ea595f8f732c37f2d5c270f34879ab2e2fba2d; tree 354b7f77d179dd3494c11fcfe27b4099bc5e0f4d равен old tree; причина SHA drift не установлена |
| Target Cabinet | v1.80.1 / a693d30ca6084b9a54b45a72294b99237841ef13; tree 87b2ea9305bbf2938dcf52145afd739f7838d381 |
| Bot contract source, без runtime proof | v5.0.0 / 5bda3c56f0afd9f4813e9c6fa48934948b05ebae |
| Current recorded Bot | v4.15.0 / 877690a7039d1326b2c00eda3e297879b80c0678; schema 0127 |

999/1020 owner files совпадают с published reference. Из 21 различия девять относятся к runtime/tests, ни одно не пересекалось с первыми incoming adaptation edits. Все девять перенесены в изолированную копию. Затем адресно исправлены описанные ниже несоответствия подписи и renewal container, а проверки приведены к действующему UI и стабильному измерению. Эти дополнительные изменения остаются отдельной Custom QA-работой, а не новыми features Bedolaga. Текущие owner AGENTS/CONTEXT/CUSTOMIZATION_MAP/README также сохранены в копии. Остальные локальные исторические evidence/process документы остаются в исходной рабочей папке; они не заменяются candidate-документами.

Owner-specific source/test files:
- tests/e2e/classic-renewal-consistency.spec.ts
- tests/e2e/compact-period-cards.spec.ts
- tests/e2e/profile-account-actions.spec.ts
- tests/e2e/tariff-renewal-navigation.spec.ts
- src/components/subscription/PurchaseCTAButton.tsx
- src/components/subscription/purchaseCtaLegacy.test.tsx
- src/pages/adminPromoGroupsRecalculation.test.tsx
- src/pages/adminUsers.test.tsx
- tests/e2e/cabinet-flows.spec.ts

## Итоговые адаптации

- FR-01: явный язык transport и cache у FAQ/rules/privacy/offer/recurrent, включая Custom recurrent tab и public legal consumers; сохранены sanitization и navigation.
- FR-02/03: error/retry напоминаний, warmed-cache invalidation до возврата, четыре success labels и переведённая единица traffic.
- FR-04: audience API/types, отдельные Telegram/Email conditions, history, permission-gated lookup/preview. Editor разделён по feature responsibilities, применяется Custom ResponsiveOverlay, keyboard/focus и canonical controls. Дополнительно проверяются реальные даты и обе границы range. При partial send Telegram job остаётся ссылкой в alert; следующий submit отправляет только Email. Это Custom обработка ошибки существующего двухканального сценария, а не новая возможность upstream.
- FR-05: Cashera method/icon/CASHERA settings, optional QR внутри существующей готовой оплаты. QR ветка сохраняет pending identity до показа и не запускает automatic external open. Existing return/status/submit-lock остаются.
- FR-06: узкий Cashera hook/panel/action в существующих management/purchase consumers. Flags/trial/errors/selected ID, PENDING polling 8 секунд, cache refresh и cancel confirmation проверены. Новая CTA получает только tariff_id, не наследует ordinary price/period. Server RUB charge не конвертируется в display currency; missing amount отображается прочерком. Terms disclosure — отдельный Custom ключ, не upstream release claim.
- FR-07: DPI полностью исключён. Generic settings categories/definitions и permission display registry фильтруются, raw authorization и сохранение назначенных прав не переписываются. Guards допускают лишь точную regex-декларацию исключения; feature client/route в policy module запрещён.
- FR-08: все 34 TipTap packages уже 3.31.3. package.json/package-lock и resolved toolchain сохранены; Vite8/Vitest5/i18next26/lint-staged17, coupled Twemoji/barrel changes отложены. Unused DPI downloadFile/IconTabs не перенесены.

## Проверки и пределы

G-SOURCE: полный Vitest suite, оба TypeScript config, production Vite build, полный Biome check, affected formatting/lint и diff whitespace. Поддержанный Node 24.19.0 использован явно; default system Node24.11.1 ниже engines baseline. npm ci установил тот же lock; его engine warning не означает смену dependency versions.

G-BROWSER: compiled dist через Vite preview, system Chrome, web 320/375/768/1024/1280. Серверные ответы замоканы; реальные платежи/рассылки не выполнялись. Retained cases покрывают Classic preview/renewal/CTA/return, Info navigation, promo groups, subscription summary и owner-specific regressions. Telegram fixtures — эмуляция, не physical Android/iOS proof.

E2E fixtures соответствуют действующим Purchase labels, Additional options и Dashboard return URL. Geometry assertions измеряют завершённое отображение: ожидают fonts/overlay animation, а взаимный отступ — в одном DOM callback. В QR-проверке сохраняется screenshot самого dialog; это не изменение продуктовой логики. Source instrumentation и новый browser runtime не добавлены.

G-LOCALE: по 79 retained upstream additions + один явно Custom terms key, четыре изменённые подписи, ноль удалений в RU/EN/FA/ZH. JSON patch выполнен на leaf nodes, без замены locale tree. Source guards и four-locale rendering tests включены в unit gate.

G-DEPS: lock byte content unchanged; 34 TipTap packages at 3.31.3. Полное отсутствие CVE и upstream performance claims не доказаны. Никаких major upgrades не выполнено.

Exact compiled artifact manifest identity: `4aa5d6ba362760ebdd4f34f18f3a8f91f1de400b5736d1e74948c2d1579b2130` (284 файлов). Локальная evidence: .scratch/dist-manifest.sha256, unit-owner-final.log, browser-owner-final.log, type-app.log, type-node.log, build.log, biome-candidate.json, biome-baseline.json, dependency-proof.json, locale-proof.json, owner-baseline-comparison.json.

## Неподтверждённое и следующий этап

S9 не выполнялся. Bot v5/runtime compatibility с Installer PG15, schema0127→0131, actual RBAC, merchant/sandbox callbacks, enabled/disabled discovery, live recurring charge/cancel, recovery и physical Telegram остаются NOT_VERIFIED/BLOCKED. Новый Bot SHA требует отдельного lifecycle proof. Нельзя назначать этот source Cabinet-only Release на текущий Bot4.15: audience endpoints отсутствуют. Не менять Bot и не вырезать migration0128.

Classic subscription_purchase dispatcher gap сохраняется OPEN по target source. Cashera flag-off/reload cancellation discovery остаётся OPEN. Успешный frontend gate не закрывает эти ограничения. Последний записанный production Bundle bundle-v2026.10.10.1 остаётся reference; свежая production identity не снималась.

## 58 incoming Cabinet commits: final action и evidence

| Exact source | Изменение | Final action | Evidence |
| --- | --- | --- | --- |
| [b8550d08](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/b8550d089e30f4bf4f709e5315f7bd8ed8c2aff6) | feat(dpichecker): контракт API и адрес раздела | SKIP: DPI//CHECKER исключён владельцем; unused shared download/IconTabs также не нужны | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [24b07e14](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/24b07e1425874f51e602455394d9efda9d203ec9) | feat(dpichecker): раздел в админке, вкладки и подсказка настройки | SKIP: DPI//CHECKER исключён владельцем; unused shared download/IconTabs также не нужны | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [4f45a6a6](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/4f45a6a65af22aa18d8bda9f15fb3ee557756602) | feat(dpichecker): выбор точек как на сайте — пресеты, округа, регионы | SKIP: DPI//CHECKER исключён владельцем; unused shared download/IconTabs также не нужны | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [42027cf0](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/42027cf04718db9874be8ecbf40649898bab5779) | test(dpichecker): без Array.at — цель сборки ниже es2022 | SKIP: DPI//CHECKER исключён владельцем; unused shared download/IconTabs также не нужны | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [e50397f3](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/e50397f38f277c4d6ca251c8f45216f12946edea) | feat(dpichecker): форма проверки в три шага и монитор из неё | SKIP: DPI//CHECKER исключён владельцем; unused shared download/IconTabs также не нужны | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [df9079a3](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/df9079a32cb9c692cf9c30c959d4bf3958b36723) | fix(dpichecker): вкладки на телефоне листаются вбок, частично выбранный округ заметен | SKIP: DPI//CHECKER исключён владельцем; unused shared download/IconTabs также не нужны | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [8f78c9b3](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/8f78c9b3eacedfc3a0cee2da35dae60b0ff547d6) | feat(dpichecker): результат проверки — сводка, регионы словами, отмена, повтор, CSV и карта | SKIP: DPI//CHECKER исключён владельцем; unused shared download/IconTabs также не нужны | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [bfa3e88e](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/bfa3e88e112161a853e30f1edca8bf97787b17b6) | feat(dpichecker): Соседи, Зонд и Черемша | SKIP: DPI//CHECKER исключён владельцем; unused shared download/IconTabs также не нужны | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [ac67e37b](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/ac67e37b1b89098e6e2ef22457091258f9f62d37) | feat(dpichecker): мониторы, история и траты по админам | SKIP: DPI//CHECKER исключён владельцем; unused shared download/IconTabs также не нужны | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [f697829b](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/f697829bb596733694670ad9d6013381fe4716f4) | feat(dpichecker): переходы с карточки ноды и из подписки пользователя | SKIP: DPI//CHECKER исключён владельцем; unused shared download/IconTabs также не нужны | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [7997a76d](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/7997a76df7b062f807c26396670b02d00d0ed773) | i18n(dpichecker): Зонд на китайском и персидском | SKIP: DPI//CHECKER исключён владельцем; unused shared download/IconTabs также не нужны | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [aed7aa23](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/aed7aa2359a4c1f0b59d1759785bf7b6b97721b8) | fix(dpichecker): суммы строкой не роняют отчёт Зонда | SKIP: DPI//CHECKER исключён владельцем; unused shared download/IconTabs также не нужны | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [cd71610a](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/cd71610a5cf6af01d2631a72cc2768f28eb00cf8) | feat(dpichecker): замечания владельца — карта всегда, подсказки регионов, история, из панели как у BSCHEKER | SKIP: DPI//CHECKER исключён владельцем; unused shared download/IconTabs также не нужны | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [ed6f4dec](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/ed6f4decc2e1b21f4927acff504ca638ea4956ad) | feat(dpichecker): карта целиком, CSV в шапке и в Mini App, мониторы, пустой раздел как у BSCHEKER | SKIP: DPI//CHECKER исключён владельцем; unused shared download/IconTabs также не нужны | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [4e5de2ef](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/4e5de2ef5bdf51f545485ed4928baf10431109ff) | fix(dpichecker): темы операторов — легенда карты заливкой, загрузка карты, контраст; шаги без номеров | SKIP: DPI//CHECKER исключён владельцем; unused shared download/IconTabs также не нужны | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [9bcab38b](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/9bcab38ba1d5625afebd57da36006c403878984a) | fix(dpichecker): «Из панели» грузит хосты и ноды сразу, без кнопок «Показать» | SKIP: DPI//CHECKER исключён владельцем; unused shared download/IconTabs также не нужны | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [e9a6f91f](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/e9a6f91f3e6e152629ef797cf51a350f397e21eb) | fix(dpichecker): шапка раздела на телефоне — подзаголовок у иконки, баланс и Соседи отдельной строкой | SKIP: DPI//CHECKER исключён владельцем; unused shared download/IconTabs также не нужны | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [834187a2](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/834187a291bfe8b6acb41257ef196ba7bdd1d877) | fix(dpichecker): шапка на телефоне — баланс и Соседи строкой под подзаголовком, в колонке названия | SKIP: DPI//CHECKER исключён владельцем; unused shared download/IconTabs также не нужны | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [036851b3](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/036851b3a049e60a815c9968efd90aa2ef0820ef) | feat(dpichecker): API сервиса целиком — весь аккаунт, подробности точки, прогоны и настройки мониторов | SKIP: DPI//CHECKER исключён владельцем; unused shared download/IconTabs также не нужны | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [87635df2](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/87635df22efd806fe0ff4864bcee744f2f274aa4) | feat: add rule-based broadcast audience editor | ADAPT: FR-04; transport/RBAC/keyboard/focus и history в Custom admin shell | G-SOURCE: audience API/rules/permission/preset/partial error; G-BROWSER: lookup ID/focus/overlay |
| [d989315e](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/d989315e4a3f62366e9bb37591fc415a95d6ebf2) | fix: trap focus in broadcast recipient preview | ADAPT: FR-04; transport/RBAC/keyboard/focus и history в Custom admin shell | G-SOURCE: audience API/rules/permission/preset/partial error; G-BROWSER: lookup ID/focus/overlay |
| [4b457404](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/4b457404c8255bd39f3ba62ea7e7b477e1863617) | feat: add atomic broadcast filters and user autocomplete | ADAPT: FR-04; transport/RBAC/keyboard/focus и history в Custom admin shell | G-SOURCE: audience API/rules/permission/preset/partial error; G-BROWSER: lookup ID/focus/overlay |
| [3e2310b3](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/3e2310b3f668dac24b3a8d5c67f4561c161289b4) | feat: link broadcast recipients to user details | ADAPT: FR-04; transport/RBAC/keyboard/focus и history в Custom admin shell | G-SOURCE: audience API/rules/permission/preset/partial error; G-BROWSER: lookup ID/focus/overlay |
| [ebd42a7e](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/ebd42a7e6c87e0a2b63da712875ca3fa73f96d1b) | fix(broadcast): preserve upstream email targeting | ADAPT: FR-04; transport/RBAC/keyboard/focus и history в Custom admin shell | G-SOURCE: audience API/rules/permission/preset/partial error; G-BROWSER: lookup ID/focus/overlay |
| [f795ab11](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/f795ab1112becc638ad3482d1494bb9808622f04) | style(broadcast): align comparison and date fields | ADAPT: FR-04; transport/RBAC/keyboard/focus и history в Custom admin shell | G-SOURCE: audience API/rules/permission/preset/partial error; G-BROWSER: lookup ID/focus/overlay |
| [9726d643](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/9726d643344951587535ce4e495a133b55c71894) | fix(info): документы следуют языку интерфейса (#570) | ADAPT: FR-01; язык всех Custom consumers и cache keys | G-SOURCE: info API/public legal cache tests; G-BROWSER: legal language + retained Info navigation |
| [05eecd4f](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/05eecd4faaada7a04fc1d0e03331ca4618cc5c5e) | fix(i18n): не показывать {{count}}/{{value}} в окне покупки устройств и трафика | ADAPT: FR-03; четыре labels и traffic units без замены locales целиком | G-SOURCE: four-locale success labels and traffic units |
| [72a7d73e](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/72a7d73ef58329738a1f8152d0238b0ff12a0be2) | fix(broadcast): поиск и список получателей — только с правом users:read | ADAPT: FR-04; transport/RBAC/keyboard/focus и history в Custom admin shell | G-SOURCE: audience API/rules/permission/preset/partial error; G-BROWSER: lookup ID/focus/overlay |
| [bd923c7e](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/bd923c7e7f0a82f05b10abacd2ebd1b61d97b76b) | Merge pull request #617 from mitetenov/feat/precise-broadcast-audience-upstream | RECORD: metadata/merge; учитывать содержимое leaf commits, не cherry-pick отдельно | Pinned source and concern ledger; no unrelated-history merge/cherry-pick |
| [2f12c7ed](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/2f12c7ed1edb5962e01d15c7eb02998257b2d3ed) | Merge pull request #619 from iLuckyGUY/fix/info-docs-language | RECORD: metadata/merge; учитывать содержимое leaf commits, не cherry-pick отдельно | Pinned source and concern ledger; no unrelated-history merge/cherry-pick |
| [2fd69a39](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/2fd69a399396afcdbe426f3f6cea35b2b96f033d) | Merge remote-tracking branch 'origin/dev' into pr-620 | RECORD: metadata/merge; учитывать содержимое leaf commits, не cherry-pick отдельно | Pinned source and concern ledger; no unrelated-history merge/cherry-pick |
| [8ca6987c](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/8ca6987c38bc474f4c58e7766058b1cf71707f65) | fix(i18n): единица трафика в окне покупки — из перевода, а не латиницей GB | ADAPT: FR-03; четыре labels и traffic units без замены locales целиком | G-SOURCE: four-locale success labels and traffic units |
| [ce25ace1](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/ce25ace13ce54016dfd1093ac4dc9cbfe0fed1bb) | Merge pull request #620 from doxfie/fix/success-modal-placeholders | RECORD: metadata/merge; учитывать содержимое leaf commits, не cherry-pick отдельно | Pinned source and concern ledger; no unrelated-history merge/cherry-pick |
| [e369e8a5](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/e369e8a54517834c532cb2ec5ea37e7781ed1485) | fix(lite): после триала — подключение и тарифы, а не тупик «Продлить»; ссылка подписки в простом виде | SKIP: Lite-only behavior, действующая граница ADR 0002 | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [0e94eb11](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/0e94eb1170dbb48f2aaa7d64ceabd272a8e1899b) | fix(reminders): упавший список не выдаётся за «напоминаний нет»; после сохранения — свежий список | ADAPT: FR-02; error/retry и cache invalidation | G-SOURCE: reminders retry and warmed-cache save regression |
| [e035c277](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/e035c27755ecbdc7fa09dc7884650cca7d269f96) | feat(payments): Cashera в кабинете — подпись, иконка, раздел настроек, тексты | ADAPT: FR-05/06; только официальные method/recurring contracts, server amount и target ID | G-SOURCE: QR/return/recurring API/state/polling; G-BROWSER: payment ID, charge and purchase contract |
| [20dcfaff](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/20dcfafffefc5ec9fa85e61c36f19788208a9709) | feat(topup): свой экран оплаты — QR прямо на карточке пополнения | ADAPT: FR-05; QR в существующем payment-ready/return/status flow | G-SOURCE: QR/return/recurring API/state/polling; G-BROWSER: payment ID, charge and purchase contract |
| [d6d3ab0e](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/d6d3ab0e04140eb15df0bd319ea0d38c995f8474) | feat(cashera): автопродление СБП в кабинете | ADAPT: FR-05/06; только официальные method/recurring contracts, server amount и target ID | G-SOURCE: QR/return/recurring API/state/polling; G-BROWSER: payment ID, charge and purchase contract |
| [0d5a5820](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/0d5a5820dfba11bbbd0049ad5d0446a45dc71484) | feat(cashera): автопродление в кабинете — панель, покупка, типы, тексты | ADAPT: FR-05/06; только официальные method/recurring contracts, server amount и target ID | G-SOURCE: QR/return/recurring API/state/polling; G-BROWSER: payment ID, charge and purchase contract |
| [d6051e85](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/d6051e8502e752b8b8cf478306b487e466346eb9) | Merge pull request #621 from BEDOLAGA-DEV/dev | RECORD: metadata/merge; учитывать содержимое leaf commits, не cherry-pick отдельно | Pinned source and concern ledger; no unrelated-history merge/cherry-pick |
| [0d5c73a2](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/0d5c73a240f27275266713885fd9eb6e43eddd80) | chore(main): release 1.80.0 | RECORD: metadata/merge; учитывать содержимое leaf commits, не cherry-pick отдельно | Pinned source and concern ledger; no unrelated-history merge/cherry-pick |
| [4e0887d8](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/4e0887d89c09f6b865e0d05ba56e1a45d4876568) | Merge pull request #622 from BEDOLAGA-DEV/release-please--branches--main--components--cabinet-frontend | RECORD: metadata/merge; учитывать содержимое leaf commits, не cherry-pick отдельно | Pinned source and concern ledger; no unrelated-history merge/cherry-pick |
| [073dc084](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/073dc0841c0e3d6a6a24ccd282d759893e32036a) | chore(deps): tiptap 3.31.3 (security) и обновления в пределах диапазонов | PRESERVE + DEFER: TipTap 3.31.3 уже locked; несвязанные upgrades/build — optional FR-08 | G-DEPS: unchanged lockfile, 34 TipTap packages at 3.31.3; existing toolchain builds |
| [95b55283](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/95b55283aaacdf9d145cafe85771dac8b8db7cad) | Merge pull request #623 from BEDOLAGA-DEV/chore/deps-2026-09 | RECORD: metadata/merge; учитывать содержимое leaf commits, не cherry-pick отдельно | Pinned source and concern ledger; no unrelated-history merge/cherry-pick |
| [9d8eacea](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/9d8eaceaa23defbfd21b9ca9c3821fefa7abb029) | chore(deps): vitest 5 | DEFER: связанный major tooling scope FR-08; не смешивать с функциональной адаптацией | G-DEPS: unchanged lockfile, 34 TipTap packages at 3.31.3; existing toolchain builds |
| [ad100b50](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/ad100b5029bf1358ba0af9883f3ab3b5965c11cc) | chore(deps): vite 8 и @vitejs/plugin-react 6 | DEFER: связанный major tooling scope FR-08; не смешивать с функциональной адаптацией | G-DEPS: unchanged lockfile, 34 TipTap packages at 3.31.3; existing toolchain builds |
| [852dc4d3](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/852dc4d39be430f563967108243bd680a2e1487e) | chore(deps): i18next 26 и react-i18next 17 | DEFER: i18next 26/react-i18next 17 — major tooling FR-08; изменения success labels относятся к 05eecd4/8ca6987, а не к этому dependency commit | G-DEPS: unchanged lockfile, 34 TipTap packages at 3.31.3; existing toolchain builds |
| [3cece458](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/3cece4587f02b6e3899c4380db5c68110181f5e7) | Merge pull request #624 from BEDOLAGA-DEV/chore/vitest-5 | RECORD: metadata/merge; учитывать содержимое leaf commits, не cherry-pick отдельно | Pinned source and concern ledger; no unrelated-history merge/cherry-pick |
| [e8269113](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/e826911349b5a6701a9ad306e871c7e87b2ad3d3) | Merge pull request #625 from BEDOLAGA-DEV/chore/vite-8 | RECORD: metadata/merge; учитывать содержимое leaf commits, не cherry-pick отдельно | Pinned source and concern ledger; no unrelated-history merge/cherry-pick |
| [94bc0e07](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/94bc0e07a30be10cbe65d677f9b8d46285f3a800) | Merge pull request #626 from BEDOLAGA-DEV/chore/i18next-26 | RECORD: metadata/merge; учитывать содержимое leaf commits, не cherry-pick отдельно | Pinned source and concern ledger; no unrelated-history merge/cherry-pick |
| [8a170424](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/8a170424c457279e9c16a58bc11d0997648e3958) | chore(build): vite.config совместим с нативным загрузчиком конфига | DEFER: связанный major tooling scope FR-08; не смешивать с функциональной адаптацией | G-DEPS: unchanged lockfile, 34 TipTap packages at 3.31.3; existing toolchain builds |
| [898622c2](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/898622c24d5ae20ceffcd2ab2d72aaab2884ce8c) | Merge pull request #627 from BEDOLAGA-DEV/chore/vite-native-config-loader | RECORD: metadata/merge; учитывать содержимое leaf commits, не cherry-pick отдельно | Pinned source and concern ledger; no unrelated-history merge/cherry-pick |
| [5efd0c81](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/5efd0c81f6e5d24567b032d37078d4a8467b9505) | chore(deps): lint-staged 17 | DEFER: связанный major tooling scope FR-08; не смешивать с функциональной адаптацией | G-DEPS: unchanged lockfile, 34 TipTap packages at 3.31.3; existing toolchain builds |
| [66576689](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/665766891b69227d8457b6fd089a1e5653c81e4a) | Merge pull request #628 from BEDOLAGA-DEV/chore/lint-staged-17 | RECORD: metadata/merge; учитывать содержимое leaf commits, не cherry-pick отдельно | Pinned source and concern ledger; no unrelated-history merge/cherry-pick |
| [502a761a](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/502a761abea49f010b27d2ddddd3fcddbf425f01) | Merge pull request #629 from BEDOLAGA-DEV/dev | RECORD: metadata/merge; учитывать содержимое leaf commits, не cherry-pick отдельно | Pinned source and concern ledger; no unrelated-history merge/cherry-pick |
| [589ef566](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/589ef566089be0e9fa595e3e9df00f3fa220d341) | fix(deps): tiptap 3.31.3 — закрыты уязвимости редактора новостей и инфо-страниц | PRESERVE + DEFER: TipTap 3.31.3 уже locked; несвязанные upgrades/build — optional FR-08 | G-DEPS: unchanged lockfile, 34 TipTap packages at 3.31.3; existing toolchain builds |
| [f95bdcc3](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/f95bdcc3664befac77082540db3540a26a9cda50) | chore(main): release 1.80.1 | RECORD: metadata/merge; учитывать содержимое leaf commits, не cherry-pick отдельно | Pinned source and concern ledger; no unrelated-history merge/cherry-pick |
| [a693d30c](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/a693d30ca6084b9a54b45a72294b99237841ef13) | Merge pull request #631 from BEDOLAGA-DEV/release-please--branches--main--components--cabinet-frontend | RECORD: metadata/merge; учитывать содержимое leaf commits, не cherry-pick отдельно | Pinned source and concern ledger; no unrelated-history merge/cherry-pick |

## 125 incoming paths: final concern decisions

H/U/A — reference ownership comparison из PRD. Решение относится к incoming delta; отсутствие прямого target-файла при Adapt означает перенос в названный Custom seam, а не пропуск behavior. Case-specific implementation выше и ADR задают соответствие. Platform/route consumers исключённых функций намеренно не добавлены.

| Target source path | Reference class | Final action | Evidence |
| --- | --- | --- | --- |
| [CHANGELOG.md](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/CHANGELOG.md) | H | RECORD own sync result; не подменять Custom историю upstream changelog | Pinned source and concern ledger; no unrelated-history merge/cherry-pick |
| [package-lock.json](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/package-lock.json) | H | PRESERVE TipTap locked 3.31.3/custom metadata; DEFER major group FR-08 | G-DEPS: unchanged lockfile, 34 TipTap packages at 3.31.3; existing toolchain builds |
| [package.json](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/package.json) | H | PRESERVE TipTap locked 3.31.3/custom metadata; DEFER major group FR-08 | G-DEPS: unchanged lockfile, 34 TipTap packages at 3.31.3; existing toolchain builds |
| [scripts/build-geo-map.mjs](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/scripts/build-geo-map.mjs) | A | SKIP BSCHEKER/GEO: прежнее exclusion | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/App.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/App.tsx) | H | SKIP incoming DPI surface/consumer; существующий Custom код остаётся | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/AppWithNavigator.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/AppWithNavigator.tsx) | H | DEFER Vite/i18n major-related delta FR-08; текущий bootstrap сохраняется | G-DEPS: unchanged lockfile, 34 TipTap packages at 3.31.3; existing toolchain builds |
| [src/api/adminBroadcasts.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/api/adminBroadcasts.ts) | H | ADAPT FR-04; split нового editor при необходимости, retained tests/permissions | G-SOURCE: audience API/rules/permission/preset/partial error; G-BROWSER: lookup ID/focus/overlay |
| [src/api/balance.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/api/balance.ts) | U | ADAPT FR-05 method/QR и meaningful tests; сохранить payment context | G-SOURCE: QR/return/recurring API/state/polling; G-BROWSER: payment ID, charge and purchase contract |
| [src/api/dpichecker.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/api/dpichecker.ts) | A | SKIP DPI: не переносить incoming feature или её tests | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/api/info.test.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/api/info.test.ts) | A | ADAPT FR-01 через Custom consumers; сохранить InfoNavigation/back/replacements | G-SOURCE: info API/public legal cache tests; G-BROWSER: legal language + retained Info navigation |
| [src/api/info.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/api/info.ts) | U | ADAPT FR-01 через Custom consumers; сохранить InfoNavigation/back/replacements | G-SOURCE: info API/public legal cache tests; G-BROWSER: legal language + retained Info navigation |
| [src/api/subscription.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/api/subscription.ts) | U | ADAPT FR-06 types/client/helpers/purchase/state и tests; preserve Custom prices | G-SOURCE: QR/return/recurring API/state/polling; G-BROWSER: payment ID, charge and purchase contract |
| [src/components/PaymentMethodIcon.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/PaymentMethodIcon.tsx) | U | ADAPT FR-05 method/QR и meaningful tests; сохранить payment context | G-SOURCE: QR/return/recurring API/state/polling; G-BROWSER: payment ID, charge and purchase contract |
| [src/components/SuccessNotificationModal.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/SuccessNotificationModal.tsx) | H | ADAPT FR-03 только labels/units; сохранить Custom overlay | G-SOURCE: four-locale success labels and traffic units |
| [src/components/admin/IconTabs.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/IconTabs.tsx) | A | SKIP incoming DPI surface/consumer; существующий Custom код остаётся | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/components/admin/constants.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/constants.ts) | H | ADAPT CASHERA settings FR-05; SKIP DPICHECKER/BSCHEK categories | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/components/admin/dpichecker/AccountFull.test.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/AccountFull.test.tsx) | A | SKIP DPI: не переносить incoming feature или её tests | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/components/admin/dpichecker/AccountRuns.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/AccountRuns.tsx) | A | SKIP DPI: не переносить incoming feature или её tests | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/components/admin/dpichecker/CheckForm.test.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/CheckForm.test.tsx) | A | SKIP DPI: не переносить incoming feature или её tests | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/components/admin/dpichecker/CheckForm.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/CheckForm.tsx) | A | SKIP DPI: не переносить incoming feature или её tests | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/components/admin/dpichecker/CheckResult.test.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/CheckResult.test.tsx) | A | SKIP DPI: не переносить incoming feature или её tests | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/components/admin/dpichecker/CheckResult.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/CheckResult.tsx) | A | SKIP DPI: не переносить incoming feature или её tests | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/components/admin/dpichecker/CheremshaTab.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/CheremshaTab.tsx) | A | SKIP DPI: не переносить incoming feature или её tests | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/components/admin/dpichecker/CsvButton.test.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/CsvButton.test.tsx) | A | SKIP DPI: не переносить incoming feature или её tests | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/components/admin/dpichecker/CsvButton.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/CsvButton.tsx) | A | SKIP DPI: не переносить incoming feature или её tests | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/components/admin/dpichecker/DeliveriesLog.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/DeliveriesLog.tsx) | A | SKIP DPI: не переносить incoming feature или её tests | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/components/admin/dpichecker/DpiRegionMap.test.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/DpiRegionMap.test.tsx) | A | SKIP DPI: не переносить incoming feature или её tests | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/components/admin/dpichecker/DpiRegionMap.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/DpiRegionMap.tsx) | A | SKIP DPI: не переносить incoming feature или её tests | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/components/admin/dpichecker/HistoryTab.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/HistoryTab.tsx) | A | SKIP DPI: не переносить incoming feature или её tests | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/components/admin/dpichecker/MonitorExtras.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/MonitorExtras.tsx) | A | SKIP DPI: не переносить incoming feature или её tests | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/components/admin/dpichecker/MonitorsHistory.test.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/MonitorsHistory.test.tsx) | A | SKIP DPI: не переносить incoming feature или её tests | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/components/admin/dpichecker/MonitorsTab.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/MonitorsTab.tsx) | A | SKIP DPI: не переносить incoming feature или её tests | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/components/admin/dpichecker/PointDetails.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/PointDetails.tsx) | A | SKIP DPI: не переносить incoming feature или её tests | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/components/admin/dpichecker/PopPicker.test.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/PopPicker.test.tsx) | A | SKIP DPI: не переносить incoming feature или её tests | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/components/admin/dpichecker/PopPicker.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/PopPicker.tsx) | A | SKIP DPI: не переносить incoming feature или её tests | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/components/admin/dpichecker/ScanTabs.test.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/ScanTabs.test.tsx) | A | SKIP DPI: не переносить incoming feature или её tests | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/components/admin/dpichecker/ScanTabs.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/ScanTabs.tsx) | A | SKIP DPI: не переносить incoming feature или её tests | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/components/admin/dpichecker/SetupCard.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/SetupCard.tsx) | A | SKIP DPI: не переносить incoming feature или её tests | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/components/admin/dpichecker/TargetsStep.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/TargetsStep.tsx) | A | SKIP DPI: не переносить incoming feature или её tests | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/components/admin/dpichecker/TotalStep.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/TotalStep.tsx) | A | SKIP DPI: не переносить incoming feature или её tests | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/components/admin/dpichecker/checkView.test.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/checkView.test.ts) | A | SKIP DPI: не переносить incoming feature или её tests | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/components/admin/dpichecker/checkView.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/checkView.ts) | A | SKIP DPI: не переносить incoming feature или её tests | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/components/admin/dpichecker/deepLink.test.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/deepLink.test.ts) | A | SKIP DPI: не переносить incoming feature или её tests | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/components/admin/dpichecker/deepLink.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/deepLink.ts) | A | SKIP DPI: не переносить incoming feature или её tests | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/components/admin/dpichecker/formState.test.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/formState.test.ts) | A | SKIP DPI: не переносить incoming feature или её tests | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/components/admin/dpichecker/formState.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/formState.ts) | A | SKIP DPI: не переносить incoming feature или её tests | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/components/admin/dpichecker/historyStyle.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/historyStyle.ts) | A | SKIP DPI: не переносить incoming feature или её tests | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/components/admin/dpichecker/pollInterval.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/pollInterval.ts) | A | SKIP DPI: не переносить incoming feature или её tests | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/components/admin/dpichecker/popSelection.test.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/popSelection.test.ts) | A | SKIP DPI: не переносить incoming feature или её tests | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/components/admin/dpichecker/popSelection.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/popSelection.ts) | A | SKIP DPI: не переносить incoming feature или её tests | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/components/admin/dpichecker/regionIso.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/regionIso.ts) | A | SKIP DPI: не переносить incoming feature или её tests | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/components/admin/dpichecker/regionMap.test.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/regionMap.test.ts) | A | SKIP DPI: не переносить incoming feature или её tests | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/components/admin/dpichecker/regionMap.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/regionMap.ts) | A | SKIP DPI: не переносить incoming feature или её tests | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/components/admin/dpichecker/testUtils.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/testUtils.tsx) | A | SKIP DPI: не переносить incoming feature или её tests | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/components/admin/dpichecker/useDpiStatus.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/dpichecker/useDpiStatus.ts) | A | SKIP DPI: не переносить incoming feature или её tests | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/components/admin/reachability/GeoMap.test.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/reachability/GeoMap.test.tsx) | A | SKIP BSCHEKER/GEO: прежнее exclusion | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/components/admin/reachability/ModeSwitch.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/reachability/ModeSwitch.tsx) | A | SKIP BSCHEKER/GEO: прежнее exclusion | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/components/admin/reachability/SubscriptionSourcePicker.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/reachability/SubscriptionSourcePicker.tsx) | A | SKIP BSCHEKER/GEO: прежнее exclusion | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/components/admin/reachability/assets/NOTICE.md](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/reachability/assets/NOTICE.md) | A | SKIP BSCHEKER/GEO: прежнее exclusion | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/components/admin/reachability/assets/russia-regions.json](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/reachability/assets/russia-regions.json) | A | SKIP BSCHEKER/GEO: прежнее exclusion | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/components/admin/reachability/geoMapData.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/reachability/geoMapData.ts) | A | SKIP BSCHEKER/GEO: прежнее exclusion | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/components/admin/reachability/geoRegions.test.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/reachability/geoRegions.test.ts) | A | SKIP BSCHEKER/GEO: прежнее exclusion | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/components/admin/userDetail/SubscriptionTab.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/userDetail/SubscriptionTab.tsx) | H | SKIP incoming DPI surface/consumer; существующий Custom код остаётся | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/components/admin/userDetail/SupportDetails.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/userDetail/SupportDetails.tsx) | A | SKIP incoming DPI surface/consumer; существующий Custom код остаётся | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/components/admin/userDetail/activityLabels.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/userDetail/activityLabels.ts) | H | ADAPT Cashera recurrent action labels FR-06 | G-SOURCE: QR/return/recurring API/state/polling; G-BROWSER: payment ID, charge and purchase contract |
| [src/components/admin/userDetail/supportDetailsDpiChecker.test.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/admin/userDetail/supportDetailsDpiChecker.test.tsx) | A | SKIP DPI: не переносить incoming feature или её tests | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/components/broadcasts/BroadcastAudienceEditor.test.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/broadcasts/BroadcastAudienceEditor.test.tsx) | A | ADAPT FR-04; split нового editor при необходимости, retained tests/permissions | G-SOURCE: audience API/rules/permission/preset/partial error; G-BROWSER: lookup ID/focus/overlay |
| [src/components/broadcasts/BroadcastAudienceEditor.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/broadcasts/BroadcastAudienceEditor.tsx) | A | ADAPT FR-04; split нового editor при необходимости, retained tests/permissions | G-SOURCE: audience API/rules/permission/preset/partial error; G-BROWSER: lookup ID/focus/overlay |
| [src/components/icons/extended-icons.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/icons/extended-icons.tsx) | H | SKIP incoming DPI surface/consumer; существующий Custom код остаётся | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/components/icons/noHandDrawnIcons.test.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/icons/noHandDrawnIcons.test.ts) | A | SKIP incoming DPI surface/consumer; существующий Custom код остаётся | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/components/paymentMethodIconCashera.test.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/paymentMethodIconCashera.test.tsx) | A | ADAPT FR-05 method/QR и meaningful tests; сохранить payment context | G-SOURCE: QR/return/recurring API/state/polling; G-BROWSER: payment ID, charge and purchase contract |
| [src/components/subscription/manage/RecurringPanels.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/subscription/manage/RecurringPanels.tsx) | A | ADAPT Cashera FR-06 в существующий SubscriptionManagement; не добавлять duplicate panel tree | G-SOURCE: QR/return/recurring API/state/polling; G-BROWSER: payment ID, charge and purchase contract |
| [src/components/subscription/purchase/ClassicPurchaseWizard.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/subscription/purchase/ClassicPurchaseWizard.tsx) | H | DEFER incoming Twemoji import; preserve Custom preview/discount/renewal | G-DEPS: unchanged lockfile, 34 TipTap packages at 3.31.3; existing toolchain builds |
| [src/components/subscription/purchase/TariffPurchaseForm.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/components/subscription/purchase/TariffPurchaseForm.tsx) | H | ADAPT FR-06 types/client/helpers/purchase/state и tests; preserve Custom prices | G-SOURCE: QR/return/recurring API/state/polling; G-BROWSER: payment ID, charge and purchase contract |
| [src/constants/paymentMethods.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/constants/paymentMethods.ts) | U | ADAPT FR-05 method/QR и meaningful tests; сохранить payment context | G-SOURCE: QR/return/recurring API/state/polling; G-BROWSER: payment ID, charge and purchase contract |
| [src/i18n.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/i18n.ts) | H | DEFER Vite/i18n major-related delta FR-08; текущий bootstrap сохраняется | G-DEPS: unchanged lockfile, 34 TipTap packages at 3.31.3; existing toolchain builds |
| [src/lib/twemoji.test.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/lib/twemoji.test.ts) | A | DEFER Vite/i18n major-related delta FR-08; текущий bootstrap сохраняется | G-DEPS: unchanged lockfile, 34 TipTap packages at 3.31.3; existing toolchain builds |
| [src/lib/twemoji.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/lib/twemoji.ts) | A | DEFER Vite/i18n major-related delta FR-08; текущий bootstrap сохраняется | G-DEPS: unchanged lockfile, 34 TipTap packages at 3.31.3; existing toolchain builds |
| [src/locales/en.json](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/locales/en.json) | H | ADAPT retained FR-02..06 keys; SKIP DPI/Lite; сохранить custom keys | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/locales/fa.json](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/locales/fa.json) | H | ADAPT retained FR-02..06 keys; SKIP DPI/Lite; сохранить custom keys | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/locales/ru.json](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/locales/ru.json) | H | ADAPT retained FR-02..06 keys; SKIP DPI/Lite; сохранить custom keys | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/locales/zh.json](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/locales/zh.json) | H | ADAPT retained FR-02..06 keys; SKIP DPI/Lite; сохранить custom keys | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/pages/AdminBroadcastCreate.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/AdminBroadcastCreate.tsx) | H | ADAPT FR-04; split нового editor при необходимости, retained tests/permissions | G-SOURCE: audience API/rules/permission/preset/partial error; G-BROWSER: lookup ID/focus/overlay |
| [src/pages/AdminBroadcastDetail.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/AdminBroadcastDetail.tsx) | H | ADAPT FR-04; split нового editor при необходимости, retained tests/permissions | G-SOURCE: audience API/rules/permission/preset/partial error; G-BROWSER: lookup ID/focus/overlay |
| [src/pages/AdminBroadcasts.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/AdminBroadcasts.tsx) | H | ADAPT FR-04; split нового editor при необходимости, retained tests/permissions | G-SOURCE: audience API/rules/permission/preset/partial error; G-BROWSER: lookup ID/focus/overlay |
| [src/pages/AdminCampaignCreate.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/AdminCampaignCreate.tsx) | H | DEFER Twemoji-only build delta; сохранить текущий screen behavior | G-DEPS: unchanged lockfile, 34 TipTap packages at 3.31.3; existing toolchain builds |
| [src/pages/AdminCampaignEdit.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/AdminCampaignEdit.tsx) | H | DEFER Twemoji-only build delta; сохранить текущий screen behavior | G-DEPS: unchanged lockfile, 34 TipTap packages at 3.31.3; existing toolchain builds |
| [src/pages/AdminDpiChecker.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/AdminDpiChecker.tsx) | A | SKIP DPI: не переносить incoming feature или её tests | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/pages/AdminPanel.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/AdminPanel.tsx) | H | SKIP incoming DPI surface/consumer; существующий Custom код остаётся | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/pages/AdminPromoOfferTemplateEdit.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/AdminPromoOfferTemplateEdit.tsx) | H | DEFER Twemoji-only build delta; сохранить текущий screen behavior | G-DEPS: unchanged lockfile, 34 TipTap packages at 3.31.3; existing toolchain builds |
| [src/pages/AdminReminderEdit.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/AdminReminderEdit.tsx) | H | ADAPT FR-02 и regression tests | G-SOURCE: reminders retry and warmed-cache save regression |
| [src/pages/AdminReminders.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/AdminReminders.tsx) | H | ADAPT FR-02 и regression tests | G-SOURCE: reminders retry and warmed-cache save regression |
| [src/pages/AdminRemnawave.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/AdminRemnawave.tsx) | H | SKIP DPI shortcuts; DEFER Twemoji если есть; preserve existing admin behavior/tests | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/pages/AdminRemnawaveSquadDetail.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/AdminRemnawaveSquadDetail.tsx) | H | DEFER Twemoji-only build delta; сохранить текущий screen behavior | G-DEPS: unchanged lockfile, 34 TipTap packages at 3.31.3; existing toolchain builds |
| [src/pages/AdminServerEdit.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/AdminServerEdit.tsx) | H | DEFER Twemoji-only build delta; сохранить текущий screen behavior | G-DEPS: unchanged lockfile, 34 TipTap packages at 3.31.3; existing toolchain builds |
| [src/pages/AdminServers.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/AdminServers.tsx) | H | DEFER Twemoji-only build delta; сохранить текущий screen behavior | G-DEPS: unchanged lockfile, 34 TipTap packages at 3.31.3; existing toolchain builds |
| [src/pages/AdminTariffCreate.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/AdminTariffCreate.tsx) | H | DEFER Twemoji-only build delta; сохранить текущий screen behavior | G-DEPS: unchanged lockfile, 34 TipTap packages at 3.31.3; existing toolchain builds |
| [src/pages/AdminUserDetail.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/AdminUserDetail.tsx) | H | SKIP DPI shortcuts; DEFER Twemoji если есть; preserve existing admin behavior/tests | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/pages/DashboardLite.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/DashboardLite.tsx) | A | SKIP Lite: прежнее exclusion | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/pages/Info.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/Info.tsx) | H | ADAPT FR-01 через Custom consumers; сохранить InfoNavigation/back/replacements | G-SOURCE: info API/public legal cache tests; G-BROWSER: legal language + retained Info navigation |
| [src/pages/PublicLegal.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/PublicLegal.tsx) | H | ADAPT FR-01 через Custom consumers; сохранить InfoNavigation/back/replacements | G-SOURCE: info API/public legal cache tests; G-BROWSER: legal language + retained Info navigation |
| [src/pages/Subscription.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/Subscription.tsx) | H | DEFER upstream Twemoji delta; FR-06 добавить в Custom management seam отдельно | G-DEPS: unchanged lockfile, 34 TipTap packages at 3.31.3; existing toolchain builds |
| [src/pages/SubscriptionLite.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/SubscriptionLite.tsx) | A | SKIP Lite: прежнее exclusion | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/pages/SubscriptionPurchase.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/SubscriptionPurchase.tsx) | H | ADAPT FR-06 types/client/helpers/purchase/state и tests; preserve Custom prices | G-SOURCE: QR/return/recurring API/state/polling; G-BROWSER: payment ID, charge and purchase contract |
| [src/pages/TopUpAmount.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/TopUpAmount.tsx) | H | ADAPT FR-05 method/QR и meaningful tests; сохранить payment context | G-SOURCE: QR/return/recurring API/state/polling; G-BROWSER: payment ID, charge and purchase contract |
| [src/pages/adminBroadcastCreate.test.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/adminBroadcastCreate.test.tsx) | A | ADAPT FR-04; split нового editor при необходимости, retained tests/permissions | G-SOURCE: audience API/rules/permission/preset/partial error; G-BROWSER: lookup ID/focus/overlay |
| [src/pages/adminDpiChecker.test.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/adminDpiChecker.test.tsx) | A | SKIP DPI: не переносить incoming feature или её tests | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/pages/adminReminderEdit.test.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/adminReminderEdit.test.tsx) | H | ADAPT FR-02 и regression tests | G-SOURCE: reminders retry and warmed-cache save regression |
| [src/pages/adminReminders.test.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/adminReminders.test.tsx) | H | ADAPT FR-02 и regression tests | G-SOURCE: reminders retry and warmed-cache save regression |
| [src/pages/adminUserDetail.test.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/adminUserDetail.test.tsx) | A | SKIP DPI shortcuts; DEFER Twemoji если есть; preserve existing admin behavior/tests | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/pages/dashboardLite.test.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/dashboardLite.test.tsx) | A | SKIP Lite: прежнее exclusion | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/pages/recurringFeatureProbing.test.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/recurringFeatureProbing.test.tsx) | H | ADAPT FR-06 types/client/helpers/purchase/state и tests; preserve Custom prices | G-SOURCE: QR/return/recurring API/state/polling; G-BROWSER: payment ID, charge and purchase contract |
| [src/pages/subscriptionLite.test.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/subscriptionLite.test.tsx) | A | SKIP Lite: прежнее exclusion | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/pages/topUpAmountQr.test.tsx](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/pages/topUpAmountQr.test.tsx) | A | ADAPT FR-05 method/QR и meaningful tests; сохранить payment context | G-SOURCE: QR/return/recurring API/state/polling; G-BROWSER: payment ID, charge and purchase contract |
| [src/platform/adapters/TelegramAdapter.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/platform/adapters/TelegramAdapter.ts) | H | SKIP unused DPI downloadFile delta; сохранить текущие adapters | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/platform/adapters/WebAdapter.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/platform/adapters/WebAdapter.ts) | H | SKIP unused DPI downloadFile delta; сохранить текущие adapters | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/platform/types.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/platform/types.ts) | H | SKIP unused DPI downloadFile delta; сохранить текущие adapters | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/types/index.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/types/index.ts) | H | ADAPT FR-06 types/client/helpers/purchase/state и tests; preserve Custom prices | G-SOURCE: QR/return/recurring API/state/polling; G-BROWSER: payment ID, charge and purchase contract |
| [src/utils/casheraRecurring.test.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/utils/casheraRecurring.test.ts) | A | ADAPT FR-06 types/client/helpers/purchase/state и tests; preserve Custom prices | G-SOURCE: QR/return/recurring API/state/polling; G-BROWSER: payment ID, charge and purchase contract |
| [src/utils/casheraRecurring.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/utils/casheraRecurring.ts) | A | ADAPT FR-06 types/client/helpers/purchase/state и tests; preserve Custom prices | G-SOURCE: QR/return/recurring API/state/polling; G-BROWSER: payment ID, charge and purchase contract |
| [src/utils/liteStatus.test.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/utils/liteStatus.test.ts) | A | SKIP Lite: прежнее exclusion | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/utils/liteStatus.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/utils/liteStatus.ts) | A | SKIP Lite: прежнее exclusion | G-EXCLUDE: actual source guards; feature routes/clients not imported |
| [src/utils/recurringFeature.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/src/utils/recurringFeature.ts) | H | ADAPT FR-06 types/client/helpers/purchase/state и tests; preserve Custom prices | G-SOURCE: QR/return/recurring API/state/polling; G-BROWSER: payment ID, charge and purchase contract |
| [tsconfig.node.json](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/tsconfig.node.json) | U | DEFER Vite/i18n major-related delta FR-08; текущий bootstrap сохраняется | G-DEPS: unchanged lockfile, 34 TipTap packages at 3.31.3; existing toolchain builds |
| [vite.config.ts](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/blob/a693d30ca6084b9a54b45a72294b99237841ef13/vite.config.ts) | H | DEFER Vite/i18n major-related delta FR-08; текущий bootstrap сохраняется | G-DEPS: unchanged lockfile, 34 TipTap packages at 3.31.3; existing toolchain builds |

## Фактический итог gates и передача

| Проверка | Result | Evidence |
| --- | --- | --- |
| Full unit suite | PASS: 176 files / 1084 tests | .scratch/unit-source-complete.log |
| App + Node TypeScript | PASS, exit0 | .scratch/type-app-complete.log / type-node-complete.log |
| Production build | PASS на Node24.19.0 | .scratch/build-width-final.log; dist manifest выше |
| Final affected browser matrix | PASS: 412 total = 398 PASS + 14 configured SKIP, 0 FAIL | .scratch/browser-gate-final.log; .scratch/affected-e2e-files.txt |
| New Bedolaga behavior | Все 30 compiled-artifact cases прошли внутри финального gate | cashera-purchase / upstream-v180-adaptation specs |
| Full Biome check | PASS: 0 errors; 40 warnings / 5 infos из исходной базы | .scratch/biome-source-complete.json; .scratch/biome-comparison.json |
| Changed E2E formatting | PASS | Biome check classic-renewal-consistency / cabinet-flows |
| Diff whitespace | PASS | git diff --check |
| Patch applicability | PASS: git apply --check на исходном dirty Custom Cabinet; без применения | .scratch/patch-apply-check.log |
| Owner integrity | Все 1020 исходных hashes и HEAD сохранены | ../bedolaga-research-20261013/documentation-validation.json |
| Bot v5 runtime / real payments / real RBAC / physical Telegram | NOT_VERIFIED | S9 и ограничения выше |
| Release / production | NOT_RUN | commit, tag, Bundle и deployment не выполнялись |

### Исправленные несоответствия исходной Custom QA-базы

Первый широкий прогон имел 51 FAIL. Исходные группы сбоев воспроизведены в ../bedolaga-owner-baseline-20261013 без новых Bedolaga изменений. Исторические logs сохранены, но не подменяют финальный gate.

1. RenewalSummary возвращён внутрь существующего Card, как требует CUSTOMIZATION_MAP и owner assertion ненулевой рамки. Для экрана 320 px применены существующие size="sm" и sm:p-4: padding 12 px на узком экране / 16 px на широком. Измерение после fonts.ready показало реальный перенос русского «360 дней» при прежних 16 px; новая ширина устраняет его. Нет fixed spacer, новой глобальной CSS-системы или изменений цены.
2. PurchaseCTAButton использует activeHint для активной подписки и renewHint для действительно истёкшей поддержанной подписки. Иначе активная подписка получала текст «Подписка истекла», который также увеличивал высоту management. Legacy migration, Classic hint, маршруты и POST-контракты сохранены. Regression unit tests сначала падали, затем прошли; покрыты active/expired single/multi и legacy.
3. Cabinet flow получил существующий app-config fixture. Проверки CTA принимают 991 / 991.00 / 991,00 и 1091 / 1091.00 / 1091,00, сохраняя точные суммы, скидку и breakdown. Selected light period проверяется по aria-pressed и действующей рамке 2 px. Исходный format error исправлен только в этом test-файле.
4. Profile geometry ожидает стабильное положение с прежним допуском <1 px; period geometry ожидает загрузку fonts. Renewal gap измеряется для обоих элементов в одном DOM callback и по-прежнему обязан быть 0–20 px. Это устраняет сравнение координат из разных scroll/layout frames; реальное пересечение не пройдёт проверку.
5. Connection flow ожидал только обновление заголовка, пока содержимое ещё проходило AnimatePresence transition. Без изменений его product source пять последовательных повторов прошли на том же dist. Тест теперь дополнительно ждёт opacity=1 у нового содержимого перед Back. Обычный сценарий Back/reload/legacy прошёл в общем gate; отдельное стресс-доказательство быстрых переходов во время незавершённой анимации не выполнялось.

14 SKIP — действующие ограничения отдельных cases по viewport, а не выполненные сценарии. Для продления дополнительно прошли 16 повторов узкого экрана RU/EN/FA и тем; Connection — 5 повторов. Полный финальный gate выполнен после всех source изменений, на одном compiled dist, без параллельного unit-прогона. S0–S8 выполнены на уровне frontend; S9 остаётся NOT_VERIFIED; S10 содержит честную source/browser запись, без runtime/Release PASS.

### Reviewable artifacts

- .scratch/upstream-adaptation.patch — source/tests адаптации и точечные Custom QA-исправления. Для скопированных owner-файлов diff построен относительно их текущего исходного содержимого, поэтому существующие owner изменения не дублируются и не теряются. Применимость проверена, применение не выполнялось. Если исходные файлы изменятся, повторить apply --check.
- .scratch/tested-source.patch — полный snapshot относительно receiving c4ad4774255dc47690a1dde37e52cbac9885ee69, включая owner differences и документы; предназначен для воспроизведения candidate в отдельной копии.
- .scratch/patch-manifest.json — точные SHA256 обоих patches и перечень owner-relative файлов.
- .scratch/dist-manifest.sha256 / artifact-identity.json — точный compiled artifact, который проверялся браузером.

PRD и ADR остаются источником scope/порядка/контрактов, а этот отчёт фиксирует уже выполненную работу. Следующий coding-agent должен начать с сверки candidate и owner snapshot, не повторять S0–S8 вслепую и не назначать frontend gate доказательством Bot v5 runtime. Backend source/API/business logic/migrations остаются неизменяемой границей. Нужен отдельный допустимый runtime proof; Release и production требуют соответствующей самостоятельной авторизации.
